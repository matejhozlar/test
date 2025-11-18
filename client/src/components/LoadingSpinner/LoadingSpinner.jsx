import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = ({ message }) => {
  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinnerBox}>
        <div className={styles.spinner} />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
