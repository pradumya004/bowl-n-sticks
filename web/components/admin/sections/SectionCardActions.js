"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import {
  updateSection,
  toggleSection,
  deleteSection,
} from "@/lib/actions/sections";
import {
  PencilIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
} from "@/components/ui/icons";

// Edit / Hide / Delete controls on a section card. Edit and Delete open real
// modals (no browser alert popups). One error slot, shown inside whichever modal
// is open, or under the buttons for Hide (which has no modal).
export default function SectionCardActions({ section }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  function openEdit() {
    setError(null);
    setEditing(true);
  }
  function openConfirm() {
    setError(null);
    setConfirming(true);
  }

  function saveEdit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      // Only close on a confirmed save, so a failure keeps the typed values.
      const message = await updateSection(formData);
      if (message) {
        setError(message);
        return;
      }
      setError(null);
      setEditing(false);
    });
  }

  function handleToggle() {
    const formData = new FormData();
    formData.set("id", section.id);
    formData.set("active", String(section.active));
    startTransition(async () => {
      setError((await toggleSection(formData)) ?? null);
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", section.id);
    startTransition(async () => {
      const message = await deleteSection(formData);
      if (message) {
        setError(message);
        return;
      }
      setError(null);
      setConfirming(false);
    });
  }

  return (
    <>
      <div className="sec-actions">
        <button
          type="button"
          className="btn btn--icon"
          onClick={openEdit}
          aria-label="Edit Section"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={handleToggle}
          disabled={pending}
          aria-label={
            section.active
              ? "Hide Section From The Menu"
              : "Show Section On The Menu"
          }
        >
          {section.active ? <EyeOffIcon /> : <EyeIcon />}
        </button>
        <button
          type="button"
          className="btn btn--icon btn--danger"
          onClick={openConfirm}
          aria-label="Delete Section"
        >
          <TrashIcon />
        </button>
      </div>

      {/* a failed Hide/Show has no modal to report into */}
      {error && !editing && !confirming && (
        <p className="admin-error sec-error">{error}</p>
      )}

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        kicker="Edit"
        title={section.name}
      >
        <form className="modal-form" onSubmit={saveEdit}>
          <input type="hidden" name="id" value={section.id} />

          <label className="admin-field">
            <span>Name</span>
            <input
              name="name"
              defaultValue={section.name}
              required
              maxLength={60}
            />
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

          {error && <p className="admin-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={pending}
            >
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

          {error && <p className="admin-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? "Deleting..." : "Delete section"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
