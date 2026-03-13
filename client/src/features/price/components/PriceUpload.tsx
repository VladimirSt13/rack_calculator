import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';

export interface PriceUploadProps {
  onFileSelected: (file: File) => void;
  onError: (error: string) => void;
}

/**
 * PriceUpload - компонент для завантаження Excel файлу з прайсом
 */
export const PriceUpload: React.FC<PriceUploadProps> = ({ onFileSelected, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Обробка drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Обробка drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Обробка вибору файлу
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  // Перевірка та обробка файлу
  const handleFile = (file: File) => {
    // Перевірка типу файлу
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type)) {
      onError('Будь ласка, завантажте файл Excel (.xlsx або .xls)');
      return;
    }

    // Перевірка розміру (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('Розмір файлу не повинен перевищувати 10MB');
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  // Видалення файлу
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileSpreadsheet className='w-5 h-5 text-green-600' />
          Завантажити прайс-лист
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <form
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type='file'
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
              accept='.xlsx,.xls'
              onChange={handleChange}
              disabled={false}
            />

            <div className='flex flex-col items-center gap-4'>
              <div className='p-4 bg-primary/10 rounded-full'>
                <Upload className='w-8 h-8 text-primary' />
              </div>

              <div>
                <p className='text-lg font-medium'>Перетягніть файл Excel сюди</p>
                <p className='text-sm text-muted-foreground mt-1'>або натисніть для вибору файлу</p>
              </div>

              <div className='text-xs text-muted-foreground'>
                <p>Підтримувані формати: .xlsx, .xls</p>
                <p>Максимальний розмір: 10MB</p>
              </div>

              <Button type='button' variant='outline' className='mt-2'>
                Обрати файл
              </Button>
            </div>
          </form>
        ) : (
          <div className='flex items-center justify-between p-4 bg-muted/50 rounded-lg border'>
            <div className='flex items-center gap-3'>
              <FileSpreadsheet className='w-8 h-8 text-green-600' />
              <div>
                <p className='font-medium'>{selectedFile.name}</p>
                <p className='text-sm text-muted-foreground'>{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>

            <Button type='button' variant='outline' size='sm' onClick={handleRemoveFile}>
              <X className='w-4 h-4' />
            </Button>
          </div>
        )}

        {/* Інструкція */}
        <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
          <h4 className='font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2'>Як заповнити прайс:</h4>
          <ol className='list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200'>
            <li>Завантажте шаблон Excel файлу</li>
            <li>Заповніть 6 стовпчиків: Код, Назва, Ціна без ПДВ, Категорія, Вага, Опис</li>
            <li>Вкажіть категорію для кожної позиції (supports, spans, vertical_supports, diagonal_brace, isolator)</li>
            <li>Для опор вкажіть назву: "Опора крайня" або "Проміжна опора" (код має співпадати)</li>
            <li>Збережіть файл та завантажте його тут</li>
          </ol>
          <p className='text-xs text-blue-700 dark:text-blue-300 mt-2'>
            💡 Експортований файл можна редагувати і завантажувати назад!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceUpload;
