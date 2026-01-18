// Zustand store for global app state

import { create } from 'zustand';
import { ClockStatus, LocationStatus, EmployeeRecord, OfficeLocation } from '../types';

interface AppState {
  // Clock status
  clockStatus: ClockStatus | null;
  setClockStatus: (status: ClockStatus) => void;

  // Location status
  locationStatus: LocationStatus | null;
  setLocationStatus: (status: LocationStatus) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error messages
  error: string | null;
  setError: (error: string | null) => void;

  // Employee ID
  employeeId: string;
  setEmployeeId: (id: string) => void;

  // Office locations
  officeLocations: OfficeLocation[];
  setOfficeLocations: (locations: OfficeLocation[]) => void;

  // Recent clock events (for UI feedback)
  recentEvent: EmployeeRecord | null;
  setRecentEvent: (record: EmployeeRecord | null) => void;

  // Reset state
  reset: () => void;
}

const useAppStore = create<AppState>((set) => ({
  // Initial state
  clockStatus: null,
  locationStatus: null,
  isLoading: false,
  error: null,
  employeeId: '',
  officeLocations: [],
  recentEvent: null,

  // Actions
  setClockStatus: (status) => set({ clockStatus: status }),

  setLocationStatus: (status) => set({ locationStatus: status }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setEmployeeId: (id) => set({ employeeId: id }),

  setOfficeLocations: (locations) => set({ officeLocations: locations }),

  setRecentEvent: (record) => set({ recentEvent: record }),

  reset: () =>
    set({
      clockStatus: null,
      locationStatus: null,
      isLoading: false,
      error: null,
      recentEvent: null,
    }),
}));

export default useAppStore;
