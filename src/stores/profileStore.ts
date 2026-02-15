import { create } from 'zustand';
import { profileApi } from '../lib/tauri';
import type { Profile } from '../types/profile';
import { useServerStore } from './serverStore';

interface ProfileState {
    profiles: Profile[];
    activeProfileId: string;
    loading: boolean;
    error: string | null;

    fetchProfiles: () => Promise<void>;
    createProfile: (name: string) => Promise<Profile>;
    setActiveProfile: (profileId: string) => Promise<void>;
    clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
    profiles: [],
    activeProfileId: 'default',
    loading: false,
    error: null,

    fetchProfiles: async () => {
        set({ loading: true, error: null });
        try {
            const [profiles, activeProfileId] = await Promise.all([
                profileApi.getAll(),
                profileApi.getActive(),
            ]);
            set({ profiles, activeProfileId, loading: false });
        } catch (error) {
            set({ error: String(error), loading: false });
        }
    },

    createProfile: async (name: string) => {
        set({ error: null });
        try {
            const profile = await profileApi.create(name);
            await useProfileStore.getState().fetchProfiles();
            return profile;
        } catch (error) {
            set({ error: String(error) });
            throw error;
        }
    },

    setActiveProfile: async (profileId: string) => {
        set({ error: null });
        try {
            await profileApi.setActive(profileId);
            set({ activeProfileId: profileId });
            await useServerStore.getState().syncServers();
        } catch (error) {
            set({ error: String(error) });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
