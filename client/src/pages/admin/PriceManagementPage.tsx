import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileDown, AlertCircle, Download, Edit, Save, X } from "lucide-react";
import { AdminLayout } from "@/shared/layout/AdminLayout";
import { priceApi } from "@/features/price/priceApi";
import api from "@/lib/axios";
import type { ParsedPriceData } from "@/features/price/types/price.types";
import PriceUpload from "@/features/price/components/PriceUpload";
import PricePreview from "@/features/price/components/PricePreview";
import PriceHistory from "@/features/price/components/PriceHistory";
import PriceTable from "@/features/price/components/PriceTableExcel";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

/**
 * PriceManagementPage - сторінка управління прайсом
 */
export const PriceManagementPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Стани
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "parsing" | "preview" | "uploading"
  >("idle");
  const [parsedData, setParsedData] = useState<ParsedPriceData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Отримання поточного прайсу
  const { data: currentPrice, isLoading: isLoadingPrice } = useQuery({
    queryKey: ["price", "current"],
    queryFn: priceApi.getCurrent,
  });

  // Отримання історії змін
  const { data: priceHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["price", "history"],
    queryFn: priceApi.getHistory,
  });

  // Мутація для завантаження нового прайсу
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadStatus("uploading");
      return await priceApi.uploadExcel(file);
    },
    onSuccess: () => {
      toast.success("Прайс успішно оновлено!");
      queryClient.invalidateQueries({ queryKey: ["price"] });
      setUploadStatus("idle");
      setParsedData(null);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Помилка завантаження прайсу");
      setUploadStatus("idle");
    },
  });

  // Мутація для відновлення версії
  const restoreMutation = useMutation({
    mutationFn: async (versionId: number) => {
      return await priceApi.restoreVersion(versionId);
    },
    onSuccess: () => {
      toast.success("Версію прайсу відновлено!");
      queryClient.invalidateQueries({ queryKey: ["price"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Помилка відновлення версії");
    },
  });

  // Мутація для оновлення прайсу
  const updateMutation = useMutation({
    mutationFn: async (priceData: any) => {
      return await priceApi.updatePrice(priceData);
    },
    onSuccess: () => {
      toast.success("Прайс оновлено!");
      queryClient.invalidateQueries({ queryKey: ["price"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Помилка оновлення прайсу");
    },
  });

  // Почати редагування
  const handleStartEdit = () => {
    setIsEditing(true);
    toast.info(
      'Режим редагування увімкнено. Змініть ціни та натисніть "Зберегти".',
    );
  };

  // Скасувати редагування
  const handleCancelEdit = () => {
    setIsEditing(false);
    toast.info("Редагування скасовано.");
  };

  // Зберегти зміни
  const handleSaveEdit = () => {
    if (currentPrice) {
      updateMutation.mutate(currentPrice.data);
    }
  };

  // Обробка вибору файлу
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    parseExcelFile(file);
  };

  // Парсинг Excel файлу (імітація - реальний парсинг на сервері)
  const parseExcelFile = async (file: File) => {
    setUploadStatus("parsing");

    try {
      // Створюємо FormData для відправки на сервер
      const formData = new FormData();
      formData.append("file", file);

      // Логування для відладки
      console.log("[Parse Excel] File:", file.name, file.size, file.type);
      console.log("[Parse Excel] FormData entries:", [...formData.entries()]);

      // Відправляємо через axios (interceptor додасть Authorization)
      // Content-Type буде встановлено автоматично для FormData (multipart/form-data з boundary)
      const { data } = await api.post("/price/parse-excel", formData);

      setParsedData(data);
      setUploadStatus("preview");
    } catch (error: any) {
      console.error("[Parse Excel Error]", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Помилка парсингу файлу",
      );
      setUploadStatus("idle");
    }
  };

  // Підтвердження завантаження
  const handleConfirm = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  // Скасування
  const handleCancel = () => {
    setUploadStatus("idle");
    setParsedData(null);
    setSelectedFile(null);
  };

  // Перегляд деталей версії
  const handleViewDetails = async (versionId: number) => {
    try {
      await priceApi.getVersion(versionId);
      toast.info(`Версія #${versionId} завантажена`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Помилка завантаження версії");
    }
  };

  // Відновлення версії
  const handleRestore = (versionId: number) => {
    if (window.confirm("Ви впевнені, що хочете відновити цю версію прайсу?")) {
      restoreMutation.mutate(versionId);
    }
  };

  // Завантаження шаблону
  const handleDownloadTemplate = () => {
    // Створюємо CSV з UTF-8 BOM для правильної кодировки
    // Формат: Код;Назва;Ціна без ПДВ;Категорія;Вага;Опис
    const template = `Код;Назва;Ціна без ПДВ;Категорія;Вага;Опис
215;Опора крайня;560;supports;2.5;Крайня опора 1-рядного стелажа
215;Проміжна опора;700;supports;3.0;Проміжна опора 1-рядного стелажа
290;Опора крайня;700;supports;3.0;Крайня опора 1-рядного стелажа
290;Проміжна опора;900;supports;4.0;Проміжна опора 1-рядного стелажа
600;Траверса h/c-профіль;450;spans;1.2;Балка для стелажа
750;Траверса h/c-профіль;570;spans;1.5;Балка для стелажа
621;Вертикальна опора;570;vertical_supports;3.0;Вертикальна стійка
34000;Розкос;340;diagonal_brace;0.8;Діагональний зв'язок
100;Ізолятор ІП-1;100;isolator;0.1;Ізоляційний елемент`;

    // Додаємо BOM для UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + template], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "price_template.csv";
    link.click();
  };

  // Скачування поточного прайсу
  const handleDownloadPrice = async () => {
    try {
      await priceApi.downloadExcel();
      toast.success("Прайс завантажено");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Помилка завантаження прайсу");
    }
  };

  // Оновлення позиції в прайсі
  const handleUpdatePrice = (category: string, code: string, updates: any) => {
    if (currentPrice) {
      const categoryData =
        currentPrice.data[category as keyof typeof currentPrice.data];

      // Для опор: витягуємо базовий код (215-edge -> 215)
      let itemKey = code;
      let subKey = null;

      if (category === "supports" && code.includes("-")) {
        const parts = code.split("-");
        itemKey = parts[0];
        subKey = parts[1]; // 'edge' або 'intermediate'
      }

      const item = categoryData[itemKey as keyof typeof categoryData];

      // Глибоке копіювання поточного елемента
      const updatedItem = JSON.parse(JSON.stringify(item));

      // Застосовуємо оновлення для всіх полів
      // Для опор не дозволяємо змінювати код батьківського елемента
      if (updates.code !== undefined && !(category === "supports" && !subKey)) {
        // Якщо змінюється код, потрібно перемістити елемент
        if (updates.code !== itemKey) {
          delete categoryData[itemKey as keyof typeof categoryData];
          const newCode = updates.code;
          updatedItem.code = newCode;
          categoryData[newCode as keyof typeof categoryData] = updatedItem;
        }
      }
      // Для опор оновлюємо загальну назву тільки якщо це не subKey (edge/intermediate)
      if (updates.name !== undefined && !subKey) {
        updatedItem.name = updates.name;
      }
      if (updates.name !== undefined && subKey && updatedItem[subKey]) {
        // Оновлюємо name в edge/intermediate
        updatedItem[subKey].name = updates.name;
      }
      // Оновлюємо тільки конкретне поле edge.price
      if (updates.edge?.price !== undefined && updatedItem.edge) {
        updatedItem.edge.price = updates.edge.price;
      }
      // Оновлюємо тільки конкретне поле edge.weight
      if (updates.edge?.weight !== undefined && updatedItem.edge) {
        updatedItem.edge.weight = updates.edge.weight;
      }
      // Оновлюємо тільки конкретне поле edge.name
      if (updates.edge?.name !== undefined && updatedItem.edge) {
        updatedItem.edge.name = updates.edge.name;
      }
      // Оновлюємо тільки конкретне поле edge.description
      if (updates.edge?.description !== undefined && updatedItem.edge) {
        updatedItem.edge.description = updates.edge.description;
      }
      // Оновлюємо тільки конкретне поле intermediate.price
      if (
        updates.intermediate?.price !== undefined &&
        updatedItem.intermediate
      ) {
        updatedItem.intermediate.price = updates.intermediate.price;
      }
      // Оновлюємо тільки конкретне поле intermediate.weight
      if (
        updates.intermediate?.weight !== undefined &&
        updatedItem.intermediate
      ) {
        updatedItem.intermediate.weight = updates.intermediate.weight;
      }
      // Оновлюємо тільки конкретне поле intermediate.name
      if (
        updates.intermediate?.name !== undefined &&
        updatedItem.intermediate
      ) {
        updatedItem.intermediate.name = updates.intermediate.name;
      }
      // Оновлюємо тільки конкретне поле intermediate.description
      if (
        updates.intermediate?.description !== undefined &&
        updatedItem.intermediate
      ) {
        updatedItem.intermediate.description = updates.intermediate.description;
      }
      if (updates.price !== undefined) {
        // Для опор оновлюємо ціну в edge/intermediate
        if (subKey && updatedItem[subKey]) {
          updatedItem[subKey].price = updates.price;
        } else {
          updatedItem.price = updates.price;
        }
      }
      if (updates.weight !== undefined) {
        // Для опор оновлюємо вагу в edge/intermediate
        if (subKey && updatedItem[subKey]) {
          updatedItem[subKey].weight = updates.weight;
        } else {
          updatedItem.weight = updates.weight;
        }
      }
      if (updates.description !== undefined) {
        // Для опор оновлюємо опис в edge/intermediate
        if (subKey && updatedItem[subKey]) {
          updatedItem[subKey].description = updates.description;
        } else {
          updatedItem.description = updates.description;
        }
      }

      const updatedData = {
        ...currentPrice.data,
        [category]: {
          ...categoryData,
          [itemKey]: updatedItem,
        },
      };

      updateMutation.mutate(updatedData);
    }
  };

  return (
    <AdminLayout
      title="Управління прайсом"
      description="Завантаження та оновлення прайс-листу"
    >
      <div className="space-y-6">
        {/* Поточний прайс */}
        <Card>
          <CardHeader>
            <CardTitle>Поточний прайс</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPrice ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : currentPrice ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Оновлено:{" "}
                      {new Date(currentPrice.updatedAt).toLocaleString("uk-UA")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartEdit}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Редагувати прайс
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadTemplate}
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          Шаблон CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadPrice}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Excel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateMutation.isPending
                            ? "Збереження..."
                            : "Зберегти"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updateMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Скасувати
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(currentPrice.data).map(
                    ([category, items]) => {
                      const count = Object.keys(items).length;
                      // Пропускаємо порожні категорії
                      if (count === 0) return null;

                      const categoryNames: Record<string, string> = {
                        supports: "Опори",
                        spans: "Балки",
                        vertical_supports: "Вертикальні опори",
                        diagonal_brace: "Розкоси",
                        isolator: "Ізолятори",
                      };
                      return (
                        <div
                          key={category}
                          className="p-3 bg-muted rounded-lg text-center"
                        >
                          <p className="text-2xl font-bold text-primary">
                            {count}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {categoryNames[category] || category}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-5 h-5" />
                <p>Прайс ще не завантажено</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Таблиця прайсу */}
        {currentPrice && (
          <PriceTable
            priceData={currentPrice.data}
            onUpdate={handleUpdatePrice}
          />
        )}

        {/* Завантаження нового прайсу */}
        {uploadStatus === "idle" && (
          <PriceUpload
            onFileSelected={handleFileSelected}
            onError={(error) => toast.error(error)}
          />
        )}

        {/* Попередній перегляд */}
        {(uploadStatus === "preview" || uploadStatus === "uploading") &&
          parsedData && (
            <PricePreview
              data={parsedData as any}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isUploading={uploadStatus === "uploading"}
            />
          )}

        {/* Історія змін */}
        <PriceHistory
          versions={priceHistory?.versions || []}
          isLoading={isLoadingHistory}
          onRestore={handleRestore}
          onViewDetails={handleViewDetails}
        />
      </div>
    </AdminLayout>
  );
};

export default PriceManagementPage;
