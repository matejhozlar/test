import { useState, useEffect } from "react";
import styles from "./DocumentManagement.module.css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { Plus } from "lucide-react";

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    file: null,
    displayName: "",
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/admin/documents", {
        credentials: "include",
      });
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file,
        displayName: formData.displayName || file.name,
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", formData.file);
      data.append("displayName", formData.displayName);

      const response = await fetch("/api/admin/documents", {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setShowUploadModal(false);
        setFormData({ file: null, displayName: "" });
        fetchDocuments();
      } else {
        setError(result.error || "Failed to upload document");
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      setError("Network error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchDocuments();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete document");
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Network error");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Document Management</h2>
        <button className="btn" onClick={() => setShowUploadModal(true)}>
          <Plus size={16} />
          Upload
        </button>
      </div>

      {documents.length === 0 ? (
        <div className={styles.empty}>
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {documents.map((doc) => (
            <div key={doc.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{doc.display_name}</h3>
                <p className={styles.cardMeta}>
                  {doc.file_type.toUpperCase()} •{" "}
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(doc.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className={styles.modal} onClick={() => setShowUploadModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Upload Document</h3>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleUpload}>
              <div className={styles.formGroup}>
                <label>File</label>
                <input
                  type="file"
                  accept=".html,.docx"
                  onChange={handleFileChange}
                  required
                  disabled={uploading}
                />
                <p className={styles.hint}>Supported formats: HTML, DOCX</p>
              </div>

              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="Enter document name"
                  required
                  disabled={uploading}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn"
                  data-variant="secondary"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={uploading || !formData.file}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
