(function() {
    let color = '#FE69B6';
    let hexInput = document.querySelector('#hex');
    let rgbInput = document.querySelector('#rgb');

    chrome.storage.sync.get(['color'], (items) => {
        let initialColor = items.color || '#FE69B6';
        onColorChange(initialColor, false);
    })

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
        if (set) {
            chrome.storage.sync.set({'color': color}, () => {});
        }
    }
})();