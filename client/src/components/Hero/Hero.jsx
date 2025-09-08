import styles from "./Hero.module.css";

export default function Hero() {
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

      {/* затемнение */}
      <div className={styles.overlay}></div>

      {/* контент поверх видео */}
      <div className={styles.content}>
  <h1>Lumina BARBERSHOP</h1>
        <h2>Стрижки, борода и стиль — всё для настоящих мужчин</h2>
        <p>
          Мы создаём не просто прическу, а ваш имидж. <br />
          Опытные мастера, премиальная атмосфера и внимание к деталям.
        </p>        
        <a href="#booking" className={styles.button}>Позвонить</a>
        <a href="#booking" className={styles.button}>Записаться</a>
      </div>
    </section>
  );
}
