import styles from "./AdminHeader.module.css";
import { Link } from "react-router-dom";

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>ΛUMINΛ-BARBERSHOP admin</div>
      <nav className={styles.nav}>
        <Link to='/admin/statistics'>Статистика</Link>
        <Link to='/admin/employees'>Сотрудники</Link>
        <Link to='/admin/'>Таблица</Link>
        <a href="#contacts">Выйти</a>
      </nav>
    </header>
  );
}
