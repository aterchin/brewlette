import "./Header.css";

export default function Header({ mode, onToggleMode }) {
  return (
    <header className="app-header">
      <h1 className="brand">
        Brew<span>lette</span>
      </h1>
      <button
        type="button"
        className="header-edit"
        onClick={onToggleMode}
        aria-pressed={mode === "edit"}
      >
        {mode === "edit" ? "Back to wheel" : "Edit beer list"}
      </button>
    </header>
  );
}
