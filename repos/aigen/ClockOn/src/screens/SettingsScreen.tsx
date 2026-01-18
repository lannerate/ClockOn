// Settings screen - office location management and configuration

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
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
  RadioButton,
} from 'react-native-paper';
import useAppStore from '../store/useAppStore';
import SettingsService from '../services/SettingsService';
import LocationService from '../services/LocationService';
import { OfficeLocation, PowerMode } from '../types';
import { validateEmployeeId, validateOfficeLocation } from '../utils/validation';
import { getPowerModeDescription, getEstimatedBatteryUsage } from '../config/powerModeConfig';

const SettingsScreen: React.FC = () => {
  const {
    employeeId,
    officeLocations,
    setEmployeeId,
    setOfficeLocations,
    setError,
  } = useAppStore();

  const [localEmployeeId, setLocalEmployeeId] = useState(employeeId);
  const [powerMode, setPowerMode] = useState<PowerMode>('balanced');
  const [showPowerModeInfo, setShowPowerModeInfo] = useState(false);
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

      const mode = await SettingsService.getPowerMode();
      setPowerMode(mode);
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

  const handlePowerModeChange = async (mode: PowerMode) => {
    try {
      await SettingsService.setPowerMode(mode);
      setPowerMode(mode);

      // Reconfigure location tracking with new power mode
      await LocationService.reconfigureWatching();

      Alert.alert(
        'Power Mode Updated',
        `Location tracking updated to ${mode.replace('_', ' ')} mode.\n\n${getEstimatedBatteryUsage(mode)}`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Failed to update power mode:', err);
      Alert.alert('Error', 'Failed to update power mode');
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
          left={() => <Text style={{ fontSize: 24 }}>👤</Text>}
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
          >
            ✅ Save Employee ID
          </Button>
        </Card.Content>
      </Card>

      {/* Power Mode Section */}
      <Card style={styles.card}>
        <Card.Title
          title="Battery Optimization"
          left={() => <Text style={{ fontSize: 24 }}>🔋</Text>}
          right={() => (
            <TouchableOpacity onPress={() => setShowPowerModeInfo(true)}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>ℹ️</Text>
            </TouchableOpacity>
          )}
        />
        <Card.Content>
          <Text style={styles.powerDescription}>
            Current: {powerMode.replace('_', ' ')}
          </Text>
          <Text style={styles.powerSubtitle}>
            {getEstimatedBatteryUsage(powerMode)}
          </Text>

          <Divider style={styles.divider} />

          <TouchableOpacity
            style={styles.powerModeItem}
            onPress={() => handlePowerModeChange('high_performance')}
          >
            <View style={styles.powerModeRow}>
              <Text style={{ fontSize: 24 }}>🚀</Text>
              <View style={styles.powerModeText}>
                <Text style={styles.powerModeTitle}>High Performance</Text>
                <Text style={styles.powerModeDesc}>Maximum accuracy, 3-5% battery/hour</Text>
              </View>
              <Text style={styles.powerModeIndicator}>
                {powerMode === 'high_performance' ? '✅' : '⚪'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.powerModeItem}
            onPress={() => handlePowerModeChange('balanced')}
          >
            <View style={styles.powerModeRow}>
              <Text style={{ fontSize: 24 }}>⚖️</Text>
              <View style={styles.powerModeText}>
                <Text style={styles.powerModeTitle}>Balanced</Text>
                <Text style={styles.powerModeDesc}>Good accuracy, 1-2% battery/hour (Recommended)</Text>
              </View>
              <Text style={styles.powerModeIndicator}>
                {powerMode === 'balanced' ? '✅' : '⚪'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.powerModeItem}
            onPress={() => handlePowerModeChange('power_saver')}
          >
            <View style={styles.powerModeRow}>
              <Text style={{ fontSize: 24 }}>🍃</Text>
              <View style={styles.powerModeText}>
                <Text style={styles.powerModeTitle}>Power Saver</Text>
                <Text style={styles.powerModeDesc}>Basic accuracy, &lt;1% battery/hour</Text>
              </View>
              <Text style={styles.powerModeIndicator}>
                {powerMode === 'power_saver' ? '✅' : '⚪'}
              </Text>
            </View>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Power Mode Info Dialog */}
      <Portal>
        <Dialog
          visible={showPowerModeInfo}
          onDismiss={() => setShowPowerModeInfo(false)}
        >
          <Dialog.Title>About Power Modes</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.infoText}>
              Power modes control how frequently your location is tracked for automatic clock in/out.
            </Text>
            <Divider style={styles.divider} />
            <Text style={styles.infoTitle}>🚀 High Performance</Text>
            <Text style={styles.infoText}>
              Maximum accuracy with frequent updates (every 3-5 seconds). Best for precise geofencing but uses more battery.
            </Text>
            <Divider style={styles.divider} />
            <Text style={styles.infoTitle}>⚖️ Balanced (Recommended)</Text>
            <Text style={styles.infoText}>
              Good accuracy with moderate updates (every 10 seconds). Automatically uses less power when far from office.
            </Text>
            <Divider style={styles.divider} />
            <Text style={styles.infoTitle}>🍃 Power Saver</Text>
            <Text style={styles.infoText}>
              Maximum battery savings with basic accuracy (every 30 seconds). Best for large geofences or all-day tracking.
            </Text>
            <Divider style={styles.divider} />
            <Text style={styles.infoNote}>
              💡 Tip: Adaptive updates are enabled in all modes. The app uses less power when you're far from the office.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPowerModeInfo(false)}>Got it!</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Office Locations Section */}
      <Card style={styles.card}>
        <Card.Title
          title="Office Locations"
          left={() => <Text style={{ fontSize: 24 }}>📍</Text>}
          right={(props) => (
            <Button
              {...props}
              mode="text"
              onPress={handleAddLocation}
            >
              ➕ Add
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
                  left={() => <Text style={{ fontSize: 24, marginRight: 12 }}>🏢</Text>}
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
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => handleDeleteLocation(location.id)}
                    textColor="#B00020"
                  >
                    🗑️ Delete
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
          left={() => <Text style={{ fontSize: 24 }}>ℹ️</Text>}
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
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {editingLocation ? 'Edit Location' : 'Add Location'}
          </Dialog.Title>

          {/* Action Buttons at Top */}
          <Dialog.Actions style={styles.dialogActionsTop}>
            <Button onPress={() => setShowAddLocation(false)}>
              Cancel
            </Button>
            <Button onPress={handleSaveLocation} mode="contained">
              Save
            </Button>
          </Dialog.Actions>

          <Divider style={styles.dialogDivider} />

          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView
              contentContainerStyle={styles.dialogContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              <TextInput
                label="Location Name"
                value={locationName}
                onChangeText={setLocationName}
                mode="outlined"
                style={styles.input}
                dense
              />

              <View style={styles.coordRow}>
                <TextInput
                  label="Latitude"
                  value={latitude}
                  onChangeText={setLatitude}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.coordInput}
                  dense
                />
                <TextInput
                  label="Longitude"
                  value={longitude}
                  onChangeText={setLongitude}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.coordInput}
                  dense
                />
              </View>

              <Button
                mode="outlined"
                onPress={handleGetCurrentLocation}
                style={styles.input}
                compact
              >
                📍 Use Current Location
              </Button>

              <TextInput
                label="Radius (meters)"
                value={radius}
                onChangeText={setRadius}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                dense
              />

              <View style={styles.switchRow}>
                <Text variant="bodyMedium">Enabled</Text>
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
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
    marginBottom: 8,
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
  dialog: {
    maxHeight: '85%',
    alignSelf: 'center',
    width: '90%',
    maxWidth: 500,
    justifyContent: 'flex-start',
  },
  dialogTitle: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  dialogActionsTop: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'flex-end',
  },
  dialogDivider: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  dialogScrollArea: {
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  dialogContent: {
    paddingVertical: 8,
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
    marginTop: 4,
  },
  powerDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  powerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  powerModeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: -16,
    marginVertical: 4,
  },
  powerModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  powerModeText: {
    flex: 1,
    marginLeft: 12,
  },
  powerModeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  powerModeDesc: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  powerModeIndicator: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  infoNote: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.8,
    marginTop: 8,
  },
});

export default SettingsScreen;
