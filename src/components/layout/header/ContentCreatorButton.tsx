
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ContentCreatorDialog from "@/components/dashboard/ContentCreatorDialog";

const ContentCreatorButton: React.FC<{ className?: string }> = ({ className }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Sparkles size={16} className="mr-2" />
          Create Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
          <DialogDescription>
            Quickly generate professional content for your office space software
          </DialogDescription>
        </DialogHeader>
        <ContentCreatorDialog onClose={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ContentCreatorButton;
