"use client";
import { Children, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

// Drag-to-reorder wrapper around a grid of cards.
//
// The children are server-rendered <SortableItem id=...> elements. We keep our
// own copy of the order so the cards move the instant you drop, then send the
// whole new order to `action`. If the write fails we put the old order back,
// rather than leaving the screen showing something the database doesn't agree with.
export default function SortableList({ id, ids, action, className, children }) {
  const [order, setOrder] = useState(ids);
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  // Resync when the server sends a different list (a card was added or deleted).
  // Adjusting state during render, not in an effect: the server hands us a fresh
  // array every time, so a reference check would loop forever.
  const serverKey = ids.join();
  const [seenKey, setSeenKey] = useState(serverKey);
  if (serverKey !== seenKey) {
    setSeenKey(serverKey);
    setOrder(ids);
  }

  const sensors = useSensors(
    // 6px of movement before a drag starts, so a plain click on the grip (or a
    // tap on a phone) still behaves like a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Match cards to ids BY POSITION, not by reading child.props.id: these
  // elements were rendered on the server, and their props are not reliably
  // readable here. `children` and `ids` come from the same map(), so index N in
  // one is index N in the other.
  const list = Children.toArray(children);
  const cards = new Map(ids.map((id, i) => [id, list[i]]));
  const mismatch = list.length !== ids.length;

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const previous = order;
    const next = arrayMove(
      order,
      order.indexOf(active.id),
      order.indexOf(over.id),
    );
    setOrder(next);
    setError(null);

    startTransition(async () => {
      const message = await action(next);
      if (message) {
        setOrder(previous);
        setError(message);
      }
    });
  }

  return (
    <>
      {error && <p className="admin-error">{error}</p>}

      {/* A stable id matters: without one dnd-kit numbers its aria-describedby
          by render order, which differs between server and client and throws a
          hydration mismatch. */}
      <DndContext
        id={id}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={rectSortingStrategy}>
          {/* If the two lists ever disagree, render every card unsorted rather
              than dropping the ones that didn't match. Showing a wrong order is
              recoverable; silently hiding cards is not. */}
          <ul className={className}>
            {mismatch ? list : order.map((id) => cards.get(id) ?? null)}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
