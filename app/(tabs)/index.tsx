import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {
  Search,
  MapPin,
  Clock,
  Users,
  Calendar,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

interface Activity {
  id: string;
  title: string;
  type: 'corrida' | 'ciclismo' | 'caminhada';
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  level: 'iniciante' | 'intermediário' | 'avançado';
  image: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Corrida Matinal no Ibirapuera',
    type: 'corrida',
    time: '06:00',
    location: 'Parque Ibirapuera',
    participants: 8,
    maxParticipants: 15,
    level: 'intermediário',
    image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '2',
    title: 'Pedal Urbano Centro',
    type: 'ciclismo',
    time: '07:30',
    location: 'Estação da Luz',
    participants: 12,
    maxParticipants: 20,
    level: 'iniciante',
    image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '3',
    title: 'Caminhada Vila Madalena',
    type: 'caminhada',
    time: '18:00',
    location: 'Vila Madalena',
    participants: 6,
    maxParticipants: 12,
    level: 'iniciante',
    image: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header com Gradiente */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Olá, João! 👋</Text>
            <Text style={styles.subtitle}>Encontre seu próximo treino</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Zap size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar atividades, locais..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Atividades</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#4A90E2" />
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Conexões</Text>
          </View>
          <View style={styles.statCard}>
            <Award size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Conquistas</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF6B35' }]}>
              <Text style={styles.actionButtonText}>Criar Grupo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4A90E2' }]}>
              <Text style={styles.actionButtonText}>Encontrar Grupos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Atividades Próximas */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Atividades Próximas</Text>
          
          {mockActivities.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityCard}>
              <Image source={{ uri: activity.image }} style={styles.activityImage} />
              
              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: getLevelColor(activity.level) }]}>
                    <Text style={styles.levelText}>{activity.level}</Text>
                  </View>
                </View>

                <View style={styles.activityDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.activityType}>
                      {getTypeIcon(activity.type)} {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{activity.time}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{activity.location}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Users size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {activity.participants}/{activity.maxParticipants}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Participar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Espaçamento para bottom tabs */}
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