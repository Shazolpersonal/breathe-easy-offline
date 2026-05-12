## 2025-03-08 - [Enhance Input Sanitization against XSS]
**Vulnerability:** The `sanitizeString` function in `src/lib/storage.ts` used during data import only replaced `<` and `>` characters, leaving it potentially vulnerable to XSS through attributes where strings might be unquoted or interpreted differently.
**Learning:** Even in `localStorage`-only applications without backend databases, data import functions can be attack vectors if users import manipulated backup files. Standard XSS payload characters like `&`, `"`, and `'` should also be escaped when mitigating these attacks manually without DOMPurify.
**Prevention:** Use a more robust entity escaping pattern, or standard libraries like DOMPurify, to sanitize all untrusted user data inputs securely. For basic HTML entity escaping, replace `&`, `<`, `>`, `"`, and `'`.
## 2026-04-20 - [Removed safely unnecessary dangerouslySetInnerHTML from chart component]
**Vulnerability:** Use of `dangerouslySetInnerHTML` to inject styles in `src/components/ui/chart.tsx`. While the input was semi-sanitized for IDs, colors and keys, the usage presented a potential breakout payload vector.
**Learning:** For rendering dynamic CSS within a React component, you do not need `dangerouslySetInnerHTML`.
**Prevention:** Render the style string as a direct child of the `<style>` tag (e.g. `<style>{myStyles}</style>`). React correctly treats the child string as text, which eliminates HTML injection risks.
## 2024-04-29 - Explicit SameSite Cookie Configuration
**Vulnerability:** The sidebar state cookie was being set without explicitly defining a `SameSite` attribute.
**Learning:** While modern browsers default to `SameSite=Lax`, explicitly setting it provides a defense-in-depth approach and clearer security posture against Cross-Site Request Forgery (CSRF) and cross-site tracking risks.
**Prevention:** Whenever manually setting cookies via `document.cookie`, always append at least `SameSite=Lax` (or `Strict` if cross-site usage is definitively not needed) to the cookie string.

## 2026-05-11 - [TypeScript Type Guards and Safe Method Invocations on `unknown` Types]
**Vulnerability:** A duplicate `sanitizeForLog` implementation exported a type signature taking `unknown` and calling `.replace()` through a type assertion that caused TypeScript compile-time collisions and possible runtime errors if the input wasn't properly checked.
**Learning:** When creating utility functions that accept `unknown` data (like logging formatters), strict type checking (`typeof str !== "string"`) followed by explicit casting is necessary before invoking string methods to prevent unhandled TypeErrors and crashes.
**Prevention:** Combine overloaded functionality logically, perform early returns for non-string types, and use explicit casting or string conversion (`String(str)`) safely before applying sanitization logic like `.replace()`.

## 2024-05-12 - Prevent Prototype Pollution in sanitizeObjectStrings
**Vulnerability:** Prototype pollution via `__proto__` property in user-supplied objects parsing during `sanitizeObjectStrings`.
**Learning:** Using `for...in` and assigning values directly to a cloned object (e.g., `newObj[key] = ...`) allows malicious payloads with the `"__proto__"` key to traverse the cloning logic and potentially pollute properties or result in unintended assignment if parsed via standard JSON that isn't completely isolated. Even if it doesn't pollute the prototype chain directly depending on how objects are built, it's safer to explicitly exclude `__proto__`, `constructor`, and `prototype`.
**Prevention:** Always ensure `__proto__`, `constructor`, and `prototype` are skipped when iterating over user-supplied objects to prevent prototype pollution during recursive cloning and sanitation routines.
