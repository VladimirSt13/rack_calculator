// UI Components

// Buttons
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { CalculationControls } from './CalculationControls';
export type { CalculationControlsProps } from './CalculationControls';

// Cards
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';

export { ResultCard } from './ResultCard';
export type { ResultCardProps } from './ResultCard';

// Tables
export { DataTable } from './DataTable';
export type { DataTableProps } from './DataTable';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './Table';

// Forms
export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps } from './Select';

export { SelectField } from './SelectField';
export type { SelectFieldProps } from './SelectField';

export { NumberInput } from './NumberInput';
export type { NumberInputProps } from './NumberInput';

export { Label } from './Label';

export { Checkbox } from './Checkbox';

// Form Fields (Reusable Patterns)
export {
  NumberField,
  SelectField as FormSelectField,
  LengthWithGapField,
  TextField,
} from './FormField';
export type {
  NumberFieldProps,
  SelectFieldProps as FormSelectFieldProps,
  LengthWithGapFieldProps,
  TextFieldProps,
} from './FormField';

// Field Row (Engineering Calculator)
export {
  FieldRow,
  FieldRowInput,
  FieldRowSelect,
  FieldRowValue,
  FieldRowGroup,
} from './FieldRow';
export type {
  FieldRowProps,
  FieldRowInputProps,
  FieldRowSelectProps,
  FieldRowValueProps,
  FieldRowGroupProps,
} from './FieldRow';

// Dialog / Modal
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog';

// Alerts
export { Alert, AlertTitle, AlertDescription } from './Alert';

// Badges
export { Badge, badgeVariants } from './Badge';
export type { BadgeProps } from './Badge';

// Layout
export { Separator } from './Separator';

export { ScrollArea, ScrollBar } from './ScrollArea';

// Section (Engineering Calculator)
export { SectionHeader, FormSection, FormSectionsGroup } from './SectionHeader';
export type { SectionHeaderProps, FormSectionProps, FormSectionsGroupProps } from './SectionHeader';

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

// Tooltip
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';

// Loading
export { Skeleton } from './Skeleton';

// Theme
export { ThemeToggle, ThemeProvider } from './ThemeToggle';
export type { ThemeToggleProps, ThemeProviderProps } from './ThemeToggle';
