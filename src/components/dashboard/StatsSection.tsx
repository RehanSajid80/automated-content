
import React from 'react';
import StatsCard from './StatsCard';
import { FileText, Tag, Share2, Building2 } from 'lucide-react';
import { ContentStats } from '@/hooks/useContentStats';
import { toast } from "@/components/ui/use-toast";

interface StatsSectionProps {
  stats: ContentStats;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const getTrendInfo = (count: number) => {
    if (count > 0) {
      return {
        trend: "up" as const,
        message: count === 1 ? "1 item" : `${count} items`
      };
    }
    return {
      trend: "neutral" as const,
      message: "No content"
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title="Pillar Content"
        value={stats.pillarCount.toString()}
        icon={<FileText size={20} />}
        trend={getTrendInfo(stats.pillarCount).trend}
        trendValue={getTrendInfo(stats.pillarCount).message}
        delay="animation-delay-100"
      />
      <StatsCard
        title="Support Pages"
        value={stats.supportCount.toString()}
        icon={<Building2 size={20} />}
        trend={getTrendInfo(stats.supportCount).trend}
        trendValue={getTrendInfo(stats.supportCount).message}
        delay="animation-delay-200"
      />
      <StatsCard
        title="Meta Tags"
        value={stats.metaCount.toString()}
        icon={<Tag size={20} />}
        trend={getTrendInfo(stats.metaCount).trend}
        trendValue={getTrendInfo(stats.metaCount).message}
        delay="animation-delay-300"
      />
      <StatsCard
        title="Social Posts"
        value={stats.socialCount.toString()}
        icon={<Share2 size={20} />}
        trend={getTrendInfo(stats.socialCount).trend}
        trendValue={getTrendInfo(stats.socialCount).message}
        delay="animation-delay-400"
      />
    </div>
  );
};

export default StatsSection;
