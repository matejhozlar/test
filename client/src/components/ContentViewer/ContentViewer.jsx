import React from "react";
import styles from "./ContentViewer.module.css";

const ContentViewer = ({ htmlContent, contentRef }) => {
  return (
    <main className={styles.main}>
      <div className={styles.content} ref={contentRef}>
        <div
          dangerouslySetInnerHTML={{
            __html: htmlContent,
          }}
        />
      </div>
    </main>
  );
};

export default ContentViewer;
