import styles from "./Services.module.css";

export default function Services() {
  const services = [
    { id: 1, name: "Мужская стрижка", price: 5000, duration: 40 },
    { id: 2, name: "Стрижка бороды", price: 3000, duration: 30 },
    { id: 3, name: "Стрижка + Борода", price: 7000, duration: 60 },
    { id: 4, name: "Детская стрижка", price: 4000, duration: 35 },
    { id: 5, name: "Камуфляж седины", price: 6000, duration: 45 },
    { id: 6, name: "Королевское бритьё опасной бритвой", price: 4500, duration: 40 },
    { id: 7, name: "VIP-уход (стрижка + борода + уход за лицом)", price: 12000, duration: 90 },
    { id: 8, name: "Стрижка машинкой (одна насадка)", price: 2500, duration: 20 },
    { id: 9, name: "Укладка волос", price: 2000, duration: 15 },
    { id: 10, name: "Коррекция усов", price: 1500, duration: 10 },
    { id: 11, name: "Комплекс «Отец + сын»", price: 9000, duration: 70 },
    { id: 12, name: "Мужской спа-уход за лицом", price: 8000, duration: 50 },
  ];
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
