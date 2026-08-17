# B-line

B-line is a discovery and navigation app for the Atlanta BeltLine. The web application and its iOS wrapper share one React/Vite codebase through Capacitor 8.

## Run the iOS project

A GitHub clone does not include `node_modules`, but Capacitor’s generated Swift package references the installed Capacitor plugin packages there. Install the locked dependencies before opening the Xcode project.

```bash
npm ci
npm run sync
open ios/App/App.xcodeproj
```

In Xcode, select the **App** scheme and an iOS 15+ simulator or provisioned device, then press Run. The iOS bundle identifier is `com.blineatlanta.app`.

## Fix: “Missing package product ‘CapApp-SPM’”

This message means Xcode could not resolve Capacitor’s local Swift package dependencies. Close Xcode, run the following commands from the repository root, then reopen `ios/App/App.xcodeproj`.

```bash
npm ci
npm run sync
```

If Xcode still displays an older cached error, use **File → Packages → Reset Package Caches**, then build again. The full native workflow is documented in [NATIVE.md](NATIVE.md).
