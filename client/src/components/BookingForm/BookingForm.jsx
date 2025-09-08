import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import styles from "./BookingForm.module.css";

export default function BookingForm() {
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    master_id: "",
    service_id: "",
    date: "",
    time: ""
  });
  const [calendarDate, setCalendarDate] = useState(null);
  const [masters, setMasters] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Загрузка мастеров и услуг
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mastersRes, servicesRes] = await Promise.all([
          axiosInstance.get("/masters"),
          axiosInstance.get("/services")
        ]);
        setMasters(mastersRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      }
    };
    fetchData();
  }, []);

  // Получение занятых слотов
  const getSlots = async (date, master_id) => {
    try {
      const res = await axiosInstance.get(
        `/appointments/slots?date=${date}&master_id=${master_id}`
      );
      setSlots(res.data.booked || []);
    } catch (err) {
      console.error("Ошибка слотов:", err);
    }
  };

  // Обновление слотов при выборе даты и мастера
  useEffect(() => {
    if (form.date && form.master_id) {
      getSlots(form.date, form.master_id);
    }
  }, [form.date, form.master_id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/appointments", {
        ...form,
        date_time: `${form.date}T${form.time}`
      });
      setSuccess(true);
      setError("");
      setForm({
        client_name: "",
        client_phone: "",
        master_id: "",
        service_id: "",
        date: "",
        time: ""
      });
      setCalendarDate(null);
      setSlots([]);
    } catch (err) {
      setError("Ошибка при записи. Попробуйте снова.");
      console.error(err);
    }
  };

  // Генерация часов
  const generateHours = () => {
    const hours = [];
    for (let h = 9; h <= 20; h++) {
      hours.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return hours;
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {success && <p style={{ color: "green" }}>✅ Запись успешно отправлена!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Имя и телефон */}
      <input
        type="text"
        name="client_name"
        placeholder="Ваше имя"
        value={form.client_name}
        onChange={handleChange}
        className={styles.input}
        required
      />
      <input
        type="tel"
        name="client_phone"
        placeholder="Телефон"
        value={form.client_phone}
        onChange={handleChange}
        className={styles.input}
        required
      />

      {/* 1️⃣ Выбор услуги */}
      <select
        name="service_id"
        value={form.service_id}
        onChange={handleChange}
        className={styles.select}
        required
      >
        <option value="">Выберите услугу</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.price}₸)
          </option>
        ))}
      </select>

      {/* 2️⃣ Выбор мастера */}
      <select
        name="master_id"
        value={form.master_id}
        onChange={handleChange}
        className={styles.select}
        required
        disabled={!form.service_id}
      >
        <option value="">Выберите мастера</option>
        {masters.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} — {m.specialization}
          </option>
        ))}
      </select>

      {/* 3️⃣ Календарь */}
      {form.master_id && (
        <Calendar
          minDate={new Date()}
          onChange={(date) => {
            setCalendarDate(date);
            setForm({
              ...form,
              date: date.toISOString().split("T")[0]
            });
          }}
          value={calendarDate}
        />
      )}

      {/* 4️⃣ Выбор времени */}
      {form.date && (
        <div className={styles.timeGrid}>
          {generateHours().map((hour) => {
            const isBooked = slots.includes(hour);
            return (
              <button
                key={hour}
                type="button"
                disabled={isBooked}
                className={`${styles.timeSlot} ${form.time === hour ? styles.active : ""}`}
                onClick={() => setForm({ ...form, time: hour })}
              >
                {hour}
              </button>
            );
          })}
        </div>
      )}

      <button type="submit" className={styles.button} disabled={!form.time}>
        Записаться
      </button>
    </form>
  );
}
