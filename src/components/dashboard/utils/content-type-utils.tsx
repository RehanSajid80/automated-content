
import { FileText, Tag, Share2, Settings, Mail, Lightbulb } from "lucide-react";
import { ContentTypeConfig } from "../types/recent-content";

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
    case "misc":
      return <Settings size={16} />;
    case "email":
      return <Mail size={16} />;
    case "content-idea":
      return <Lightbulb size={16} />;
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
    case "misc":
      return "Adjusted Content";
    case "email":
      return "Email Content";
    case "content-idea":
      return "Content Idea";
    default:
      // Capitalize first letter of type
      return type.charAt(0).toUpperCase() + type.slice(1);
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
    case "misc":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400";
    case "email":
      return "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400";
    case "content-idea":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
    default:
      return "bg-primary/10 text-primary";
  }
};
