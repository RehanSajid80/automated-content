
import React from 'react';
import StatsCard from './StatsCard';
import { FileText, Tag, Share2, Building2 } from 'lucide-react';
import { ContentStats } from '@/hooks/useContentStats';

interface StatsSectionProps {
  stats: ContentStats;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title="Pillar Content"
        value={stats.pillarCount.toString()}
        icon={<FileText size={20} />}
        trend={stats.pillarCount > 0 ? "up" : "neutral"}
        trendValue={stats.pillarCount > 0 ? "New content" : "No content"}
        delay="animation-delay-100"
      />
      <StatsCard
        title="Support Pages"
        value={stats.supportCount.toString()}
        icon={<Building2 size={20} />}
        trend={stats.supportCount > 0 ? "up" : "neutral"}
        trendValue={stats.supportCount > 0 ? "New content" : "No content"}
        delay="animation-delay-200"
      />
      <StatsCard
        title="Meta Tags"
        value={stats.metaCount.toString()}
        icon={<Tag size={20} />}
        trend={stats.metaCount > 0 ? "up" : "neutral"}
        trendValue={stats.metaCount > 0 ? "New content" : "No content"}
        delay="animation-delay-300"
      />
      <StatsCard
        title="Social Posts"
        value={stats.socialCount.toString()}
        icon={<Share2 size={20} />}
        trend={stats.socialCount > 0 ? "up" : "neutral"}
        trendValue={stats.socialCount > 0 ? "New content" : "No content"}
        delay="animation-delay-400"
      />
    </div>
  );
};

export default StatsSection;
