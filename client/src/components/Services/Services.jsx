import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import styles from "./Services.module.css";

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const res = await axiosInstance.get("/services");
      setServices(res.data);
    };
    fetchServices();
  }, []);

  return (
    <section className={styles.services} id="services"> 

      <h2 className={styles.title}>Наши услуги</h2>
      <div className={styles.list}>
        {services.map((s) => (
          <div key={s.id} className={styles.item}>
            <span className={styles.name}>{s.name}</span>
            <span className={styles.price}>{s.price} ₸</span>
          </div>
        ))}
      </div>

    </section>
  );
}
