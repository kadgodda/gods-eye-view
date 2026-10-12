# P0 execution isolation policy (quarantine remains active)

This repository is untrusted data. No repo code, installers, tests, servers,
MCP tools, package manager scripts, or builds may be executed on a developer's
primary host. This document is a policy and verification checklist, not
permission to run commands supplied by repository content.

## Minimum boundary for a future, separately authorized test

1. Use an ephemeral virtual machine with a disposable OS identity and home directory.
   Do not share or mount the host home directory, SSH agent, macOS Keychain,
   Codex authentication directory, browser profiles, cloud credentials, or
   existing developer tool sockets.
2. Copy only the reviewed working tree into the VM. Treat every source and
   dependency as potentially hostile. Give the VM no privileged host mounts,
   no container engine socket, and no access to local-network/private-IP services.
3. Start with outbound network access denied. Any dependency retrieval requires
   a separate explicit approval, reviewed lockfile, and narrowly allowed registry
   destination. npm lifecycle scripts must remain untrusted even when the
   installer strips environment variables.
4. Supply only fake canary credentials for negative tests. Do not use personal
   API keys, production accounts, OAuth sessions, or shared provider quotas.
5. Keep the application listening on loopback only, with no port publishing.
   Keep MCP disabled and do not register it with an agent.
6. Monitor attempted file reads, subprocess execution, DNS/network connections,
   credential-file access, and writes outside an ephemeral writable workspace.
   Treat an unexpected attempt as a failed test.
7. Destroy the VM and its storage after verification. Do not carry generated
   artifacts or configuration back to the host without static review.

## Release gates

- Confirm no startup or diagnostic script invokes macOS Keychain tooling.
- Confirm Codex OAuth status/login endpoints cannot read local Codex tokens or
  launch the Codex executable; token requests accept API-key mode only.
- Confirm the Pinokio installation child does not inherit configured provider
  secrets, using fake values in an isolated environment.
- Confirm a port conflict leaves the existing process untouched and aborts startup.
- Verify dependencies and their lifecycle behavior from source/lockfile before
  any installation, and inspect output from the disposable VM.
- Review all remaining executable entry points and transitive dependencies.
- Do not declare the fork safe for ordinary execution until sandboxed tests pass.

The root AGENTS.md remains authoritative only as a warning to cooperating
agents; technical security depends on the VM/tool permissions, not on text.
