import { useState } from "react";
import BartenderTab from "./components/BartenderTab.jsx";
import BartenderUnlock from "./components/BartenderUnlock.jsx";
import BeerEditor from "./components/BeerEditor.jsx";
import BeerResult from "./components/BeerResult.jsx";
import BeerWheel from "./components/BeerWheel.jsx";
import EmptyState from "./components/EmptyState.jsx";
import Header from "./components/Header.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useBeerList } from "./hooks/useBeerList.js";

function App() {
  const {
    beers,
    addBeer,
    updateBeer,
    deleteBeer,
    resetToDemo,
    nextNumber,
  } = useBeerList();
  const { user, loading: authLoading, signIn, signInWithGoogle, signOut } =
    useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const showEdit = Boolean(user) && editOpen;

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
    if (spinning || authLoading) return;
    if (showEdit) {
      setEditOpen(false);
      return;
    }
    if (user) {
      openEditPage();
      return;
    }
    setUnlockOpen(true);
  }

  function closeEdit() {
    if (spinning) return;
    setEditOpen(false);
  }

  async function handleSignIn(email, password) {
    await signIn(email, password);
    openEditPage();
  }

  async function handleSignInGoogle() {
    await signInWithGoogle();
    openEditPage();
  }

  async function handleSignOut() {
    await signOut();
    setEditOpen(false);
    setUnlockOpen(false);
  }

  if (showEdit) {
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
          userEmail={user.email}
          onSignOut={handleSignOut}
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
        editOpen={showEdit}
        onToggleEdit={requestEdit}
        disabled={spinning || authLoading}
      />

      <BartenderUnlock
        open={unlockOpen}
        onSignIn={handleSignIn}
        onSignInGoogle={handleSignInGoogle}
        onCancel={() => setUnlockOpen(false)}
      />
    </div>
  );
}

export default App;
