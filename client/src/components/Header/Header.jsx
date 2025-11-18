import React from "react";
import styles from "./Header.module.css";

function Header() {
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
    </header>
  );
}

export default Header;
