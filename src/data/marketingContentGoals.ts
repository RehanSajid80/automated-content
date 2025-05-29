
export interface MarketingContentGoal {
  id: string;
  name: string;
  description: string;
}

export const marketingContentGoals: MarketingContentGoal[] = [
  {
    id: "build-thought-leadership",
    name: "Build Thought Leadership",
    description: "Establish industry authority and expertise"
  },
  {
    id: "improve-seo",
    name: "Improve SEO",
    description: "Enhance search engine visibility and rankings"
  },
  {
    id: "educate-buyers",
    name: "Educate Buyers",
    description: "Inform and guide potential customers"
  },
  {
    id: "support-sales-enablement",
    name: "Support Sales Enablement",
    description: "Create content that helps sales teams close deals"
  },
  {
    id: "nurture-accounts",
    name: "Nurture Accounts",
    description: "Engage and retain existing customers"
  }
];
