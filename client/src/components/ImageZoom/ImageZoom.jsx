import React from "react";
import ZoomableImage from "../ZoomableImage/ZoomableImage";
import styles from "./ImageZoom.module.css";

const ImageZoom = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      tabIndex={-1}
      role="dialog"
      aria-label="Zoomed image viewer"
    >
      <ZoomableImage src={imageSrc} />
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default ImageZoom;
