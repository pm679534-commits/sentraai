// Add `az` and `ru` dictionaries here later; components only consume this object.
export const copy = {
  en: {
    seo: {
      title: "SentraAI — AI security for every conversation",
      template: "%s | SentraAI",
      description:
        "Protect sensitive data before it reaches public AI tools. Real-time detection, adaptive policies, and a complete audit trail for enterprise teams.",
      openGraphDescription:
        "Give your teams the freedom to use AI while keeping sensitive data inside your perimeter.",
    },
    nav: {
      platform: "Platform",
      how: "How it works",
      pricing: "Pricing",
      trust: "Trust",
      login: "Sign in",
      demo: "Get a demo",
    },
    hero: {
      eyebrow: "THE CONTROL PLANE FOR ENTERPRISE AI",
      titleA: "Your people can use AI.",
      titleB: "Your data stays yours.",
      body: "SentraAI inspects prompts before they reach public AI tools, automatically masking sensitive details, blocking high-risk requests, and giving security teams a clear record of every decision.",
      primary: "Explore the platform",
      secondary: "Talk to sales",
      proof:
        "Built for regulated teams across finance, insurance, and enterprise.",
    },
    problem: {
      eyebrow: "THE EXPOSURE GAP",
      title: "One pasted prompt can become a reportable incident.",
      body: "Employees are already using public AI to move faster. Sensitive records, customer identifiers, contract terms, and internal secrets can leave your perimeter in seconds. Traditional DLP rarely sees the prompt before it is sent.",
      cards: [
        {
          title: "Invisible movement",
          body: "Security teams lack a reliable view of which AI tools teams use and what information is being shared.",
        },
        {
          title: "A growing attack surface",
          body: "AI workflows touch customer data, financial forecasts, source code, and privileged credentials.",
        },
        {
          title: "Policies that lag",
          body: "Blanket bans slow the business; manual review cannot keep up with live conversations.",
        },
      ],
    },
    how: {
      eyebrow: "HOW SENTRAAI WORKS",
      title: "Protection at the moment it matters.",
      steps: [
        {
          number: "01",
          title: "Connect your gateway",
          body: "Authenticate requests with an organization API key. Browser and network integrations use the same scan contract.",
        },
        {
          number: "02",
          title: "Inspect in real time",
          body: "Pattern rules identify personal data, card numbers, credentials, and sensitive business language before transmission.",
        },
        {
          number: "03",
          title: "Apply your policy",
          body: "Mask, block, or alert by data category. Your team controls the response for each risk.",
        },
        {
          number: "04",
          title: "Keep a clear record",
          body: "Review incident metadata, usage, and policy decisions without retaining raw prompts.",
        },
      ],
    },
    features: {
      eyebrow: "PURPOSE-BUILT CONTROLS",
      title: "Make safe AI use the default.",
      items: [
        {
          title: "Real-time scanning",
          body: "Fast, deterministic detection in the path of every connected AI request.",
        },
        {
          title: "Precision masking",
          body: "Replace only the sensitive span so useful context remains available.",
        },
        {
          title: "Central policy rules",
          body: "Tune actions for identity data, payment cards, credentials, financial figures, and more.",
        },
        {
          title: "Investigation-ready audit",
          body: "See who, when, where, and why a request was flagged, without exposing its content.",
        },
        {
          title: "Live risk dashboard",
          body: "Track department trends, repeat exposures, and changes in AI usage.",
        },
        {
          title: "Compliance alignment",
          body: "Support privacy programs with controls mapped to GDPR and local data protection obligations.",
        },
      ],
    },
    trust: {
      eyebrow: "TRUST BY DESIGN",
      title: "The gateway should never become the leak.",
      body: "Raw prompts stay out of incident storage. API keys are hashed at rest. Tenant boundaries are enforced in database queries, with role-based access and logged admin actions.",
      badges: [
        "GDPR-aligned controls",
        "Azerbaijan data protection aware",
        "Tenant-scoped access",
        "Metadata-only incidents",
      ],
      boundary: "Data handling boundary",
      flow: [
        {
          number: "01",
          title: "Prompt inspected in memory",
          body: "Sensitive spans located before transmission",
        },
        {
          number: "02",
          title: "Policy decision applied",
          body: "Mask, block, or alert based on category",
        },
        {
          number: "03",
          title: "Metadata recorded",
          body: "Category, count, action, and timestamp only",
        },
      ],
      storageNote: "Raw prompt is never written to the incident database",
    },
    pricing: {
      eyebrow: "PRICING",
      title: "Start with visibility. Scale to control.",
      popular: "Most popular",
      plans: [
        {
          name: "Starter",
          price: "$490",
          suffix: "/ month",
          body: "For growing teams establishing safe AI habits.",
          features: [
            "Up to 100 monitored employees",
            "Core detection categories",
            "30-day incident history",
            "Email support",
          ],
          cta: "Start a trial",
        },
        {
          name: "Business",
          price: "$1,490",
          suffix: "/ month",
          body: "For security teams building consistent policy.",
          features: [
            "Up to 1,000 monitored employees",
            "Advanced policy controls",
            "Department risk analytics",
            "90-day incident history",
            "Priority support",
          ],
          cta: "Start a trial",
        },
        {
          name: "Enterprise",
          price: "Custom",
          suffix: "",
          body: "For regulated organizations with complex environments.",
          features: [
            "Custom usage and retention",
            "SSO integration roadmap",
            "Dedicated onboarding",
            "Security review support",
            "Commercial SLA",
          ],
          cta: "Contact sales",
        },
      ],
    },
    testimonials: {
      eyebrow: "DESIGNED WITH OPERATORS IN MIND",
      title: "Security without slowing the work.",
      quotes: [
        {
          quote:
            "We needed a way to guide AI use, not shut it down. The policy view makes that conversation concrete for every department.",
          person: "Head of Security",
          company: "Northbridge Capital Labs (fictional)",
        },
        {
          quote:
            "The incident record gives our compliance team a practical starting point without forcing them to handle raw customer prompts.",
          person: "Privacy Lead",
          company: "Caspian Vale Financial (fictional)",
        },
      ],
    },
    cta: {
      eyebrow: "SENTRAAI FOR YOUR TEAM",
      title: "Move faster with AI. Keep control of your data.",
      body: "See how SentraAI fits into your security program and your teams’ daily workflows.",
      action: "Book a walkthrough",
    },
    footer: {
      line: "The security layer for enterprise AI.",
      product: "Product",
      company: "Company",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      rights: "All rights reserved.",
      links: { platform: "Platform", pricing: "Pricing", signIn: "Sign in" },
    },
    visual: {
      inspection: "LIVE PROMPT INSPECTION",
      gateway: "sentra-gateway / v1",
      outgoing: "Outgoing request",
      tool: "ChatGPT",
      review: "Review in progress",
      promptStart: "Summarize the renewal proposal for client",
      email: "amina.aliyeva@client.example",
      promptMiddle: "and include the account forecast of",
      amount: "AZN 2.4 million",
      engine: "SentraAI policy engine",
      findings: "2 findings",
      findingTypes: "Email address · Financial figure",
      applied: "Policy applied",
      masked: "Sensitive spans masked",
      ready: "Safe version ready for the AI tool",
      protected: "Requests protected today",
      count: "12,847",
      change: "↑ 18.6%",
    },
    legal: {
      eyebrow: "Legal",
      back: "Back to home",
      privacy: {
        title: "Privacy overview",
        intro:
          "SentraAI is built to inspect AI requests without retaining raw prompt content. Incident records contain detection categories, counts, policy outcomes, tool names, and timestamps. Workspace account information and employee metadata are stored to provide reporting and access control.",
        section: "Data handling",
        body: "Prompt text is processed in memory for the scan response and is not stored in the incident database. Customer administrators control API keys and policy rules. Internal support access is role-restricted and logged.",
        contact: "For data handling questions, contact",
        note: "This overview is for the product demonstration. A customer-specific privacy notice and data processing agreement should be completed before live deployment.",
      },
      terms: {
        title: "Terms overview",
        intro:
          "SentraAI provides AI prompt inspection, policy decisions, and metadata-based reporting. Customers are responsible for configuring their gateway to honor block and mask decisions, managing authorized users, and ensuring their AI usage complies with applicable obligations.",
        section: "Product demonstration",
        body: "This site and its sample account data are intended to demonstrate the product. Commercial terms, service levels, privacy commitments, and applicable law are established in a signed customer agreement.",
        contact: "To discuss deployment, contact",
      },
    },
  },
} as const;
export const t = copy.en;
