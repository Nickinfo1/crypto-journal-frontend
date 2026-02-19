import { type JournalStats } from '../../../../entities/trade/types';
import './StatsPanel.css';

interface StatsPanelProps {
  stats: JournalStats;
  isLoading?: boolean;
}

export function StatsPanel({ stats, isLoading }: StatsPanelProps) {
  if (isLoading) {
    return <div className="stats-panel__loader">Загрузка статистики...</div>;
  }

  const StatCard = ({ 
    label, 
    value, 
    variant = 'neutral',
    suffix = '' 
  }: { 
    label: string; 
    value: string | number; 
    variant?: 'neutral' | 'profit' | 'loss';
    suffix?: string;
  }) => (
    <div className={`stats-panel__card stats-panel__card--${variant}`}>
      <div className="stats-panel__label">{label}</div>
      <div className="stats-panel__value">
        {value}{suffix}
      </div>
    </div>
  );

  return (
    <div className="stats-panel">
      <h2 className="stats-panel__title">Статистика журнала</h2>
      
      <div className="stats-panel__grid">
        <StatCard 
          label="Всего сделок" 
          value={stats.total_trades} 
        />
        
        <StatCard 
          label="Win Rate" 
          value={stats.win_rate} 
          suffix="%"
          variant={stats.win_rate >= 50 ? 'profit' : 'loss'}
        />
        
        <StatCard 
          label="Общий P&L" 
          value={`${stats.total_pnl_usdt >= 0 ? '+' : ''}${stats.total_pnl_usdt}`}
          suffix=" USDT"
          variant={stats.total_pnl_usdt >= 0 ? 'profit' : 'loss'}
        />
        
        <StatCard 
          label="Profit Factor" 
          value={stats.profit_factor}
          variant={stats.profit_factor >= 1.5 ? 'profit' : stats.profit_factor >= 1 ? 'neutral' : 'loss'}
        />
        
        <StatCard 
          label="Средний выигрыш" 
          value={stats.average_win}
          suffix=" USDT"
          variant="profit"
        />
        
        <StatCard 
          label="Средний проигрыш" 
          value={stats.average_loss}
          suffix=" USDT"
          variant="loss"
        />
        
        <StatCard 
          label="Макс. просадка" 
          value={stats.max_drawdown}
          suffix=" USDT"
          variant="loss"
        />
        
        <StatCard 
          label="Лучшая сделка" 
          value={`+${stats.best_trade}`}
          suffix=" USDT"
          variant="profit"
        />
        
        <StatCard 
          label="Худшая сделка" 
          value={stats.worst_trade}
          suffix=" USDT"
          variant="loss"
        />
      </div>
    </div>
  );
}