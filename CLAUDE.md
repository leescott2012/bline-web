# B-line — working rules

Atlanta BeltLine trail app. React + Vite + MapLibre, Capacitor for iOS, Supabase
backend. Two agents work this repo: **Claude Code** and **Manus**.

## Branching — how the two agents stay out of each other's way

`main` is **always deployable** — Vercel builds it straight to production at
`bline-web.vercel.app`. The rule is asymmetric on purpose: only one of these two
working modes has a human watching in real time.

- **Claude Code, in a live session with Lee present:** may push straight to
  `main`. Lee is reviewing and directing as it happens. This is the existing
  pattern — don't "improve" it into a PR flow.
- **Manus, and anything scheduled or autonomous:** **never push to `main`.**
  Branch as `manus/<short-kebab-description>`, one branch per logical unit of
  work, and open a PR. Vercel builds a preview URL per PR — that preview is the
  review mechanism.
- **Merges wait for Lee** (or Claude on Lee's behalf, in a live session). No
  auto-merge, even if checks pass. A PR sitting unreviewed is fine — log it and
  move on rather than escalating.

Nobody force-pushes `main`. The canonical version of this lives in the vault
roadmap's "Branch & PR Conventions"; if the two ever disagree, the vault wins.

## Standing rules

**Run `npx cap sync ios` after every web change.** Not just before a native
build. The iOS app bundles `dist`, so skipping this ships a stale app that looks
like a code bug.

**`ios/App/App/public/` is gitignored** — 0 files tracked, which is correct for
Capacitor. A fresh clone has no web content in the Xcode project: run
`npm run build && npx cap sync ios` before opening Xcode or the app launches
blank.

**Never touch `git config`.** The account's GitHub email is private, so a plain
commit is rejected with GH007. Set the identity per-command instead:

```bash
GIT_AUTHOR_EMAIL=leescott2012@users.noreply.github.com \
GIT_COMMITTER_EMAIL=leescott2012@users.noreply.github.com \
git commit -m "…"
```

**Migrations are applied by hand.** There's no psql, Docker, or Supabase CLI on
the dev machine, and PostgREST cannot create functions. Each `supabase-*.sql`
file at the repo root is idempotent and gets pasted into the Supabase SQL editor.
Check the vault's Production Readiness Checklist before assuming one is
outstanding — they are marked there once applied and verified.

**Mirror anything decision-shaped into the Obsidian vault** under
`03 Projects/B-line/`, not just into the repo. The vault is how Manus picks up
context. File into existing folders; don't create new ones.

## Architecture notes worth knowing before editing

**Everyone is signed in.** A hard gate in `src/App.tsx` puts an anonymous
Supabase user and a profile in front of the whole app, so no screen needs to
handle a signed-out state. Location publishing runs from that gate, app-wide.

**Row-level security is the real access control, not the UI.** Friends only see
your position when there's an unexpired `location_shares` grant *and* your
`profiles.sharing_enabled` is true. Don't add client-side filtering that implies
otherwise, and don't weaken the policies to make a query easier.

**Crowd density never reads rows.** `crowd_density()` and `trail_people_now()`
are `security definer` functions returning aggregates only — positions rounded
to a ~100 m grid, cells withheld below three people. If you need finer data,
change the floor deliberately and say why; don't bypass the functions.
