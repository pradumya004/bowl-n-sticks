"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import Modal from "@/components/admin/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { mediaUrl, MEDIA_BUCKET } from "@/lib/storage";

// Extensions we accept, keyed by mime type. Matches the bucket's allowlist.
const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 5 * 1024 * 1024;

// Photo chip on a card, plus the modal that uploads, replaces or removes it.
//
// The file goes BROWSER -> STORAGE directly, never through a Server Action: the
// action body is capped at 1 MB by Next and 4.5 MB by Vercel, which no phone
// photo fits inside. The action is then called with just the path.
export default function PhotoButton({ id, name, folder, imagePath, onSave, onRemove }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pending, startTransition] = useTransition();

  const current = mediaUrl(imagePath);

  function close() {
    setError(null);
    setFile(null);
    setPreview(null);
    setOpen(false);
  }

  // Checked here for a readable message. The bucket enforces the same limits
  // regardless, so this is convenience, not security.
  function handlePick(e) {
    const picked = e.target.files?.[0] ?? null;
    setError(null);
    setFile(null);
    setPreview(null);
    if (!picked) {
      return;
    }
    if (!TYPES[picked.type]) {
      setError("That file type isn't supported. Use JPG, PNG, WebP or AVIF.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError(
        `That photo is ${(picked.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`,
      );
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setError("Choose a photo first.");
      return;
    }

    startTransition(async () => {
      // A fresh random name every time. Reusing a path would keep serving the
      // old photo from the CDN cache for hours after a replace.
      const path = `${folder}/${crypto.randomUUID()}.${TYPES[file.type]}`;
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        setError(
          uploadError.message?.includes("exceeded")
            ? "That photo is over the 5 MB limit."
            : "The photo didn't upload. Check your connection and try again.",
        );
        return;
      }

      const formData = new FormData();
      formData.set("id", id);
      formData.set("path", path);
      const message = await onSave(formData);
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
          <div className="photo-stage">
            {preview ? (
              /* a blob: URL for the file just picked, not uploaded yet, so
                 next/image cannot optimize it */
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
              type="file"
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
            <button
              type="submit"
              className="btn btn--primary"
              disabled={pending || !file}
            >
              {pending ? "Uploading..." : imagePath ? "Replace" : "Upload"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
