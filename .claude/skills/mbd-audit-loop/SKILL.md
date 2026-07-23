---
name: mbd-audit-loop
description: The multi-agent audit → adversarial verify → fix → re-audit loop that hardened Operativa (66 confirmed findings fixed across two rounds). Use after completing any substantial feature or milestone on an MBD platform, or when the owner asks for a comprehensive review, before anything is called done or release-ready.
---

# MBD Audit Loop

"If you believe you have completed a part of the app, commit to a
comprehensive loop-oriented audit, fix everything, then re-audit."
This is how that's done. Evidence first: chat claims are worth nothing;
commits, tests, and screenshots are the only proof.

## The loop

1. **Find** — parallel finder agents, one per lens, each capped (~7
   findings, most severe first, each anchored to a specific file, detail
   under 80 words). Proven lens set:
   - regressions from the last fix pass (read the actual diff)
   - end-to-end flows per role (login → every view → logout, deep links,
     admin toggles applied next login, theme persistence)
   - runtime edge cases (resize across breakpoints, storage quota,
     stale/tampered localStorage, double-login, file:// context)
   - accessibility (focus order, ARIA truthfulness, contrast both
     themes, touch targets, live regions)
   - docs-vs-reality (README/specs/comments against the code — stale
     claims are findings)
   - test quality (what changed but is no longer pinned; vacuous
     assertions; boundary coverage; does CI run what the README claims)
   - code craft (duplication, dead exports/CSS, orphaned assets,
     ungrammatical UI copy)
2. **Verify** — every finding goes to an adversarial agent told to
   REFUTE it against the actual code and default to not-real when
   uncertain. Only confirmed findings count. Expect a healthy refute
   rate; if ~everything confirms, distrust the verifier, not the code.
3. **Fix** — all confirmed findings, in severity order. If subagents are
   unavailable (usage limits), verify the findings yourself by reading
   the code — never fix an unverified claim blindly.
4. **Re-verify locally** — full test suite, `node --check` sweep, and a
   Playwright drive-through (login per role, changed flows, phone
   viewport) with **zero console errors** before committing.
5. **Re-audit** — fresh finder round (tell it what was already fixed;
   demand NEW issues only). Loop until a round comes back dry or
   confirms nothing.

## Workflow mechanics (Claude Code)

- Use the Workflow tool: `pipeline(LENSES, find, verify)` with
  structured-output schemas (`findings[]`, `{isReal, reason}`);
  dedupe by `file|title` against a `seen` set so judge-rejected findings
  don't resurface; loop-until-dry with a round cap (3).
- End with a **completeness critic**: "what did this review itself miss?"
- Findings and verdicts land in the workflow journal
  (`journal.jsonl`) — parse it if the summary truncates.
- Fix commits list every finding addressed, grouped by category, so the
  next round's finders can read the diff and hunt what survived.

## Triage judgment

- A "spec violation" finding may actually be a stale spec — when the
  owner's later direction contradicts the written spec, update the spec
  document (dated, attributed) instead of reverting the code.
- Refuted-but-cheap hardening (e.g. a try/catch on input that is
  currently unreachable) is still worth doing when a planned feature
  will make it reachable — say so in the commit.
- Never re-report or re-fix what a previous round already handled;
  point finders at the fix commits explicitly.
