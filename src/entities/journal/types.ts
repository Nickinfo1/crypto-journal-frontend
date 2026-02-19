import { type Trade } from '../trade/types';

export interface Journal {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  trades_count?: number;
  trades?: Trade[];
}

export type JournalCreate = Omit<Journal, 'id' | 'created_at' | 'trades_count' | 'trades'>;
export type JournalUpdate = Partial<JournalCreate>;