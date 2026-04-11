// Advanced Calculator Features 
const memoryDisplay = document.getElementById('memoryDisplay');
let memory = 0;
let currentBase = 'DEC';
let openParenthesesCount = 0; 

const memoryButtons = document.querySelectorAll('.btn.memory');
const scientificButtons = document.querySelectorAll('.btn.scientific');
const numeralToggle = document.querySelector('.numeral-toggle');
const numeralOptions = document.querySelectorAll('.numeral-option');
const numeralMenu = document.querySelector('.numeral-menu');
const moreToggle = document.querySelector('.more-toggle');
const moreOptions = document.querySelectorAll('.more-option');
const moreMenu = document.querySelector('.more-menu');

memoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleMemory(button.textContent.trim());
    });
});

scientificButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleScientific(button.textContent.trim());
    });
});

if (moreToggle) {
    moreToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        moreMenu.classList.toggle('active');
    });
}

moreOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const func = option.getAttribute('data-func');
        handleScientific(func);
        moreMenu.classList.remove('active');
    });
});

if (numeralToggle) {
    numeralToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        numeralMenu.classList.toggle('active');
    });
}

// Numeral system options
numeralOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const system = option.getAttribute('data-system');
        handleNumeralSystem(system);
        
        numeralToggle.textContent = system + ' ▼';
        numeralMenu.classList.remove('active');
    });
});

document.addEventListener('click', () => {
    if (numeralMenu) numeralMenu.classList.remove('active');
    if (moreMenu) moreMenu.classList.remove('active');
});

function hasOperandForPostfix() {
    if (isNewExpression && currentExpression === '0') {
        return false;
    }
    return (!isNewExpression && currentInput !== '') || /[0-9)]$/.test(currentExpression);
}

/**
 * Handle Memory Operations (MC, MR, M+, M-)
 */
function handleMemory(op) {
    const current = parseFloat(currentInput) || 0;
    switch (op) {
        case 'MC':
            memory = 0;
            break;
        case 'MR':
            if (currentInput === '0' || isNewExpression) {
                currentInput = memory.toString();
                currentExpression = memory.toString();
                isNewExpression = false;
            } else {
                currentInput = memory.toString();
                // Update the last number in the expression
                let parts = currentExpression.split(/([+\-*/])/);
                parts[parts.length - 1] = currentInput;
                currentExpression = parts.join('');
            }
            break;
        case 'M+':
            memory += current;
            break;
        case 'M-':
            memory -= current;
            break;
    }
    display.value = currentExpression || '0';
    memoryDisplay.textContent = memory;
}

/**
 * Handle Scientific Operations (Factorial, Square Root, Powers, etc.)
 */
function handleScientific(op) {
    switch (op) {
        case 'x!':
            // Append factorial operator to expression
            if (!hasOperandForPostfix()) {
                return;
            }
            if (currentInput !== '') {
                currentExpression += '!';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '!';
            }
            display.value = currentExpression;
            return;
        
        case '√x':
            if (currentInput !== '' && currentInput !== '0' && currentExpression.endsWith(currentInput) && !(isNewExpression && currentExpression === '0')) {
                const before = currentExpression.slice(0, -currentInput.length);
                currentExpression = `${before}√(${currentInput})`;
                currentInput = '';
                display.value = currentExpression;
                return;
            }

            if (currentExpression === '0' || currentExpression === '') {
                currentExpression = '√(';
                openParenthesesCount++;
            } else {
                currentExpression += '√(';
                openParenthesesCount++;
            }
            currentInput = '';
            isNewExpression = false; 
            display.value = currentExpression;
            return;
        
        case 'x²':
            if (!hasOperandForPostfix()) {
                return;
            }
            if (currentInput !== '') {
                currentExpression += '²';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '²';
            }
            display.value = currentExpression;
            return;
        
        case 'x³':
            if (!hasOperandForPostfix()) {
                return;
            }
            if (currentInput !== '') {
                currentExpression += '³';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '³';
            }
            display.value = currentExpression;
            return;
        
        case '%':
            if (!hasOperandForPostfix()) {
                return;
            }
            if (currentInput !== '') {
                currentExpression += '%';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '%';
            } else {
                return;
            }
            display.value = currentExpression;
            return;
        
        case '1/x':
            // Wrap the current number in reciprocal form, or insert 1/( if empty/after operator
            
            if (/^1\/\(.+\)$/.test(currentInput)) {
                return; 
            }
            
            if (currentInput !== '' && currentInput !== '0' && currentExpression.endsWith(currentInput) && !(isNewExpression && currentExpression === '0')) {
                const before = currentExpression.slice(0, -currentInput.length);
                currentExpression = `${before}1/(${currentInput})`;
                currentInput = `1/(${currentInput})`; // Update currentInput to reflect wrapping
                display.value = currentExpression;
                return;
            }
            
            if (currentExpression === '0' || currentExpression === '' || ['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                if (currentExpression === '0') {
                    currentExpression = '1/(';
                } else {
                    currentExpression += '1/(';
                }
                currentInput = '';
                isNewExpression = false;
                openParenthesesCount++;
                display.value = currentExpression;
                return;
            }
            
            return; 
        
        case '|x|':
            // Append absolute value operator to expression
            if (currentExpression === '0' || currentExpression === '') {
                currentExpression = '|';
            } else if (currentInput === '') {
                currentExpression += '|';
            } else {
                currentExpression += '|';
            }
            currentInput = '';
            isNewExpression = false; 
            display.value = currentExpression;
            return;
        
        case 'x^n':
            // Append power operator to expression
            if (!hasOperandForPostfix()) {
                return;
            }
            if (currentInput !== '') {
                currentExpression += '^';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '^';
            }
            display.value = currentExpression;
            return;
        
        case '()':
            // Count current open parentheses in expression
            const openCount = (currentExpression.match(/\(/g) || []).length;
            const closeCount = (currentExpression.match(/\)/g) || []).length;
            const currentOpen = openCount - closeCount;
            
            if (currentOpen === 0) {
                // No open parentheses, add opening parenthesis
                if (currentExpression === '0') {
                    currentExpression = '(';
                } else {
                    currentExpression += '(';
                }
                currentInput = ''; // Reset current input for new number inside parentheses
                isNewExpression = false; 
                openParenthesesCount++;
            } else {
                // Have open parentheses, add closing parenthesis
                currentExpression += ')';
                currentInput = ''; // Reset current input after closing parentheses
                openParenthesesCount--;
            }
            display.value = currentExpression;
            return;
        
        default:
            return;
    }
}

/**
 * Handle Numeral System Conversions (Binary, Decimal, Hexadecimal, Octal)
 */
function handleNumeralSystem(targetSystem) {
    let currentValue = currentInput;
    let decimalValue;

    try {
        if (currentBase === 'DEC') {
            decimalValue = parseInt(currentValue, 10);
        } else if (currentBase === 'HEX') {
            decimalValue = parseInt(currentValue, 16);
        } else if (currentBase === 'BIN') {
            decimalValue = parseInt(currentValue, 2);
        } else if (currentBase === 'OCT') {
            decimalValue = parseInt(currentValue, 8);
        }
        
        if (isNaN(decimalValue)) {
            alert('Invalid number for conversion!');
            return;
        }
    } catch (e) {
        alert('Invalid number for conversion!');
        return;
    }
    
    let result;
    try {
        if (targetSystem === 'DEC') {
            result = decimalValue.toString();
        } else if (targetSystem === 'HEX') {
            result = decimalValue.toString(16).toUpperCase();
        } else if (targetSystem === 'BIN') {
            if (decimalValue < 0) {
                alert('Binary conversion does not support negative numbers');
                return;
            }
            result = decimalValue.toString(2);
        } else if (targetSystem === 'OCT') {
            if (decimalValue < 0) {
                alert('Octal conversion does not support negative numbers');
                return;
            }
            result = decimalValue.toString(8);
        }
        
        currentInput = result;
        currentBase = targetSystem;
        
        // Update the last number in the expression
        let parts = currentExpression.split(/([+\-*/])/);
        parts[parts.length - 1] = currentInput;
        currentExpression = parts.join('');
        
        display.value = currentExpression;
    } catch (e) {
        alert('Conversion error');
        return;
    }
}

/**
 * Calculate factorial of a number
 */
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

/**
 * Get the base value for numeral system conversion
 */
function getBaseValue(base) {
    switch (base) {
        case 'HEX': return 16;
        case 'BIN': return 2;
        case 'OCT': return 8;
        default: return 10;
    }
}
