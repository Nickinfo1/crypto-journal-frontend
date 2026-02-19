import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournals, useCreateJournal, useDeleteJournal } from '../../entities/journal/hooks/useJournals';
import { Button } from '../../shared/ui/Button/Button';
import { Input } from '../../shared/ui/Input/Input';
import { Modal } from '../../shared/ui/Modal/Modal';
import './JournalsListPage.css';

export function JournalsListPage() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [newJournalDescription, setNewJournalDescription] = useState('');

  const { data: journals, isLoading } = useJournals();
  const createJournal = useCreateJournal();
  const deleteJournal = useDeleteJournal();

  const handleCreate = () => {
    if (!newJournalName.trim()) return;
    
    createJournal.mutate(
      { name: newJournalName, description: newJournalDescription },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setNewJournalName('');
          setNewJournalDescription('');
        },
      }
    );
  };

  const handleDelete = (journalId: string) => {
    if (confirm('Вы уверены? Все сделки будут удалены.')) {
      deleteJournal.mutate(journalId);
    }
  };

  return (
    <div className="journals-page">
      <header className="journals-page__header">
        <h1 className="journals-page__title">Журналы трейдера</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Новый журнал
        </Button>
      </header>

      {isLoading ? (
        <div className="journals-page__loader">Загрузка...</div>
      ) : (
        <div className="journals-page__grid">
          {journals?.map((journal) => (
            <div key={journal.id} className="journals-page__card">
              <div className="journals-page__card-header">
                <h3 className="journals-page__card-title">{journal.name}</h3>
                <div className="journals-page__card-actions">
                  <button
                    className="journals-page__edit-btn"
                    onClick={() => navigate(`/journal/${journal.id}`)}
                  >
                    Открыть
                  </button>
                  <button
                    className="journals-page__delete-btn"
                    onClick={() => handleDelete(journal.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
              
              {journal.description && (
                <p className="journals-page__card-description">{journal.description}</p>
              )}
              
              <div className="journals-page__card-stats">
                <span className="journals-page__stat">
                  📊 {journal.trades_count || 0} сделок
                </span>
              </div>
            </div>
          ))}

          {journals?.length === 0 && (
            <div className="journals-page__empty">
              <p>Нет журналов. Создайте первый!</p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Создать журнал"
        size="sm"
      >
        <div className="journals-page__form">
          <Input
            label="Название"
            value={newJournalName}
            onChange={(e) => setNewJournalName(e.target.value)}
            placeholder="Например: BTC Scalping"
          />
          <Input
            label="Описание"
            value={newJournalDescription}
            onChange={(e) => setNewJournalDescription(e.target.value)}
            placeholder="Описание стратегии..."
          />
          <div className="journals-page__form-actions">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleCreate} 
              loading={createJournal.isPending}
              disabled={!newJournalName.trim()}
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}