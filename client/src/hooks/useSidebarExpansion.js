import { useState, useEffect } from "react";

export const useSidebarExpansion = (activeId, sectionsData) => {
  const [expandedSections, setExpandedSections] = useState({});

  const handleExpandSection = (sectionId, expand) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: expand,
    }));
  };

  useEffect(() => {
    if (!activeId) return;

    const topLevel = sectionsData.find((sec) => sec.id === activeId);
    if (topLevel) {
      setExpandedSections((prev) => ({
        ...prev,
        [topLevel.id]: true,
      }));
    } else {
      for (const sec of sectionsData) {
        const sub = sec.subsections?.find((s) => s.id === activeId);
        if (sub) {
          setExpandedSections((prev) => ({
            ...prev,
            [sec.id]: true,
          }));
          break;
        }
      }
    }
  }, [activeId, sectionsData]);

  return { expandedSections, handleExpandSection };
};
