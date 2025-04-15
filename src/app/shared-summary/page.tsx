import Header from "@/components/layout/Header";
import { Suspense } from "react";
import SharedSummaryDisplay from "@/components/shared-summary/SharedSummaryDisplay";

export default function SharedSummaryPage() {
  return (
    <main>
      <Header />
      <Suspense fallback={<div className="container mx-auto max-w-3xl px-4 py-8 flex justify-center items-center h-[calc(100vh-100px)]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
        <SharedSummaryDisplay />
      </Suspense>
    </main>
  );
} 