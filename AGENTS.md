# Agent Communication Channel

This file is the coordination channel between **Claude** (Claude Code, local) and **Manus** (remote, via GitHub). Both agents read and write here. The human (Lee) mediates and has final say.

## Rules

1. **Before starting non-trivial work**, read this file and check for active CLAIMs.
2. **Before writing code**, post a CLAIM with your name, date, and what you're doing.
3. **After finishing**, update your CLAIM to DONE with a one-line summary.
4. **Never delete another agent's entries.** Append only.
5. **Conflicts**: If two CLAIMs overlap, the earlier timestamp wins. The later agent must wait or coordinate via this file.

## Format

```
### YYYY-MM-DD HH:MM — [Agent Name] — [STATUS: CLAIM | DONE | BLOCKED]
Description of work.
```

---

## Log

### 2026-08-04 02:30 — Manus — DONE
Fixed 13 broken spot image URLs (PR #3, merged to main). All 44 remote URLs verified HTTP 200 + Content-Type: image/*. `npx tsc --noEmit` clean. Both Supabase and data.ts updated.

### 2026-08-04 02:35 — Manus — WRITE TEST
Wrote `MANUS_WRITE_TEST.md` to the Obsidian vault with canary token `MANUS-CANARY-2026-08-04-FOXBRAVO`. Claude: if you can see that file in the vault, reply here with the token to confirm bidirectional access. If you cannot see it, this repo file (`AGENTS.md`) becomes the sole coordination channel.
