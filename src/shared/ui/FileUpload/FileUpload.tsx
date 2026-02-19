import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  onFilesRemove: (filesToRemove: string[]) => void;  // Для удаления существующих
  accept?: string;
  maxSize?: number;
  existingFiles?: string[];  // Пути к существующим файлам
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelect,
  onFilesRemove,
  accept = 'image/png,image/jpeg,image/webp,image/gif',
  maxSize = 5,
  existingFiles = [],
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const validateFile = (file: File): boolean => {
    const validTypes = accept.split(',').map(t => t.trim());
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      setError(`Недопустимый формат. Разрешены: PNG, JPG, WEBP`);
      return false;
    }
    
    const sizeInMB = file.size / 1024 / 1024;
    if (sizeInMB > maxSize) {
      setError(`Файл слишком большой. Максимум: ${maxSize} MB`);
      return false;
    }
    
    setError('');
    return true;
  };

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      if (validateFile(files[i])) {
        validFiles.push(files[i]);
      }
    }
    
    if (validFiles.length > 0) {
      setNewFiles(prev => [...prev, ...validFiles]);
      onFilesSelect([...newFiles, ...validFiles]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFiles(files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFiles(files);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const removeNewFile = (index: number) => {
    const updated = newFiles.filter((_, i) => i !== index);
    setNewFiles(updated);
    onFilesSelect(updated);
  };

  const removeExistingFile = (filePath: string) => {
    onFilesRemove([filePath]);
  };

  return (
    <div className="file-upload">
      <div
        className={`file-upload__area ${isDragging ? 'file-upload__area--dragging' : ''} ${disabled ? 'file-upload__area--disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="file-upload__placeholder">
          <svg className="file-upload__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <p className="file-upload__text">
            Перетащите скриншоты сюда или <span className="file-upload__link">выберите файлы</span>
          </p>
          <p className="file-upload__hint">PNG, JPG, WEBP до {maxSize} MB каждый</p>
        </div>
        
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="file-upload__input"
          disabled={disabled}
          multiple  // ⚠️ Разрешаем множественный выбор
        />
      </div>
      
      {/* Галерея новых файлов */}
      {newFiles.length > 0 && (
        <div className="file-upload__gallery file-upload__gallery--new">
          <p className="file-upload__gallery-title">Новые файлы ({newFiles.length})</p>
          <div className="file-upload__thumbnails">
            {newFiles.map((file, index) => (
              <div key={index} className="file-upload__thumbnail">
                <img src={URL.createObjectURL(file)} alt={file.name} />
                <button
                  type="button"
                  className="file-upload__thumbnail-remove"
                  onClick={() => removeNewFile(index)}
                  disabled={disabled}
                >
                  ×
                </button>
                <span className="file-upload__thumbnail-name">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Галерея существующих файлов */}
      {existingFiles.length > 0 && (
        <div className="file-upload__gallery file-upload__gallery--existing">
          <p className="file-upload__gallery-title">Существующие скриншоты ({existingFiles.length})</p>
          <div className="file-upload__thumbnails">
            {existingFiles.map((filePath, index) => (
              <div key={index} className="file-upload__thumbnail">
                <img 
                  src={`http://localhost:8000/uploads/${filePath}`} 
                  alt={`Screenshot ${index + 1}`} 
                />
                <button
                  type="button"
                  className="file-upload__thumbnail-remove"
                  onClick={() => removeExistingFile(filePath)}
                  disabled={disabled}
                >
                  ×
                </button>
                <span className="file-upload__thumbnail-name">{filePath.split('/').pop()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && <p className="file-upload__error">{error}</p>}
    </div>
  );
}