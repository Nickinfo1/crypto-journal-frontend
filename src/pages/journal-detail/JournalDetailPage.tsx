import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournal } from '../../entities/journal/hooks/useJournals';
import { useTrades, useCreateTrade, useUpdateTrade, useDeleteTrade, useJournalStats } from '../../entities/trade/hooks/useTrades';
import { type Trade, type TradeCreate, type TradeUpdate } from '../../entities/trade/types';
import { Button } from '../../shared/ui/Button/Button';
import { StatsPanel } from '../../widgets/stats-panel/ui/StatsPanel/StatsPanel';
import { TradeTable } from '../../widgets/trade-table/ui/TradeTable/TradeTable';
import { CreateTradeForm } from '../../features/create-trade/ui/CreateTradeForm/CreateTradeForm';
import { Modal } from '../../shared/ui/Modal/Modal';
import './JournalDetailPage.css';
import { Lightbox } from '../../shared/ui/Lightbox/Lightbox';

export function JournalDetailPage() {
  const { journalId } = useParams<{ journalId: string }>();
  const navigate = useNavigate();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // ⚠️ Состояния для лайтбокса
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);


  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);

  const { data: journal, isLoading: journalLoading } = useJournal(journalId!);
  const { data: trades, isLoading: tradesLoading } = useTrades(journalId!);
  const { data: stats, isLoading: statsLoading } = useJournalStats(journalId!);
  
  const createTrade = useCreateTrade();
  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();

  // ⚠️ Функция открытия лайтбокса из таблицы
  const handleOpenLightbox = (images: string[], initialIndex: number) => {
    setLightboxImages(images);
    setLightboxInitialIndex(initialIndex);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setLightboxInitialIndex(0);
  };
  // ⚠️ Функция открытия лайтбокса из модального окна просмотра
  const openLightboxFromModal = (imageIndex: number) => {
    if (!viewingTrade?.screenshot_paths) return;
    
    const images = viewingTrade.screenshot_paths.map(
      (path) => `http://localhost:8000/uploads/${path}`
    );
    
    handleOpenLightbox(images, imageIndex);
  };

  const handleCreateTrade = (data: TradeCreate) => {
    createTrade.mutate(data, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleUpdateTrade = (data: TradeUpdate) => {
    if (!editingTrade) return;
    
    updateTrade.mutate(
      { id: editingTrade.id, data },
      {
        onSuccess: () => setEditingTrade(null),
      }
    );
  };

  const handleDeleteTrade = (tradeId: string) => {
    if (confirm('Удалить эту сделку?')) {
      deleteTrade.mutate(tradeId);
    }
  };

  if (journalLoading) {
    return <div className="journal-detail__loader">Загрузка...</div>;
  }

  if (!journal) {
    return (
      <div className="journal-detail__not-found">
        <h2>Журнал не найден</h2>
        <Button onClick={() => navigate('/')}>Вернуться к списку</Button>
      </div>
    );
  }

    // function openLightbox(index: number): void {
    //     throw new Error('Function not implemented.');
    // }

  return (
    <div className="journal-detail">
      <header className="journal-detail__header">
        <Button variant="ghost" onClick={() => navigate('/')}>← Назад</Button>
        <div className="journal-detail__title-block">
          <h1 className="journal-detail__title">{journal.name}</h1>
          {journal.description && (
            <p className="journal-detail__description">{journal.description}</p>
          )}
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Новая сделка
        </Button>
      </header>

      <main className="journal-detail__content">
        {/* Статистика */}
        <StatsPanel stats={stats!} isLoading={statsLoading} />

        {/* Таблица сделок */}
        <section className="journal-detail__trades">
          <h2 className="journal-detail__section-title">Сделки</h2>
          <TradeTable
            trades={trades || []}
            isLoading={tradesLoading}
            onEdit={(trade) => setEditingTrade(trade)}
            onDelete={handleDeleteTrade}
            onView={(trade) => setViewingTrade(trade)}
          />
        </section>
      </main>

      {/* Модальное окно создания/редактирования */}
      <CreateTradeForm
        isOpen={isCreateModalOpen || !!editingTrade}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTrade(null);
        }}
        onSubmit={editingTrade ? handleUpdateTrade : handleCreateTrade}
        journalId={journalId!}
        initialData={editingTrade || undefined}
        isEditing={!!editingTrade}
        isLoading={createTrade.isPending || updateTrade.isPending}
      />

      {/* Модальное окно просмотра */}
      {viewingTrade && (
        <Modal
          isOpen={!!viewingTrade}
          onClose={() => setViewingTrade(null)}
          title={`Сделка: ${viewingTrade.symbol}`}
          size="lg"
        >
          <div className="trade-detail">
                {/* ⚠️ Галерея скриншотов */}
                {viewingTrade.screenshot_paths && viewingTrade.screenshot_paths.length > 0 && (
                    <div className="trade-detail__gallery">
                    <h3>Скриншоты ({viewingTrade.screenshot_paths.length})</h3>
                    <div className="trade-detail__gallery-grid">
                    {viewingTrade.screenshot_paths.map((path, index) => (
                    <div
                        key={index}
                        className="trade-detail__gallery-item"
                        onClick={() => openLightboxFromModal(index)}
                    >
                    <img
                        src={`http://localhost:8000/uploads/${path}`}
                        alt={`Screenshot ${index + 1}`}
                    />
                    </div>
                    ))}
                    </div>
                    </div>
                )}

            <div className="trade-detail__grid">
              <div>
                <strong>Сторона:</strong> {viewingTrade.side.toUpperCase()}
              </div>
              <div>
                <strong>Статус:</strong> {viewingTrade.status}
              </div>
              <div>
                <strong>Вход:</strong> {viewingTrade.entry_price}
              </div>
              <div>
                <strong>Выход:</strong> {viewingTrade.exit_price || '—'}
              </div>
              <div>
                <strong>Объем:</strong> ${viewingTrade.position_size_usdt}
              </div>
              <div>
                <strong>P&L:</strong> 
                <span className={viewingTrade.pnl_usdt >= 0 ? 'text-profit' : 'text-loss'}>
                  {' '}{viewingTrade.pnl_usdt} USDT ({viewingTrade.pnl_percent}%)
                </span>
              </div>
            </div>
            
            {viewingTrade.description && (
              <div className="trade-detail__section">
                <h3>Описание</h3>
                <p>{viewingTrade.description}</p>
              </div>
            )}
            
            {viewingTrade.entry_criteria.length > 0 && (
              <div className="trade-detail__section">
                <h3>Критерии входа</h3>
                <ul className="trade-detail__criteria">
                  {viewingTrade.entry_criteria.map((c, i) => (
                    <li key={i}>
                      <strong>{c.name}</strong> — {c.score}/10
                      {c.comment && <span className="text-secondary"> ({c.comment})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {viewingTrade.emotional_state && (
              <div className="trade-detail__section">
                <h3>Эмоциональное состояние</h3>
                <p>{viewingTrade.emotional_state}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
      {/* ⚠️ ЛАЙТБОКС (один для всей страницы) */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxInitialIndex}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
      />
    </div>
  );
}