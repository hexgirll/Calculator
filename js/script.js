const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
let currentInput = '';
let operator = '';
let previousInput = '';

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        // Визов функцій для обробки натискань кнопок
        if (button.classList.contains('number') || button.classList.contains('decimal')) {
            if (value === '.' && currentInput.includes('.')) return;
            currentInput += value;
            display.value = currentInput;
        } else if (button.classList.contains('operator')) {
            if (currentInput === '' && previousInput !== '') {
                operator = value;
                return;
            }
            if (previousInput !== '' && currentInput !== '') {
                calculate();
            }
            operator = value;
            previousInput = currentInput;
            currentInput = '';
        } else if (button.classList.contains('equals')) {
            if (previousInput !== '' && currentInput !== '') {
                calculate();
                operator = '';
            }
        } else if (button.classList.contains('clear')) {
            clear();
        } else if (button.classList.contains('backspace')) {
            currentInput = currentInput.slice(0, -1);
            display.value = currentInput;
        }
    });
});

function calculate() {
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    // Оператори
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                alert('Cannot divide by zero!');
                clear();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    display.value = result;
    currentInput = result.toString();
    previousInput = '';
}

// Кнопка C
function clear() {
    display.value = '';
    currentInput = '';
    previousInput = '';
    operator = '';
}

// Обробка клавіатури
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        currentInput += key;
        display.value = currentInput;
    } else if (key === '.') {
        if (!currentInput.includes('.')) {
            currentInput += key;
            display.value = currentInput;
        }
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        if (currentInput === '' && previousInput !== '') {
            operator = key;
            return;
        }
        if (previousInput !== '' && currentInput !== '') {
            calculate();
        }
        operator = key;
        previousInput = currentInput;
        currentInput = '';
    } else if (key === 'Enter' || key === '=') {
        if (previousInput !== '' && currentInput !== '') {
            calculate();
            operator = '';
        }
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
    } else if (key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
        display.value = currentInput;
    }
});
