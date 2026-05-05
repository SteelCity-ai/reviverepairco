"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api-browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Client, UserProfile } from "@/lib/db";

interface CreatedProject {
  id: string;
}

export default function NewProjectForm({
  clients,
  projectManagers,
}: {
  clients: Client[];
  projectManagers: UserProfile[];
}) {
  const router = useRouter();
  const { api } = useApi();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectManagerUserId, setProjectManagerUserId] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetEndDate, setTargetEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api<CreatedProject>("/projects", {
        method: "POST",
        body: {
          name: name.trim(),
          clientId,
          projectManagerUserId: projectManagerUserId || undefined,
          siteAddress: siteAddress.trim()
            ? { line1: siteAddress.trim() }
            : undefined,
          startDate: startDate || undefined,
          targetEndDate: targetEndDate || undefined,
        },
      });
      router.push(`/admin/projects/${created.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = name.trim() && clientId;

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Project name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Select
        label="Client *"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        required
        placeholder="Select a client…"
        options={clients.map((c) => ({ value: c.id, label: c.companyName }))}
      />
      <Select
        label="Project manager"
        value={projectManagerUserId}
        onChange={(e) => setProjectManagerUserId(e.target.value)}
        options={[
          { value: "", label: "Unassigned" },
          ...projectManagers.map((u) => ({
            value: u.id,
            label: u.displayName,
          })),
        ]}
      />
      <Input
        label="Site address"
        value={siteAddress}
        onChange={(e) => setSiteAddress(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="Target end date"
          type="date"
          value={targetEndDate}
          onChange={(e) => setTargetEndDate(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={!canSubmit || submitting} size="lg">
          {submitting ? "Creating…" : "Create project"}
        </Button>
        <Link href="/admin/projects">
          <Button type="button" variant="ghost" size="lg">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
