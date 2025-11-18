import styles from "./Header.module.css";

function Header({ user, onLogout }) {
  return (
    <header className={styles.header}>
      <div className={styles.logoTagline}>
        <img
          src="/assets/logo/honeywell-logo.svg"
          alt="Honeywell Logo"
          className={styles.logo}
        />
        <h2 className={styles.tagline}>Ground Control Station</h2>
      </div>

      {user && (
        <div className={styles.userSection}>
          <span className={styles.username}>
            {user.username}
            {user.isAdmin && <span className={styles.adminBadge}>Admin</span>}
          </span>
          <button onClick={onLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
