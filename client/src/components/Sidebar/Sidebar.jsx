import React, { useEffect, useRef } from "react";
import styles from "./Sidebar.module.css";

const Sidebar = ({
  isOpen,
  onToggle,
  searchQuery,
  onSearchChange,
  sectionsData,
  searchResults,
  activeId,
  expandedSections,
  onExpandSection,
  onNavigate,
  year,
}) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!activeId || !scrollContainerRef.current) return;

    const activeEl = scrollContainerRef.current.querySelector(
      `.${styles.link}.${styles.active}`
    );

    if (activeEl) {
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      const offsetTop = activeEl.offsetTop;
      const scrollTo =
        offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;

      if (
        activeRect.top < containerRect.top ||
        activeRect.bottom > containerRect.bottom
      ) {
        container.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });
      }
    }
  }, [activeId]);

  const sidebarItems = searchQuery
    ? searchResults.filter((item) => item.level === 1)
    : sectionsData;

  const handleSectionClick = (section) => {
    const hasSubsections =
      Array.isArray(section.subsections) && section.subsections.length > 0;
    const isExpanded = expandedSections[section.id];

    if (!hasSubsections) {
      onNavigate(section.id);
      return;
    }

    if (!isExpanded) {
      onExpandSection(section.id, true);
    } else {
      onNavigate(section.id);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className={styles.outsideToggle}
          onClick={() => onToggle(true)}
          aria-label="Open sidebar"
        >
          ☰
        </button>
      )}

      <aside
        className={`${styles.sidebar} ${styles.drawer} ${
          isOpen ? styles.open : ""
        }`}
      >
        <div className={styles.stickyTop}>
          <button
            className={styles.toggle}
            onClick={() => onToggle(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className={styles.header}>
          <div className={styles.searchContainer}>
            <img
              src="/assets/svg/search.svg"
              alt="search"
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.search}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className={styles.scrollable} ref={scrollContainerRef}>
          <h2 className={styles.contents}>
            {searchQuery ? "Search Results" : "CONTENTS"}
          </h2>
          <ul className={styles.list}>
            {sidebarItems.map((section) => {
              const hasSubsections =
                Array.isArray(section.subsections) &&
                section.subsections.length > 0;
              const isExpanded = expandedSections[section.id];
              const isActiveTopLevel = activeId === section.id;

              return (
                <li key={section.id} className={styles.section}>
                  <button
                    className={`${styles.link} ${
                      isActiveTopLevel ? styles.active : ""
                    }`}
                    onClick={() => handleSectionClick(section)}
                  >
                    <span className={styles.linkText}>{section.text}</span>
                    {hasSubsections && (
                      <img
                        src={
                          isExpanded
                            ? "/assets/svg/up.svg"
                            : "/assets/svg/down.svg"
                        }
                        alt="toggle"
                        className={styles.arrow}
                      />
                    )}
                  </button>

                  {hasSubsections && (
                    <div
                      className={`${styles.subsectionWrapper} ${
                        isExpanded ? styles.expanded : ""
                      }`}
                    >
                      <ul className={styles.subsectionList}>
                        {section.subsections.map((sub) => (
                          <li key={sub.id}>
                            <button
                              className={`${styles.link} ${
                                activeId === sub.id ? styles.active : ""
                              }`}
                              onClick={() => onNavigate(sub.id)}
                            >
                              <span className={styles.linkText}>
                                {sub.text}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.footer}>
          <p>
            {year} © Honeywell International Inc.
            <br /> All Rights Reserved
          </p>
        </div>
      </aside>

      {isOpen && (
        <div className={styles.overlay} onClick={() => onToggle(false)} />
      )}
    </>
  );
};

export default Sidebar;
