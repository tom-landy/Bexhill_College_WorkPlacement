"use client";

import { FormEvent, useState } from "react";

type ImportResult = {
  created: number;
  skipped: number;
  errors: string[];
  defaultPassword: string;
};

export function StudentImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a CSV or Excel file first.");
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/students/import", {
      method: "POST",
      body: formData
    });

    setLoading(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Import failed.");
      return;
    }

    const payload = (await response.json()) as ImportResult;
    setResult(payload);
  }

  return (
    <section className="rounded border bg-white p-4 space-y-3">
      <h3 className="text-lg font-semibold">Import Students (CSV/Excel)</h3>
      <p className="text-sm text-slate-600">
        Required columns: <code>name</code>, <code>email</code>, <code>yearGroup</code>, <code>tutorGroup</code>.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <button type="submit" className="bg-primary text-white" disabled={loading}>
          {loading ? "Importing..." : "Upload and Import"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="text-sm space-y-1">
          <p>Created: {result.created}</p>
          <p>Skipped: {result.skipped}</p>
          <p>Default student password: {result.defaultPassword}</p>
          {result.errors.length > 0 ? (
            <ul className="list-disc pl-5 text-red-700">
              {result.errors.slice(0, 8).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
