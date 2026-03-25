import { Suspense } from "react";
import EditProjectView from "@/app/pages/edit/project/EditProjectView";
import {
  fetchProjectById,
  fetchManager,
  fetchProjectStates,
  getClient,
} from "@/services/api";

export default async function ProjectEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const resultProject = await fetchProjectById(id);
  const managerResult = await fetchManager();
  const stateResult = await fetchProjectStates();
  const clientResult = await getClient();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProjectView
        project={resultProject.data}
        manager={managerResult || []}
        states={stateResult}
        clients={clientResult}
      />
    </Suspense>
  );
}
