# Firebase Configuration Guide for Lumin Journal

Follow these steps to set up the backend for your collaborative journal.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** (or "Create a project").
3. Enter a project name (e.g., `lumin-journal`).
4. You can disable Google Analytics for this project as it's not strictly necessary.
5. Click **"Create project"** and wait for it to finish.

## 2. Register Your Web App
1. Once the project is created, click the **Web icon (`</>`)** on the project overview page.
2. Register the app with a nickname (e.g., `Lumin Web`).
3. You don't need to check "Firebase Hosting" for now.
4. Click **"Register app"**.
5. You will see a `firebaseConfig` object code block. **Keep this page open** or copy the keys. You will need them for step 5.

## 3. Set up Firestore Database (Real-time Data)
1. In the left sidebar, click **Build** -> **Firestore Database**.
2. Click **"Create database"**.
3. Choose a location (e.g., `nam5 (us-central)` or nearest to you).
4. **Security Rules**: Start in **Test mode** (allows anyone to read/write for 30 days).
   - *Note: In a real production app, you would lock this down later.*
5. Click **"Create"**.

## 4. Set up Storage (For Images)
1. In the left sidebar, click **Build** -> **Storage**.
2. Click **"Get started"**.
3. Start in **Test mode**.
4. Click **"Done"**.

## 5. Add Configuration to Your Project
1. Go back to your VS Code project.
2. Create a new file named `.env.local` in the root folder (same level as `package.json`).
3. Paste the following template and fill in your values from Step 2:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 6. Restart Server
After creating the `.env.local` file, you usually need to restart your Next.js server for changes to take effect.
- In your terminal, press `Ctrl+C` to stop the server.
- Run `npm run dev` again.

You are now ready to collaborate!
