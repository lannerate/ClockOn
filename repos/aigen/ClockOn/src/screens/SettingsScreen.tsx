// Settings screen - office location management and configuration

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  Divider,
  List,
  Switch,
  Dialog,
  Portal,
  Modal,
} from 'react-native-paper';
import useAppStore from '../store/useAppStore';
import SettingsService from '../services/SettingsService';
import LocationService from '../services/LocationService';
import { OfficeLocation } from '../types';
import { validateEmployeeId, validateOfficeLocation } from '../utils/validation';

const SettingsScreen: React.FC = () => {
  const {
    employeeId,
    officeLocations,
    setEmployeeId,
    setOfficeLocations,
    setError,
  } = useAppStore();

  const [localEmployeeId, setLocalEmployeeId] = useState(employeeId);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OfficeLocation | null>(
    null
  );

  // Form state
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('0');
  const [longitude, setLongitude] = useState('0');
  const [radius, setRadius] = useState('100');
  const [locationEnabled, setLocationEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const id = await SettingsService.getEmployeeId();
      setLocalEmployeeId(id);
      setEmployeeId(id);

      const locations = await SettingsService.getOfficeLocations();
      setOfficeLocations(locations);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveEmployeeId = async () => {
    const validation = validateEmployeeId(localEmployeeId);
    if (!validation.valid) {
      Alert.alert('Invalid Employee ID', validation.error);
      return;
    }

    try {
      await SettingsService.setEmployeeId(localEmployeeId);
      setEmployeeId(localEmployeeId);
      Alert.alert('Success', 'Employee ID saved');
    } catch (err) {
      Alert.alert('Error', 'Failed to save employee ID');
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationName('');
    setLatitude('0');
    setLongitude('0');
    setRadius('100');
    setLocationEnabled(true);
    setShowAddLocation(true);
  };

  const handleEditLocation = (location: OfficeLocation) => {
    setEditingLocation(location);
    setLocationName(location.name);
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());
    setRadius(location.radius.toString());
    setLocationEnabled(location.enabled);
    setShowAddLocation(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to delete this office location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SettingsService.deleteOfficeLocation(locationId);
              const locations = await SettingsService.getOfficeLocations();
              setOfficeLocations(locations);
              Alert.alert('Success', 'Location deleted');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete location');
            }
          },
        },
      ]
    );
  };

  const handleSaveLocation = async () => {
    const location: OfficeLocation = {
      id: editingLocation?.id || SettingsService.generateId(),
      name: locationName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius, 10),
      enabled: locationEnabled,
    };

    const validation = validateOfficeLocation(location);
    if (!validation.valid) {
      Alert.alert('Invalid Location', validation.error);
      return;
    }

    try {
      await SettingsService.addOfficeLocation(location);
      const locations = await SettingsService.getOfficeLocations();
      setOfficeLocations(locations);
      setShowAddLocation(false);
      Alert.alert('Success', 'Location saved');
    } catch (err) {
      Alert.alert('Error', 'Failed to save location');
    }
  };

  const handleToggleLocation = async (locationId: string, enabled: boolean) => {
    try {
      const locations = await SettingsService.getOfficeLocations();
      const location = locations.find((l) => l.id === locationId);
      if (location) {
        location.enabled = enabled;
        await SettingsService.addOfficeLocation(location);
        setOfficeLocations([...locations]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update location');
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      // Check if location is enabled
      const isEnabled = await LocationService.isLocationEnabled();
      if (!isEnabled) {
        Alert.alert(
          'Location Disabled',
          'Please enable location services in your device settings.'
        );
        return;
      }

      // Request permissions
      const hasPermission = await LocationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant location permission to use your current location.'
        );
        return;
      }

      // Show loading indicator
      Alert.alert(
        'Getting Location',
        'Acquiring your current GPS coordinates...'
      );

      // Get current location
      const location = await LocationService.getCurrentLocation();

      if (!location) {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please try again.'
        );
        return;
      }

      // Update form fields with current coordinates
      setLatitude(location.latitude.toFixed(7));
      setLongitude(location.longitude.toFixed(7));

      Alert.alert(
        'Location Found',
        `Coordinates updated: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        [{ text: 'OK', onPress: () => console.log('Location updated') }]
      );
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Error',
        'Failed to get your current location. Please make sure location services are enabled.'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Employee ID Section */}
      <Card style={styles.card}>
        <Card.Title
          title="Employee Configuration"
          left={(props) => <List.Icon {...props} icon="account-circle" size={24} />}
        />
        <Card.Content>
          <TextInput
            label="Employee ID"
            value={localEmployeeId}
            onChangeText={setLocalEmployeeId}
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSaveEmployeeId}
            style={styles.button}
            icon="check-circle"
          >
            Save Employee ID
          </Button>
        </Card.Content>
      </Card>

      {/* Office Locations Section */}
      <Card style={styles.card}>
        <Card.Title
          title="Office Locations"
          left={(props) => <List.Icon {...props} icon="map-marker-multiple" size={24} />}
          right={(props) => (
            <Button
              {...props}
              mode="text"
              onPress={handleAddLocation}
              icon="plus-circle"
            >
              Add
            </Button>
          )}
        />
        <Card.Content>
          {officeLocations.length === 0 ? (
            <Text style={styles.emptyText}>
              No office locations configured. Add one to enable automatic clock
              in/out.
            </Text>
          ) : (
            officeLocations.map((location, index) => (
              <View key={location.id}>
                <List.Item
                  title={location.name}
                  description={`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} - ${location.radius}m`}
                  left={(props) => <List.Icon {...props} icon="office-building" />}
                  right={() => (
                    <Switch
                      value={location.enabled}
                      onValueChange={(value) =>
                        handleToggleLocation(location.id, value)
                      }
                    />
                  )}
                  onPress={() => handleEditLocation(location)}
                />
                <View style={styles.actionButtons}>
                  <Button
                    mode="text"
                    onPress={() => handleEditLocation(location)}
                    icon="pencil-outline"
                  >
                    Edit
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => handleDeleteLocation(location.id)}
                    icon="trash-can-outline"
                    textColor="#B00020"
                  >
                    Delete
                  </Button>
                </View>
                {index < officeLocations.length - 1 && <Divider />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Info Section */}
      <Card style={styles.card}>
        <Card.Title
          title="How It Works"
          left={(props) => <List.Icon {...props} icon="information-outline" size={24} />}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.infoText}>
            1. Add your office location(s) with GPS coordinates{'\n'}
            2. Enable location to activate automatic geofencing{'\n'}
            3. Clock in/out automatically when entering/exiting the geofence{'\n'}
            4. Or use manual buttons on the Dashboard
          </Text>
        </Card.Content>
      </Card>

      {/* Add/Edit Location Modal */}
      <Portal>
        <Dialog
          visible={showAddLocation}
          onDismiss={() => setShowAddLocation(false)}
        >
          <Dialog.Title>
            {editingLocation ? 'Edit Location' : 'Add Location'}
          </Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput
                label="Location Name"
                value={locationName}
                onChangeText={setLocationName}
                mode="outlined"
                style={styles.input}
              />

              <View style={styles.coordRow}>
                <TextInput
                  label="Latitude"
                  value={latitude}
                  onChangeText={setLatitude}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.coordInput}
                />
                <TextInput
                  label="Longitude"
                  value={longitude}
                  onChangeText={setLongitude}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.coordInput}
                />
              </View>

              <Button
                mode="outlined"
                onPress={handleGetCurrentLocation}
                icon="crosshairs-gps"
                style={styles.input}
              >
                Use Current Location
              </Button>

              <TextInput
                label="Radius (meters)"
                value={radius}
                onChangeText={setRadius}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
              />

              <View style={styles.switchRow}>
                <Text variant="bodyLarge">Enabled</Text>
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowAddLocation(false)} icon="close-circle-outline">
              Cancel
            </Button>
            <Button onPress={handleSaveLocation} icon="check-circle-outline">
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
    paddingBottom: 8,
  },
  infoText: {
    lineHeight: 24,
  },
  dialogContent: {
    paddingVertical: 16,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordInput: {
    flex: 1,
    marginRight: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default SettingsScreen;
