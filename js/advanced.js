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

function getWrappableTarget() {
    if (currentExpression === '' || currentExpression === '0') return null;

    const piMatch = currentExpression.match(/\d*\.?\d+π$/);
    if (piMatch) {
        return { text: piMatch[0], startIndex: currentExpression.length - piMatch[0].length };
    }

    if (currentInput !== '' && currentExpression.endsWith(currentInput)) {
        return { text: currentInput, startIndex: currentExpression.length - currentInput.length };
    }

    if (currentExpression.endsWith(')')) {
        let depth = 0;
        for (let i = currentExpression.length - 1; i >= 0; i--) {
            if (currentExpression[i] === ')') depth++;
            else if (currentExpression[i] === '(') depth--;

            if (depth === 0) {
                let start = i;
                if (start >= 3 && currentExpression.slice(start - 3, start) === 'log') start -= 3;
                else if (start >= 2 && currentExpression.slice(start - 2, start) === 'ln') start -= 2;
                else if (start >= 1 && currentExpression.slice(start - 1, start) === '√') start -= 1;
                else if (start >= 2 && currentExpression.slice(start - 2, start) === '1/') start -= 2;

                return { text: currentExpression.slice(start), startIndex: start };
            }
        }
    }

    if (currentExpression.endsWith('|')) {
        const pipes = (currentExpression.match(/\|/g) || []).length;
        if (pipes % 2 === 0 && pipes > 0) {
            const start = currentExpression.lastIndexOf('|', currentExpression.length - 2);
            if (start !== -1) {
                return { text: currentExpression.slice(start), startIndex: start };
            }
        }
    }

    const numMatch = currentExpression.match(/\d*\.?\d+$/);
    if (numMatch) {
         return { text: numMatch[0], startIndex: currentExpression.length - numMatch[0].length };
    }

    return null;
}

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

                isNewExpression = true; 
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

function handleScientific(op) {
    switch (op) {
        case 'log':
        case 'ln':
        case '√x':
        case '1/x':
            let funcName = op;
            if (op === '√x') funcName = '√';
            if (op === '1/x') funcName = '1/';

            const target = getWrappableTarget();

            if (target) {
                const before = currentExpression.slice(0, target.startIndex);
                currentInput = `${funcName}(${target.text})`;
                currentExpression = before + currentInput;
                isNewExpression = false;
            } else {
                let openStr = `${funcName}(`;
                if (currentExpression === '0' || currentExpression === '') {
                    currentExpression = openStr;
                } else {
                    currentExpression += openStr;
                }
                openParenthesesCount++;
                currentInput = '';
                isNewExpression = false;
            }
            display.value = currentExpression;
            return;

        case '|x|':
            const pipeCount = (currentExpression.match(/\|/g) || []).length;
            const hasOpenPipe = pipeCount % 2 !== 0;

            if (hasOpenPipe) {
                currentExpression += '|';
                currentInput = '';
                isNewExpression = false;
                display.value = currentExpression;
                return;
            }

            const targetAbs = getWrappableTarget();

            if (targetAbs) {
                const before = currentExpression.slice(0, targetAbs.startIndex);
                const wrapMatch = targetAbs.text.match(/^\|(.*)\|$/);

                
                if (wrapMatch) {
                    currentInput = wrapMatch[1]; 
                } else {
                    currentInput = `|${targetAbs.text}|`; 
                }
                
                currentExpression = before + currentInput;
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
            if (currentExpression.endsWith('/100')) {
                let body = currentExpression.slice(0, -4); 
                let depth = 0;
                let startIndex = -1;
                
                if (body.endsWith(')')) {
                    for (let i = body.length - 1; i >= 0; i--) {
                        if (body[i] === ')') depth++;
                        else if (body[i] === '(') depth--;
                        
                        if (depth === 0) { 
                            startIndex = i;
                            if (startIndex >= 3 && body.slice(startIndex - 3, startIndex) === 'log') startIndex -= 3;
                            else if (startIndex >= 2 && body.slice(startIndex - 2, startIndex) === 'ln') startIndex -= 2;
                            else if (startIndex >= 1 && body.slice(startIndex - 1, startIndex) === '√') startIndex -= 1;
                            else if (startIndex >= 2 && body.slice(startIndex - 2, startIndex) === '1/') startIndex -= 2;
                            break;
                        }
                    }
                } else if (body.endsWith('|')) {
                    startIndex = body.lastIndexOf('|', body.length - 2);
                }

                if (startIndex !== -1) {
                    let before = body.slice(0, startIndex);
                    let block = body.slice(startIndex); 
                    currentExpression = before + `(${block}/100)/100`;
                    currentInput = ''; 
                    isNewExpression = false;
                    display.value = currentExpression;
                }
                return;
            }

            const targetPct = getWrappableTarget();

            if (targetPct) {
                if (/^-?\d*\.?\d+$/.test(targetPct.text)) {
                    let val = parseFloat(targetPct.text);
                    let newVal = cleanMath(val / 100).toString();
                    currentExpression = currentExpression.slice(0, targetPct.startIndex) + newVal;
                    currentInput = newVal;
                } else {
                    currentExpression += '/100';
                    currentInput = ''; 
                }
                isNewExpression = false;
                display.value = currentExpression;
            }
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
    if (typeof cleanMath === 'function') {
        n = cleanMath(n);
    }
    
    if (n < 0 || !Number.isInteger(n)) return NaN; 
    
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