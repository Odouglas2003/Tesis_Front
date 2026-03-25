import { Suspense } from "react";
import EditClientView from "@/app/pages/edit/employe/EditClientView";
import {
  getColabById,
  getUsers,
  fetchProjects,
  getActiveSkills,
} from "@/services/api";

export default async function ProjectEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skills = await getActiveSkills();
  const projects = await fetchProjects();
  const resultColabId = await getColabById(id);
  const users = await getUsers();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditClientView
        project={projects}
        colab={resultColabId.collaborator}
        users={users}
        skill={skills}
      />
    </Suspense>
  );
}
