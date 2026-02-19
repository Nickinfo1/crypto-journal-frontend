import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from '../api/tradeApi';
import { type TradeCreate, type TradeUpdate } from '../types';

export const TRADE_KEYS = {
  all: ['trades'] as const,
  lists: () => [...TRADE_KEYS.all, 'list'] as const,
  list: (journalId: string, status?: string) => 
    [...TRADE_KEYS.lists(), journalId, status] as const,
  details: () => [...TRADE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TRADE_KEYS.details(), id] as const,
  stats: (journalId: string) => [...TRADE_KEYS.all, 'stats', journalId] as const,
};

export function useTrades(journalId: string, status?: string) {
  return useQuery({
    queryKey: TRADE_KEYS.list(journalId, status),
    queryFn: () => tradeApi.getAll(journalId, status),
    enabled: !!journalId,
  });
}

export function useTrade(tradeId: string) {
  return useQuery({
    queryKey: TRADE_KEYS.detail(tradeId),
    queryFn: () => tradeApi.getById(tradeId),
    enabled: !!tradeId,
  });
}

export function useJournalStats(journalId: string) {
  return useQuery({
    queryKey: TRADE_KEYS.stats(journalId),
    queryFn: () => tradeApi.getStats(journalId),
    enabled: !!journalId,
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TradeCreate) => tradeApi.create(data),
    onSuccess: (data: any) => {
      // Инвалидация кэша сделок и статистики
      queryClient.invalidateQueries({ queryKey: TRADE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TRADE_KEYS.stats(data.journal_id) });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TradeUpdate }) => 
      tradeApi.update(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: TRADE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TRADE_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: TRADE_KEYS.stats(data.journal_id) });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tradeId: string) => tradeApi.delete(tradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADE_KEYS.lists() });
    },
  });
}