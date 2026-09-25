"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import ItemFields from "./ItemFields";
import { createItem } from "@/lib/actions/items";

export default function AddItemButton({ sectionId }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await createItem(formData);
      setOpen(false);
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        kicker="🍜 New"
        title="Add a dish"
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <input type="hidden" name="menu_section_id" value={sectionId} />
          <ItemFields />
          <div className="modal-actions">
            <button
              type="button"
              className="btn"
              onClick={() => setOpen(false)}
            >
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