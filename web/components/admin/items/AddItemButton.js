"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import ItemFields from "./ItemFields";
import { createItem } from "@/lib/actions/items";

export default function AddItemButton({ sectionId }) {
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
      const message = await createItem(formData);
      if (message) {
        setError(message);
        return;
      }
      close();
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => setOpen(true)}
      >
        + New item
      </button>

      <Modal open={open} onClose={close} kicker="🍜 New" title="Add a dish">
        <form className="modal-form" onSubmit={handleSubmit}>
          <input type="hidden" name="menu_section_id" value={sectionId} />
          <ItemFields />

          {error && <p className="admin-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={close}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={pending}
            >
              {pending ? "Adding..." : "Add dish"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}