import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Users,
  Clock,
  Calendar,
  X,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

interface Group {
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
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Corredores do Ibirapuera',
    type: 'corrida',
    members: 45,
    maxMembers: 60,
    location: 'Ibirapuera',
    schedule: 'Seg, Qua, Sex - 06:00',
    level: 'intermediário',
    description: 'Grupo para corredores que buscam melhorar o condicionamento físico',
    image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800',
    isJoined: true,
  },
  {
    id: '2',
    name: 'Pedal Urbano SP',
    type: 'ciclismo',
    members: 32,
    maxMembers: 50,
    location: 'Centro',
    schedule: 'Sáb, Dom - 07:00',
    level: 'iniciante',
    description: 'Explorando a cidade sobre duas rodas',
    image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800',
    isJoined: false,
  },
  {
    id: '3',
    name: 'Caminhada Matinal',
    type: 'caminhada',
    members: 18,
    maxMembers: 25,
    location: 'Vila Madalena',
    schedule: 'Todos os dias - 06:30',
    level: 'iniciante',
    description: 'Começe o dia com energia e boas companhias',
    image: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=800',
    isJoined: false,
  },
];

export default function GroupsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [groups, setGroups] = useState(mockGroups);

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: !group.isJoined, members: group.isJoined ? group.members - 1 : group.members + 1 }
          : group
      )
    );
  };

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

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'todos' || group.type === selectedType;
    const matchesLevel = selectedLevel === 'todos' || group.level === selectedLevel;
    
    return matchesSearch && matchesType && matchesLevel;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Grupos</Text>
          <TouchableOpacity style={styles.createButton}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Search and Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar grupos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Groups List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredGroups.map((group) => (
          <TouchableOpacity key={group.id} style={styles.groupCard}>
            <Image source={{ uri: group.image }} style={styles.groupImage} />
            
            <View style={styles.groupInfo}>
              <View style={styles.groupHeader}>
                <View style={styles.groupTitle}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: getLevelColor(group.level) }]}>
                    <Text style={styles.levelText}>{group.level}</Text>
                  </View>
                </View>
                
                <Text style={styles.groupType}>
                  {getTypeIcon(group.type)} {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                </Text>
              </View>

              <Text style={styles.groupDescription}>{group.description}</Text>

              <View style={styles.groupDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{group.location}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{group.schedule}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Users size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {group.members}/{group.maxMembers} membros
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  group.isJoined ? styles.joinedButton : styles.joinButton
                ]}
                onPress={() => handleJoinGroup(group.id)}
              >
                <Text style={[
                  styles.actionButtonText,
                  group.isJoined ? styles.joinedButtonText : styles.joinButtonText
                ]}>
                  {group.isJoined ? 'Sair do Grupo' : 'Entrar no Grupo'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Modalidade</Text>
              <View style={styles.filterOptions}>
                {['todos', 'corrida', 'ciclismo', 'caminhada'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      selectedType === type && styles.selectedFilter
                    ]}
                    onPress={() => setSelectedType(type)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedType === type && styles.selectedFilterText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Nível</Text>
              <View style={styles.filterOptions}>
                {['todos', 'iniciante', 'intermediário', 'avançado'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.filterOption,
                      selectedLevel === level && styles.selectedFilter
                    ]}
                    onPress={() => setSelectedLevel(level)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedLevel === level && styles.selectedFilterText
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  createButton: {
    backgroundColor: '#FF6B35',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#FEF3F2',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  groupCard: {
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
  groupImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  groupInfo: {
    padding: 16,
  },
  groupHeader: {
    marginBottom: 8,
  },
  groupTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  groupName: {
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
  groupType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  groupDetails: {
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
  bottomSpacing: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedFilter: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedFilterText: {
    color: 'white',
  },
  applyButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});