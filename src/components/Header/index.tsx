import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <a>
          <Image src="/assets/logo.svg" width={220} height={25} alt="logo" />
        </a>
      </Link>
    </header>
  );
}
