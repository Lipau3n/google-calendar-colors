let mode;
let depth;
let stateInput = document.querySelector('#state');
let hexInput = document.querySelector('#hex');
let rgbInput = document.querySelector('#rgb');
let modeInput = document.querySelector('#mode');
let depthInput = document.querySelector('#depth');

(function() {
    setPopupTheme();

    chrome.storage.sync.get(['color', 'state', 'mode', 'depth'], (items) => {
        const initialColor = items.color || '#FE69B6';
        const state = items.state || false;
        color = initialColor;
        mode = items.mode || 'hue';
        depth = items.depth || 100;
        onChangeState(state, false);
        onColorChange(initialColor, false);
        updateColorsHistory();
        if (state) {
            stateInput.checked = true;
        }
        modeInput.value = mode;
        depthInput.value = depth;
    })

    stateInput.addEventListener("change", (event) => {
        onChangeState(event.target.checked, true);
    });
    hexInput.addEventListener("change", (event) => {
        const color = event.target.value.toUpperCase();
        onColorChange(color, true, true);
    });
    rgbInput.addEventListener("change", (event) => {
        const color = event.target.value.toUpperCase();
        onColorChange(color, true, true);
    });
    modeInput.addEventListener("change", (event) => {
       mode = event.target.value;
       chrome.storage.sync.set({'mode': mode}, () => {});
       onColorChange(hexInput.value, false);
    });
    depthInput.addEventListener("change", (event) => {
        depth = event.target.value;
        chrome.storage.sync.set({'depth': depth}, () => {});
        onColorChange(hexInput.value, false);
    });
})();

function onColorChange(color, set, updateHistory = false) {
    hexInput.value = color;
    rgbInput.value = color;
    sendMessageToContent(color);
    if (set) {
        chrome.storage.sync.set({'color': color}, () => {});
    }
    if (updateHistory) {
        updateColorsHistory(color);
    }
}

function onChangeState(state, set) {
    if (state) {
        chrome.storage.sync.get(['color'], (items) => {
            sendMessageToContent(items.color);
        });
    } else {
        sendMessageToContent(null);
    }
    if (set) {
        chrome.storage.sync.set({'state': state}, () => {});
    }
}

function sendMessageToContent(color, mode) {
    chrome.runtime.sendMessage({'color': color, 'mode': mode}, () => {});
}

function setPopupTheme() {
    const getStoredTheme = () => localStorage.getItem('theme')

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme()
        if (storedTheme) {
            return storedTheme
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    const setTheme = theme => {
        if (theme === 'auto') {
            document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme)
        }
    }

    setTheme(getPreferredTheme())

    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector('#bd-theme')

        if (!themeSwitcher) {
            return
        }

        const themeSwitcherText = document.querySelector('#bd-theme-text')
        const activeThemeIcon = document.querySelector('.theme-icon-active use')
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
        const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href')

        document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
            element.classList.remove('active')
            element.setAttribute('aria-pressed', 'false')
        })

        btnToActive.classList.add('active')
        btnToActive.setAttribute('aria-pressed', 'true')
        activeThemeIcon.setAttribute('href', svgOfActiveBtn)
        const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`
        themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)

        if (focus) {
            themeSwitcher.focus()
        }
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme()
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme())
        }
    })

    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme())

        document.querySelectorAll('[data-bs-theme-value]')
            .forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const theme = toggle.getAttribute('data-bs-theme-value')
                    setStoredTheme(theme)
                    setTheme(theme)
                    showActiveTheme(theme, true)
                })
            })
    })
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ]
        : null;
}

function updateColorsHistory(newColor) {
    chrome.storage.sync.get(['history'], (items) => {
        let history = items.history || [];
        if (newColor) {
            history.unshift(newColor);
            if (history.length > 6) {
                history = history.slice(0, 6);
            }
        }
        document.querySelector('#colors-history-container').innerHTML = '';
        history.forEach((color) => {
            const rgb = hexToRgb(color);
            const el = document.createElement('div');
            el.classList = 'rounded-circle border-3 color-history';
            el.setAttribute('data-color', color);
            el.style.backgroundColor = color;
            el.style.width = '2rem';
            el.style.height = '2rem';
            el.style.cursor = 'pointer';
            el.style.boxShadow = `0px 0px 0px 4px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .3)`;
            el.addEventListener('click', () => {
                onColorChange(color, true);
            })
            document.querySelector('#colors-history-container').appendChild(el);
        })
        chrome.storage.sync.set({'history': history}, () => {});
    });
}