import { Suspense } from "react";
import ClientViewProjectDetail from "@/app/pages/detail/project_detail/ProjectPageClient";
import { fetchProjectById } from "@/services/api";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const resultProject = await fetchProjectById(id);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientViewProjectDetail project={resultProject.data} />
    </Suspense>
  );
}
