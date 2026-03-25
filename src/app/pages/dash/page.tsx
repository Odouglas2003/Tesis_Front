import { Suspense } from "react";
import { metricsDashboard } from "@/services/api";
import DashClientView from "./dashClientView";

export default async function Home() {
  const resultMetrics = await metricsDashboard();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashClientView metrics={resultMetrics} />
    </Suspense>
  );
}
