import "./IconButton.css";

/** Square icon-only button. Variants: save | cancel | delete. `icon` is a Lucide icon component. */
export default function IconButton({
  label,
  variant,
  icon: Icon,
  type = "button",
  onClick,
  disabled,
  className = "",
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
      <Icon size={24} strokeWidth={2.75} aria-hidden="true" focusable="false" />
    </button>
  );
}
