import React from "react";
import { CalculationControls } from "@/shared/components";
import { CalculatorPage } from "@/shared/layout";
import RackForm from "@/features/rack/components/RackForm";
import RackResults from "@/features/rack/components/RackResults";
import RackSetCard from "@/features/rack/components/RackSetCard";
import { useRackCalculator } from "@/features/rack/useRackCalculator";

/**
 * Rack Page - сторінка розрахунку стелажа
 *
 * Manual calculation UX:
 * - Користувач заповнює форму
 * - Натискає кнопку "Розрахувати"
 * - Отримує результат з сервера
 */
const RackPage: React.FC = () => {
  const { calculate, isLoading, error, calculationState } = useRackCalculator();

  const inputContent = (
    <>
      <div className="space-y-4">
        {/* Form */}
        <RackForm />

        {/* Manual Calculate Button */}
        <CalculationControls
          isLoading={isLoading}
          error={error}
          submitText="Розрахувати"
          loadingText="Розрахунок..."
          onSubmit={calculate}
        />
      </div>
    </>
  );

  const resultsContent = <RackResults isLoading={isLoading} />;

  const setPanelContent = <RackSetCard />;

  return (
    <CalculatorPage
      title="Розрахунок стелажа"
      description="Налаштуйте параметри та отримайте специфікацію"
      input={inputContent}
      results={resultsContent}
      setPanel={setPanelContent}
      status={calculationState}
    />
  );
};

export default RackPage;
