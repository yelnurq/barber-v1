import styles from "./Modal.module.css";

export default function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✖</button>
        {children}
      </div>
    </div>
  );
}
