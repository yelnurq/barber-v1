import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>ΛUMINΛ-BARBERSHOP</div>
      <nav className={styles.nav}>
        <a href="#booking">Запись</a>
        <a href="#services">Услуги</a>
        <a href="#masters">Мастера</a>
        <a href="#reviews">Отзывы</a>
        <a href="#contacts">Контакты</a>
      </nav>
    </header>
  );
}
