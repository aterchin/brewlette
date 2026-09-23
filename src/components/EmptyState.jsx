import "./EmptyState.css";

export default function EmptyState() {
  return (
    <div className="empty-state">
      <h2 className="empty-state__title">No beers on the wheel.</h2>
      <p className="empty-state__copy">
        Ask the bartender to add some beers from the right edge.
      </p>
    </div>
  );
}
