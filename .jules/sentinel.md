## 2025-03-08 - [Enhance Input Sanitization against XSS]
**Vulnerability:** The `sanitizeString` function in `src/lib/storage.ts` used during data import only replaced `<` and `>` characters, leaving it potentially vulnerable to XSS through attributes where strings might be unquoted or interpreted differently.
**Learning:** Even in `localStorage`-only applications without backend databases, data import functions can be attack vectors if users import manipulated backup files. Standard XSS payload characters like `&`, `"`, and `'` should also be escaped when mitigating these attacks manually without DOMPurify.
**Prevention:** Use a more robust entity escaping pattern, or standard libraries like DOMPurify, to sanitize all untrusted user data inputs securely. For basic HTML entity escaping, replace `&`, `<`, `>`, `"`, and `'`.
## 2026-04-20 - [Removed safely unnecessary dangerouslySetInnerHTML from chart component]
**Vulnerability:** Use of `dangerouslySetInnerHTML` to inject styles in `src/components/ui/chart.tsx`. While the input was semi-sanitized for IDs, colors and keys, the usage presented a potential breakout payload vector.
**Learning:** For rendering dynamic CSS within a React component, you do not need `dangerouslySetInnerHTML`.
**Prevention:** Render the style string as a direct child of the `<style>` tag (e.g. `<style>{myStyles}</style>`). React correctly treats the child string as text, which eliminates HTML injection risks.
