export function RouteShell({ title, detail }: { title: string; detail?: string }) {
  return (
    <section className="bg-white rounded border p-4 space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      {detail ? <p className="text-sm text-slate-700">{detail}</p> : null}
    </section>
  );
}
