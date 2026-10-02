"use client";
import { useState, useTransition } from "react";
import { updateCafe } from "@/lib/actions/cafe";

// Everything the customer sees that isn't a dish: the hero line, the footer,
// the house rules. One form, saved in one write.
export default function SettingsForm({ cafe }) {
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSaved(false);
    startTransition(async () => {
      const message = await updateCafe(formData);
      if (message) {
        setError(message);
        return;
      }
      setError(null);
      setSaved(true);
    });
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <section className="stat-panel">
        <h3>The basics</h3>
        <div className="settings-fields">
          <label className="admin-field">
            <span>Cafe name</span>
            <input
              name="name"
              defaultValue={cafe?.name ?? ""}
              required
              maxLength={60}
            />
          </label>
          <label className="admin-field">
            <span>
              Tagline <em>(the line under the name)</em>
            </span>
            <input
              name="tagline"
              defaultValue={cafe?.tagline ?? ""}
              maxLength={160}
              placeholder="First anime themed cafe in Karwar."
            />
          </label>
        </div>
      </section>

      <section className="stat-panel">
        <h3>Finding you</h3>
        <div className="settings-fields">
          <label className="admin-field">
            <span>Address</span>
            <textarea
              name="address"
              rows={2}
              maxLength={240}
              defaultValue={cafe?.address ?? ""}
              placeholder="Shop no, street, Karwar, Karnataka"
            />
          </label>
          <label className="admin-field">
            <span>
              Google Maps link <em>(optional)</em>
            </span>
            <input
              name="maps_url"
              type="url"
              defaultValue={cafe?.maps_url ?? ""}
              placeholder="https://maps.app.goo.gl/..."
            />
          </label>
          <div className="admin-row2">
            <label className="admin-field">
              <span>Phone</span>
              <input
                name="phone"
                defaultValue={cafe?.phone ?? ""}
                maxLength={24}
                placeholder="+91 ..."
              />
            </label>
            <label className="admin-field">
              <span>Opening hours</span>
              <input
                name="timings"
                defaultValue={cafe?.timings ?? ""}
                maxLength={120}
                placeholder="11am - 10pm, closed Mondays"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="stat-panel">
        <h3>Socials</h3>
        <div className="settings-fields">
          <div className="admin-row2">
            <label className="admin-field">
              <span>
                Instagram <em>(handle, no @)</em>
              </span>
              <input
                name="instagram"
                defaultValue={cafe?.socials?.instagram ?? ""}
                maxLength={60}
                placeholder="maggilicious_cafe"
              />
            </label>
            <label className="admin-field">
              <span>
                Zomato rating <em>(optional)</em>
              </span>
              <input
                name="zomato"
                defaultValue={cafe?.socials?.zomato ?? ""}
                maxLength={60}
                placeholder="4.2/5"
              />
            </label>
          </div>
          <label className="admin-field">
            <span>
              Swiggy <em>(optional)</em>
            </span>
            <input
              name="swiggy"
              defaultValue={cafe?.socials?.swiggy ?? ""}
              maxLength={60}
            />
          </label>
        </div>
      </section>

      <section className="stat-panel">
        <h3>House rules</h3>
        <div className="settings-fields">
          <label className="admin-field">
            <span>
              One per line <em>(these show at the bottom of the menu)</em>
            </span>
            <textarea
              name="rules"
              rows={8}
              defaultValue={(cafe?.rules ?? []).join("\n")}
              placeholder={
                "Minimum 10 mins required for food to be ready.\nOutside food not allowed."
              }
            />
          </label>
        </div>
      </section>

      {error && <p className="admin-error">{error}</p>}
      {saved && <p className="admin-ok">Saved. The live menu is updated.</p>}

      <div className="settings-actions">
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
