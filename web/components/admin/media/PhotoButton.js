"use client";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Modal from "@/components/admin/ui/Modal";
import { mediaUrl } from "@/lib/storage";

// Photo chip on a card + the modal that uploads, replaces or removes it.
// Separate from the Edit form on purpose: a file upload is a different kind of
// write (it touches Storage, not just a row) and shouldn't ride along with a
// text form the user might cancel.
export default function PhotoButton({ id, name, imagePath, onUpload, onRemove }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef(null);

  const current = mediaUrl(imagePath);

  function close() {
    setError(null);
    setPreview(null);
    setOpen(false);
  }

  // Show the chosen file immediately, before it has uploaded, so there is no
  // dead moment between picking and seeing.
  function handlePick(e) {
    const file = e.target.files?.[0];
    setError(null);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleUpload(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const message = await onUpload(formData);
      if (message) {
        setError(message);
        return;
      }
      close();
    });
  }

  function handleRemove() {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const message = await onRemove(formData);
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
        className={`opt-chip ${imagePath ? "opt-chip--on" : ""}`}
        onClick={() => setOpen(true)}
      >
        {imagePath ? "Photo" : "No photo"}
      </button>

      <Modal open={open} onClose={close} kicker="Photo" title={name}>
        <form className="modal-form" onSubmit={handleUpload}>
          <input type="hidden" name="id" value={id} />

          <div className="photo-stage">
            {preview ? (
              /* a blob: URL from the file the user just picked, not yet uploaded,
                 so next/image can't optimize it */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" />
            ) : current ? (
              <Image src={current} alt={name} width={320} height={240} />
            ) : (
              <span className="photo-empty">🍜 No photo yet</span>
            )}
          </div>

          <label className="admin-field">
            <span>
              Choose a photo <em>(JPG, PNG, WebP or AVIF, up to 5 MB)</em>
            </span>
            <input
              ref={inputRef}
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handlePick}
            />
          </label>

          {error && <p className="admin-error">{error}</p>}

          <div className="modal-actions">
            {imagePath && (
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleRemove}
                disabled={pending}
              >
                Remove
              </button>
            )}
            <button type="button" className="btn" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={pending}>
              {pending ? "Uploading..." : imagePath ? "Replace" : "Upload"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
