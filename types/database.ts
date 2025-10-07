export type ActivityType = 'corrida' | 'ciclismo' | 'caminhada';
export type SkillLevel = 'iniciante' | 'intermediário' | 'avançado';
export type ActivityStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type GroupRole = 'owner' | 'admin' | 'member';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  city?: string;
  state?: string;
  preferred_activities: ActivityType[];
  skill_level: SkillLevel;
  fitness_goals?: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  activity_type: ActivityType;
  skill_level: SkillLevel;
  image_url?: string;
  location: string;
  city: string;
  state: string;
  schedule: string;
  meeting_point?: string;
  max_members: number;
  current_members: number;
  is_public: boolean;
  rules?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  activity_type: ActivityType;
  skill_level: SkillLevel;
  group_id?: string;
  organizer_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  location: string;
  latitude?: number;
  longitude?: number;
  max_participants: number;
  current_participants: number;
  image_url?: string;
  status: ActivityStatus;
  meeting_point?: string;
  route_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  user_id: string;
  status: RequestStatus;
  joined_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  activity_type: ActivityType;
  event_date: string;
  end_date?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  organizer_id: string;
  max_participants?: number;
  current_participants: number;
  registration_fee?: number;
  is_public: boolean;
  registration_deadline?: string;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: RequestStatus;
  payment_status?: 'pending' | 'paid' | 'refunded';
  registered_at: string;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  activity_type: ActivityType;
  difficulty: SkillLevel;
  distance_km: number;
  elevation_gain?: number;
  duration_minutes?: number;
  path_coordinates: { latitude: number; longitude: number }[];
  start_location: string;
  end_location: string;
  creator_id: string;
  image_url?: string;
  rating_average?: number;
  rating_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteRating {
  id: string;
  route_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'activity' | 'social' | 'milestone' | 'challenge';
  requirement_type: string;
  requirement_value: number;
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface Message {
  id: string;
  group_id?: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'location';
  image_url?: string;
  latitude?: number;
  longitude?: number;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'activity' | 'group' | 'message' | 'achievement' | 'friend' | 'event';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: RequestStatus;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_activities: number;
  total_distance_km: number;
  total_duration_minutes: number;
  activities_this_month: number;
  current_streak_days: number;
  longest_streak_days: number;
  updated_at: string;
}

export interface Leaderboard {
  id: string;
  user_id: string;
  activity_type?: ActivityType;
  period: 'weekly' | 'monthly' | 'all_time';
  score: number;
  rank: number;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  created_at: string;
}

export interface LiveLocation {
  id: string;
  user_id: string;
  activity_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
}
