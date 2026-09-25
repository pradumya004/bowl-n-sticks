"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import { createSection } from "@/lib/actions/sections";

// "+ New section" button that opens a proper form modal (name + description).
export default function AddSectionButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await createSection(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
        + New section
      </button>

      <Modal open={open} onClose={() => setOpen(false)} kicker="🍜 New" title="Add a section">
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Name</span>
            <input name="name" required maxLength={60} placeholder="e.g. Ramen Dishes" />
          </label>

          <label className="admin-field">
            <span>
              Description <em>(optional)</em>
            </span>
            <textarea
              name="blurb"
              rows={3}
              maxLength={200}
              placeholder="Short line shown under the section title on the menu"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={pending}>
              {pending ? "Adding..." : "Add section"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
