type TaskResult = "P" | "X" | "NA";

type LocationTaskForPayment = {
  locationTaskId: string;
  task: {
    category: {
      categoryName: string;
    };
  };
};

type TaskEvaluationForPayment = {
  locationTaskId: string;
  result: TaskResult;
};

export type CategoryProgress = {
  category: string;
  passed: number;
  applicable: number;
  percentage: number;
};

export function calculatePaymentBreakdown({
  monthlyContractAmount,
  activeLocationCount,
  locationTasks,
  taskEvaluations,
}: {
  monthlyContractAmount: number;
  activeLocationCount: number;
  locationTasks: LocationTaskForPayment[];
  taskEvaluations: TaskEvaluationForPayment[];
}) {
  const resultsByTask = new Map(
    taskEvaluations.map((evaluation) => [
      evaluation.locationTaskId,
      evaluation.result,
    ])
  );
  const categoryRows = new Map<string, { passed: number; applicable: number }>();

  for (const locationTask of locationTasks) {
    const category = locationTask.task.category.categoryName;
    const current = categoryRows.get(category) ?? { passed: 0, applicable: 0 };
    const result = resultsByTask.get(locationTask.locationTaskId);

    if (result !== "NA") {
      current.applicable += 1;
      if (result === "P") current.passed += 1;
    }

    categoryRows.set(category, current);
  }

  const categoryProgress = Array.from(categoryRows, ([category, progress]) => ({
    category,
    ...progress,
    percentage:
      progress.applicable === 0
        ? 0
        : (progress.passed / progress.applicable) * 100,
  })).sort((left, right) => categoryOrder(left.category) - categoryOrder(right.category));

  const passed = categoryProgress.reduce((total, item) => total + item.passed, 0);
  const applicable = categoryProgress.reduce(
    (total, item) => total + item.applicable,
    0
  );
  const completionPercentage = applicable === 0 ? 0 : (passed / applicable) * 100;
  const locationMonthlyAllocation =
    activeLocationCount > 0 ? monthlyContractAmount / activeLocationCount : 0;
  const recommendedAmount =
    (locationMonthlyAllocation * completionPercentage) / 100;

  return {
    monthlyContractAmount,
    activeLocationCount,
    locationMonthlyAllocation,
    completionPercentage,
    recommendedAmount,
    categoryProgress,
  };
}

function categoryOrder(category: string) {
  const index = ["Daily", "Weekly", "Monthly"].indexOf(category);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
