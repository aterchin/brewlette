import { useEffect, useState } from "react";
import "./BeerForm.css";

const emptyForm = {
  number: "",
  name: "",
  brewery: "",
  style: "",
  abv: "",
  description: "",
  surprise: "",
};

export default function BeerForm({
  initial,
  onSubmit,
  onCancel,
  onDelete,
  onDraftChange,
  submitLabel,
  cancelLabel = "Cancel",
  deleteLabel = "Delete",
  usedNumbers = [],
  defaultNumber,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setForm({
        number: initial.number == null ? "" : String(initial.number),
        name: initial.name || "",
        brewery: initial.brewery || "",
        style: initial.style || "",
        abv: initial.abv == null ? "" : String(initial.abv),
        description: initial.description || "",
        surprise: initial.surprise || "",
      });
    } else {
      setForm({
        ...emptyForm,
        number: defaultNumber == null ? "" : String(defaultNumber),
      });
    }
    setError("");
  }, [initial, defaultNumber]);

  useEffect(() => {
    if (!onDraftChange) return;
    onDraftChange(form);
  }, [form, onDraftChange]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("Beer name is required.");
      return;
    }

    const slot = Number.parseInt(String(form.number).trim(), 10);
    if (!Number.isInteger(slot) || slot < 1) {
      setError("Number must be a whole number 1 or higher.");
      return;
    }

    if (usedNumbers.includes(slot)) {
      setError(`Number ${slot} is already used. Pick another.`);
      return;
    }

    let abv = null;
    if (form.abv.trim() !== "") {
      const parsed = Number.parseFloat(form.abv);
      if (!Number.isFinite(parsed)) {
        setError("ABV must be a number like 5.2 or 7.");
        return;
      }
      abv = parsed;
    }

    onSubmit({
      number: slot,
      name,
      brewery: form.brewery.trim(),
      style: form.style.trim(),
      abv,
      description: form.description.trim(),
      surprise: form.surprise.trim(),
    });

    if (!initial) {
      setForm({
        ...emptyForm,
        number: defaultNumber == null ? "" : String(defaultNumber),
      });
    }
    setError("");
  }

  return (
    <form className="beer-form" onSubmit={handleSubmit} noValidate>
      <Field
        label="Number"
        htmlFor="beer-number"
        required
        hint="Tap / slot number. Gaps are fine (e.g. skip 12)."
      >
        <input
          id="beer-number"
          name="number"
          value={form.number}
          onChange={handleChange}
          inputMode="numeric"
          autoComplete="off"
          required
        />
      </Field>

      <Field label="Beer name" htmlFor="beer-name" required>
        <input
          id="beer-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          autoComplete="off"
          required
        />
      </Field>

      <Field label="Brewery" htmlFor="beer-brewery">
        <input
          id="beer-brewery"
          name="brewery"
          value={form.brewery}
          onChange={handleChange}
          autoComplete="off"
        />
      </Field>

      <Field label="Style" htmlFor="beer-style">
        <input
          id="beer-style"
          name="style"
          value={form.style}
          onChange={handleChange}
          autoComplete="off"
        />
      </Field>

      <Field label="ABV" htmlFor="beer-abv" hint="Optional. Examples: 5.2, 7, 8.5">
        <input
          id="beer-abv"
          name="abv"
          value={form.abv}
          onChange={handleChange}
          inputMode="decimal"
          autoComplete="off"
        />
      </Field>

      <Field label="Description" htmlFor="beer-description">
        <textarea
          id="beer-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
      </Field>

      <Field label="Surprise message" htmlFor="beer-surprise">
        <textarea
          id="beer-surprise"
          name="surprise"
          value={form.surprise}
          onChange={handleChange}
          rows={2}
        />
      </Field>

      {error && <p className="beer-form__error" role="alert">{error}</p>}

      <div className="beer-form__actions">
        <button type="submit" className="btn btn-primary">
          {submitLabel || (initial ? "Save beer" : "Add beer")}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
        {onDelete && (
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            {deleteLabel}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, htmlFor, required, hint, children }) {
  return (
    <div className="beer-form__field">
      <label htmlFor={htmlFor}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="beer-form__hint">{hint}</p> : null}
    </div>
  );
}
