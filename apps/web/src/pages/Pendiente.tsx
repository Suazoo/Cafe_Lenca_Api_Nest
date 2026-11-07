export default function Pendiente({ titulo }: { titulo: string }) {
  return (
    <section className="grid place-items-center rounded-3xl border border-border bg-surface px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">{titulo}</h1>
      <p className="mt-2 text-muted">Esta pantalla se construye en los próximos pasos.</p>
    </section>
  );
}