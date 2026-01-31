
-- Reset for clean start
DROP TABLE IF EXISTS public.chat_messages CASCADE;

CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for performance
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id AND auth.uid() = user_id);

CREATE POLICY "Admins can view all chat messages" ON public.chat_messages
    FOR SELECT USING (public.is_staff());

CREATE POLICY "Admins can insert chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (public.is_staff() AND sender_id = auth.uid());

CREATE POLICY "Admins can update chat messages" ON public.chat_messages
    FOR UPDATE USING (public.is_staff());

-- Attempt to enable Realtime (ignore error if publication already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
    WHEN OTHERS THEN 
        NULL; -- Table might already be in publication
END $$;
