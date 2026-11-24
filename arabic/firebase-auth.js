import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithCredential, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYYkUvSB5pxUg_w6TbJxSgyRk1gdA7hoI",
  authDomain: "arabic-3e9b3.firebaseapp.com",
  projectId: "arabic-3e9b3",
  storageBucket: "arabic-3e9b3.firebasestorage.app",
  messagingSenderId: "466230326485",
  appId: "1:466230326485:web:86728180ed573a79f5de5c",
  measurementId: "G-V4R6ZVF91W",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const GOOGLE_CLIENT_ID = "466230326485-9nvl1plf61m4hi0n12klpcvqb5sg9ute.apps.googleusercontent.com";
const ONE_TAP_SIGNED_OUT = "fursa:one-tap-signed-out";
let googleScriptPromise = null;
let oneTapInitialized = false;
let oneTapStarted = false;
let interactiveSignIn = false;
let suppressOneTap = false;
try { suppressOneTap = sessionStorage.getItem(ONE_TAP_SIGNED_OUT) === "1"; } catch {}

function setOneTapSuppressed(value) {
  suppressOneTap = value;
  try {
    if (value) sessionStorage.setItem(ONE_TAP_SIGNED_OUT, "1");
    else sessionStorage.removeItem(ONE_TAP_SIGNED_OUT);
  } catch {}
}

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    const timer = window.setTimeout(() => reject(new Error("Google Identity timed out")), 15000);
    script.onload = () => {
      window.clearTimeout(timer);
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else reject(new Error("Google Identity is unavailable"));
    };
    script.onerror = () => { window.clearTimeout(timer); reject(new Error("Google Identity could not load")); };
    document.head.append(script);
  });
  return googleScriptPromise;
}

async function startGoogleOneTap() {
  if (oneTapStarted || auth.currentUser || suppressOneTap || interactiveSignIn
      || document.documentElement.dataset.googleOneTap === "off"
      || window.self !== window.top || !window.isSecureContext) return;
  oneTapStarted = true;
  try {
    const googleId = await loadGoogleIdentity();
    if (auth.currentUser || suppressOneTap || interactiveSignIn) return;
    if (!oneTapInitialized) {
      googleId.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        callback: async (response) => {
          if (!response.credential || auth.currentUser || suppressOneTap || interactiveSignIn) return;
          interactiveSignIn = true;
          try {
            const credential = GoogleAuthProvider.credential(response.credential);
            await signInWithCredential(auth, credential);
            setOneTapSuppressed(false);
          } catch (error) {
            console.error("Firebase One Tap sign-in failed:", error);
            const message = document.getElementById("firebase-auth-message");
            if (message) message.textContent = "Could not sign in automatically. Please use Log in with Google.";
          } finally { interactiveSignIn = false; }
        },
      });
      oneTapInitialized = true;
    }
    googleId.prompt();
  } catch (error) {
    console.warn("Google One Tap unavailable; manual Google login remains available.", error);
  }
}

let activeUser = null;
let syncReady = false;
let syncTimer = null;
let lastSavedProfile = "";
const SYNC_DELAY_MS = 800;

function shouldRenderAuthUi() {
  return document.documentElement.dataset.firebaseAuthUi !== "off";
}

function getAuthRoot() {
  let root = document.getElementById("firebase-auth");
  if (root) return root;
  root = document.createElement("div");
  root.id = "firebase-auth";
  root.setAttribute("aria-live", "polite");
  document.body.prepend(root);
  return root;
}

function setMessage(root, text) { const message = root.querySelector("#firebase-auth-message"); if (message) message.textContent = text || ""; }

function renderSignedOut(root) {
  root.innerHTML = `<div class="firebase-menu-divider" role="separator"></div><button class="drawer-item firebase-google-signin" id="firebase-sign-in" type="button"><span class="firebase-google-mark" aria-hidden="true">G</span><span>Log in with Google</span></button><span class="firebase-auth-message" id="firebase-auth-message" role="status"></span>`;
  root.querySelector("#firebase-sign-in").addEventListener("click", async () => {
    if (interactiveSignIn) return;
    interactiveSignIn = true;
    window.google?.accounts?.id?.cancel();
    const button = root.querySelector("#firebase-sign-in"); button.disabled = true; setMessage(root, "Signing in…");
    try { await signInWithPopup(auth, provider); setOneTapSuppressed(false); }
    catch (error) { console.error("Firebase Google sign-in failed:", error); setMessage(root, error.code === "auth/popup-closed-by-user" ? "Sign-in cancelled." : "Could not sign in. Please try again."); button.disabled = false; }
    finally { interactiveSignIn = false; }
  });
}

function renderSignedIn(root) {
  root.innerHTML = `<div class="firebase-menu-divider" role="separator"></div><button class="drawer-item firebase-logout" id="firebase-sign-out" type="button"><span class="material-symbols-rounded" aria-hidden="true">logout</span><span>Log out</span></button><span class="firebase-auth-message" id="firebase-auth-message" role="status"></span>`;
  root.querySelector("#firebase-sign-out").addEventListener("click", async () => {
    const button = root.querySelector("#firebase-sign-out"); button.disabled = true; setMessage(root, "Logging out…");
    const wasSuppressed = suppressOneTap;
    setOneTapSuppressed(true);
    window.google?.accounts?.id?.cancel();
    window.google?.accounts?.id?.disableAutoSelect();
    try { await signOut(auth); }
    catch (error) { setOneTapSuppressed(wasSuppressed); console.error("Firebase sign-out failed:", error); setMessage(root, "Could not log out. Please try again."); button.disabled = false; }
  });
}

function getProgressStore() { return window.ProgressStore && typeof window.ProgressStore.getProfile === "function" ? window.ProgressStore : null; }
function profileReference(user) { return doc(db, "users", user.uid, "progress", "current"); }

async function writeProgressNow() {
  if (!activeUser || !syncReady) return;
  const store = getProgressStore();
  if (!store) return;
  const profile = store.getProfile();
  if (profile.userId !== activeUser.uid) return;
  const serialized = JSON.stringify(profile);
  if (serialized === lastSavedProfile) return;
  try {
    await setDoc(profileReference(activeUser), { profile, schemaVersion: profile.schemaVersion || 1, updatedAt: serverTimestamp() }, { merge: true });
    lastSavedProfile = serialized;
    window.dispatchEvent(new CustomEvent("firebase-progress-synced"));
  } catch (error) {
    console.error("Firebase progress sync failed:", error);
    window.dispatchEvent(new CustomEvent("firebase-progress-sync-error", { detail: { error } }));
  }
}

function queueProgressSync() { if (!activeUser || !syncReady) return; window.clearTimeout(syncTimer); syncTimer = window.setTimeout(writeProgressNow, SYNC_DELAY_MS); }

function installProgressSync() {
  if (window.__firebaseProgressSyncInstalled) return;
  window.__firebaseProgressSyncInstalled = true;
  const store = getProgressStore();
  if (!store || typeof store.saveProfile !== "function") return;
  const originalSaveProfile = store.saveProfile.bind(store);
  store.saveProfile = function saveProfileAndQueueSync(profile) { const result = originalSaveProfile(profile); queueProgressSync(); return result; };
  window.addEventListener("pagehide", () => { if (syncTimer) { window.clearTimeout(syncTimer); syncTimer = null; writeProgressNow(); } });
}

async function hydrateProgress(user) {
  const store = getProgressStore();
  if (!store) { console.warn("ProgressStore was unavailable; cloud progress was not synced."); return; }
  syncReady = false;
  installProgressSync();
  try {
    const localProfile = store.getProfile();
    const localOwner = localProfile.userId || null;
    const snapshot = await getDoc(profileReference(user));
    const remoteProfile = snapshot.exists() ? snapshot.data().profile : null;

    if (localOwner && localOwner !== user.uid) {
      store.createBackup(localProfile, "different-user");
      const replacement = remoteProfile && typeof remoteProfile === "object" ? remoteProfile : { ...localProfile, units: {}, lastActive: null, syncVersion: 0 };
      const ownedProfile = { ...replacement, userId: user.uid };
      store.replaceProfile(ownedProfile);
    } else {
      const merged = remoteProfile && typeof store.mergeProfile === "function" ? store.mergeProfile(remoteProfile, localProfile) : localProfile;
      store.replaceProfile({ ...merged, userId: user.uid });
    }

    lastSavedProfile = "";
    syncReady = true;
    await writeProgressNow();
    window.dispatchEvent(new CustomEvent("firebase-progress-ready", { detail: { user } }));
  } catch (error) {
    console.error("Firebase progress hydration failed:", error);
    syncReady = false;
    window.dispatchEvent(new CustomEvent("firebase-progress-sync-error", { detail: { error } }));
  }
}

const renderAuthUi = shouldRenderAuthUi();
const root = renderAuthUi ? getAuthRoot() : null;
const isMainPage = location.pathname.endsWith("/arabic.html")
  || location.pathname.endsWith("/arabic/")
  || location.pathname === "/";

let initialAuthStateResolved = false;
let currentAuthUserId = null;

onAuthStateChanged(auth, async (user) => {
  const nextUserId = user?.uid ?? null;
  if (user) {
    setOneTapSuppressed(false);
    window.google?.accounts?.id?.cancel();
  }

  if (!initialAuthStateResolved) {
    initialAuthStateResolved = true;
  } else if (nextUserId !== currentAuthUserId) {
    location.reload();
    return;
  }

  currentAuthUserId = nextUserId;
  activeUser = user || null;
  syncReady = false;
  window.clearTimeout(syncTimer);

  if (renderAuthUi) {
    if (user) renderSignedIn(root, user);
    else renderSignedOut(root);
  }

  if (user) await hydrateProgress(user);
  else void startGoogleOneTap();

  window.dispatchEvent(
    new CustomEvent("firebase-auth-state-changed", {
      detail: { user: user || null }
    })
  );
});

export { app, auth, db, queueProgressSync };
