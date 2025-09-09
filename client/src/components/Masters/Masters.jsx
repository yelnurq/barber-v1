import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import styles from "./Masters.module.css";

export default function Masters() {
  const [masters, setMasters] = useState([]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const res = await axiosInstance.get("/masters");
        setMasters(res.data);
      } catch (error) {
        console.error("Ошибка при загрузке мастеров:", error);
      }
    };
    fetchMasters();
  }, []);

  return (
    <section className={styles.masters}>
      <h2 className={styles.title}>Наши старшие мастера</h2>
      <div className={styles.grid}>
        {masters.map((m) => (
          <div key={m.id} className={styles.card}>
            <div className={styles.photoWrapper}>
<img
  src={m.photo || "/images/default.jpg"}
  alt={m.name}
  className={styles.photo}
  onError={(e) => (e.target.src = "/images/default.jpg")}
/>

            </div>
            <h3 className={styles.name}>{m.name}</h3>
            <p className={styles.spec}>{m.specialization}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
