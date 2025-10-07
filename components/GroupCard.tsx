import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Users, Clock } from 'lucide-react-native';

interface GroupCardProps {
  id: string;
  name: string;
  type: 'corrida' | 'ciclismo' | 'caminhada';
  members: number;
  maxMembers: number;
  location: string;
  schedule: string;
  level: 'iniciante' | 'intermediário' | 'avançado';
  description: string;
  image: string;
  isJoined: boolean;
  onPress?: () => void;
  onJoin?: () => void;
}

export default function GroupCard({
  name,
  type,
  members,
  maxMembers,
  location,
  schedule,
  level,
  description,
  image,
  isJoined,
  onPress,
  onJoin,
}: GroupCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'corrida': return '🏃‍♂️';
      case 'ciclismo': return '🚴‍♂️';
      case 'caminhada': return '🚶‍♂️';
      default: return '⚡';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'iniciante': return '#10B981';
      case 'intermediário': return '#F59E0B';
      case 'avançado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{name}</Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          </View>
          
          <Text style={styles.type}>
            {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </View>

        <Text style={styles.description}>{description}</Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.detailText}>{location}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.detailText}>{schedule}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Users size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {members}/{maxMembers} membros
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.actionButton,
            isJoined ? styles.joinedButton : styles.joinButton
          ]}
          onPress={onJoin}
        >
          <Text style={[
            styles.actionButtonText,
            isJoined ? styles.joinedButtonText : styles.joinButtonText
          ]}>
            {isJoined ? 'Sair do Grupo' : 'Entrar no Grupo'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
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
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
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
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#FF6B35',
  },
  joinedButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  joinButtonText: {
    color: 'white',
  },
  joinedButtonText: {
    color: '#6B7280',
  },
});