---
title: "Day Two: From Data Layer to VM Boot"
slug: day-two
authors: [workfort-marketer]
tags: [devlog, series-nexus, rust, firecracker, golang]
---

# Day Two: From Data Layer to VM Boot

WorkFort gives AI agents their own Firecracker microVMs — isolated workspaces with full system access, managed by a single daemon. We are starting on Arch Linux, where it is a `pacman -S` away on btrfs systems like Omarchy, but the daemon is a static Rust binary with no hard distro dependencies and the storage layer is behind a trait that can support backends beyond btrfs. No containers, no root, no cluster. The alpha goal is one agent producing code in a VM — after that, WorkFort dogfoods itself, and the tools most needed to develop WorkFort further get built next.

Yesterday we had a data layer and workspace management. Today we have a pipeline that downloads verified assets, builds rootfs images, and boots Firecracker VMs. Nine of thirteen alpha steps are complete.

<!--truncate-->

## Asset Download System (Steps 6-7)

The biggest piece of new infrastructure is the asset pipeline. WorkFort needs three external artifacts: a Linux kernel (from Anvil), an Alpine rootfs tarball, and a Firecracker binary. Each has different download sources, verification requirements, and archive formats. Rather than writing three bespoke downloaders, we built a data-driven pipeline system.

**Pipeline executor.** Downloads are defined as JSON pipeline stages stored in SQLite. The executor streams HTTP bytes while computing SHA256 per chunk — no download-then-hash. Anvil kernels use two checksum stages (compressed and decompressed), with the decompressed hash stored for later re-verification. The same executor handles xz decompression, gzip decompression, and PGP signature verification.

**Provider traits.** Each asset source implements a provider trait that constructs download URLs and discovers available versions. `KernelProvider` knows how to query Anvil's GitHub releases. `RootfsProvider` knows the Alpine CDN URL pattern. Firecracker skips the provider trait entirely — its repo name is read directly from the providers table. No abstraction for a single use case.

**Three asset services.** `KernelService`, `RootfsService`, and `FirecrackerService` each wrap the pipeline executor with domain-specific logic. All three expose REST endpoints and CLI commands:

```
nexusctl kernel download 6.18.9      # PGP-verified kernel from Anvil
nexusctl rootfs download alpine 3.21  # Alpine minirootfs
nexusctl firecracker download 1.12.0  # Firecracker binary
nexusctl kernel verify 6.18.9         # Re-hash on disk, compare to DB
```

## Image Building (Step 8)

With assets downloaded, the next problem is assembling a bootable rootfs. The image building system uses a template-and-build model.

**Templates** define a blueprint: a source type (rootfs tarball for alpha), a source identifier, and file overlays as a JSON object mapping filesystem paths to file contents. **Builds** are immutable snapshots — the template's fields are copied into the build record at build time, so editing a template and rebuilding produces a distinct image.

The build process: download the rootfs tarball, extract to a temp directory, write overlay files (Alpine serial console config, fstab, networking, `/etc/nexus/image.yaml`), then package the directory as an ext4 image via `mke2fs -d`. No root required. The ext4 image lands inside a btrfs subvolume and gets registered as a master image that can be snapshotted into workspaces.

```
nexusctl template create --name base-agent --source-type rootfs \
  --source https://dl-cdn.alpinelinux.org/.../alpine-minirootfs-3.21.3-x86_64.tar.gz
nexusctl build trigger base-agent    # async — returns build ID
nexusctl build list                  # shows status: building → success/failed
```

## Firecracker VM Boot (Step 9)

Step 9 ties everything together: kernel + rootfs image + Firecracker binary + btrfs workspace = a running VM.

**VM lifecycle.** `nexusctl vm start my-vm` generates a Firecracker config (kernel path, rootfs drive, vsock device with auto-assigned CID), spawns the Firecracker process, and transitions the VM to `running`. `nexusctl vm stop my-vm` sends a graceful shutdown. The daemon tracks PIDs, socket paths, and log file locations.

**Crash detection.** A background process monitor watches running VMs. If Firecracker exits unexpectedly, the VM state transitions to `crashed`. On daemon startup, any VMs still marked `running` from a previous session are recovered to `crashed` — no stale state survives a daemon restart.

**Console output.** `nexusctl vm logs my-vm` streams the Firecracker console log. `nexusctl vm inspect my-vm` shows PID, API socket path, log path, and VM metadata.

## StateStore Refactor (Step 5.1)

A necessary detour before steps 6-9 could land. The monolithic `StateStore` trait was growing unmanageable — steps 6-8 would have added ~20 more methods to a single trait. We split it into domain-scoped sub-traits: `VmStore`, `ImageStore`, `WorkspaceStore`. `StateStore` became a convenience super-trait. `SqliteStore` implements all three. Existing code using `dyn StateStore` required no changes. This made the step 6-9 implementations cleaner and mocking tractable for integration tests.

## Anvil Updates

Anvil gained a `version-check` CLI command that queries kernel.org to verify a kernel version is available and buildable before starting a multi-hour compile. CI was updated to use a cached Anvil binary in the version-check job, replacing fragile shell-based checksum verification. The ARM64 kernel 6.19 build regression (a `unistd_64.h` generation issue) was identified and documented — kernel 6.1.164 builds cleanly on ARM64, so ARM64 support is marked experimental for now.

## QA and Process

The first real QA cycle ran against Step 9. It caught three bugs: a tarball extraction filter that picked the debug binary instead of the release binary, missing workspace attach/detach API endpoints, and `vm inspect` not traversing the image chain to show OS info. All three are filed in the issue backlog and planned for Step 9.1.

The QA workflow, feasibility assessment conventions, and issue backlog system were all formalized today. Plans now go through a mandatory assessment before implementation. QA testers file their own bugs before shutdown. These are documented conventions — structural enforcement comes later, when WorkFort can enforce them as constraints rather than guidelines.

## What Is Next

Step 9.1 fixes the three QA bugs. After that: the guest-agent (vsock control channel inside the VM), MCP tool routing, networking, and terminal attach. Four remaining steps to a running VM with an agent inside.

Beyond the alpha: agent connectors that speak to any LLM provider (Anthropic, OpenAI, Google) over MCP, service VMs for git hosting and project tracking, and the self-improvement loop — WorkFort building WorkFort.

---

*WorkFort is open source and built in public. The [Nexus repository](https://github.com/Work-Fort/Nexus) contains the daemon, CLI, and documentation.*
