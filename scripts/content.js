function changeColor() {
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

    function convertChannel(value) {
        const percent = value / 255;
        return Math.round(percent);
    }

    chrome.storage.sync.get(['color', 'state'], (items) => {
        const state = items.state || false;
        const hexColor = items.color || '#FE69B6';
        const rgb = hexToRgb(hexColor);
        if (!state || rgb.length !== 3) {
            removeColor();
            return;
        }
        const rP = convertChannel(rgb[0])
        const gP = convertChannel(rgb[1])
        const bP = convertChannel(rgb[2])


        let filterElement = document.getElementById("colored");
        if (filterElement) {
            filterElement.remove();
        }

        let filterHTML = `<svg xmlns="http://www.w3.org/2000/svg"><filter id="colored" x="-10%" y="-10%" width="120%" height="120%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">\n' +
            '\t<feColorMatrix type="matrix" values=".33 .33 .33 0 0\n' +
            '            .33 .33 .33 0 0\n' +
            '            .33 .33 .33 0 0\n' +
            '            0 0 0 1 0" in="SourceGraphic" result="colormatrix"/>\n' +
            '\t<feComponentTransfer in="colormatrix" result="componentTransfer">\n' +
            '    \t\t<feFuncR type="table" tableValues="${rP} 1"/>\n' +
            '\t\t<feFuncG type="table" tableValues="${gP} 1"/>\n' +
            '\t\t<feFuncB type="table" tableValues="${bP} 1"/>\n' +
            '\t\t<feFuncA type="table" tableValues="0 1"/>\n' +
            '  \t</feComponentTransfer>\n' +
            '\t<feBlend mode="hue" in="componentTransfer" in2="SourceGraphic" result="blend"/>\n' +
            '</filter></svg>`;
        document.documentElement.insertAdjacentHTML('beforeend', filterHTML);
        document.documentElement.setAttribute('style', 'filter: url(#colored)');
    });
}

function removeColor() {
    let filterElement = document.getElementById("colored");
    if (filterElement) {
        filterElement.remove();
    }
    document.documentElement.setAttribute('style', '');
}


changeColor();