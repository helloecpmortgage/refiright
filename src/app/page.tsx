"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { RefinanceOptions } from "@/components/refi-calculator/refinance-options";
import type { RefinanceMode } from "@/types";
import { EcpLogo } from "@/components/shared/ecp-logo";

export default function Home() {
  const router = useRouter();

  const handleRefinanceOptionSelect = (mode: RefinanceMode) => {
    // Guardar el modo seleccionado en sessionStorage para usarlo en la página de calculator
    localStorage.setItem("refinanceMode", mode);
    // Redirigir a la página de calculator
    router.push("/calculator");
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-center mb-8">
        <EcpLogo />
      </div>
      <h1 className="text-2xl md:text-4xl font-bold text-center mb-2 font-secondary text-black">
        Refinance Mortgage Calculator
      </h1>
      <p className="text-center text-muted-foreground mb-8 font-primary text-base">
        Compare your current mortgage with potential refinance scenarios.
      </p>

      <Card className="mb-12 shadow-lg border border-border">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6 font-secondary">
            Choose the refinance type to continue to the calculator
          </h2>
          <RefinanceOptions onSelect={handleRefinanceOptionSelect} />
        </CardContent>
      </Card>
    </main>
  );
}
