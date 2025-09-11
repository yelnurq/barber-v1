// src/pages/admin/EmployeesAdmin.jsx
import { useState, useEffect } from "react";
import styles from "./EmployeesAdmin.module.css";
import axiosInstance from "../../../api/axios";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";

export default function EmployeesAdmin() {
  const [masters, setMasters] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
  });

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const res = await axiosInstance.get("/masters");
      setMasters(res.data);
    } catch (err) {
      console.error("Ошибка загрузки мастеров", err);
    }
  };

  const saveMaster = async () => {
    try {
      if (editing) {
        await axiosInstance.put(`/masters/${editing}`, form);
      } else {
        await axiosInstance.post("/masters", form);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: "", phone: "", specialization: "" });
      fetchMasters();
    } catch (err) {
      console.error("Ошибка сохранения мастера", err);
    }
  };

const deleteMaster = async (id) => {
  if (!window.confirm("Удалить мастера?")) return;
  try {
    await axiosInstance.delete(`/masters/${id}`);
    fetchMasters();
  } catch (err) {
    console.error("Ошибка удаления", err);
  }
};


  const openEditModal = (master) => {
    setEditing(master.id);
    setForm({
      name: master.name,
      phone: master.phone,
      specialization: master.specialization,
    });
    setModalOpen(true);
  };

  return (
    <>
    <AdminHeader/>
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>Сотрудники</h2>
        <button onClick={() => setModalOpen(true)}>Добавить мастера</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Специальность</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {masters.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.phone}</td>
              <td>{m.specialization}</td>
              <td>
                <button className={styles.editBtn} onClick={() => openEditModal(m)}>✏️</button>
                <button className={styles.deleteBtn} onClick={() => deleteMaster(m.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editing ? "Редактировать мастера" : "Добавить мастера"}</h3>
            <input
              type="text"
              placeholder="Имя"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Телефон"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Специальность"
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            />
            <div className={styles.modalActions}>
              <button onClick={saveMaster}>{editing ? "Сохранить" : "Добавить"}</button>
              <button onClick={() => { setModalOpen(false); setEditing(null); }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
