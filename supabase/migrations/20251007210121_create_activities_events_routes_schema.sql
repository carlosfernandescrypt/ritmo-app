/*
  # Create Activities, Events, and Routes Schema

  1. New Tables
    - `activities` - Scheduled activities/workouts
    - `activity_participants` - Activity participation tracking
    - `events` - Organized events like races, marathons
    - `event_registrations` - Event registration tracking
    - `routes` - Saved routes with GPS coordinates
    - `route_ratings` - User ratings for routes

  2. Security
    - Enable RLS on all tables
    - Appropriate viewing and management policies
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  activity_type text NOT NULL CHECK (activity_type IN ('corrida', 'ciclismo', 'caminhada')),
  skill_level text NOT NULL CHECK (skill_level IN ('iniciante', 'intermediário', 'avançado')),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer,
  location text NOT NULL,
  latitude numeric,
  longitude numeric,
  max_participants integer DEFAULT 20,
  current_participants integer DEFAULT 0,
  image_url text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  meeting_point text,
  route_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_participants table
CREATE TABLE IF NOT EXISTS activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('corrida', 'ciclismo', 'caminhada')),
  event_date timestamptz NOT NULL,
  end_date timestamptz,
  location text NOT NULL,
  latitude numeric,
  longitude numeric,
  image_url text,
  organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_participants integer,
  current_participants integer DEFAULT 0,
  registration_fee numeric DEFAULT 0,
  is_public boolean DEFAULT true,
  registration_deadline timestamptz,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  registered_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  activity_type text NOT NULL CHECK (activity_type IN ('corrida', 'ciclismo', 'caminhada')),
  difficulty text NOT NULL CHECK (difficulty IN ('iniciante', 'intermediário', 'avançado')),
  distance_km numeric NOT NULL,
  elevation_gain numeric,
  duration_minutes integer,
  path_coordinates jsonb NOT NULL,
  start_location text NOT NULL,
  end_location text NOT NULL,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text,
  rating_average numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create route_ratings table
CREATE TABLE IF NOT EXISTS route_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(route_id, user_id)
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_ratings ENABLE ROW LEVEL SECURITY;

-- Activities policies
CREATE POLICY "Users can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (
    group_id IS NULL OR
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = activities.group_id
      AND (
        groups.is_public = true OR
        EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.group_id = groups.id
          AND group_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Activity participants policies
CREATE POLICY "Users can view activity participants"
  ON activity_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join activities"
  ON activity_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON activity_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave activities"
  ON activity_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view public events"
  ON events FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Event registrations policies
CREATE POLICY "Users can view event registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_registrations.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations"
  ON event_registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel registrations"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Routes policies
CREATE POLICY "Users can view public routes"
  ON routes FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete routes"
  ON routes FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Route ratings policies
CREATE POLICY "Users can view route ratings"
  ON route_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create route ratings"
  ON route_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON route_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON route_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update activity participant count
CREATE OR REPLACE FUNCTION update_activity_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE activities
    SET current_participants = current_participants + 1
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE activities
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_activity_participants_count'
  ) THEN
    CREATE TRIGGER update_activity_participants_count
      AFTER INSERT OR DELETE ON activity_participants
      FOR EACH ROW
      EXECUTE FUNCTION update_activity_participant_count();
  END IF;
END $$;

-- Function to update event participant count
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_event_participants_count'
  ) THEN
    CREATE TRIGGER update_event_participants_count
      AFTER INSERT OR DELETE ON event_registrations
      FOR EACH ROW
      EXECUTE FUNCTION update_event_participant_count();
  END IF;
END $$;

-- Function to update route ratings
CREATE OR REPLACE FUNCTION update_route_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE routes
  SET 
    rating_average = (
      SELECT AVG(rating)::numeric(3,2)
      FROM route_ratings
      WHERE route_id = COALESCE(NEW.route_id, OLD.route_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM route_ratings
      WHERE route_id = COALESCE(NEW.route_id, OLD.route_id)
    )
  WHERE id = COALESCE(NEW.route_id, OLD.route_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_route_rating_trigger'
  ) THEN
    CREATE TRIGGER update_route_rating_trigger
      AFTER INSERT OR UPDATE OR DELETE ON route_ratings
      FOR EACH ROW
      EXECUTE FUNCTION update_route_rating();
  END IF;
END $$;

-- Updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_activities_updated_at'
  ) THEN
    CREATE TRIGGER update_activities_updated_at
      BEFORE UPDATE ON activities
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at'
  ) THEN
    CREATE TRIGGER update_events_updated_at
      BEFORE UPDATE ON events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_routes_updated_at'
  ) THEN
    CREATE TRIGGER update_routes_updated_at
      BEFORE UPDATE ON routes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
