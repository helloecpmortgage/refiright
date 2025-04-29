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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { CalculationOutput } from "@/types";
import { formatCurrency, formatMonthsToYearsMonths } from "@/lib/calculations";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsDisplayProps {
  results: CalculationOutput | null;
}

// SVG Logo Placeholder (Replace with actual SVG or Image component)
const EcpLogo = () => (
    <svg width="150" height="40" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
        {/* Basic Placeholder - Replace with actual ECP Logo SVG paths */}
        <rect width="150" height="40" fill="currentColor" fillOpacity="0.1"/>
        <text x="10" y="28" fontFamily="Articulat CF, sans-serif" fontSize="18" fontWeight="bold" fill="hsl(var(--primary))">ECP</text>
        <text x="55" y="28" fontFamily="Quicksand, sans-serif" fontSize="16" fill="hsl(var(--foreground))">Mortgage</text>
    </svg>
);


export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const reportRef = React.useRef<HTMLDivElement>(null);

   const generatePdf = async () => {
    const input = reportRef.current;
    if (!input) return;

    // Temporarily make hidden elements visible for capture
    const hiddenElements = input.querySelectorAll('.pdf-hidden');
    hiddenElements.forEach(el => el.classList.remove('pdf-hidden'));

     try {
        const canvas = await html2canvas(input, {
             scale: 2, // Improve resolution
             useCORS: true, // If using external images/fonts
             logging: false, // Disable logging for cleaner console
             backgroundColor: '#ffffff' // Ensure background is white for PDF
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height] // Use canvas dimensions for PDF page size
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`ECP_Refinance_Report_${new Date().toISOString().slice(0,10)}.pdf`);
     } catch (error) {
         console.error("Error generating PDF:", error);
         // Optionally show a user-friendly error message here
     } finally {
        // Hide elements again after capture
        hiddenElements.forEach(el => el.classList.add('pdf-hidden'));
     }
  };


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
    { label: "Total Monthly Payment", key: "totalMonthlyPayment", isTotal: true },
  ];

  return (
    <div ref={reportRef} className="mt-12 space-y-8 p-4 md:p-6 bg-card rounded-lg shadow-md">
       {/* Logo for PDF - hidden on screen */}
       <div className="pdf-only mb-6 hidden">
           <EcpLogo />
       </div>

      <Card>
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
                <TableHead className="text-right font-secondary">Current Loan</TableHead>
                <TableHead className="text-right font-secondary">New Loan</TableHead>
                <TableHead className="text-right font-secondary">Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentBreakdown.map((item) => (
                <TableRow key={item.key} className={item.isTotal ? "font-bold bg-muted/50" : ""}>
                  <TableCell className={item.isTotal ? "font-bold" : ""}>{item.label}</TableCell>
                  <TableCell className="text-right">{formatCurrency(currentLoan[item.key as keyof typeof currentLoan])}</TableCell>
                  <TableCell className="text-right">{formatCurrency(newLoan[item.key as keyof typeof newLoan])}</TableCell>
                  <TableCell className={`text-right ${difference[item.key as keyof typeof difference] > 0 ? 'text-green-600' : difference[item.key as keyof typeof difference] < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(difference[item.key as keyof typeof difference])}
                    {difference[item.key as keyof typeof difference] !== 0 && (
                        <span className="ml-1">{difference[item.key as keyof typeof difference] > 0 ? '▼' : '▲'}</span>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-secondary text-2xl text-primary">
            Savings & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground font-primary">Monthly Savings</p>
                <p className={`font-secondary text-2xl ${savings.monthlySavings > 0 ? 'text-green-600' : savings.monthlySavings < 0 ? 'text-red-600' : ''}`}>
                 {formatCurrency(savings.monthlySavings)}
                </p>
            </div>
             <div className="p-4 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground font-primary">Break-Even Period</p>
                <p className="font-secondary text-xl">
                    {formatMonthsToYearsMonths(savings.breakEvenPeriodMonths)}
                </p>
            </div>
             <div className="p-4 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground font-primary">Total Interest Savings</p>
                 <p className={`font-secondary text-2xl ${savings.totalInterestSavings > 0 ? 'text-green-600' : savings.totalInterestSavings < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(savings.totalInterestSavings)}
                </p>
            </div>
            <div className="p-4 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground font-primary">Lifetime Savings</p>
                <p className={`font-secondary text-2xl ${savings.lifetimeSavings > 0 ? 'text-green-600' : savings.lifetimeSavings < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(savings.lifetimeSavings)}
                </p>
                <p className="text-xs text-muted-foreground font-primary mt-1">(Compared to current loan remaining payments)</p>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-secondary text-2xl text-primary">
            Decision Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground font-primary">
            {savings.monthlySavings > 0 && (
                <p>✅ Potential monthly savings of <strong className="text-foreground">{formatCurrency(savings.monthlySavings)}</strong>.</p>
            )}
             {savings.monthlySavings < 0 && (
                <p>⚠️ Based on these inputs, refinancing results in a higher monthly payment of <strong className="text-foreground">{formatCurrency(Math.abs(savings.monthlySavings))}</strong>.</p>
            )}
             {savings.monthlySavings === 0 && (
                <p>ℹ️ The total monthly payment remains the same.</p>
            )}

            {savings.breakEvenPeriodMonths !== Infinity && savings.breakEvenPeriodMonths > 0 && (
                <p>⏱️ You could break even on closing costs in approximately <strong className="text-foreground">{formatMonthsToYearsMonths(savings.breakEvenPeriodMonths)}</strong>.</p>
            )}
            {savings.breakEvenPeriodMonths === 0 && newLoan.closingCosts > 0 && (
                 <p>⏱️ Break-even is immediate as there are no monthly savings to offset closing costs.</p>
            )}
             {savings.breakEvenPeriodMonths === Infinity && newLoan.closingCosts > 0 && (
                 <p>⏱️ A break-even point is not reached because there are no monthly savings.</p>
             )}


            {savings.totalInterestSavings > 0 && (
                <p>💰 This option could reduce your total interest paid by approximately <strong className="text-foreground">{formatCurrency(savings.totalInterestSavings)}</strong> over the life of the new loan compared to the remaining interest on the current loan.</p>
            )}
             {savings.totalInterestSavings < 0 && (
                <p>⚠️ This option increases your total interest paid by approximately <strong className="text-foreground">{formatCurrency(Math.abs(savings.totalInterestSavings))}</strong> over the life of the new loan compared to the remaining interest on the current loan.</p>
            )}

            {results.input.newLoan.newTerm > results.input.currentLoan.remainingTerm && (
                 <p>⏳ Note: While the monthly payment might be lower, extending the loan term from {results.input.currentLoan.remainingTerm.toFixed(1)} to {results.input.newLoan.newTerm} years {savings.totalInterestSavings < 0 ? 'contributes to higher total interest paid.' : 'may impact total interest paid.'}</p>
             )}
            {results.input.newLoan.newTerm < results.input.currentLoan.remainingTerm && (
                 <p>⏳ Shortening the loan term from {results.input.currentLoan.remainingTerm.toFixed(1)} to {results.input.newLoan.newTerm} years helps build equity faster and {savings.totalInterestSavings > 0 ? 'contributes to lower total interest paid.' : 'may impact total interest paid.'}</p>
             )}
             {results.input.mode === 'Cash-Out' && results.input.newLoan.newLoanAmount > results.input.currentLoan.currentBalance && (
                <p>💸 This cash-out refinance increases your loan balance by <strong className="text-foreground">{formatCurrency(results.input.newLoan.newLoanAmount - results.input.currentLoan.currentBalance)}</strong> (including cash out {results.input.newLoan.costsPaidUpfront ? '' : 'and rolled-in costs'}).</p>
             )}
        </CardContent>
      </Card>

      {/* Button is outside the ref'd div so it doesn't appear in the PDF */}
       <div className="flex justify-center mt-8 screen-only">
           <Button onClick={generatePdf} variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 font-secondary">
               <Download className="mr-2 h-4 w-4" />
               Download PDF Report
           </Button>
       </div>

        {/* Add specific styles for PDF generation */}
       <style jsx global>{`
           .pdf-only { display: none; }
           .screen-only { display: flex; } /* Or block, inline-block etc. as needed */
            @media print {
                .pdf-only { display: block; } /* Or flex, inline-block etc. */
                .screen-only { display: none; }
                 body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } /* Ensure colors print */
                 /* Add any other print-specific styles here */
                 .pdf-hidden { display: none !important; } /* Force hide elements during canvas generation */
           }
           /* Styles needed for html2canvas if elements are hidden/shown dynamically */
            .pdf-capture-mode .pdf-only {
                display: block; /* Or flex etc. */
            }
            .pdf-capture-mode .screen-only {
                display: none;
            }
       `}</style>
    </div>
  );
}
