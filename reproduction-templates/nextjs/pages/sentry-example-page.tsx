import Head from 'next/head';
import { SentryLogo } from '@/components/sentry-logo';
import styles from '@/styles/example-page-styles.module.css';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Sentry Onboarding</title>
        <meta name="description" content="Test Sentry for your Next.js app!" />
      </Head>
      <main className={styles.main}>
        <SentryLogo />
        <button
          className={styles.button}
          onClick={() => {
            throw new Error('Sentry Example Frontend Error');
          }}
        >
          Throw Frontend Error
        </button>
        <button
          className={styles.button}
          onClick={() => {
            fetch('/api/sentry-example-api');
          }}
        >
          Throw Backend Error
        </button>
      </main>
    </div>
  );
}
