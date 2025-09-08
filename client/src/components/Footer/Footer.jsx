import { FaInstagram, FaFacebook, FaTelegram, FaPhoneAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Левая часть */}
        <div className={styles.info}>
          <h2 className={styles.logo}>Lumina Barbershop</h2>
          <p className={styles.desc}>
            Атмосфера стиля и мужского уюта. Мы ценим ваше время и делаем так, чтобы вы выглядели на высшем уровне.
          </p>
        </div>

        {/* Контакты */}
        <div className={styles.contacts}>
          <h3>Контакты</h3>
          <p><FaPhoneAlt /> +7 (777) 123-45-67</p>
          <p><FaMapMarkerAlt /> г. Алматы, Абая 123</p>
          <p><FaClock /> Ежедневно: 10:00 – 22:00</p>
        </div>

        {/* Соцсети */}
        <div className={styles.socials}>
          <h3>Мы в сети</h3>
          <div className={styles.icons}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
            <a href="https://t.me" target="_blank" rel="noreferrer"><FaTelegram /></a>
          </div>
        </div>

      </div>

      {/* Нижняя полоса */}
      <div className={styles.bottom}>
        <p>© 2025 Lumina Barbershop. Все права защищены.</p>
      </div>
    </footer>
  );
}
