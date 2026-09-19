# Arabic Study — Reusable MD3 Hamburger Drawer

Use this package on any page in `arabic/`. It matches the shared Arabic Study MD3 palette, contains all drawer elements, supports Firebase auth injection, closes cleanly, and respects reduced-motion preferences.

## Why the current TTT implementation breaks

1. `firebase-auth.js` creates a sign-out button with an icon span plus a text span. Its existing markup can visually show `logoutLog out` when the page does not include the Material Symbols font/style contract. This template uses text-only auth styling that remains readable even if the icon font is unavailable.
2. The drawer must have a fixed backdrop, an off-canvas fixed panel, correct stacking levels, and a transition on both elements. A static `#firebase-auth` must be **inside** the drawer.
3. In the supplied TTT script, `readDrafts()` is asynchronous but is called synchronously inside `persist()`. Use `currentDrafts`, loaded once during rendering, rather than assigning a Promise as the draft object.
4. A failed chapter load is not a menu issue. It means `fetch(dataRoot + chapterRef.file)` failed, or the JSON parser/rendering later threw. The debugging block below preserves the actual error message instead of hiding it.

---

## 1. Head requirements

Put these inside `<head>` before the page stylesheet. The Material Symbols import is optional but recommended because `firebase-auth.js` uses the `logout` icon.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200&family=Noto+Sans+Arabic:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;800&display=swap" rel="stylesheet">
```

The Firebase auth script must still be imported as a module somewhere in the page:

```html
<script type="module">
  import "./firebase-auth.js";
</script>
```

If this page also needs Firestore helpers, combine that import with its existing module block instead of importing `firebase-auth.js` twice.

---

## 2. Add this CSS

Add all of the following to the page stylesheet. These styles assume the shared palette already exists; the fallback `:root` block makes the component portable.

```css
:root {
  --p:#6750a4;
  --pc:#e9ddff;
  --opc:#21005d;
  --s:#fffbfe;
  --sl:#f7f2fa;
  --sh:#ece6f0;
  --ink:#1c1b1f;
  --v:#49454f;
  --o:#79747e;
  --ov:#cac4d0;
}

html { scroll-behavior:smooth; }

body.drawer-open { overflow:hidden; }

.material-symbols-rounded {
  font-family:"Material Symbols Rounded";
  font-size:23px;
  line-height:1;
  font-weight:normal;
  font-style:normal;
  white-space:nowrap;
  font-variation-settings:"FILL" 0,"wght" 500,"GRAD" 0,"opsz" 24;
}

.icon {
  display:grid;
  place-items:center;
  width:46px;
  height:46px;
  padding:0;
  border:0;
  border-radius:50%;
  background:transparent;
  color:var(--v);
}

.icon:hover { background:rgb(29 27 32 / .08); }

.drawer-backdrop {
  position:fixed;
  inset:0;
  z-index:100;
  background:rgb(29 27 32 / .32);
  opacity:0;
  pointer-events:none;
  transition:opacity .22s ease;
}

.drawer-backdrop.open {
  opacity:1;
  pointer-events:auto;
}

.drawer {
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  z-index:101;
  display:flex;
  flex-direction:column;
  width:min(86vw,340px);
  padding:max(18px,env(safe-area-inset-top)) 16px max(24px,env(safe-area-inset-bottom));
  overflow-y:auto;
  background:var(--s);
  box-shadow:-8px 0 26px rgb(0 0 0 / .18);
  transform:translate3d(105%,0,0);
  visibility:hidden;
  will-change:transform;
  transition:transform .22s cubic-bezier(.2,0,0,1), visibility 0s linear .22s;
}

.drawer.open {
  transform:translate3d(0,0,0);
  visibility:visible;
  transition:transform .22s cubic-bezier(.2,0,0,1);
}

.drawer-head {
  display:flex;
  align-items:center;
  justify-content:space-between;
  min-height:56px;
  margin-bottom:16px;
}

.drawer-head strong { font-size:1.1rem; }

.drawer-links {
  display:grid;
  gap:8px;
}

.drawer-links a,
.drawer-item {
  display:flex;
  align-items:center;
  gap:14px;
  width:100%;
  min-height:54px;
  padding:0 14px;
  border:0;
  border-radius:16px;
  background:transparent;
  color:var(--ink);
  font:700 .95rem/1.2 "Noto Sans","Noto Sans Arabic",system-ui,sans-serif;
  text-align:left;
  text-decoration:none;
}

.drawer-links a:hover,
.drawer-item:hover { background:var(--sl); }

.drawer-links a[aria-current="page"] {
  background:var(--pc);
  color:var(--opc);
}

#firebase-auth {
  margin-top:auto;
  padding-top:16px;
}

.firebase-menu-divider {
  height:1px;
  margin:0 0 12px;
  background:var(--ov);
}

.firebase-google-mark {
  display:grid;
  place-items:center;
  flex:0 0 auto;
  width:24px;
  height:24px;
  border-radius:50%;
  background:#fff;
  color:#4285f4;
  font-weight:800;
}

.firebase-auth-message {
  display:block;
  padding:8px 14px 0;
  color:var(--v);
  font-size:.78rem;
}

:focus-visible {
  outline:3px solid var(--p);
  outline-offset:3px;
}

@media (prefers-reduced-motion:reduce) {
  html { scroll-behavior:auto; }
  .drawer,
  .drawer-backdrop {
    transition:none !important;
  }
}
```

---

## 3. Replace the page header

Use this header instead of page-specific top links. `menuButton` opens the drawer.

```html
<header class="top">
  <a class="brand" href="arabic.html" aria-label="Arabic Study home">
    <span class="mark" aria-hidden="true">ع</span>
    <span>
      <b>Arabic Study</b>
      <small>Listening &amp; transcription</small>
    </span>
  </a>

  <button
    id="menuButton"
    class="icon"
    type="button"
    aria-label="Open menu"
    aria-expanded="false"
    aria-controls="siteDrawer"
  >
    <span class="material-symbols-rounded" aria-hidden="true">menu</span>
  </button>
</header>
```

If the target page does not already style `.top`, `.brand`, `.mark`, and `.brand small`, add:

```css
.top {
  display:flex;
  align-items:center;
  justify-content:space-between;
  min-height:56px;
}

.brand {
  display:flex;
  align-items:center;
  gap:10px;
  color:var(--ink);
  text-decoration:none;
}

.brand > span:last-child { display:grid; }
.brand b { font-size:1rem; }
.brand small { color:var(--v); font-size:.78rem; }

.mark {
  display:grid;
  place-items:center;
  width:42px;
  height:42px;
  border-radius:14px;
  background:var(--pc);
  color:var(--opc);
  font:800 1.3rem "Noto Sans Arabic",sans-serif;
}
```

---

## 4. Add this markup immediately after `<body>`

Keep `#firebase-auth` inside the drawer. `firebase-auth.js` detects it and injects either the Google login button or logout button.

```html
<div id="drawerBackdrop" class="drawer-backdrop" aria-hidden="true"></div>

<aside
  id="siteDrawer"
  class="drawer"
  aria-label="Arabic Study navigation"
  aria-hidden="true"
  tabindex="-1"
>
  <div class="drawer-head">
    <strong>Arabic Study</strong>
    <button id="closeMenuButton" class="icon" type="button" aria-label="Close menu">
      <span class="material-symbols-rounded" aria-hidden="true">close</span>
    </button>
  </div>

  <nav class="drawer-links" aria-label="Primary navigation">
    <a href="arabic.html">Home</a>
    <a href="docs.html">Documentation</a>
    <a href="flashcards.html">Flashcards</a>
    <a href="quiz.html">Quiz</a>
    <a href="match.html">Match</a>
    <a href="ttt.html">TTT Listening</a>
  </nav>

  <div id="firebase-auth"></div>
</aside>
```

### Set the active page

On exactly one link for each page, add `aria-current="page"`.

```html
<a href="ttt.html" aria-current="page">TTT Listening</a>
```

Do not use two `#firebase-auth` elements. The drawer version is the only one needed.

---

## 5. Add this JavaScript

Put this in a normal `<script>` after the drawer markup, typically at the end of `<body>`. It provides smooth opening, overlay click closing, Escape closing, scroll locking, focus restoration, and keyboard focus containment.

```html
<script>
  (() => {
    const menuButton = document.querySelector("#menuButton");
    const closeButton = document.querySelector("#closeMenuButton");
    const drawer = document.querySelector("#siteDrawer");
    const backdrop = document.querySelector("#drawerBackdrop");

    if (!menuButton || !closeButton || !drawer || !backdrop) {
      console.warn("Drawer markup is incomplete.");
      return;
    }

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    function isOpen() {
      return drawer.classList.contains("open");
    }

    function setDrawer(open) {
      drawer.classList.toggle("open", open);
      backdrop.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      backdrop.setAttribute("aria-hidden", String(!open));
      menuButton.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("drawer-open", open);

      if (open) {
        requestAnimationFrame(() => closeButton.focus());
      } else {
        menuButton.focus();
      }
    }

    menuButton.addEventListener("click", () => setDrawer(true));
    closeButton.addEventListener("click", () => setDrawer(false));
    backdrop.addEventListener("click", () => setDrawer(false));

    drawer.addEventListener("click", event => {
      const link = event.target.closest("a[href]");
      if (link) setDrawer(false);
    });

    document.addEventListener("keydown", event => {
      if (!isOpen()) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setDrawer(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = [...drawer.querySelectorAll(focusableSelector)]
        .filter(element => !element.hidden && element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        drawer.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  })();
</script>
```

---

## 6. Firebase auth integration

Your existing `firebase-auth.js` already renders into `#firebase-auth`. For the logout icon to render correctly, maintain the Material Symbols stylesheet in Step 1.

If you prefer no icon dependency, change this line in `firebase-auth.js`:

```js
root.innerHTML = `<div class="firebase-menu-divider" role="separator"></div><button class="drawer-item firebase-logout" id="firebase-sign-out" type="button"><span class="material-symbols-rounded" aria-hidden="true">logout</span><span>Log out</span></button><span class="firebase-auth-message" id="firebase-auth-message" role="status"></span>`;
```

to:

```js
root.innerHTML = `<div class="firebase-menu-divider" role="separator"></div><button class="drawer-item firebase-logout" id="firebase-sign-out" type="button"><span>Log out</span></button><span class="firebase-auth-message" id="firebase-auth-message" role="status"></span>`;
```

That removes the `logoutLog out` visual failure regardless of font loading.

---

## 7. TTT loading repair

The hamburger menu does not cause the chapter error. In TTT, use this version of `loadChapter()` so the page reports the real fetch/JSON problem:

```js
async function loadChapter() {
  const unit = (manifest.units || []).find(u => u.id === unitSelect.value);
  const chapterRef = (unit?.chapters || []).find(ch => ch.id === chapterSelect.value);
  if (!unit || !chapterRef) return;

  window.TttCloudStore?.saveSelection(unit.id, chapterRef.id).catch(error => {
    console.warn("Could not save TTT selection:", error);
  });

  status.className = "notice";
  status.textContent = "Loading chapter…";
  activities.innerHTML = "";

  const chapterUrl = dataRoot + chapterRef.file;

  try {
    const response = await fetch(chapterUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${chapterUrl}`);

    const chapter = await response.json();
    if (!chapter || typeof chapter !== "object") {
      throw new Error(`Invalid chapter JSON: ${chapterUrl}`);
    }

    await renderChapter(chapter);
  } catch (error) {
    console.error("TTT chapter load failed:", error);
    status.className = "empty";
    status.textContent = `Could not load this chapter (${error.message}).`;
  }
}
```

Also repair the asynchronous draft issue. At the top level, use:

```js
let currentDrafts = {};
let saveTimer = null;
```

At the beginning of `renderChapter(chapter)`, use:

```js
async function renderChapter(chapter) {
  const drafts = await readDrafts(chapter);
  currentDrafts = structuredClone(drafts || {});
```

Inside the `persist` function, replace **both** of these incorrect patterns:

```js
const current = readDrafts(chapter);
const saved = card.querySelector(".saved");
saved.textContent = "Saved locally";
```

with:

```js
const current = currentDrafts;
```

Then update the relevant activity draft and call `saveDrafts(chapter, current)`. `saveDrafts()` should own the message, for example:

```js
async function saveDrafts(chapter, drafts) {
  currentDrafts = drafts;
  clearTimeout(saveTimer);

  saveTimer = setTimeout(async () => {
    try {
      const cloud = window.TttCloudStore;
      if (!cloud?.user) throw new Error("Sign in with Google to save progress.");
      await cloud.saveChapter(chapter.unitId, chapter.chapterId, currentDrafts);
      document.querySelectorAll(".saved").forEach(message => {
        message.textContent = "Saved to your Google account";
        clearTimeout(message.timer);
        message.timer = setTimeout(() => { message.textContent = ""; }, 1800);
      });
    } catch (error) {
      console.error("TTT cloud save failed:", error);
      document.querySelectorAll(".saved").forEach(message => {
        message.textContent = error.message || "Could not sync.";
      });
    }
  }, 650);
}
```

---

## Copy/paste checklist

- Include Material Symbols and Noto fonts in `<head>`.
- Add the CSS package once.
- Use the header in Step 3.
- Add exactly one backdrop, one drawer, and one `#firebase-auth` in Step 4.
- Mark the active navigation link with `aria-current="page"`.
- Import `firebase-auth.js` as a module.
- Add the drawer script after the drawer markup.
- Use the repaired TTT loader and `currentDrafts` flow when the page has cloud-backed answer saving.
- Confirm each `manifest.json` `file` value resolves relative to `arabic/data/ttt/`.
