// Advanced Calculator Features 
const memoryDisplay = document.getElementById('memoryDisplay');
let memory = 0;
let currentBase = 'DEC';
let openParenthesesCount = 0; 

const memoryButtons = document.querySelectorAll('.btn.memory');
const scientificButtons = document.querySelectorAll('.btn.scientific');

const numeralToggles = document.querySelectorAll('.numeral-toggle');
const numeralMenus = document.querySelectorAll('.numeral-menu');
const numeralOptions = document.querySelectorAll('.numeral-option');

const moreToggles = document.querySelectorAll('.more-toggle');
const moreMenus = document.querySelectorAll('.more-menu');
const moreOptions = document.querySelectorAll('.more-option');

memoryButtons.forEach(button => {
    button.addEventListener('click', () => handleMemory(button.textContent.trim()));
});

scientificButtons.forEach(button => {
    button.addEventListener('click', () => handleScientific(button.textContent.trim()));
});

moreToggles.forEach((toggle, index) => {
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        moreMenus[index].classList.toggle('active');
    });
});

moreOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const func = option.getAttribute('data-func');
        handleScientific(func);
        moreMenus.forEach(m => m.classList.remove('active'));
    });
});

numeralToggles.forEach((toggle, index) => {
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        numeralMenus[index].classList.toggle('active');
    });
});

numeralOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const system = option.getAttribute('data-system');
        handleNumeralSystem(system);
        
        numeralToggles.forEach(t => t.textContent = system + ' ▼');
        numeralMenus.forEach(m => m.classList.remove('active'));
    });
});

document.addEventListener('click', () => {
    numeralMenus.forEach(m => m.classList.remove('active'));
    moreMenus.forEach(m => m.classList.remove('active'));
});

function hasOperandForPostfix() {
    if (isNewExpression && currentExpression === '0') {
        return false;
    }
    return (!isNewExpression && currentInput !== '') || /[0-9)]$/.test(currentExpression);
}

/**
 * Handle Memory Operations (MC, MR, MS, M+, M-)
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
                let parts = currentExpression.split(/([+\-*/])/);
                parts[parts.length - 1] = currentInput;
                currentExpression = parts.join('');
            }
            break;
        case 'MS':
            memory = current;
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
 * Handle Scientific Operations
 */
function handleScientific(op) {
    switch (op) {
        case 'log':
        case 'ln':
            if (currentInput !== '' && currentInput !== '0' && currentExpression.endsWith(currentInput) && !(isNewExpression && currentExpression === '0')) {
                const before = currentExpression.slice(0, -currentInput.length);
                currentInput = `${op}(${currentInput})`; 
                currentExpression = `${before}${currentInput}`;
                isNewExpression = false;
            } else {
                currentExpression = (currentExpression === '0' || currentExpression === '') ? `${op}(` : currentExpression + `${op}(`;
                openParenthesesCount++;
                currentInput = '';
                isNewExpression = false; 
            }
            display.value = currentExpression;
            return;

        case 'π':
            if (isNewExpression || currentExpression === '0') {
                currentInput = 'π';
                currentExpression = 'π';
                isNewExpression = false;
            } else {
                currentExpression += 'π';
                currentInput = 'π';
            }
            display.value = currentExpression;
            return;

        case 'x!':
            if (!hasOperandForPostfix()) return;
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
                currentInput = `√(${currentInput})`; 
                currentExpression = `${before}${currentInput}`;
                isNewExpression = false;
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
            if (!hasOperandForPostfix()) return;
            if (currentInput !== '') {
                currentExpression += '²';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '²';
            }
            display.value = currentExpression;
            return;
        
        case 'x³':
            if (!hasOperandForPostfix()) return;
            if (currentInput !== '') {
                currentExpression += '³';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '³';
            }
            display.value = currentExpression;
            return;
        
        case '%':
            if (!hasOperandForPostfix()) return;
            if (currentInput !== '') {
                currentExpression += '%';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '%';
            }
            display.value = currentExpression;
            return;
        
        case '1/x':
            if (currentInput !== '' && currentInput !== '0' && currentExpression.endsWith(currentInput) && !(isNewExpression && currentExpression === '0')) {
                const before = currentExpression.slice(0, -currentInput.length);
                const wrapMatch = currentInput.match(/^1\/\((.*)\)$/);
                
                if (wrapMatch) {
                    currentInput = wrapMatch[1]; 
                } else {
                    currentInput = `1/(${currentInput})`; 
                }
                currentExpression = `${before}${currentInput}`;
                isNewExpression = false;
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
            if (currentInput !== '' && currentInput !== '0' && currentExpression.endsWith(currentInput) && !(isNewExpression && currentExpression === '0')) {
                
                const pipeCount = (currentExpression.match(/\|/g) || []).length;
                const hasOpenPipe = pipeCount % 2 !== 0;

                if (hasOpenPipe) {
                    currentExpression += '|';
                    currentInput = '';
                    isNewExpression = false;
                    display.value = currentExpression;
                    return;
                }

                const before = currentExpression.slice(0, -currentInput.length);
                const wrapMatch = currentInput.match(/^\|(.*)\|$/);
                
                if (wrapMatch) {
                    currentInput = wrapMatch[1]; 
                } else {
                    currentInput = `|${currentInput}|`; 
                }
                currentExpression = `${before}${currentInput}`;
                isNewExpression = false;
                display.value = currentExpression;
                return;
            }
            if (currentExpression === '0' || currentExpression === '') {
                currentExpression = '|';
            } else {
                currentExpression += '|';
            }
            currentInput = '';
            isNewExpression = false; 
            display.value = currentExpression;
            return;
        
        case 'x^n':
            if (!hasOperandForPostfix()) return;
            if (currentInput !== '') {
                currentExpression += '^';
                currentInput = '';
            } else if (currentExpression !== '' && !['+', '-', '*', '/', '^', '('].includes(currentExpression.slice(-1))) {
                currentExpression += '^';
            }
            isNewExpression = false;
            display.value = currentExpression;
            return;
        
        case '()':
            const openCount = (currentExpression.match(/\(/g) || []).length;
            const closeCount = (currentExpression.match(/\)/g) || []).length;
            const currentOpen = openCount - closeCount;
            
            if (currentOpen === 0) {
                if (currentExpression === '0') {
                    currentExpression = '(';
                } else {
                    currentExpression += '(';
                }
                currentInput = ''; 
                isNewExpression = false; 
                openParenthesesCount++;
            } else {
                currentExpression += ')';
                currentInput = ''; 
                openParenthesesCount--;
            }
            display.value = currentExpression;
            return;
        
        default:
            return;
    }
}

/**
 * Handle Numeral System Conversions
 */
function handleNumeralSystem(targetSystem) {
    let currentValue = currentInput;
    let decimalValue;

    try {
        if (currentBase === 'DEC') decimalValue = parseInt(currentValue, 10);
        else if (currentBase === 'HEX') decimalValue = parseInt(currentValue, 16);
        else if (currentBase === 'BIN') decimalValue = parseInt(currentValue, 2);
        else if (currentBase === 'OCT') decimalValue = parseInt(currentValue, 8);
        
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
        if (targetSystem === 'DEC') result = decimalValue.toString();
        else if (targetSystem === 'HEX') result = decimalValue.toString(16).toUpperCase();
        else if (targetSystem === 'BIN') {
            if (decimalValue < 0) return alert('Binary conversion does not support negative numbers');
            result = decimalValue.toString(2);
        } else if (targetSystem === 'OCT') {
            if (decimalValue < 0) return alert('Octal conversion does not support negative numbers');
            result = decimalValue.toString(8);
        }
        
        currentInput = result;
        currentBase = targetSystem;
        
        let parts = currentExpression.split(/([+\-*/])/);
        parts[parts.length - 1] = currentInput;
        currentExpression = parts.join('');
        display.value = currentExpression;
    } catch (e) {
        alert('Conversion error');
        return;
    }
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function getBaseValue(base) {
    switch (base) {
        case 'HEX': return 16;
        case 'BIN': return 2;
        case 'OCT': return 8;
        default: return 10;
    }
}