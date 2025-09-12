import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axiosInstance from "../../../api/axios";
import styles from "./StatisticsAdmin.module.css";

// recharts
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function StatisticsAdmin() {
  const [date, setDate] = useState(new Date());
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState({
    total_sum: 0,
    total_clients: 0,
    avg_check: 0,
    top_service: null,
    top_master: null,
    byWeek: [],
    byMonth: []
  });
  const [today, setToday] = useState({
    total_sum: 0,
    total_clients: 0,
    top_service: null,
    top_master: null
  });

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

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get(`/admin/statistics-summary`);
      setSummary(res.data);
    } catch (err) {
      console.error("Ошибка загрузки сводной статистики", err);
    }
  };

  const fetchToday = async () => {
    try {
      const res = await axiosInstance.get(`/admin/statistics/${formatDate(new Date())}`);
      const total_sum = res.data.reduce((sum, s) => sum + (s.confirmed || 0), 0);
      const total_clients = res.data.reduce((sum, s) => sum + (s.confirmed_clients || 0), 0);
      const top_master = res.data.sort((a, b) => b.confirmed - a.confirmed)[0] || null;
      const top_service = res.data.sort((a, b) => b.service_sum - a.service_sum)[0] || null;

      setToday({
        total_sum,
        total_clients,
        top_master,
        top_service
      });
    } catch (err) {
      console.error("Ошибка загрузки сегодняшней статистики", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSummary();
    fetchToday();
  }, [date]);

  return (
    <div className={styles.wrapper}>
      <h2>📊 Статистика админки</h2>

      {/* Общая сводка */}
      <div className={styles.section}>
        <h3>🌍 Общая статистика</h3>
        <div className={styles.cards}>
          <div className={styles.card}>Общий доход: {summary.total_sum}₸</div>
          <div className={styles.card}>Клиентов всего: {summary.total_clients}</div>
          <div className={styles.card}>Средний чек: {summary.avg_check}₸</div>
          <div className={styles.card}>
            Лучший мастер: {summary.top_master?.master_name} ({summary.top_master?.confirmed_sum}₸)
          </div>
          <div className={styles.card}>
            Лучшая услуга: {summary.top_service?.name || "-"}
          </div>
        </div>
      </div>

      {/* Сегодня */}
      <div className={styles.section}>
        <h3>📅 Сегодня ({formatDate(new Date())})</h3>
        <div className={styles.cards}>
          <div className={styles.card}>Доход: {today.total_sum}₸</div>
          <div className={styles.card}>Клиентов: {today.total_clients}</div>
          <div className={styles.card}>
            Топ мастер: {today.top_master?.master_name || "-"} ({today.top_master?.confirmed || 0}₸)
          </div>
          <div className={styles.card}>
            Топ услуга: {today.top_service?.service_name || "-"}
          </div>
        </div>
      </div>
<div className={styles.summaryBox}>
  <h3>📊 Сравнение</h3>
  <ul>
    <li>Сегодня против вчера: {summary.today_vs_yesterday?.sum_change} по сумме, {summary.today_vs_yesterday?.clients_change} по клиентам</li>
    <li>Эта неделя против прошлой: {summary.this_week_vs_last_week?.sum_change} по сумме, {summary.this_week_vs_last_week?.clients_change} по клиентам</li>
  </ul>
</div>

      {/* По неделям */}
      <div className={styles.section}>
        <h3>🗓️ По неделям</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.byWeek}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#4ade80" name="Сумма" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* По месяцам */}
      <div className={styles.section}>
        <h3>📅 По месяцам</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={summary.byMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#6366f1" name="Сумма" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
