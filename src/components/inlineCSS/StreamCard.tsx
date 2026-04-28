// components/StreamCard/StreamCard.tsx

import styles from "./StreamCard.module.css";

type Props = {
  title: string;
  sender: string;
};

export default function StreamCard({ title, sender }: Props) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.sender}>{sender}</p>
    </div>
  );
}