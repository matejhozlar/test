import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ZoomableImage.module.css";

const ZoomableImage = ({ src }) => {
  const imgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState("center");
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = imgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const percentX = (mouseX / rect.width) * 100;
    const percentY = (mouseY / rect.height) * 100;

    setOrigin(`${percentX}% ${percentY}%`);

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 1), 5));
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...position };
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({
        x: offsetStart.current.x + dx,
        y: offsetStart.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt="Zoomed"
      onClick={(e) => e.stopPropagation()}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      className={styles.zoomedImg}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transformOrigin: origin,
        transition: isDragging ? "none" : "transform 0.2s",
        maxWidth: "none",
        maxHeight: "none",
      }}
    />
  );
};

export default ZoomableImage;
