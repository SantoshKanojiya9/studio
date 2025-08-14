
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search, User, Loader2, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import type { EmojiState } from '@/app/design/page';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getExplorePosts, searchUsers as searchUsersAction } from '../actions';
import Image from 'next/image';

const PostView = dynamic(() => 
  import('@/components/post-view').then(mod => mod.PostView),
  {
    loading: () => <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>,
    ssr: false 
  }
);

interface SearchedUser {
  id: string;
  name: string;
  picture: string;
  is_private: boolean;
}

interface ExploreEmoji extends EmojiState {
    user: EmojiState['user'] & { has_mood: boolean };
    like_count: number;
    is_liked: boolean;
}

const exploreCache: {
    posts: ExploreEmoji[],
    page: number,
    hasMore: boolean,
    scrollPosition: number
} = {
    posts: [],
    page: 1,
    hasMore: true,
    scrollPosition: 0
};

// Debounce function
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [allEmojis, setAllEmojis] = useState<ExploreEmoji[]>(exploreCache.posts);
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(exploreCache.posts.length === 0);
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  
  const [page, setPage] = useState(exploreCache.page);
  const [hasMore, setHasMore] = useState(exploreCache.hasMore);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const loaderRef = useRef(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNum: number, limit = 12) => {
      if (isFetchingMore) return;
      setIsFetchingMore(true);
      try {
          const newPostsData = await getExplorePosts({ page: pageNum, limit });
          
          const newPosts: ExploreEmoji[] = newPostsData.map(post => ({
              ...(post as ExploreEmoji)
          }));

          if (newPosts.length < limit) {
              setHasMore(false);
              exploreCache.hasMore = false;
          }

          setAllEmojis(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
              const updatedPosts = [...prev, ...uniqueNewPosts];
              exploreCache.posts = updatedPosts;
              return updatedPosts;
          });

          const nextPage = pageNum + 1;
          setPage(nextPage);
          exploreCache.page = nextPage;

      } catch (error: any) {
          console.error("Failed to fetch explore posts:", error);
          toast({ title: "Failed to load posts", description: error.message, variant: "destructive" });
      } finally {
          setIsFetchingMore(false);
      }
  }, [toast, isFetchingMore]);
  
  // Initial data load effect
  useEffect(() => {
    if (allEmojis.length === 0 && hasMore) {
        setIsLoading(true);
        fetchPosts(1).finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isFetchingMore && !isLoading && !searchQuery) {
           fetchPosts(page);
        }
    }, { root: null, rootMargin: '400px', threshold: 0 });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
        observer.observe(currentLoader);
    }
    
    return () => {
        if(currentLoader) {
            observer.unobserve(currentLoader);
        }
    }
  }, [fetchPosts, hasMore, isFetchingMore, isLoading, page, searchQuery]);

  // Save and restore scroll position
  useEffect(() => {
      const scrollable = scrollContainerRef.current;
      if (!scrollable) return;

      const handleScroll = () => {
          exploreCache.scrollPosition = scrollable.scrollTop;
      };

      if (exploreCache.scrollPosition > 0) {
          scrollable.scrollTop = exploreCache.scrollPosition;
      }

      scrollable.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
          scrollable.removeEventListener('scroll', handleScroll);
      };
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchedUsers([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const data = await searchUsersAction(query);
      setSearchedUsers(data as SearchedUser[]);
    } catch (error: any) {
      console.error("Failed to search users:", error);
      toast({
        title: "Search failed",
        description: "Could not fetch user search results. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);
  
  useEffect(() => {
    searchUsers(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchUsers]);


  const handleDelete = async (emojiId: string) => {
    // This function is passed to PostView, but explore page posts can't be deleted from here.
    // The check below will prevent deletion.
    const emojiToDelete = allEmojis.find(e => e.id === emojiId);
    if (!emojiToDelete || emojiToDelete.user_id !== authUser?.id) {
        toast({ title: "Cannot delete", description: "You can only delete your own posts from your gallery.", variant: "destructive" });
        return;
    }
    // Deletion logic won't be executed, but kept for structure consistency if needed later.
    setSelectedEmojiId(null);
  };
  
  const showSearchResults = searchQuery.length > 0;

  const selectedEmojiIndex = selectedEmojiId ? allEmojis.findIndex(e => e.id === selectedEmojiId) : -1;

  if (selectedEmojiId && selectedEmojiIndex !== -1) {
    return (
        <PostView 
            emojis={allEmojis}
            initialIndex={selectedEmojiIndex}
            onClose={() => setSelectedEmojiId(null)}
            onDelete={handleDelete}
        />
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="p-4 border-b md:border-none">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for users"
            className="pl-10 h-12 rounded-lg bg-muted border-none focus-visible:ring-primary"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
           {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
           )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar" ref={scrollContainerRef}>
        {isLoading ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : showSearchResults ? (
          <div className="flex flex-col">
             {searchedUsers.length > 0 ? (
                 searchedUsers.map(user => (
                    <Link key={user.id} href={`/gallery?userId=${user.id}`} className="flex items-center gap-4 px-4 py-2 hover:bg-muted/50">
                       <Avatar className="h-12 w-12 border-2 border-background">
                            <Image src={user.picture} alt={user.name} data-ai-hint="profile picture" width={48} height={48} className="rounded-full" />
                            <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                       </Avatar>
                        <span className="font-semibold flex-1">{user.name}</span>
                    </Link>
                 ))
             ) : (
                !isSearching && (
                    <div className="text-center p-8 text-muted-foreground">
                        <p>No users found for "{searchQuery}"</p>
                    </div>
                )
             )}
          </div>
        ) : (
          <div className="p-1 md:p-4">
             {allEmojis.length > 0 ? (
                <>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-4">
                        {allEmojis.map((emoji) => (
                            <GalleryThumbnail key={emoji.id} emoji={emoji} onSelect={() => setSelectedEmojiId(emoji.id)} />
                        ))}
                    </div>
                    {hasMore && <div ref={loaderRef} className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin"/></div>}
                </>
             ) : (
                <div className="flex flex-col h-full items-center justify-center text-center p-8 gap-4 text-muted-foreground">
                    <User className="h-16 w-16" />
                    <h2 className="text-2xl font-bold text-foreground">Nothing to explore yet</h2>
                    <p>When public users create emojis, they will appear here.</p>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
