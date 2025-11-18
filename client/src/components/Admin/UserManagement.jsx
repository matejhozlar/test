import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";
import styles from "./UserManagement.module.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    isAdmin: false,
  });

  useEffect(() => {
    fetchUsers();
    fetchDocuments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/admin/documents", {
        credentials: "include",
      });
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const generateUsername = async () => {
    try {
      const response = await fetch("/api/admin/generate/username", {
        credentials: "include",
      });
      const data = await response.json();
      setFormData({ ...formData, username: data.username });
    } catch (error) {
      console.error("Error generating username:", error);
    }
  };

  const generatePassword = async () => {
    try {
      const response = await fetch("/api/admin/generate/password", {
        credentials: "include",
      });
      const data = await response.json();
      setFormData({ ...formData, password: data.password });
    } catch (error) {
      console.error("Error generating password:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ username: "", password: "", isAdmin: false });
        fetchUsers();
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create a user:", error);
      setError("Network error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete a user:", error);
      alert("Network error");
    }
  };

  const openAssignModal = async (user) => {
    setSelectedUser(user);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/documents`, {
        credentials: "include",
      });
      const data = await response.json();

      const assignedIds = data.documents.map((d) => d.id);
      setDocuments((prev) =>
        prev.map((doc) => ({ ...doc, assigned: assignedIds.includes(doc.id) }))
      );

      setShowAssignModal(true);
    } catch (error) {
      console.error("Error fetching user documents:", error);
    }
  };

  const handleAssignDocuments = async () => {
    const documentIds = documents.filter((d) => d.assigned).map((d) => d.id);

    try {
      const response = await fetch(
        `/api/admin/users/${selectedUser.id}/documents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ documentIds }),
        }
      );

      if (response.ok) {
        setShowAssignModal(false);
        setSelectedUser(null);
      } else {
        alert("Failed to assign documents");
      }
    } catch (error) {
      console.log("Failed to assign documents:", error);
      alert("Network error");
    }
  };

  const toggleDocument = (docId) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, assigned: !doc.assigned } : doc
      )
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Management</h2>
        <button className="btn" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Create
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      user.is_admin ? styles.badgeAdmin : styles.badgeUser
                    }`}
                  >
                    {user.is_admin ? "Admin" : "User"}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className={styles.actionButton}
                    onClick={() => openAssignModal(user)}
                  >
                    Assign Docs
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Create New User</h3>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleCreateUser}>
              <div className={styles.formGroup}>
                <label>Username</label>
                <div className={styles.inputWithButton}>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                  <button type="button" onClick={generateUsername}>
                    Generate
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <div className={styles.inputWithButton}>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <button type="button" onClick={generatePassword}>
                    Generate
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.isAdmin}
                    onChange={(e) =>
                      setFormData({ ...formData, isAdmin: e.target.checked })
                    }
                  />
                  Admin User
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn"
                  data-variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedUser && (
        <div className={styles.modal} onClick={() => setShowAssignModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Assign Documents to {selectedUser.username}</h3>

            <div className={styles.documentList}>
              {documents.map((doc) => (
                <label key={doc.id} className={styles.documentItem}>
                  <input
                    type="checkbox"
                    checked={doc.assigned || false}
                    onChange={() => toggleDocument(doc.id)}
                  />
                  <span>{doc.display_name}</span>
                </label>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className="btn"
                data-variant="secondary"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleAssignDocuments}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
