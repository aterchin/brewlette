import { useState } from "react";
import BartenderControls from "./BartenderControls.jsx";
import BeerListWorkspace from "./BeerListWorkspace.jsx";

export default function BeerEditor({
  beers,
  onAdd,
  onUpdate,
  onDelete,
  onReset,
  nextNumber,
  onClose,
  userEmail,
  onSignOut,
}) {
  const [view, setView] = useState("list");

  if (view === "controls") {
    return (
      <BartenderControls
        onBack={() => setView("list")}
        onReset={onReset}
        userEmail={userEmail}
        onSignOut={onSignOut}
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
            onClick={() => setView("controls")}
          >
            Controls
          </button>
        </>
      }
    />
  );
}
