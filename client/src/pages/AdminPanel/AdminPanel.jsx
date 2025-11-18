import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth/useAuth.js";
import Header from "../../components/Header/Header";
import UserManagement from "../../components/Admin/UserManagement";
import DocumentManagement from "../../components/Admin/DocumentManagement";
import styles from "./AdminPanel.module.css";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("users");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className={styles.container}>
      <Header user={user} onLogout={logout} />

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <h2 className={styles.title}>Admin Panel</h2>

          <nav className={styles.nav}>
            <button
              className={`${styles.navButton} ${
                activeTab === "users" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("users")}
            >
              User Management
            </button>

            <button
              className={`${styles.navButton} ${
                activeTab === "documents" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("documents")}
            >
              Document Management
            </button>
          </nav>
        </div>

        <div className={styles.main}>
          {activeTab === "users" && <UserManagement />}
          {activeTab === "documents" && <DocumentManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
