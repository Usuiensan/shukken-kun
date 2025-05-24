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
                // カスタムスタイルのデフォルトフォーマットをユーザーの期待する形式に近いものに変更
                const customFormat = settings.customFormat || '“{title}”．{url}，(参照 {accessDate})．';
                const removeParams = settings.removeUrlParameters !== undefined ? settings.removeUrlParameters : true;

                if (removeParams && url.includes('?')) {
                    url = url.split('?')[0];
                }

                let citationText = "";
                if (style === 'SIST') {
                    // Based on user examples: SIST style components (author, siteName, updateDate)
                    // are only included if manually provided via the popup.
                    // Auto-extracted siteName (the variable `siteName`) is NOT used here for the SIST string
                    // if request.manualSiteName is empty. It is used for the custom style though.

                    let sistParts = [];
                    // URL and Access Date are always included.
                    // url variable is (tab.url || "{入手先URL}")
                    // formattedAccessDate is "YYYY-MM-DD"
                    sistParts.push(url + "，(参照 " + formattedAccessDate + ")．");

                    citationText = sistParts.join("");

                    // Clean up consecutive periods that might occur if parts are joined,
                    // e.g., Author．“Title”．．URL... (if SiteName and UpdateDate are empty)
                    // becomes Author．“Title”．URL...
                    citationText = citationText.replace(/．．+/g, '．');

                    // The previous, more complex cleanup and special handling for SIST are removed,
                    // as this simpler construction method directly matches the user's examples.

                } else { // Custom Style
                    citationText = customFormat;
                    citationText = citationText.replace(/{title}/g, title);
                    citationText = citationText.replace(/{url}/g, url);
                    citationText = citationText.replace(/{accessDate}/g, formattedAccessDate);
                } // if/else for style selection ends here

                // Action handling (generatePreview or copyInfo) moved INSIDE this callback
                if (request.action === "generatePreview") {
                    sendResponse({citation: citationText});
                } else if (request.action === "copyInfo") {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        func: copyToClipboard,
                        args: [citationText]
                    }, (injectionResults) => {
                        if (chrome.runtime.lastError || !injectionResults || !injectionResults[0] || !injectionResults[0].result) {
                            console.error("スクリプトの実行またはコピーに失敗しました。", chrome.runtime.lastError);
                            sendResponse({success: false, message: chrome.runtime.lastError ? chrome.runtime.lastError.message : "コピーに失敗しました。"});
                        } else {
                            sendResponse({success: true});
                        }
                    });
                }
            }); // Correctly closes chrome.storage.sync.get callback
            return true; // Indicates that the response is sent asynchronously for tabs.query
        }); // Closes chrome.tabs.query callback
        return true; // Indicates that the response is sent asynchronously for onMessage
    } // Closes if (request.action === "copyInfo" || request.action === "generatePreview")
}); // Closes chrome.runtime.onMessage.addListener

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
