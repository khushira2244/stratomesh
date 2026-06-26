import FinPriceWorkspaceShell from "../finprice/FinPriceWorkspaceShell";
import { pricingBoxTemplates } from "../../../lib/pricing-workspace";

export default function PricingWorkspace() {
  return (
    <FinPriceWorkspaceShell
      teamSlug="pricing"
      teamName="Pricing"
      teamKicker="Insurance Company · Pricing Team"
      heading="Pricing Workforce Dashboard"
      subheading="Pricing reviews received packages, calculates quote/premium, applies risk loading or discounts, adds tags and comments, then sends quote output to Sales, Finance, or Management."
      receivedDeskTitle="Pricing Send / Receive Desk"
      receivedDeskDescription="Risk, quote, premium calculation, discount, and approval requests appear here. Send one item to Working Space to prepare pricing output."
      filterChips={[
        "All",
        "Fire & Property Insurance",
        "Marine Cargo Insurance",
        "Insurance Case",
        "New Quote",
        "Risk Loading",
        "Premium Calculation",
        "Discount Approval",
        "Quote Follow-up",
        "Manager Approval",
      ]}
      boxTemplates={pricingBoxTemplates}
      amountLabelTitle="Expected Premium"
      statusLabelTitle="Quote Status"
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
          status: "CURRENT",
        },
        {
          team: "Finance",
          status: "WAITING",
        },
        {
          team: "Policy Issuance",
          status: "WAITING",
        },
      ]}
    />
  );
}