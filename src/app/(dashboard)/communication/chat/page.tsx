'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash, Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRooms, useMessages, useSendMessage } from '@/hooks/use-communication';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useWebSocket } from '@/hooks/use-websocket';

export default function ChatPage() {
  const { data: roomsData, isLoading: roomsLoading } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const { data: messagesData, isLoading: messagesLoading } = useMessages(selectedRoomId);
  const sendMessage = useSendMessage();
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const { isConnected } = useWebSocket();

  const rooms = roomsData?.data || [];
  const apiMessages = messagesData?.data || [];

  // Auto-select first room
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  // Sync API messages with local state
  useEffect(() => {
    if (apiMessages.length > 0) {
      setChatMessages(apiMessages.map((msg) => ({
        id: msg.id,
        sender: msg.sender_name || 'Unknown',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        avatar: msg.sender_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'UN',
        sender_id: msg.sender_id,
      })));
    }
  }, [apiMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoomId) return;

    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      sender: user?.full_name || 'You',
      content: messageInput,
      timestamp: new Date(),
      avatar: user?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'YO',
      sender_id: user?.id || 'me',
    };

    setChatMessages((prev) => [...prev, newMessage]);

    // Send via API
    sendMessage.mutate(
      { roomId: selectedRoomId, data: { content: messageInput } },
      {
        onError: () => {
          // Remove optimistic message on error
          setChatMessages((prev) => prev.filter((m) => m.id !== tempId));
        },
      }
    );

    setMessageInput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100vh-8rem)] gap-4"
    >
      <Card className="w-72 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Channels</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search channels..." className="pl-8 h-9" />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-3">
            {roomsLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))
            ) : rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3">No channels yet.</p>
            ) : (
              rooms.map((room) => (
                <motion.button
                  key={room.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    selectedRoomId === room.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Hash className="h-4 w-4" />
                  <span className="flex-1 text-left">{room.name}</span>
                  {room.unread_count && room.unread_count > 0 && (
                    <Badge variant="default" className="h-5 w-5 rounded-full p-0 text-xs">
                      {room.unread_count}
                    </Badge>
                  )}
                </motion.button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{selectedRoom?.name || 'Select a channel'}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </CardHeader>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messagesLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            ) : chatMessages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <AnimatePresence>
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {message.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={selectedRoomId ? `Message #${selectedRoom?.name}` : 'Select a channel'}
              className="flex-1"
              disabled={!selectedRoomId || sendMessage.isPending}
            />
            <Button type="submit" size="icon" disabled={!selectedRoomId || sendMessage.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
