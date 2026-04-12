'use strict';

// 1. THEME TOGGLE
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark', themeToggle.checked);
        document.body.classList.toggle('light', !themeToggle.checked);
    });
}

// 2. MODE TABS (Standard, Scientific, Converter)
document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        
        const mode = tab.dataset.mode;
        document.getElementById('mode-standard').classList.toggle('hidden', mode !== 'standard');
        document.getElementById('mode-scientific').classList.toggle('hidden', mode !== 'scientific');
        document.getElementById('mode-converter').classList.toggle('hidden', mode !== 'converter');
        
        const mainDisplay = document.querySelector('.display-container');
        if (mainDisplay) {
            mainDisplay.classList.toggle('hidden', mode === 'converter');
        }
    });
});


// 3. CONVERTER LOGIC 
const convInput = document.getElementById('convInput');
const convFrom = document.getElementById('convFrom');
const convTo = document.getElementById('convTo');
const convResult = document.getElementById('convResult');
const convBtn = document.getElementById('convBtn');

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

let liveCurrencyRates = {};
let isCurrencyLoaded = false;
let currentConvType = 'length';

// New keypad logic
let currentConvValue = '0';
const convNumBtns = document.querySelectorAll('.conv-num');
const convClear = document.getElementById('convClear');
const convBackspace = document.getElementById('convBackspace');

function updateConvDisplay() {
    if (convInput) convInput.value = currentConvValue;
}

convNumBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.textContent.trim();
        if (val === '.') {
            if (!currentConvValue.includes('.')) currentConvValue += '.';
        } else {
            if (currentConvValue === '0') currentConvValue = val;
            else currentConvValue += val;
        }
        updateConvDisplay();
    });
});

if (convClear) {
    convClear.addEventListener('click', () => {
        currentConvValue = '0';
        updateConvDisplay();
        convResult.textContent = '—';
    });
}

if (convInput) {
    convInput.addEventListener('input', (e) => {
        currentConvValue = e.target.value;
        if (currentConvValue === '') currentConvValue = '0';
    });
}

if (convBackspace) {
    convBackspace.addEventListener('click', () => {
        if (currentConvValue.length > 1) {
            currentConvValue = currentConvValue.slice(0, -1);
        } else {
            currentConvValue = '0';
        }
        updateConvDisplay();
    });
}

function populateConvSelects(type) {
    const { units } = converterConfig[type];
    [convFrom, convTo].forEach((sel, i) => {
        sel.innerHTML = '';
        units.forEach((u, idx) => {
            const opt = document.createElement('option');
            opt.value = u; opt.textContent = u;
            if (i === 1 && idx === 1) opt.selected = true; 
            sel.appendChild(opt);
        });
    });
}

async function fetchCurrencies() {
    try {
        convResult.textContent = 'Завантаження валют...';
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();

        if (data.result === "success") {
            liveCurrencyRates = data.rates;
            isCurrencyLoaded = true;
            populateCurrencySelects();
            convResult.textContent = '—';
        } else {
            throw new Error('Помилка API');
        }
    } catch (error) {
        convResult.textContent = 'Помилка мережі!';
        console.error(error);
    }
}

function populateCurrencySelects() {
    const currencies = Object.keys(liveCurrencyRates); 
    const currencyTranslator = new Intl.DisplayNames(['uk-UA'], { type: 'currency' });

    [convFrom, convTo].forEach((sel, i) => {
        sel.innerHTML = '';
        
        currencies.forEach((currency) => {
            const opt = document.createElement('option');
            opt.value = currency; 
            
            try {
                const fullName = currencyTranslator.of(currency);
                const capitalizedName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
                opt.textContent = `${currency} - ${capitalizedName}`;
            } catch (error) {
                opt.textContent = currency;
            }
            
            if (i === 0 && currency === 'USD') opt.selected = true;
            if (i === 1 && currency === 'UAH') opt.selected = true;
            
            sel.appendChild(opt);
        });
    });
}

document.querySelectorAll('.conv-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.conv-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        currentConvType = tab.dataset.conv;
        convResult.textContent = '—';

        if (currentConvType === 'currency') {
            if (!isCurrencyLoaded) {
                fetchCurrencies();
            } else {
                populateCurrencySelects();
            }
        } else {
            populateConvSelects(currentConvType);
        }
    });
});

if (convBtn) {
    convBtn.addEventListener('click', () => {
        const val = parseFloat(currentConvValue);
        if (isNaN(val)) { convResult.textContent = 'Введіть число'; return; }
        const from = convFrom.value;
        const to = convTo.value;
        
        let exprText = '';
        let resultText = '';
        
        if (currentConvType === 'currency') {
            if (!isCurrencyLoaded) return;
            const rateFrom = liveCurrencyRates[from];
            const rateTo = liveCurrencyRates[to];

            const result = (val / rateFrom) * rateTo;
            exprText = `${val} ${from}`;
            resultText = `${result.toFixed(2)} ${to}`;

        } else {
            const { toBase } = converterConfig[currentConvType];
            const baseVal = val * toBase[from]; 
            const result = baseVal / toBase[to]; 

            const formatted = parseFloat(result.toPrecision(8));
            exprText = `${val} ${from}`;
            resultText = `${formatted} ${to}`;
        }

        convResult.textContent = `${exprText} = ${resultText}`;

        if (typeof window.addHistory === 'function') {
            window.addHistory(exprText, resultText);
        }
    });
}

populateConvSelects('length');

// 4. HISTORY UI
const historyList = document.getElementById('historyList');
const copyHistoryBtn = document.getElementById('copyHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

function renderHistoryList() {
    if (!historyList) return;
    historyList.innerHTML = '';
    
    if (typeof historyLog !== 'undefined') {
        historyLog.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = item;
            
            div.addEventListener('click', () => {
                const resultPart = item.split(' = ').pop(); 
                
                const rawNumber = parseFloat(resultPart.replace(/[^\d.-]/g, ''));
                if (isNaN(rawNumber)) return;

                const activeTab = document.querySelector('.tab.active');
                const mode = activeTab ? activeTab.dataset.mode : 'standard';

                if (mode === 'converter') {
                    if (typeof currentConvValue !== 'undefined') {
                        currentConvValue = rawNumber.toString();
                        if (typeof updateConvDisplay === 'function') updateConvDisplay();
                    }
                } else {
                    if (typeof currentInput !== 'undefined' && typeof currentExpression !== 'undefined') {
                        currentInput = rawNumber.toString();
                        currentExpression = currentInput;
                        if (typeof isNewExpression !== 'undefined') isNewExpression = true;
                        if (typeof updateDisplay === 'function') updateDisplay();
                    }
                }
            });
            
            historyList.appendChild(div);
        });
    }
}

if (copyHistoryBtn) {
    copyHistoryBtn.addEventListener('click', () => {
        if (typeof historyLog === 'undefined' || historyLog.length === 0) { 
            showToast('Історія порожня'); 
            return; 
        }
        const text = historyLog.join('\n');
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
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        if (typeof historyLog !== 'undefined') {
            historyLog.length = 0; // Clears the array safely
        }
        renderHistoryList();
        showToast('Історію очищено');
    });
}

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

window.addHistory = function(expr, result) {
    if (typeof historyLog === 'undefined') {
        window.historyLog = [];
    }
    const entry = `${expr} = ${result}`;
    historyLog.unshift(entry);
    if (historyLog.length > 50) historyLog.pop();
    renderHistoryList();
}