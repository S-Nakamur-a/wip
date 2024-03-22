import styles from "./page.module.css";
import Link from 'next/link'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Game</h1>
      <ul>
        <li><Link href="games/sudoku">数独</Link></li>
        <li><Link href="games/wsort">色水ソート</Link></li>
      </ul>
    </div>
  );
}
