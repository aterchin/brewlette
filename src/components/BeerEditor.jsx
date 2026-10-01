import { useState } from "react";
import BartenderControls from "./BartenderControls.jsx";
import BeerListWorkspace from "./BeerListWorkspace.jsx";
import GearIcon from "./GearIcon.jsx";
import MarqueeScan from "./MarqueeScan.jsx";

export default function BeerEditor({
  beers,
  onAdd,
  onUpdate,
  onDelete,
  onDeleteAll,
  onReplace,
  onReset,
  nextNumber,
  onClose,
  uid,
  userEmail,
  onSignOut,
}) {
  const [view, setView] = useState("list");

  if (view === "scan") {
    return (
      <MarqueeScan
        uid={uid}
        currentCount={beers.length}
        onBack={() => setView("controls")}
        onReplace={(next) => {
          onReplace(next);
          setView("list");
        }}
      />
    );
  }

  if (view === "controls") {
    return (
      <BartenderControls
        onBack={() => setView("list")}
        onScanMarquee={() => setView("scan")}
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
      onDeleteAll={onDeleteAll}
      onBack={onClose}
      backLabel="Back to wheel"
      topbarActions={
        <button
          type="button"
          className="beer-editor__gear"
          onClick={() => setView("controls")}
          aria-label="Controls"
          title="Controls"
        >
          <GearIcon size={26} />
        </button>
      }
    />
  );
}
