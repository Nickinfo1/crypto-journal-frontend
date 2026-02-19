import apiClient from '../../../shared/api/axios';
import { type Journal, type JournalCreate, type JournalUpdate } from '../types';

export const journalApi = {
  getAll: async (): Promise<Journal[]> => {
    const response = await apiClient.get<Journal[]>('/journals');
    return response.data;
  },
  
  getById: async (journalId: string): Promise<Journal> => {
    const response = await apiClient.get<Journal>(`/journals/${journalId}`);
    return response.data;
  },
  
  create: async (data: JournalCreate): Promise<Journal> => {
    const response = await apiClient.post<Journal>('/journals', data);
    return response.data;
  },
  
  update: async (journalId: string, data: JournalUpdate): Promise<Journal> => {
    const response = await apiClient.put<Journal>(`/journals/${journalId}`, data);
    return response.data;
  },
  
  delete: async (journalId: string): Promise<void> => {
    await apiClient.delete(`/journals/${journalId}`);
  },
};