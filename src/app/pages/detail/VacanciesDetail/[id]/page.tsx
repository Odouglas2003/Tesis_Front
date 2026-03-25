import { Suspense } from "react";
import { fetchVacancie } from "@/services/api";
import VacanciesDetailPageClient from "./VacanciesDetailPageClient";

export default async function VacanciesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resultVacancie = await fetchVacancie(id);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VacanciesDetailPageClient vacancie={resultVacancie} />
    </Suspense>
  );
}
