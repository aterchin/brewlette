import { useState } from "react";
import BeerForm from "./BeerForm.jsx";
import "./BeerEditor.css";

export default function BeerEditor({
  beers,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
  onReset,
}) {
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const editingBeer = beers.find((beer) => beer.id === editingId) || null;

  return (
    <section className="beer-editor">
      <div className="beer-editor__intro">
        <h2>Beer list</h2>
        <p>{beers.length} beer{beers.length === 1 ? "" : "s"} on the wheel</p>
      </div>

      <ul className="beer-editor__list">
        {beers.map((beer, index) => (
          <li key={beer.id} className="beer-editor__item">
            <div className="beer-editor__info">
              <strong>{beer.name}</strong>
              <span>
                {[beer.brewery, beer.style].filter(Boolean).join(" · ") ||
                  "No details"}
              </span>
            </div>
            <div className="beer-editor__controls">
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => onMove(beer.id, "up")}
                disabled={index === 0}
                aria-label={`Move ${beer.name} up`}
              >
                Up
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => onMove(beer.id, "down")}
                disabled={index === beers.length - 1}
                aria-label={`Move ${beer.name} down`}
              >
                Down
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setShowAdd(false);
                  setEditingId(beer.id);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => {
                  if (window.confirm(`Remove ${beer.name}?`)) {
                    onDelete(beer.id);
                    if (editingId === beer.id) setEditingId(null);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingBeer && (
        <div className="beer-editor__panel">
          <h3>Edit beer</h3>
          <BeerForm
            initial={editingBeer}
            submitLabel="Save changes"
            onSubmit={(values) => {
              onUpdate(editingBeer.id, values);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {showAdd && !editingBeer && (
        <div className="beer-editor__panel">
          <h3>Add beer</h3>
          <BeerForm
            submitLabel="Add beer"
            onSubmit={(values) => {
              onAdd(values);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      <div className="beer-editor__footer">
        {!showAdd && !editingBeer && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAdd(true)}
          >
            Add beer
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            if (
              window.confirm(
                "Reset to the default beer list? This replaces your current list."
              )
            ) {
              onReset();
              setEditingId(null);
              setShowAdd(false);
            }
          }}
        >
          Reset to defaults
        </button>
      </div>
    </section>
  );
}
