import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../firebase.js";

const googleProvider = new GoogleAuthProvider();

/** Firebase Auth state + sign-in helpers for the bartender Edit gate. */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  async function signIn(email, password) {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { user, loading, signIn, signInWithGoogle, signOut };
}
