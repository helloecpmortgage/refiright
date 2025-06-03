"use client";
import React, { use } from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { CalculationOutput } from "@/types";
import { formatCurrency, formatMonthsToYearsMonths } from "@/lib/calculations";
import { useEffect, useState } from "react";
import { pdfRendered } from "@/constants/pdf-render";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica", // Puedes cambiarlo por tu fuente registrada
    padding: 30,
    backgroundColor: "#f9f9f9", // Un gris claro para el fondo
  },
  headerContainer: {
    textAlign: "center",
    marginBottom: 30,
  },
  logo: {
    width: 120, // Ajusta el tamaño de tu logo
    height: "auto",
    marginBottom: 10,
    alignSelf: "center", // Centrar el logo si es un View flex
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
  },

  // Estilos para las secciones de contenido
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    border: "1px solid #18C0EC",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#18C0EC", // Azul similar al de la imagen
    marginBottom: 15,
  },

  // Estilos para la tabla
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden", // Para que el borderRadius se aplique bien
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
    alignItems: "center",
    minHeight: 30, // Altura mínima para las filas
  },
  tableColHeader: {
    width: "35%", // Fondo para el encabezado de la columna
    padding: 8,
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 10,
    color: "#555",
  },
  tableCol: {
    width: "21.25%", // 100 / 4 = 25, ajustamos para el Componente
    padding: 8,
    textAlign: "left",
    fontSize: 10,
    color: "#333",
  },
  tableColComponent: {
    // Columna para "Component"
    width: "35%",
    padding: 8,
    textAlign: "left",
    fontSize: 10,
    color: "#333",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa", // Fondo para el encabezado de la tabla
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
    minHeight: 30,
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 10,
    color: "#555",
  },
  // Columna para "Difference" con el triángulo
  tableColDifference: {
    width: "21.25%",
    padding: 8,
    textAlign: "right", // Alinear a la derecha como en la imagen
    fontSize: 10,
    color: "#333",
    flexDirection: "row", // Para el ícono y el texto
    justifyContent: "flex-end", // Alinear contenido a la derecha
    alignItems: "center",
  },
  // Estilo específico para la fila "HOA" en verde
  hoaRow: {
    backgroundColor: "#e6ffe6", // Verde claro
    borderBottomWidth: 0, // No borde inferior para la última fila
  },
  hoaText: {
    color: "#28a745", // Verde más oscuro
    fontWeight: "bold",
  },
  // Ícono de triángulo
  triangleUp: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#dc3545", // Rojo para "pérdida"
    marginRight: 3,
    marginBottom: 3, // Ajuste para alinear con el texto
  },
  triangleDown: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#28a745", // Verde para "ganancia"
    marginRight: 3,
    marginTop: 3, // Ajuste para alinear con el texto
  },

  // Estilos para las cajas de resumen
  summaryBoxesContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Para que las cajas se ajusten si hay muchas
    justifyContent: "space-between",
  },
  summaryBox: {
    backgroundColor: "#f0f8ff", // Azul claro similar al de la imagen
    borderRadius: 8,
    padding: 15,
    width: "23%",
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #cceeff",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 5,
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#555",
    textAlign: "center",
  },

  // Estilos para la sección de notas
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Para que el ícono esté arriba
    marginBottom: 8,
  },
  noteIcon: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  noteText: {
    fontSize: 9,
    color: "#333",
    flex: 1, // Para que el texto ocupe el resto del espacio
  },
  boldText: {
    fontWeight: "bold",
  },
  warningIcon: {
    color: "#ffc107", // Amarillo para advertencia
  },
  infoIcon: {
    color: "#17a2b8", // Azul claro para información
  },
  successIcon: {
    color: "#28a745", // Verde para éxito
  },
});

interface MortgageResultsPDFProps {
  data: CalculationOutput;
}
export default function MortgageResultsPDF({ data }: MortgageResultsPDFProps) {
  const [currentLoan, setCurrentLoan] = useState(data.currentLoan);
  const [newLoan, setNewLoan] = useState(data.newLoan);
  const [difference, setDifference] = useState(data.difference);
  const [savings, setSavings] = useState(data.savings);
  const [valueInputs, setValueInputs] = useState(data.input);

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

  useEffect(() => {
    // Update state when data changes
    if (data) {
      setCurrentLoan(data.currentLoan);
      setNewLoan(data.newLoan);
      setDifference(data.difference);
      setSavings(data.savings);
    }
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.headerContainer}>
          {/* Aquí iría tu logo, asegúrate de que la ruta sea accesible */}
          <Image src="/logo.png" style={styles.logo} />
          {/* Reemplaza con la URL de tu logo real, o un base64 */}
          <Text style={styles.mainTitle}>
            Refinance Mortgage Calculator Results
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Monthly Payment Comparison</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColComponent}>Component</Text>
              <Text style={styles.tableCol}>Current Loan</Text>
              <Text style={styles.tableCol}>New Loan</Text>
              <Text style={styles.tableColDifference}>Difference</Text>
            </View>
            {paymentBreakdown.map((item, index) => (
              <View
                key={index}
                style={[
                  item.isTotal
                    ? {
                        backgroundColor: "#E0E0E0",
                        flexDirection: "row",
                        borderBottomColor: "#e0e0e0",
                        borderBottomWidth: 1,
                        alignItems: "center",
                        minHeight: 30,
                      }
                    : styles.tableRow,
                ]}
              >
                <Text style={styles.tableColHeader}>{item.label}</Text>
                <Text style={styles.tableCol}>
                  {formatCurrency(
                    currentLoan[item.key as keyof typeof currentLoan]
                  )}
                </Text>
                <Text style={styles.tableCol}>
                  {formatCurrency(newLoan[item.key as keyof typeof newLoan])}
                </Text>
                <View
                  style={[
                    styles.tableColDifference,
                    item.isTotal ? { fontWeight: "bold" } : {},
                  ]}
                >
                  {difference[item.key as keyof typeof difference] > 0 ? (
                    <>
                      <Text style={styles.hoaText}>
                        +
                        {formatCurrency(
                          difference[item.key as keyof typeof difference]
                        )}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text>
                        {formatCurrency(
                          difference[item.key as keyof typeof difference]
                        )}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Savings & Analysis</Text>
          <View style={styles.summaryBoxesContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Monthly Savings</Text>
              <Text
                style={[
                  styles.summaryValue,
                  savings.monthlySavings > 0
                    ? { color: "#28a745" }
                    : { color: "#dc3545" },
                ]}
              >
                {formatCurrency(savings.monthlySavings)}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Break-even Period</Text>
              <Text style={styles.summaryValue}>
                {formatMonthsToYearsMonths(savings.breakEvenPeriodMonths)}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Interest Savings</Text>
              <Text
                style={[
                  styles.summaryValue,
                  savings.totalInterestSavings > 0
                    ? { color: "#28a745" }
                    : { color: "#dc3545" },
                ]}
              >
                {formatCurrency(savings.totalInterestSavings)}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Lifetime Savings</Text>
              <Text
                style={[
                  styles.summaryValue,
                  savings.lifetimeSavings > 0
                    ? { color: "#28a745" } // Verde para ganancias
                    : savings.lifetimeSavings < 0
                    ? { color: "#dc3545" } // Rojo para pérdidas|
                    : {},
                ]}
              >
                {formatCurrency(savings.lifetimeSavings)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Decision Insights</Text>
          {savings.monthlySavings > 0 && (
            <View style={styles.noteItem}>
              <Text style={[styles.noteIcon, styles.successIcon]}>✓</Text>
              <Text style={styles.noteText}>
                Potential monthly savings of{" "}
                <Text style={styles.boldText}>
                  {formatCurrency(savings.monthlySavings)}
                </Text>
              </Text>
            </View>
          )}
          {savings.monthlySavings < 0 && (
            <View style={styles.noteItem}>
              <Text style={[styles.noteIcon, styles.warningIcon]}>⚠️</Text>
              <Text style={styles.noteText}>
                Based on these inputs, refinancing results in a higher monthly
                payment of{" "}
                <Text style={styles.boldText}>
                  {formatCurrency(Math.abs(savings.monthlySavings))}
                </Text>
              </Text>
            </View>
          )}
          {savings.monthlySavings === 0 && (
            <Text style={styles.noteText}>
              ℹ️ The total monthly payment remains the same.
            </Text>
          )}
          {savings.breakEvenPeriodMonths !== Infinity &&
            savings.breakEvenPeriodMonths > 0 && (
              <View style={styles.noteItem}>
                <Text style={styles.noteIcon}>⏱️</Text>
                <Text style={styles.noteText}>
                  You could break even on closing costs in approximately{" "}
                  <Text style={[styles.boldText, { fontSize: 10 }]}>
                    {formatMonthsToYearsMonths(savings.breakEvenPeriodMonths)}.
                  </Text>
                </Text>
              </View>
            )}
          {savings.breakEvenPeriodMonths === 0 &&
            valueInputs.newLoan.closingCosts > 0 && (
              <View style={styles.noteItem}>
                <Text style={styles.noteIcon}>⏱️</Text>
                <Text style={styles.noteText}>
                  Break-even is immediate as there are no monthly savings to
                  offset closing costs.
                </Text>
              </View>
            )}
          {savings.breakEvenPeriodMonths === Infinity &&
            valueInputs.newLoan.closingCosts > 0 && (
              <View style={styles.noteItem}>
                <Text style={styles.noteIcon}>⏱️</Text>
                <Text style={styles.noteText}>
                  A break-even point is not reached because there are no monthly
                  savings.
                </Text>
              </View>
            )}

          {savings.totalInterestSavings > 0 && (
            <View style={styles.noteItem}>
              <Text style={styles.noteIcon}>💰</Text>
              <Text style={styles.noteText}>
                This option could reduce your total interest paid by
                approximately{" "}
                <Text style={[styles.boldText, { fontSize: 10 }]}>
                  {formatCurrency(savings.totalInterestSavings)}
                </Text>
                <Text style={styles.noteText}>
                  {" "}
                  over the life of the new loan compared to the remaining
                  interest on the current loan.
                </Text>
              </Text>
            </View>
          )}
          {savings.totalInterestSavings < 0 && (
            <View style={styles.noteItem}>
              <Text style={[styles.noteIcon, styles.warningIcon]}>⚠️</Text>
              <Text style={styles.noteText}>
                This option increases your total interest paid by approximately{" "}
                <Text style={[styles.boldText, { fontSize: 10 }]}>
                  {formatCurrency(Math.abs(savings.totalInterestSavings))}
                </Text>
                <Text style={styles.noteText}>
                  {" "}
                  over the life of the new loan compared to the remaining
                  interest on the current loan.
                </Text>
              </Text>
            </View>
          )}

          {valueInputs.newLoan.newTerm >
            valueInputs.currentLoan.remainingTerm && (
            <View style={styles.noteItem}>
              <Text style={styles.noteIcon}>⏳</Text>
              <Text style={styles.noteText}>
                Note: While the monthly payment might be lower, extending the
                loan term from{" "}
                {valueInputs.currentLoan.remainingTerm.toFixed(1)} to{" "}
                {valueInputs.newLoan.newTerm} years{" "}
                {savings.totalInterestSavings < 0
                  ? "contributes to higher total interest paid."
                  : "may impact total interest paid."}
              </Text>
            </View>
          )}
          {valueInputs.newLoan.newTerm <
            valueInputs.currentLoan.remainingTerm && (
            <View style={styles.noteItem}>
              <Text style={styles.noteIcon}>⏳</Text>
              <Text style={styles.noteText}>
                Shortening the loan term from{" "}
                {valueInputs.currentLoan.remainingTerm.toFixed(1)} to{" "}
                {valueInputs.newLoan.newTerm} years helps build equity faster
                and{" "}
                {savings.totalInterestSavings > 0
                  ? "contributes to lower total interest paid."
                  : "may impact total interest paid."}
              </Text>
            </View>
          )}

          {valueInputs.mode === "Cash-Out" &&
            valueInputs.newLoan.newLoanAmount >
              valueInputs.currentLoan.currentBalance && (
              <View style={styles.noteItem}>
                <Text style={styles.noteIcon}>💸</Text>
                <Text style={styles.noteText}>
                  This cash-out refinance increases your loan balance by{" "}
                </Text>
                <Text style={[styles.boldText, { fontSize: 10 }]}>
                  {formatCurrency(
                    valueInputs.newLoan.newLoanAmount -
                      valueInputs.currentLoan.currentBalance
                  )}
                </Text>
                <Text style={styles.noteText}>
                  {" "}
                  (including cash out{" "}
                  {valueInputs.newLoan.costsPaidUpfront
                    ? ""
                    : "and rolled-in costs"}
                  ).
                </Text>
              </View>
            )}
        </View>

        <View style={{ width: "100%", marginTop: 20 }}>
          <Text style={[styles.noteText, { fontSize: "6px" }]}>
            {pdfRendered.DISCLAIMER_MESSAGE}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
