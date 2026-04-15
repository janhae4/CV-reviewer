import { useEffect, useRef, useState } from "react";

export function useSectionScroll(
  sections: React.RefObject<HTMLDivElement | null>[]
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isScrolling = useRef(false);

  function isScrollInScrollableElement(e: WheelEvent) {
    let el = e.target as HTMLElement | null;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight
      ) {
        const atTop = el.scrollTop === 0;
        const atBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
          return true;
        }
      }
      el = el.parentElement;
    }
    return false;
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.closest("textarea") ||
        target.closest(".scrollable")
      ) {
        return;
      } 

      if (isScrollInScrollableElement(e)) return;

      if (isScrolling.current) return;

      if (e.deltaY > 50 && currentIndex < sections.length - 1) {
        isScrolling.current = true;
        const nextIndex = currentIndex + 1;
        sections[nextIndex].current?.scrollIntoView({ behavior: "smooth" });
        setCurrentIndex(nextIndex);
        setTimeout(() => (isScrolling.current = false), 800);
      } else if (e.deltaY < -50 && currentIndex > 0) {
        isScrolling.current = true;
        const prevIndex = currentIndex - 1;
        sections[prevIndex].current?.scrollIntoView({ behavior: "smooth" });
        setCurrentIndex(prevIndex);
        setTimeout(() => (isScrolling.current = false), 800);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentIndex, sections]);

  return { currentIndex, setCurrentIndex };
}
