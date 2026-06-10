# Multi-Agent Coordination — SmartRead

Two AI agents work on this project in parallel. Use this file to hand off tasks, share context, and avoid conflicts.

---

## Agents

| Agent | Model | IDE | Strengths |
|-------|-------|-----|-----------|
| **Claude** | claude-sonnet-4-6 (Anthropic) | Claude Code CLI | Architecture, logic, refactors, API integrations |
| **Gemini** | Gemini (Google) | Antigravity | UI generation, visual polish, browser QA, Vercel deploy |

---

## Shared State

**Last Claude action:** Set up AdSense infrastructure (ads.txt + AdUnit placements in about/contact/privacy/terms pages). Commit: `ab00012`. Branch: `main`. NOT pushed — user must `git push origin main`.

**Last Gemini action (from brain d7216828):** Slider integrated in BottomBar, PageCounter deleted, auth backdoor removed, URL.createObjectURL() memory leak fixed in PDFViewer, AdSense behind GDPR consent in layout.tsx, logout confirmation modal, cache buster, deployed to Vercel production.

**Note:** Both agents independently added AdSense. Possible duplication in layout.tsx — needs audit.

---

## Active Tasks

### For Gemini (Antigravity)
- [ ] Audit AdSense duplication: Claude added AdUnit to 4 pages, Gemini added GDPR consent wrapper to layout.tsx — reconcile
- [ ] Confirm Vercel production URL and test slider on mobile

### For Claude (Claude Code)
- [ ] Review Gemini's BottomBar slider implementation
- [ ] Sync git state after Gemini's Vercel deploy

---

## Handoff Protocol

When you complete a task:
1. Mark it `[x]` above
2. Add entry to "Shared State" section
3. Add new tasks for the other agent if needed

When you start a task:
1. Mark it `[~]` (in progress)
2. Note which files you're touching so the other agent doesn't conflict

---

## Files — Current Ownership

| File | Owner | Status |
|------|-------|--------|
| `components/BottomBar.tsx` | Gemini | ✅ Done |
| `components/PageCounter.tsx` | Gemini | ✅ Deleted |
| `app/layout.tsx` | Gemini | ✅ AdSense GDPR |
| `app/about/page.tsx` | Claude | ✅ AdUnit added |
| `app/contact/page.tsx` | Claude | ✅ AdUnit added |
| `app/privacy/page.tsx` | Claude | ✅ AdUnit added |
| `app/terms/page.tsx` | Claude | ✅ AdUnit added |
| `public/ads.txt` | Claude | ✅ Created |
| `middleware.ts` | Gemini | ✅ Backdoor removed |
| `components/PDFViewer.tsx` | Gemini | ✅ Memory leak fixed |
