import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useGroupsStore } from '@/store/groupsStore';

export default function GroupsScreen() {
  const { profile } = useAuthStore();
  const { groups, myGroups, isLoading, fetchGroups, fetchMyGroups, joinGroup, leaveGroup } = useGroupsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [refreshing, setRefreshing] = useState(false);
  const [showMyGroups, setShowMyGroups] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchGroups({ activityType: selectedType, skillLevel: selectedLevel });
    if (profile) {
      await fetchMyGroups(profile.id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!profile) return;

    const isJoined = myGroups.some(g => g.id === groupId);

    if (isJoined) {
      const { error } = await leaveGroup(groupId, profile.id);
      if (error) {
        Alert.alert('Erro', 'Não foi possível sair do grupo');
      } else {
        Alert.alert('Sucesso!', 'Você saiu do grupo');
        await loadData();
      }
    } else {
      const { error } = await joinGroup(groupId, profile.id);
      if (error) {
        Alert.alert('Erro', 'Não foi possível entrar no grupo');
      } else {
        Alert.alert('Sucesso!', 'Você entrou no grupo!');
        await loadData();
      }
    }
  };

  const applyFilters = async () => {
    setShowFilters(false);
    await fetchGroups({
      activityType: selectedType,
      skillLevel: selectedLevel,
      searchQuery
    });
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

  const displayGroups = showMyGroups ? myGroups : groups;
  const filteredGroups = displayGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Grupos</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, !showMyGroups && styles.activeTab]}
            onPress={() => setShowMyGroups(false)}
          >
            <Text style={[styles.tabText, !showMyGroups && styles.activeTabText]}>
              Explorar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, showMyGroups && styles.activeTab]}
            onPress={() => setShowMyGroups(true)}
          >
            <Text style={[styles.tabText, showMyGroups && styles.activeTabText]}>
              Meus Grupos ({myGroups.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
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
            <Ionicons name="filter" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : filteredGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {showMyGroups ? 'Você ainda não participa de nenhum grupo' : 'Nenhum grupo encontrado'}
            </Text>
            <Text style={styles.emptySubtext}>
              {showMyGroups
                ? 'Explore grupos e comece a se conectar!'
                : 'Tente ajustar os filtros ou seja o primeiro a criar um grupo!'}
            </Text>
          </View>
        ) : (
          filteredGroups.map((group) => {
            const isJoined = myGroups.some(g => g.id === group.id);

            return (
              <TouchableOpacity key={group.id} style={styles.groupCard}>
                {group.image_url && (
                  <Image source={{ uri: group.image_url }} style={styles.groupImage} />
                )}

                <View style={styles.groupInfo}>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupTitle}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(group.skill_level) }]}>
                        <Text style={styles.levelText}>{group.skill_level}</Text>
                      </View>
                    </View>

                    <Text style={styles.groupType}>
                      {getTypeIcon(group.activity_type)} {group.activity_type.charAt(0).toUpperCase() + group.activity_type.slice(1)}
                    </Text>
                  </View>

                  <Text style={styles.groupDescription} numberOfLines={2}>
                    {group.description}
                  </Text>

                  <View style={styles.groupDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="location" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{group.city}, {group.state}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{group.schedule}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="people" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>
                        {group.current_members}/{group.max_members} membros
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isJoined ? styles.joinedButton : styles.joinButton
                    ]}
                    onPress={() => handleJoinGroup(group.id)}
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
          })
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

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
                <Ionicons name="close" size={24} color="#6B7280" />
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
              onPress={applyFilters}
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FF6B35',
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
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
