import "./IconButton.css";

/** Square icon-only button. Variants: save | cancel | delete. Children are SVG paths. */
export default function IconButton({
  label,
  variant,
  type = "button",
  onClick,
  disabled,
  className = "",
  children,
}) {
  return (
    <button
      type={type}
      className={`icon-btn icon-btn--${variant} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    </button>
  );
}