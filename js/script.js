'use strict';

const state = {
  current: '0',
  previous: null,
  operator: null,
  waitingForOperand: false,
  memory: 0,
  historyLog: [],
  pendingPower: false,
  powerBase: null,
};

// ========== CONVERTER CONFIG ==========
const converterConfig = {
  length: {
    units: ['мм', 'см', 'м', 'км', 'дюйм', 'фут', 'миля'],
    toBase: { 'мм': 0.001, 'см': 0.01, 'м': 1, 'км': 1000, 'дюйм': 0.0254, 'фут': 0.3048, 'миля': 1609.344 },
  },
  mass: {
    units: ['мг', 'г', 'кг', 'т', 'фунт', 'унція'],
    toBase: { 'мг': 0.000001, 'г': 0.001, 'кг': 1, 'т': 1000, 'фунт': 0.453592, 'унція': 0.0283495 },
  },
  area: {
    units: ['мм²', 'см²', 'м²', 'км²', 'га', 'акр'],
    toBase: { 'мм²': 0.000001, 'см²': 0.0001, 'м²': 1, 'км²': 1000000, 'га': 10000, 'акр': 4046.86 },
  },
};
let currentConvType = 'length';

// ========== DOM ЕЛЕМЕНТИ ==========
const outputEl = document.getElementById('output');
const historyEl = document.getElementById('history');
const historyList = document.getElementById('historyList');
const convInput = document.getElementById('convInput');
const convFrom = document.getElementById('convFrom');
const convTo = document.getElementById('convTo');
const convResult = document.getElementById('convResult');
const convBtn = document.getElementById('convBtn');
const copyHistoryBtn = document.getElementById('copyHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const themeToggle = document.getElementById('themeToggle');



function updateDisplay() {
  const val = state.current;
  outputEl.textContent = formatNumber(val);
  const len = String(val).length;
  outputEl.classList.toggle('small', len > 10);
  outputEl.classList.toggle('xs', len > 16);
}

function formatNumber(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  if (!isFinite(num)) return '∞';
  if (Number.isInteger(num) && Math.abs(num) < 1e15) {
    return num.toLocaleString('uk-UA');
  }
  return parseFloat(num.toPrecision(10)).toString();
}

function setDisplay(val) {
  state.current = String(val);
  updateDisplay();
} 

// ========== HISTORY ==========
function addHistory(expr, result) {
  const entry = `${expr} = ${result}`;
  state.historyLog.unshift(entry);
  if (state.historyLog.length > 50) state.historyLog.pop();
  renderHistoryList();
}

function renderHistoryList() {
  historyList.innerHTML = '';
  state.historyLog.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.textContent = item;
    div.addEventListener('click', () => {
      const result = item.split(' = ').pop();
      setDisplay(result.replace(/\s/g, ''));
      state.waitingForOperand = false;
    });
    historyList.appendChild(div);
  });
}

// ========== basic input 
function inputDigit(digit) {
  if (state.waitingForOperand) {
    state.current = digit;
    state.waitingForOperand = false;
  } else {
    state.current = state.current === '0' ? digit : state.current + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (state.waitingForOperand) {
    state.current = '0.';
    state.waitingForOperand = false;
    updateDisplay();
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
    updateDisplay();
  }
}

function clearAll() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.pendingPower = false;
  state.powerBase = null;
  historyEl.textContent = '';
  updateDisplay();
}

function toggleSign() {
  const num = parseFloat(state.current);
  if (num !== 0) {
    setDisplay(String(-num));
  }
}

function applyPercent() {
  const num = parseFloat(state.current);
  if (state.previous !== null && state.operator) {
    setDisplay(String((parseFloat(state.previous) * num) / 100));
  } else {
    setDisplay(String(num / 100));
  }
}

/// operators 
function handleOperator(op) {
  console.log("РОЗРОБНИК А: Написати логіку оператора", op);
  // Тут має бути логіка збереження state.previous та state.operator
}

function calculate() {
  console.log("РОЗРОБНИК А: Написати логіку обчислення (=)");
  // Тут має бути виконання математики і виклик addHistory()
}

function handleSci(action) {
  console.log("РОЗРОБНИК А: Написати логіку для наукових/пам'яті:", action);
  // Тут має бути логіка для factorial, sqrt, x², xⁿ, log, memory-store тощо
}



function handleButton(action, value) {
  switch (action) {
    case 'digit': inputDigit(value); break;
    case 'decimal': inputDecimal(); break;
    case 'clear': clearAll(); break;
    case 'sign': toggleSign(); break;
    case 'percent': applyPercent(); break;
    case 'operator': handleOperator(value); break; // Викликає заглушку Розробника А
    case 'equals': calculate(); break;             // Викликає заглушку Розробника А
    default: handleSci(action); break;             // Викликає заглушку Розробника А
  }
}

document.getElementById('calculator').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const { action, value } = btn.dataset;
  if (action) handleButton(action, value);

  btn.style.transform = 'scale(0.93)';
  setTimeout(() => { btn.style.transform = ''; }, 100);
});

// ========== ПЕРЕМИКАННЯ РЕЖИМІВ (ТВОЯ ЧАСТИНА) ==========
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const mode = tab.dataset.mode;
    document.getElementById('mode-standard').classList.toggle('hidden', mode !== 'standard');
    document.getElementById('mode-scientific').classList.toggle('hidden', mode !== 'scientific');
    document.getElementById('mode-converter').classList.toggle('hidden', mode !== 'converter');
  });
});

// ========== converter logic (ТВОЯ ЧАСТИНА) ==========
function populateConvSelects(type) {
  const { units } = converterConfig[type];
  [convFrom, convTo].forEach((sel, i) => {
    sel.innerHTML = '';
    units.forEach((u, idx) => {
      const opt = document.createElement('option');
      opt.value = u; opt.textContent = u;
      if (i === 1 && idx === 1) opt.selected = true; // За замовчуванням друге поле - інша одиниця
      sel.appendChild(opt);
    });
  });
}

document.querySelectorAll('.conv-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.conv-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentConvType = tab.dataset.conv;
    populateConvSelects(currentConvType);
    convResult.textContent = '—';
  });
});

convBtn.addEventListener('click', () => {
  const val = parseFloat(convInput.value);
  if (isNaN(val)) { convResult.textContent = 'Введіть число'; return; }
  const from = convFrom.value;
  const to = convTo.value;
  
  // Логіка конвертації через базову одиницю
  const { toBase } = converterConfig[currentConvType];
  const baseVal = val * toBase[from]; // Переводимо в базу (напр. в UAH)
  const result = baseVal / toBase[to]; // З бази в цільову

  const formatted = parseFloat(result.toPrecision(8));
  convResult.textContent = `${val} ${from} = ${formatted} ${to}`;
});

// ========== history buttons
copyHistoryBtn.addEventListener('click', () => {
  if (state.historyLog.length === 0) { showToast('Історія порожня'); return; }
  const text = state.historyLog.join('\n');
  navigator.clipboard.writeText(text).then(() => showToast('Скопійовано!'))
    .catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Скопійовано!');
    });
});

clearHistoryBtn.addEventListener('click', () => {
  state.historyLog = [];
  renderHistoryList();
  showToast('Історію очищено');
});

// ========== TOAST messaage 
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ========== Switch Theme 
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', themeToggle.checked);
  document.body.classList.toggle('light', !themeToggle.checked);
});


populateConvSelects('length');
updateDisplay();

/*
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
    });*/