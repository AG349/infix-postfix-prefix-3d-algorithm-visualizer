export type ExpressionType = 'INFIX' | 'POSTFIX' | 'PREFIX';

export type ConversionRoute =
  | 'INFIX_TO_POSTFIX'
  | 'INFIX_TO_PREFIX'
  | 'POSTFIX_TO_INFIX'
  | 'POSTFIX_TO_PREFIX'
  | 'PREFIX_TO_INFIX'
  | 'PREFIX_TO_POSTFIX';

export type ActionType =
  | 'READ'
  | 'PUSH_OPERAND'
  | 'PUSH_OPERATOR'
  | 'POP_OPERATOR'
  | 'DISCARD_PAREN'
  | 'POP_TWO_AND_COMBINE'
  | 'REVERSE_INPUT'
  | 'REVERSE_RESULT'
  | 'COMPLETE'
  | 'ERROR';

export interface Step {
  stepIndex: number;
  symbol: string;
  tokenIndex: number;
  actionType: ActionType;
  actionDescription: string;
  currentStack: string[];
  currentOutput: string;
  explanation: string;
  poppedItems?: string[];
  combinedResult?: string;
  activeTokenIndices?: number[];
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errorTokenIndex?: number;
}

export interface ConversionRequest {
  expression: string;
  route: ConversionRoute;
}

export interface ConversionResponse {
  success: boolean;
  route: ConversionRoute;
  inputTokens: string[];
  finalOutput: string;
  steps: Step[];
  validation: ValidationResult;
}
