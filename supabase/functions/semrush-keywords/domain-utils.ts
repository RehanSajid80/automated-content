
// Extract and validate domain from URL or domain string
export const extractDomain = (url: string): string => {
  try {
    let domain = url;
    
    if (url.includes('://')) {
      const parsedUrl = new URL(url);
      domain = parsedUrl.hostname;
    } else if (url.includes('/')) {
      domain = url.split('/')[0];
    }
    
    domain = domain.replace(/^www\./, '');
    
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      throw new Error("Invalid domain format");
    }
    
    console.log(`Extracted domain: ${domain} from input: ${url}`);
    return domain;
  } catch (err) {
    console.error(`Failed to extract domain from ${url}: ${err.message}`);
    throw new Error("Invalid URL or domain format");
  }
};
