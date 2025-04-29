export type RefinanceMode = "Rate & Term" | "Cash-Out";

export interface CurrentLoanInput {
  originalLoanAmount: number;
  currentBalance: number;
  interestRate: number; // Annual rate %
  originalTerm: number; // Years
  remainingTerm: number; // Years
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
}

export interface NewLoanInput {
  newLoanAmount: number; // Calculated based on mode, balance, cashout, costs
  interestRate: number; // Annual rate %
  newTerm: number; // Years
  closingCosts: number;
  costsPaidUpfront: boolean; // True if paid upfront, false if rolled in
  monthlyTaxes: number; // Defaults to current if not provided
  monthlyInsurance: number; // Defaults to current if not provided
  monthlyPmi: number; // Defaults to current (or 0 for cashout) if not provided
  monthlyHoa: number; // Defaults to current if not provided
}

export interface CalculationInput {
  mode: RefinanceMode;
  currentLoan: CurrentLoanInput;
  newLoan: NewLoanInput;
}

//--------------------------//

export interface LoanPaymentDetails {
    monthlyPI: number;
    monthlyTaxes: number;
    monthlyInsurance: number;
    monthlyPmi: number;
    monthlyHoa: number;
    totalMonthlyPayment: number;
    totalInterest: number; // Total interest over life (or remaining)
}

export interface PaymentDifference {
    monthlyPI: number;
    monthlyTaxes: number;
    monthlyInsurance: number;
    monthlyPmi: number;
    monthlyHoa: number;
    totalMonthlyPayment: number;
}

export interface SavingsAnalysis {
    monthlySavings: number; // Difference in Total Monthly Payment
    breakEvenPeriodMonths: number; // In months, Infinity if no savings
    totalInterestSavings: number; // New Loan Total Interest vs Current Loan Remaining Interest
    lifetimeSavings: number; // (Current Total Remaining Payments) - (New Total Payments + Upfront Costs)
}


export interface CalculationOutput {
    input: CalculationInput; // Keep input for reference in results/PDF
    currentLoan: LoanPaymentDetails;
    newLoan: LoanPaymentDetails;
    difference: PaymentDifference; // New Loan - Current Loan
    savings: SavingsAnalysis;
}
