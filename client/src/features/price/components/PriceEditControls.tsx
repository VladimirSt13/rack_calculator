import React from "react";
import { Button } from "@/shared/components/Button";
import { Edit, Save, X, FileDown, Download } from "lucide-react";

interface PriceEditControlsProps {
  isEditing: boolean;
  isLoading?: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDownloadTemplate: () => void;
  onDownloadPrice: () => void;
}

/**
 * PriceEditControls - кнопки управління редагуванням прайсу
 */
export const PriceEditControls: React.FC<PriceEditControlsProps> = ({
  isEditing,
  isLoading = false,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDownloadTemplate,
  onDownloadPrice,
}) => {
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onSaveEdit}
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Збереження..." : "Зберегти"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancelEdit}
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-2" />
          Скасувати
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onStartEdit}>
        <Edit className="w-4 h-4 mr-2" />
        Редагувати прайс
      </Button>
      <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
        <FileDown className="w-4 h-4 mr-2" />
        Шаблон CSV
      </Button>
      <Button variant="outline" size="sm" onClick={onDownloadPrice}>
        <Download className="w-4 h-4 mr-2" />
        Excel
      </Button>
    </div>
  );
};

export default PriceEditControls;
