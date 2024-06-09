(function() {
    setPopupTheme();

    let color = '#FE69B6';

    let stateInput = document.querySelector('#state');
    let hexInput = document.querySelector('#hex');
    let rgbInput = document.querySelector('#rgb');

    chrome.storage.sync.get(['color', 'state'], (items) => {
        const initialColor = items.color || '#FE69B6';
        const state = items.state || false;
        color = initialColor;
        onChangeState(state, false);
        onColorChange(initialColor, false);
        if (state) {
            stateInput.checked = true;
        }
    })

    stateInput.addEventListener("change", (event) => {
        onChangeState(event.target.checked, true);
    });
    hexInput.addEventListener("change", (event) => {
        color = event.target.value.toUpperCase();
        onColorChange(color, true);
    });
    rgbInput.addEventListener("change", (event) => {
        color = event.target.value.toUpperCase();
        onColorChange(color, true);
    });

    function onColorChange(color, set) {
        hexInput.value = color;
        rgbInput.value = color;
        sendMessageToContent(color);
        if (set) {
            chrome.storage.sync.set({'color': color}, () => {});
        }
    }

    function onChangeState(state, set) {
        if (state) {
            sendMessageToContent(color);
        } else {
            sendMessageToContent(null);
        }
        if (set) {
            chrome.storage.sync.set({'state': state}, () => {});
        }
    }
})();


function sendMessageToContent(color) {
    chrome.runtime.sendMessage({'color': color}, () => {});
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