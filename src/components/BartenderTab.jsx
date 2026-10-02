import { Settings } from "lucide-react";
import "./BartenderTab.css";

/**
 * Subtle bottom-right gear entry for bartenders — outside the game column.
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
      <Settings
        className="bartender-tab__icon"
        size={22}
        strokeWidth={2.5}
        aria-hidden="true"
        focusable="false"
      />
    </button>
  );
}
