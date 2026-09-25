"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import ItemFields from "./ItemFields";
import { updateItem, toggleItem, deleteItem } from "@/lib/actions/items";

export default function ItemCardActions({ item }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function saveEdit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateItem(formData);
      setEditing(false);
    });
  }
  function handleToggle() {
    const formData = new FormData();
    formData.set("id", item.id);
    formData.set("active", String(item.active));
    startTransition(async () => {
      await toggleItem(formData);
    });
  }
  function handleDelete() {
    const formData = new FormData();
    formData.set("id", item.id);
    startTransition(async () => {
      await deleteItem(formData);
      setConfirming(false);
    });
  }

  return (
    <>
      <div className="sec-actions">
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn--sm"
          onClick={handleToggle}
          disabled={pending}
        >
          {item.active ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          className="btn btn--sm btn--danger"
          onClick={() => setConfirming(true)}
        >
          Delete
        </button>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        kicker="Edit"
        title={item.name}
      >
        <form className="modal-form" onSubmit={saveEdit}>
          <input type="hidden" name="id" value={item.id} />
          <ItemFields item={item} />
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
        title={`Delete "${item.name}"?`}
      >
        <div className="modal-form">
          <p className="modal-warn">
            This permanently deletes the dish and any combo options on it. This
            cannot be undone.
          </p>
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
              {pending ? "Deleting..." : "Delete dish"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}