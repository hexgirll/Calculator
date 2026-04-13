const display = document.getElementById('display');
let currentInput = '0';
let currentExpression = ''; 
let isNewExpression = true; 

display.value = '0';

const numberButtons = document.querySelectorAll('#mode-standard .btn.number, #mode-scientific .btn.number');
const decimalBtns = document.querySelectorAll('#mode-standard .btn.decimal, #mode-scientific .btn.decimal');
const operatorButtons = document.querySelectorAll('#mode-standard .btn.operator, #mode-scientific .btn.operator');
const equalsBtns = document.querySelectorAll('#mode-standard .btn.equals, #mode-scientific .btn.equals');
const clearBtns = document.querySelectorAll('#mode-standard .btn.clear, #mode-scientific .btn.clear');
const backspaceBtns = document.querySelectorAll('#mode-standard .btn.backspace, #mode-scientific .btn.backspace');
const signBtns = document.querySelectorAll('#mode-standard .btn.sign, #mode-scientific .btn.sign');

numberButtons.forEach(button => {
    button.addEventListener('click', () => handleNumber(button.textContent.trim()));
});

decimalBtns.forEach(button => {
    button.addEventListener('click', handleDecimal);
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => handleOperator(button.textContent.trim()));
});

equalsBtns.forEach(button => {
    button.addEventListener('click', handleEquals);
});

clearBtns.forEach(button => {
    button.addEventListener('click', handleClear);
});

backspaceBtns.forEach(button => {
    button.addEventListener('click', handleBackspace);
});

signBtns.forEach(button => {
    button.addEventListener('click', handleSign);
});

function handleNumber(value) {
    if (isNewExpression) {
        currentInput = value;
        currentExpression = value;
        isNewExpression = false;
    } else {
        if (currentInput === '0') {
            currentInput = value;
            currentExpression = currentExpression.slice(0, -1) + value;
        } 
        
        else if (currentInput === '-0') {
            currentInput = '-' + value;
            currentExpression = currentExpression.slice(0, -1) + value;
        } 
        else {
            currentInput += value;
            currentExpression += value;
        }
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
        if (op === '-') {
            currentInput = '-';
            currentExpression = '-';
            isNewExpression = false;
        } else {
            currentInput = '';
            currentExpression = '0' + op;
            isNewExpression = false;
        }
        updateDisplay();
        return;
    }
    
    if (currentInput !== '') {
        currentExpression += op;
        currentInput = '';
        isNewExpression = false;
    } else if (currentExpression !== '' && isOperator(currentExpression.slice(-1))) {
        currentExpression = currentExpression.slice(0, -1) + op;
        isNewExpression = false;
    } else if (currentExpression !== '') {
        currentExpression += op;
        isNewExpression = false;
    }
    updateDisplay();
}

function handleEquals() {
    if (currentExpression !== '' && !isOperator(currentExpression.slice(-1))) {
        const isSingleNumber = /^-?\d*\.?\d+$/.test(currentExpression) || currentExpression === 'π';

        if (isSingleNumber) {
            isNewExpression = true; 
            return; 
        }

        const exprBeforeEval = currentExpression;
        let result = evaluateExpression(currentExpression); 
        
        if (result === null || Number.isNaN(Number(result)) || !isFinite(Number(result))) {
            display.value = 'Error';
            
            currentExpression = '';
            currentInput = '0';
            isNewExpression = true;
            openParenthesesCount = 0; 
            return; 
        }
        
        if (result !== null) {
            result = cleanMath(result);
            
            if (typeof window.addHistory === 'function') {
                window.addHistory(exprBeforeEval, result);
            }
            
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
        const lastBlockMatch = currentExpression.match(/(?:-?(?:log|ln|√|1\/)?\|[^|]+\||-?(?:log|ln|√|1\/)?\([^)]+\))$/);
        
        if (lastBlockMatch) {
            currentInput = lastBlockMatch[0]; 
        } else {
            return; 
        }
    }

    let exprBefore = currentExpression.slice(0, -currentInput.length);
    let needsParens = exprBefore.length > 0 && isOperator(exprBefore.slice(-1));

    const parenWrapMatch = currentInput.match(/^\(-\s*(.*)\)$/);
    
    if (parenWrapMatch) {
        currentInput = parenWrapMatch[1];
    } 
    else if (currentInput.startsWith('-')) {
        currentInput = currentInput.substring(1);
    } 
    else if (needsParens) {
        currentInput = `(-${currentInput})`;
    } 
    else {
        currentInput = `-${currentInput}`;
    }

    currentExpression = exprBefore + currentInput;
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
        expr = expr.replace(/\s/g, '');
        
        expr = expr.replace(/([0-9.\)\|!²³%])π/g, "$1*π"); 
        expr = expr.replace(/π([0-9.\(\|l√])/g, "π*$1"); 
        expr = expr.replace(/π/g, Math.PI);      
        
        while (expr.includes('(')) {
            const parenRegex = /\([^()]*\)/;
            const match = expr.match(parenRegex);
            if (!match) break;
            
            const innerExpr = match[0].slice(1, -1); 
            const innerResult = evaluateSimpleExpression(innerExpr);
            if (innerResult === null) return null;
            
            if (innerResult.startsWith('-') && match.index > 0 && expr[match.index - 1] === '+') {
                expr = expr.slice(0, match.index - 1) + innerResult + expr.slice(match.index + match[0].length);
            } else {
                expr = expr.replace(match[0], innerResult);
            }
        }
        
        return evaluateSimpleExpression(expr);
    } catch (e) {
        return null;
    }
}

function evaluateSimpleExpression(expr) {
    try {
        let tokens = tokenizeExpression(expr);
        
        function getOperandValue(tokens, index) {
            if (index >= tokens.length) return null;
            
            if (tokens[index] === 'log') {
                const nested = getOperandValue(tokens, index + 1);
                if (!nested) return null;
                return { value: Math.log10(nested.value), endIndex: nested.endIndex };
            }
            if (tokens[index] === 'ln') {
                const nested = getOperandValue(tokens, index + 1);
                if (!nested) return null;
                return { value: Math.log(nested.value), endIndex: nested.endIndex };
            }
            if (tokens[index] === '√') {
                const nested = getOperandValue(tokens, index + 1);
                if (!nested) return null;
                return { value: Math.sqrt(nested.value), endIndex: nested.endIndex };
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
                return { value: innerValue, endIndex: endIndex - 1 };
            }
            
            const value = parseFloat(tokens[index]);
            if (isNaN(value)) return null;
            return { value, endIndex: index };
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
            } else if (tokens[i] === '%') {
                let value = parseFloat(tokens[i-1]);
                tokens[i-1] = (value / 100).toString();
                tokens.splice(i, 1);
                i--;
            } else if (tokens[i] === 'log' || tokens[i] === 'ln' || tokens[i] === '√') {
                const operand = getOperandValue(tokens, i + 1);
                if (!operand) return null;
                let finalValue = tokens[i] === 'log' ? Math.log10(operand.value) : 
                                 tokens[i] === 'ln' ? Math.log(operand.value) : 
                                 Math.sqrt(operand.value);
                tokens.splice(i, operand.endIndex - i + 1, finalValue.toString());
                i--;
            } else if (tokens[i] === '|') {
                let closeIdx = tokens.indexOf('|', i+1);
                if (closeIdx !== -1 && closeIdx > i + 1) {
                    let innerTokens = tokens.slice(i + 1, closeIdx);
                    let innerExpr = innerTokens.join('');
                    let innerResult = evaluateSimpleExpression(innerExpr);
                    tokens.splice(i, closeIdx - i + 1, Math.abs(parseFloat(innerResult)).toString());
                }
            }
        }
        
        for (let i = 1; i < tokens.length - 1; i += 2) {
            if (tokens[i] === '^') {
                let left = parseFloat(tokens[i-1]);
                let right = parseFloat(tokens[i+1]);
                let result = Math.pow(left, right);
                tokens.splice(i-1, 3, result.toString());
                i -= 2;
            }
        }
        
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
                    return null; 
                }
                tokens.splice(i-1, 3, result.toString());
                i -= 2;
            } 
        }
        
        let result;
        let startIdx = 0;
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
            if (operator === '+') result += operand;
            else if (operator === '-') result -= operand;
        }
        
        return result.toString();
    } catch (e) {
        return null;
    }
}

function tokenizeExpression(expr) {
    let tokens = [];
    let currentNum = '';
    let i = 0;
    
    while (i < expr.length) {
        if (expr.slice(i, i+3) === 'log') {
            if (currentNum) { tokens.push(currentNum); currentNum = ''; }
            tokens.push('log');
            i += 3;
            continue;
        }
        if (expr.slice(i, i+2) === 'ln') {
            if (currentNum) { tokens.push(currentNum); currentNum = ''; }
            tokens.push('ln');
            i += 2;
            continue;
        }

        let char = expr[i];
        if (/[0-9.]/.test(char)) {
            currentNum += char;
        } else {
            if (currentNum) {
                tokens.push(currentNum);
                currentNum = '';
            }
            if ((char === '+' || char === '-') && (tokens.length === 0 || ['+', '-', '*', '/', '^', '(', '|', 'log', 'ln', '√'].includes(tokens[tokens.length - 1]))) {
                currentNum = char;
                i++;
                continue;
            }
            if (char === '√') tokens.push('√');
            else if (char === '|') tokens.push('|');
            else tokens.push(char);
        }
        i++;
    }
    if (currentNum) tokens.push(currentNum);
    return tokens.filter(t => t !== '');
}

function cleanMath(num) {
    return parseFloat(Number(num).toPrecision(14));
}

document.addEventListener('keydown', (event) => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab && activeTab.dataset.mode === 'converter') {
        return; 
    }

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