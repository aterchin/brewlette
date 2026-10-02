import { useState } from "react";
import BartenderHome from "./BartenderHome.jsx";
import BeerListWorkspace from "./BeerListWorkspace.jsx";
import MarqueeScan from "./MarqueeScan.jsx";
import ScanDone from "./ScanDone.jsx";

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
  const [view, setView] = useState("home"); // home | list | scan | done

  if (view === "scan") {
    return (
      <MarqueeScan
        uid={uid}
        currentCount={beers.length}
        onBack={() => setView("home")}
        onReplace={(next) => {
          onReplace(next);
          setView("done");
        }}
      />
    );
  }

  if (view === "done") {
    return (
      <ScanDone
        count={beers.length}
        onSpin={onClose}
        onOpenList={() => setView("list")}
      />
    );
  }

  if (view === "list") {
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
        onBack={() => setView("home")}
        backLabel="Back"
      />
    );
  }

  return (
    <BartenderHome
      beerCount={beers.length}
      onBack={onClose}
      onScanMarquee={() => setView("scan")}
      onOpenList={() => setView("list")}
      onReset={onReset}
      userEmail={userEmail}
      onSignOut={onSignOut}
    />
  );
}
