# Doctor Appointment Booking Mobile Application

React Native + TypeScript mobile application foundation for the Doctor Appointment Booking System.

---

## 1. Technology Stack

This application is built using modern React Native ecosystem best practices:

- **Core Framework:** React Native (v0.86.2) & TypeScript
- **Navigation:** React Navigation (Native Stack routing)
- **Networking:** Axios HTTP client
- **Global State Management:** Zustand
- **Server Cache & Synchronization:** TanStack React Query (v5)
- **Forms & Validation:** React Hook Form & Zod
- **UI & Themes:** React Native Paper (Material Design 3)
- **Secure Storage:** react-native-keychain
- **Environment Management:** react-native-config
- **Date Utilities:** dayjs

---

## 2. Directory Structure

```text
src/
├── api/             # Axios clients & TanStack React Query config
├── assets/          # Static media, icons, and fonts
├── components/      # Reusable UI widgets and containers
│   ├── common/      # Global templates (Loading, ScreenContainer, Error)
│   └── ui/          # Generic input/action controls (Button, Input)
├── constants/       # Global storage keys, enums, layout bounds
├── hooks/           # Shared React hooks
├── navigation/      # Auth, Doctor, and Patient routing graphs
├── screens/         # Feature screen placeholders
│   ├── auth/        # Login/Signup forms
│   ├── doctor/      # Availability & Appointments CRUD
│   ├── patient/     # Doctor search & booking scheduler
│   └── common/      # Error & Fallback pages
├── services/        # Third-party integrations
├── stores/          # Zustand store definitions (auth, UI)
├── theme/           # React Native Paper light/dark definitions
├── types/           # Core interface and type definitions
├── utils/           # Helper functions, secure storage wrappers, loggers
└── validation/      # Form input schemas
```

---

## 3. Environment Configuration

The application uses `react-native-config` to load variables.

### Variables Configuration

Create a `.env` file in the root of the mobile application containing:

```env
API_URL=http://10.0.2.2:3000/api/v1
API_TIMEOUT=10000
```

- **Android Emulator Tip:** `10.0.2.2` maps directly to the host machine's `localhost` (running the backend server on port 3000).

---

## 4. Getting Started & Installation

### Prerequisites

- Node.js >= 22.x
- pnpm >= 11.x
- Android Studio & Emulator configured (Android SDK 34+)

### Step-by-Step Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Verify TypeScript compilation:**

   ```bash
   pnpm exec tsc --noEmit
   ```

3. **Check Code Quality & Formatting:**
   ```bash
   pnpm lint
   npx prettier --check .
   ```

---

## 5. Running the Application

### Start the Metro Bundler

Run the packager in your terminal root:

```bash
pnpm start
```

### Launch Android Client

In a separate terminal, launch the application inside the active Android Emulator:

```bash
pnpm android
```
