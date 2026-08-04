#!/usr/bin/env bash
# Runs at the start of every Claude Code session in this repo.
#
# Pulls main and injects the tail of AGENTS.md into context, so coordination
# messages from Manus arrive automatically instead of depending on someone
# remembering to pull. Nothing pushes in this setup -- git is the transport and
# nobody is listening -- so "read it on the way in" is what makes it reliable.
#
# Never fails the session: a missing network, a dirty tree, or a missing file
# all exit 0 with no output.
set -uo pipefail
REPO="/Users/leescott/Documents/AI/B-line/bline-web"

[ -d "$REPO/.git" ] || exit 0
git -C "$REPO" pull --rebase --autostash --quiet origin main >/dev/null 2>&1 || true

python3 - "$REPO/AGENTS.md" << 'PY' 2>/dev/null || true
import json, io, sys
try:
    text = io.open(sys.argv[1], encoding="utf-8").read()
except Exception:
    sys.exit(0)
# Tail only: the standing rules live near the top and are already in CLAUDE.md;
# what changes between sessions is the bottom of the log.
tail = text[-3000:]
print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": (
            "AGENTS.md — the Claude<->Manus coordination channel — was pulled "
            "automatically at session start. Most recent entries:\n\n" + tail +
            "\n\n(Post a CLAIM here before non-trivial work; append, never rewrite.)"
        ),
    }
}))
PY
