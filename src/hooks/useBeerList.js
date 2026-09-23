import { useCallback, useState } from "react";
import { loadBeers, resetBeers, saveBeers } from "../utils/storage.js";

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
  saveBeers(next);
  return next;
}

export function useBeerList() {
  const [beers, setBeers] = useState(() => loadBeers());

  const addBeer = useCallback((input) => {
    setBeers((current) => {
      const beer = {
        id: createId(input.name),
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
      const next = current.map((beer) => {
        if (beer.id !== id) return beer;
        return {
          ...beer,
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

  const moveBeer = useCallback((id, direction) => {
    setBeers((current) => {
      const index = current.findIndex((beer) => beer.id === id);
      if (index < 0) return current;

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return persist(next);
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    const next = resetBeers();
    setBeers(next);
  }, []);

  return {
    beers,
    addBeer,
    updateBeer,
    deleteBeer,
    moveBeer,
    resetToDefaults,
  };
}

function parseAbv(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return null;
  return n;
}
