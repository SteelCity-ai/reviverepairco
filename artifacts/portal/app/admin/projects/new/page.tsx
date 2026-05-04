import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { api } from "@/lib/api-server";
import type { Client, UserProfile } from "@/lib/db";
import NewProjectForm from "./NewProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [clients, users] = await Promise.all([
    api<Client[]>("/clients"),
    api<UserProfile[]>("/users?role=ADMIN"),
  ]);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up space-y-6">
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          New project
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a project for one of your clients.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            Project details
          </h3>
        </CardHeader>
        <CardContent>
          <NewProjectForm
            clients={clients ?? []}
            projectManagers={users ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
