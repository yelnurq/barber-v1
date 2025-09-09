import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import styles from "./Address.module.css";

export default function Address() {
  return (
    <section className={styles.address} id="contacts">
        <div className={styles.container}>
                <h2>Наш адрес</h2>

      <div className={styles.itemList}>
        <div className={styles.item}>
        <FaMapMarkerAlt className={styles.icon} />
        <span>Астана, ул. Люмина</span>
      </div>

      <div className={styles.item}>
        <FaClock className={styles.icon} />
        <span>10:00 – 22:00</span>
      </div>

      <div className={styles.item}>
        <FaPhoneAlt className={styles.icon} />
        <span>+7 (700) 777 7799</span>
      </div>

      <div className={styles.item}>
        <FaEnvelope className={styles.icon} />
        <span>barber@lumina.kz</span>
      </div>
      </div>
        </div>
    </section>
  );
}
