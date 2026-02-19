import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi } from '../api/journalApi';
import { type JournalCreate, type JournalUpdate } from '../types';

export const JOURNAL_KEYS = {
  all: ['journals'] as const,
  lists: () => [...JOURNAL_KEYS.all, 'list'] as const,
  details: () => [...JOURNAL_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOURNAL_KEYS.details(), id] as const,
};

export function useJournals() {
  return useQuery({
    queryKey: JOURNAL_KEYS.lists(),
    queryFn: journalApi.getAll,
  });
}

export function useJournal(journalId: string) {
  return useQuery({
    queryKey: JOURNAL_KEYS.detail(journalId),
    queryFn: () => journalApi.getById(journalId),
    enabled: !!journalId,
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: JournalCreate) => journalApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.lists() });
    },
  });
}

export function useUpdateJournal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JournalUpdate }) =>
      journalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.lists() });
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (journalId: string) => journalApi.delete(journalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.lists() });
    },
  });
}