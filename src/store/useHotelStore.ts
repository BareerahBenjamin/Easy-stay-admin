// src/store/useHotelStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Hotel } from '../types/hotel';

interface HotelStore {
  hotels: Hotel[];
  addHotel: (hotel: Omit<Hotel, 'id' | 'createdAt'>) => void;
  updateHotel: (id: string, data: Partial<Hotel>) => void;
  getMerchantHotels: (merchantId: string) => Hotel[];
  getAllHotels: () => Hotel[];
}


export const useHotelStore = create<HotelStore>()(
  persist(
    (set, get) => ({
      hotels: [],
      addHotel: (hotel) =>
        set((state) => ({
          hotels: [
            ...state.hotels,
            { ...hotel, id: Date.now().toString(), createdAt: new Date().toISOString() },
          ],
        })),
      updateHotel: (id, data) =>
        set((state) => ({
          hotels: state.hotels.map((h) => (h.id === id ? { ...h, ...data } : h)),
        })),
      getMerchantHotels: (merchantId) =>
        get().hotels.filter((h) => h.merchantId === merchantId),
      getAllHotels: () => get().hotels,
    }),
    { name: 'hotel-storage' }
  )
);