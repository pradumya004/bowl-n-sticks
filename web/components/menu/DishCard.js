import DietMark from "./DietMark";
import SpicyMark from "@/components/ui/SpicyMark";

// One dish. Featured items get the bigger red-shadow treatment + floating thumb.
export default function DishCard({ item }) {
  const hasTags = item.badges?.length || item.protein_g || item.is_spicy;
  return (
    <div className={`card ${item.is_featured ? "feat" : ""}`}>
      {/* 🍜 is a placeholder; real photos come in Phase 5 (item.image_url) */}
      <div className="thumb">🍜</div>
      <div className="m">
        <div className="top">
          <DietMark type={item.diet_type} />
          <h3>{item.name}</h3>
          {item.price != null && <span className="price">₹{item.price}</span>}
        </div>

        {item.description && <p className="desc">{item.description}</p>}

        {hasTags && (
          <div className="tags">
            {item.badges?.map((b) => (
              <span key={b} className="sticker red">
                {b}
              </span>
            ))}
            {item.protein_g && (
              <span className="sticker yellow">{item.protein_g}g protein</span>
            )}
            {item.is_spicy && <SpicyMark />}
          </div>
        )}

        {item.options?.length > 0 && (
          <div className="opts">
            {item.options.map((o) => (
              <span key={o.label} className="opt">
                {o.label} <b>{o.is_delta ? `+₹${o.price}` : `₹${o.price}`}</b>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}