import {
  ExpressionType,
  ConversionRoute,
  Step,
  ValidationResult,
  ConversionResponse,
} from '../types/parser.js';

interface OperatorInfo {
  precedence: number;
  associativity: 'left' | 'right';
}

const OPERATORS: Record<string, OperatorInfo> = {
  '^': { precedence: 3, associativity: 'right' },
  '*': { precedence: 2, associativity: 'left' },
  '/': { precedence: 2, associativity: 'left' },
  '+': { precedence: 1, associativity: 'left' },
  '-': { precedence: 1, associativity: 'left' },
};

export function isOperator(token: string): boolean {
  return token in OPERATORS;
}

export function isOperand(token: string): boolean {
  return !isOperator(token) && token !== '(' && token !== ')';
}

export function getPrecedence(operator: string): number {
  return OPERATORS[operator]?.precedence ?? 0;
}

export function getAssociativity(operator: string): 'left' | 'right' {
  return OPERATORS[operator]?.associativity ?? 'left';
}

/**
 * Robust Tokenizer:
 * - Supports both space-separated tokens ("A B C * +") and continuous unspaced strings ("ABC*+DE-/").
 * - If space is present in the expression, groups contiguous alphanumeric chars into multi-char operands ("var1", "10").
 * - If no space is present, splits individual alphanumeric characters into distinct tokens ('A', 'B', 'C').
 */
export function tokenize(expr: string): string[] {
  const trimmed = expr.trim();
  if (!trimmed) return [];

  const hasSpaces = /\s/.test(trimmed);
  const tokens: string[] = [];
  let i = 0;

  while (i < trimmed.length) {
    const char = trimmed[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (char === '(' || char === ')' || isOperator(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    if (/[a-zA-Z0-9._]/.test(char)) {
      if (hasSpaces) {
        let operand = '';
        while (i < trimmed.length && /[a-zA-Z0-9._]/.test(trimmed[i])) {
          operand += trimmed[i];
          i++;
        }
        tokens.push(operand);
      } else {
        tokens.push(char);
        i++;
      }
      continue;
    }

    tokens.push(char);
    i++;
  }

  return tokens;
}

/**
 * Accurate Validation Logic:
 * - INFIX: Check matching parentheses and valid token structure.
 * - POSTFIX: Simulate left-to-right stack depth (push operand depth++, binary op requires depth>=2, depth--). Final depth must be 1.
 * - PREFIX: Simulate right-to-left stack depth (push operand depth++, binary op requires depth>=2, depth--). Final depth must be 1.
 */
export function validateExpression(expr: string, type: ExpressionType): ValidationResult {
  const tokens = tokenize(expr);
  if (tokens.length === 0) {
    return { isValid: false, errorMessage: 'Expression cannot be empty.' };
  }

  if (type === 'INFIX') {
    let parenDepth = 0;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === '(') parenDepth++;
      else if (token === ')') {
        parenDepth--;
        if (parenDepth < 0) {
          return { isValid: false, errorMessage: `Unmatched closing parenthesis ')' at position ${i + 1}.`, errorTokenIndex: i };
        }
      }
    }
    if (parenDepth > 0) {
      return { isValid: false, errorMessage: `Unmatched opening parenthesis '(' (${parenDepth} unclosed).` };
    }

    for (let i = 0; i < tokens.length - 1; i++) {
      if (isOperator(tokens[i]) && isOperator(tokens[i + 1])) {
        return {
          isValid: false,
          errorMessage: `Consecutive operators '${tokens[i]}' and '${tokens[i + 1]}' at position ${i + 1}.`,
          errorTokenIndex: i + 1,
        };
      }
    }
  } else if (type === 'POSTFIX') {
    let stackDepth = 0;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === '(' || token === ')') {
        return { isValid: false, errorMessage: `POSTFIX expressions should not contain parentheses '${token}'.` };
      }

      if (isOperand(token)) {
        stackDepth++;
      } else if (isOperator(token)) {
        if (stackDepth < 2) {
          return {
            isValid: false,
            errorMessage: `Invalid POSTFIX expression: Operator '${token}' at token ${i + 1} requires 2 operands on stack, but found ${stackDepth}.`,
            errorTokenIndex: i,
          };
        }
        stackDepth--;
      }
    }

    if (stackDepth !== 1) {
      return {
        isValid: false,
        errorMessage: `Invalid POSTFIX expression syntax: Traversal ended with ${stackDepth} items on stack instead of 1.`,
      };
    }
  } else if (type === 'PREFIX') {
    let stackDepth = 0;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (token === '(' || token === ')') {
        return { isValid: false, errorMessage: `PREFIX expressions should not contain parentheses '${token}'.` };
      }

      if (isOperand(token)) {
        stackDepth++;
      } else if (isOperator(token)) {
        if (stackDepth < 2) {
          return {
            isValid: false,
            errorMessage: `Invalid PREFIX expression: Operator '${token}' at token ${i + 1} requires 2 operands on stack, but found ${stackDepth}.`,
            errorTokenIndex: i,
          };
        }
        stackDepth--;
      }
    }

    if (stackDepth !== 1) {
      return {
        isValid: false,
        errorMessage: `Invalid PREFIX expression syntax: Right-to-left scan ended with ${stackDepth} items on stack instead of 1.`,
      };
    }
  }

  return { isValid: true };
}

export function infixToPostfixSteps(input: string): ConversionResponse {
  const validation = validateExpression(input, 'INFIX');
  const tokens = tokenize(input);
  const steps: Step[] = [];

  if (!validation.isValid) {
    return { success: false, route: 'INFIX_TO_POSTFIX', inputTokens: tokens, finalOutput: '', steps: [], validation };
  }

  const stack: string[] = [];
  const output: string[] = [];

  tokens.forEach((token, index) => {
    if (isOperand(token)) {
      output.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'PUSH_OPERAND',
        actionDescription: `Append operand '${token}' directly to output`,
        currentStack: [...stack],
        currentOutput: output.join(' '),
        explanation: `Operand '${token}' encountered. Direct output addition.`,
        activeTokenIndices: [index],
      });
    } else if (token === '(') {
      stack.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'PUSH_OPERATOR',
        actionDescription: `Push '(' to stack`,
        currentStack: [...stack],
        currentOutput: output.join(' '),
        explanation: `Left parenthesis '(' pushed to stack to start nested scope.`,
        activeTokenIndices: [index],
      });
    } else if (token === ')') {
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'READ',
        actionDescription: `Process ')' closure`,
        currentStack: [...stack],
        currentOutput: output.join(' '),
        explanation: `Right parenthesis ')' encountered. Popping stack until matching '('.`,
        activeTokenIndices: [index],
      });

      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        const popped = stack.pop()!;
        output.push(popped);
        steps.push({
          stepIndex: steps.length + 1,
          symbol: token,
          tokenIndex: index,
          actionType: 'POP_OPERATOR',
          actionDescription: `Pop '${popped}' from stack to output`,
          currentStack: [...stack],
          currentOutput: output.join(' '),
          explanation: `Popped '${popped}' from stack and appended to output.`,
          poppedItems: [popped],
          activeTokenIndices: [index],
        });
      }

      if (stack.length > 0 && stack[stack.length - 1] === '(') {
        stack.pop();
        steps.push({
          stepIndex: steps.length + 1,
          symbol: token,
          tokenIndex: index,
          actionType: 'DISCARD_PAREN',
          actionDescription: `Pop and discard '('`,
          currentStack: [...stack],
          currentOutput: output.join(' '),
          explanation: `Matching '(' discarded from top of stack.`,
          activeTokenIndices: [index],
        });
      }
    } else if (isOperator(token)) {
      const tokenPrec = getPrecedence(token);
      const tokenAssoc = getAssociativity(token);

      while (stack.length > 0 && isOperator(stack[stack.length - 1])) {
        const top = stack[stack.length - 1];
        const topPrec = getPrecedence(top);

        const shouldPop =
          (tokenAssoc === 'left' && tokenPrec <= topPrec) ||
          (tokenAssoc === 'right' && tokenPrec < topPrec);

        if (shouldPop) {
          const popped = stack.pop()!;
          output.push(popped);
          steps.push({
            stepIndex: steps.length + 1,
            symbol: token,
            tokenIndex: index,
            actionType: 'POP_OPERATOR',
            actionDescription: `Pop higher/equal precedence '${popped}' to output`,
            currentStack: [...stack],
            currentOutput: output.join(' '),
            explanation: `Top of stack '${popped}' (prec ${topPrec}) has higher/equal precedence than '${token}' (prec ${tokenPrec}). Popped to output.`,
            poppedItems: [popped],
            activeTokenIndices: [index],
          });
        } else {
          break;
        }
      }

      stack.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'PUSH_OPERATOR',
        actionDescription: `Push operator '${token}' to stack`,
        currentStack: [...stack],
        currentOutput: output.join(' '),
        explanation: `Operator '${token}' pushed to stack.`,
        activeTokenIndices: [index],
      });
    }
  });

  while (stack.length > 0) {
    const popped = stack.pop()!;
    output.push(popped);
    steps.push({
      stepIndex: steps.length + 1,
      symbol: popped,
      tokenIndex: tokens.length - 1,
      actionType: 'POP_OPERATOR',
      actionDescription: `Pop remaining operator '${popped}' to output`,
      currentStack: [...stack],
      currentOutput: output.join(' '),
      explanation: `Expression scan complete. Popped remaining operator '${popped}' to output.`,
      poppedItems: [popped],
    });
  }

  const finalOutput = output.join(' ');
  steps.push({
    stepIndex: steps.length + 1,
    symbol: 'END',
    tokenIndex: tokens.length - 1,
    actionType: 'COMPLETE',
    actionDescription: 'Conversion completed successfully',
    currentStack: [],
    currentOutput: finalOutput,
    explanation: `Final Postfix Expression: "${finalOutput}"`,
  });

  return { success: true, route: 'INFIX_TO_POSTFIX', inputTokens: tokens, finalOutput, steps, validation };
}

export function infixToPrefixSteps(input: string): ConversionResponse {
  const validation = validateExpression(input, 'INFIX');
  const originalTokens = tokenize(input);
  const steps: Step[] = [];

  if (!validation.isValid) {
    return { success: false, route: 'INFIX_TO_PREFIX', inputTokens: originalTokens, finalOutput: '', steps: [], validation };
  }

  const reversedTokens: string[] = [];
  for (let i = originalTokens.length - 1; i >= 0; i--) {
    const token = originalTokens[i];
    if (token === '(') reversedTokens.push(')');
    else if (token === ')') reversedTokens.push('(');
    else reversedTokens.push(token);
  }

  steps.push({
    stepIndex: steps.length + 1,
    symbol: 'INIT',
    tokenIndex: 0,
    actionType: 'REVERSE_INPUT',
    actionDescription: 'Reverse tokens & swap parentheses ( ( ↔ ) )',
    currentStack: [],
    currentOutput: '',
    explanation: `Reversed Infix tokens: [${reversedTokens.join(' ')}]`,
  });

  const stack: string[] = [];
  const output: string[] = [];

  reversedTokens.forEach((token, index) => {
    if (isOperand(token)) {
      output.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'PUSH_OPERAND',
        actionDescription: `Append operand '${token}' to intermediate output`,
        currentStack: [...stack],
        currentOutput: output.join(' '),
        explanation: `Operand '${token}' appended directly to output.`,
        activeTokenIndices: [index],
      });
    } else if (token === '(') {
      stack.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'PUSH_OPERATOR',
        actionDescription: `Push '(' to stack`,
        currentStack: [...stack],
        currentOutput: output.join(' '),
        explanation: `Swapped opening bracket '(' pushed to stack.`,
        activeTokenIndices: [index],
      });
    } else if (token === ')') {
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'READ',
        actionDescription: `Process ')' closure`,
        currentStack: [...stack],
        currentOutput: output.join(' '),
        explanation: `Swapped closing bracket ')' encountered. Popping until '('.`,
        activeTokenIndices: [index],
      });

      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        const popped = stack.pop()!;
        output.push(popped);
        steps.push({
          stepIndex: steps.length + 1,
          symbol: token,
          tokenIndex: index,
          actionType: 'POP_OPERATOR',
          actionDescription: `Pop '${popped}' to output`,
          currentStack: [...stack],
          currentOutput: output.join(' '),
          explanation: `Popped '${popped}' from stack.`,
          poppedItems: [popped],
          activeTokenIndices: [index],
        });
      }

      if (stack.length > 0 && stack[stack.length - 1] === '(') {
        stack.pop();
        steps.push({
          stepIndex: steps.length + 1,
          symbol: token,
          tokenIndex: index,
          actionType: 'DISCARD_PAREN',
          actionDescription: `Discard '('`,
          currentStack: [...stack],
          currentOutput: output.join(' '),
          explanation: `Matching '(' discarded from stack.`,
          activeTokenIndices: [index],
        });
      }
    } else if (isOperator(token)) {
      const tokenPrec = getPrecedence(token);

      while (stack.length > 0 && isOperator(stack[stack.length - 1])) {
        const top = stack[stack.length - 1];
        const topPrec = getPrecedence(top);

        if (topPrec > tokenPrec) {
          const popped = stack.pop()!;
          output.push(popped);
          steps.push({
            stepIndex: steps.length + 1,
            symbol: token,
            tokenIndex: index,
            actionType: 'POP_OPERATOR',
            actionDescription: `Pop strictly higher precedence '${popped}' to output`,
            currentStack: [...stack],
            currentOutput: output.join(' '),
            explanation: `Top '${popped}' (prec ${topPrec}) has strictly higher precedence than '${token}' (prec ${tokenPrec}). Popped.`,
            poppedItems: [popped],
            activeTokenIndices: [index],
          });
        } else {
          break;
        }
      }

      stack.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'PUSH_OPERATOR',
        actionDescription: `Push operator '${token}' to stack`,
        currentStack: [...stack],
        currentOutput: output.join(' '),
        explanation: `Pushed '${token}' to stack.`,
        activeTokenIndices: [index],
      });
    }
  });

  while (stack.length > 0) {
    const popped = stack.pop()!;
    output.push(popped);
    steps.push({
      stepIndex: steps.length + 1,
      symbol: popped,
      tokenIndex: reversedTokens.length - 1,
      actionType: 'POP_OPERATOR',
      actionDescription: `Pop remaining operator '${popped}' to output`,
      currentStack: [...stack],
      currentOutput: output.join(' '),
      explanation: `Popped remaining '${popped}' from stack.`,
      poppedItems: [popped],
    });
  }

  const finalPrefixTokens = [...output].reverse();
  const finalOutput = finalPrefixTokens.join(' ');

  steps.push({
    stepIndex: steps.length + 1,
    symbol: 'FINISH',
    tokenIndex: reversedTokens.length - 1,
    actionType: 'REVERSE_RESULT',
    actionDescription: 'Reverse intermediate output string to get Prefix expression',
    currentStack: [],
    currentOutput: finalOutput,
    explanation: `Reversed output to obtain final Prefix expression: "${finalOutput}"`,
  });

  return { success: true, route: 'INFIX_TO_PREFIX', inputTokens: originalTokens, finalOutput, steps, validation };
}

export function postfixToInfixSteps(input: string): ConversionResponse {
  const validation = validateExpression(input, 'POSTFIX');
  const tokens = tokenize(input);
  const steps: Step[] = [];

  if (!validation.isValid) {
    return { success: false, route: 'POSTFIX_TO_INFIX', inputTokens: tokens, finalOutput: '', steps: [], validation };
  }

  const stack: string[] = [];

  tokens.forEach((token, index) => {
    if (isOperand(token)) {
      stack.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'PUSH_OPERAND',
        actionDescription: `Push operand '${token}' to evaluation stack`,
        currentStack: [...stack],
        currentOutput: '',
        explanation: `Operand '${token}' pushed to stack.`,
        activeTokenIndices: [index],
      });
    } else if (isOperator(token)) {
      if (stack.length < 2) return;
      const op2 = stack.pop()!;
      const op1 = stack.pop()!;
      const combined = `(${op1} ${token} ${op2})`;
      stack.push(combined);

      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'POP_TWO_AND_COMBINE',
        actionDescription: `Pop '${op2}' & '${op1}', combine with '${token}' into '${combined}'`,
        currentStack: [...stack],
        currentOutput: combined,
        explanation: `Popped top operands '${op2}' and '${op1}'. Joined with operator '${token}' into "${combined}" and pushed back to stack.`,
        poppedItems: [op2, op1],
        combinedResult: combined,
        activeTokenIndices: [index],
      });
    }
  });

  const finalOutput = stack.length === 1 ? stack[0] : '';
  steps.push({
    stepIndex: steps.length + 1,
    symbol: 'END',
    tokenIndex: tokens.length - 1,
    actionType: 'COMPLETE',
    actionDescription: 'Postfix to Infix evaluation completed',
    currentStack: [...stack],
    currentOutput: finalOutput,
    explanation: `Final Infix Expression: "${finalOutput}"`,
  });

  return { success: true, route: 'POSTFIX_TO_INFIX', inputTokens: tokens, finalOutput, steps, validation };
}

export function postfixToPrefixSteps(input: string): ConversionResponse {
  const validation = validateExpression(input, 'POSTFIX');
  const tokens = tokenize(input);
  const steps: Step[] = [];

  if (!validation.isValid) {
    return { success: false, route: 'POSTFIX_TO_PREFIX', inputTokens: tokens, finalOutput: '', steps: [], validation };
  }

  const stack: string[] = [];

  tokens.forEach((token, index) => {
    if (isOperand(token)) {
      stack.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'PUSH_OPERAND',
        actionDescription: `Push operand '${token}' to stack`,
        currentStack: [...stack],
        currentOutput: '',
        explanation: `Operand '${token}' pushed to stack.`,
        activeTokenIndices: [index],
      });
    } else if (isOperator(token)) {
      if (stack.length < 2) return;
      const op2 = stack.pop()!;
      const op1 = stack.pop()!;
      const combined = `${token} ${op1} ${op2}`;
      stack.push(combined);

      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: index,
        actionType: 'POP_TWO_AND_COMBINE',
        actionDescription: `Pop '${op2}' & '${op1}', combine into Prefix format '${combined}'`,
        currentStack: [...stack],
        currentOutput: combined,
        explanation: `Popped operands '${op2}' and '${op1}'. Created Prefix subtree "${combined}" and pushed to stack.`,
        poppedItems: [op2, op1],
        combinedResult: combined,
        activeTokenIndices: [index],
      });
    }
  });

  const finalOutput = stack.length === 1 ? stack[0] : '';
  steps.push({
    stepIndex: steps.length + 1,
    symbol: 'END',
    tokenIndex: tokens.length - 1,
    actionType: 'COMPLETE',
    actionDescription: 'Postfix to Prefix conversion completed',
    currentStack: [...stack],
    currentOutput: finalOutput,
    explanation: `Final Prefix Expression: "${finalOutput}"`,
  });

  return { success: true, route: 'POSTFIX_TO_PREFIX', inputTokens: tokens, finalOutput, steps, validation };
}

export function prefixToInfixSteps(input: string): ConversionResponse {
  const validation = validateExpression(input, 'PREFIX');
  const originalTokens = tokenize(input);
  const steps: Step[] = [];

  if (!validation.isValid) {
    return { success: false, route: 'PREFIX_TO_INFIX', inputTokens: originalTokens, finalOutput: '', steps: [], validation };
  }

  const stack: string[] = [];

  for (let i = originalTokens.length - 1; i >= 0; i--) {
    const token = originalTokens[i];

    if (isOperand(token)) {
      stack.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: i,
        actionType: 'PUSH_OPERAND',
        actionDescription: `Push operand '${token}' to stack (Right-to-Left scan)`,
        currentStack: [...stack],
        currentOutput: '',
        explanation: `Scanned operand '${token}' from right. Pushed to stack.`,
        activeTokenIndices: [i],
      });
    } else if (isOperator(token)) {
      if (stack.length < 2) return { success: false, route: 'PREFIX_TO_INFIX', inputTokens: originalTokens, finalOutput: '', steps: [], validation: { isValid: false, errorMessage: 'Invalid prefix expression.' } };

      const op1 = stack.pop()!;
      const op2 = stack.pop()!;
      const combined = `(${op1} ${token} ${op2})`;
      stack.push(combined);

      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: i,
        actionType: 'POP_TWO_AND_COMBINE',
        actionDescription: `Pop '${op1}' & '${op2}', combine with operator '${token}' into '${combined}'`,
        currentStack: [...stack],
        currentOutput: combined,
        explanation: `Popped operands '${op1}' and '${op2}'. Created Infix subtree "${combined}" and pushed back to stack.`,
        poppedItems: [op1, op2],
        combinedResult: combined,
        activeTokenIndices: [i],
      });
    }
  }

  const finalOutput = stack.length === 1 ? stack[0] : '';
  steps.push({
    stepIndex: steps.length + 1,
    symbol: 'END',
    tokenIndex: 0,
    actionType: 'COMPLETE',
    actionDescription: 'Prefix to Infix conversion completed',
    currentStack: [...stack],
    currentOutput: finalOutput,
    explanation: `Final Infix Expression: "${finalOutput}"`,
  });

  return { success: true, route: 'PREFIX_TO_INFIX', inputTokens: originalTokens, finalOutput, steps, validation };
}

export function prefixToPostfixSteps(input: string): ConversionResponse {
  const validation = validateExpression(input, 'PREFIX');
  const originalTokens = tokenize(input);
  const steps: Step[] = [];

  if (!validation.isValid) {
    return { success: false, route: 'PREFIX_TO_POSTFIX', inputTokens: originalTokens, finalOutput: '', steps: [], validation };
  }

  const stack: string[] = [];

  for (let i = originalTokens.length - 1; i >= 0; i--) {
    const token = originalTokens[i];

    if (isOperand(token)) {
      stack.push(token);
      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: i,
        actionType: 'PUSH_OPERAND',
        actionDescription: `Push operand '${token}' to stack (Right-to-Left scan)`,
        currentStack: [...stack],
        currentOutput: '',
        explanation: `Scanned operand '${token}' from right. Pushed to stack.`,
        activeTokenIndices: [i],
      });
    } else if (isOperator(token)) {
      if (stack.length < 2) return { success: false, route: 'PREFIX_TO_POSTFIX', inputTokens: originalTokens, finalOutput: '', steps: [], validation: { isValid: false, errorMessage: 'Invalid prefix expression.' } };

      const op1 = stack.pop()!;
      const op2 = stack.pop()!;
      const combined = `${op1} ${op2} ${token}`;
      stack.push(combined);

      steps.push({
        stepIndex: steps.length + 1,
        symbol: token,
        tokenIndex: i,
        actionType: 'POP_TWO_AND_COMBINE',
        actionDescription: `Pop '${op1}' & '${op2}', combine into Postfix structure '${combined}'`,
        currentStack: [...stack],
        currentOutput: combined,
        explanation: `Popped operands '${op1}' and '${op2}'. Created Postfix sub-expression "${combined}" and pushed to stack.`,
        poppedItems: [op1, op2],
        combinedResult: combined,
        activeTokenIndices: [i],
      });
    }
  }

  const finalOutput = stack.length === 1 ? stack[0] : '';
  steps.push({
    stepIndex: steps.length + 1,
    symbol: 'END',
    tokenIndex: 0,
    actionType: 'COMPLETE',
    actionDescription: 'Prefix to Postfix conversion completed',
    currentStack: [...stack],
    currentOutput: finalOutput,
    explanation: `Final Postfix Expression: "${finalOutput}"`,
  });

  return { success: true, route: 'PREFIX_TO_POSTFIX', inputTokens: originalTokens, finalOutput, steps, validation };
}

export function convertExpression(input: string, route: ConversionRoute): ConversionResponse {
  switch (route) {
    case 'INFIX_TO_POSTFIX':
      return infixToPostfixSteps(input);
    case 'INFIX_TO_PREFIX':
      return infixToPrefixSteps(input);
    case 'POSTFIX_TO_INFIX':
      return postfixToInfixSteps(input);
    case 'POSTFIX_TO_PREFIX':
      return postfixToPrefixSteps(input);
    case 'PREFIX_TO_INFIX':
      return prefixToInfixSteps(input);
    case 'PREFIX_TO_POSTFIX':
      return prefixToPostfixSteps(input);
    default:
      throw new Error(`Unsupported conversion route: ${route}`);
  }
}
