import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  MapPin,
  Navigation,
  Users,
  Clock,
  Star,
  Route,
  Filter,
  Layers,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

interface MapLocation {
  id: string;
  name: string;
  type: 'grupo' | 'evento' | 'rota';
  coordinates: [number, number];
  participants?: number;
  time?: string;
  rating?: number;
  image: string;
}

const mockLocations: MapLocation[] = [
  {
    id: '1',
    name: 'Corrida Matinal Ibirapuera',
    type: 'grupo',
    coordinates: [-23.587, -46.658],
    participants: 12,
    time: '06:00',
    image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Rota Ciclística Centro',
    type: 'rota',
    coordinates: [-23.543, -46.634],
    rating: 4.8,
    image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Maratona de São Paulo',
    type: 'evento',
    coordinates: [-23.561, -46.656],
    participants: 2500,
    time: '07:00',
    image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export default function MapScreen() {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'grupos' | 'eventos' | 'rotas'>('todos');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grupo': return '#FF6B35';
      case 'evento': return '#4A90E2';
      case 'rota': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grupo': return <Users size={16} color="white" />;
      case 'evento': return <Clock size={16} color="white" />;
      case 'rota': return <Route size={16} color="white" />;
      default: return <MapPin size={16} color="white" />;
    }
  };

  const filteredLocations = mockLocations.filter(location => 
    activeFilter === 'todos' || location.type === activeFilter.slice(0, -1)
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mapa</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.layersButton}>
            <Layers size={20} color="#FF6B35" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navigationButton}>
            <Navigation size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['todos', 'grupos', 'eventos', 'rotas'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilter
              ]}
              onPress={() => setActiveFilter(filter as any)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>🗺️</Text>
          <Text style={styles.mapText}>Mapa Interativo</Text>
          <Text style={styles.mapSubtext}>Visualização dos grupos, eventos e rotas próximas</Text>
          
          {/* Location Markers */}
          {filteredLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.mapMarker,
                { backgroundColor: getTypeColor(location.type) },
                {
                  top: Math.random() * 200 + 50,
                  left: Math.random() * 200 + 50,
                }
              ]}
              onPress={() => setSelectedLocation(location)}
            >
              {getTypeIcon(location.type)}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location Details */}
      {selectedLocation && (
        <View style={styles.locationDetails}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedLocation(null)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          <Image source={{ uri: selectedLocation.image }} style={styles.locationImage} />
          
          <View style={styles.locationInfo}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationName}>{selectedLocation.name}</Text>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(selectedLocation.type) }]}>
                <Text style={styles.typeText}>
                  {selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.locationMeta}>
              {selectedLocation.participants && (
                <View style={styles.metaItem}>
                  <Users size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{selectedLocation.participants} participantes</Text>
                </View>
              )}
              
              {selectedLocation.time && (
                <View style={styles.metaItem}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{selectedLocation.time}</Text>
                </View>
              )}
              
              {selectedLocation.rating && (
                <View style={styles.metaItem}>
                  <Star size={16} color="#F59E0B" />
                  <Text style={styles.metaText}>{selectedLocation.rating}</Text>
                </View>
              )}
            </View>

            <View style={styles.locationActions}>
              <TouchableOpacity style={styles.navigateButton}>
                <Navigation size={16} color="white" />
                <Text style={styles.navigateText}>Navegar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinText}>Participar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Bottom List */}
      <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.listTitle}>Próximos a você</Text>
        
        {filteredLocations.map((location) => (
          <TouchableOpacity 
            key={location.id} 
            style={styles.locationCard}
            onPress={() => setSelectedLocation(location)}
          >
            <Image source={{ uri: location.image }} style={styles.cardImage} />
            
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{location.name}</Text>
                <View style={[styles.cardBadge, { backgroundColor: getTypeColor(location.type) }]}>
                  <Text style={styles.cardBadgeText}>
                    {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMeta}>
                {location.participants && (
                  <Text style={styles.cardMetaText}>👥 {location.participants}</Text>
                )}
                {location.time && (
                  <Text style={styles.cardMetaText}>🕐 {location.time}</Text>
                )}
                {location.rating && (
                  <Text style={styles.cardMetaText}>⭐ {location.rating}</Text>
                )}
                <Text style={styles.cardDistance}>📍 0.5 km</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
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
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  layersButton: {
    backgroundColor: '#FEF3F2',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationButton: {
    backgroundColor: '#FF6B35',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeFilterText: {
    color: 'white',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPlaceholderText: {
    fontSize: 48,
    marginBottom: 16,
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  mapMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationDetails: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationImage: {
    width: '100%',
    height: 120,
  },
  locationInfo: {
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  locationMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  navigateText: {
    color: 'white',
    fontWeight: '600',
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  locationsList: {
    maxHeight: 180,
    backgroundColor: 'white',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  locationCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  cardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardDistance: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});