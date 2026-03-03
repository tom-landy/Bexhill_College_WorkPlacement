"use client";

import { FormEvent, useMemo, useState } from "react";

type StudentOption = {
  id: string;
  label: string;
};

type EmployerContact = {
  id: string;
  name: string;
};

type EmployerOption = {
  id: string;
  name: string;
  contacts: EmployerContact[];
};

export function PlacementAssignmentForm({
  students,
  employers
}: {
  students: StudentOption[];
  employers: EmployerOption[];
}) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [employerId, setEmployerId] = useState(employers[0]?.id ?? "");
  const [supervisorContactId, setSupervisorContactId] = useState(employers[0]?.contacts[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoursTarget, setHoursTarget] = useState("100");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const contacts = useMemo(
    () => employers.find((e) => e.id === employerId)?.contacts ?? [],
    [employerId, employers]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const response = await fetch("/api/placements/assign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        studentId,
        employerId,
        supervisorContactId,
        startDate,
        endDate,
        hoursTarget: Number(hoursTarget)
      })
    });

    setLoading(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Could not create placement.");
      return;
    }

    setMessage("Placement assigned successfully.");
  }

  return (
    <section className="rounded border bg-white p-4 space-y-3">
      <h3 className="text-lg font-semibold">Assign Student to Employer</h3>
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Student</label>
          <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Employer</label>
          <select
            value={employerId}
            onChange={(event) => {
              const nextEmployerId = event.target.value;
              const nextContacts = employers.find((e) => e.id === nextEmployerId)?.contacts ?? [];
              setEmployerId(nextEmployerId);
              setSupervisorContactId(nextContacts[0]?.id ?? "");
            }}
          >
            {employers.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Supervisor Contact</label>
          <select
            value={supervisorContactId}
            onChange={(event) => setSupervisorContactId(event.target.value)}
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Hours Target</label>
          <input value={hoursTarget} onChange={(event) => setHoursTarget(event.target.value)} type="number" min={1} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Start Date</label>
          <input value={startDate} onChange={(event) => setStartDate(event.target.value)} type="date" required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">End Date</label>
          <input value={endDate} onChange={(event) => setEndDate(event.target.value)} type="date" required />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="bg-primary text-white" disabled={loading}>
            {loading ? "Assigning..." : "Create Placement"}
          </button>
        </div>
      </form>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
