
import React from "react";
import { FileText, Tag, Share2 } from "lucide-react";

// Helper functions for content type displays
export const getIcon = (type: string) => {
  switch (type) {
    case "pillar":
      return <FileText size={16} />;
    case "support":
      return <FileText size={16} />;
    case "meta":
      return <Tag size={16} />;
    case "social":
      return <Share2 size={16} />;
    default:
      return <FileText size={16} />;
  }
};

export const getTypeLabel = (type: string) => {
  switch (type) {
    case "pillar":
      return "Pillar Content";
    case "support":
      return "Support Page";
    case "meta":
      return "Meta Tags";
    case "social":
      return "Social Posts";
    default:
      return type;
  }
};

export const getTypeClass = (type: string) => {
  switch (type) {
    case "pillar":
      return "bg-primary/10 text-primary";
    case "support":
      return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
    case "meta":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
    case "social":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    default:
      return "bg-primary/10 text-primary";
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const contentTypes = [
  { id: "all", label: "All Content" },
  { id: "pillar", label: "Pillar Content" },
  { id: "support", label: "Support Pages" },
  { id: "meta", label: "Meta Tags" },
  { id: "social", label: "Social Posts" }
];
