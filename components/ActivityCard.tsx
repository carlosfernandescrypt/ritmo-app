import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Users, Clock } from 'lucide-react-native';

interface ActivityCardProps {
  id: string;
  title: string;
  type: 'corrida' | 'ciclismo' | 'caminhada';
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  level: 'iniciante' | 'intermediário' | 'avançado';
  image: string;
  onPress?: () => void;
  onJoin?: () => void;
}

export default function ActivityCard({
  title,
  type,
  time,
  location,
  participants,
  maxParticipants,
  level,
  image,
  onPress,
  onJoin,
}: ActivityCardProps) {
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
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </View>

        <Text style={styles.type}>
          {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.detailText}>{time}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.detailText}>{location}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Users size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {participants}/{maxParticipants}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
          <Text style={styles.joinButtonText}>Participar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
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
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
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
});