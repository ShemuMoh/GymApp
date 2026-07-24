"use client";

import { useRef, useState, type PointerEvent, type MouseEvent, type ReactNode } from "react";

const OPEN = -88;

export default function SwipeRow({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: ReactNode;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const movedRef = useRef(false);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    startXRef.current = e.clientX;
    startOffsetRef.current = offset;
    movedRef.current = false;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Older browsers; touch implicitly captures anyway.
    }
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > 5) movedRef.current = true;
    setOffset(Math.min(0, Math.max(OPEN, startOffsetRef.current + delta)));
  }

  function handlePointerEnd() {
    if (!dragging) return;
    setDragging(false);
    setOffset((prev) => (prev < OPEN / 2 ? OPEN : 0));
  }

  function handleClickCapture(e: MouseEvent<HTMLDivElement>) {
    // Swallow the click that follows a drag, and let a tap on an open row
    // close it instead of activating the row.
    if (movedRef.current || offset !== 0) {
      e.preventDefault();
      e.stopPropagation();
      if (offset !== 0 && !movedRef.current) setOffset(0);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <button
        onClick={() => {
          setOffset(0);
          onDelete();
        }}
        aria-label="Delete"
        className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500 text-sm font-bold text-white"
      >
        Delete
      </button>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={handleClickCapture}
        style={{
          transform: `translateX(${offset}px)`,
          touchAction: "pan-y",
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}
