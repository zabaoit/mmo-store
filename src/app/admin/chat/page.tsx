
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Send, 
  Loader2, 
  User, 
  MessageSquare, 
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Info,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    checkUser();
  }, []);

  // Fetch unique conversations
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        // 1. Get unique users/conversations
        const { data: messagesData, error: messagesError } = await supabase
          .from("chat_messages")
          .select("user_id, profiles:profiles!user_id(email)")
          .order("created_at", { ascending: false });

        if (messagesError) throw messagesError;

        // Group by user_id to get unique conversations (with latest data)
        const uniqueMap = new Map();
        messagesData.forEach((item: any) => {
          if (!uniqueMap.has(item.user_id)) {
            uniqueMap.set(item.user_id, { ...item, unreadCount: 0 });
          }
        });

        // 2. Get unread counts for each user
        const { data: unreadData, error: unreadError } = await supabase
          .from("chat_messages")
          .select("user_id")
          .eq("is_read", false)
          .neq("sender_id", currentUser.id);

        if (!unreadError && unreadData) {
          unreadData.forEach((msg: any) => {
            if (uniqueMap.has(msg.user_id)) {
              const conv = uniqueMap.get(msg.user_id);
              conv.unreadCount += 1;
            }
          });
        }

        setConversations(Array.from(uniqueMap.values()));
      } catch (error: any) {
        toast.error("Lỗi khi tải cuộc trò chuyện: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to ALL new messages and updates to update conversation list
    const channel = supabase
      .channel("admin_chat_list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => fetchConversations()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages" },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, supabase]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", selectedUser.user_id)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("Lỗi khi tải tin nhắn: " + error.message);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    // Subscribe to new messages for THIS user
    const channel = supabase
      .channel(`admin_chat:${selectedUser.user_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `user_id=eq.${selectedUser.user_id}`,
        },
        (payload: any) => {
          setMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `user_id=eq.${selectedUser.user_id}`,
        },
        (payload: any) => {
          setMessages((prev) => 
            prev.map(m => m.id === payload.new.id ? payload.new : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark as read when admin selects/views conversation
  useEffect(() => {
    const unreadCount = messages.filter(m => m.sender_id !== currentUser?.id && !m.is_read).length;

    if (selectedUser && currentUser && unreadCount > 0) {
      const markAsRead = async () => {
        const { error } = await supabase
          .from("chat_messages")
          .update({ is_read: true })
          .eq("user_id", selectedUser.user_id)
          .neq("sender_id", currentUser.id)
          .eq("is_read", false);
        
        if (error) {
          console.error("AdminChatPage: Error marking as read:", error.message);
        } else {
          // Update local state to reflect read status
          setMessages(prev => prev.map(m => 
            m.sender_id !== currentUser.id ? { ...m, is_read: true } : m
          ));
        }
      };
      markAsRead();
    }
  }, [selectedUser, currentUser, messages, supabase]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || !currentUser) return;

    const messageContent = input.trim();
    setInput("");
    setSending(true);

    try {
      const { error } = await supabase.from("chat_messages").insert([
        {
          user_id: selectedUser.user_id,
          sender_id: currentUser.id,
          content: messageContent,
        },
      ]);

      if (error) throw error;
    } catch (error: any) {
      toast.error("Không thể gửi tin nhắn: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-160px)] flex gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
      {/* Conversation List */}
      <div className={`${selectedUser ? "hidden lg:flex" : "flex"} w-full lg:w-80 flex-col bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden shrink-0 transition-all`}>
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold font-outfit mb-4">Hỗ trợ khách hàng</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm khách hàng..." className="pl-10 bg-secondary/30 border-none h-11" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Chưa có cuộc trò chuyện nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {conversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => setSelectedUser(conv)}
                  className={`w-full p-6 text-left hover:bg-secondary/20 transition-all flex items-center gap-4 cursor-pointer ${
                    selectedUser?.user_id === conv.user_id ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-primary shrink-0">
                    {conv.profiles?.email?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{conv.profiles?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">Nhấn để xem tin nhắn</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {conv.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center rounded-full px-1 py-0 text-[10px] font-bold">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${!selectedUser ? "hidden lg:flex" : "flex"} flex-1 flex flex-col bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden text-foreground`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-3 px-4 lg:p-4 lg:px-6 border-b border-border/50 flex items-center justify-between bg-secondary/10">
              <div className="flex items-center gap-3 lg:gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden -ml-2"
                  onClick={() => setSelectedUser(null)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm lg:text-base">
                  {selectedUser.profiles?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold leading-none truncate text-sm lg:text-base">{selectedUser.profiles?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Đang xem</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-secondary"><Phone className="w-4 h-4 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-secondary"><Video className="w-4 h-4 text-muted-foreground" /></Button>
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" size="icon" className="hover:bg-secondary"><Info className="w-4 h-4 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="hover:bg-secondary"><MoreVertical className="w-4 h-4 text-muted-foreground" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-secondary/5"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex flex-col ${msg.sender_id === currentUser?.id ? "items-end" : "items-start"} max-w-[70%]`}>
                    <div
                      className={`p-4 rounded-2xl text-[15px] shadow-sm leading-relaxed ${
                        msg.sender_id === currentUser?.id
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-white dark:bg-zinc-800 border border-border/50 rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[10px] text-muted-foreground font-medium">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {msg.sender_id === currentUser?.id && <CheckCheck className="w-3 h-3 text-primary" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-card border-t border-border/50">
              <form 
                onSubmit={handleSend}
                className="flex items-center gap-4"
              >
                <div className="flex-1 relative">
                    <Input
                    placeholder="Viết tin nhắn phản hồi..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-secondary/30 border-none h-14 pl-6 pr-12 rounded-xl focus-visible:ring-primary"
                    disabled={sending}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {/* Placeholder for emojis or attachments */}
                    </div>
                </div>
                <Button 
                    type="submit" 
                    disabled={sending || !input.trim()}
                    className="h-14 px-8 rounded-xl shadow-lg shadow-primary/20 gap-2 font-bold"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Gửi đi
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-outfit mb-2">Chọn một khách hàng</h3>
            <p className="text-muted-foreground max-w-sm">
                Vui lòng chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu hỗ trợ khách hàng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
