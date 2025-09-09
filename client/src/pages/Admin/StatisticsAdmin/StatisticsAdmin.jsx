import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import styles from "./StatisticsAdmin.module.css";

export default function StatisticsAdmin() {
  const [date, setDate] = useState(new Date());
  const [stats, setStats] = useState([]);
  const [totalDb, setTotalDb] = useState(0);

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get(`/admin/statistics/${formatDate(date)}`);
      setStats(res.data);
    } catch (err) {
      console.error("Ошибка загрузки статистики", err);
    }
  };

  const fetchTotalDb = async () => {
    try {
      const res = await axiosInstance.get(`/admin/statistics-total`);
      setTotalDb(res.data.total);
    } catch (err) {
      console.error("Ошибка загрузки общей суммы", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTotalDb();
  }, [date]);

  const totalAll = stats.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalConfirmed = stats.reduce((sum, s) => sum + (s.confirmed || 0), 0);

  return (
    <div className={styles.wrapper}>
      <h2>📊 Статистика за {formatDate(date)}</h2>
      <table className={styles.statsTable}>
        <thead>
          <tr>
            <th>Мастер</th>
            <th>Всего</th>
            <th>✅ Подтверждено</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.master_id}>
              <td>{s.master_name}</td>
              <td>{s.total}₸</td>
              <td>{s.confirmed}₸</td>
            </tr>
          ))}
          <tr className={styles.totalRow}>
            <td>Итого за день</td>
            <td>{totalAll}₸</td>
            <td>{totalConfirmed}₸</td>
          </tr>
          <tr className={styles.totalRow}>
            <td>Общее в базе</td>
            <td colSpan={2}>{totalDb}₸</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
