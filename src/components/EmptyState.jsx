import "./EmptyState.css";

export default function EmptyState({ onEdit }) {
  return (
    <div className="empty-state">
      <h2 className="empty-state__title">No beers on the wheel.</h2>
      <p className="empty-state__copy">Add some beers to get started.</p>
      <button type="button" className="btn btn-primary" onClick={onEdit}>
        Edit beer list
      </button>
    </div>
  );
}
