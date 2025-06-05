"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CalculationInput, RefinanceMode } from "@/types";
import { ToggleGroup, Item } from "@radix-ui/react-toggle-group";

const formSchema = z
  .object({
    // Current Loan
    currentLoan: z.object({
      originalLoanAmount: z.coerce.number().positive("Must be positive"),
      currentBalance: z.coerce.number().positive("Must be positive"),
      interestRate: z.coerce
        .number()
        .min(0, "Cannot be negative")
        .max(100, "Cannot exceed 100"),
      originalTerm: z.coerce
        .number()
        .int()
        .positive("Must be a positive integer"),
      remainingTerm: z.coerce.number().min(0, "Cannot be negative"), // Can be 0 if paid off? Maybe min(0.1)?
      remainingTermUnit: z.enum(["months", "years"]).default("months"),
      monthlyTaxes: z.coerce.number().min(0, "Cannot be negative"),
      monthlyInsurance: z.coerce.number().min(0, "Cannot be negative"),
      monthlyPmi: z.coerce.number().min(0, "Cannot be negative").default(0),
      monthlyHoa: z.coerce.number().min(0, "Cannot be negative").default(0),
    }),
    // New Loan
    newLoan: z.object({
      // Dynamic based on mode - handled in component logic/submit
      // newLoanAmount: z.coerce.number().positive("Must be positive"),
      cashOutAmount: z.coerce.number().min(0, "Cannot be negative").optional(), // Only for Cash-Out
      interestRate: z.coerce
        .number()
        .min(0, "Cannot be negative")
        .max(100, "Cannot exceed 100"),
      newTerm: z.coerce.number().int().positive("Must be a positive integer"),
      closingCosts: z.coerce.number().min(0, "Cannot be negative"),
      rollCostsIntoLoan: z.boolean().default(false),
      newMonthlyPmi: z.coerce.number().min(0, "Cannot be negative").optional(),
      newMonthlyTaxes: z.coerce
        .number()
        .min(0, "Cannot be negative")
        .optional(),
      newMonthlyInsurance: z.coerce
        .number()
        .min(0, "Cannot be negative")
        .optional(),
      newMonthlyHoa: z.coerce.number().min(0, "Cannot be negative").optional(),
    }),
  })
  .refine(
    (data) => {
      const remainingTerm =
        data.currentLoan.remainingTermUnit === "months"
          ? data.currentLoan.remainingTerm / 12
          : data.currentLoan.remainingTerm;
      return remainingTerm <= data.currentLoan.originalTerm;
    },
    {
      message: "Remaining term cannot exceed original term",
      path: ["currentLoan", "remainingTerm"],
    }
  );

type CalculatorFormValues = z.infer<typeof formSchema>;

interface CalculatorFormProps {
  onSubmit: (data: CalculationInput) => void;
  isCalculating: boolean;
}

export function CalculatorForm({
  onSubmit,
  isCalculating,
}: CalculatorFormProps) {
  const [refinanceMode, setRefinanceMode] =
    React.useState<RefinanceMode>("Rate & Term");
  const [remainingTermUnit, setRemainingTermUnit] = React.useState<
    "months" | "years"
  >("months");

  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentLoan: {
        originalLoanAmount: undefined,
        currentBalance: undefined,
        interestRate: undefined,
        originalTerm: 30,
        remainingTerm: undefined,
        monthlyTaxes: undefined,
        monthlyInsurance: undefined,
        monthlyPmi: 0,
        monthlyHoa: 0,
      },
      newLoan: {
        // newLoanAmount: undefined, // Set dynamically
        cashOutAmount: 0,
        interestRate: undefined,
        newTerm: 30,
        closingCosts: undefined,
        rollCostsIntoLoan: false,
        newMonthlyPmi: 0,
        newMonthlyTaxes: undefined, // Will default to current if blank
        newMonthlyInsurance: undefined, // Will default to current if blank
        newMonthlyHoa: 0, // Will default to current if blank
      },
    },
    mode: "onBlur", // Validate on blur
  });

  const watchCurrentTaxes = form.watch("currentLoan.monthlyTaxes");
  const watchCurrentInsurance = form.watch("currentLoan.monthlyInsurance");
  const watchCurrentHoa = form.watch("currentLoan.monthlyHoa");
  const watchCurrentPmi = form.watch("currentLoan.monthlyPmi");

  const handleFormSubmit = (values: CalculatorFormValues) => {
    let newLoanAmount: number;
    const currentBalance = values.currentLoan.currentBalance || 0;
    const closingCosts = values.newLoan.closingCosts || 0;
    let remainingTerm = Number(values.currentLoan.remainingTerm);

    if (remainingTermUnit === "months") {
      remainingTerm = remainingTerm / 12;
    }
    if (refinanceMode === "Cash-Out") {
      const cashOut = values.newLoan.cashOutAmount || 0;
      newLoanAmount =
        currentBalance +
        cashOut +
        (values.newLoan.rollCostsIntoLoan ? closingCosts : 0);
    } else {
      // Rate & Term
      newLoanAmount =
        currentBalance + (values.newLoan.rollCostsIntoLoan ? closingCosts : 0);
    }

    const inputData: CalculationInput = {
      mode: refinanceMode,
      currentLoan: {
        ...values.currentLoan,
        remainingTerm,
        monthlyPmi: values.currentLoan.monthlyPmi ?? 0, // Ensure defaults if undefined
        monthlyHoa: values.currentLoan.monthlyHoa ?? 0,
      },
      newLoan: {
        newLoanAmount: newLoanAmount,
        interestRate: values.newLoan.interestRate,
        newTerm: values.newLoan.newTerm,
        closingCosts: closingCosts,
        costsPaidUpfront: !values.newLoan.rollCostsIntoLoan,
        // Use current values as default if new ones are blank/undefined/null
        monthlyTaxes:
          values.newLoan.newMonthlyTaxes ?? values.currentLoan.monthlyTaxes,
        monthlyInsurance:
          values.newLoan.newMonthlyInsurance ??
          values.currentLoan.monthlyInsurance,
        monthlyPmi:
          values.newLoan.newMonthlyPmi ??
          (refinanceMode === "Cash-Out"
            ? 0
            : values.currentLoan.monthlyPmi ?? 0), // Default new PMI to 0 for cashout, else current
        monthlyHoa:
          values.newLoan.newMonthlyHoa ?? values.currentLoan.monthlyHoa ?? 0,
      },
    };
    onSubmit(inputData);
  };

  const renderLoanSection = (loanType: "currentLoan" | "newLoan") => {
    const isNewLoan = loanType === "newLoan";
    const prefix = loanType;

    React.useEffect(() => {
      if (typeof window !== "undefined") {
        setRefinanceMode(
          localStorage?.getItem("refinanceMode") as RefinanceMode
        );
      }
    }, []);

    React.useEffect(() => {
      form.setValue("currentLoan.remainingTermUnit", remainingTermUnit);
    }, [remainingTermUnit]);

    return (
      <Card className="flex-1 border border-primary">
        <CardHeader>
          <CardTitle className="font-secondary text-xl text-primary">
            {isNewLoan ? "New Loan Scenario" : "Current Loan Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isNewLoan && (
            <FormField
              control={form.control}
              name={`${prefix}.originalLoanAmount`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Loan Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 300000"
                      {...field}
                      step="any"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {!isNewLoan && (
            <FormField
              control={form.control}
              name={`${prefix}.currentBalance`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 285000"
                      {...field}
                      step="any"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {refinanceMode === "Cash-Out" && isNewLoan && (
            <FormField
              control={form.control}
              name={`${prefix}.cashOutAmount`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desired Cash Out ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      {...field}
                      step="any"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name={`${prefix}.interestRate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 6.5"
                    {...field}
                    step="any"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={isNewLoan ? `${prefix}.newTerm` : `${prefix}.originalTerm`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isNewLoan ? "New Term (Years)" : "Original Term (Years)"}
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <br />
          {!isNewLoan && (
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-gray-700">
                Remaining Term:
              </label>
              <ToggleGroup
                type="single"
                defaultValue="months"
                aria-label="Select term unit"
                value={remainingTermUnit}
                onValueChange={(value) => {
                  setRemainingTermUnit(value as "months" | "years");
                }}
                className="ml-2"
              >
                <Item
                  value="months"
                  className={`px-2 py-1 rounded-l-md  ${
                    remainingTermUnit === "months"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-200"
                  }`}
                >
                  Months
                </Item>
                <Item
                  value="years"
                  className={`px-2 py-1 rounded-r-md  ${
                    remainingTermUnit === "years"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-200"
                  }`}
                >
                  Years
                </Item>
              </ToggleGroup>
            </div>
          )}
          {!isNewLoan && (
            <FormField
              control={form.control}
              name={`${prefix}.remainingTerm`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Remaining Term (
                    {remainingTermUnit === "months" ? "Months" : "Years"})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={
                        remainingTermUnit === "months"
                          ? "e.g., 342"
                          : "e.g., 28.5"
                      }
                      {...field}
                      step="any"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isNewLoan && (
            <>
              <FormField
                control={form.control}
                name={`${prefix}.closingCosts`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Closing Costs ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5000"
                        {...field}
                        step="any"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${prefix}.rollCostsIntoLoan`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Controller
                        control={form.control}
                        name={`${prefix}.rollCostsIntoLoan`}
                        render={({ field: checkboxField }) => (
                          <input
                            type="checkbox"
                            checked={checkboxField.value}
                            onChange={checkboxField.onChange}
                            className="accent-primary h-4 w-4"
                          />
                        )}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Roll Closing Costs into New Loan?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </>
          )}

          <Separator className="bg-primary" />
          <p className="text-base font-semibold text-primary">
            Monthly Housing Costs
          </p>

          <FormField
            control={form.control}
            name={
              isNewLoan ? `${prefix}.newMonthlyTaxes` : `${prefix}.monthlyTaxes`
            }
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Taxes ($/month)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={
                      isNewLoan
                        ? `Defaults to ${formatCurrency(watchCurrentTaxes)}`
                        : "e.g., 300"
                    }
                    {...field}
                    step="any"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={
              isNewLoan
                ? `${prefix}.newMonthlyInsurance`
                : `${prefix}.monthlyInsurance`
            }
            render={({ field }) => (
              <FormItem>
                <FormLabel>Homeowners Insurance ($/month)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={
                      isNewLoan
                        ? `Defaults to ${formatCurrency(watchCurrentInsurance)}`
                        : "e.g., 100"
                    }
                    {...field}
                    step="any"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={
              isNewLoan ? `${prefix}.newMonthlyPmi` : `${prefix}.monthlyPmi`
            }
            render={({ field }) => (
              <FormItem>
                <FormLabel>PMI ($/month)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={
                      isNewLoan
                        ? `Defaults to ${formatCurrency(
                            watchCurrentPmi
                          )} (or 0 for Cash-Out)`
                        : "e.g., 50"
                    }
                    {...field}
                    step="any"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={
              isNewLoan ? `${prefix}.newMonthlyHoa` : `${prefix}.monthlyHoa`
            }
            render={({ field }) => (
              <FormItem>
                <FormLabel>HOA ($/month)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={
                      isNewLoan
                        ? `Defaults to ${formatCurrency(watchCurrentHoa)}`
                        : "e.g., 0"
                    }
                    {...field}
                    step="any"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        <Tabs
          value={refinanceMode}
          onValueChange={(value) => setRefinanceMode(value as RefinanceMode)}
          className="w-full"
        >
          <TabsContent value="Rate & Term">
            <div className="flex flex-col md:flex-row gap-6">
              {renderLoanSection("currentLoan")}
              {renderLoanSection("newLoan")}
            </div>
          </TabsContent>
          <TabsContent value="Cash-Out">
            <div className="flex flex-col md:flex-row gap-6">
              {renderLoanSection("currentLoan")}
              {renderLoanSection("newLoan")}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            size="lg"
            className="bg-accent hover:bg-pink-700 text-accent-foreground font-secondary w-full md:w-auto"
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating..." : "Calculate Refinance Benefits"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper to format currency, potentially move to utils
function formatCurrency(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0.00";
  }
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
