import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth/useAuth.js";
import Header from "../../components/Header/Header.jsx";
import styles from "./DocumentSelector.module.css";

const DocumentSelector = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUserDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents/user", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data.documents);

      if (data.documents.length === 1) {
        navigate(`/manual/${data.documents[0].id}`);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserDocuments();
  }, [fetchUserDocuments]);

  const handleDocumentClick = (documentId) => {
    navigate(`/manual/${documentId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header user={user} onLogout={logout} />
        <div className={styles.loading}>Loading your manuals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header user={user} onLogout={logout} />
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={styles.container}>
        <Header user={user} onLogout={logout} />
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h2>No Manuals Available</h2>
          <p>You don't have access to any manuals yet.</p>
          <p>Please contact your administrator to get access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header user={user} onLogout={logout} />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Select a Manual</h1>
          <p>Choose a manual to view from your assigned documents</p>
        </div>

        <div className={styles.grid}>
          {documents.map((doc) => (
            <button
              key={doc.id}
              className={styles.card}
              onClick={() => handleDocumentClick(doc.id)}
            >
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{doc.display_name}</h3>
                <p className={styles.cardMeta}>{doc.file_type.toUpperCase()}</p>
              </div>
              <div className={styles.cardArrow}>→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentSelector;
