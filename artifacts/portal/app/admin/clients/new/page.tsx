"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useApi } from "@/lib/api-browser";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreatedClient {
  id: string;
}

export default function NewClientPage() {
  const router = useRouter();
  const { api } = useApi();
  const [companyName, setCompanyName] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api<CreatedClient>("/clients", {
        method: "POST",
        body: {
          companyName: companyName.trim(),
          primaryContactName: primaryContactName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      router.push(`/admin/clients/${created.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    companyName.trim() && primaryContactName.trim() && email.trim();

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up space-y-6">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          New client
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new client company to the portal.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            Company details
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Company name *"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Primary contact name *"
              value={primaryContactName}
              onChange={(e) => setPrimaryContactName(e.target.value)}
              required
            />
            <Input
              label="Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-primary)]">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!canSubmit || submitting}
                size="lg"
              >
                {submitting ? "Creating…" : "Create client"}
              </Button>
              <Link href="/admin/clients">
                <Button type="button" variant="ghost" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
