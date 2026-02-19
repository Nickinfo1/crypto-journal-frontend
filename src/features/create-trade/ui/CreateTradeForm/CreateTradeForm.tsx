import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { type TradeCreate, type EntryCriterion, type Trade } from '../../../../entities/trade/types';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import './CreateTradeForm.css';

import { FileUpload } from '../../../../shared/ui/FileUpload/FileUpload';
import { apiClient } from '../../../../shared/api/axios';

interface CreateTradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TradeCreate) => void;
  journalId: string;
  initialData?: Trade;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function CreateTradeForm({
  isOpen,
  onClose,
  onSubmit,
  journalId,
  initialData,
  isEditing = false,
  isLoading = false,
}: CreateTradeFormProps) {
      // ⚠️ Обновленные состояния для галереи
  const [newScreenshotFiles, setNewScreenshotFiles] = useState<File[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(
    initialData?.screenshot_paths || []
  );
  const [screenshotsToDelete, setScreenshotsToDelete] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [criteria, setCriteria] = useState<EntryCriterion[]>(
    initialData?.entry_criteria || [{ name: '', score: 5, comment: '' }]
  );

    // ⚠️ БЛОКИРОВКА ПОВТОРНОЙ ОТПРАВКИ
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TradeCreate>({
    defaultValues: {
      journal_id: journalId,
      symbol: initialData?.symbol || '',
      side: initialData?.side || 'long',
      status: initialData?.status || 'open',
      entry_price: initialData?.entry_price || 0,
      exit_price: initialData?.exit_price || undefined,
      position_size_usdt: initialData?.position_size_usdt || 0,
      leverage: initialData?.leverage || 1,
      stop_loss_price: initialData?.stop_loss_price || undefined,
      take_profit_price: initialData?.take_profit_price || undefined,
      fee_usdt: initialData?.fee_usdt || 0,
      description: initialData?.description || '',
      emotional_state: initialData?.emotional_state || '',
      opened_at: initialData?.opened_at || new Date().toISOString().slice(0, 16),
      closed_at: initialData?.closed_at || undefined,
      entry_criteria: criteria,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const side = watch('side');
  const status = watch('status');
  const entryPrice = watch('entry_price');
  const exitPrice = watch('exit_price');
  const positionSize = watch('position_size_usdt');
  const leverage = watch('leverage');

  // ⚠️ Обработчики для галереи
  const handleScreenshotsSelect = (files: File[]) => {
    setNewScreenshotFiles(files);
  };

  const handleScreenshotsRemove = (filesToRemove: string[]) => {
    // Это существующие файлы для удаления
    setExistingScreenshots(prev => prev.filter(p => !filesToRemove.includes(p)));
    setScreenshotsToDelete(prev => [...prev, ...filesToRemove]);
  };

  // Автоматический расчет P&L для превью
  const calculatePnlPreview = () => {
    if (!entryPrice || !exitPrice || !positionSize) return { pnl: 0, percent: 0 };
    
    const priceChange = side === 'long' 
      ? (exitPrice - entryPrice) / entryPrice 
      : (entryPrice - exitPrice) / entryPrice;
    
    const pnl = priceChange * positionSize * leverage;
    const percent = (pnl / positionSize) * 100;
    
    return { pnl: pnl.toFixed(2), percent: percent.toFixed(2) };
  };

  const pnlPreview = calculatePnlPreview();

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', score: 5, comment: '' }]);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, field: keyof EntryCriterion, value: string | number) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setCriteria(newCriteria);
  };

  // ⚠️ Обновленная отправка формы
  const onFormSubmit = async (data: TradeCreate) => {
    // ⚠️ ЗАЩИТА ОТ ДУБЛИРОВАНИЯ
    if (isSubmitting) {
      console.log("⚠️ Предыдущая отправка ещё не завершена!");
      return;
    }

    setIsUploading(true);

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // ⚠️ ЛОГИРОВАНИЕ перед отправкой
      console.log("=" .repeat(80));
      console.log("📤 ОТПРАВКА ДАННЫХ НА СЕРВЕР:");
      console.log("   journalId:", journalId);
      console.log("   symbol:", data.symbol);
      console.log("   side:", data.side);
      console.log("   status:", data.status);
      console.log("   opened_at:", data.opened_at);
      console.log("   entry_price:", data.entry_price);
      console.log("   position_size_usdt:", data.position_size_usdt);
      console.log("   screenshots:", newScreenshotFiles.length);
      console.log("=" .repeat(80));
      
      // ... код до отправки

      // ⚠️ ИСПРАВЛЕННАЯ ОТПРАВКА (без Content-Type)
      // if (isEditing && initialData) {
      //   formData.append('screenshots_to_delete', JSON.stringify(screenshotsToDelete));
        
      //   console.log("🔄 PUT запрос...");
      //   const response = await apiClient.put(`/trades/${initialData.id}`, formData, {
      //     // ⚠️ УБРАЛИ заголовок Content-Type!
      //     // Браузер сам добавит "multipart/form-data; boundary=----WebKitFormBoundary..."
      //     headers: {
      //       'Accept': 'application/json',
      //     },
      //   });
      //   console.log("✅ Ответ сервера:", response.data);
      // } else {
      //   console.log("📝 POST запрос...");
      //   const response = await apiClient.post('/trades', formData, {
      //     // ⚠️ УБРАЛИ заголовок Content-Type!
      //     headers: {
      //       'Accept': 'application/json',
      //     },
      //   });
      //   console.log("✅ Ответ сервера:", response.data);
      // }

      // ... остальной код

    

      // Добавляем все текстовые поля
      formData.append('journal_id', journalId);
      formData.append('symbol', data.symbol);
      formData.append('side', data.side);
      formData.append('status', data.status);
      formData.append('opened_at', new Date(data.opened_at).toISOString());
      formData.append('entry_price', data.entry_price.toString());
      formData.append('position_size_usdt', data.position_size_usdt.toString());
      formData.append('leverage', data.leverage.toString());
      formData.append('fee_usdt', data.fee_usdt.toString());
      formData.append('entry_criteria', JSON.stringify(data.entry_criteria));
      
      if (data.closed_at) {
        formData.append('closed_at', new Date(data.closed_at).toISOString());
      }
      if (data.exit_price) {
        formData.append('exit_price', data.exit_price.toString());
      }
      if (data.stop_loss_price) {
        formData.append('stop_loss_price', data.stop_loss_price.toString());
      }
      if (data.take_profit_price) {
        formData.append('take_profit_price', data.take_profit_price.toString());
      }
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.emotional_state) {
        formData.append('emotional_state', data.emotional_state);
      }
      
      // ⚠️ Добавляем новые скриншоты
      newScreenshotFiles.forEach(file => {
        formData.append('screenshots', file);
      });
      
      // ⚠️ Добавляем список для удаления (только для редактирования)
      if (isEditing) {
        formData.append('screenshots_to_delete', JSON.stringify(screenshotsToDelete));
      }

      // ⚠️ ЛОГИРОВАНИЕ FormData
      console.log("📋 FormData содержимое:");
      for (let [key, value] of formData.entries()) {
        if (key === 'screenshots') {
          console.log(`   ${key}: [File]`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      }
      console.log(`📊 Всего полей в FormData: ${Array.from(formData.entries()).length}`);
      console.log("=" .repeat(80));

      // ⚠️ ПРОВЕРКА ПЕРЕД ОТПРАВКОЙ
      const entries = Array.from(formData.entries());
      console.log("📊 FormData проверка:");
      console.log("   Количество полей:", entries.length);
      console.log("   Поля:", entries.map(([key]) => key));

      if (entries.length === 0) {
        console.error("❌ FormData ПУСТОЙ! Проверьте форму.");
        return;
      }

      // Проверка файлов
      const files = newScreenshotFiles;
      console.log("📎 Файлы:", files.length);
      files.forEach(f => {
        console.log(`   - ${f.name} (${f.size} bytes, ${f.type})`);
      });

      // Отправка
      if (isEditing && initialData) {
        await apiClient.put(`/trades/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await apiClient.post('/trades', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      // Очистка
      setNewScreenshotFiles([]);
      setExistingScreenshots([]);
      setScreenshotsToDelete([]);
      onSubmit(data);
      onClose();
      
    } catch (error) {
      console.error('Ошибка при сохранении сделки:', error);
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    setValue('entry_criteria', criteria);
  }, [criteria, setValue]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Редактировать сделку' : 'Новая сделка'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="trade-form">
        <div className="trade-form__grid">
          {/* Символ и Сторона */}
          <div className="trade-form__row">
            <Input
              label="Символ"
              placeholder="ETHUSDT"
              {...register('symbol', { required: 'Обязательно' })}
              error={errors.symbol?.message}
            />
            
            <div className="trade-form__field">
              <label className="input__label">Сторона</label>
              <div className="trade-form__toggle">
                <button
                  type="button"
                  className={`toggle-btn ${side === 'long' ? 'toggle-btn--active toggle-btn--long' : ''}`}
                  onClick={() => setValue('side', 'long')}
                >
                  Long
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${side === 'short' ? 'toggle-btn--active toggle-btn--short' : ''}`}
                  onClick={() => setValue('side', 'short')}
                >
                  Short
                </button>
              </div>
            </div>
          </div>

          {/* Цены */}
          <div className="trade-form__row">
            <Input
              label="Цена входа"
              type="number"
              step="0.00000001"
              {...register('entry_price', { required: 'Обязательно', min: 0.00000001 })}
              error={errors.entry_price?.message}
            />
            
            <Input
              label="Цена выхода"
              type="number"
              step="0.00000001"
              disabled={status !== 'closed'}
              {...register('exit_price', { required: status === 'closed' ? 'Обязательно' : false })}
              error={errors.exit_price?.message}
            />
          </div>

          {/* Объем и Плечо */}
          <div className="trade-form__row">
            <Input
              label="Объем (USDT)"
              type="number"
              step="0.01"
              {...register('position_size_usdt', { required: 'Обязательно', min: 0.01 })}
              error={errors.position_size_usdt?.message}
            />
            
            <Input
              label="Плечо"
              type="number"
              step="0.1"
              min="1"
              {...register('leverage')}
            />
          </div>

          {/* Риск-менеджмент */}
          <div className="trade-form__row">
            <Input
              label="Stop-Loss"
              type="number"
              step="0.00000001"
              {...register('stop_loss_price')}
            />
            
            <Input
              label="Take-Profit"
              type="number"
              step="0.00000001"
              {...register('take_profit_price')}
            />
          </div>

          {/* Статус и Даты */}
          <div className="trade-form__row">
            <div className="trade-form__field">
              <label className="input__label">Статус</label>
              <select
                className="input"
                {...register('status')}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            
            <Input
              label="Дата открытия"
              type="datetime-local"
              {...register('opened_at', { required: 'Обязательно' })}
              error={errors.opened_at?.message}
            />
            
            {status === 'closed' && (
              <Input
                label="Дата закрытия"
                type="datetime-local"
                {...register('closed_at')}
              />
            )}
          </div>

          {/* Превью P&L */}
          {status === 'closed' && exitPrice && (
            <div className={`trade-form__pnl-preview ${Number(pnlPreview.pnl) >= 0 ? 'text-profit' : 'text-loss'}`}>
              <span>P&L: {pnlPreview.pnl} USDT ({pnlPreview.percent}%)</span>
            </div>
          )}

          {/* Комиссия */}
          <Input
            label="Комиссия (USDT)"
            type="number"
            step="0.01"
            {...register('fee_usdt')}
          />

          {/* Психология */}
          <div className="trade-form__row">
            <Input
              label="Эмоциональное состояние"
              placeholder="Calm, FOMO, Revenge..."
              {...register('emotional_state')}
            />
          </div>

          {/* Описание */}
          <div className="trade-form__field">
            <label className="input__label">Описание сделки</label>
            <textarea
              className="input trade-form__textarea"
              rows={4}
              {...register('description')}
              placeholder="Опишите логику входа, управление позицией..."
            />
          </div>

          {/* Критерии входа */}
          <div className="trade-form__field">
            <div className="trade-form__criteria-header">
              <label className="input__label">Критерии входа</label>
              <Button type="button" variant="secondary" size="sm" onClick={addCriterion}>
                + Добавить
              </Button>
            </div>
            
            <div className="trade-form__criteria-list">
              {criteria.map((criterion, index) => (
                <div key={index} className="trade-form__criteria-row">
                  <Input
                    placeholder="Название критерия"
                    value={criterion.name}
                    onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                  />
                  <select
                    className="input"
                    value={criterion.score}
                    onChange={(e) => updateCriterion(index, 'score', Number(e.target.value))}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}/10</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Комментарий"
                    value={criterion.comment || ''}
                    onChange={(e) => updateCriterion(index, 'comment', e.target.value)}
                  />
                  {criteria.length > 1 && (
                    <button
                      type="button"
                      className="trade-form__remove-btn"
                      onClick={() => removeCriterion(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* ⚠️ Поле для галереи скриншотов */}
        <div className="trade-form__field">
          <label className="input__label">Скриншоты графика</label>
          <FileUpload
            onFilesSelect={handleScreenshotsSelect}
            onFilesRemove={handleScreenshotsRemove}
            existingFiles={existingScreenshots}
            disabled={isUploading}
            maxSize={5}
          />
          <p className="trade-form__hint">
            Можно загрузить несколько изображений. Максимум 5 MB каждое.
          </p>
        </div>

        {/* Actions */}
        <div className="trade-form__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}