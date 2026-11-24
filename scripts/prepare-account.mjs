import { readFile, writeFile } from 'node:fs/promises';
for (const file of ['arabic/theme.js', 'arabic/pill-nav.js']) {
  let text = await readFile(file, 'utf8');
  if (!text.includes('account-profile.js')) {
    text = `(() => { const base = document.currentScript.src; import(new URL('./account-profile.js', base).href).catch(error => console.error('Account card could not load:', error)); })();\n` + text;
    await writeFile(file, text);
  }
}
const file = 'arabic/firebase-auth.js';
let text = await readFile(file, 'utf8');
if (!text.includes('itp_support: true')) {
  if (!text.includes('auto_select: false,')) throw new Error('One Tap configuration changed');
  text = text.replace('auto_select: false,', 'auto_select: false,\n        itp_support: true,');
}
if (!text.includes('FursaAccountAuth')) {
  text += `
// Shared card and drawer use the same authentication operations.
window.FursaAccountAuth = {
  async signIn() {
    if (interactiveSignIn) return;
    interactiveSignIn = true;
    window.google?.accounts?.id?.cancel();
    try { await signInWithPopup(auth, provider); setOneTapSuppressed(false); }
    finally { interactiveSignIn = false; }
  },
  async signOut() {
    const previous = suppressOneTap;
    setOneTapSuppressed(true);
    window.google?.accounts?.id?.cancel();
    window.google?.accounts?.id?.disableAutoSelect();
    try { await signOut(auth); }
    catch (error) { setOneTapSuppressed(previous); throw error; }
  }
};
`;
}
await writeFile(file, text);
console.log('Prepared shared account card integration and explicit One Tap ITP support.');
