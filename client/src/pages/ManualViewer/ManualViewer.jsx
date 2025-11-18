import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/auth/useAuth.js";
import Header from "../../components/Header/Header.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import ContentViewer from "../../components/ContentViewer/ContentViewer.jsx";
import ImageZoom from "../../components/ImageZoom/ImageZoom.jsx";
import { useDocumentParser } from "../../hooks/useDocumentParser.js";
import { useSearch } from "../../hooks/useSearch.js";
import { useScrollSync } from "../../hooks/useScrollSync.js";
import { useSidebarExpansion } from "../../hooks/useSidebarExpansion.js";
import styles from "./ManualViewer.module.css";

const ManualViewer = () => {
  const [zoomedImg, setZoomedImg] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const { user, logout } = useAuth();

  const today = new Date();
  const year = today.getFullYear();

  const { sectionsData, isLoading, error } = useDocumentParser("/manual.html");

  const { searchQuery, setSearchQuery, searchResults, highlightedHtml } =
    useSearch(sectionsData);

  const { activeId, scrollToHeading } = useScrollSync(
    contentRef,
    highlightedHtml
  );

  const { expandedSections, handleExpandSection } = useSidebarExpansion(
    activeId,
    sectionsData
  );

  useEffect(() => {
    const handler = (e) => {
      const img = e.target.closest("img.zoomable-image");
      if (img) setZoomedImg(img.src);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (zoomedImg) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [zoomedImg]);

  if (error) {
    return <div className={styles.error}>Failed to load manual</div>;
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading manual..." />;
  }

  return (
    <div className={styles.app}>
      <Header user={user} onLogout={logout} />
      <div className={styles.headerShadow} />
      <div className={styles.layout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={setIsSidebarOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sectionsData={sectionsData}
          searchResults={searchResults}
          activeId={activeId}
          expandedSections={expandedSections}
          onExpandSection={handleExpandSection}
          onNavigate={scrollToHeading}
          year={year}
        />

        <ContentViewer htmlContent={highlightedHtml} contentRef={contentRef} />

        <ImageZoom imageSrc={zoomedImg} onClose={() => setZoomedImg(null)} />
      </div>
    </div>
  );
};

export default ManualViewer;
