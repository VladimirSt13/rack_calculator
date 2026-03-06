// Layout Components

export { Container } from './Container';
export type { ContainerProps } from './Container';

export { Page, PageContent } from './Page';
export type { PageProps, PageContentProps } from './Page';

export { Sidebar, SidebarSection } from './Sidebar';
export type { SidebarProps, SidebarSectionProps } from './Sidebar';

export { MainContent, ContentGrid } from './MainContent';
export type { MainContentProps, ContentGridProps } from './MainContent';

export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export { Grid, GridItem } from './Grid';
export type { GridProps, GridItemProps } from './Grid';

export { Stack, Inline } from './Stack';
export type { StackProps, InlineProps } from './Stack';

export {
  Responsive,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
} from './Responsive';
export type { ResponsiveProps } from './Responsive';

export { Section } from './Section';
export type { SectionProps } from './Section';

// Universal Calculator Layout
export {
  CalculatorPage,
  InputPanel,
  ResultsPanel,
  ResultsWrapper,
  SetPanel,
  CalculationStatus,
  ResultsSummary,
  ResultsContent,
  CALCULATOR_WIDTHS,
} from './CalculatorPage';
export type {
  CalculatorPageProps,
  CalculatorMode,
  CalculationLifecycleStatus,
  InputPanelProps,
  ResultsPanelProps,
  ResultsWrapperProps,
  SetPanelProps,
  CalculationStatusProps,
  ResultsSummaryProps,
  ResultsContentProps,
} from './CalculatorPage';

// Calculator UI Context
export {
  CalculatorUIProvider,
  useCalculatorUI,
  useCalculatorUIOptional,
} from './CalculatorUIContext';
export type {
  CalculatorUIProviderProps,
  CalculatorUIContextValue,
  CalculationState,
  ActiveSection,
} from './CalculatorUIContext';

// Battery Page Specific Layout
export {
  BatteryPageLayout,
  BatteryPageHeader,
  BatteryPageTwoCols,
  BatterySidebar,
  BatteryMainContent,
} from './BatteryPageLayout';
export type {
  BatteryPageLayoutProps,
  BatteryPageHeaderProps,
  BatteryPageTwoColsProps,
  BatterySidebarProps,
  BatteryMainContentProps,
} from './BatteryPageLayout';
