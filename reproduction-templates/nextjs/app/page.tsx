'use client';

export default function Home() {
  return (
    <main>
      <button
        onClick={() => {
          throw new Error('A frontend error occured');
        }}
      >
        Trigger Frontend Error
      </button>
      <br />
      <button
        onClick={() => {
          fetch('/api/error-route');
        }}
      >
        Trigger Backend Error
      </button>
    </main>
  );
}
