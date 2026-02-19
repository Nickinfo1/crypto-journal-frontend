import apiClient from '../../../shared/api/axios';
import type { Trade, TradeCreate, TradeUpdate, JournalStats } from '../types';

export const tradeApi = {
  getAll: async (journalId: string, status?: string): Promise<Trade[]> => {
    const params = new URLSearchParams({ journal_id: journalId });
    if (status) params.append('status', status);
    
    const response = await apiClient.get<Trade[]>('/trades', { params });
    return response.data;
  },
  
  getById: async (tradeId: string): Promise<Trade> => {
    const response = await apiClient.get<Trade>(`/trades/${tradeId}`);
    return response.data;
  },
  
  create: async (data: TradeCreate): Promise<Trade> => {
    const response = await apiClient.post<Trade>('/trades', data);
    return response.data;
  },
  
  update: async (tradeId: string, data: TradeUpdate): Promise<Trade> => {
    const response = await apiClient.put<Trade>(`/trades/${tradeId}`, data);
    return response.data;
  },
  
  delete: async (tradeId: string): Promise<void> => {
    await apiClient.delete(`/trades/${tradeId}`);
  },
  
  getStats: async (journalId: string): Promise<JournalStats> => {
    const response = await apiClient.get<JournalStats>(`/trades/journal/${journalId}/stats`);
    return response.data;
  },
};