# Ogere Remo Civic Mobile App 👑

A world-class, offline-first civic mobile application for **Ogere Remo Kingdom & Community**, available on iOS and Android.

---

## Key Features

1. **100% Offline-First Architecture**:
   - Bundles all essential civic records locally: **Town News & Palace Proclamations**, **Succession of the Obas & Monarchy**, **Traditional Oriki**, **24/7 Emergency Helplines**, and **Business Directory**.
   - Accessible anywhere without requiring an active internet connection or mobile data.

2. **Automatic Delta Synchronization**:
   - Powered by `@react-native-community/netinfo` and `syncManager.ts`.
   - Listens for internet connectivity in the background and pulls new records from `/api/sync?since={timestamp}` against the shared Neon PostgreSQL database.
   - Automatically flushes queued offline submissions (audience appointments, incident reports) when connectivity resumes.

3. **World-Class Civic Identity & Onboarding**:
   - Royal welcome sequence highlighting Ogere's heritage, offline access, and palace services.
   - **Explore as Guest Mode**: Citizens, visitors, and researchers can read news, verify IDs, and browse archives immediately without registration.
   - **Citizen Registration & Login**: Unified citizen profile with quarter, compound (agbo-ile), and biometric authentication (Face ID / Fingerprint) support via `expo-local-authentication`.

4. **Shared Database & Unified Backend**:
   - Connects to the same PostgreSQL database (`neondb`) as the web app.
   - Powered by serverless endpoints in `/api/auth.js`, `/api/sync.js`, `/api/id-cards.js`, and `/api/royal-audiences.js`.

---

## Quick Start & Running Locally

### 1. Install Dependencies
From the `mobile/` directory:
```bash
cd mobile
npm install
```

### 2. Start Expo Development Server
```bash
npx expo start
```

### 3. Open on Device
- **Android**: Scan the QR code using the **Expo Go** app from Google Play Store or press `a` in the terminal for Android Emulator.
- **iOS**: Scan the QR code using the native Camera app (with **Expo Go** installed) or press `i` for iOS Simulator.
- **Web Preview**: Press `w` to launch the mobile layout in your browser.

---

## Testing Offline Capabilities

1. Open the app on your phone or emulator.
2. Turn on **Airplane Mode** (disable Wi-Fi and Cellular Data).
3. Notice the subtle top notification banner: `Offline Mode · Viewing Cached Records`.
4. Navigate through **Town News**, read article details, open **Kings Lineage**, and view **Emergency Helplines** — all data renders instantaneously with zero network latency.
5. Turn **Airplane Mode OFF**.
6. The app instantly transitions and displays `Updating Community Content with Palace Server...`, synchronizing new records with the PostgreSQL database.

---

## Project Structure

```
mobile/
├── App.tsx                     # App entry, offline cache boot, auth provider
├── app.json                    # Expo metadata, biometric permissions, bundle IDs
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── src/
    ├── components/             # Reusable civic UI (Header, OfflineNotice, Button, Card)
    ├── database/
    │   ├── seedData.ts         # Pre-bundled offline news, kings, directory, emergency lines
    │   ├── sqlite.ts           # Local persistence and pending submissions queue
    │   └── syncManager.ts      # NetInfo network listener & background delta sync engine
    ├── navigation/
    │   └── RootNavigator.tsx   # Stack navigator & 5-tab bottom navigation
    ├── screens/
    │   ├── welcome/            # First-time onboarding & guest gateway
    │   ├── auth/               # Civic Login & Registration with biometric unlock
    │   ├── home/               # Civic dashboard & reigning monarch spotlight
    │   ├── news/               # Offline news feed & detailed article reader
    │   ├── heritage/           # Obas succession, 4 royal houses & Oriki
    │   ├── directory/          # 24/7 Emergency speed-dial & business listings
    │   ├── services/           # ID verification, royal audience & incident dispatch
    │   └── profile/            # Citizen Digital ID card wallet & device sync settings
    ├── services/
    │   └── authContext.tsx     # Authentication state, SecureStore & biometrics
    └── theme/                  # Design system tokens (Ogere Emerald #064e3b & Gold #d97706)
```
