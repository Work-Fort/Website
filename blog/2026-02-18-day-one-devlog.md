---
title: "Day One: 24 Hours of Building WorkFort"
slug: day-one
authors: [workfort-marketer]
tags: [devlog, series-nexus, rust, firecracker]
---

# Day One: 24 Hours of Building WorkFort

WorkFort is an Arch Linux distribution designed as a workplace for AI agents, where each agent gets its own Firecracker microVM. We are 24 hours into the build. Here is what exists so far.

<!--truncate-->

## What We Built

Five of twelve alpha milestones are complete. The focus has been on the data layer and workspace management — everything an orchestrator needs before it starts booting actual VMs.

**Nexus daemon and CLI.** The core of WorkFort is a Rust workspace called Nexus, split into three crates: `nexusd` (the daemon), `nexusctl` (the CLI), and `nexus-lib` (shared types and logic). The daemon runs as a systemd user service with signal handling, structured logging, and an HTTP health endpoint. The CLI uses noun-verb grammar — `nexusctl status` queries the daemon, and when the daemon is down, you get an actionable error message instead of a connection refused stacktrace. `systemctl --user start nexus` works today.

**SQLite state store.** VM state lives in SQLite via rusqlite with schema versioning. The database auto-creates on first daemon start. Migration strategy during pre-alpha is deliberately simple: delete and recreate. No point building migration tooling for schemas that change daily.

**VM records CRUD.** A REST API handles VM lifecycle operations — `POST /v1/vms`, `GET /v1/vms/:id`, `DELETE /v1/vms/:id`. Each VM tracks a state machine (`created`, `running`, `stopped`, `crashed`) and gets an auto-assigned vsock CID. No Firecracker processes are launched yet. This is the data layer that the VM boot step will build on.

**btrfs workspace management.** This is the piece we are most satisfied with. WorkFort uses btrfs subvolumes for VM workspaces instead of OverlayFS. You import a master image once, and every new VM workspace is a copy-on-write snapshot — instant creation, near-zero disk cost. The key discovery: unprivileged subvolume deletion works via the standard VFS `rmdir` syscall (kernel 4.18+), the same approach Docker and Podman use in `containers/storage`. No `CAP_SYS_ADMIN` required for any btrfs operation in our workflow.

## Key Technical Decisions

**btrfs over OverlayFS.** OverlayFS requires managing layers, handles poorly at scale, and has a fundamentally different model (union mounts vs. block-level CoW). btrfs snapshots are instant, require no layer bookkeeping, and scale to thousands of VMs without degradation.

**ext4 inside btrfs.** Firecracker needs block devices as drive backing. The solution: ext4 filesystem images stored inside btrfs subvolumes. The host gets CoW snapshots at the btrfs layer; the guest sees a normal ext4 filesystem. `mke2fs -d` builds these images without needing root.

**Data-driven download pipelines.** Rather than hardcoding download logic for kernels, rootfs tarballs, and Firecracker binaries, the asset system uses a provider trait pattern. Each download source is a pipeline with stages stored as JSON in the database. This is the current work-in-progress (step 6 of 12).

## The Supporting Cast

**Anvil** is a Go service (formerly called cracker-barrel) that compiles Firecracker-compatible Linux kernels and publishes them to GitHub releases with PGP-signed checksums. It exists so that WorkFort users do not need to compile their own kernels.

**Codex** is an mdBook documentation site that serves as the project's living knowledge base — architecture docs, design plans, and a progress dashboard with Mermaid diagrams tracking what is done and what remains.

## Process Notes

One pattern that emerged early: technical feasibility assessments as "code review for plans." Before implementing a step, we write a temporary assessment document that reviews the plan against the requirements and known constraints. This caught a missing roadmap deliverable before any code was written. Cheaper than finding it during implementation.

## What Is Next

Steps 7 through 12 cover the path from "data layer" to "running VMs with agents inside":

- **Image building pipeline** — templates produce builds produce master images
- **Firecracker VM boot** — process supervision, boot timing, drive attachment
- **guest-agent** — a small binary inside the VM that communicates with the host over vsock
- **MCP tools** — JSON-RPC 2.0 tool calls routed into VMs
- **Networking** — tap devices, bridge, NAT
- **PTY and terminal attach** — interactive shell access to running VMs

The next update will cover the asset download system and, if things go well, the first Firecracker boot.

---

*WorkFort is open source and built in public. The [Nexus repository](https://github.com/Work-Fort/Nexus) contains the daemon, CLI, and documentation.*
