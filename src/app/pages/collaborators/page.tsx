import { Suspense } from "react";
import CollaboratorsPageClient from "./CollaboratorsPageClient";
import { fetchCollaborators, fetchTableColumns } from "@/services/api";

export default async function Home() {
  const resultCollaborators = await fetchCollaborators();
  const tableColumns = await fetchTableColumns("collaborador");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollaboratorsPageClient
        collaboratorsProp={resultCollaborators || []}
        columnsProp={tableColumns}
      />
    </Suspense>
  );
}
