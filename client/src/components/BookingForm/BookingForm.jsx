import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

export default function BookingForm() {
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    master_id: "",
    service_id: "",
    date_time: ""
  });

  const [masters, setMasters] = useState([]);
  const [services, setServices] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Загружаем мастеров и услуги
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
        console.error("Ошибка загрузки данных:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/appointments", form);
      setSuccess(true);
      setError("");
      setForm({
        client_name: "",
        client_phone: "",
        master_id: "",
        service_id: "",
        date_time: ""
      });
    } catch (err) {
      setError("Ошибка при записи. Попробуйте снова.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Онлайн-запись</h2>
      {success && <p style={{ color: "green" }}>✅ Ваша запись успешно отправлена!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="client_name"
          placeholder="Ваше имя"
          value={form.client_name}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="client_phone"
          placeholder="Телефон"
          value={form.client_phone}
          onChange={handleChange}
          required
        />
        <select
          name="master_id"
          value={form.master_id}
          onChange={handleChange}
          required
        >
          <option value="">Выберите мастера</option>
          {masters.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.specialization}
            </option>
          ))}
        </select>

        <select
          name="service_id"
          value={form.service_id}
          onChange={handleChange}
          required
        >
          <option value="">Выберите услугу</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.price}₸)
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          name="date_time"
          value={form.date_time}
          onChange={handleChange}
          required
        />

        <button type="submit">Записаться</button>
      </form>
    </div>
  );
}
