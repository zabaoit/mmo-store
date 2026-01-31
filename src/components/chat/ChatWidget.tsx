
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MessageCircle, X, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function ChatWidget() {
  const supabase = useMemo(() => createClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUser(null);
        return;
      }

      // Check if user is staff/admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role && profile.role !== "customer") {
        setUser(null);
      } else {
        setUser(session.user);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setUser(null);
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.role && profile.role !== "customer") {
          setUser(null);
        } else {
          setUser(session.user);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Persistent subscription for messages and unread count
  useEffect(() => {
    if (!user) return;

    // Fetch initial messages and unread count when user logs in
    const initChat = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("ChatWidget: Error fetching initial messages:", error.message);
      } else {
        setMessages(data || []);
      }
    };

    initChat();

    // Subscribe to new messages (ALWAYS active while user is logged in)
    const channel = supabase
      .channel(`chat:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // console.log("ChatWidget: New message via realtime:", payload);
          
          setMessages((prev) => {
            // Check if message already exists (to avoid duplicates from fetch)
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
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // console.log("ChatWidget: Message updated via realtime:", payload);
          setMessages((prev) => 
            prev.map(m => m.id === payload.new.id ? payload.new : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // Derived unread count
  useEffect(() => {
    if (!user) return;
    const unread = messages.filter((m: any) => m.sender_id !== user.id && !m.is_read).length;
    // Only update state if it actually changed to avoid unnecessary renders
    setUnreadCount((prev) => prev !== unread ? unread : prev);
  }, [messages, user]);

  useEffect(() => {
    if (isOpen && user && unreadCount > 0) {
      const markAsRead = async () => {
        const { error } = await supabase
          .from("chat_messages")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .neq("sender_id", user.id)
          .eq("is_read", false);
        
        if (error) {
          // console.error("ChatWidget: Error marking as read:", error.message);
        } else {
          // Update local state immediately for instant UI feedback
          setMessages((prev) => prev.map(m => 
            m.sender_id !== user.id ? { ...m, is_read: true } : m
          ));
        }
      };
      markAsRead();
    }
  }, [isOpen, user, unreadCount, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const messageContent = input.trim();
    setInput("");
    setLoading(true);

    try {
      const { error } = await supabase.from("chat_messages").insert([
        {
          user_id: user.id,
          sender_id: user.id,
          content: messageContent,
        },
      ]);

      if (error) throw error;
    } catch (error: any) {
      toast.error("Không thể gửi tin nhắn: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[60vh] sm:h-[500px] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh]">
          {/* Header */}
          <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Hỗ trợ trực tuyến</p>
                <p className="text-[10px] opacity-80 mt-1">Đang trực tuyến</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Chào bạn!</p>
                <p className="text-xs text-muted-foreground">Bạn cần hỗ trợ gì về đơn hàng hay sản phẩm không?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender_id === user.id
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-secondary text-foreground rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                    <p className={`text-[9px] mt-1 opacity-50 ${msg.sender_id === user.id ? "text-right" : "text-left"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <form 
            onSubmit={handleSend}
            className="p-4 bg-card border-t border-border/50 flex items-center gap-2"
          >
            <Input
              placeholder="Nhập nội dung tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-secondary/30 border-none h-10"
              disabled={loading}
            />
            <Button 
              size="icon" 
              type="submit" 
              disabled={loading || !input.trim()}
              className="shrink-0 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative ${
          isOpen ? "bg-secondary text-foreground rotate-90" : "bg-primary text-primary-foreground"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
