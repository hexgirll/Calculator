// Main Calculator Features
const display = document.getElementById('display');
let currentInput = '0';
let currentExpression = ''; 
let isNewExpression = true; 

display.value = '0';

const numberButtons = document.querySelectorAll('.btn.number');
const decimalBtn = document.querySelector('.btn.decimal');
const operatorButtons = document.querySelectorAll('.btn.operator');
const equalsBtn = document.querySelector('.btn.equals');
const clearBtn = document.querySelector('.btn.clear');
const backspaceBtn = document.querySelector('.btn.backspace');
const signBtn = document.querySelector('.btn.sign');

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleNumber(button.textContent.trim());
    });
});

if (decimalBtn) {
    decimalBtn.addEventListener('click', handleDecimal);
}

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleOperator(button.textContent.trim());
    });
});

if (equalsBtn) {
    equalsBtn.addEventListener('click', handleEquals);
}

if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
}

if (backspaceBtn) {
    backspaceBtn.addEventListener('click', handleBackspace);
}

if (signBtn) {
    signBtn.addEventListener('click', handleSign);
}

function handleNumber(value) {
    if (isNewExpression) {
        currentInput = value;
        currentExpression = value;
        isNewExpression = false;
    } else {
        currentInput += value;
        currentExpression += value;
    }
    updateDisplay();
}

function handleDecimal() {
    if (isNewExpression) {
        currentInput = '0.';
        currentExpression = '0.';
        isNewExpression = false;
    } else {
        if (!currentInput.includes('.')) {
            currentInput += '.';
            currentExpression += '.';
        }
    }
    updateDisplay();
}

function isEmptyPlaceholder() {
    return isNewExpression && (currentExpression === '' || currentExpression === '0') && currentInput === '0';
}

function handleOperator(op) {
    if (isEmptyPlaceholder()) {
        return;
    }
    // If we have a number, append the operator
    if (currentInput !== '') {
        currentExpression += op;
        currentInput = '';
        isNewExpression = false;
    } else if (currentExpression !== '' && isOperator(currentExpression.slice(-1))) {
        // Replace the last operator if no number was entered
        currentExpression = currentExpression.slice(0, -1) + op;
        isNewExpression = false;
    } else if (currentExpression !== '') {
        // Append operator after parentheses or other non-operator characters
        currentExpression += op;
        isNewExpression = false;
    }
    updateDisplay();
}

function handleEquals() {
    if (currentExpression !== '' && !isOperator(currentExpression.slice(-1))) {
        const result = evaluateExpression(currentExpression);
        if (result !== null) {
            display.value = result;
            currentExpression = result.toString();
            currentInput = result.toString();
            isNewExpression = true;
            openParenthesesCount = 0; 
        }
    }
}

function handleClear() {
    currentInput = '0';
    currentExpression = '';
    display.value = '0';
    isNewExpression = true;
    openParenthesesCount = 0; 
}

function handleBackspace() {
    if (currentExpression.length > 0) {
        const lastChar = currentExpression.slice(-1);
        if (lastChar === '(') {
            openParenthesesCount--;
        } else if (lastChar === ')') {
            openParenthesesCount++;
        }
        
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            currentExpression = currentExpression.slice(0, -1);
        } else {
            // Remove the last operator or parenthesis
            currentExpression = currentExpression.slice(0, -1);
        }
        if (currentExpression === '') {
            currentExpression = '0';
            currentInput = '0';
            isNewExpression = true;
            openParenthesesCount = 0;
        }
        updateDisplay();
    }
}

function handleSign() {
    if (currentInput === '' || currentInput === '0') {
        return;
    }

    let exprBefore = currentExpression.slice(0, -currentInput.length);
    let needsParens = exprBefore.length > 0 && isOperator(exprBefore.slice(-1));
    let isWrapped = /^\(-?\d+(\.\d+)?\)$/.test(currentInput);

    if (isWrapped) {
        // Extract the number inside parentheses
        let inner = currentInput.slice(1, -1); 
        let num = parseFloat(inner);
        let newNum = -num;
        let newInput = newNum.toString();
        // Since it was wrapped, and we're negating, if newNum is positive, no parens
        currentInput = newInput;
        currentExpression = exprBefore + newInput;
    } else {
        // Not wrapped, negate and add parens if needed
        let num = parseFloat(currentInput);
        let newNum = -num;
        let newInput = newNum.toString();
        if (needsParens) {
            newInput = `(${newInput})`;
        }
        currentInput = newInput;
        currentExpression = exprBefore + newInput;
    }
    updateDisplay();
}

function updateDisplay() {
    display.value = currentExpression;
    display.scrollLeft = display.scrollWidth;
}

function isOperator(char) {
    return ['+', '-', '*', '/', '^'].includes(char);
}

function evaluateExpression(expr) {
    try {
        // Remove any whitespace
        expr = expr.replace(/\s/g, '');
        
        // Handle parentheses recursively
        while (expr.includes('(')) {
            // Find the innermost parentheses
            const parenRegex = /\([^()]*\)/;
            const match = expr.match(parenRegex);
            if (!match) break;
            
            // Evaluate the expression inside parentheses
            const innerExpr = match[0].slice(1, -1); // Remove parentheses
            const innerResult = evaluateSimpleExpression(innerExpr);
            if (innerResult === null) return null;
            
            // Replace the parentheses with the result, handling negative results after +
            if (innerResult.startsWith('-') && match.index > 0 && expr[match.index - 1] === '+') {
                // Replace '+(-number)' with '-number'
                expr = expr.slice(0, match.index - 1) + innerResult + expr.slice(match.index + match[0].length);
            } else {
                expr = expr.replace(match[0], innerResult);
            }
        }
        
        // Evaluate the final expression without parentheses
        return evaluateSimpleExpression(expr);
    } catch (e) {
        return null;
    }
}

function evaluateSimpleExpression(expr) {
    try {
        // Tokenize the expression to handle scientific operators
        let tokens = tokenizeExpression(expr);
        
        // First pass: handle postfix operators (!, ², ³, %, √ prefix)
        function getOperandValue(tokens, index) {
            if (index >= tokens.length) {
                return null;
            }
            if (tokens[index] === '√') {
                const nested = getOperandValue(tokens, index + 1);
                if (!nested) return null;
                return {
                    value: Math.sqrt(nested.value),
                    endIndex: nested.endIndex,
                };
            }
            if (tokens[index] === '(') {
                let depth = 1;
                let endIndex = index + 1;
                while (endIndex < tokens.length && depth > 0) {
                    if (tokens[endIndex] === '(') depth++;
                    else if (tokens[endIndex] === ')') depth--;
                    endIndex++;
                }
                if (depth !== 0) return null;
                const innerTokens = tokens.slice(index + 1, endIndex - 1);
                const innerValue = parseFloat(evaluateSimpleExpression(innerTokens.join('')));
                if (isNaN(innerValue)) return null;
                return {
                    value: innerValue,
                    endIndex: endIndex - 1,
                };
            }
            const value = parseFloat(tokens[index]);
            if (isNaN(value)) return null;
            return {
                value,
                endIndex: index,
            };
        }

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === '!') {
                let value = parseFloat(tokens[i-1]);
                tokens[i-1] = factorial(value).toString();
                tokens.splice(i, 1);
                i--;
            } else if (tokens[i] === '²') {
                let value = parseFloat(tokens[i-1]);
                tokens[i-1] = (value * value).toString();
                tokens.splice(i, 1);
                i--;
            } else if (tokens[i] === '³') {
                let value = parseFloat(tokens[i-1]);
                tokens[i-1] = (value * value * value).toString();
                tokens.splice(i, 1);
                i--;
            } else if (tokens[i] === '√') {
                const operand = getOperandValue(tokens, i + 1);
                if (!operand) return null;
                tokens.splice(i, operand.endIndex - i + 1, Math.sqrt(operand.value).toString());
                i--;
            } else if (tokens[i] === '|') {
                // Find matching closing |
                let closeIdx = tokens.indexOf('|', i+1);
                if (closeIdx !== -1 && closeIdx > i + 1) {
                    // We have |...| with content between, evaluate the inner expression
                    let innerTokens = tokens.slice(i + 1, closeIdx);
                    let innerExpr = innerTokens.join('');
                    let innerResult = evaluateSimpleExpression(innerExpr);
                    tokens.splice(i, closeIdx - i + 1, Math.abs(parseFloat(innerResult)).toString());
                    // Don't increment i, check same position again in case of nested operators
                } else if (closeIdx === i + 1) {
                    // Empty ||, skip
                }
            }
        }
        
        // Second pass: handle ^ (exponentiation)
        for (let i = 1; i < tokens.length - 1; i += 2) {
            if (tokens[i] === '^') {
                let left = parseFloat(tokens[i-1]);
                let right = parseFloat(tokens[i+1]);
                let result = Math.pow(left, right);
                tokens.splice(i-1, 3, result.toString());
                i -= 2;
            }
        }
        
        // Third pass: handle * and / (including % as percentage)
        for (let i = 1; i < tokens.length - 1; i += 2) {
            if (tokens[i] === '*' || tokens[i] === '/') {
                let left = parseFloat(tokens[i-1]);
                let right = parseFloat(tokens[i+1]);
                let result;
                
                if (tokens[i] === '*') {
                    result = left * right;
                } else if (tokens[i] === '/' && right !== 0) {
                    result = left / right;
                } else {
                    return null; // Division by zero
                }
                
                tokens.splice(i-1, 3, result.toString());
                i -= 2;
            } else if (tokens[i] === '%') { //percentage operator
                let left = parseFloat(tokens[i-1]);
                let right = parseFloat(tokens[i+1]);
                let result = (left * right) / 100;
                tokens.splice(i-1, 3, result.toString());
                i -= 2;
            }
        }
        
        // Fourth pass: handle + and -
        let result;
        let startIdx = 0;
        
        // Handle leading unary + or -
        if (tokens[0] === '-' || tokens[0] === '+') {
            let sign = tokens[0] === '-' ? -1 : 1;
            result = sign * parseFloat(tokens[1]);
            startIdx = 2;
        } else {
            result = parseFloat(tokens[0]);
            startIdx = 1;
        }
        
        for (let i = startIdx; i < tokens.length; i += 2) {
            let operator = tokens[i];
            let operand = parseFloat(tokens[i+1]);
            
            if (operator === '+') {
                result += operand;
            } else if (operator === '-') {
                result -= operand;
            }
        }
        
        return result.toString();
    } catch (e) {
        return null;
    }
}

function tokenizeExpression(expr) {
    // Tokenize expression preserving scientific operators
    let tokens = [];
    let currentNum = '';
    
    for (let i = 0; i < expr.length; i++) {
        let char = expr[i];
        
        if (/[0-9.]/.test(char)) {
            currentNum += char;
        } else {
            if (currentNum) {
                tokens.push(currentNum);
                currentNum = '';
            }
            
            if ((char === '+' || char === '-') && (tokens.length === 0 || ['+', '-', '*', '/', '^', '(', '|'].includes(tokens[tokens.length - 1]))) {
                currentNum = char;
                continue;
            }
            
            if (char === '√') {
                tokens.push('√');
            } else if (char === '|') {
                tokens.push('|');
            } else {
                tokens.push(char);
            }
        }
    }
    
    if (currentNum) {
        tokens.push(currentNum);
    }
    
    return tokens.filter(t => t !== '');
}

// Keyboard support for main features
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        handleNumber(key);
    } else if (key === '.') {
        handleDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '^') {
        handleOperator(key);
    } else if (key === 'Enter' || key === '=') {
        handleEquals();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleClear();
    } else if (key === 'Backspace') {
        handleBackspace();
    }
});
