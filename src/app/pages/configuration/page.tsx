import { Suspense } from "react";
import ConfigurationClientView from "./configurationClientView";
export default async function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfigurationClientView />
    </Suspense>
  );
}
