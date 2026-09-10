import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
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

let activeUser = null;
let syncReady = false;
let syncTimer = null;
let lastSavedProfile = "";
const SYNC_DELAY_MS = 800;

function getAuthRoot() {
  let root = document.getElementById("firebase-auth");
  if (root) return root;
  root = document.createElement("div");
  root.id = "firebase-auth";
  root.setAttribute("aria-live", "polite");
  document.body.prepend(root);
  return root;
}

function setMessage(root, text) {
  const message = root.querySelector("#firebase-auth-message");
  if (message) message.textContent = text || "";
}

function renderSignedOut(root) {
  root.innerHTML = '<button id="firebase-sign-in" type="button">Sign in with Google</button><span id="firebase-auth-message" role="status"></span>';
  root.querySelector("#firebase-sign-in").addEventListener("click", async () => {
    const button = root.querySelector("#firebase-sign-in");
    button.disabled = true;
    setMessage(root, "Signing in…");
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Firebase Google sign-in failed:", error);
      setMessage(root, error.code === "auth/popup-closed-by-user" ? "Sign-in cancelled." : "Could not sign in. Please try again.");
      button.disabled = false;
    }
  });
}

function renderSignedIn(root, user) {
  const name = user.displayName || user.email || "Signed-in user";
  const photo = user.photoURL ? '<img src="' + user.photoURL + '" alt="" referrerpolicy="no-referrer">' : "";
  root.innerHTML = '<span class="firebase-user">' + photo + '<span>Signed in as ' + name + '</span></span><button id="firebase-sign-out" type="button">Sign out</button><span id="firebase-auth-message" role="status"></span>';
  root.querySelector("#firebase-sign-out").addEventListener("click", async () => {
    const button = root.querySelector("#firebase-sign-out");
    button.disabled = true;
    setMessage(root, "Signing out…");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase sign-out failed:", error);
      setMessage(root, "Could not sign out. Please try again.");
      button.disabled = false;
    }
  });
}

function getProgressStore() {
  return window.ProgressStore && typeof window.ProgressStore.getProfile === "function" ? window.ProgressStore : null;
}

function profileReference(user) {
  return doc(db, "users", user.uid, "progress", "current");
}

async function writeProgressNow() {
  if (!activeUser || !syncReady) return;
  const store = getProgressStore();
  if (!store) return;
  const profile = store.getProfile();
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

function queueProgressSync() {
  if (!activeUser || !syncReady) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(writeProgressNow, SYNC_DELAY_MS);
}

function installProgressSync() {
  if (window.__firebaseProgressSyncInstalled) return;
  window.__firebaseProgressSyncInstalled = true;
  const store = getProgressStore();
  if (!store || typeof store.saveProfile !== "function") return;
  const originalSaveProfile = store.saveProfile.bind(store);
  store.saveProfile = function saveProfileAndQueueSync(profile) {
    const result = originalSaveProfile(profile);
    queueProgressSync();
    return result;
  };
  window.addEventListener("pagehide", () => {
    if (syncTimer) {
      window.clearTimeout(syncTimer);
      syncTimer = null;
      writeProgressNow();
    }
  });
}

async function hydrateProgress(user) {
  const store = getProgressStore();
  if (!store) {
    console.warn("ProgressStore was unavailable; cloud progress was not synced.");
    return;
  }
  syncReady = false;
  installProgressSync();
  try {
    const snapshot = await getDoc(profileReference(user));
    const remoteProfile = snapshot.exists() ? snapshot.data().profile : null;
    const merged = remoteProfile && typeof store.mergeProfile === "function" ? store.mergeProfile(remoteProfile) : store.getProfile();
    if (merged && typeof store.saveProfile === "function") {
      const profileWithUser = { ...merged, userId: user.uid };
      store.saveProfile(profileWithUser);
      lastSavedProfile = "";
      syncReady = true;
      await writeProgressNow();
    }
    window.dispatchEvent(new CustomEvent("firebase-progress-ready", { detail: { user } }));
  } catch (error) {
    console.error("Firebase progress hydration failed:", error);
    syncReady = false;
    window.dispatchEvent(new CustomEvent("firebase-progress-sync-error", { detail: { error } }));
  }
}

const root = getAuthRoot();
onAuthStateChanged(auth, async (user) => {
  activeUser = user || null;
  syncReady = false;
  window.clearTimeout(syncTimer);
  if (user) {
    renderSignedIn(root, user);
    await hydrateProgress(user);
  } else {
    renderSignedOut(root);
  }
  window.dispatchEvent(new CustomEvent("firebase-auth-state-changed", { detail: { user: user || null } }));
});

export { app, auth, db, queueProgressSync };
