# **App Name**: RefiRight

## Core Features:

- Loan Scenario Input: Interactive form for loan officers to input current and new loan scenarios.
- Mortgage Calculation: Calculation engine for monthly payments, savings, and break-even analysis.
- PDF Report Generation: Generates a downloadable PDF report summarizing input data and calculation results.

## Style Guidelines:

- Primary colors: #EB45D2 (pink) and #18C0EC (cyan) from the ECP brand.
- Secondary color: #666666 (gray) for general text and elements.
- Accent color: A lighter shade of cyan to highlight key interactive elements and call to actions.
- Primary font: 'Quicksand' for labels and body text, ensuring readability.
- Secondary font: 'Articulat CF' for headings and key figures, providing a professional look.
- Clear visual separation between input and output sections using distinct containers.

## Original User Request:
Prompt Title: Design and Implementation Specification: ECP Refinance Mortgage Calculator (Sales Tool)

Project Goal:
Develop an interactive, web-based Refinance Mortgage Calculator application to serve as a key sales tool for ECP Loan Officers (LOs). The calculator must allow LOs to easily input current loan details and potential new loan scenarios (both Rate & Term and Cash-Out options) to clearly demonstrate the financial impact and potential benefits of refinancing to prospects. The output should provide a comprehensive comparison, including payment breakdowns, savings analysis, and decision insights, all presented within a user-friendly interface adhering strictly to ECP brand visual guidelines. The tool should also generate a downloadable PDF report summarizing the comparison.

Target Users:

Primary: Mortgage Loan Officers (using the tool interactively with prospects).
Secondary: Prospects/Clients (viewing the results presented by the LO or via the generated PDF).
Platform & Deployment:

Technology: Web application (e.g., built with React/Angular/Vue).
Deployment: Suitable for deployment on standard web hosting (e.g., Firebase Hosting). Should be accessible via a direct URL and potentially embeddable if needed in the future.
ECP Brand Visual Guidelines (Mandatory for UI Implementation):

Branding Consistency: The calculator's UI must align with the overall ECP brand identity.
Brand Colors: Primarily use the ECP color palette:
--ecp-color-pink: #EB45D2
--ecp-color-cyan: #18C0EC (or corrected #18C0EC)
--ecp-color-gray: #666666
Utilize these colors effectively for highlighting differences, savings, section headers, and calls to action, complemented by neutrals for readability.
Brand Fonts:
Primary Font (Labels, Body Text): 'Quicksand' (using appropriate web font weights).
Secondary Font (Headings, Key Figures): 'Articulat CF' (using appropriate web font weights).
Logo: Include the "ECP Mortgage" logo at the top, as shown in the inspiration image.
Overall Feel: Professional, clean, trustworthy, easy-to-read, with clear visual separation between input and output sections, and intuitive data presentation for comparing scenarios.
Core Functionality & Modules:

Refinance Scenario Modes:

The calculator must support two distinct modes, selectable via tabs or similar UI element:
Rate & Term Refinance: Focuses on changing the rate and/or term without significant cash out.
Cash-Out Refinance: Allows for borrowing additional equity, impacting the "New Loan Amount". The UI might need slight adjustments based on the selected mode (e.g., clarifying how the New Loan Amount relates to Current Balance + Cash Out + Costs).
Input Section (Side-by-Side Comparison Layout):

Current Loan Inputs:
Original Loan Amount ()∗CurrentBalance()
Interest Rate (%)
Original Term (years)
Remaining Term (years) (May need validation against Original Term)
Monthly Property Taxes ()∗MonthlyInsurance()
Monthly PMI ()(ifany)∗MonthlyHOA() (if any)
New Loan Inputs:
New Loan Amount ()∗(Maybeauto−calculatedinCash−OutmodebasedonCurrentBalance+CashOut+Rolled−inCosts,orentereddirectly)∗∗InterestRate(∗NewTerm(years)∗ClosingCosts() (Specify if these are paid upfront or rolled into the new loan, as this affects calculations)
New Monthly PMI ()(ifany)∗NewMonthlyPropertyTaxes() (Optional - Default to Current Loan value if blank)
New Monthly Insurance ()∗(Optional−DefaulttoCurrentLoanvalueifblank)∗∗NewMonthlyHOA() (Optional - Default to Current Loan value if blank)
Calculation Engine:

Monthly Principal & Interest (P&I): Calculate P&I for both Current Loan (based on Current Balance, Rate, Remaining Term) and New Loan (based on New Loan Amount, Rate, New Term) using standard amortization formulas.
Total Monthly Payment (PITI + PMI + HOA): Calculate for both scenarios by summing P&I, Taxes, Insurance, PMI, and HOA.
Payment Component Differences: Calculate the difference ($) between New and Current for each component (P&I, Taxes, Insurance, PMI, HOA) and the Total Monthly Payment.
Monthly Savings: Calculate the difference in Total Monthly Payment (Current - New).
Break-Even Period: Calculate Closing Costs / Monthly Savings. Handle division by zero or negative savings (indicate if break-even doesn't occur or takes extremely long). Express in months or years/months.
Total Interest Paid: Calculate the total interest paid over the life of the New Loan and the total interest remaining to be paid on the Current Loan (over its remaining term).
Total Interest Savings: Calculate the difference between the total remaining interest on the Current Loan and the total interest on the New Loan.
Lifetime Savings: Calculate the total cost difference. A common approach is: (Total Payments on Current Loan for Remaining Term) - (Total Payments on New Loan for Full Term + Closing Costs if not rolled in). Clearly define the methodology used.
Output Display Section:

Monthly Payment Breakdown Table: Display a clear table comparing Current Loan, New Loan, and the Difference ($) for: P&I, Property Taxes, Insurance, PMI, HOA, and Total Monthly Payment. * **Savings Analysis Section:** Prominently display key calculated results: * Monthly Savings ($)
Break-Even Period (Months/Years)
Total Interest Savings ()∗LifetimeSavings() (Label clearly based on calculation method)
Decision Insights Section: Generate dynamic, simple text summaries based on calculations. Examples:
"Potential monthly savings of $XXX."
"You could break even on closing costs in approximately Y years and M months."
"This option reduces your total interest paid by approximately $ZZZ over the life of the loan."
If the term is extended: "Note: While the monthly payment is lower, extending the loan term from X to Y years will result in higher total interest paid over the life of the loan."
If savings are negative: "Based on these inputs, refinancing may result in a higher monthly payment."
PDF Report Generation:

Include a "Download PDF Report" button.
Clicking the button should generate a clean, professionally formatted PDF document containing:
ECP Branding (Logo)
A summary of the inputted Current Loan and New Loan details.
The Monthly Payment Breakdown table.
The Savings Analysis figures.
The Decision Insights text.
(Optional) Amortization schedules for both scenarios.
(Optional) LO contact information (could be configurable).
Non-Functional Requirements:

Accuracy: Calculations must be precise and based on standard financial formulas. Thoroughly test calculation logic.
Usability: Intuitive input fields, clear labels, easy-to-understand output presentation. Smooth transitions between modes.
Performance: Calculations should occur quickly upon input changes. PDF generation should be reasonably fast.
Responsiveness: The calculator interface must adapt well to different screen sizes (desktop, tablet).
Exclusions:

Does not perform actual loan qualification or underwriting.
Does not check credit scores or detailed eligibility criteria.
All calculations are based solely on the data inputted by the LO.
Does not save specific client scenarios unless explicitly added as a future feature.
  