import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import styles from "./Clients.module.css";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("visits"); // сортировка по умолчанию
  const [filterDate, setFilterDate] = useState(""); // фильтр по дате (например, месяц)

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get("/admin/clients");
      setClients(res.data);
    } catch (err) {
      console.error("Ошибка загрузки клиентов", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 поиск
  const filteredClients = clients
    .filter(
      (c) =>
        c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.client_phone?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((c) => {
      if (!filterDate) return true;
      if (!c.last_visit) return false;
      const visitMonth = new Date(c.last_visit).toISOString().slice(0, 7);
      return visitMonth === filterDate;
    })
    .sort((a, b) => {
      if (sortKey === "visits") return b.visits - a.visits;
      if (sortKey === "total_spent") return b.total_spent - a.total_spent;
      if (sortKey === "last_visit")
        return new Date(b.last_visit) - new Date(a.last_visit);
      return 0;
    });

  // 📊 статистика
  const totalClients = clients.length;
  const totalSpent = clients.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const avgCheck =
    clients.length > 0
      ? Math.round(totalSpent / clients.length)
      : 0;
  const topClient = [...clients].sort(
    (a, b) => b.total_spent - a.total_spent
  )[0];

  if (loading) {
    return <div className={styles.loader}>Загрузка...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h2>📒 База клиентов</h2>

      {/* 📊 Карточки статистики */}
      <div className={styles.stats}>
        <div className={styles.card}>
          👥 Всего клиентов: <b>{totalClients}</b>
        </div>
        <div className={styles.card}>
          💰 Общая сумма: <b>{totalSpent} ₸</b>
        </div>
        <div className={styles.card}>
          📈 Средний чек: <b>{avgCheck} ₸</b>
        </div>
        {topClient && (
          <div className={styles.card}>
            🏆 Топ-клиент: <b>{topClient.client_name}</b> ({topClient.total_spent} ₸)
          </div>
        )}
      </div>

      {/* 🔍 Поиск и фильтры */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Поиск по имени или номеру"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />

        {/* фильтр по месяцу */}
        <input
          type="month"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={styles.dateFilter}
        />

        {/* сортировка */}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className={styles.sort}
        >
          <option value="visits">🔄 По количеству визитов</option>
          <option value="total_spent">💰 По сумме</option>
          <option value="last_visit">📅 По последнему визиту</option>
        </select>
      </div>

      {/* 📋 Таблица */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Количество визитов</th>
            <th>Общая сумма</th>
            <th>Последний визит</th>
            <th>Заметка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.length > 0 ? (
            filteredClients.map((c, idx) => (
              <tr key={idx}>
                <td>{c.client_name || "—"}</td>
                <td>{c.client_phone}</td>
                <td>{c.visits}</td>
                <td>{c.total_spent} ₸</td>
                <td>
                  {c.last_visit
                    ? new Date(c.last_visit).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td>
                  {c.note || (
                    <button
                      onClick={() => alert("Тут можно добавить заметку")}
                      className={styles.addNote}
                    >
                      ➕
                    </button>
                  )}
                </td>
                <td>
                  <button
                    className={styles.btn}
                    onClick={() =>
                      alert(`История визитов ${c.client_name} скоро будет 😉`)
                    }
                  >
                    📖 История
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() =>
                      alert(`Отправить WhatsApp ${c.client_phone}`)
                    }
                  >
                    💬 Связаться
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className={styles.noData}>
                😢 Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
