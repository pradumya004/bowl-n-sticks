"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import { createSection } from "@/lib/actions/sections";

// "+ New section" button that opens a proper form modal (name + description).
export default function AddSectionButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setError(null);
    setOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      // Only close on a confirmed save - otherwise the form vanishes and takes
      // whatever was typed with it.
      const message = await createSection(formData);
      if (message) {
        setError(message);
        return;
      }
      close();
    });
  }

  return (
    <>
      <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
        + New section
      </button>

      <Modal open={open} onClose={close} kicker="🍜 New" title="Add a section">
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

          {error && <p className="admin-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={close}>
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
