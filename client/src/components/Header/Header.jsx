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
          <button onClick={onLogout} className="btn" data-variant="secondary">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
