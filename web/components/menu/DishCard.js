import Image from "next/image";
import DietMark from "./DietMark";
import SpicyMark from "@/components/ui/SpicyMark";
import { mediaUrl } from "@/lib/storage";

// One dish. Featured items get the bigger red-shadow treatment + floating thumb.
export default function DishCard({ item }) {
  // != null, not a truthy check: 0g protein is a real value, and `0 && <span>`
  // renders a bare "0" on the card.
  const hasProtein = item.protein_g != null;
  const hasTags = item.badges?.length || hasProtein || item.is_spicy;
  const photo = mediaUrl(item.image_path);
  return (
    <div className={`card ${item.is_featured ? "feat" : ""}`}>
      <div className="thumb">
        {photo ? (
          /* sizes tells next/image which widths to generate: the thumb is 76px
             (92px when featured), so it never ships a full-size photo to a phone */
          <Image
            src={photo}
            alt={item.name}
            fill
            sizes="92px"
            className="thumb-img"
          />
        ) : (
          /* 🍜 placeholder until a photo is uploaded */
          "🍜"
        )}
      </div>
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
            {hasProtein && (
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