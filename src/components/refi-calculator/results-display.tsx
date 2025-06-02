"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CalculationOutput } from "@/types";
import { formatCurrency, formatMonthsToYearsMonths } from "@/lib/calculations";

interface ResultsDisplayProps {
  results: CalculationOutput | null;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const reportRef = React.useRef<HTMLDivElement>(null);

  if (!results) {
    return null; // Don't render anything if there are no results yet
  }

  const { currentLoan, newLoan, difference, savings } = results;

  const paymentBreakdown = [
    { label: "Principal & Interest (P&I)", key: "monthlyPI" },
    { label: "Property Taxes", key: "monthlyTaxes" },
    { label: "Homeowners Insurance", key: "monthlyInsurance" },
    { label: "PMI", key: "monthlyPmi" },
    { label: "HOA", key: "monthlyHoa" },
    {
      label: "Total Monthly Payment",
      key: "totalMonthlyPayment",
      isTotal: true,
    },
  ];

  return (
    <div
      ref={reportRef}
      className="mt-12 space-y-8 p-4 md:p-6 bg-card rounded-lg"
    >
      <Card className="border border-primary">
        <CardHeader>
          <CardTitle className="font-secondary text-2xl text-primary">
            Monthly Payment Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-secondary">Component</TableHead>
                <TableHead className="text-right font-secondary">
                  Current Loan
                </TableHead>
                <TableHead className="text-right font-secondary">
                  New Loan
                </TableHead>
                <TableHead className="text-right font-secondary">
                  Difference
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentBreakdown.map((item) => (
                <TableRow
                  key={item.key}
                  className={item.isTotal ? "font-bold bg-muted/50" : ""}
                >
                  <TableCell className={item.isTotal ? "font-bold" : ""}>
                    {item.label}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      currentLoan[item.key as keyof typeof currentLoan]
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(newLoan[item.key as keyof typeof newLoan])}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      difference[item.key as keyof typeof difference] > 0
                        ? "text-red-600"
                        : difference[item.key as keyof typeof difference] < 0
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    {formatCurrency(
                      difference[item.key as keyof typeof difference]
                    )}
                    {difference[item.key as keyof typeof difference] !== 0 && (
                      <span className="ml-1">
                        {difference[item.key as keyof typeof difference] > 0
                          ? "▲"
                          : "▼"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border border-primary">
        <CardHeader>
          <CardTitle className="font-secondary text-2xl text-primary">
            Savings & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-md bg-muted">
            <p className="text-sm text-muted-foreground font-primary">
              Monthly Savings
            </p>
            <p
              className={`font-secondary text-2xl font-bold ${
                savings.monthlySavings > 0
                  ? "text-green-600"
                  : savings.monthlySavings < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              {formatCurrency(savings.monthlySavings)}
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted">
            <p className="text-sm text-muted-foreground font-primary">
              Break-Even Period
            </p>
            <p className="font-secondary text-xl font-bold">
              {formatMonthsToYearsMonths(savings.breakEvenPeriodMonths)}
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted">
            <p className="text-sm text-muted-foreground font-primary">
              Total Interest Savings
            </p>
            <p
              className={`font-secondary text-2xl font-bold ${
                savings.totalInterestSavings > 0
                  ? "text-green-600"
                  : savings.totalInterestSavings < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              {formatCurrency(savings.totalInterestSavings)}
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted">
            <p className="text-sm text-muted-foreground font-primary">
              Lifetime Savings
            </p>
            <p
              className={`font-secondary text-2xl font-bold ${
                savings.lifetimeSavings > 0
                  ? "text-green-600"
                  : savings.lifetimeSavings < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              {formatCurrency(savings.lifetimeSavings)}
            </p>
            <p className="text-xs text-muted-foreground font-primary mt-1">
              (Compared to current loan remaining payments)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-primary">
        <CardHeader>
          <CardTitle className="font-secondary text-2xl text-primary">
            Decision Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground font-primary">
          {savings.monthlySavings > 0 && (
            <p>
              ✅ Potential monthly savings of{" "}
              <strong className="text-foreground">
                {formatCurrency(savings.monthlySavings)}
              </strong>
              .
            </p>
          )}
          {savings.monthlySavings < 0 && (
            <p>
              ⚠️ Based on these inputs, refinancing results in a higher monthly
              payment of{" "}
              <strong className="text-foreground">
                {formatCurrency(Math.abs(savings.monthlySavings))}
              </strong>
              .
            </p>
          )}
          {savings.monthlySavings === 0 && (
            <p>ℹ️ The total monthly payment remains the same.</p>
          )}

          {savings.breakEvenPeriodMonths !== Infinity &&
            savings.breakEvenPeriodMonths > 0 && (
              <p>
                ⏱️ You could break even on closing costs in approximately{" "}
                <strong className="text-foreground">
                  {formatMonthsToYearsMonths(savings.breakEvenPeriodMonths)}
                </strong>
                .
              </p>
            )}
          {savings.breakEvenPeriodMonths === 0 &&
            results.input.newLoan.closingCosts > 0 && (
              <p>
                ⏱️ Break-even is immediate as there are no monthly savings to
                offset closing costs.
              </p>
            )}
          {savings.breakEvenPeriodMonths === Infinity &&
            results.input.newLoan.closingCosts > 0 && (
              <p>
                ⏱️ A break-even point is not reached because there are no
                monthly savings.
              </p>
            )}

          {savings.totalInterestSavings > 0 && (
            <p>
              💰 This option could reduce your total interest paid by
              approximately{" "}
              <strong className="text-foreground">
                {formatCurrency(savings.totalInterestSavings)}
              </strong>{" "}
              over the life of the new loan compared to the remaining interest
              on the current loan.
            </p>
          )}
          {savings.totalInterestSavings < 0 && (
            <p>
              ⚠️ This option increases your total interest paid by approximately{" "}
              <strong className="text-foreground">
                {formatCurrency(Math.abs(savings.totalInterestSavings))}
              </strong>{" "}
              over the life of the new loan compared to the remaining interest
              on the current loan.
            </p>
          )}

          {results.input.newLoan.newTerm >
            results.input.currentLoan.remainingTerm && (
            <p>
              ⏳ Note: While the monthly payment might be lower, extending the
              loan term from{" "}
              {results.input.currentLoan.remainingTerm.toFixed(1)} to{" "}
              {results.input.newLoan.newTerm} years{" "}
              {savings.totalInterestSavings < 0
                ? "contributes to higher total interest paid."
                : "may impact total interest paid."}
            </p>
          )}
          {results.input.newLoan.newTerm <
            results.input.currentLoan.remainingTerm && (
            <p>
              ⏳ Shortening the loan term from{" "}
              {results.input.currentLoan.remainingTerm.toFixed(1)} to{" "}
              {results.input.newLoan.newTerm} years helps build equity faster
              and{" "}
              {savings.totalInterestSavings > 0
                ? "contributes to lower total interest paid."
                : "may impact total interest paid."}
            </p>
          )}
          {results.input.mode === "Cash-Out" &&
            results.input.newLoan.newLoanAmount >
              results.input.currentLoan.currentBalance && (
              <p>
                💸 This cash-out refinance increases your loan balance by{" "}
                <strong className="text-foreground">
                  {formatCurrency(
                    results.input.newLoan.newLoanAmount -
                      results.input.currentLoan.currentBalance
                  )}
                </strong>{" "}
                (including cash out{" "}
                {results.input.newLoan.costsPaidUpfront
                  ? ""
                  : "and rolled-in costs"}
                ).
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
