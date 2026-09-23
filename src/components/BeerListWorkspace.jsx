import { useCallback, useState } from "react";
import BeerForm from "./BeerForm.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import "./BeerEditor.css";

/**
 * Sticky list + form workspace shared by the live beer list and default-list editor.
 */
export default function BeerListWorkspace({
  title,
  subtitle,
  beers,
  nextNumber,
  onAdd,
  onUpdate,
  onDelete,
  topbarActions,
  idleTitle = "Pick a beer",
  idleCopy = "Select a beer from the list to edit it, or add a new one. The list updates as you type.",
  emptyListCopy,
}) {
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

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

  function requestDelete(beer) {
    setPendingDelete(beer);
  }

  function cancelDelete() {
    setPendingDelete(null);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setPendingDelete(null);
    closeForm();
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

  return (
    <section className="beer-editor" aria-label={title}>
      <header className="beer-editor__topbar">
        <div className="beer-editor__topbar-copy">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {topbarActions ? (
          <div className="beer-editor__topbar-actions">{topbarActions}</div>
        ) : null}
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
            {beers.length === 0 && !addPreview ? (
              <li className="beer-editor__nav-empty">
                <p>{emptyListCopy || "No beers yet. Add one to get started."}</p>
              </li>
            ) : null}

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
                  } else {
                    onAdd(values);
                  }
                  closeForm();
                }}
                onCancel={closeForm}
                onDelete={
                  editingBeer ? () => requestDelete(editingBeer) : undefined
                }
              />
            </div>
          ) : (
            <div className="beer-editor__idle">
              <h3>{idleTitle}</h3>
              <p>{idleCopy}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove beer?"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.name} from the list?`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </section>
  );
}
