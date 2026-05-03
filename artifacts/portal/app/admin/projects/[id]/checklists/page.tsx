import { redirect } from "next/navigation";

export default async function ProjectChecklistsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/projects/${id}?tab=work`);
}
