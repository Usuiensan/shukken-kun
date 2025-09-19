document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copyButton');
    const waybackButton = document.getElementById('waybackButton');
    const optionsButton = document.getElementById('optionsButton');
    const previewArea = document.getElementById('previewArea');

    // Function to get citation data using background script
    async function getCitationData() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({action: "generatePreview"}, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.citation) {
                    resolve({
                        citationText: response.citation
                    });
                } else {
                    reject(new Error('プレビューの生成に失敗しました。'));
                }
            });
        });
    }

    // Function to update preview
    async function updatePreview() {
        if (!previewArea) return;
        try {
            const data = await getCitationData();
            previewArea.textContent = data.citationText;
        } catch (error) {
            console.error('プレビューの生成に失敗しました:', error);
            previewArea.textContent = "プレビューの生成に失敗しました。";
        }
    }

    // Function to update format info display
    function updateFormatInfo() {
        chrome.storage.sync.get(['copyFormat'], (settings) => {
            const copyFormat = settings.copyFormat || 'citation';
            const formatInfoElement = document.getElementById('currentFormat');
            if (formatInfoElement) {
                switch(copyFormat) {
                    case 'html':
                        formatInfoElement.textContent = 'HTML形式';
                        break;
                    case 'markdown':
                        formatInfoElement.textContent = 'Markdown形式';
                        break;
                    case 'citation':
                    default:
                        formatInfoElement.textContent = '引用形式';
                        break;
                }
            }
        });
    }

    // Initial preview load
    updatePreview();
    updateFormatInfo();

    // Listen for storage changes to update preview when settings change
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.copyFormat) {
            updatePreview();
            updateFormatInfo();
        }
    });

    // Copy button event listener
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            chrome.runtime.sendMessage({action: "copyInfo"}, (response) => {
                if (response && response.success) {
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'コピーしました！';
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                    }, 2000);
                } else {
                    alert(`コピーに失敗しました: ${response?.message || 'Unknown error'}`);
                }
            });
        });
    }

    // Wayback machine button event listener
    if (waybackButton) {
        waybackButton.addEventListener('click', () => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs.length > 0 && tabs[0].url) {
                    const waybackUrl = `https://web.archive.org/web/*/${tabs[0].url}`;
                    chrome.tabs.create({ url: waybackUrl });
                } else {
                    alert('アクティブなタブのURLが取得できませんでした。');
                }
            });
        });
    }

    // Options button event listener
    if (optionsButton) {
        optionsButton.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }
});