import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Activity, ActivityParticipant } from '@/types/database';

interface ActivitiesState {
  activities: Activity[];
  myActivities: Activity[];
  isLoading: boolean;
  error: string | null;

  fetchActivities: (filters?: {
    activityType?: string;
    skillLevel?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;

  fetchMyActivities: (userId: string) => Promise<void>;

  createActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'current_participants'>) => Promise<{ data: Activity | null; error: any }>;

  joinActivity: (activityId: string, userId: string) => Promise<{ error: any }>;

  leaveActivity: (activityId: string, userId: string) => Promise<{ error: any }>;

  updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<{ error: any }>;

  deleteActivity: (activityId: string) => Promise<{ error: any }>;
}

export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  activities: [],
  myActivities: [],
  isLoading: false,
  error: null,

  fetchActivities: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });

      let query = supabase
        .from('activities')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (filters.activityType && filters.activityType !== 'todos') {
        query = query.eq('activity_type', filters.activityType);
      }

      if (filters.skillLevel && filters.skillLevel !== 'todos') {
        query = query.eq('skill_level', filters.skillLevel);
      }

      if (filters.startDate) {
        query = query.gte('scheduled_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('scheduled_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      set({ activities: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMyActivities: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('activity_participants')
        .select(`
          *,
          activities (*)
        `)
        .eq('user_id', userId);

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const myActivities = data?.map((item: any) => item.activities).filter(Boolean) || [];
      set({ myActivities, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createActivity: async (activity) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activity])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      set((state) => ({
        activities: [data, ...state.activities],
        myActivities: [data, ...state.myActivities]
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  joinActivity: async (activityId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('activity_participants')
        .insert([{
          activity_id: activityId,
          user_id: userId,
          status: 'approved'
        }]);

      if (error) {
        return { error };
      }

      await get().fetchActivities();
      await get().fetchMyActivities(userId);

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  leaveActivity: async (activityId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('activity_participants')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', userId);

      if (error) {
        return { error };
      }

      set((state) => ({
        myActivities: state.myActivities.filter(a => a.id !== activityId)
      }));

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  updateActivity: async (activityId: string, updates: Partial<Activity>) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', activityId);

      if (error) {
        return { error };
      }

      set((state) => ({
        activities: state.activities.map(a => a.id === activityId ? { ...a, ...updates } : a),
        myActivities: state.myActivities.map(a => a.id === activityId ? { ...a, ...updates } : a)
      }));

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  deleteActivity: async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        return { error };
      }

      set((state) => ({
        activities: state.activities.filter(a => a.id !== activityId),
        myActivities: state.myActivities.filter(a => a.id !== activityId)
      }));

      return { error: null };
    } catch (error) {
      return { error };
    }
  },
}));
