
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search, User, Loader2, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import type { EmojiState } from '@/app/design/page';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';

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
}

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
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [allEmojis, setAllEmojis] = useState<EmojiState[]>([]);
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchAllEmojis = async () => {
        setIsLoading(true);
        try {
            // Only fetch posts from public users
            const { data, error } = await supabase
                .from('emojis')
                .select('*, user:users!inner(id, name, picture, is_private)')
                .eq('user.is_private', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAllEmojis(data as unknown as EmojiState[]);
        } catch (error: any) {
            console.error("Failed to load emojis for explore page", error);
            toast({
                title: "Failed to load content",
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false);
        }
    };
    fetchAllEmojis();
  }, [toast]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchedUsers([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, picture')
        .ilike('name', `%${query}%`) // Case-insensitive search
        .limit(10);

      if (error) throw error;
      
      setSearchedUsers(data as SearchedUser[]);

    } catch (error: any) {
      console.error("Failed to search users:", error);
      toast({
        title: "Search failed",
        description: "Could not fetch user search results.",
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
    const emojiToDelete = allEmojis.find(e => e.id === emojiId);
    if (!emojiToDelete || emojiToDelete.user_id !== authUser?.id) {
        toast({ title: "Cannot delete", description: "You can only delete your own posts.", variant: "destructive" });
        return;
    }

    try {
        const { error } = await supabase.from('emojis').delete().eq('id', emojiId);
        if (error) throw error;
        
        setAllEmojis(prevEmojis => prevEmojis.filter(emoji => emoji.id !== emojiId));
        
        toast({ title: "Post deleted", variant: "success" });
    } catch (error: any) {
      console.error("Failed to delete emoji from Supabase", error);
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    }
    
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
      <div className="p-4">
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
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLoading ? (
             <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
        ) : showSearchResults ? (
          <div className="flex flex-col">
             {searchedUsers.length > 0 ? (
                 searchedUsers.map(user => (
                    <Link key={user.id} href={`/gallery?userId=${user.id}`} className="flex items-center gap-4 px-4 py-2 hover:bg-muted/50 cursor-pointer">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.picture} alt={user.name} data-ai-hint="profile picture" />
                            <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{user.name}</span>
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
          <div className="p-1">
             {allEmojis.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                    {allEmojis.map((emoji) => (
                        <GalleryThumbnail key={emoji.id} emoji={emoji} onSelect={() => setSelectedEmojiId(emoji.id)} />
                    ))}
                </div>
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
