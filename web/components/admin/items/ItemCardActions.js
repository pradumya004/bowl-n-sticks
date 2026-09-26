"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import ItemFields from "./ItemFields";
import { updateItem, toggleItem, deleteItem } from "@/lib/actions/items";
import { PencilIcon, EyeIcon, EyeOffIcon, TrashIcon } from "@/components/ui/icons";

// Edit / Hide / Delete on a dish card. One error slot, shown inside whichever
// modal is open, or under the buttons for Hide (which has no modal).
export default function ItemCardActions({ item }) {
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
      const message = await updateItem(formData);
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
    formData.set("id", item.id);
    formData.set("active", String(item.active));
    startTransition(async () => {
      setError((await toggleItem(formData)) ?? null);
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", item.id);
    startTransition(async () => {
      const message = await deleteItem(formData);
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
      {/* Icon buttons: four text buttons wrapped onto two lines and read as four
          equal choices, which they aren't. Options moved up with the badges. */}
      <div className="sec-actions">
        <button
          type="button"
          className="btn btn--icon"
          onClick={openEdit}
          aria-label="Edit dish"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={handleToggle}
          disabled={pending}
          aria-label={item.active ? "Hide dish from the menu" : "Show dish on the menu"}
        >
          {item.active ? <EyeOffIcon /> : <EyeIcon />}
        </button>
        <button
          type="button"
          className="btn btn--icon btn--danger"
          onClick={openConfirm}
          aria-label="Delete dish"
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
        title={item.name}
      >
        <form className="modal-form" onSubmit={saveEdit}>
          <input type="hidden" name="id" value={item.id} />
          <ItemFields item={item} />

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
        title={`Delete "${item.name}"?`}
      >
        <div className="modal-form">
          <p className="modal-warn">
            This permanently deletes the dish and any combo options on it. This
            cannot be undone.
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
              {pending ? "Deleting..." : "Delete dish"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
