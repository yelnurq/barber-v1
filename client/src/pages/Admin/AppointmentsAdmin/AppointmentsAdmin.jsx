import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./AppointmentsAdmin.module.css";
import axiosInstance from "../../../api/axios";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";

export default function AppointmentsAdmin() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [masters, setMasters] = useState([]);
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    master_id: "",
    date: "",
    time: "",
    client_name: "",
    client_phone: "",
    service_id: "",
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 9);

  const statuses = [
    { value: "booked", label: "📌 Забронировано", color: "#facc15" },
    { value: "confirmed", label: "✅ Завершено", color: "#22c55e" },
    { value: "cancelled", label: "❌ Отменено", color: "#ef4444" },
  ];

  const formatDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  useEffect(() => {
    fetchMasters();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchAppointments(date);
  }, [date]);

  const fetchMasters = async () => {
    try {
      const res = await axiosInstance.get("/masters");
      setMasters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async (d) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/schedule/${formatDate(d)}`);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAppointment = (masterId, hour) =>
    appointments.find(
      (a) => a.master_id === masterId && new Date(a.date_time).getHours() === hour
    );

  const createAppointment = async () => {
    try {
      await axiosInstance.post("/admin/appointments", {
        ...form,
        date_time: `${form.date} ${form.time}:00`,
      });
      setModalOpen(false);
      fetchAppointments(date);
    } catch (err) {
      console.error(err.response?.data?.errors || err);
    }
  };

  const updateStatus = async (app, newStatus) => {
    try {
      await axiosInstance.put(`/appointments/${app.id}`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
      );
      setEditing(null);
    } catch (err) {
      console.error(err);
    }
  };
const formatDateNumeric = (date) => {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

  return (
    <>
      <AdminHeader />
      <div className={styles.wrapper}>
        {/* Левая колонка: календарь + выручка */}
        <div className={styles.leftColumn}>
          <div className={styles.calendarBox}>
            <Calendar value={date} onChange={setDate} />
          </div>

          {loading ? (
            <div className={styles.skeletonRevenue}>
              {masters.map((_, idx) => (
                <div key={idx} className={styles.skeletonRevenueRow}>
                  <div className={styles.skeletonCell}></div>
                  <div className={styles.skeletonCell}></div>
                  <div className={styles.skeletonCell}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.revenue}>
              <h3>{formatDateNumeric(date)}</h3>
              <table className={styles.revenueTable}>
                <thead>
                  <tr>
                    <th>Сотрудник</th>
                    <th>Общая</th>
                    <th>✅ Confirmed</th>
                  </tr>
                </thead>
                <tbody>
                  {masters.map((m) => {
                    const all = appointments
                      .filter((a) => a.master_id === m.id)
                      .reduce((sum, a) => sum + (a.service?.price || 0), 0);

                    const confirmed = appointments
                      .filter((a) => a.master_id === m.id && a.status === "confirmed")
                      .reduce((sum, a) => sum + (a.service?.price || 0), 0);

                    return (
                      <tr key={m.id}>
                        <td>{m.name}</td>
                        <td>{all}₸</td>
                        <td>{confirmed}₸</td>
                      </tr>
                    );
                  })}
                  <tr className={styles.totalRow}>
                    <td>
                      <b>Итого</b>
                    </td>
                    <td>
                      <b>
                        {appointments.reduce(
                          (sum, a) => sum + (a.service?.price || 0),
                          0
                        )}
                        ₸
                      </b>
                    </td>
                    <td>
                      <b>
                        {appointments
                          .filter((a) => a.status === "confirmed")
                          .reduce((sum, a) => sum + (a.service?.price || 0), 0)}
                        ₸
                      </b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Правая колонка: расписание */}
        <div className={styles.rightColumn}>
          <div className={styles.scheduleWrapper}>
            {loading ? (
              <div className={styles.skeletonWrapper}>
                {/* Заголовки */}
                <div className={styles.skeletonHeader}>
                  <div className={styles.skeletonCell}></div>
                  {masters.map((_, idx) => (
                    <div key={idx} className={styles.skeletonCell}></div>
                  ))}
                </div>

                {/* Строки расписания */}
                {hours.map((_, idx) => (
                  <div key={idx} className={styles.skeletonRow}>
                    <div className={styles.skeletonCell}></div>
                    {masters.map((_, i) => (
                      <div key={i} className={styles.skeletonCell}></div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.schedule}>
                <table>
                  <thead>
                    <tr>
                      <th>Время</th>
                      {masters.map((m) => (
                        <th key={m.id}>{m.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hours.map((hour) => (
                      <tr key={hour}>
                        <td>{hour}:00</td>
                        {masters.map((m) => {
                          const app = getAppointment(m.id, hour);
                          return (
                            <td
                              key={m.id}
                              className={app ? styles.busyCard : styles.freeCard}
                              onClick={() => {
                                if (!app) {
                                  setForm({
                                    master_id: m.id,
                                    date: formatDate(date),
                                    time: `${hour.toString().padStart(2, "0")}:00`,
                                    client_name: "",
                                    client_phone: "",
                                    service_id: "",
                                  });
                                  setModalOpen(true);
                                }
                              }}
                            >
                              {app ? (
                                <div
                                  className={styles.appCard}

                                >
                                  <div className={styles.clientName}>{app.client_name}</div>
                                  <div className={styles.serviceInfo}>
                                    {app.service?.name} — {app.service?.price || 0}₸
                                  </div>
                                  <div className={styles.phone}>
                                    📞{" "}
                                    <a href={`tel:${app.client_phone}`}>+{app.client_phone}</a>
                                  </div>

                                  {editing === app.id ? (
                                    <select
                                      autoFocus
                                      value={app.status || "booked"}
                                      onChange={(e) => updateStatus(app, e.target.value)}
                                      onBlur={() => setEditing(null)}
                                      className={styles.statusSelect}
                                    >
                                      {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>
                                          {s.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div
                                      className={styles.status}
                                      style={{
                                        background:
                                          statuses.find((s) => s.value === app.status)?.color ||
                                          "#9ca3af",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditing(app.id);
                                      }}
                                    >
                                      {statuses.find((s) => s.value === app.status)?.label ||
                                        "📌 Забронировано"}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span>Свободно</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Новая запись</h3>
            <input
              type="text"
              placeholder="Имя клиента"
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Телефон"
              value={form.client_phone}
              onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
            />
            <select
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
            >
              <option value="">Выберите услугу</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.price}₸
                </option>
              ))}
            </select>
            <div className={styles.modalActions}>
              <button onClick={createAppointment}>Сохранить</button>
              <button onClick={() => setModalOpen(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
