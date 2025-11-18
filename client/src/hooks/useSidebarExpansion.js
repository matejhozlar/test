import { useState, useEffect, useRef } from "react";

export const useSidebarExpansion = (activeId, sectionsData) => {
  const [expandedSections, setExpandedSections] = useState({});
  const isNavigatingRef = useRef(false);

  const handleExpandSection = (sectionId, expand) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: expand,
    }));
  };

  useEffect(() => {
    if (!activeId || isNavigatingRef.current) return;

    const newExpanded = { ...expandedSections };

    const topLevel = sectionsData.find((sec) => sec.id === activeId);
    if (topLevel) {
      newExpanded[topLevel.id] = true;
    } else {
      for (const sec of sectionsData) {
        const sub = sec.subsections?.find((s) => s.id === activeId);
        if (sub) {
          newExpanded[sec.id] = true;
          break;
        }
      }
    }

    setExpandedSections(newExpanded);
  }, [activeId, expandedSections, sectionsData]);

  return { expandedSections, handleExpandSection };
};
