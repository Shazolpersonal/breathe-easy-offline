## 2025-03-08 - [Enhance Input Sanitization against XSS]
**Vulnerability:** The `sanitizeString` function in `src/lib/storage.ts` used during data import only replaced `<` and `>` characters, leaving it potentially vulnerable to XSS through attributes where strings might be unquoted or interpreted differently.
**Learning:** Even in `localStorage`-only applications without backend databases, data import functions can be attack vectors if users import manipulated backup files. Standard XSS payload characters like `&`, `"`, and `'` should also be escaped when mitigating these attacks manually without DOMPurify.
**Prevention:** Use a more robust entity escaping pattern, or standard libraries like DOMPurify, to sanitize all untrusted user data inputs securely. For basic HTML entity escaping, replace `&`, `<`, `>`, `"`, and `'`.
## 2026-04-20 - [Removed safely unnecessary dangerouslySetInnerHTML from chart component]
**Vulnerability:** Use of `dangerouslySetInnerHTML` to inject styles in `src/components/ui/chart.tsx`. While the input was semi-sanitized for IDs, colors and keys, the usage presented a potential breakout payload vector.
**Learning:** For rendering dynamic CSS within a React component, you do not need `dangerouslySetInnerHTML`.
**Prevention:** Render the style string as a direct child of the `<style>` tag (e.g. `<style>{myStyles}</style>`). React correctly treats the child string as text, which eliminates HTML injection risks.
## 2026-04-23 - Prevent CSRF by setting SameSite on sidebar cookie
**Vulnerability:** The `SIDEBAR_COOKIE_NAME` cookie in `src/components/ui/sidebar.tsx` was missing the `SameSite` attribute.
**Learning:** When manually constructing `document.cookie` strings in React components (like shadcn's sidebar component), it is easy to forget modern security attributes like `SameSite=Lax`. While not highly sensitive, adhering to this practice hardens the application against CSRF and cross-site tracking.
**Prevention:** Always ensure `SameSite=Lax` (or `Strict`) is appended when manually setting cookies.
