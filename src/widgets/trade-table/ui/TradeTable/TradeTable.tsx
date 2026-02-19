import { type Trade } from '../../../../entities/trade/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './TradeTable.css';

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
  onView: (trade: Trade) => void;
  onOpenLightbox?: (images: string[], initialIndex: number) => void;
  isLoading?: boolean;
}

export function TradeTable({ trades, onEdit, onDelete, onView, onOpenLightbox, isLoading }: TradeTableProps) {
  if (isLoading) {
    return <div className="trade-table__loader">Загрузка...</div>;
  }

  if (trades.length === 0) {
    return (
      <div className="trade-table__empty">
        <p>Нет сделок в этом журнале</p>
      </div>
    );
  }

  return (
    <div className="trade-table">
      <table className="trade-table__table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Символ</th>
            <th>Сторона</th>
            <th>Вход</th>
            <th>Выход</th>
            <th>Размер</th>
            <th>P&L</th>
            <th>Статус</th>
            <th>Скриншоты</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="trade-table__row">
              <td className="font-mono">
                {format(new Date(trade.opened_at), 'dd.MM.yy HH:mm', { locale: ru })}
              </td>
              <td className="trade-table__symbol">{trade.symbol}</td>
              <td>
                <span className={`trade-table__badge ${trade.side === 'long' ? 'badge--long' : 'badge--short'}`}>
                  {trade.side.toUpperCase()}
                </span>
              </td>
              <td className="font-mono">{trade.entry_price}</td>
              <td className="font-mono">{trade.exit_price || '—'}</td>
              <td className="font-mono">${trade.position_size_usdt}</td>
              <td>
                <span className={`trade-table__pnl ${trade.pnl_usdt >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {trade.status === 'closed' 
                    ? `${trade.pnl_usdt >= 0 ? '+' : ''}${trade.pnl_usdt} (${trade.pnl_percent}%)`
                    : '—'
                  }
                </span>
              </td>
              <td>
                <span className={`trade-table__status status--${trade.status}`}>
                  {trade.status}
                </span>
              </td>
              <td>
                {trade.screenshot_paths && trade.screenshot_paths.length > 0 ? (
                  <div className="trade-table__screenshots">
                    {trade.screenshot_paths.slice(0, 3).map((path, index) => (
                      <button
                        key={index}
                        className="trade-table__screenshot-thumb"
                        onClick={() => {
                          if (onOpenLightbox) {
                            const images = trade.screenshot_paths!.map(
                              (p) => `http://localhost:8000/uploads/${p}`
                            );
                            onOpenLightbox(images, index);
                          }
                        }}
                        style={{
                          backgroundImage: `url(http://localhost:8000/uploads/${path})`,
                        }}
                        title={`Скриншот ${index + 1} из ${trade.screenshot_paths!.length}`}
                      >
                        {index === 2 && trade.screenshot_paths!.length > 3 && (
                          <span className="trade-table__screenshot-more">
                            +{trade.screenshot_paths!.length - 3}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="trade-table__no-screenshots">—</span>
                )}
              </td>
              <td>
                <div className="trade-table__actions">
                  <button 
                    className="trade-table__action-btn"
                    onClick={() => onView(trade)}
                    title="Просмотр"
                  >
                    👁
                  </button>
                  <button 
                    className="trade-table__action-btn"
                    onClick={() => onEdit(trade)}
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button 
                    className="trade-table__action-btn trade-table__action-btn--danger"
                    onClick={() => onDelete(trade.id)}
                    title="Удалить"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}