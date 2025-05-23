
import React from "react";
import { Badge } from "@/components/ui/badge";

interface AIContentItemProps {
  item: any;
  index: number;
}

export const AIContentItem: React.FC<AIContentItemProps> = ({ item, index }) => {
  // Normalize socialMediaPosts when it's an object with circular references
  const normalizedSocialPosts = React.useMemo(() => {
    if (item.socialMediaPosts) {
      if (Array.isArray(item.socialMediaPosts)) {
        return item.socialMediaPosts;
      } else if (typeof item.socialMediaPosts === 'object') {
        // Handle case where socialMediaPosts is an object with circular reference
        if (item.socialMediaPosts.message && item.socialMediaPosts.message.includes('Circular Reference')) {
          return item.socialMedia || [];
        }
        return [JSON.stringify(item.socialMediaPosts)];
      }
      return [String(item.socialMediaPosts)];
    }
    return item.socialMedia || [];
  }, [item]);

  // Normalize emailSeries when it's an object with circular references
  const normalizedEmailSeries = React.useMemo(() => {
    if (item.emailSeries) {
      if (Array.isArray(item.emailSeries)) {
        return item.emailSeries;
      } else if (typeof item.emailSeries === 'object') {
        // Handle case where emailSeries is an object with circular reference
        if (item.emailSeries.message && item.emailSeries.message.includes('Circular Reference')) {
          return item.email || [];
        }
        return [JSON.stringify(item.emailSeries)];
      }
      return [String(item.emailSeries)];
    }
    return item.email || [];
  }, [item]);

  // Normalize reasoning when it's an object with circular references
  const normalizedReasoning = React.useMemo(() => {
    if (item.reasoning) {
      if (typeof item.reasoning === 'object') {
        // Handle case where reasoning is an object with circular reference
        if (item.reasoning.message && item.reasoning.message.includes('Circular Reference')) {
          return {};
        }
        return item.reasoning;
      }
      return {general: String(item.reasoning)};
    }
    return {};
  }, [item]);

  return (
    <div className="space-y-6">
      {/* 1. Pillar Content Section */}
      {item.pillarContent && (
        <section className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Badge variant="outline">1</Badge>
            Pillar Content Idea
          </h3>
          <p className="mt-2 whitespace-pre-wrap">
            {typeof item.pillarContent === 'string' 
              ? item.pillarContent 
              : Array.isArray(item.pillarContent) && item.pillarContent.length > 0
                ? item.pillarContent[0]
                : typeof item.pillarContent === 'object' 
                  ? JSON.stringify(item.pillarContent, null, 2) 
                  : '⚠️ Content not provided'}
          </p>
        </section>
      )}

      {/* 2. Support Content Section */}
      {item.supportContent && (
        <section className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Badge variant="outline">2</Badge>
            Support Content Idea
          </h3>
          <p className="mt-2 whitespace-pre-wrap">
            {typeof item.supportContent === 'string' 
              ? item.supportContent 
              : Array.isArray(item.supportContent) && item.supportContent.length > 0
                ? item.supportContent[0]
                : typeof item.supportContent === 'object' 
                  ? JSON.stringify(item.supportContent, null, 2) 
                  : '⚠️ Content not provided'}
          </p>
        </section>
      )}

      {/* 3. Social Media Posts Section */}
      {(normalizedSocialPosts.length > 0) && (
        <section className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Badge variant="outline">3</Badge>
            Social Media Posts
          </h3>
          <ul className="mt-2 space-y-3">
            {normalizedSocialPosts.length > 0 ? (
              normalizedSocialPosts.map((post, idx) => (
                <li key={idx} className="p-3 bg-muted/30 rounded-md">
                  <Badge className="mb-1">{
                    idx === 0 ? 'LinkedIn' : 
                    idx === 1 ? 'Twitter/X' : 
                    idx === 2 ? 'Instagram/Facebook' : 
                    `Social Post ${idx + 1}`
                  }</Badge>
                  <p className="whitespace-pre-wrap">{typeof post === 'string' ? post : JSON.stringify(post)}</p>
                </li>
              ))
            ) : (
              <li>⚠️ Social media posts not provided</li>
            )}
          </ul>
        </section>
      )}

      {/* 4. Email Series Section */}
      {(normalizedEmailSeries.length > 0) && (
        <section className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Badge variant="outline">4</Badge>
            Email Series
          </h3>
          <ul className="mt-2 space-y-3">
            {normalizedEmailSeries.length > 0 ? (
              normalizedEmailSeries.map((email, idx) => (
                <li key={idx} className="p-3 bg-muted/30 rounded-md">
                  <p className="font-medium">Subject: {
                    typeof email === 'object' && email.subject 
                      ? email.subject 
                      : typeof email === 'string' && email.includes('Subject:')
                        ? email.split('Subject:')[1]?.split('\n')[0]?.trim() || `Email ${idx + 1}`
                        : `Email ${idx + 1}`
                  }</p>
                  <p className="mt-1 whitespace-pre-wrap">{
                    typeof email === 'object' && email.body 
                      ? email.body 
                      : typeof email === 'string' 
                        ? (email.includes('Subject:') ? email.split('\n\n').slice(1).join('\n\n') : email)
                        : JSON.stringify(email)
                  }</p>
                </li>
              ))
            ) : (
              <li>⚠️ Email content not provided</li>
            )}
          </ul>
        </section>
      )}

      {/* 5. Reasoning Section */}
      {Object.keys(normalizedReasoning).length > 0 && (
        <section className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Badge variant="outline">5</Badge>
            Content Reasoning & Strategy
          </h3>
          <div className="mt-2 space-y-2">
            {typeof normalizedReasoning === 'object' ? (
              <>
                {normalizedReasoning.pillarContent && (
                  <div>
                    <h4 className="font-medium">Pillar Content Justification:</h4>
                    <p className="text-sm text-muted-foreground">{normalizedReasoning.pillarContent}</p>
                  </div>
                )}
                {normalizedReasoning.supportContent && (
                  <div>
                    <h4 className="font-medium">Support Content Justification:</h4>
                    <p className="text-sm text-muted-foreground">{normalizedReasoning.supportContent}</p>
                  </div>
                )}
                {normalizedReasoning.socialMediaPosts && (
                  <div>
                    <h4 className="font-medium">Social Media Strategy:</h4>
                    <p className="text-sm text-muted-foreground">{normalizedReasoning.socialMediaPosts}</p>
                  </div>
                )}
                {normalizedReasoning.emailSeries && (
                  <div>
                    <h4 className="font-medium">Email Strategy:</h4>
                    <p className="text-sm text-muted-foreground">{normalizedReasoning.emailSeries}</p>
                  </div>
                )}
                {normalizedReasoning.general && (
                  <div>
                    <h4 className="font-medium">General Strategy:</h4>
                    <p className="text-sm text-muted-foreground">{normalizedReasoning.general}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="whitespace-pre-wrap">{JSON.stringify(normalizedReasoning, null, 2)}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
