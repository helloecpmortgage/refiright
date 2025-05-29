"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { RefinanceMode } from "@/types";

interface RefinanceOptionProps {
  onSelect: (mode: RefinanceMode) => void;
}

export function RefinanceOptions({ onSelect }: RefinanceOptionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
      <Card
        className="cursor-pointer hover:border-primary transition-colors group"
        onClick={() => onSelect("Rate & Term")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="bg-[#18C0EC] p-16 rounded-md mb-4 border-white border-2 drop-shadow-lg">
            <img
              src="/images/rate-term-image.png"
              alt="Rate & Term"
              className="w-32 h-24 group-hover:scale-110 transition-all duration-200"
            />
          </div>
          <h3 className="text-xl font-bold text-center mt-2 font-secondary">
            Rate & Term
          </h3>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:border-primary transition-colors group"
        onClick={() => onSelect("Cash-Out")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="bg-[#18C0EC] p-16 rounded-md mb-4 border-white border-2 drop-shadow-lg">
            <img
              src="/images/cash-out-image.png"
              alt="Cash Out"
              className="w-32 h-24 group-hover:scale-110 transition-all duration-200"
            />
          </div>
          <h3 className="text-xl font-bold text-center mt-2 font-secondary">
            Cash Out
          </h3>
        </CardContent>
      </Card>
    </div>
  );
}
