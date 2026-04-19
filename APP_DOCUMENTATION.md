# Muhurto Breath — Complete Technical Documentation

## 1. Executive Summary
Muhurto Breath is an offline-capable Progressive Web Application (PWA) designed to guide users through various breathing exercises. It offers voice guidance, haptic feedback, customizable themes, and offline support. It tracks statistics, offers playlists, programs, and smart suggestions based on user moods. It runs entirely in the browser and persists data using LocalStorage.

**Technology Stack Overview:**
- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, shadcn-ui, Radix UI
- **State Management:** React Context API, LocalStorage
- **Features:** PWA (vite-plugin-pwa), Recharts for visualizations.

## 2. Project Structure
```text
├── README.md
├── audit_report.md
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── components
│   │   ├── BottomNav.tsx
│   │   ├── BreathingCircle.tsx
│   │   ├── BreathingFeedback.tsx
│   │   ├── BreathingPreview.tsx
│   │   ├── BreathingVisualizer.tsx
│   │   ├── DonateDialog.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FriendChallenge.tsx
│   │   ├── HeartRateMonitor.tsx
│   │   ├── KeyboardShortcutsHelp.tsx
│   │   ├── MiniPlayer.tsx
│   │   ├── MoodPicker.tsx
│   │   ├── NavLink.tsx
│   │   ├── OfflineIndicator.tsx
│   │   ├── ParticleBackground.tsx
│   │   ├── ScreenColorBreathing.tsx
│   │   ├── SessionRecoveryDialog.tsx
│   │   ├── SmartSuggestion.tsx
│   │   ├── SoundscapePicker.tsx
│   │   ├── TechniqueCard.tsx
│   │   ├── WeeklySummary.tsx
│   │   ├── stats
│   │   │   ├── ConsistencyCard.tsx
│   │   │   ├── InsightsTab.tsx
│   │   │   ├── MoodHeatmapCalendar.tsx
│   │   ├── ui
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── use-toast.ts
│   │   ├── visualizations
│   │   │   ├── BarsVisualization.tsx
│   │   │   ├── MandalaVisualization.tsx
│   │   │   ├── WaveVisualization.tsx
│   ├── contexts
│   │   ├── LanguageContext.tsx
│   │   ├── SessionContext.tsx
│   │   ├── SettingsContext.tsx
│   │   ├── ThemeContext.tsx
│   ├── hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useKeyboardShortcuts.ts
│   ├── index.css
│   ├── lib
│   │   ├── achievements.ts
│   │   ├── adaptive.ts
│   │   ├── breathDetector.ts
│   │   ├── challenges.ts
│   │   ├── coherence.test.ts
│   │   ├── coherence.ts
│   │   ├── consistency.ts
│   │   ├── csvExport.ts
│   │   ├── donate.ts
│   │   ├── friendChallenge.test.ts
│   │   ├── friendChallenge.ts
│   │   ├── haptics.ts
│   │   ├── heartRate.ts
│   │   ├── insights.ts
│   │   ├── installPrompt.ts
│   │   ├── mood.ts
│   │   ├── playlists.ts
│   │   ├── programs.ts
│   │   ├── progression.ts
│   │   ├── quotes.ts
│   │   ├── reminders.test.ts
│   │   ├── reminders.ts
│   │   ├── shareApp.ts
│   │   ├── shareCard.ts
│   │   ├── soundscapes.ts
│   │   ├── storage.ts
│   │   ├── suggestions.ts
│   │   ├── techniques.ts
│   │   ├── utils.ts
│   │   ├── voice.ts
│   │   ├── wakeLock.ts
│   │   ├── weeklySummary.ts
│   │   ├── xp.ts
│   ├── locales
│   │   ├── bn.ts
│   │   ├── en.ts
│   ├── main.tsx
│   ├── pages
│   │   ├── Guide.tsx
│   │   ├── Home.tsx
│   │   ├── NotFound.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Playlists.tsx
│   │   ├── Programs.tsx
│   │   ├── Session.tsx
│   │   ├── Settings.tsx
│   │   ├── Stats.tsx
│   │   ├── Techniques.tsx
│   ├── test
│   │   ├── example.test.ts
│   │   ├── setup.ts
│   ├── vite-env.d.ts
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
```

## 3. Technology Stack
- **Languages:** TypeScript, HTML, CSS
- **Frameworks:** React 18, Node.js (build/dev environment)
- **Build Tool:** Vite
- **Dependencies:**
  - `react`, `react-dom`: Core UI Library.
  - `tailwindcss`, `shadcn-ui`, `@radix-ui/*`: UI components and styling.
  - `recharts`: Data visualizations.
  - `lucide-react`: Icons.
  - `vite-plugin-pwa`: PWA support.
  - `vitest`, `jsdom`, `@testing-library/react`: Testing framework.

## 4. Architecture Overview
- **Architecture Pattern:** Component-Based Architecture (Monolithic Frontend).
- **Data Flow:** Unidirectional data flow using React patterns. Global state flows down from Context Providers, and local state is managed within components.
- **Layers:**
  - **UI Components:** Reusable UI elements (`src/components/ui`).
  - **Feature Components:** Specific app features (`src/components`).
  - **Pages:** Top-level route components (`src/pages`).
  - **State/Context:** Global state management (`src/contexts`).
  - **Core Logic:** Utilities, business logic, data models (`src/lib`).
  - **Data Layer:** Wrapper around `localStorage` (`src/lib/storage.ts`).

## 5. Entry Points & Application Bootstrap
- **`index.html`**: The main entry point for the browser. Contains the root `div` and script tag to load `main.tsx`.
- **`src/main.tsx`**: Mounts the React application tree to the DOM and registers the service worker for PWA functionality.
- **`src/App.tsx`**: The root React component. It sets up Routing, Context Providers (Settings, Theme, Language, Session), Error Boundaries, and handles the initial onboarding flow via `AppShell`.

## 6. Module / Component Reference
### `README.md`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Documentation file.

### `audit_report.md`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Documentation file.

### `components.json`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Contains structured configuration data.

### `eslint.config.js`
- **Purpose**: Application configuration or generic file
- **Exports**: `tseslint`
- **Dependencies**: Imports 5 modules (internal/external).
- **Internal Logic**: Standard file without specific active React logic.

### `index.html`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Standard file without specific active React logic.

### `package-lock.json`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Contains structured configuration data.

### `package.json`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Contains structured configuration data.

### `pnpm-lock.yaml`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Contains structured configuration data.

### `postcss.config.js`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Standard file without specific active React logic.

### `src/App.css`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Standard file without specific active React logic.

### `src/App.tsx`
- **Purpose**: Application configuration or generic file
- **Exports**: `App`
- **Dependencies**: Imports 21 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/components/BottomNav.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `BottomNav`
- **Dependencies**: Imports 6 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/components/BreathingCircle.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `BreathingCircle`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/BreathingFeedback.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `BreathingFeedback`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/BreathingPreview.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `BreathingPreview`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/components/BreathingVisualizer.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `VisualizationType, BreathingVisualizer`
- **Dependencies**: Imports 5 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/DonateDialog.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `DonateDialog`
- **Dependencies**: Imports 8 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/components/ErrorBoundary.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `ErrorBoundary`
- **Dependencies**: Imports 1 modules (internal/external).

### `src/components/FriendChallenge.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `CreateChallengeDialog, AcceptChallengeDialog`
- **Dependencies**: Imports 13 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/components/HeartRateMonitor.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `HeartRateMonitorOverlay`
- **Dependencies**: Imports 5 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/components/KeyboardShortcutsHelp.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `KeyboardShortcutsHelp`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/MiniPlayer.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `MiniPlayer`
- **Dependencies**: Imports 7 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/MoodPicker.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `MoodPicker`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/NavLink.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `NavLink`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/OfflineIndicator.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `OfflineIndicator`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/components/ParticleBackground.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `ParticleBackground`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/components/ScreenColorBreathing.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `ScreenColorBreathing`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/SessionRecoveryDialog.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `RecoverableSession, SessionRecoveryDialog`
- **Dependencies**: Imports 4 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/SmartSuggestion.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `SmartSuggestion`
- **Dependencies**: Imports 11 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/components/SoundscapePicker.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `SoundscapePicker`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/TechniqueCard.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `TechniqueCard`
- **Dependencies**: Imports 13 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/components/WeeklySummary.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `WeeklySummary`
- **Dependencies**: Imports 5 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/components/stats/ConsistencyCard.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `ConsistencyCard`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/stats/InsightsTab.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `InsightsTab`
- **Dependencies**: Imports 4 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/stats/MoodHeatmapCalendar.tsx`
- **Purpose**: Feature-specific React Component managing UI state
- **Exports**: `MoodHeatmapCalendar`
- **Dependencies**: Imports 5 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/components/ui/accordion.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Accordion, AccordionItem, AccordionTrigger, AccordionContent`
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/alert-dialog.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/alert.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Alert, AlertTitle, AlertDescription`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/aspect-ratio.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `AspectRatio`
- **Dependencies**: Imports 1 modules (internal/external).

### `src/components/ui/avatar.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Avatar, AvatarImage, AvatarFallback`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/badge.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `BadgeProps, Badge, badgeVariants`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/ui/breadcrumb.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/button.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `ButtonProps, Button, buttonVariants`
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/calendar.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `CalendarProps, Calendar`
- **Dependencies**: Imports 5 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/ui/card.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent`
- **Dependencies**: Imports 2 modules (internal/external).

### `src/components/ui/carousel.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext`
- **Dependencies**: Imports 5 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Interacts with React Context API for global state distribution. Defines business logic functions.

### `src/components/ui/chart.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Interacts with React Context API for global state distribution. Defines business logic functions.

### `src/components/ui/checkbox.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Checkbox`
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/collapsible.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Collapsible, CollapsibleTrigger, CollapsibleContent`
- **Dependencies**: Imports 1 modules (internal/external).

### `src/components/ui/command.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `CommandDialogProps`
- **Dependencies**: Imports 6 modules (internal/external).

### `src/components/ui/context-menu.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/dialog.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/drawer.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/dropdown-menu.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/form.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField`
- **Dependencies**: Imports 6 modules (internal/external).
- **Internal Logic**: Interacts with React Context API for global state distribution.

### `src/components/ui/hover-card.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `HoverCard, HoverCardTrigger, HoverCardContent`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/input-otp.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator`
- **Dependencies**: Imports 4 modules (internal/external).
- **Internal Logic**: Interacts with React Context API for global state distribution.

### `src/components/ui/input.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Input`
- **Dependencies**: Imports 2 modules (internal/external).

### `src/components/ui/label.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Label`
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/menubar.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/navigation-menu.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 5 modules (internal/external).

### `src/components/ui/pagination.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/popover.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Popover, PopoverTrigger, PopoverContent`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/progress.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Progress`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/radio-group.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `RadioGroup, RadioGroupItem`
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/resizable.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `ResizablePanelGroup, ResizablePanel, ResizableHandle`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/scroll-area.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `ScrollArea, ScrollBar`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/select.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/separator.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Separator`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/sheet.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 5 modules (internal/external).

### `src/components/ui/sidebar.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 12 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Interacts with React Context API for global state distribution. Defines business logic functions.

### `src/components/ui/skeleton.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Skeleton`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/ui/slider.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Slider`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/sonner.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Toaster, toast`
- **Dependencies**: Imports 2 modules (internal/external).

### `src/components/ui/switch.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Switch`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/table.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption`
- **Dependencies**: Imports 2 modules (internal/external).

### `src/components/ui/tabs.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Tabs, TabsList, TabsTrigger, TabsContent`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/textarea.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `TextareaProps, Textarea`
- **Dependencies**: Imports 2 modules (internal/external).

### `src/components/ui/toast.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: None identified
- **Dependencies**: Imports 5 modules (internal/external).

### `src/components/ui/toaster.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Toaster`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/components/ui/toggle-group.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `ToggleGroup, ToggleGroupItem`
- **Dependencies**: Imports 5 modules (internal/external).
- **Internal Logic**: Interacts with React Context API for global state distribution.

### `src/components/ui/toggle.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Toggle, toggleVariants`
- **Dependencies**: Imports 4 modules (internal/external).

### `src/components/ui/tooltip.tsx`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider`
- **Dependencies**: Imports 3 modules (internal/external).

### `src/components/ui/use-toast.ts`
- **Purpose**: Reusable UI Component using shadcn and radix primitives
- **Exports**: `useToast, toast`
- **Dependencies**: Imports 1 modules (internal/external).

### `src/components/visualizations/BarsVisualization.tsx`
- **Purpose**: React component for rendering breathing visual feedback
- **Exports**: `BarsVisualization`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/components/visualizations/MandalaVisualization.tsx`
- **Purpose**: React component for rendering breathing visual feedback
- **Exports**: `MandalaVisualization`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/components/visualizations/WaveVisualization.tsx`
- **Purpose**: React component for rendering breathing visual feedback
- **Exports**: `WaveVisualization`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/contexts/LanguageContext.tsx`
- **Purpose**: React Context Provider managing global application state
- **Exports**: `Language, LanguageProvider, useLanguage`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Directly reads from or writes to the browser's LocalStorage. Interacts with React Context API for global state distribution. Defines business logic functions.

### `src/contexts/SessionContext.tsx`
- **Purpose**: React Context Provider managing global application state
- **Exports**: `MiniSessionState, SessionProvider, useSessionContext`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Interacts with React Context API for global state distribution. Defines business logic functions.

### `src/contexts/SettingsContext.tsx`
- **Purpose**: React Context Provider managing global application state
- **Exports**: `SettingsProvider, useSettings`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Interacts with React Context API for global state distribution. Defines business logic functions.

### `src/contexts/ThemeContext.tsx`
- **Purpose**: React Context Provider managing global application state
- **Exports**: `ThemeId, ThemeMode, THEMES, ThemeProvider, useTheme`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Interacts with React Context API for global state distribution. Defines business logic functions.

### `src/hooks/use-mobile.tsx`
- **Purpose**: Application configuration or generic file
- **Exports**: `useIsMobile`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/hooks/use-toast.ts`
- **Purpose**: Application configuration or generic file
- **Exports**: `reducer, useToast, toast`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/hooks/useKeyboardShortcuts.ts`
- **Purpose**: Application configuration or generic file
- **Exports**: `KeyboardShortcutCallbacks, useKeyboardShortcuts`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/index.css`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Standard file without specific active React logic.

### `src/lib/achievements.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `BadgeProgress, Badge, BADGES, checkAllBadges, getNewlyUnlocked`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/adaptive.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `AdaptiveResult, getAdaptiveSession, shouldSuggestIncrease, dismissSuggestion`
- **Dependencies**: Imports 4 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/breathDetector.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `RhythmUpdate, BreathDetector`

### `src/lib/challenges.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `ChallengeTier, ChallengeCategory, DailyChallenge, ChallengeHistoryEntry, getDailyChallenges, getCompletedChallengeCount, areAllChallengesComplete, saveTodayChallengeProgress, getChallengeStreak, getMonthlyCompletionRate`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/coherence.test.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: None identified
- **Dependencies**: Imports 2 modules (internal/external).

### `src/lib/coherence.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `PhaseTimestamp, CalmScoreResult, calculateCalmScore`
- **Internal Logic**: Defines business logic functions.

### `src/lib/consistency.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `ConsistencyBreakdown, ConsistencyResult, getConsistencyScore`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/lib/csvExport.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `exportSessionsCSV`
- **Dependencies**: Imports 3 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/lib/donate.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `DonateOptions, openDonation`
- **Internal Logic**: Defines business logic functions.

### `src/lib/friendChallenge.test.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: None identified
- **Dependencies**: Imports 2 modules (internal/external).

### `src/lib/friendChallenge.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `FriendChallengeParams, FriendChallenge, generateChallengeLink, parseChallengeFromURL, clearChallengeHash, saveFriendChallenge, getFriendChallenges, removeFriendChallenge, getChallengeProgress, getActiveChallenges`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/haptics.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `vibrate, vibratePhaseChange, vibrateDone, vibrateSuccess, vibrateButton, vibrateFavorite, vibrateBadgeUnlock`
- **Internal Logic**: Defines business logic functions.

### `src/lib/heartRate.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `HeartRateData, HeartRateMonitor`

### `src/lib/insights.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `Insight, getWeeklyInsights`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/lib/installPrompt.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `isRunningAsPWA, canInstall, getInstallPlatform, canShowManualInstallHint, isDismissed, dismissInstallBanner`
- **Internal Logic**: Defines business logic functions.

### `src/lib/mood.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `MoodOption, MOODS, getMoodLabelKey, MoodRecord, getMoodRecords, saveMoodRecord, getMoodLabel, getMoodEmoji, getBestTechniqueForMood, getAdaptiveSuggestionForMood`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/playlists.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `PlaylistStep, Playlist, getPlaylists, savePlaylist, deletePlaylist`
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/programs.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `ProgramDay, Program, ProgramEnrollment, PROGRAMS, getEnrollments, enrollInProgram, completeDay, unenrollFromProgram, getProgramById`
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/progression.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `UserProgression, getAllProgressionsPublic, getProgression, getLevelFromSessions, getLevelName, getNextLevelThreshold, getLevelProgress, updateProgression, getTotalSessionCount, isUnlocked, getUnlockRemaining, getScaledPhases`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/quotes.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `BreathingQuote, getDailyQuote`
- **Internal Logic**: Defines business logic functions.

### `src/lib/reminders.test.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: None identified
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage.

### `src/lib/reminders.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `Reminder, getReminders, saveReminders, addReminder, updateReminder, deleteReminder, getNotificationPermission, sendNotification, startReminderChecker, stopReminderChecker`
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/shareApp.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `shareApp, shareQuote, shareStreak, shareBadge, shareTechnique`
- **Dependencies**: Imports 1 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/lib/shareCard.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `ShareCardData`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/lib/soundscapes.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `SoundscapeType, SoundscapeEngine, getSoundscapeEngine`
- **Internal Logic**: Defines business logic functions.

### `src/lib/storage.ts`
- **Purpose**: Wrapper module for interacting directly with browser localStorage
- **Exports**: `SessionRecord, AppSettings, getSessions, addSession, getTodaySessions, getTodayMinutes, getCurrentStreak, getLongestStreak, getSettings, updateSettings, getCustomTechniques, saveCustomTechnique, deleteCustomTechnique, getFavorites, toggleFavorite, getLastBackupDate, getDataSummary, exportData, deleteSession, LastSessionConfig, getLastSessionConfig, saveLastSessionConfig, exportDataCompact, importDataFromCompact, ImportValidationResult, validateImportData, importDataSmart, importData`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/suggestions.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `getSmartSuggestion, getSuggestionTechnique`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/lib/techniques.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `PyramidConfig, BreathingTechnique, BreathingPhase, PRESET_TECHNIQUES, getTechniqueById, getCycleDuration, getPyramidPhasesForRound`
- **Internal Logic**: Defines business logic functions.

### `src/lib/utils.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `cn, sanitizeString, sanitizeObjectStrings`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Defines business logic functions.

### `src/lib/voice.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `VoiceInfo, getAvailableVoices, hasBengaliVoice, SpeakOptions, speak, speakLegacy, stopSpeaking, previewVoice, speakSessionStart, speakSessionEnd, speakCycleMilestone, speakCountdown, speakEncouragement`
- **Internal Logic**: Defines business logic functions.

### `src/lib/wakeLock.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `releaseWakeLock`
- **Internal Logic**: Defines business logic functions.

### `src/lib/weeklySummary.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `WeeklySummaryData, getWeeklySummary, hasSeenWeeklySummary, markWeeklySummarySeen`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/lib/xp.ts`
- **Purpose**: Business logic, data transformations, or utility module
- **Exports**: `XPBreakdown, XPState, XPEntry, getXPState, calculateSessionXP, addXP, getWeeklyXP`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/locales/bn.ts`
- **Purpose**: Localization dictionary mapping keys to translated strings
- **Exports**: `bn`

### `src/locales/en.ts`
- **Purpose**: Localization dictionary mapping keys to translated strings
- **Exports**: `en`

### `src/main.tsx`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Dependencies**: Imports 3 modules (internal/external).

### `src/pages/Guide.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Guide`
- **Dependencies**: Imports 7 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/pages/Home.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Home`
- **Dependencies**: Imports 22 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/pages/NotFound.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `NotFound`
- **Dependencies**: Imports 2 modules (internal/external).
- **Internal Logic**: Executes side effects via useEffect (e.g. data fetching, event listeners).

### `src/pages/Onboarding.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Onboarding`
- **Dependencies**: Imports 8 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/pages/Playlists.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Playlists`
- **Dependencies**: Imports 12 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/pages/Programs.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Programs`
- **Dependencies**: Imports 9 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/pages/Session.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Session`
- **Dependencies**: Imports 41 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/pages/Settings.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Settings`
- **Dependencies**: Imports 22 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Executes side effects via useEffect (e.g. data fetching, event listeners). Defines business logic functions.

### `src/pages/Stats.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Stats`
- **Dependencies**: Imports 16 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Directly reads from or writes to the browser's LocalStorage. Defines business logic functions.

### `src/pages/Techniques.tsx`
- **Purpose**: Top-level Page Component serving as a route target
- **Exports**: `Techniques`
- **Dependencies**: Imports 15 modules (internal/external).
- **Internal Logic**: Maintains local React state using useState. Defines business logic functions.

### `src/test/example.test.ts`
- **Purpose**: Test environment configuration or setup file
- **Exports**: None identified
- **Dependencies**: Imports 1 modules (internal/external).

### `src/test/setup.ts`
- **Purpose**: Test environment configuration or setup file
- **Exports**: None identified
- **Dependencies**: Imports 1 modules (internal/external).

### `src/vite-env.d.ts`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified

### `tailwind.config.ts`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Dependencies**: Imports 1 modules (internal/external).

### `tsconfig.app.json`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Contains structured configuration data.

### `tsconfig.json`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Contains structured configuration data.

### `tsconfig.node.json`
- **Purpose**: Application configuration or generic file
- **Exports**: None identified
- **Internal Logic**: Contains structured configuration data.

### `vite.config.ts`
- **Purpose**: Application configuration or generic file
- **Exports**: `defineConfig`
- **Dependencies**: Imports 5 modules (internal/external).

### `vitest.config.ts`
- **Purpose**: Application configuration or generic file
- **Exports**: `defineConfig`
- **Dependencies**: Imports 3 modules (internal/external).

## 7. Data Models & Schemas

The application defines multiple TypeScript interfaces, primarily located in `src/lib/` modules.
Here are the core definitions extracted from the codebase (omitting excessive prop types):

### From `src/components/BreathingVisualizer.tsx`:

```typescript
export type VisualizationType = "circle" | "wave" | "bars" | "mandala";
```

### From `src/components/SessionRecoveryDialog.tsx`:

```typescript
export interface RecoverableSession {
  techniqueId: string;
  techniqueName: string;
  elapsed: number;
  completedCycles: number;
  durationMin: number;
  moodBefore: number | null;
  phaseIndex: number;
  secondsLeft: number;
  currentRound: number;
  voiceOn: boolean;
  soundscapeType: string;
  timestamp: number;
}
```

### From `src/components/ui/chart.tsx`:

```typescript
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> });
};
```

### From `src/contexts/LanguageContext.tsx`:

```typescript
export type Language = "en" | "bn";
```

### From `src/contexts/SessionContext.tsx`:

```typescript
export interface MiniSessionState {
  isActive: boolean;
  isPaused: boolean;
  techniqueId: string;
  techniqueName: string;
  currentPhase: string;
  elapsed: number;
  totalDuration: number;
  // Extended state for full restore
  phaseIndex: number;
  secondsLeft: number;
  completedCycles: number;
  currentRound: number;
  durationMin: number;
  moodBefore: number | null;
  voiceOn: boolean;
  soundscapeType: string;
}
```

### From `src/contexts/ThemeContext.tsx`:

```typescript
export type ThemeId = "zen" | "ocean" | "forest" | "nightsky" | "neon";
```

### From `src/contexts/ThemeContext.tsx`:

```typescript
export type ThemeMode = "manual" | "manual-light" | "auto" | "auto-warm";
```

### From `src/hooks/useKeyboardShortcuts.ts`:

```typescript
export interface KeyboardShortcutCallbacks {
  onSpace?: () => void;
  onEscape?: () => void;
  onF?: () => void;
  onM?: () => void;
  onS?: () => void;
  onNavigate?: (path: string) => void;
  onHelp?: () => void;
  /** If true, session-specific shortcuts are active (disables nav shortcuts) */
  sessionActive?: boolean;
}
```

### From `src/lib/achievements.ts`:

```typescript
export interface BadgeProgress {
  current: number;
  target: number;
}
```

### From `src/lib/achievements.ts`:

```typescript
export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (sessions?: SessionRecord[]) => boolean;
  progress: (sessions?: SessionRecord[]) => BadgeProgress;
}
```

### From `src/lib/adaptive.ts`:

```typescript
export interface AdaptiveResult {
  techniqueId: string;
  durationMinutes: number;
  reasonKey: string;
  reasonParams?: Record<string, string | number>;
}
```

### From `src/lib/breathDetector.ts`:

```typescript
export interface RhythmUpdate {
  volume: number;       // 0-1 normalized
  isBreathing: boolean; // true = sound detected above threshold
  accuracy: number;     // 0-100 rhythm accuracy
  phase: "inhale" | "exhale" | "quiet";
}
```

### From `src/lib/challenges.ts`:

```typescript
export type ChallengeTier = "easy" | "medium" | "hard";
```

### From `src/lib/challenges.ts`:

```typescript
export type ChallengeCategory = "duration" | "sessions" | "quality" | "timing" | "exploration" | "endurance";
```

### From `src/lib/challenges.ts`:

```typescript
export interface DailyChallenge {
  id: string;
  title: string;
  emoji: string;
  target: number;
  unit: string;
  tier: ChallengeTier;
  category: ChallengeCategory;
  getProgress: () => number;
}
```

### From `src/lib/challenges.ts`:

```typescript
export interface ChallengeHistoryEntry {
  date: string;
  completed: number;
  total: number;
}
```

### From `src/lib/coherence.ts`:

```typescript
export interface PhaseTimestamp {
  phaseIndex: number;
  expectedDuration: number;
  actualDuration: number;
}
```

### From `src/lib/coherence.ts`:

```typescript
export interface CalmScoreResult {
  score: number; // 0-100
  labelKey: string; // locale key
  color: string; // hsl css variable name
}
```

### From `src/lib/consistency.ts`:

```typescript
export interface ConsistencyBreakdown {
  regularity: number; // 0-100
  completion: number; // 0-100
  streak: number;     // 0-100
}
```

### From `src/lib/consistency.ts`:

```typescript
export interface ConsistencyResult {
  score: number; // 0-100
  breakdown: ConsistencyBreakdown;
}
```

### From `src/lib/donate.ts`:

```typescript
export interface DonateOptions {
  amount: number;
  currency: "USD" | "BDT";
  language: "en" | "bn";
  productName?: string;
}
```

### From `src/lib/friendChallenge.ts`:

```typescript
export interface FriendChallengeParams {
  techniqueId: string;
  techniqueName: string;
  targetMinutes: number;
  targetCycles: number;
  challengerName: string;
  date: string; // ISO date
}
```

### From `src/lib/friendChallenge.ts`:

```typescript
export interface FriendChallenge extends FriendChallengeParams {
  id: string;
  acceptedAt: string;
}
```

### From `src/lib/heartRate.ts`:

```typescript
export interface HeartRateData {
  bpm: number | null;
  signalQuality: number; // 0-100
  coherence: number;     // 0-100, coherence with breathing
  isReady: boolean;
}
```

### From `src/lib/insights.ts`:

```typescript
export interface Insight {
  key: string;
  params: Record<string, string>;
}
```

### From `src/lib/mood.ts`:

```typescript
export interface MoodOption {
  value: number;
  emoji: string;
  label: string;
}
```

### From `src/lib/mood.ts`:

```typescript
export interface MoodRecord {
  sessionId: string;
  techniqueId: string;
  moodBefore: number;
  moodAfter: number | null;
  date: string;
}
```

### From `src/lib/playlists.ts`:

```typescript
export interface PlaylistStep {
  techniqueId: string;
  durationMinutes: number;
}
```

### From `src/lib/playlists.ts`:

```typescript
export interface Playlist {
  id: string;
  name: string;
  steps: PlaylistStep[];
}
```

### From `src/lib/programs.ts`:

```typescript
export interface ProgramDay {
  day: number;
  techniqueId: string;
  durationMinutes: number;
  tip: string;
}
```

### From `src/lib/programs.ts`:

```typescript
export interface Program {
  id: string;
  name: string;
  description: string;
  emoji: string;
  days: ProgramDay[];
}
```

### From `src/lib/programs.ts`:

```typescript
export interface ProgramEnrollment {
  programId: string;
  startDate: string; // ISO
  completedDays: number[];
}
```

### From `src/lib/progression.ts`:

```typescript
export interface UserProgression {
  techniqueId: string;
  level: number;
  sessionsCompleted: number;
  totalCycles: number;
}
```

### From `src/lib/quotes.ts`:

```typescript
export interface BreathingQuote {
  text: string;
  author: string;
}
```

### From `src/lib/reminders.ts`:

```typescript
export interface Reminder {
  id: string;
  time: string; // HH:MM
  days: number[]; // 0=Sun..6=Sat
  enabled: boolean;
  message: string;
}
```

### From `src/lib/shareCard.ts`:

```typescript
export interface ShareCardData {
  techniqueName: string;
  durationMinutes: number;
  cycles: number;
  calmScore?: number;
  date: string;
}
```

### From `src/lib/soundscapes.ts`:

```typescript
export type SoundscapeType = "off" | "rain" | "ocean" | "wind";
```

### From `src/lib/storage.ts`:

```typescript
export interface SessionRecord {
  id: string;
  techniqueId: string;
  techniqueName: string;
  date: string; // ISO date string
  durationSeconds: number;
  completedCycles: number;
  moodBefore?: number;
  moodAfter?: number;
  calmScore?: number;
  journal?: string;
  breathAccuracy?: number;
  avgHeartRate?: number;
  heartCoherence?: number;
}
```

### From `src/lib/storage.ts`:

```typescript
export interface AppSettings {
  voiceEnabled: boolean;
  voiceSpeed: number;
  voicePitch: number;
  voiceVolume: number;
  voiceNameEn: string | null;
  voiceNameBn: string | null;
  cuePhaseNames: boolean;
  cueCountdown: boolean;
  cueSessionStart: boolean;
  cueSessionEnd: boolean;
  cueCycleMilestone: boolean;
  cueEncouragement: boolean;
  vibrationEnabled: boolean;
  defaultDurationMinutes: number;
  soundEnabled: boolean;
  theme: string;
  visualizationType: "circle" | "wave" | "bars" | "mandala";
  soundscapeType: "off" | "rain" | "ocean" | "wind";
  soundscapeVolume: number;
  themeMode: "manual" | "auto" | "auto-warm";
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  breathDetectionEnabled: boolean;
  heartRateEnabled: boolean;
  dailyGoalMinutes: number;
}
```

### From `src/lib/storage.ts`:

```typescript
export interface LastSessionConfig {
  techniqueId: string;
  techniqueName: string;
  durationMinutes: number;
}
```

### From `src/lib/storage.ts`:

```typescript
export interface ImportValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats?: {
    sessions: number;
    duplicates: number;
    newSessions: number;
  };
}
```

### From `src/lib/techniques.ts`:

```typescript
export interface PyramidConfig {
  startMultiplier: number;  // e.g. 1.0
  peakMultiplier: number;   // e.g. 1.5
  steps: number;            // e.g. 5 (rounds up then down)
}
```

### From `src/lib/techniques.ts`:

```typescript
export interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  phases: BreathingPhase[];
  rounds?: number;
  isCustom?: boolean;
  pyramid?: PyramidConfig;
  totalDuration?: number;
}
```

### From `src/lib/techniques.ts`:

```typescript
export interface BreathingPhase {
  type: "inhale" | "hold" | "exhale" | "hold-after-exhale";
  duration: number; // seconds
  label: string;
}
```

### From `src/lib/voice.ts`:

```typescript
export interface VoiceInfo {
  name: string;
  lang: string;
  label: string; // "Voice Name (en-US)"
}
```

### From `src/lib/voice.ts`:

```typescript
export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string | null;
  lang?: string;
}
```

### From `src/lib/weeklySummary.ts`:

```typescript
export interface WeeklySummaryData {
  totalSessions: number;
  totalMinutes: number;
  streak: number;
  xpEarned: number;
  bestCalmScore: number | null;
  mostUsedTechnique: string | null;
  hasData: boolean;
}
```

### From `src/lib/xp.ts`:

```typescript
export interface XPBreakdown {
  base: number;
  duration: number;
  difficulty: number;
  calmBonus: number;
  moodBonus: number;
  streakBonus: number;
  firstOfDay: number;
  challengeBonus: number;
  total: number;
}
```

### From `src/lib/xp.ts`:

```typescript
export interface XPState {
  totalXP: number;
  level: number;
  title: string;
  progressToNext: number;
  xpToNext: number;
}
```

### From `src/lib/xp.ts`:

```typescript
export interface XPEntry {
  date: string;
  amount: number;
  source: string;
}
```


## 8. API Reference
- The application is a fully offline PWA. It does not communicate with any external backend API. All state changes are local to the client.

## 9. State Management
- **Local State:** Managed via `useState` and `useReducer` in individual components.
- **Global State:** Handled by React Context API (`SessionContext`, `ThemeContext`, `SettingsContext`, `LanguageContext`).
- **Persistence:** Global state changes are typically synchronized to `localStorage` either directly in the Context Providers or via utility functions in `src/lib/storage.ts`.

## 10. Configuration & Environment
- **Vite Configuration:** `vite.config.ts` configures the build, development server, and PWA plugin settings (manifest, caching).
- **Tailwind:** `tailwind.config.ts` defines the design system tokens, colors, animations, and typography.
- **TypeScript:** `tsconfig.json` and related files configure TS compiler options.
- **Environment Variables:** Used locally via Vite (`.env`) if needed, though none are hardcoded as requirements.

## 11. External Services & Integrations
- None. The app is completely self-contained and offline-first by design.

## 12. Authentication & Security
- No user accounts or authentication.
- Input validation and string sanitization are applied in places like CSV export and URL parsing to prevent XSS (Cross-Site Scripting) or script injection, especially when loading data from URL hashes (e.g., friend challenges).

## 13. Build, Test & Deployment
- **Install Dependencies:** `pnpm install`
- **Run Development Server:** `pnpm dev`
- **Run Tests:** `pnpm test`
- **Build for Production:** `pnpm build`
- **Linting:** `pnpm lint`
- **Deployment:** The output in the `dist/` folder consists of static assets (HTML, JS, CSS) that can be deployed to any static web host (Vercel, Netlify, GitHub Pages, etc.).

## 14. Known Issues & Technical Debt
- The use of `localStorage` for all persistence means data does not sync across devices.
- Heavy reliance on parsing `localStorage` strings synchronously could become a bottleneck if history data grows extremely large.

## 15. Glossary
- **PWA (Progressive Web App):** A web application that can be installed on a device and accessed offline.
- **Haptics:** Physical vibration feedback provided by the device (if supported).
- **Box Breathing:** A technique with equal durations for inhale, hold, exhale, hold.
- **4-7-8 Relaxation:** Inhale for 4s, hold for 7s, exhale for 8s.
- **Coherence Score:** A calculated metric based on user performance during a breathing session.

---

*Generated by automated analysis.*
Total files analyzed: 150
Total sections written: 15
