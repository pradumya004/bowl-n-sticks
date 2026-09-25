import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/admin/ui/LogoutButton";
import AdminNav from "@/components/admin/ui/AdminNav";

// Shared shell for every signed-in admin page (dashboard, sections, items).
// It lives in the (panel) route group so /admin/login does NOT get this chrome.
// The group name is in brackets, so it adds nothing to the URL.
export default async function PanelLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brandmark">
          Menu <span className="out">Admin</span>
        </Link>

        <AdminNav />

        <div className="admin-account">
          <span className="nav-group-label">Signed in</span>
          <span className="pill pill--round who-email">{user?.email}</span>
          <LogoutButton />
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
