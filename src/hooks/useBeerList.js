import { useEffect, useState } from "react";
import { fetchBeerList, saveBeerList } from "../utils/beerListCloud.js";
import {
  loadBeers,
  MAX_BEERS,
  nextBeerNumber,
  normalizeBeerList,
  resetBeers,
  saveBeers,
  sortByNumber,
} from "../utils/storage.js";

function createId(name) {
  const slug = String(name || "beer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slug || "beer"}-${suffix}`;
}

function parseSlotNumber(value) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseInt(value, 10);
    if (Number.isInteger(n) && n >= 1) return n;
  }
  return null;
}

function parseAbv(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * @param {import("firebase/auth").User | null} user - signed-in bartender, or null in Spin Mode
 */
export function useBeerList(user) {
  const [beers, setBeers] = useState(() => loadBeers());
  const uid = user?.uid ?? null;

  // Bartender signed in → load their cloud list onto this device.
  useEffect(() => {
    if (!uid) return;

    let cancelled = false;

    fetchBeerList(uid)
      .then((remote) => {
        if (cancelled || !remote || remote.length === 0) return;
        saveBeers(remote);
        setBeers(remote);
      })
      .catch(() => {
        // Offline / rules / missing doc — keep whatever is in localStorage.
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Always write localStorage; also write Firestore when signed in.
  function persist(next) {
    const sorted = sortByNumber(next).slice(0, MAX_BEERS);
    saveBeers(sorted);
    if (uid) {
      saveBeerList(uid, sorted).catch(() => {});
    }
    return sorted;
  }

  function addBeer(input) {
    setBeers((current) => {
      if (current.length >= MAX_BEERS) return current;

      const slot = parseSlotNumber(input.number) ?? nextBeerNumber(current);
      if (current.some((beer) => beer.number === slot)) {
        return current;
      }

      const beer = {
        id: createId(input.name),
        number: slot,
        name: String(input.name || "").trim(),
        brewery: String(input.brewery || "").trim(),
        style: String(input.style || "").trim(),
        abv: parseAbv(input.abv),
        description: String(input.description || "").trim(),
        surprise: String(input.surprise || "").trim(),
      };

      if (!beer.name) return current;
      return persist([...current, beer]);
    });
  }

  function updateBeer(id, input) {
    setBeers((current) => {
      const existing = current.find((beer) => beer.id === id);
      if (!existing) return current;

      const slot =
        input.number !== undefined
          ? parseSlotNumber(input.number)
          : existing.number;
      if (slot == null) return current;

      if (current.some((beer) => beer.id !== id && beer.number === slot)) {
        return current;
      }

      const next = current.map((beer) => {
        if (beer.id !== id) return beer;
        return {
          ...beer,
          number: slot,
          name: String(input.name ?? beer.name).trim(),
          brewery: String(input.brewery ?? beer.brewery).trim(),
          style: String(input.style ?? beer.style).trim(),
          abv: parseAbv(input.abv !== undefined ? input.abv : beer.abv),
          description: String(input.description ?? beer.description).trim(),
          surprise: String(input.surprise ?? beer.surprise).trim(),
        };
      });

      const updated = next.find((b) => b.id === id);
      if (updated && !updated.name) return current;
      return persist(next);
    });
  }

  function deleteBeer(id) {
    setBeers((current) => persist(current.filter((beer) => beer.id !== id)));
  }

  function resetToDemo() {
    const next = normalizeBeerList(resetBeers());
    setBeers(next);
    if (uid) {
      saveBeerList(uid, next).catch(() => {});
    }
  }

  return {
    beers,
    addBeer,
    updateBeer,
    deleteBeer,
    resetToDemo,
    nextNumber: nextBeerNumber(beers),
  };
}
