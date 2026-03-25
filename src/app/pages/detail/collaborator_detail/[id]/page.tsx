import { Suspense } from "react";
import CollaboratorDetailPageClient from "../CollaboratorDetailPageClient";
import { getColabById } from "@/services/api";

export default async function CollaboratorDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collaborator = await getColabById(id);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollaboratorDetailPageClient colab={collaborator.collaborator} />
    </Suspense>
  );
}
