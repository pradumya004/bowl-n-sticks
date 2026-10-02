import { getCafe } from "@/lib/adminCafe";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export default async function SettingsPage() {
  const cafe = await getCafe();

  return (
    <>
      <div className="admin-secthead">
        <h2>Cafe settings</h2>
      </div>
      <p className="admin-sectionblurb">
        Everything here shows on the customer menu. The cafe name is never
        written into the code, so renaming the place is just this form.
      </p>
      <SettingsForm cafe={cafe} />
    </>
  );
}
