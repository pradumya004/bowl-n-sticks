"use client";
import { useState, useTransition } from "react";
import Modal from "@/components/admin/ui/Modal";
import OptionFields from "./OptionFields";
import OptionRow from "./OptionRow";
import { createOption } from "@/lib/actions/options";
import { SlidersIcon } from "@/components/ui/icons";

// "Options" button on a dish card + the modal that manages them.
export default function OptionsButton({ item }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const options = item.options ?? [];

  function close() {
    setError(null);
    setOpen(false);
  }

  function handleAdd(e) {
    e.preventDefault();
    const form = e.currentTarget; // read it now: it's null by the time the async runs
    const formData = new FormData(form);
    startTransition(async () => {
      const message = await createOption(formData);
      if (message) {
        setError(message);
        return;
      }
      setError(null);
      form.reset(); // stay open - adding three upgrades in a row is the normal case
    });
  }

  return (
    <>
      {/* Sits with the badges, not in the action row: it describes the dish
          ("has 3 upgrades") as much as it manages it. */}
      <button
        type="button"
        className="opt-chip"
        onClick={() => setOpen(true)}
      >
        <SlidersIcon />
        {options.length > 0
          ? `${options.length} option${options.length === 1 ? "" : "s"}`
          : "Options"}
      </button>

      <Modal open={open} onClose={close} kicker="Options" title={item.name}>
        <div className="modal-form">
          {options.length === 0 ? (
            <p className="modal-warn">
              No options yet. Anything you add here shows under the dish on the
              customer menu.
            </p>
          ) : (
            <ul className="opt-list">
              {options.map((option) => (
                <OptionRow key={option.id} option={option} />
              ))}
            </ul>
          )}

          <form className="opt-add" onSubmit={handleAdd}>
            <input type="hidden" name="menu_item_id" value={item.id} />
            <h4 className="opt-addtitle">Add an option</h4>
            <OptionFields />

            {error && <p className="admin-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="btn" onClick={close}>
                Done
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={pending}
              >
                {pending ? "Adding..." : "Add option"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
