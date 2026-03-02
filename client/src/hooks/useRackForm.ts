import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Схема валідації форми стелажа
export const rackFormSchema = z.object({
  floors: z.coerce.number().min(1).max(10),
  verticalSupports: z.string().optional(),
  supports: z.string().min(1, 'Оберіть тип опори'),
  rows: z.coerce.number().min(1).max(4),
  beamsPerRow: z.coerce.number().min(2).max(4),
});

export type RackFormValues = z.infer<typeof rackFormSchema>;

export interface UseRackFormOptions extends Omit<UseFormProps<RackFormValues>, 'resolver' | 'defaultValues'> {
  defaultValues?: Partial<RackFormValues>;
  onSubmit?: (data: RackFormValues) => void;
}

/**
 * Hook для форми розрахунку стелажа (Rack page)
 */
export const useRackForm = (options: UseRackFormOptions = {}) => {
  const {
    defaultValues = {
      floors: 1,
      verticalSupports: '',
      supports: '',
      rows: 1,
      beamsPerRow: 2,
    },
    onSubmit,
    ...formOptions
  } = options;

  const form = useForm<RackFormValues>({
    resolver: zodResolver(rackFormSchema),
    defaultValues,
    mode: 'onChange',
    ...formOptions,
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit?.(data);
  });

  return {
    ...form,
    handleSubmit,
  };
};

export default useRackForm;
