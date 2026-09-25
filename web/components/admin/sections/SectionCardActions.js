"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import { updateSection, toggleSection, deleteSection } from "@/lib/actions/sections";

// Edit / Hide / Delete controls on a section card. Edit and Delete open real
// modals (no browser alert popups).
export default function SectionCardActions({ section }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function saveEdit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateSection(formData);
      setEditing(false);
    });
  }

  function handleToggle() {
    const formData = new FormData();
    formData.set("id", section.id);
    formData.set("active", String(section.active));
    startTransition(async () => {
      await toggleSection(formData);
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", section.id);
    startTransition(async () => {
      await deleteSection(formData);
      setConfirming(false);
    });
  }

  return (
    <>
      <div className="sec-actions">
        <button type="button" className="btn btn--sm" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" className="btn btn--sm" onClick={handleToggle} disabled={pending}>
          {section.active ? "Hide" : "Show"}
        </button>
        <button type="button" className="btn btn--sm btn--danger" onClick={() => setConfirming(true)}>
          Delete
        </button>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} kicker="Edit" title={section.name}>
        <form className="modal-form" onSubmit={saveEdit}>
          <input type="hidden" name="id" value={section.id} />

          <label className="admin-field">
            <span>Name</span>
            <input name="name" defaultValue={section.name} required maxLength={60} />
          </label>

          <label className="admin-field">
            <span>Description</span>
            <textarea
              name="blurb"
              rows={3}
              maxLength={200}
              defaultValue={section.blurb ?? ""}
              placeholder="Short line shown under the section title on the menu"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        kicker="⚠ Careful"
        title={`Delete "${section.name}"?`}
      >
        <div className="modal-form">
          <p className="modal-warn">
            This permanently deletes the section and its{" "}
            <b>
              {section.itemCount} item{section.itemCount === 1 ? "" : "s"}
            </b>
            . This cannot be undone.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={pending}>
              {pending ? "Deleting..." : "Delete section"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
