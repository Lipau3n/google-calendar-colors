function getCurrentTab(callback) {
    let queryOptions = {active: true, lastFocusedWindow: true};
    chrome.tabs.query(queryOptions, ([tab]) => {
        if (chrome.runtime.lastError)
            console.error(chrome.runtime.lastError);
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        callback(tab);
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    getCurrentTab((tab) => {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['scripts/content.js'],
        });
    });
    return true;
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['scripts/content.js'],
        });
    }
})