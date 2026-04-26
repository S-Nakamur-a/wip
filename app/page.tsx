import styles from "./page.module.css";
import Link from "next/link";

type Game = {
  href: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
};

const games: Game[] = [
  {
    href: "games/sudoku",
    title: "数独",
    subtitle: "Sudoku",
    description: "9×9 のマスに 1〜9 を埋めるロジックパズル。",
    icon: "🔢",
  },
  {
    href: "games/wsort",
    title: "色水ソート",
    subtitle: "Water Sort",
    description: "ボトルの水を移し替えて色ごとに揃える定番パズル。",
    icon: "🧪",
  },
];

export default function Home() {
  return (
    <main className={styles.dashboard}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Game</h1>
        <p className={styles.heroLead}>遊べるパズルゲーム集</p>
      </header>
      <section className={styles.cardGrid}>
        {games.map((g) => (
          <Link key={g.href} href={g.href} className={styles.card}>
            <div className={styles.cardIcon} aria-hidden>
              {g.icon}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTitleRow}>
                <span className={styles.cardTitle}>{g.title}</span>
                <span className={styles.cardSubtitle}>{g.subtitle}</span>
              </div>
              <p className={styles.cardDescription}>{g.description}</p>
            </div>
            <div className={styles.cardArrow} aria-hidden>
              →
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
