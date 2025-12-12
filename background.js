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

            chrome.storage.sync.get(['citationStyle', 'customFormat', 'removeUrlParameters', 'copyFormat'], (settings) => {
                const style = settings.citationStyle || 'SIST';
                const customFormat = settings.customFormat || '"{title}"．{url}，(参照 {accessDate})．';
                const removeParams = settings.removeUrlParameters !== undefined ? settings.removeUrlParameters : true;
                const copyFormat = settings.copyFormat || 'citation';

                if (removeParams && url.includes('?')) {
                    try {
                        const parsed = new URL(url);
                        const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
                        // YouTube 系は重要なパラメータ（例: v, list）を保持する
                        if (hostname === 'youtu.be' || hostname.includes('youtube.com')) {
                            const base = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
                            const keep = new URLSearchParams();
                            if (parsed.searchParams.has('v')) {
                                keep.set('v', parsed.searchParams.get('v'));
                            }
                            if (parsed.searchParams.has('list')) {
                                keep.set('list', parsed.searchParams.get('list'));
                            }
                            const qs = keep.toString();
                            url = qs ? `${base}?${qs}` : base;
                        } else {
                            url = url.split('?')[0];
                        }
                    } catch (e) {
                        // URL 解析に失敗したら従来の動作にフォールバック
                        url = url.split('?')[0];
                    }
                }

                let citationText = "";
                
                // 新しいコピー形式に対応
                switch(copyFormat) {
                    case 'html':
                        citationText = `<a href="${url}">${title}</a>`;
                        break;
                    case 'markdown':
                        citationText = `[${title}](${url})`;
                        break;
                    case 'citation':
                    default:
                        // 標準的な引用形式
                        citationText = `"${title}" ${url} (参照 ${formattedAccessDate})`;
                        break;
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