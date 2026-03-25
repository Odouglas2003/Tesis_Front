import { Suspense } from "react";
import EditVacancieClientView from "../EditVacancieClientView";
import {
  fetchProjects,
  fetchVacancie,
  getUsers,
  fetchTechnologies,
  getJobs,
  fetchManager,
} from "@/services/api";

export default async function EditVacanciesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resultVacancie = await fetchVacancie(id);
  const users = await getUsers();
  const projectsResult = await fetchProjects();
  const jobsResult = await getJobs();
  const skillsResult = await fetchTechnologies();
  const managersResult = await fetchManager();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditVacancieClientView
        skillsProp={skillsResult}
        projectsProp={projectsResult}
        vacancieProp={resultVacancie}
        usersProp={users}
        jobsProp={jobsResult}
        managersProp={managersResult || []} // Ensure managersProp is an array
      />
    </Suspense>
  );
}
