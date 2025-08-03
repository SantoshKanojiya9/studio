
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import type { EmojiState } from '@/app/design/page';
import { PostView } from '@/components/post-view';
import { getAllSavedEmojis } from '@/lib/gallery-utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

// Dummy users for search results
const allUsers = [
  { id: '2', name: 'Alice', picture: 'https://placehold.co/64x64.png', hint: 'woman smiling' },
  { id: '3', name: 'Bob', picture: 'https://placehold.co/64x64.png', hint: 'man glasses' },
  { id: '4', name: 'Charlie', picture: 'https://placehold.co/64x64.png', hint: 'man beard' },
  { id: '5', name: 'David', picture: 'https://placehold.co/64x64.png', hint: 'boy smiling' },
  { id: '6', name: 'Eve', picture: 'https://placehold.co/64x64.png', hint: 'woman glasses' },
  { id: '7', name: 'Frank', picture: 'https://placehold.co/64x64.png', hint: 'man suit' },
  { id: '8', name: 'Grace', picture: 'https://placehold.co/64x64.png', hint: 'woman long hair' },
  { id: '9', name: 'Heidi', picture: 'https://placehold.co/64x64.png', hint: 'girl smiling' },
  { id: '10', name: 'Ivan', picture: 'https://placehold.co/64x64.png', hint: 'man short hair' },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(allUsers);
  const [allEmojis, setAllEmojis] = useState<EmojiState[]>([]);
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllEmojis = async () => {
        setIsLoading(true);
        try {
            const emojis = await getAllSavedEmojis();
            setAllEmojis(emojis);
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

  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredUsers(
        allUsers.filter(user =>
          user.name.toLowerCase().includes(lowercasedQuery)
        )
      );
    } else {
      setFilteredUsers([]); // Show no users if search is empty
    }
  }, [searchQuery]);

  const handleDelete = async (emojiId: string) => {
    try {
        const { error } = await supabase.from('emojis').delete().eq('id', emojiId);
        if (error) throw error;
        
        const updatedEmojis = allEmojis.filter(emoji => emoji.id !== emojiId);
        setAllEmojis(updatedEmojis);
        
        toast({ title: "Post deleted", variant: "success" });
    } catch (error: any) {
      console.error("Failed to delete emoji from Supabase", error);
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    }
    
    setSelectedEmojiId(null);
  };
  
  const showSearchResults = searchQuery.length > 0;

  if (isLoading) {
      return (
           <div className="flex h-full w-full flex-col">
              <div className="flex-1 overflow-y-auto">
                  <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
              </div>
          </div>
      )
  }

  const selectedEmoji = selectedEmojiId ? allEmojis.find(e => e.id === selectedEmojiId) : null;
  
  if (selectedEmoji) {
    return (
        <PostView 
            emojis={[selectedEmoji]}
            initialIndex={0}
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
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {showSearchResults ? (
          <div className="flex flex-col">
             {filteredUsers.length > 0 ? (
                 filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-4 px-4 py-2 hover:bg-muted/50 cursor-pointer">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.picture} alt={user.name} data-ai-hint={user.hint} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{user.name}</span>
                    </div>
                 ))
             ) : (
                <div className="text-center p-8 text-muted-foreground">
                    <p>No users found for "{searchQuery}"</p>
                </div>
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
                    <p>When users create emojis, they will appear here.</p>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
