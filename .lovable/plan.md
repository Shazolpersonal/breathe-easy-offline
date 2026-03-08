

# World-Class App Sharing System — Strategic Placement Plan

## Marketing Analysis: Current State

**What exists today:**
- **Post-session share** — A single "Share" button on the session completion screen that generates a Canvas image card and uses `navigator.share` or downloads a PNG
- **Challenge a Friend** — A button on the Home page that generates a Base64 challenge URL for copy/share
- **No sharing anywhere else** — The daily quote, streak milestones, badges, techniques, and stats have zero sharing capability

**Key problem:** Sharing is buried in a post-session screen that most users rush past. There is no ambient, low-friction way to share the app itself across the user journey.

---

## Strategic Share Placement Plan

### 1. Share App Link (Core Utility)

Create a reusable `src/lib/shareApp.ts` utility with a `shareApp()` function that uses `navigator.share` (with fallback to clipboard copy) to share the app URL (`https://muhurto.lovable.app`) with a localized message like *"I use Muhurto for breathing exercises — try it free"*. Zero cost, uses the Web Share API already proven in the codebase.

### 2. Six Strategic Placements

| Location | Trigger | Format | Why It Works |
|----------|---------|--------|-------------|
| **Home — Daily Quote card** | Small share icon on the quote card | Share quote text + app link | Quotes are inherently shareable — users forward inspirational content to friends daily |
| **Session Done screen** | Already exists — enhance it | Add "Invite a Friend" button alongside existing session card share | Peak emotional moment after a calming session — highest intent to share |
| **Stats — Streak milestone** | When streak ≥ 3, show a share-able streak badge | "I've practiced 7 days in a row on Muhurto 🔥" text share | Achievement pride drives organic sharing |
| **Badges tab** | Share icon on each unlocked badge | Share badge name + app link as text | Gamification-driven sharing — users show off achievements |
| **Techniques Library** | Small share icon on each technique card | Share technique name + description + app link | "Check out this breathing technique" — educational sharing |
| **Settings — bottom** | "Invite Friends" prominent button | Opens native share with app link | Deliberate sharing for users who love the app |

### 3. Implementation Details

**New file: `src/lib/shareApp.ts`** (~40 lines)
- `shareApp(lang)` — shares app URL with localized invite text
- `shareQuote(quoteText, author, lang)` — shares quote + app link
- `shareStreak(streakDays, lang)` — shares streak achievement + app link
- `shareBadge(badgeName, lang)` — shares badge unlock + app link
- `shareTechnique(techniqueName, description, lang)` — shares technique + app link
- All use `navigator.share` with clipboard fallback + toast confirmation

**Modified files:**
| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Add share icon button on daily quote card |
| `src/pages/Session.tsx` | Add "Invite a Friend" button next to existing Share button on done screen |
| `src/pages/Stats.tsx` | Add share button on streak card (when streak ≥ 3) and on unlocked badges |
| `src/components/TechniqueCard.tsx` | Add small share icon on full (non-compact) technique cards |
| `src/pages/Settings.tsx` | Add "Invite Friends" card at the bottom of settings |
| `src/locales/en.ts` | ~12 new keys for share messages and button labels |
| `src/locales/bn.ts` | Matching Bengali translations |

### Technical Notes
- **Zero cost**: Web Share API is free and built into every browser
- **Graceful fallback**: Clipboard copy + toast for browsers without `navigator.share`
- **No new dependencies**: Pure browser APIs
- **Minimal storage**: No localStorage usage — stateless sharing
- **Sustainable**: Web Share API is a W3C standard, will work for decades

