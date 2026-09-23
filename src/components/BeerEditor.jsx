import { useState } from "react";
import BeerForm from "./BeerForm.jsx";
import "./BeerEditor.css";

export default function BeerEditor({
  beers,
  onAdd,
  onUpdate,
  onDelete,
  onReset,
  nextNumber,
}) {
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const editingBeer = beers.find((beer) => beer.id === editingId) || null;
  const isFormOpen = Boolean(editingBeer) || showAdd;

  const usedNumbers = beers
    .filter((beer) => !editingBeer || beer.id !== editingBeer.id)
    .map((beer) => beer.number);

  function closeForm() {
    setEditingId(null);
    setShowAdd(false);
  }

  if (isFormOpen) {
    return (
      <section className="beer-editor beer-editor--form">
        <div className="beer-editor__panel">
          <h2>{editingBeer ? "Edit beer" : "Add beer"}</h2>
          <BeerForm
            initial={editingBeer || undefined}
            defaultNumber={editingBeer ? undefined : nextNumber}
            usedNumbers={usedNumbers}
            submitLabel={editingBeer ? "Save changes" : "Add beer"}
            cancelLabel="Back to list"
            onSubmit={(values) => {
              if (editingBeer) {
                onUpdate(editingBeer.id, values);
              } else {
                onAdd(values);
              }
              closeForm();
            }}
            onCancel={closeForm}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="beer-editor">
      <div className="beer-editor__intro">
        <h2>Beer list</h2>
        <p>{beers.length} beer{beers.length === 1 ? "" : "s"} on the wheel</p>
      </div>

      <ul className="beer-editor__list">
        {beers.map((beer) => (
          <li key={beer.id} className="beer-editor__item">
            <div className="beer-editor__info">
              <span className="beer-editor__number" aria-hidden="true">
                #{beer.number}
              </span>
              <div className="beer-editor__copy">
                <strong>
                  <span className="visually-hidden">Number {beer.number}. </span>
                  {beer.name}
                </strong>
                <span>
                  {[beer.brewery, beer.style].filter(Boolean).join(" · ") ||
                    "No details"}
                </span>
              </div>
            </div>
            <div className="beer-editor__controls">
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
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="beer-editor__footer">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setShowAdd(true);
          }}
        >
          Add beer
        </button>
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
              closeForm();
            }
          }}
        >
          Reset to defaults
        </button>
      </div>
    </section>
  );
}
