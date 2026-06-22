Yes bro — **documents can be added at two places**, and both are important.

## 1. Case-level documents

This is when the broker/request first comes.

Example:

```txt
Broker uploads / sends:
- Proposal Form
- Previous Policy Copy
- Claim History
- Fire Safety Certificate
- Sum Insured Breakup
- Risk Inspection Report
```

These belong to the **whole case**.

So case page shows:

```txt
Sunrise Foods case documents
```

These documents are available to all teams:

```txt
Sales
Underwriting
Pricing
Policy Issuance
Finance
Management
```

This is the main document repository for the case.

---

## 2. Block-level documents

This is when a specific team/block requires or adds documents.

Example Sales block:

```txt
Document Completeness Check
Required docs:
- Proposal Form
- Previous Policy Copy
- Claim History
- Fire Safety Certificate
```

Sales team can attach or mark:

```txt
Claim History: received
Fire Safety Certificate: missing
```

Example Underwriting block:

```txt
Asset Value Verification
Required docs:
- Fixed Asset Register
- Stock Statement
- Property Valuation Summary
```

Example Finance block:

```txt
UTR / Bank Reference Match
Required docs:
- Payment Proof
- Bank UTR
- Debit Note
```

So yes, a user can add documents **inside a block** also.

---

# Correct product logic

```txt
Case documents = all documents available for the case

Block documents = documents needed or used by a specific block
```

The same document can be used by many blocks.

Example:

```txt
Claim History
→ Sales checks if it is available
→ Underwriting uses it for risk review
→ Pricing uses it for premium calculation
```

So document is not only for Sales. It can travel forward as input to other teams.

---

# How one team passes docs to another team

Sales block output:

```txt
Underwriting Handoff Package
```

It contains:

```txt
Client details
Policy requirement
Asset schedule
Risk tags
Received documents
Missing documents
Sales notes
```

This becomes Underwriting input.

Then Underwriting output:

```txt
Underwriting Terms Package
```

It contains:

```txt
Risk grade
Coverage decision
Subjectivities
Required clauses
Approved/rejected terms
```

This becomes Pricing input.

So the flow is:

```txt
Case docs + Sales block output
        ↓
Underwriting input
        ↓
Underwriting output
        ↓
Pricing input
        ↓
Pricing output
        ↓
Policy Issuance input
        ↓
Finance input
```

---

# UI should show this clearly

On a block, show:

```txt
Inputs
Required documents
Attached documents
Missing documents
Output package
Route to next team
```

Example block UI:

```txt
Block: Underwriting Handoff

Inputs:
- Document checklist
- Risk tags
- Client details

Documents attached:
- Proposal Form
- Claim History
- Fire Safety Certificate
- Asset Schedule

Output:
- Underwriting handoff package

Next:
Underwriting → Risk Data Received
```

---

# Database meaning

We should store documents at both levels:

```txt
CaseDocument
```

For full case documents.

And inside `CaseBlock`:

```txt
requiredDocs
inputs
output
```

For block-level document requirements and handoff package.

Later, if needed, we can add:

```txt
BlockDocument
```

But for now, your schema can already handle it because `CaseBlock.requiredDocs`, `CaseBlock.inputs`, and `CaseBlock.output` are JSON fields.

## Final rule

```txt
User uploads document at case level.
Team blocks consume those documents.
A block can also request/add/mark documents.
The block output package passes selected docs and notes to the next team.
```

That is exactly how Sales team will use it, and how the same docs can move to Underwriting, Pricing, Policy Issuance, Finance, or any other app/module later.
