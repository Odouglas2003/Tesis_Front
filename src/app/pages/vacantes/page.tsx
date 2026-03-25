import { Suspense } from "react";
import VacanciesPageClient from "./VacanciesPageClient";
import { fetchVacancies, fetchCollaborators } from "@/services/api";
export default async function VacanciesPage() {
  const resultVacancies = (await fetchVacancies()) || [];
  const resultCollaborator = (await fetchCollaborators()) || [];
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VacanciesPageClient
        vacanciesProp={resultVacancies}
        collaboratorProp={resultCollaborator}
      />
    </Suspense>
  );
}
