import SpicyMark from "@/components/ui/SpicyMark";

const DIET_TYPES = [
  { value: "veg", label: "Veg" },
  { value: "egg", label: "Egg" },
  { value: "nonveg", label: "Non-veg" },
];

// The dish form fields, shared by the Add and Edit modals so they can't drift.
export default function ItemFields({ item }) {
  return (
    <>
      <label className="admin-field">
        <span>Name</span>
        <input
          name="name"
          required
          maxLength={80}
          defaultValue={item?.name ?? ""}
          placeholder="e.g. Chicken Ramen"
        />
      </label>

      <label className="admin-field">
        <span>
          Description <em>(optional)</em>
        </span>
        <textarea
          name="description"
          rows={2}
          maxLength={200}
          defaultValue={item?.description ?? ""}
        />
      </label>

      <div className="admin-row2">
        <label className="admin-field">
          <span>
            Price <em>(blank = MRP)</em>
          </span>
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            defaultValue={item?.price ?? ""}
          />
        </label>
        <label className="admin-field">
          <span>
            Protein <em>(g, optional)</em>
          </span>
          <input
            name="protein_g"
            type="number"
            min="0"
            step="1"
            defaultValue={item?.protein_g ?? ""}
          />
        </label>
      </div>

      {/* Segmented control instead of a <select>: the native dropdown is drawn by
          the OS and can't be styled, and three options don't need a menu. */}
      <fieldset className="admin-field seg-field">
        <legend>Diet type</legend>
        <div className="seg-row">
          {DIET_TYPES.map((diet) => (
            <label key={diet.value} className="seg-opt">
              <input
                type="radio"
                name="diet_type"
                value={diet.value}
                defaultChecked={(item?.diet_type ?? "veg") === diet.value}
              />
              <span className="seg-face">
                <span className={`diet ${diet.value}`} aria-hidden="true" />
                {diet.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="admin-field">
        <span>
          Badges <em>(comma separated)</em>
        </span>
        <input
          name="badges"
          defaultValue={item?.badges?.join(", ") ?? ""}
          placeholder="Highest selling, must try"
        />
      </label>

      <div className="admin-checks">
        <label className="admin-check">
          <input
            type="checkbox"
            name="is_spicy"
            defaultChecked={item?.is_spicy ?? false}
          />
          <span>
            <SpicyMark /> Spicy
          </span>
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={item?.is_featured ?? false}
          />
          <span>Featured</span>
        </label>
      </div>
    </>
  );
}