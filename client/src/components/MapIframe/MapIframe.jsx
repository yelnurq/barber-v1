import styles from "./MapIframe.module.css";

export default function MapIframe({ src, title = "Карта" }) {
  // пример src (Google Maps iframe). Можно подставить свой.
  const defaultSrc =
    "https://yandex.kz/map-widget/v1/?ll=71.422443%2C51.128502&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1MzE2ODI0MRIg0prQsNC30LDSm9GB0YLQsNC9LCDQkNGB0YLQsNC90LAiCg1h3I5CFUeDTEI%2C&z=13.35";
  return (
    <div className={styles.mapWrap}>
      <iframe
        title={title}
        src={src || defaultSrc}
        className={styles.iframe}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
