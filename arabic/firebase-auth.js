import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

function getAuthRoot() {
  let root = document.getElementById("firebase-auth");
  if (root) return root;

  root = document.createElement("div");
  root.id = "firebase-auth";
  root.setAttribute("aria-live", "polite");
  document.body.prepend(root);
  return root;
}

function renderSignedOut(root) {
  root.innerHTML = `
    <button id="firebase-sign-in" type="button">
      Sign in with Google
    </button>
    <span id="firebase-auth-message" role="status"></span>
  `;

  root.querySelector("#firebase-sign-in").addEventListener("click", async () => {
    const button = root.querySelector("#firebase-sign-in");
    const message = root.querySelector("#firebase-auth-message");

    button.disabled = true;
    message.textContent = "Signing in…";

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Firebase Google sign-in failed:", error);
      message.textContent =
        error.code === "auth/popup-closed-by-user"
          ? "Sign-in cancelled."
          : "Could not sign in. Please try again.";
      button.disabled = false;
    }
  });
}

function renderSignedIn(root, user) {
  const name = user.displayName || user.email || "Signed-in user";
  const photo = user.photoURL
    ? `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer">`
    : "";

  root.innerHTML = `
    <span class="firebase-user">
      ${photo}
      <span>Signed in as ${name}</span>
    </span>
    <button id="firebase-sign-out" type="button">Sign out</button>
    <span id="firebase-auth-message" role="status"></span>
  `;

  root.querySelector("#firebase-sign-out").addEventListener("click", async () => {
    const button = root.querySelector("#firebase-sign-out");
    const message = root.querySelector("#firebase-auth-message");

    button.disabled = true;
    message.textContent = "Signing out…";

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase sign-out failed:", error);
      message.textContent = "Could not sign out. Please try again.";
      button.disabled = false;
    }
  });
}

const root = getAuthRoot();

onAuthStateChanged(auth, (user) => {
  if (user) {
    renderSignedIn(root, user);
  } else {
    renderSignedOut(root);
  }

  window.dispatchEvent(
    new CustomEvent("firebase-auth-state-changed", {
      detail: { user: user || null },
    }),
  );
});

export { app, auth };
