"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { apiCall } from "@/lib/api-client";

interface ClientLite {
  id: string;
  companyName: string;
}

const ROLE_OPTIONS = [
  { value: "CREW", label: "Crew" },
  { value: "ADMIN", label: "Admin" },
  { value: "CLIENT", label: "Client" },
];

export default function InviteUserButton({ clients }: { clients: ClientLite[] }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    role: "CREW",
    clientId: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = await getToken();
      await apiCall("/users/invite", {
        method: "POST",
        token,
        body: {
          email: form.email,
          role: form.role,
          clientId: form.role === "CLIENT" ? form.clientId : undefined,
        },
      });
      setOpen(false);
      setForm({ email: "", role: "CREW", clientId: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        + Invite User
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Invite User" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          />
          {form.role === "CLIENT" && (
            <Select
              label="Linked Client"
              options={[
                { value: "", label: "Select a client…" },
                ...clients.map((c) => ({ value: c.id, label: c.companyName })),
              ]}
              value={form.clientId}
              onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              required
            />
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Sending…" : "Send Invitation"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
