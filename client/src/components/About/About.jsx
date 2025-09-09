import { useState } from "react";
import styles from './About.module.css'

export default function About() {
    const images = [
        "./images/img.jpg",
        "./images/img1.jpg",
        "./images/img2.jpg",
        "./images/img3.jpg",
        // "./images/img.jpg",
    ];

    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + images.length) % images.length);
    };

    // показываем сразу 3 картинки подряд
    const visibleSlides = [
        images[current],
        images[(current + 1) % images.length],
        images[(current + 2) % images.length],
    ];

    return (
        <section className={styles.about} id="gallery">
                <h2>Наша галерея</h2>
            <div className={styles.container}>

                <div className={styles.image}>
                    <img src="./images/img.jpg" alt="Барбершоп" />
                </div>
                <div className={styles.text}>
                    <p>
                        Это место, где стиль встречается с традицией. 
                        Мы создаём атмосферу настоящей мужской территории: классические стрижки, 
                        современный фейд, оформление бороды и индивидуальный подход к каждому клиенту. 
                        Здесь можно не только привести себя в порядок, но и отдохнуть за чашкой кофе, 
                        пообщаться и почувствовать себя уверенно.  
                        <br /><br />
                        Мы ценим ваше время и <span className={styles.textSpan}>гарантируем качественный результат.</span>  
                        Приходите — и убедитесь сами!
                    </p>
                </div>
            </div>

            {/* Грид-слайдер */}
            <div className={styles.slider}>
                <button className={styles.prev} onClick={prevSlide}>‹</button>
                <div className={styles.slides}>
                    {visibleSlides.map((src, idx) => (
                        <div key={idx} className={styles.slide}>
                            <img src={src} alt={`Слайд ${idx + 1}`} />
                        </div>
                    ))}
                </div>
                <button className={styles.next} onClick={nextSlide}>›</button>
            </div>
        </section>
    )
}
