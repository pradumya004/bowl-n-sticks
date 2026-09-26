// The option form fields, shared by the add + edit forms so they can't drift.
const PRICE_MODES = [
  { value: "delta", label: "Add on top" },
  { value: "absolute", label: "Fixed price" },
];

export default function OptionFields({ option }) {
  return (
    <>
      <label className="admin-field">
        <span>Label</span>
        <input
          name="label"
          required
          maxLength={80}
          defaultValue={option?.label ?? ""}
          placeholder="e.g. Make it Cheese Pizza"
        />
      </label>

      <label className="admin-field">
        <span>Price</span>
        <input
          name="price"
          type="number"
          min="0"
          step="1"
          defaultValue={option?.price ?? 0}
        />
      </label>

      <fieldset className="admin-field seg-field">
        <legend>Price works as</legend>
        <div className="seg-row">
          {PRICE_MODES.map((mode) => (
            <label key={mode.value} className="seg-opt">
              <input
                type="radio"
                name="price_mode"
                value={mode.value}
                defaultChecked={
                  ((option?.is_delta ?? true) ? "delta" : "absolute") ===
                  mode.value
                }
              />
              <span className="seg-face">{mode.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}