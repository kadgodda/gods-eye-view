#!/usr/bin/env bash
# Disabled: this quarantined fork must not read credential JSON files or write
# to the host macOS Keychain. Configure isolated, temporary provider keys only.
echo "OpenSky Keychain import is disabled in this quarantined fork." >&2
exit 1
