export type TradeSide = 'long' | 'short';
export type TradeStatus = 'open' | 'closed' | 'canceled';

export interface EntryCriterion {
  name: string;
  score: number;
  comment?: string;
}

export interface Trade {
  id: string;
  journal_id: string;
  symbol: string;
  side: TradeSide;
  status: TradeStatus;
  opened_at: string;
  closed_at?: string;
  entry_price: number;
  exit_price?: number;
  position_size_usdt: number;
  leverage: number;
  stop_loss_price?: number;
  take_profit_price?: number;
  pnl_usdt: number;
  pnl_percent: number;
  fee_usdt: number;
  description?: string;
  emotional_state?: string;
  screenshot_paths?: string[];
  entry_criteria: EntryCriterion[];
  created_at: string;
  updated_at: string;
}

export type TradeCreate = Omit<Trade, 'id' | 'pnl_usdt' | 'pnl_percent' | 'created_at' | 'updated_at'>;
export type TradeUpdate = Partial<TradeCreate>;

export interface JournalStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl_usdt: number;
  average_win: number;
  average_loss: number;
  profit_factor: number;
  max_drawdown: number;
  best_trade: number;
  worst_trade: number;
}