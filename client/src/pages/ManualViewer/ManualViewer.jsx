import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [zoomedImg, setZoomedImg] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [documentError, setDocumentError] = useState(null);
  const contentRef = useRef(null);
  const { user, logout } = useAuth();

  const today = new Date();
  const year = today.getFullYear();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 403) {
            setDocumentError("You don't have access to this document");
          } else if (response.status === 404) {
            setDocumentError("Document not found");
          } else {
            setDocumentError("Failed to load document");
          }
          return;
        }

        const data = await response.json();
        setDocumentData(data.document);
      } catch (error) {
        console.error("Error fetching document:", error);
        setDocumentError("Failed to load document");
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const documentUrl = documentData ? documentData.file_path : null;

  const { sectionsData, isLoading, error } = useDocumentParser(documentUrl);

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

  const handleBackToDocuments = () => {
    navigate("/");
  };

  if (documentError) {
    return (
      <div className={styles.app}>
        <Header user={user} onLogout={logout} />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>{documentError}</h2>
            <button
              className={styles.backButton}
              onClick={handleBackToDocuments}
            >
              ← Back to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!documentData || isLoading) {
    return (
      <div className={styles.app}>
        <Header user={user} onLogout={logout} />
        <div className={styles.loading}>Loading manual...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.app}>
        <Header user={user} onLogout={logout} />
        <div className={styles.error}>Failed to load manual</div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Header user={user} onLogout={logout} />
      <div className={styles.headerShadow} />

      <div className={styles.documentHeader}>
        <button className={styles.backButton} onClick={handleBackToDocuments}>
          ← Back to Documents
        </button>
        <h2 className={styles.documentTitle}>{documentData.display_name}</h2>
      </div>

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
