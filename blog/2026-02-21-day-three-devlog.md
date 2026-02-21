---
title: "Day Three: IDs, Drives, and the UX Layer"
slug: day-three
authors: [workfort-marketer]
tags: [devlog, series-nexus, rust, ux]
---

# Day Three: IDs, Drives, and the UX Layer

WorkFort gives AI agents their own Firecracker microVMs with isolated workspaces. After two days of building the VM boot stack, day three focused on making the system usable: human-readable IDs, better naming, and task-oriented commands that hide complexity.

<!--truncate-->

## The ID Refactor

Every resource in Nexus (VMs, drives, images, templates) needs an identifier. We started with UUIDs — standard, boring, safe. The problem: UUIDs make terrible URLs. A VM inspect page at `/vms/550e8400-e29b-41d4-a716-446655440000` is 36 characters of noise.

The solution: **base32-encoded integer IDs**. Random 63-bit integers stored in SQLite, encoded as lowercase base32 for external display. IDs look like `4nfv4y7kxh2lq` — 13 characters instead of 36. Shorter URLs, easier to share, no hyphens to trip over. The alphabet (a-z, 2-7) avoids ambiguous characters like 0/O/1/I. Integers internally for performance, base32 externally for compactness.

This touched every layer of the stack: database schema, domain types, HTTP client, CLI output. Nine commits to thread it through cleanly. The payoff is short URLs and less visual clutter.

## Workspace → Drive Rename

"Workspace" was always the wrong name. These are writable btrfs snapshots of base images — they're drives. The term "workspace" implies something broader (maybe a collection of VMs?), and it caused confusion in every conversation.

Step 10.2 renamed everything: `WorkspaceStore` → `DriveStore`, `WorkspaceService` → `DriveService`, `/v1/workspaces` API endpoints → `/v1/drives`, and the CLI command `nexusctl ws` → `nexusctl dr`. Fourteen commits, most of them mechanical find-and-replace, one schema migration (v9). The `ws` alias still works for backwards compatibility, but the canonical name is now `dr`.

Why `dr` and not `drive`? Because typing `nexusctl drive create` is longer than it needs to be. Short commands win for frequently-used operations. The pattern: full noun in docs and help text, short alias for CLI ergonomics.

## Guest Agent and VM Connectivity

VMs boot, but Nexus doesn't know when they're ready. Step 10.1 added a **guest-agent** — a tiny Rust binary that runs inside Alpine VMs, connects back to Nexus over vsock, and reports image metadata. When the agent connects, the VM state transitions from `running` → `ready`.

The guest-agent is statically linked with musl, embedded into rootfs images at build time using Rust's `include_bytes!` macro. No shell scripts, no manual asset management. Builds are fully hermetic — you can trigger a build, and the output includes the agent binary, systemd unit, and image metadata file, all assembled programmatically.

The vsock connection is bidirectional: Nexus can detect if a VM becomes unreachable (crashes without a clean shutdown), and the guest-agent can eventually serve as the control plane for MCP tool routing. Right now it just does the handshake and keeps the connection alive.

## VM State History

`nexusctl vm inspect` shows current state. What about past states? Step 10.4 added a **state history table** that records every transition: `created` → `running` at timestamp X, `running` → `stopped` at timestamp Y. This unlocks debugging ("when did this VM crash?") and audit trails.

The new command: `nexusctl vm history my-vm` renders a table of transitions. Simple, but critical for understanding what's happening to VMs over time.

## The QA Cycle

Step 10.3 was the first time we ran structured QA after implementing a feature. The QA bot caught three bugs:

1. **Drive attach defaults to false.** CLI help said `--root` defaults to true, but the implementation defaulted to false. VMs wouldn't start without an explicit `--root` flag.
2. **State transitions not recorded.** The history table existed, but `start_vm` bypassed it, leaving gaps in the audit log.
3. **Clap boolean flag API misunderstanding.** First fix used `default_value = "true"` on a boolean flag, which doesn't work in clap. Boolean flags need `num_args = 0..=1` with `default_missing_value`.

All three bugs were filed, fixed, and retested within the same step. The third bug required two attempts — code review caught the first fix before it shipped. This is working as designed: catch bugs before production, iterate quickly, ship when tests pass.

The retrospective documented lessons: code reviewers should manually test critical functionality (don't just inspect code), assessment phases should verify framework APIs, and QA environments need bootable VM images for full integration testing.

## CLI UX Research

After building the primitives, we evaluated nexusctl's user experience. The question: **how would a new user actually use this?** The answer was uncomfortable. Getting from "I want a VM" to "VM is running" takes seven commands and requires understanding the full primitive stack (rootfs → template → build → image → drive → vm).

```bash
nexusctl rootfs download alpine 3.21
nexusctl template create --name base --source alpine-3.21
nexusctl build trigger base
# wait for build
nexusctl dr create --name my-drive --base base
nexusctl vm create my-vm
nexusctl dr attach my-drive --vm my-vm --root
nexusctl vm start my-vm
```

The cognitive load is high. Information gets repeated (alpine, 3.21, base). The user types the same names multiple times. And the goal — "I want a VM running Alpine" — gets buried under infrastructure commands.

The insight: nexusctl is a **low-level primitive layer**, like the docker CLI. Higher-level orchestration tools will come later. But primitives alone optimize for the wrong use case. We're building for AI agents, not enterprise infrastructure catalogs. Time-to-value matters more than theoretical reusability.

The solution (designed, not yet implemented): **universal `from-*` shortcuts** across resources. Start from what you want:

```bash
# Want a VM? Start from VM
nexusctl vm from-rootfs alpine 3.21

# Want a reusable drive? Start from drive
nexusctl dr from-rootfs alpine 3.21

# Want a base image? Start from image
nexusctl image from-rootfs alpine 3.21
```

Same pattern, different automation depth. Each resource's `from-*` command handles the appropriate primitives. The seven-command workflow becomes one. Power users still have the primitives for fine-grained control. New users get a fast path.

This is documented in the CLI architecture, filed as an enhancement issue, awaiting prioritization.

## Anvil Improvements

Anvil (the kernel build service) got smarter about CI. Previously, the GitHub Actions workflow that verified kernel versions were buildable used fragile shell checksums to detect whether Anvil's CLI had changed. Now it uses a cached binary from the release workflow — cleaner, faster, no shell parsing.

Anvil also gained a `version-check` command: query kernel.org to verify a version exists and is buildable before starting a multi-hour compile. Useful for CI, useful for debugging.

## What's Next

Step 10.5 is underway: display IDs in list commands. Right now `nexusctl vm list` and `nexusctl dr list` show names but not IDs. After base32 encoding, showing IDs is actually useful (they're short). This unblocks name-or-ID resolution everywhere — users can pass either, and the CLI figures it out.

Beyond step 10: networking (tap devices for outbound connections), MCP routing over vsock, and the self-hosting milestone — WorkFort building WorkFort.

---

*WorkFort is open source. The [Nexus repository](https://github.com/Work-Fort/Nexus) contains the daemon and CLI. Documentation lives in the [Codex](https://codex.workfort.dev).*
