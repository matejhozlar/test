import { useState, useEffect } from "react";

export const useDocumentParser = (url) => {
  const [sectionsData, setSectionsData] = useState([]);
  const [globalHeadings, setGlobalHeadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    const parseDocument = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.status}`);
        }

        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const autoToc = doc.querySelector("ul");
        if (
          autoToc &&
          autoToc.previousElementSibling?.textContent?.includes("Contents")
        ) {
          autoToc.remove();
          autoToc.previousElementSibling.remove();
        }

        const sections = [];
        const headings = [];
        const children = Array.from(doc.body.children);
        let currentSection = null;
        let currentSubsection = null;

        children.forEach((child) => {
          if (child.tagName === "H1") {
            const text = child.textContent.trim();
            const id = `section-${sections.length}`;
            child.setAttribute("id", id);
            currentSection = {
              id,
              text,
              html: child.outerHTML,
              subsections: [],
            };
            sections.push(currentSection);
            headings.push({ id, text, level: 1 });
            currentSubsection = null;
          } else if (child.tagName === "H2" && currentSection) {
            const text = child.textContent.trim();
            const subId = `${currentSection.id}-sub-${currentSection.subsections.length}`;
            child.setAttribute("id", subId);
            currentSubsection = {
              id: subId,
              text,
              html: child.outerHTML,
            };
            currentSection.subsections.push(currentSubsection);
            headings.push({ id: subId, text, level: 2 });
            currentSection.html += child.outerHTML;
          } else if (currentSection) {
            if (currentSubsection) {
              currentSubsection.html += child.outerHTML;
            }
            currentSection.html += child.outerHTML;
          }
        });

        setSectionsData(sections);
        setGlobalHeadings(headings);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load manual:", err);
        setError(err);
        setIsLoading(false);
      }
    };

    parseDocument();
  }, [url]);

  return { sectionsData, globalHeadings, isLoading, error };
};
