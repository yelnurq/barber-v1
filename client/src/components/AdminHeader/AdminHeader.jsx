import styles from "./AdminHeader.module.css";
import { Link } from "react-router-dom";

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>ΛUMINA-BARBERSHOP</div>
      <nav className={styles.nav}>
        <Link to='/admin/'>Таблица</Link>
        <Link to='/admin/statistics'>Статистика</Link>
        <Link to='/admin/employees'>Сотрудники</Link>
        <a href="#contacts">Выйти</a>
      </nav>
    </header>
  );
}
