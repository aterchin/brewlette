function App() {
  return (
    <div className="app-shell">
      <header>
        <h1 className="brand">
          Brew<span>lette</span>
        </h1>
      </header>
      <main className="app-main">
        <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>
          Pick a beer. Spin the thing. See what happens.
        </p>
      </main>
    </div>
  );
}

export default App;
