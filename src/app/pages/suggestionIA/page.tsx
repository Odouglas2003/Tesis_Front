import { Suspense } from "react";
import SuggestionIaPageClient from "./SuggestionIaPageClient";

export default async function SuggestionIaPage() {

  return (
      <Suspense fallback={<div>Loading...</div>}>
        <SuggestionIaPageClient />
      </Suspense>
  );
}

