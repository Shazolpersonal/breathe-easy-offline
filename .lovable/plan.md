

# Localized Daily Quotes

## Problem
The daily quote on the Home page is always in English, even when the user switches to Bengali.

## Approach
Add a parallel Bengali quotes array in `src/lib/quotes.ts` with the same structure and count (30 quotes). Update `getDailyQuote()` to accept a `language` parameter and return the quote from the matching array. Both arrays use the same date-based index so the same "slot" is shown each day regardless of language.

In `Home.tsx`, pass the current language from `useLanguage()` to `getDailyQuote(language)`.

## Changes

**`src/lib/quotes.ts`**:
- Add `QUOTES_BN: BreathingQuote[]` with 30 Bengali breathing/mindfulness quotes (a mix of translated wisdom + original Bengali/Islamic/Sufi spiritual quotes about breath, peace, and mindfulness — culturally appropriate for Bengali speakers)
- Change `getDailyQuote(language: "en" | "bn")` to select from the correct array
- Keep `hashDate` and index logic unchanged

**`src/pages/Home.tsx`**:
- Change `getDailyQuote()` call to `getDailyQuote(language)` (language already available from `useLanguage()`)

Only 2 files changed. No new locale keys needed since the quotes are self-contained strings, not template keys.

