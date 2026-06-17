import { signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebaseConfig";
import { API } from "./api";

// Logib Google'iga sisse, hangib backendilt JWT ja salvestab selle localStorage'i.
// Tagastab true õnnestumisel, false kui JWT-d ei õnnestunud hankida (sel juhul
// logitakse Firebase'ist välja, et seisund jääks järjekindlaks — ilma JWT-ta on
// kaitstud lehed kasutud). Kasutavad nii HomePage kui LoginPage, et login-loogika
// (sh JWT hankimine) oleks ühes kohas ega saaks kummalgi lehel ununeda.
export async function loginWithGoogleAndStoreJwt() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName,
    email: user.email,
    lastLogin: new Date()
  });

  const payload = JSON.stringify({
    firebaseUid: user.uid,
    email: user.email,
    name: user.displayName
  });

  // Render free-tier backend võib olla "unest ärkamas" (cold start, ~50s).
  // Proovi paar korda, et esimene aegunud päring sisselogimist ei katkestaks.
  let token = null;
  for (let attempt = 0; attempt < 2 && !token; attempt++) {
    try {
      const res = await fetch(`${API}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (res.ok) {
        const data = await res.json();
        token = data.token;
      }
    } catch {
      // võrguviga / cold start — proovime uuesti
    }
    if (!token && attempt === 0) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (!token) {
    await signOut(auth);
    return false;
  }

  localStorage.setItem('jwt', token);
  return true;
}
