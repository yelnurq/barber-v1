import { useState } from "react";
import styles from "./Hero.module.css";
import BookingForm from "../BookingForm/BookingForm";
import Modal from "../BookingForm/Modal";

export default function Hero() {
  const [open, setOpen] = useState(false);

  return (
    <section className={styles.hero}>
      <video
        src="./video/video.mp4"
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
      ></video>

      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <h1>Lumina BARBERSHOP</h1>
        <h2>Стрижки, борода и стиль — всё для настоящих мужчин</h2>
        <p>
          Мы создаём не просто прическу, а ваш имидж. <br />
          Опытные мастера, премиальная атмосфера и внимание к деталям.
        </p>
        <a href="tel:+77001234567" className={styles.button}>Позвонить</a>
        <button onClick={() => setOpen(true)} className={styles.button}>
          Записаться
        </button>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <h2>Онлайн-запись</h2>
        <BookingForm />
      </Modal>
    </section>
  );
}
