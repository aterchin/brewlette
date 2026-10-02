import { useState } from "react";
import BackButton from "./BackButton.jsx";
import BeerForm from "./BeerForm.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { MAX_BEERS } from "../utils/storage.js";
import "./BeerEditor.css";

/**
 * Beer list page; picking a beer (or Add) swaps in a full-screen form.
 */
export default function BeerListWorkspace({
  title,
  subtitle,
  beers,
  nextNumber,
  onAdd,
  onUpdate,
  onDelete,
  onDeleteAll,
  topbarActions,
  onBack,
  backLabel = "Back",
  emptyListCopy,
}) {
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const editingBeer = beers.find((beer) => beer.id === editingId) || null;
  const isFormOpen = Boolean(editingBeer) || showAdd;
  const isListFull = beers.length >= MAX_BEERS;

  const usedNumbers = beers
    .filter((beer) => !editingBeer || beer.id !== editingBeer.id)
    .map((beer) => beer.number);

  function closeForm() {
    setEditingId(null);
    setShowAdd(false);
  }

  function selectBeer(id) {
    setShowAdd(false);
    setEditingId(id);
    window.scrollTo(0, 0);
  }

  function startAdd() {
    setEditingId(null);
    setShowAdd(true);
    window.scrollTo(0, 0);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setPendingDelete(null);
    closeForm();
  }

  return (
    <section className="beer-editor" aria-label={title}>
      {isFormOpen ? (
        <div className="beer-editor__panel">
          <BeerForm
            key={editingBeer ? editingBeer.id : "add"}
            title={editingBeer ? "Edit" : "Add"}
            initial={editingBeer || undefined}
            defaultNumber={editingBeer ? undefined : nextNumber}
            usedNumbers={usedNumbers}
            submitLabel={editingBeer ? "Save changes" : "Add beer"}
            cancelLabel="Cancel"
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
              editingBeer ? () => setPendingDelete(editingBeer) : undefined
            }
          />
        </div>
      ) : (
        <>
          <header className="beer-editor__topbar">
            {onBack ? <BackButton onClick={onBack} label={backLabel} /> : null}
            <div className="beer-editor__topbar-copy">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            {topbarActions ? (
              <div className="beer-editor__topbar-actions">{topbarActions}</div>
            ) : null}
          </header>

          <div className="beer-editor__list">
            <div className="beer-editor__list-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={startAdd}
                disabled={isListFull}
                aria-describedby={isListFull ? "beer-list-full" : undefined}
              >
                Add beer
              </button>
              {isListFull ? (
                <p id="beer-list-full" className="beer-editor__limit">
                  List is full ({MAX_BEERS} max). Delete a beer to add another.
                </p>
              ) : null}
            </div>

            <ul className="beer-editor__nav">
              {beers.length === 0 ? (
                <li className="beer-editor__nav-empty">
                  <p>{emptyListCopy || "No beers yet. Add one to get started."}</p>
                </li>
              ) : null}

              {beers.map((beer) => (
                <li key={beer.id}>
                  <button
                    type="button"
                    className="beer-editor__nav-item"
                    onClick={() => selectBeer(beer.id)}
                  >
                    <span className="beer-editor__nav-number" aria-hidden="true">
                      #{beer.number}
                    </span>
                    <span className="beer-editor__nav-copy">
                      <strong>
                        <span className="visually-hidden">
                          Number {beer.number}.{" "}
                        </span>
                        {beer.name}
                      </strong>
                      <span>
                        {[beer.brewery, beer.style]
                          .filter(Boolean)
                          .join(" · ") || "No details"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {onDeleteAll && beers.length > 0 ? (
              <button
                type="button"
                className="btn btn-danger beer-editor__delete-all"
                onClick={() => setDeleteAllOpen(true)}
              >
                Delete all beers
              </button>
            ) : null}
          </div>
        </>
      )}

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
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={deleteAllOpen}
        title="Delete all beers?"
        message={`Remove all ${beers.length} beer${beers.length === 1 ? "" : "s"} from your list? This can't be undone.`}
        confirmLabel="Delete all"
        onConfirm={() => {
          onDeleteAll();
          setDeleteAllOpen(false);
        }}
        onCancel={() => setDeleteAllOpen(false)}
      />
    </section>
  );
}
