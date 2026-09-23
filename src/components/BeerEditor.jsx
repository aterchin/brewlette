import { useState } from "react";
import {
  cloneBuiltInDefaults,
  loadCustomDefaults,
  nextBeerNumber,
  saveCustomDefaults,
  sortByNumber,
} from "../utils/storage.js";
import BartenderControls from "./BartenderControls.jsx";
import BeerListWorkspace from "./BeerListWorkspace.jsx";

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

function applyAdd(current, input) {
  const slot = parseSlotNumber(input.number) ?? nextBeerNumber(current);
  if (current.some((beer) => beer.number === slot)) return current;

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
  return sortByNumber([...current, beer]);
}

function applyUpdate(current, id, input) {
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
  return sortByNumber(next);
}

function persistDefaults(next) {
  saveCustomDefaults(next);
  return next;
}

export default function BeerEditor({
  beers,
  onAdd,
  onUpdate,
  onDelete,
  onReset,
  nextNumber,
  onClose,
  onChangePassword,
}) {
  const [view, setView] = useState("list");
  const [defaultDraft, setDefaultDraft] = useState([]);

  function openControls() {
    setView("controls");
  }

  function openDefaultEditor() {
    // Edit what Reset currently uses: custom if set, else built-in tap list.
    setDefaultDraft(loadCustomDefaults() ?? cloneBuiltInDefaults());
    setView("defaults");
  }

  if (view === "controls") {
    return (
      <BartenderControls
        onBack={() => setView("list")}
        onReset={onReset}
        onChangePassword={onChangePassword}
        onSetDefaultList={openDefaultEditor}
      />
    );
  }

  if (view === "defaults") {
    const count = defaultDraft.length;
    return (
      <BeerListWorkspace
        title="Default beer list"
        subtitle={`${count} beer${count === 1 ? "" : "s"} · saved for reset`}
        beers={defaultDraft}
        nextNumber={nextBeerNumber(defaultDraft)}
        onAdd={(values) => {
          setDefaultDraft((current) => persistDefaults(applyAdd(current, values)));
        }}
        onUpdate={(id, values) => {
          setDefaultDraft((current) =>
            persistDefaults(applyUpdate(current, id, values))
          );
        }}
        onDelete={(id) => {
          setDefaultDraft((current) =>
            persistDefaults(
              sortByNumber(current.filter((beer) => beer.id !== id))
            )
          );
        }}
        idleTitle="Add as many beers as you have taps"
        idleCopy="This is saved so you can reset to this list at any time."
        emptyListCopy="No default beers yet — add one to get started."
        topbarActions={
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setView("controls")}
          >
            Controls
          </button>
        }
      />
    );
  }

  return (
    <BeerListWorkspace
      title="Beer list"
      subtitle={`${beers.length} beer${beers.length === 1 ? "" : "s"} on the wheel`}
      beers={beers}
      nextNumber={nextNumber}
      onAdd={onAdd}
      onUpdate={onUpdate}
      onDelete={onDelete}
      topbarActions={
        <>
          {onClose ? (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={onClose}
            >
              Back to wheel
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={openControls}
          >
            Controls
          </button>
        </>
      }
    />
  );
}
