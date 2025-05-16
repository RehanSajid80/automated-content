
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Copy, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SocialPost {
  id: string;
  title: string | null;
  content: string;
  platform: string | null;
  created_at: string;
  updated_at: string;
  keywords: string[] | null;
  topic_area: string | null;
}

const SocialPostsTab = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching social posts:", error);
      toast.error("Failed to load social posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    const handleContentUpdated = () => {
      fetchPosts();
    };
    
    window.addEventListener("content-updated", handleContentUpdated);
    
    return () => {
      window.removeEventListener("content-updated", handleContentUpdated);
    };
  }, []);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Post copied to clipboard");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("social_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== id));
      toast.success("Social post deleted");
      
      // Refresh other content components
      window.dispatchEvent(new Event("content-updated"));
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    setEditedContent(post.content);
  };

  const saveEditedPost = async () => {
    if (!editingPost) return;
    
    try {
      const { error } = await supabase
        .from("social_posts")
        .update({ content: editedContent })
        .eq("id", editingPost.id);

      if (error) throw error;
      
      // Update local state
      setPosts(posts.map(post => 
        post.id === editingPost.id ? { ...post, content: editedContent } : post
      ));
      
      toast.success("Social post updated successfully");
      setEditingPost(null);
      
      // Refresh other content components
      window.dispatchEvent(new Event("content-updated"));
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>Loading social posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg">
        <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No social posts yet</h3>
        <p className="text-muted-foreground mb-4">
          Create social posts to engage with your audience on LinkedIn and Twitter
        </p>
        <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-content-creator', { detail: { type: 'social' } }))}>
          Create Social Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center">
                    <Share2 size={16} />
                  </div>
                  <CardTitle className="text-sm">{post.title || 'Social Post'}</CardTitle>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                </div>
              </div>
              <CardDescription className="mt-2">
                {post.platform || 'LinkedIn'} • {post.topic_area || 'Workspace Management'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md mb-4">
                <div className="whitespace-pre-wrap text-sm">
                  {post.content}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(post.keywords || []).map((keyword, index) => (
                  <span 
                    key={index} 
                    className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCopy(post.content)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Social Post</DialogTitle>
                      <DialogDescription>
                        Make changes to your social post content
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea 
                      className="min-h-[200px] font-mono text-sm"
                      value={editingPost?.id === post.id ? editedContent : post.content}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={() => {
                        handleEdit(post);
                        saveEditedPost();
                      }}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SocialPostsTab;
