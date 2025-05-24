chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "copyInfo" || request.action === "generatePreview") {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length === 0) {
                sendResponse({success: false, message: "アクティブなタブが見つかりません。"});
                return true;
            }
            const tab = tabs[0];
            const title = tab.title || "{ウェブページの題名}";
            let url = tab.url || "{入手先URL}";
            const accessDate = new Date();
            const year = accessDate.getFullYear();
            const month = (accessDate.getMonth() + 1).toString().padStart(2, '0');
            const day = accessDate.getDate().toString().padStart(2, '0');
            const formattedAccessDate = `${year}-${month}-${day}`;

            chrome.storage.sync.get(['citationStyle', 'customFormat', 'removeUrlParameters'], (settings) => {
                const style = settings.citationStyle || 'SIST';
                const customFormat = settings.customFormat || '“{title}”．{url}，(参照 {accessDate})．';
                const removeParams = settings.removeUrlParameters !== undefined ? settings.removeUrlParameters : true;

                if (removeParams && url.includes('?')) {
                    url = url.split('?')[0];
                }

                let citationText = "";
                if (style === 'SIST') {
                    let sistParts = [];
                    sistParts.push(url + "，(参照 " + formattedAccessDate + ")．");
                    citationText = sistParts.join("").replace(/．．+/g, '．');
                } else {
                    citationText = customFormat
                        .replace(/{title}/g, title)
                        .replace(/{url}/g, url)
                        .replace(/{accessDate}/g, formattedAccessDate);
                }

                if (request.action === "generatePreview") {
                    sendResponse({citation: citationText});
                } else if (request.action === "copyInfo") {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        func: copyToClipboard,
                        args: [citationText]
                    }, (injectionResults) => {
                        const error = chrome.runtime.lastError;
                        if (error || !injectionResults || !injectionResults[0]?.result) {
                            console.error("コピーに失敗しました。", error);
                            sendResponse({success: false, message: error ? error.message : "コピーに失敗しました。"});
                        } else {
                            sendResponse({success: true});
                        }
                    });
                }
            });
            return true;
        });
        return true;
    }
});

function copyToClipboard(text) {
    const ta = document.createElement('textarea');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    ta.value = text;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(ta);
        return successful;
    } catch (err) {
        document.body.removeChild(ta);
        return false;
    }
}
