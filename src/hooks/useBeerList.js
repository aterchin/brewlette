import { useCallback, useState } from "react";
import {
  loadBeers,
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

function persist(next) {
  const sorted = sortByNumber(next);
  saveBeers(sorted);
  return sorted;
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

export function useBeerList() {
  const [beers, setBeers] = useState(() => loadBeers());

  const addBeer = useCallback((input) => {
    setBeers((current) => {
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
  }, []);

  const updateBeer = useCallback((id, input) => {
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
  }, []);

  const deleteBeer = useCallback((id) => {
    setBeers((current) => persist(current.filter((beer) => beer.id !== id)));
  }, []);

  const resetToDemo = useCallback(() => {
    const next = resetBeers();
    setBeers(normalizeBeerList(next));
  }, []);

  return {
    beers,
    addBeer,
    updateBeer,
    deleteBeer,
    resetToDemo,
    nextNumber: nextBeerNumber(beers),
  };
}

function parseAbv(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return null;
  return n;
}
