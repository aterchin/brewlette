import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { normalizeBeerList } from "./storage.js";

/**
 * Load one bartender's beer list: beer_lists/{uid}
 * Returns null if the doc is missing.
 */
export async function fetchBeerList(uid) {
  const snap = await getDoc(doc(db, "beer_lists", uid));
  if (!snap.exists()) return null;
  return normalizeBeerList(snap.data().beers ?? []);
}

/**
 * Save one bartender's beer list: beer_lists/{uid}
 */
export async function saveBeerList(uid, beers) {
  await setDoc(doc(db, "beer_lists", uid), {
    userId: uid,
    updatedAt: serverTimestamp(),
    beers: normalizeBeerList(beers),
  });
}
