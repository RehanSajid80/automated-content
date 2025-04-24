
import { KeywordData } from "./excelUtils";

// Types of content that can be suggested
export type ContentType = "pillar" | "blog" | "guide" | "landing" | "social";

export interface ContentSuggestion {
  keyword: string;
  contentTypes: ContentType[];
  reason: string;
  priority: "high" | "medium" | "low";
}

// Analyze keywords and suggest content types
export function analyzeKeywords(keywords: KeywordData[]): ContentSuggestion[] {
  return keywords.map((kw) => {
    const suggestions: ContentType[] = [];
    const volume = kw.volume;
    const difficulty = kw.difficulty;
    
    // High-volume keywords (>5000) are good candidates for pillar content
    if (volume > 5000) {
      suggestions.push("pillar");
    }

    // Medium-difficulty keywords (40-70) are good for blog posts
    if (difficulty >= 40 && difficulty <= 70) {
      suggestions.push("blog");
    }

    // High-volume, low-difficulty keywords are perfect for landing pages
    if (volume > 3000 && difficulty < 50) {
      suggestions.push("landing");
    }

    // All keywords can benefit from social content
    suggestions.push("social");

    // Keywords with medium volume and difficulty are good for guides
    if (volume > 2000 && volume <= 5000 && difficulty >= 30 && difficulty <= 60) {
      suggestions.push("guide");
    }

    // Determine priority based on volume and difficulty
    const priority = getPriority(volume, difficulty);

    // Generate reason based on metrics
    const reason = generateReason(kw, suggestions);

    return {
      keyword: kw.keyword,
      contentTypes: suggestions,
      reason,
      priority
    };
  });
}

function getPriority(volume: number, difficulty: number): "high" | "medium" | "low" {
  if (volume > 5000 && difficulty < 60) return "high";
  if (volume > 3000 || difficulty < 50) return "medium";
  return "low";
}

function generateReason(kw: KeywordData, suggestions: ContentType[]): string {
  const metrics = [`${kw.volume.toLocaleString()} monthly searches`, `difficulty score of ${kw.difficulty}`];
  
  if (kw.trend === "up") {
    metrics.push("trending upward");
  }
  
  let reason = `Based on ${metrics.join(", ")}, `;
  
  if (suggestions.includes("pillar")) {
    reason += "this keyword deserves comprehensive pillar content. ";
  }
  
  if (suggestions.includes("landing")) {
    reason += "A dedicated landing page could capture high-intent traffic. ";
  }
  
  if (suggestions.includes("blog")) {
    reason += "Regular blog content would help maintain visibility. ";
  }
  
  return reason.trim();
}
