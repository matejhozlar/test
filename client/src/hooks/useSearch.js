import { useState, useEffect, useMemo } from "react";

const stripHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
};

const normalize = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const useSearch = (sectionsData) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedHtml, setHighlightedHtml] = useState("");

  const baseHtml = useMemo(() => {
    return sectionsData.map((s) => s.html).join("");
  }, [sectionsData]);

  useEffect(() => {
    const query = normalize(searchQuery);
    const queryWords = query.split(" ").filter(Boolean);

    if (!queryWords.length) {
      setSearchResults([]);
      setHighlightedHtml(baseHtml);
      return;
    }

    const matchesQuery = (text) => {
      const normalized = normalize(text);
      return queryWords.every((word) => normalized.includes(word));
    };

    const results = [];

    sectionsData.forEach((section) => {
      const sectionText = normalize(
        section.text + " " + stripHtml(section.html)
      );

      if (matchesQuery(sectionText)) {
        results.push({ ...section, level: 1 });
      }

      section.subsections?.forEach((sub) => {
        const subText = normalize(sub.text + " " + stripHtml(sub.html));
        if (matchesQuery(subText)) {
          results.push({ ...sub, level: 2, parent: section });
        }
      });
    });

    setSearchResults(results);

    const parser = new DOMParser();
    const doc = parser.parseFromString(baseHtml, "text/html");

    const regex = new RegExp(
      `\\b(${queryWords
        .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")})\\b`,
      "gi"
    );

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(node.textContent))) {
          const before = node.textContent.slice(lastIndex, match.index);
          const matchText = match[0];

          if (before) frag.appendChild(document.createTextNode(before));

          const mark = document.createElement("mark");
          mark.textContent = matchText;
          frag.appendChild(mark);

          lastIndex = match.index + matchText.length;
        }

        const after = node.textContent.slice(lastIndex);
        if (after) frag.appendChild(document.createTextNode(after));

        if (frag.childNodes.length) {
          node.replaceWith(frag);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        [...node.childNodes].forEach(walk);
      }
    };

    [...doc.body.childNodes].forEach(walk);
    setHighlightedHtml(doc.body.innerHTML);
  }, [searchQuery, sectionsData, baseHtml]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    highlightedHtml: highlightedHtml || baseHtml,
  };
};
