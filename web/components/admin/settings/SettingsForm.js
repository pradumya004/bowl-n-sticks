"use client";
import { useState, useTransition } from "react";
import { updateCafe } from "@/lib/actions/cafe";
import {
  BowlIcon,
  MapPinIcon,
  ShareIcon,
  ListIcon,
  EyeIcon,
} from "@/components/ui/icons";

// Everything the customer sees that isn't a dish. One form, one write.
//
// The inputs stay uncontrolled (defaultValue), so FormData still reads them on
// submit. A single onChange on the <form> catches every field by delegation and
// feeds the live preview, which is the point of this screen: you should see
// what the customer will see without opening the menu in another tab.
export default function SettingsForm({ cafe }) {
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [live, setLive] = useState({
    name: cafe?.name ?? "",
    tagline: cafe?.tagline ?? "",
    address: cafe?.address ?? "",
    phone: cafe?.phone ?? "",
    timings: cafe?.timings ?? "",
    instagram: cafe?.socials?.instagram ?? "",
    zomato: cafe?.socials?.zomato ?? "",
    rules: (cafe?.rules ?? []).join("\n"),
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setLive((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }

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

  // Same split the menu hero uses: the last word gets the hollow treatment.
  const words = (live.name || "Your cafe").trim().split(" ");
  const lead = words.slice(0, -1).join(" ");
  const last = words.at(-1);
  const ruleCount = live.rules.split("\n").filter((r) => r.trim()).length;

  return (
    <form className="settings-form" onSubmit={handleSubmit} onChange={handleChange}>
      {/* The brand, as the customer meets it. Updates as you type. */}
      <section className="settings-hero">
        <span className="settings-hero-kicker">On the menu right now</span>
        <h3 className="settings-hero-name">
          {lead} <span className="out">{last}</span>
        </h3>
        {live.tagline && <p className="settings-hero-tag">{live.tagline}</p>}
      </section>

      <div className="settings-grid">
        <section className="stat-panel">
          <h3 className="panel-head">
            <span className="panel-ico">
              <BowlIcon />
            </span>
            The basics
          </h3>
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
          <h3 className="panel-head">
            <span className="panel-ico">
              <MapPinIcon />
            </span>
            Finding you
          </h3>
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
                  placeholder="11am - 10pm"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="stat-panel">
          <h3 className="panel-head">
            <span className="panel-ico">
              <ShareIcon />
            </span>
            Socials
          </h3>
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
                  Zomato <em>(optional)</em>
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
          <h3 className="panel-head">
            <span className="panel-ico">
              <ListIcon />
            </span>
            House rules
            <span className="pill pill--yellow pill--round">{ruleCount}</span>
          </h3>
          <div className="settings-fields">
            <label className="admin-field">
              <span>
                One per line <em>(these show at the bottom of the menu)</em>
              </span>
              <textarea
                name="rules"
                rows={9}
                defaultValue={(cafe?.rules ?? []).join("\n")}
                placeholder={
                  "Minimum 10 mins required for food to be ready.\nOutside food not allowed."
                }
              />
            </label>
          </div>
        </section>
      </div>

      {/* What the bottom of the customer menu will say, as you type it. */}
      <section className="stat-panel settings-preview">
        <h3 className="panel-head">
          <span className="panel-ico">
            <EyeIcon />
          </span>
          Menu footer preview
        </h3>
        <div className="preview-stage">
          <div className="ita">いただきます Itadakimasu!</div>
          {live.address || live.timings || live.phone ? (
            <div className="visit">
              {live.address && (
                <p className="visit-line">
                  <span className="visit-key">Find us</span>
                  <span>{live.address}</span>
                </p>
              )}
              {live.timings && (
                <p className="visit-line">
                  <span className="visit-key">Open</span>
                  <span>{live.timings}</span>
                </p>
              )}
              {live.phone && (
                <p className="visit-line">
                  <span className="visit-key">Call</span>
                  <span>{live.phone}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="preview-hint">
              Fill in the address, hours or phone and this block appears on the
              menu. Right now customers see none of it.
            </p>
          )}
          <p className="links">
            {live.instagram && <span>@{live.instagram}</span>}
            {live.zomato && <> · Zomato {live.zomato}</>}
          </p>
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
