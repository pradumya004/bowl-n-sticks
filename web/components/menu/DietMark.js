// The Indian veg / egg / non-veg square mark. type is "veg" | "egg" | "nonveg".
export default function DietMark({ type }) {
  return <span className={`diet ${type}`} aria-label={type} />;
}
