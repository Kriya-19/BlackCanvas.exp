import styles from "./PosterArt.module.css";

/**
 * Generative hero visual used until a real event photo is dropped in.
 * To swap in a photo: set EVENT.posterImageUrl in config/eventConfig.js
 * and this component will render it instead.
 */
export default function PosterArt({ imageUrl }) {
  if (imageUrl) {
    return (
      <div className={styles.frame}>
        <img src={imageUrl} alt="Wild Night event poster" className={styles.photo} />
        <div className={styles.vignette} />
      </div>
    );
  }

  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.glowA} />
      <div className={styles.glowB} />
      <svg
        className={styles.grain}
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
      >
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" opacity="0.35" />
      </svg>
      <div className={styles.mono}>WN</div>
      <div className={styles.lines}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.vignette} />
    </div>
  );
}
