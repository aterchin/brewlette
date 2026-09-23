import { useCallback, useState } from "react";
import BartenderControls from "./BartenderControls.jsx";
import BeerForm from "./BeerForm.jsx";
import "./BeerEditor.css";

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
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(null);

  const editingBeer = beers.find((beer) => beer.id === editingId) || null;
  const isFormOpen = Boolean(editingBeer) || showAdd;

  const usedNumbers = beers
    .filter((beer) => !editingBeer || beer.id !== editingBeer.id)
    .map((beer) => beer.number);

  const handleDraftChange = useCallback((nextDraft) => {
    setDraft(nextDraft);
  }, []);

  function closeForm() {
    setEditingId(null);
    setShowAdd(false);
    setDraft(null);
  }

  function selectBeer(id) {
    setShowAdd(false);
    setEditingId(id);
    setDraft(null);
  }

  function startAdd() {
    setEditingId(null);
    setShowAdd(true);
    setDraft(null);
  }

  function openControls() {
    closeForm();
    setView("controls");
  }

  function displayForBeer(beer) {
    if (editingBeer && beer.id === editingBeer.id && draft) {
      const number =
        draft.number?.trim() !== "" ? draft.number.trim() : beer.number;
      const name = draft.name?.trim() !== "" ? draft.name.trim() : beer.name;
      const brewery =
        draft.brewery != null ? draft.brewery.trim() : beer.brewery;
      const style = draft.style != null ? draft.style.trim() : beer.style;
      return { number, name, brewery, style };
    }
    return {
      number: beer.number,
      name: beer.name,
      brewery: beer.brewery,
      style: beer.style,
    };
  }

  const addPreview =
    showAdd && draft
      ? {
          number: draft.number?.trim() || nextNumber,
          name: draft.name?.trim() || "New beer",
          brewery: draft.brewery?.trim() || "",
          style: draft.style?.trim() || "",
        }
      : null;

  if (view === "controls") {
    return (
      <BartenderControls
        onBack={() => setView("list")}
        onReset={onReset}
        onChangePassword={onChangePassword}
      />
    );
  }

  return (
    <section className="beer-editor" aria-label="Beer list editor">
      <header className="beer-editor__topbar">
        <div className="beer-editor__topbar-copy">
          <h2>Beer list</h2>
          <p>
            {beers.length} beer{beers.length === 1 ? "" : "s"} on the wheel
          </p>
        </div>
        <div className="beer-editor__topbar-actions">
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
        </div>
      </header>

      <div className="beer-editor__workspace">
        <aside className="beer-editor__sidebar">
          <div className="beer-editor__sidebar-actions">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={startAdd}
              aria-pressed={showAdd}
            >
              Add beer
            </button>
          </div>

          <ul className="beer-editor__nav">
            {beers.map((beer) => {
              const display = displayForBeer(beer);
              const selected = editingBeer?.id === beer.id;
              return (
                <li key={beer.id}>
                  <button
                    type="button"
                    className={`beer-editor__nav-item${selected ? " beer-editor__nav-item--selected" : ""}`}
                    onClick={() => selectBeer(beer.id)}
                    aria-current={selected ? "true" : undefined}
                  >
                    <span className="beer-editor__nav-number" aria-hidden="true">
                      #{display.number}
                    </span>
                    <span className="beer-editor__nav-copy">
                      <strong>
                        <span className="visually-hidden">
                          Number {display.number}.{" "}
                        </span>
                        {display.name}
                      </strong>
                      <span>
                        {[display.brewery, display.style]
                          .filter(Boolean)
                          .join(" · ") || "No details"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}

            {addPreview ? (
              <li>
                <div
                  className="beer-editor__nav-item beer-editor__nav-item--selected beer-editor__nav-item--draft"
                  aria-current="true"
                >
                  <span className="beer-editor__nav-number" aria-hidden="true">
                    #{addPreview.number}
                  </span>
                  <span className="beer-editor__nav-copy">
                    <strong>{addPreview.name}</strong>
                    <span>
                      {[addPreview.brewery, addPreview.style]
                        .filter(Boolean)
                        .join(" · ") || "Draft"}
                    </span>
                  </span>
                </div>
              </li>
            ) : null}
          </ul>
        </aside>

        <div className="beer-editor__detail">
          {isFormOpen ? (
            <div className="beer-editor__panel">
              <h3>{editingBeer ? "Edit beer" : "Add beer"}</h3>
              <BeerForm
                key={editingBeer ? editingBeer.id : "add"}
                initial={editingBeer || undefined}
                defaultNumber={editingBeer ? undefined : nextNumber}
                usedNumbers={usedNumbers}
                submitLabel={editingBeer ? "Save changes" : "Add beer"}
                cancelLabel="Cancel"
                onDraftChange={handleDraftChange}
                onSubmit={(values) => {
                  if (editingBeer) {
                    onUpdate(editingBeer.id, values);
                    setDraft(null);
                  } else {
                    onAdd(values);
                    closeForm();
                  }
                }}
                onCancel={closeForm}
                onDelete={
                  editingBeer
                    ? () => {
                        if (window.confirm(`Remove ${editingBeer.name}?`)) {
                          onDelete(editingBeer.id);
                          closeForm();
                        }
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="beer-editor__idle">
              <h3>Pick a beer</h3>
              <p>
                Select a beer from the list to edit it, or add a new one. The
                list updates as you type.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
