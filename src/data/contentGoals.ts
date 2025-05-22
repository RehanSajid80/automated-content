
export interface ContentGoal {
  id: string;
  name: string;
  description: string;
}

export const contentGoals: ContentGoal[] = [
  {
    id: "generate-leads",
    name: "Generate Leads",
    description: "Content designed to attract and convert new prospects"
  },
  {
    id: "increase-seo",
    name: "Increase SEO Ranking",
    description: "Optimize content to improve search engine visibility"
  },
  {
    id: "nurture-leads",
    name: "Nurture Leads",
    description: "Guide prospects through the buyer's journey with educational content"
  },
  {
    id: "thought-leadership",
    name: "Build Thought Leadership",
    description: "Establish industry authority with insightful, innovative content"
  },
  {
    id: "customer-retention",
    name: "Customer Retention",
    description: "Content to engage and provide value to existing customers"
  }
];
