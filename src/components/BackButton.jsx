import { ArrowLeft } from "lucide-react";
import "./BackButton.css";

export default function BackButton({ onClick, label }) {
  return (
    <button
      type="button"
      className="back-btn"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <ArrowLeft size={26} strokeWidth={2.75} aria-hidden="true" focusable="false" />
    </button>
  );
}
