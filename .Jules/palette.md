## 2024-05-18 - Tooltip wrapping context
**Learning:** The application uses Radix UI Tooltips. Best practice is to use the existing `TooltipProvider` at the root of the app rather than wrapping every individual `Tooltip` with a new `TooltipProvider` in child components to avoid redundant context providers.
**Action:** When adding Tooltips to new components, ensure they rely on the global `TooltipProvider` if available instead of importing and wrapping them in localized providers.
