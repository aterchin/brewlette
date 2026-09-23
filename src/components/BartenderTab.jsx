import "./BartenderTab.css";

/**
 * Subtle right-edge entry for bartenders — outside the game column.
 */
export default function BartenderTab({
  editOpen = false,
  onToggleEdit,
  disabled = false,
}) {
  if (editOpen) return null;

  return (
    <button
      type="button"
      className="bartender-tab"
      onClick={onToggleEdit}
      disabled={disabled}
      aria-label="Edit beer list"
      title="Edit beer list"
    >
      <span className="bartender-tab__label">Edit beer list</span>
    </button>
  );
}
