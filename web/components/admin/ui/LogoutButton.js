"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  async function logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    // If sign-out fails the session is still live, so the middleware would just
    // bounce us back from /admin/login. Say so instead of looping.
    if (error) {
      console.error("[admin] signOut:", error.message);
      setFailed(true);
      return;
    }
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button className="btn btn--sm btn--accent" onClick={logout}>
      {failed ? "Couldn't log out - retry" : "Log out"}
    </button>
  );
}