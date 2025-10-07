import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Group, GroupMember } from '@/types/database';

interface GroupsState {
  groups: Group[];
  myGroups: Group[];
  isLoading: boolean;
  error: string | null;

  fetchGroups: (filters?: {
    activityType?: string;
    skillLevel?: string;
    city?: string;
    searchQuery?: string;
  }) => Promise<void>;

  fetchMyGroups: (userId: string) => Promise<void>;

  createGroup: (group: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'current_members'>) => Promise<{ data: Group | null; error: any }>;

  joinGroup: (groupId: string, userId: string) => Promise<{ error: any }>;

  leaveGroup: (groupId: string, userId: string) => Promise<{ error: any }>;

  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<{ error: any }>;

  deleteGroup: (groupId: string) => Promise<{ error: any }>;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  myGroups: [],
  isLoading: false,
  error: null,

  fetchGroups: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });

      let query = supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (filters.activityType && filters.activityType !== 'todos') {
        query = query.eq('activity_type', filters.activityType);
      }

      if (filters.skillLevel && filters.skillLevel !== 'todos') {
        query = query.eq('skill_level', filters.skillLevel);
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      set({ groups: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMyGroups: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          groups (*)
        `)
        .eq('user_id', userId);

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const myGroups = data?.map((item: any) => item.groups).filter(Boolean) || [];
      set({ myGroups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createGroup: async (group) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([group])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      set((state) => ({
        groups: [data, ...state.groups],
        myGroups: [data, ...state.myGroups]
      }));

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  joinGroup: async (groupId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: userId,
          role: 'member'
        }]);

      if (error) {
        return { error };
      }

      await get().fetchGroups();
      await get().fetchMyGroups(userId);

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  leaveGroup: async (groupId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        return { error };
      }

      set((state) => ({
        myGroups: state.myGroups.filter(g => g.id !== groupId)
      }));

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  updateGroup: async (groupId: string, updates: Partial<Group>) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId);

      if (error) {
        return { error };
      }

      set((state) => ({
        groups: state.groups.map(g => g.id === groupId ? { ...g, ...updates } : g),
        myGroups: state.myGroups.map(g => g.id === groupId ? { ...g, ...updates } : g)
      }));

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  deleteGroup: async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        return { error };
      }

      set((state) => ({
        groups: state.groups.filter(g => g.id !== groupId),
        myGroups: state.myGroups.filter(g => g.id !== groupId)
      }));

      return { error: null };
    } catch (error) {
      return { error };
    }
  },
}));
