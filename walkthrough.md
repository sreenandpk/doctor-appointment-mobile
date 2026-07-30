# Mobile Application Architecture Walkthrough

This document outlines the foundation setup, folder structure, libraries, configuration, architectural refactoring, and verification procedures implemented for the React Native mobile application client.

---

## 1. Project Directory Map

The setup establishes the following structured, clean code pattern:

```text
src/
├── api/             # HTTP routing configs and TanStack React Query Client
│   ├── auth.api.ts
│   ├── axios.ts
│   ├── doctor.api.ts
│   ├── index.ts     # Barrel exports
│   ├── patient.api.ts
│   └── queryClient.ts
├── assets/          # Static assets placeholders
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/      # UI controls and screen containers
│   ├── common/
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx  # Catches unexpected render crashes
│   │   ├── ErrorState.tsx
│   │   ├── LoadingIndicator.tsx
│   │   └── ScreenContainer.tsx
│   ├── index.ts     # Barrel exports
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── constants/       # Split configuration domains
│   ├── api.ts
│   ├── index.ts     # Barrel exports
│   ├── roles.ts
│   ├── routes.ts
│   └── storage.ts
├── hooks/           # Custom React hooks
│   ├── mutations/   # Mutation hook triggers
│   └── queries/     # Query data synchronizations
├── navigation/      # Navigation graphs and param types
│   ├── AuthNavigator.tsx
│   ├── DoctorNavigator.tsx
│   ├── PatientNavigator.tsx
│   └── RootNavigator.tsx
├── screens/         # Page components
│   ├── auth/
│   │   └── LoginScreen.tsx
│   ├── common/
│   │   └── NotFoundScreen.tsx
│   ├── doctor/
│   │   └── DoctorDashboardScreen.tsx
│   └── patient/
│       └── PatientDashboardScreen.tsx
├── services/        # Business orchestration layers
│   ├── auth.service.ts
│   ├── doctor.service.ts
│   └── patient.service.ts
├── stores/          # Zustand store hooks
│   ├── auth.store.ts
│   ├── doctor.store.ts
│   ├── index.ts     # Barrel exports
│   ├── patient.store.ts
│   └── ui.store.ts
├── theme/           # React Native Paper styles segmentations
│   ├── colors.ts
│   ├── index.ts     # Barrel exports
│   ├── spacing.ts
│   ├── theme.ts
│   └── typography.ts
├── types/           # Domain type declarations
│   ├── appointment.ts
│   ├── auth.ts
│   ├── common.ts
│   ├── doctor.ts
│   ├── index.ts     # Barrel exports
│   └── patient.ts
├── utils/           # Helper functions, secure storing, loggers
│   ├── helpers.ts
│   ├── logger.ts
│   └── storage.ts
└── validation/      # Input verification schemas
```

---

## 2. Integrated Technologies

We successfully installed and linked the following core dependencies:

- **React Navigation (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/stack`):** Enables native transition stack navigations.
- **Axios (`axios`):** Standard request provider configured with JSON headers, default timeouts, and authorization token attachments.
- **Zustand (`zustand`):** Ultra-lightweight global state management stores representing `auth`, `doctor`, `patient`, and `ui` scopes.
- **TanStack React Query (`@tanstack/react-query`):** Manages server data synchronization, automatic background updates, and stale times.
- **React Hook Form (`react-hook-form`):** Performant form bindings.
- **Zod (`zod`):** Strong type validations.
- **React Native Paper (`react-native-paper` & `react-native-vector-icons`):** Core UI theme framework based on Material Design 3.
- **react-native-keychain:** Keychain securely stores access tokens.
- **react-native-config:** Exposes environment configurations.
- **dayjs:** Fast and small date parser.

---

## 3. Architectural Refactor Improvements

To scale maintainability before active business feature implementation, the following improvements were made:

1.  **API / Service Layer Separation:**
    - HTTP requests are restricted to `.api.ts` modules.
    - Business operations, Zustand updates, and secure storage mutations are handled in `.service.ts` scripts (which are fully testable and decoupled from React rendering).
2.  **Domain Typings:** Moved unified models into domain type files (`auth.ts`, `doctor.ts`, `patient.ts`, `appointment.ts`, `common.ts`) under `src/types/`.
3.  **Constants Separation:** Split monolithic configuration constants into domain-specific configs (`api.ts`, `roles.ts`, `storage.ts`, `routes.ts`).
4.  **Theme Segmentation:** Structured visual configurations into `colors.ts`, `spacing.ts`, and `typography.ts` files inside `src/theme/`.
5.  **ErrorBoundary Container:** Wrapped `App.tsx` inside a custom `ErrorBoundary` component to gracefully catch rendering crashes and present fallback views without interrupting core app status.
6.  **Barrel Exports:** Added `index.ts` files inside `components`, `api`, `theme`, and `stores` directories.

---

## 4. Verification & QA

- **TypeScript Dry-Run:** Checked with `pnpm exec tsc --noEmit` which completed successfully with **0 compiler errors**.
- **Lint Verification:** Evaluated with `pnpm lint` resolving all unused variables and completing with **0 errors and 0 warnings**.
- **Formatting:** Prettier formatting is applied to all source files successfully.
