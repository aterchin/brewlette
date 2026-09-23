import { useState } from "react";
import BartenderTab from "./components/BartenderTab.jsx";
import BartenderUnlock from "./components/BartenderUnlock.jsx";
import BeerEditor from "./components/BeerEditor.jsx";
import BeerResult from "./components/BeerResult.jsx";
import BeerWheel from "./components/BeerWheel.jsx";
import EmptyState from "./components/EmptyState.jsx";
import Header from "./components/Header.jsx";
import { useBeerList } from "./hooks/useBeerList.js";
import {
  checkPassword,
  isSessionUnlocked,
  savePassword,
} from "./utils/storage.js";

function App() {
  const {
    beers,
    addBeer,
    updateBeer,
    deleteBeer,
    resetToDemo,
    nextNumber,
  } = useBeerList();

  const [editOpen, setEditOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  function handleSpinStart() {
    setSpinning(true);
    setResult(null);
  }

  function handleSpinComplete(beer) {
    setSpinning(false);
    setResult(beer);
  }

  function handleSpinAgain() {
    setResult(null);
  }

  function openEditPage() {
    setEditOpen(true);
    setUnlockOpen(false);
    setResult(null);
  }

  function requestEdit() {
    if (spinning) return;
    if (editOpen) {
      setEditOpen(false);
      return;
    }
    if (isSessionUnlocked()) {
      openEditPage();
      return;
    }
    setUnlockOpen(true);
  }

  function closeEdit() {
    if (spinning) return;
    setEditOpen(false);
  }

  function handleChangePassword(current, next) {
    if (!checkPassword(current)) {
      return { ok: false, error: "Current password is wrong." };
    }
    const trimmed = typeof next === "string" ? next.trim() : "";
    if (trimmed === "") {
      return { ok: false, error: "New password can’t be empty." };
    }
    if (!savePassword(trimmed)) {
      return { ok: false, error: "Couldn’t save password." };
    }
    return { ok: true };
  }

  if (editOpen) {
    return (
      <div className="app-shell app-shell--edit-page">
        <BeerEditor
          beers={beers}
          onAdd={addBeer}
          onUpdate={updateBeer}
          onDelete={deleteBeer}
          onReset={resetToDemo}
          nextNumber={nextNumber}
          onClose={closeEdit}
          onChangePassword={handleChangePassword}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-game">
        <Header />

        <div className="app-body">
          <main className="app-main">
            {beers.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div
                  className="app-main__wheel"
                  hidden={Boolean(result)}
                  aria-hidden={result ? "true" : undefined}
                >
                  <BeerWheel
                    beers={beers}
                    spinning={spinning}
                    onSpinStart={handleSpinStart}
                    onSpinComplete={handleSpinComplete}
                    disabled={spinning}
                  />
                </div>
                {result ? (
                  <BeerResult beer={result} onSpinAgain={handleSpinAgain} />
                ) : null}
              </>
            )}
          </main>
        </div>
      </div>

      <BartenderTab
        editOpen={editOpen}
        onToggleEdit={requestEdit}
        disabled={spinning}
      />

      <BartenderUnlock
        open={unlockOpen}
        onUnlock={openEditPage}
        onCancel={() => setUnlockOpen(false)}
      />
    </div>
  );
}

export default App;
