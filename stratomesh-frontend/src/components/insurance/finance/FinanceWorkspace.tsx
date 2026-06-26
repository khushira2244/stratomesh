import FinPriceWorkspaceShell from "../finprice/FinPriceWorkspaceShell";
import { financeBoxTemplates } from "../../../lib/finance-workspace";

export default function FinanceWorkspace() {
  return (
    <FinPriceWorkspaceShell
      teamSlug="finance"
      teamName="Finance"
      teamKicker="Insurance Company · Finance Team"
      heading="Finance Workforce Dashboard"
      subheading="Finance reviews received packages, verifies premium/payment, adds tags and comments, then clears cases for policy issuance, source-team correction, or management approval."
      receivedDeskTitle="Finance Send / Receive Desk"
      receivedDeskDescription="Payment, premium, invoice, receipt, credit approval, and finance-clearance requests appear here. Send one item to Working Space to create a finance decision package."
      filterChips={[
        "All",
        "Fire & Property Insurance",
        "Marine Cargo Insurance",
        "Insurance Case",
        "Payment",
        "Premium Mismatch",
        "Invoice / Receipt",
        "Credit Approval",
        "Finance Hold",
        "Manager Clearance",
      ]}
      boxTemplates={financeBoxTemplates}
      amountLabelTitle="Premium"
      statusLabelTitle="Payment Status"
      pipelineSteps={[
        {
          team: "Sales",
          status: "COMPLETED",
        },
        {
          team: "Underwriting",
          status: "COMPLETED",
        },
        {
          team: "Pricing",
          status: "COMPLETED",
        },
        {
          team: "Finance",
          status: "CURRENT",
        },
        {
          team: "Policy Issuance",
          status: "WAITING",
        },
      ]}
    />
  );
}