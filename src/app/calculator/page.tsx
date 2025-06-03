"use client";

import * as React from "react";
import { CalculatorForm } from "@/components/refi-calculator/calculator-form";
import { ResultsDisplay } from "@/components/refi-calculator/results-display";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type {
  CalculationInput,
  CalculationOutput,
  LoanPaymentDetails,
  PaymentDifference,
  SavingsAnalysis,
} from "@/types";
import {
  calculateMonthlyPI,
  calculateTotalMonthlyPayment,
  calculateTotalInterest,
  calculateBreakEvenPeriod,
  calculateRemainingBalance, // Needed for current loan remaining interest
  calculateTotalRemainingInterest,
} from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import { EcpLogo } from "@/components/shared/ecp-logo";
import { useRouter } from "next/navigation";
import MortgageResultsPDF from "@/components/refi-calculator/MortgageResultsPDF";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Download } from "lucide-react";

export default function Home() {
  const [results, setResults] = React.useState<CalculationOutput | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleNavigateBack = () => {
    router.push("/");
  };
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
        monthlyTaxes:
          newLoanDetails.monthlyTaxes - currentLoanDetails.monthlyTaxes,
        monthlyInsurance:
          newLoanDetails.monthlyInsurance - currentLoanDetails.monthlyInsurance,
        monthlyPmi: newLoanDetails.monthlyPmi - currentLoanDetails.monthlyPmi,
        monthlyHoa: newLoanDetails.monthlyHoa - currentLoanDetails.monthlyHoa,
        totalMonthlyPayment:
          newLoanDetails.totalMonthlyPayment -
          currentLoanDetails.totalMonthlyPayment,
      };

      // --- Savings Analysis ---
      const monthlySavings =
        currentLoanDetails.totalMonthlyPayment -
        newLoanDetails.totalMonthlyPayment;
      const closingCostsForBreakeven = inputData.newLoan.closingCosts; // Always use total costs for break-even
      const breakEvenPeriodMonths = calculateBreakEvenPeriod(
        closingCostsForBreakeven,
        monthlySavings
      );
      const totalInterestSavings =
        currentLoanDetails.totalInterest - newLoanDetails.totalInterest; // Remaining vs New Total

      // Lifetime Savings: (Total Remaining Payments on Current) - (Total Payments on New + Upfront Costs)
      const totalRemainingCurrentPayments =
        currentLoanDetails.totalMonthlyPayment *
        inputData.currentLoan.remainingTerm *
        12;
      const totalNewPayments =
        newLoanDetails.totalMonthlyPayment * inputData.newLoan.newTerm * 12;
      const upfrontClosingCosts = inputData.newLoan.costsPaidUpfront
        ? inputData.newLoan.closingCosts
        : 0;
      const lifetimeSavings =
        totalRemainingCurrentPayments -
        (totalNewPayments + upfrontClosingCosts);

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
        description:
          "An error occurred during calculation. Please check your inputs.",
        variant: "destructive",
      });
      setResults(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveData = () => {
    fetch(
      "https://api-refi-app-238196719501.us-west1.run.app/api/v1/refi-tracker",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent: "",
          current_amount: results?.input.currentLoan.originalLoanAmount || 0,
          current_rate: results?.input.currentLoan.interestRate || 0,
          new_amount: results?.input.newLoan.newLoanAmount || 0,
          new_rate: results?.input.newLoan.interestRate || 0,
          type_id: results?.input.mode === "Rate & Term" ? 1 : 2,
        }),
      }
    );
  };
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-center mb-8">
        <EcpLogo />
      </div>
      <h1 className="text-xl md:text-3xl font-bold text-center mb-2 font-secondary text-black">
        Refinance Mortgage Calculator
      </h1>
      <p className="text-center text-muted-foreground mb-8 font-primary">
        Compare your current mortgage with potential refinance scenarios.
      </p>

      <Card className="mb-12 border-2 border-primary">
        <CardHeader>
          <CardTitle className="font-secondary text-2xl text-gray-800 dark:text-gray-200">
            Enter Loan Details
          </CardTitle>
          <CardDescription className="font-primary">
            Provide the details for your current loan and the potential new
            loan.
          </CardDescription>
          <button
            onClick={handleNavigateBack}
            className="text-sm text-gray-500 hover:text-gray-700 self-start inline-flex items-center gap-1"
          >
            <img src="/icons/arrow-left.svg" alt="Back" />
            Back
          </button>
        </CardHeader>
        <CardContent>
          <CalculatorForm
            onSubmit={handleCalculate}
            isCalculating={isCalculating}
          />
        </CardContent>
      </Card>

      {isCalculating && (
        <div className="text-center py-8">
          <p className="font-secondary text-xl animate-pulse text-primary">
            Calculating results...
          </p>
        </div>
      )}

      {/* Conditionally render ResultsDisplay only when results are available and not currently calculating */}
      {!isCalculating && results && <ResultsDisplay results={results} />}
      {/* PDF Download Link */}
      {!isCalculating && results && (
        <div className="mt-8 text-center">
          <PDFDownloadLink
            onClick={handleSaveData}
            document={<MortgageResultsPDF data={results} />}
            fileName="refinance_results.pdf"
            className="bg-primary text-white hover:bg-primary/80 font-bold inline-flex items-center gap-2 px-8 py-2 rounded-md transition-colors duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </PDFDownloadLink>
        </div>
      )}
      {/* PDF Viewer for debugging */}
      {/* Uncomment to enable PDF viewer */}
      {!isCalculating && results && (
        <PDFViewer className="w-full h-[600px] mt-8">
          <MortgageResultsPDF data={results} />
        </PDFViewer>
      )}
    </main>
  );
}
