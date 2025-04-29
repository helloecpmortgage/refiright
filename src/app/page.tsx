"use client";

import * as React from "react";
import { CalculatorForm } from "@/components/refi-calculator/calculator-form";
import { ResultsDisplay } from "@/components/refi-calculator/results-display";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { CalculationInput, CalculationOutput, LoanPaymentDetails, PaymentDifference, SavingsAnalysis } from "@/types";
import {
  calculateMonthlyPI,
  calculateTotalMonthlyPayment,
  calculateTotalInterest,
  calculateBreakEvenPeriod,
  calculateRemainingBalance, // Needed for current loan remaining interest
  calculateTotalRemainingInterest,
} from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";

// SVG Logo Placeholder (Same as in results-display, consider making it a shared component)
const EcpLogo = () => (
    <svg width="150" height="40" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
        {/* Basic Placeholder - Replace with actual ECP Logo SVG paths */}
        <rect width="150" height="40" fill="currentColor" fillOpacity="0.1"/>
        <text x="10" y="28" fontFamily="Articulat CF, sans-serif" fontSize="18" fontWeight="bold" fill="hsl(var(--primary))">ECP</text>
        <text x="55" y="28" fontFamily="Quicksand, sans-serif" fontSize="16" fill="hsl(var(--foreground))">Mortgage</text>
    </svg>
);


export default function Home() {
  const [results, setResults] = React.useState<CalculationOutput | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const { toast } = useToast();

  const handleCalculate = (inputData: CalculationInput) => {
    setIsCalculating(true);
    setResults(null); // Clear previous results

    try {
      // --- Current Loan Calculations ---
      const currentMonthlyPI = calculateMonthlyPI(
        inputData.currentLoan.currentBalance,
        inputData.currentLoan.interestRate,
        inputData.currentLoan.remainingTerm
      );
      const currentTotalMonthlyPayment = calculateTotalMonthlyPayment(
        currentMonthlyPI,
        inputData.currentLoan.monthlyTaxes,
        inputData.currentLoan.monthlyInsurance,
        inputData.currentLoan.monthlyPmi,
        inputData.currentLoan.monthlyHoa
      );
       // Calculate remaining interest on the current loan accurately
       const currentTotalRemainingInterest = calculateTotalRemainingInterest(
           inputData.currentLoan.currentBalance,
           inputData.currentLoan.interestRate,
           inputData.currentLoan.remainingTerm
       );

       const currentLoanDetails: LoanPaymentDetails = {
        monthlyPI: currentMonthlyPI,
        monthlyTaxes: inputData.currentLoan.monthlyTaxes,
        monthlyInsurance: inputData.currentLoan.monthlyInsurance,
        monthlyPmi: inputData.currentLoan.monthlyPmi,
        monthlyHoa: inputData.currentLoan.monthlyHoa,
        totalMonthlyPayment: currentTotalMonthlyPayment,
        totalInterest: currentTotalRemainingInterest, // Represents the *remaining* interest
      };

      // --- New Loan Calculations ---
      const newMonthlyPI = calculateMonthlyPI(
        inputData.newLoan.newLoanAmount,
        inputData.newLoan.interestRate,
        inputData.newLoan.newTerm
      );
      const newTotalMonthlyPayment = calculateTotalMonthlyPayment(
        newMonthlyPI,
        inputData.newLoan.monthlyTaxes,
        inputData.newLoan.monthlyInsurance,
        inputData.newLoan.monthlyPmi,
        inputData.newLoan.monthlyHoa
      );
      const newTotalInterest = calculateTotalInterest(
        inputData.newLoan.newLoanAmount,
        newMonthlyPI,
        inputData.newLoan.newTerm
      );

      const newLoanDetails: LoanPaymentDetails = {
        monthlyPI: newMonthlyPI,
        monthlyTaxes: inputData.newLoan.monthlyTaxes,
        monthlyInsurance: inputData.newLoan.monthlyInsurance,
        monthlyPmi: inputData.newLoan.monthlyPmi,
        monthlyHoa: inputData.newLoan.monthlyHoa,
        totalMonthlyPayment: newTotalMonthlyPayment,
        totalInterest: newTotalInterest, // Total interest over the *new* loan's life
      };

      // --- Difference Calculation (New - Current) ---
      const difference: PaymentDifference = {
        monthlyPI: newLoanDetails.monthlyPI - currentLoanDetails.monthlyPI,
        monthlyTaxes: newLoanDetails.monthlyTaxes - currentLoanDetails.monthlyTaxes,
        monthlyInsurance: newLoanDetails.monthlyInsurance - currentLoanDetails.monthlyInsurance,
        monthlyPmi: newLoanDetails.monthlyPmi - currentLoanDetails.monthlyPmi,
        monthlyHoa: newLoanDetails.monthlyHoa - currentLoanDetails.monthlyHoa,
        totalMonthlyPayment: newLoanDetails.totalMonthlyPayment - currentLoanDetails.totalMonthlyPayment,
      };

      // --- Savings Analysis ---
      const monthlySavings = currentLoanDetails.totalMonthlyPayment - newLoanDetails.totalMonthlyPayment;
      const closingCostsForBreakeven = inputData.newLoan.closingCosts; // Always use total costs for break-even
      const breakEvenPeriodMonths = calculateBreakEvenPeriod(closingCostsForBreakeven, monthlySavings);
      const totalInterestSavings = currentLoanDetails.totalInterest - newLoanDetails.totalInterest; // Remaining vs New Total

       // Lifetime Savings: (Total Remaining Payments on Current) - (Total Payments on New + Upfront Costs)
      const totalRemainingCurrentPayments = currentLoanDetails.totalMonthlyPayment * inputData.currentLoan.remainingTerm * 12;
      const totalNewPayments = newLoanDetails.totalMonthlyPayment * inputData.newLoan.newTerm * 12;
      const upfrontClosingCosts = inputData.newLoan.costsPaidUpfront ? inputData.newLoan.closingCosts : 0;
      const lifetimeSavings = totalRemainingCurrentPayments - (totalNewPayments + upfrontClosingCosts);


      const savings: SavingsAnalysis = {
        monthlySavings: monthlySavings,
        breakEvenPeriodMonths: breakEvenPeriodMonths,
        totalInterestSavings: totalInterestSavings,
        lifetimeSavings: lifetimeSavings,
      };

      // --- Set Results ---
      setResults({
        input: inputData,
        currentLoan: currentLoanDetails,
        newLoan: newLoanDetails,
        difference: difference,
        savings: savings,
      });

    } catch (error) {
      console.error("Calculation Error:", error);
      toast({
        title: "Calculation Error",
        description: "An error occurred during calculation. Please check your inputs.",
        variant: "destructive",
      });
       setResults(null);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-center mb-8">
             <EcpLogo />
        </div>
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 font-secondary text-primary">
        Refinance Mortgage Calculator
      </h1>
      <p className="text-center text-muted-foreground mb-8 font-primary">
        Compare your current mortgage with potential refinance scenarios.
      </p>

      <Card className="mb-12 shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="font-secondary text-2xl text-gray-800 dark:text-gray-200">Enter Loan Details</CardTitle>
           <CardDescription className="font-primary">
            Provide the details for your current loan and the potential new loan. Select 'Rate & Term' or 'Cash-Out' mode.
           </CardDescription>
        </CardHeader>
        <CardContent>
          <CalculatorForm onSubmit={handleCalculate} isCalculating={isCalculating} />
        </CardContent>
      </Card>

      {isCalculating && (
         <div className="text-center py-8">
             <p className="font-secondary text-xl animate-pulse text-primary">Calculating results...</p>
         </div>
      )}

      {/* Conditionally render ResultsDisplay only when results are available and not currently calculating */}
      {!isCalculating && results && <ResultsDisplay results={results} />}

    </main>
  );
}
