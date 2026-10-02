"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripIcon } from "@/components/ui/icons";

// One draggable card. The grip strip is the only drag target, so Edit, Delete
// and the section link keep working normally.
export default function SortableItem({ id, anchor, className = "", children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      id={anchor}
      ref={setNodeRef}
      className={`${className} ${isDragging ? "is-dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="drag-grip"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>
      {children}
    </li>
  );
}
