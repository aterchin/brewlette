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
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20 12H5M11 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
