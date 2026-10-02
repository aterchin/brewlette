import { Settings } from "lucide-react";
import Tip from "./Tip.jsx";
import "./BartenderTab.css";

/**
 * Subtle bottom-right gear entry for bartenders — outside the game column.
 * `showTip` adds a one-time bubble so new bartenders can find it.
 */
export default function BartenderTab({
  editOpen = false,
  onToggleEdit,
  disabled = false,
  showTip = false,
  onDismissTip,
}) {
  if (editOpen) return null;

  return (
    <>
      {showTip ? (
        <Tip className="bartender-tab__tip" placement="above" onDismiss={onDismissTip}>
          Bartender? Load your tap list here.
        </Tip>
      ) : null}
      <button
        type="button"
        className={`bartender-tab${showTip ? " bartender-tab--tip" : ""}`}
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
    </>
  );
}
