import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import StickyCTA from "../components/StickyCTA.jsx";
import PosterArt from "../components/PosterArt.jsx";
import { EVENT } from "../config/eventConfig.js";
import styles from "./EventPage.module.css";

export default function EventPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Header />

      <main className="container">
        <section className={styles.hero}>
          <PosterArt imageUrl={EVENT.posterImageUrl} />
        </section>

        <section className={styles.titleBlock}>
          <h1 className={styles.title}>{EVENT.title}</h1>
          <p className={styles.tagline}>{EVENT.tagline}</p>
        </section>

        <section className={styles.infoRow}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Date</span>
            <span className={styles.infoValue}>{EVENT.date}</span>
          </div>
          <div className={styles.infoDivider} />
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Time</span>
            <span className={styles.infoValue}>{EVENT.time}</span>
          </div>
          <div className={styles.infoDivider} />
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Venue</span>
            <a
              className={styles.infoValueLink}
              href={EVENT.venue.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              {EVENT.venue.name}
            </a>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>About the night</h2>
          <p className={styles.body}>{EVENT.about}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>What's included</h2>
          <ul className={styles.includedList}>
            {EVENT.included.map((item) => (
              <li key={item} className={styles.includedItem}>
                <span className={styles.includedDot} />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.limitedBanner}>
          <span className={styles.pulse} />
          {EVENT.limitedSpotsText}
        </section>
      </main>

      <StickyCTA
        label="BOOK YOUR SPOT"
        onClick={() => navigate("/tickets")}
        fixedOnMobile
      />
    </div>
  );
}
