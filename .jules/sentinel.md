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
## 2026-05-18 - [Prevent Prototype Pollution in sanitizeObjectStrings]
**Vulnerability:** The `sanitizeObjectStrings` recursive function iterated over all keys of a parsed JSON object to sanitize strings. However, if a malicious JSON string contained `__proto__`, `constructor`, or `prototype` keys, these keys could bypass the `hasOwnProperty` check because they existed directly on the parsed JSON object itself (not inherited), leading to Prototype Pollution when the sanitized object was later merged or assigned.
**Learning:** `Object.prototype.hasOwnProperty.call(obj, key)` only checks if the key exists directly on the object. When parsing JSON containing `{"__proto__": {"polluted": "yes"}}`, `JSON.parse` creates an object with a direct property named `__proto__`. Therefore, `hasOwnProperty` returns `true` for `__proto__`, allowing the malicious property to be copied into the target object and polluting the prototype.
**Prevention:** Explicitly skip prototype-related keys (`__proto__`, `constructor`, `prototype`) during the `for...in` loop before performing any `hasOwnProperty` checks or processing the values.
## 2025-03-08 - [Prevent JSON.parse Prototype Pollution]
**Vulnerability:** Calls to `JSON.parse` with untrusted data (like `localStorage` reads from imported data, or base64-decoded URLs in `friendChallenge.ts`) were executed without a reviver function. If a malicious JSON string contained `__proto__`, `constructor`, or `prototype` keys, it could lead to prototype pollution when the parsed object is used.
**Learning:** `JSON.parse` is vulnerable to prototype pollution when parsing malicious JSON strings. A custom reviver function is needed to safely drop these keys during the deserialization phase.
**Prevention:** Always pass a secure reviver function, like `secureJsonReviver` which explicitly checks and drops `__proto__`, `constructor`, and `prototype` keys, as the second argument to `JSON.parse` when parsing untrusted data.
## 2024-05-18 - [Prevent CSV/DDE Injection Bypass via Whitespace]
**Vulnerability:** The CSV export sanitization in `escapeCSV` checked for formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) only at the very first character of the string (`sanitized[0]`). Attackers could bypass this check by prepending leading whitespace (e.g., ` =cmd|' /C calc'!A0`), which applications like Microsoft Excel trim before executing the payload.
**Learning:** Checking the first character of a raw string is insufficient for DDE injection prevention because spreadsheet software often normalizes inputs (like trimming spaces) before evaluating them as formulas.
**Prevention:** Always apply formula character checks after stripping leading whitespace (e.g., using `.trimStart()`) when escaping data for spreadsheet exports.
