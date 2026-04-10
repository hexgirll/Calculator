// Main Calculator Features (Basic Operations)
const display = document.getElementById('display');
let currentInput = '0';
let currentExpression = ''; // Track full expression
let isNewExpression = true; // Track if we're starting a new expression

// Initialize display
display.value = '0';

// Button event listeners for main features
const numberButtons = document.querySelectorAll('.btn.number');
const decimalBtn = document.querySelector('.btn.decimal');
const operatorButtons = document.querySelectorAll('.btn.operator');
const equalsBtn = document.querySelector('.btn.equals');
const clearBtn = document.querySelector('.btn.clear');
const backspaceBtn = document.querySelector('.btn.backspace');
const signBtn = document.querySelector('.btn.sign');

// Number buttons
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleNumber(button.textContent.trim());
    });
});

// Decimal button
if (decimalBtn) {
    decimalBtn.addEventListener('click', handleDecimal);
}

// Operator buttons
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleOperator(button.textContent.trim());
    });
});

// Equals button
if (equalsBtn) {
    equalsBtn.addEventListener('click', handleEquals);
}

// Clear button
if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
}

// Backspace button
if (backspaceBtn) {
    backspaceBtn.addEventListener('click', handleBackspace);
}

// Sign button
if (signBtn) {
    signBtn.addEventListener('click', handleSign);
}

// Main Feature Functions
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

function handleOperator(op) {
    // If we have a number, append the operator
    if (currentInput !== '') {
        currentExpression += op;
        currentInput = '';
    } else if (currentExpression !== '' && isOperator(currentExpression.slice(-1))) {
        // Replace the last operator if no number was entered
        currentExpression = currentExpression.slice(0, -1) + op;
    } else if (currentExpression !== '') {
        // Append operator after parentheses or other non-operator characters
        currentExpression += op;
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
            openParenthesesCount = 0; // Reset parentheses count after evaluation
        }
    }
}

function handleClear() {
    currentInput = '0';
    currentExpression = '';
    display.value = '0';
    isNewExpression = true;
    openParenthesesCount = 0; // Reset parentheses count
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
    if (currentInput !== '') {
        let num = parseFloat(currentInput);
        num = -num;
        currentInput = num.toString();
        
        // Update the last number in expression
        let parts = currentExpression.split(/([+\-*/])/);
        parts[parts.length - 1] = currentInput;
        currentExpression = parts.join('');
        updateDisplay();
    }
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
            
            // Replace the parentheses with the result
            expr = expr.replace(match[0], innerResult);
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
                let value = parseFloat(tokens[i+1]);
                tokens[i] = Math.sqrt(value).toString();
                tokens.splice(i+1, 1);
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
            } else if (tokens[i] === '%') {
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
            
            // Check for scientific prefix operators
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
