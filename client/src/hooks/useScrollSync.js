import { useState, useEffect, useCallback, useRef } from "react";

export const useScrollSync = (contentRef, highlightedHtml) => {
  const [activeId, setActiveId] = useState(null);
  const isNavigatingRef = useRef(false);

  const scrollToHeading = useCallback((id, smooth = true) => {
    isNavigatingRef.current = true;

    const el = document.getElementById(id);
    if (el) {
      const offset = 120;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: smooth ? "smooth" : "auto",
      });

      window.history.replaceState(null, "", `#${id}`);

      setTimeout(
        () => {
          isNavigatingRef.current = false;
        },
        smooth ? 800 : 100
      );
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || isNavigatingRef.current) return;

      const headers = Array.from(contentRef.current.querySelectorAll("h1, h2"));
      const OFFSET = 150;

      let closestHeader = null;
      let closestDistance = Infinity;

      headers.forEach((header) => {
        const rect = header.getBoundingClientRect();
        const distance = Math.abs(rect.top - OFFSET);

        if (rect.top <= OFFSET && distance < closestDistance) {
          closestDistance = distance;
          closestHeader = header;
        }
      });

      if (closestHeader && closestHeader.id !== activeId) {
        setActiveId(closestHeader.id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentRef, activeId]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => scrollToHeading(hash, false), 100);
    }
  }, [highlightedHtml, scrollToHeading]);

  return { activeId, scrollToHeading };
};
