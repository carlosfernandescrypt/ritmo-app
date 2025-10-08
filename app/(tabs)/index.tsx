import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useActivitiesStore } from '@/store/activitiesStore';
import { useRouter } from 'expo-router';
import type { Activity } from '@/types/database';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { activities, isLoading, fetchActivities, joinActivity } = useActivitiesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    await fetchActivities();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const handleJoinActivity = async (activityId: string) => {
    if (!profile) return;

    const { error } = await joinActivity(activityId, profile.id);

    if (error) {
      Alert.alert('Erro', 'Não foi possível participar da atividade');
    } else {
      Alert.alert('Sucesso!', 'Você está participando desta atividade');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'iniciante':
        return '#10B981';
      case 'intermediário':
        return '#F59E0B';
      case 'avançado':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'corrida':
        return '🏃‍♂️';
      case 'ciclismo':
        return '🚴‍♂️';
      case 'caminhada':
        return '🚶‍♂️';
      default:
        return '⚡';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Olá, {profile?.full_name?.split(' ')[0] || 'Atleta'}! 👋
            </Text>
            <Text style={styles.subtitle}>Encontre seu próximo treino</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar atividades, locais..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Atividades</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#4A90E2" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Conquistas</Text>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF6B35' }]}
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            >
              <Text style={styles.actionButtonText}>Criar Atividade</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4A90E2' }]}
              onPress={() => router.push('/(tabs)/groups')}
            >
              <Text style={styles.actionButtonText}>Ver Grupos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Atividades Próximas</Text>

          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
            </View>
          ) : filteredActivities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>Nenhuma atividade encontrada</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Tente buscar por outro termo'
                  : 'Seja o primeiro a criar uma atividade!'}
              </Text>
            </View>
          ) : (
            filteredActivities.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityCard}>
                {activity.image_url && (
                  <Image
                    source={{ uri: activity.image_url }}
                    style={styles.activityImage}
                  />
                )}

                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(activity.skill_level) }]}>
                      <Text style={styles.levelText}>{activity.skill_level}</Text>
                    </View>
                  </View>

                  <View style={styles.activityDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.activityType}>
                        {getTypeIcon(activity.activity_type)} {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{formatDate(activity.scheduled_at)}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{formatTime(activity.scheduled_at)}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="location" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{activity.location}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="people" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>
                        {activity.current_participants}/{activity.max_participants}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => handleJoinActivity(activity.id)}
                  >
                    <Text style={styles.joinButtonText}>Participar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activitiesContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  activityImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  activityContent: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activityDetails: {
    marginBottom: 16,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});
