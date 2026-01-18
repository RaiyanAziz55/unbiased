import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analysisApi } from '@/lib/api/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PoliticalSpectrum } from '@/components/spectrum/PoliticalSpectrum';
import { PostDetailModal } from './PostDetailModal';
import { Instagram, Twitter, Globe, ExternalLink } from 'lucide-react';

interface Post {
  _id: string;
  url: string;
  platform: string;
  scraped_data: {
    caption?: string;
    transcription?: string;
    username?: string;
    likes?: number;
    comments?: number;
  };
  analysis: {
    classification: string;
    summary: string;
  };
  bias_embedding?: number[];
}

interface UserPostsResponse {
  user_id: string;
  total_posts: number;
  posts: Post[];
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  x: <Twitter className="h-4 w-4" />,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  twitter: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  x: 'bg-foreground/10 text-foreground border-foreground/20',
};

// Parse classification to get a numeric score
function parseClassificationScore(classification: string): number {
  const lower = classification.toLowerCase();
  if (lower.includes('far left')) return -80;
  if (lower.includes('lean left')) return -40;
  if (lower.includes('far right')) return 80;
  if (lower.includes('lean right')) return 40;
  if (lower.includes('center')) return 0;
  return 0;
}

interface UserPostsGridProps {
  limit?: number;
}

export function UserPostsGrid({ limit = 12 }: UserPostsGridProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      if (!user?.userId) return;
      
      try {
        setIsLoading(true);
        const response: UserPostsResponse = await analysisApi.getUserPosts(user.userId);
        
        // Remove duplicates by URL
        const uniquePosts = response.posts.reduce((acc: Post[], post) => {
          if (!acc.find(p => p.url === post.url)) {
            acc.push(post);
          }
          return acc;
        }, []);
        
        // Limit the number of posts
        setPosts(uniquePosts.slice(0, limit));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to load your analyzed posts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [user?.userId, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Analyzed Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Analyzed Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Analyzed Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No posts analyzed yet. Go to the Analyze page to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Analyzed Feed</span>
            <Badge variant="secondary">{posts.length} posts</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onClick={() => setSelectedPostId(post._id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <PostDetailModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
}

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

function PostCard({ post, onClick }: PostCardProps) {
  const platform = post.platform?.toLowerCase() || 'unknown';
  const content = post.scraped_data?.caption || post.scraped_data?.transcription || '';
  const truncatedContent = content.length > 120 ? content.slice(0, 120) + '...' : content;
  const score = parseClassificationScore(post.analysis?.classification || '');

  return (
    <button
      onClick={onClick}
      className="text-left w-full p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant="outline"
          className={`${platformColors[platform] || 'bg-muted text-muted-foreground'} flex items-center gap-1.5`}
        >
          {platformIcons[platform] || <Globe className="h-4 w-4" />}
          <span className="capitalize">{platform}</span>
        </Badge>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {post.scraped_data?.username && (
        <p className="text-xs text-muted-foreground mb-2">
          @{post.scraped_data.username}
        </p>
      )}

      <p className="text-sm text-foreground/80 mb-4 line-clamp-3">
        {truncatedContent || 'No content preview available'}
      </p>

      <div className="space-y-2">
        <PoliticalSpectrum score={score} size="sm" showLabels={false} label={''} />
        <p className="text-xs font-medium text-center">
          {post.analysis?.classification || 'Unclassified'}
        </p>
      </div>
    </button>
  );
}