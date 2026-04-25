'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash, Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useChatWebSocket } from '@/hooks/use-chat-websocket';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useWebSocket } from '@/hooks/use-websocket';

const rooms = [
  { id: '1', name: 'general', type: 'group', unread_count: 3 },
  { id: '2', name: 'engineering', type: 'group', unread_count: 0 },
  { id: '3', name: 'design', type: 'group', unread_count: 1 },
  { id: '4', name: 'random', type: 'group', unread_count: 0 },
  { id: '5', name: 'john-doe', type: 'direct', unread_count: 0 },
];

const initialMessages = [
  { id: '1', sender: 'John Doe', content: 'Hey team, how is the project going?', timestamp: new Date(Date.now() - 1000 * 60 * 5), avatar: 'JD', sender_id: 'user-1' },
  { id: '2', sender: 'Jane Smith', content: 'Going great! Just finished the new feature.', timestamp: new Date(Date.now() - 1000 * 60 * 3), avatar: 'JS', sender_id: 'user-2' },
  { id: '3', sender: 'Mike Johnson', content: 'Awesome work! Can you share the demo?', timestamp: new Date(Date.now() - 1000 * 60 * 2), avatar: 'MJ', sender_id: 'user-3' },
  { id: '4', sender: 'John Doe', content: 'Sure, I will set up a meeting for tomorrow.', timestamp: new Date(Date.now() - 1000 * 60 * 1), avatar: 'JD', sender_id: 'user-1' },
];

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const { isConnected } = useWebSocket();
  
  const { sendMessage, sendTyping, onMessage, onTyping } = useChatWebSocket(selectedRoom.id);

  // Subscribe to incoming messages
  useEffect(() => {
    const unsubMessage = onMessage((message) => {
      setChatMessages((prev) => [...prev, {
        id: message.id || String(Date.now()),
        sender: message.sender_name || 'Unknown',
        content: message.content,
        timestamp: new Date(message.created_at || Date.now()),
        avatar: message.sender_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'UN',
        sender_id: message.sender_id,
      }]);
    });

    const unsubTyping = onTyping((data) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.is_typing) {
          next.add(data.sender_id);
        } else {
          next.delete(data.sender_id);
        }
        return next;
      });
      
      // Auto-clear typing after 3 seconds
      if (data.is_typing) {
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(data.sender_id);
            return next;
          });
        }, 3000);
      }
    });

    return () => {
      unsubMessage();
      unsubTyping();
    };
  }, [onMessage, onTyping]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

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
    
    // Send via WebSocket
    if (isConnected) {
      sendMessage(messageInput);
    }
    
    setMessageInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (isConnected) {
      sendTyping(true);
      // Clear typing after 2 seconds of no input
      const timeout = setTimeout(() => sendTyping(false), 2000);
      return () => clearTimeout(timeout);
    }
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
            {rooms.map((room) => (
              <motion.button
                key={room.id}
                whileHover={{ x: 2 }}
                onClick={() => setSelectedRoom(room)}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  selectedRoom.id === room.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Hash className="h-4 w-4" />
                <span className="flex-1 text-left">{room.name}</span>
                {room.unread_count > 0 && (
                  <Badge variant="default" className="h-5 w-5 rounded-full p-0 text-xs">
                    {room.unread_count}
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
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
            
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    ...
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 py-2">
                  <span className="text-xs text-muted-foreground">
                    Someone is typing
                  </span>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-xs text-muted-foreground"
                  >
                    ...
                  </motion.span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={handleInputChange}
              placeholder={isConnected ? `Message #${selectedRoom.name}` : 'Reconnecting...'}
              className="flex-1"
              disabled={!isConnected}
            />
            <Button type="submit" size="icon" disabled={!isConnected}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
