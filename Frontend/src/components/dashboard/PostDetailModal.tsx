import { useState, useEffect } from 'react';
import { analysisApi } from '@/lib/api/analysis';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PoliticalSpectrum } from '@/components/spectrum/PoliticalSpectrum';
import { Separator } from '@/components/ui/separator';
import { Instagram, Twitter, Globe, ExternalLink, Heart, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostDetail {
  _id: string;
  url: string;
  platform: string;
  conversation_id: string;
  scraped_data: {
    caption?: string;
    transcription?: string;
    username?: string;
    likes?: number;
    comments?: number;
    timestamp?: string;
  };
  analysis: {
    classification: string;
    summary: string;
    model_metadata?: {
      models_involved: number;
      timestamp: string;
    };
  };
  bias_embedding?: number[];
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  x: <Twitter className="h-5 w-5" />,
};

function parseClassificationScore(classification: string): number {
  const lower = classification.toLowerCase();
  if (lower.includes('far left')) return -80;
  if (lower.includes('lean left')) return -40;
  if (lower.includes('far right')) return 80;
  if (lower.includes('lean right')) return 40;
  if (lower.includes('center')) return 0;
  return 0;
}

interface PostDetailModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostDetailModal({ postId, isOpen, onClose }: PostDetailModalProps) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!postId) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await analysisApi.getPost(postId);
        setPost(data);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post details');
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen && postId) {
      fetchPost();
    }
  }, [postId, isOpen]);

  const handleOpenOriginal = () => {
    if (post?.url) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {post && platformIcons[post.platform?.toLowerCase()]}
            Post Analysis
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-muted-foreground">
            {error}
          </div>
        )}

        {post && !isLoading && (
          <div className="flex-1 min-h-0 overflow-y-auto pr-4">
            <div className="space-y-6">
              {/* Header with platform and user info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize flex items-center gap-1.5">
                    {platformIcons[post.platform?.toLowerCase()] || <Globe className="h-4 w-4" />}
                    {post.platform}
                  </Badge>
                  {post.scraped_data?.username && (
                    <span className="text-sm text-muted-foreground">
                      @{post.scraped_data.username}
                    </span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleOpenOriginal}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original
                </Button>
              </div>

              {/* Content */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {post.scraped_data?.caption || post.scraped_data?.transcription || 'No content available'}
                </p>
              </div>

              {/* Engagement stats */}
              {(post.scraped_data?.likes !== undefined || post.scraped_data?.comments !== undefined) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {post.scraped_data?.likes !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4" />
                      {post.scraped_data.likes.toLocaleString()}
                    </span>
                  )}
                  {post.scraped_data?.comments !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4" />
                      {post.scraped_data.comments.toLocaleString()}
                    </span>
                  )}
                  {post.analysis?.model_metadata?.timestamp && (
                    <span className="flex items-center gap-1.5 ml-auto">
                      <Calendar className="h-4 w-4" />
                      Analyzed {new Date(post.analysis.model_metadata.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              <Separator />

              {/* Classification */}
              <div className="space-y-3">
                <h3 className="font-semibold">Political Classification</h3>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="secondary"
                    className="text-base px-3 py-1"
                  >
                    {post.analysis?.classification || 'Unclassified'}
                  </Badge>
                </div>
                <PoliticalSpectrum
                  score={parseClassificationScore(post.analysis?.classification || '')}
                  size="md"
                />
              </div>

              <Separator />

              {/* Full Analysis Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold">Analysis Summary</h3>
                <div className="rounded-lg border bg-card p-4 prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {post.analysis?.summary || 'No summary available'}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              {post.analysis?.model_metadata && (
                <div className="text-xs text-muted-foreground">
                  Analyzed by {post.analysis.model_metadata.models_involved} AI models
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}