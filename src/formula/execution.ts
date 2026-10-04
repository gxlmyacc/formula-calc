import type { FormulaValueOptions, IFormulaValue } from './type';

interface ExecutionContext {
  values: WeakMap<IFormulaValue, { result: any }>;
  ancestors: Set<IFormulaValue>;
}

// Keep reference results local to each execution, including concurrent async calls.
const contexts = new WeakMap<FormulaValueOptions, ExecutionContext>();

export function createExecutionOptions(options: FormulaValueOptions) {
  const executionOptions = { ...options };
  contexts.set(executionOptions, { values: new WeakMap(), ancestors: new Set() });
  return executionOptions;
}

export function enterExecution(item: IFormulaValue, options: FormulaValueOptions) {
  const parent = contexts.get(options);
  if (!parent) return options;
  const executionOptions = { ...options };
  const ancestors = new Set(parent.ancestors);
  ancestors.add(item);
  contexts.set(executionOptions, { values: parent.values, ancestors });
  return executionOptions;
}

export function saveExecutionResult(item: IFormulaValue, options: FormulaValueOptions, result: any) {
  contexts.get(options)?.values.set(item, { result });
}

export function getReferenceResult(item: IFormulaValue, options: FormulaValueOptions) {
  const context = contexts.get(options);
  return context && {
    circular: context.ancestors.has(item),
    saved: context.values.get(item),
  };
}
