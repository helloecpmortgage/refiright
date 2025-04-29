/**
 * Calculates the monthly Principal & Interest (P&I) payment for a loan.
 * @param principal The loan principal amount.
 * @param annualRate The annual interest rate (as a percentage, e.g., 5 for 5%).
 * @param termYears The loan term in years.
 * @returns The monthly P&I payment, or 0 if inputs are invalid.
 */
export function calculateMonthlyPI(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate < 0 || termYears <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termYears * 12;

  if (monthlyRate === 0) {
    // Handle 0% interest rate
    return principal / numberOfPayments;
  }

  const payment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return isNaN(payment) || !isFinite(payment) ? 0 : payment;
}

/**
 * Calculates the total monthly payment including PITI, PMI, and HOA.
 * @param pi Payment - Principal & Interest
 * @param taxes - Monthly Property Taxes
 * @param insurance - Monthly Homeowners Insurance
 * @param pmi - Monthly Private Mortgage Insurance
 * @param hoa - Monthly HOA Dues
 * @returns The total monthly payment.
 */
export function calculateTotalMonthlyPayment(
    pi: number,
    taxes: number,
    insurance: number,
    pmi: number,
    hoa: number
): number {
    return (pi || 0) + (taxes || 0) + (insurance || 0) + (pmi || 0) + (hoa || 0);
}


/**
 * Calculates the total interest paid over the life of a loan.
 * @param principal The loan principal amount.
 * @param monthlyPI The calculated monthly P&I payment.
 * @param termYears The loan term in years.
 * @returns The total interest paid, or 0 if inputs are invalid.
 */
export function calculateTotalInterest(principal: number, monthlyPI: number, termYears: number): number {
  if (principal <= 0 || monthlyPI <= 0 || termYears <= 0) {
    return 0;
  }
  const numberOfPayments = termYears * 12;
  const totalPaid = monthlyPI * numberOfPayments;
  const totalInterest = totalPaid - principal;
  return totalInterest < 0 ? 0 : totalInterest; // Interest can't be negative
}


/**
 * Calculates the remaining balance of a loan after a certain number of payments.
 * This is needed to calculate remaining interest on the current loan.
 * @param originalPrincipal Original loan amount.
 * @param annualRate Annual interest rate (e.g., 5 for 5%).
 * @param originalTermYears Original loan term in years.
 * @param paymentsMade Number of payments already made.
 * @returns The remaining loan balance.
 */
 export function calculateRemainingBalance(originalPrincipal: number, annualRate: number, originalTermYears: number, paymentsMade: number): number {
    if (originalPrincipal <= 0 || annualRate < 0 || originalTermYears <= 0 || paymentsMade < 0) {
        return originalPrincipal; // Return original if inputs invalid or no payments made
    }

    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = originalTermYears * 12;

    if (paymentsMade >= totalPayments) {
        return 0; // Loan is paid off
    }

    if (monthlyRate === 0) {
        const principalPaid = (originalPrincipal / totalPayments) * paymentsMade;
        return originalPrincipal - principalPaid;
    }

    // Formula for remaining balance: P * [(1+r)^n - (1+r)^p] / [(1+r)^n - 1]
    // Where P=principal, r=monthly rate, n=total payments, p=payments made
    const remainingBalance = originalPrincipal *
                             (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) /
                             (Math.pow(1 + monthlyRate, totalPayments) - 1);

    return isNaN(remainingBalance) || !isFinite(remainingBalance) ? originalPrincipal : Math.max(0, remainingBalance); // Ensure non-negative
}


/**
 * Calculates the total remaining interest to be paid on a loan.
 * @param currentBalance The current outstanding balance of the loan.
 * @param annualRate The annual interest rate (e.g., 5 for 5%).
 * @param remainingTermYears The remaining term of the loan in years.
 * @returns The total remaining interest to be paid.
 */
export function calculateTotalRemainingInterest(currentBalance: number, annualRate: number, remainingTermYears: number): number {
    if (currentBalance <= 0 || annualRate < 0 || remainingTermYears <= 0) {
        return 0;
    }

    const monthlyPI = calculateMonthlyPI(currentBalance, annualRate, remainingTermYears);
    if (monthlyPI <= 0) return 0; // Avoid issues if P&I calc fails

    const numberOfRemainingPayments = remainingTermYears * 12;
    const totalRemainingPayments = monthlyPI * numberOfRemainingPayments;
    const totalRemainingInterest = totalRemainingPayments - currentBalance;

    return totalRemainingInterest < 0 ? 0 : totalRemainingInterest; // Interest can't be negative
}


/**
 * Calculates the break-even period in months.
 * @param closingCosts The total closing costs.
 * @param monthlySavings The calculated monthly savings (Current Total Payment - New Total Payment).
 * @returns The break-even period in months, or Infinity if savings are zero or negative.
 */
export function calculateBreakEvenPeriod(closingCosts: number, monthlySavings: number): number {
  if (monthlySavings <= 0) {
    return Infinity; // No break-even if savings are zero or negative
  }
  if (closingCosts <= 0) {
    return 0; // Immediate break-even if no closing costs
  }
  return closingCosts / monthlySavings;
}

/**
 * Formats a number as a currency string (e.g., $1,234.56).
 * @param value The number to format.
 * @returns The formatted currency string.
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/**
 * Formats a number representing months into years and months string.
 * @param totalMonths The total number of months.
 * @returns A string representation like "X years, Y months" or "Y months".
 */
export function formatMonthsToYearsMonths(totalMonths: number): string {
  if (totalMonths === Infinity || isNaN(totalMonths) || totalMonths < 0) {
    return "N/A (No Savings)";
  }
  if (totalMonths === 0) {
    return "0 months (Immediate)";
  }

  const years = Math.floor(totalMonths / 12);
  const months = Math.round(totalMonths % 12); // Round remaining months

  let result = "";
  if (years > 0) {
    result += `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    if (years > 0) {
      result += ", ";
    }
    result += `${months} month${months > 1 ? 's' : ''}`;
  }
  return result;
}
