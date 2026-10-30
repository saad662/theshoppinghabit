import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor: a small dot + a larger trailing ring.
 * Hovering interactive elements (or anything with [data-cursor]) expands the ring
 * and reveals an optional label from data-cursor (e.g. data-cursor="View Project").
 *
 * Accessibility:
 * - Hidden on touch / coarse-pointer devices.
 * - Disabled when the user prefers reduced motion (native cursor is restored,
 *   and no rAF loop runs).
 * - Tracks keyboard focus: focusing an interactive element with Tab moves the
 *   ring/label to that element so keyboard users get the same affordance as
 *   mouse users. The ring snaps (no easing) when driven by focus.
 * - Hides itself while the user is typing in a text field so the caret stays
 *   visible, and on window blur.
 */
export function InteractiveCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string>("");
  const [variant, setVariant] = useState<"default" | "hover">("default");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluate = () => {
      // Respect reduced-motion preference: fall back to the native cursor.
      setEnabled(finePointer.matches && !reducedMotion.matches);
    };
    evaluate();

    finePointer.addEventListener("change", evaluate);
    reducedMotion.addEventListener("change", evaluate);
    return () => {
      finePointer.removeEventListener("change", evaluate);
      reducedMotion.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    // When true, the ring snaps to (mx,my) without easing — used for focus moves.
    let snap = false;

    const isTextInput = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "TEXTAREA") return true;
      if (tag === "INPUT") {
        const type = (el as HTMLInputElement).type;
        return !["button", "submit", "reset", "checkbox", "radio", "range", "color", "file"].includes(type);
      }
      return (el as HTMLElement).isContentEditable === true;
    };

    const setLabelFromTarget = (target: HTMLElement | null) => {
      if (target) {
        setVariant("hover");
        setLabel(target.dataset.cursor ?? "");
      } else {
        setVariant("default");
        setLabel("");
      }
    };

    const findCursorTarget = (el: Element | null) =>
      el?.closest<HTMLElement>(
        "a, button, [role='button'], input, textarea, select, label, [data-cursor]",
      ) ?? null;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      if (snap) {
        rx = mx;
        ry = my;
        snap = false;
      } else {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      setLabelFromTarget(findCursorTarget(e.target as Element));
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = findCursorTarget(e.target as Element);
      if (!target) return;
      // Hide while typing so the text caret remains the dominant indicator.
      if (isTextInput(target)) {
        setVisible(false);
        return;
      }
      const rect = target.getBoundingClientRect();
      mx = rect.left + rect.width / 2;
      my = rect.top + rect.height / 2;
      snap = true;
      setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      setLabelFromTarget(target);
    };

    const onFocusOut = () => {
      setLabelFromTarget(null);
    };

    const onBlurWindow = () => setVisible(false);
    const onFocusWindow = () => setVisible(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLabelFromTarget(null);
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    window.addEventListener("blur", onBlurWindow);
    window.addEventListener("focus", onFocusWindow);
    window.addEventListener("keydown", onKeyDown);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("blur", onBlurWindow);
      window.removeEventListener("focus", onFocusWindow);
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <style>{`@media (pointer: fine) and (prefers-reduced-motion: no-preference) { html, body, a, button, [role='button'], [data-cursor] { cursor: none !important; } } input, textarea, [contenteditable='true'] { cursor: text !important; }`}</style>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference will-change-transform transition-[width,height,border-radius,padding,opacity] duration-300 ease-out flex items-center justify-center"
        style={{
          width: variant === "hover" ? (label ? "auto" : 56) : 36,
          height: variant === "hover" ? (label ? 36 : 56) : 36,
          padding: variant === "hover" && label ? "0 14px" : 0,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.9)",
          backgroundColor: variant === "hover" && label ? "rgba(255,255,255,0.95)" : "transparent",
          opacity: visible ? 1 : 0,
        }}
      >
        {label ? (
          <span className="text-[10px] font-medium uppercase tracking-widest text-black whitespace-nowrap">
            {label}
          </span>
        ) : null}
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference will-change-transform transition-opacity duration-200"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: "white",
          opacity: visible && variant !== "hover" ? 1 : 0,
        }}
      />
    </>
  );
}
