/*
  # Create Social, Achievements, and Messaging Schema

  1. New Tables
    - `achievements` - Achievement definitions
    - `user_achievements` - User-earned achievements
    - `friendships` - Friend connections
    - `messages` - Chat messages
    - `notifications` - User notifications
    - `leaderboards` - Competition leaderboards
    - `live_locations` - Real-time location sharing

  2. Security
    - Enable RLS on all tables
    - Appropriate privacy and access policies
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('activity', 'social', 'milestone', 'challenge')),
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  points integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
  image_url text,
  latitude numeric,
  longitude numeric,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (group_id IS NOT NULL AND receiver_id IS NULL) OR
    (group_id IS NULL AND receiver_id IS NOT NULL)
  )
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL CHECK (type IN ('activity', 'group', 'message', 'achievement', 'friend', 'event')),
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type text CHECK (activity_type IN ('corrida', 'ciclismo', 'caminhada')),
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'all_time')),
  score integer DEFAULT 0,
  rank integer,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, activity_type, period)
);

-- Create live_locations table
CREATE TABLE IF NOT EXISTS live_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy numeric,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;

-- Achievements policies
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can view all user achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can grant achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Friendships policies
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = friend_id
  );

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendship status"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = friend_id)
  WITH CHECK (auth.uid() = friend_id);

CREATE POLICY "Users can delete friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = friend_id
  );

-- Messages policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    (
      receiver_id IS NOT NULL OR
      EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = messages.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Leaderboards policies
CREATE POLICY "Users can view all leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can update leaderboards"
  ON leaderboards FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update leaderboard entries"
  ON leaderboards FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Live locations policies
CREATE POLICY "Users can view active live locations"
  ON live_locations FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    expires_at > now() AND
    (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM friendships
        WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = live_locations.user_id)
        OR (friendships.friend_id = auth.uid() AND friendships.user_id = live_locations.user_id)
        AND friendships.status = 'approved'
      ) OR
      EXISTS (
        SELECT 1 FROM activity_participants ap
        JOIN activity_participants ap2 ON ap.activity_id = ap2.activity_id
        WHERE ap.user_id = auth.uid()
        AND ap2.user_id = live_locations.user_id
        AND ap.activity_id = live_locations.activity_id
      )
    )
  );

CREATE POLICY "Users can create own live locations"
  ON live_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own live locations"
  ON live_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own live locations"
  ON live_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_body text,
  p_type text,
  p_related_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, body, type, related_id)
  VALUES (p_user_id, p_title, p_body, p_type, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receiver_id IS NOT NULL THEN
    PERFORM create_notification(
      NEW.receiver_id,
      'Nova Mensagem',
      'Você recebeu uma nova mensagem',
      'message',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_new_message'
  ) THEN
    CREATE TRIGGER on_new_message
      AFTER INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION notify_new_message();
  END IF;
END $$;

-- Trigger to notify on friend request
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM create_notification(
      NEW.friend_id,
      'Novo Pedido de Amizade',
      'Você recebeu um pedido de amizade',
      'friend',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_friend_request'
  ) THEN
    CREATE TRIGGER on_friend_request
      AFTER INSERT ON friendships
      FOR EACH ROW
      EXECUTE FUNCTION notify_friend_request();
  END IF;
END $$;

-- Updated_at trigger for live_locations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_live_locations_updated_at'
  ) THEN
    CREATE TRIGGER update_live_locations_updated_at
      BEFORE UPDATE ON live_locations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
