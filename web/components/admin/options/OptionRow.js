"use client";
import { useState, useTransition } from "react";
import OptionFields from "./OptionFields";
import { updateOption, deleteOption } from "@/lib/actions/options";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";

// One saved option. Edit and delete happen inline: a second modal on top of the options modal would stack backdrops and fight for focus.
export default function OptionRow({ option }) {
  const [mode, setMode] = useState("view"); // view | edit | confirm
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  function show(next) {
    setError(null);
    setMode(next);
  }

  function saveEdit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const message = await updateOption(formData);
      if (message) {
        setError(message);
        return;
      }
      show("view");
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", option.id);
    startTransition(async () => {
      const message = await deleteOption(formData);
      if (message) {
        setError(message);
        return;
      }
      // no show("view") - the row is gone once the page re-renders.
    });
  }

  if (mode === "edit") {
    return (
      <li className="opt-row opt-row--form">
        <form className="modal-form" onSubmit={saveEdit}>
          <input type="hidden" name="id" value={option.id} />
          <OptionFields option={option} />

          {error && <p className="admin-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => show("view")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--sm btn--primary"
              disabled={pending}
            >
              {pending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="opt-row">
      <span className="opt-label">{option.label}</span>
      <span className="pill pill--ink">
        {option.is_delta ? `+₹${option.price}` : `₹${option.price}`}
      </span>

      {mode === "confirm" ? (
        <span className="opt-acts">
          <span className="opt-ask">Delete this?</span>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => show("view")}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--sm btn--danger"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete"}
          </button>
        </span>
      ) : (
        <span className="opt-acts">
          <button
            type="button"
            className="btn btn--icon"
            onClick={() => show("edit")}
            aria-label={`Edit ${option.label}`}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            className="btn btn--icon btn--danger"
            onClick={() => show("confirm")}
            aria-label={`Delete ${option.label}`}
          >
            <TrashIcon />
          </button>
        </span>
      )}

      {error && <p className="admin-error">{error}</p>}
    </li>
  );
}
