import { useState } from "react";
import BeerEditor from "./components/BeerEditor.jsx";
import BeerResult from "./components/BeerResult.jsx";
import BeerWheel from "./components/BeerWheel.jsx";
import EmptyState from "./components/EmptyState.jsx";
import Header from "./components/Header.jsx";
import { useBeerList } from "./hooks/useBeerList.js";

function App() {
  const {
    beers,
    addBeer,
    updateBeer,
    deleteBeer,
    resetToDefaults,
    nextNumber,
  } = useBeerList();

  const [mode, setMode] = useState("spin");
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

  function toggleMode() {
    if (spinning) return;
    setMode((current) => (current === "spin" ? "edit" : "spin"));
    setResult(null);
  }

  return (
    <div className="app-shell">
      <Header
        mode={mode}
        onToggleMode={toggleMode}
        disabled={spinning}
      />

      <main className="app-main">
        {mode === "edit" ? (
          <BeerEditor
            beers={beers}
            onAdd={addBeer}
            onUpdate={updateBeer}
            onDelete={deleteBeer}
            onReset={resetToDefaults}
            nextNumber={nextNumber}
          />
        ) : beers.length === 0 ? (
          <EmptyState onEdit={() => setMode("edit")} />
        ) : result ? (
          <BeerResult
            beer={result}
            onSpinAgain={handleSpinAgain}
          />
        ) : (
          <BeerWheel
            beers={beers}
            spinning={spinning}
            onSpinStart={handleSpinStart}
            onSpinComplete={handleSpinComplete}
            disabled={spinning}
          />
        )}
      </main>
    </div>
  );
}

export default App;
