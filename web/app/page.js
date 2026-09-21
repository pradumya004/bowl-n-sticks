import { supabase } from "../lib/supabaseClient";

// A Server Component: this async function runs on the server, fetches the menu, and sends finished HTML to the browser. No loading spinner needed.
export default async function Home() {
  // Get sections in display order, with each section's items nested inside.
  const { data: sections, error } = await supabase
    .from("menu_section")
    .select("name, menu_item(name, price, diet_type)")
    .order("sort_order");

  if (error) {
    return (
      <pre style={{ padding: 24, color: "red" }}>Error: {error.message}</pre>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", lineHeight: 1.5 }}>
      <h1>Bowl n Sticks - menu test</h1>
      {sections.map((section) => (
        <section key={section.name}>
          <h2>{section.name}</h2>
          <ul>
            {section.menu_item.map((item) => (
              <li key={item.name}>
                {item.name}
                {item.price ? ` - ₹${item.price}` : ""} ({item.diet_type})
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}