import { redirect } from "next/navigation";

export default async function ProjectSelectionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/projects/${id}?tab=work`);
}
