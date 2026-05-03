import { redirect } from "next/navigation";

export default async function ProjectPunchItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/projects/${id}?tab=approvals`);
}
