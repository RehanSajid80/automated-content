
import { extractDomain } from "./domain-utils.ts"

export interface RequestData {
  keyword: string;
  domain: string;
  targetDomain: string;
  limit: number;
  topicArea: string;
  searchKeyword: string;
}

export async function validateRequest(req: Request): Promise<RequestData> {
  // Parse request body - now expecting keyword (required) and domain (optional)
  const { keyword, domain = '', limit = 100, topicArea } = await req.json();
  console.log(`Request received for keyword: ${keyword || '(none)'}, domain: ${domain || '(none)'}, topic: ${topicArea}, limit: ${limit}`);

  // Require either keyword or domain, but not both
  if (!keyword && !domain) {
    throw new Error("Either keyword or domain parameter is required");
  }

  const searchKeyword = keyword && keyword.trim() ? keyword.trim() : '';
  let targetDomain = '';
  
  // Only process domain if it's provided
  if (domain && domain.trim()) {
    try {
      targetDomain = extractDomain(domain.trim());
    } catch (domainError) {
      console.error('Domain validation error:', domainError);
      throw new Error(domainError.message || 'Invalid domain format');
    }
  }
  
  console.log(`Using ${searchKeyword ? `keyword: "${searchKeyword}" for related keyword research` : 'domain analysis for '}${targetDomain ? `domain: ${targetDomain}` : 'general search'}, Topic Area: ${topicArea}`);

  return {
    keyword,
    domain,
    targetDomain,
    limit,
    topicArea,
    searchKeyword
  };
}
