document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copyButton');
    const waybackButton = document.getElementById('waybackButton');
    const optionsButton = document.getElementById('optionsButton');
    const previewArea = document.getElementById('previewArea'); // プレビュー表示用の要素

    // Function to get citation data from the active tab
    async function getCitationData() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (chrome.runtime.lastError) {
                    return reject(new Error(chrome.runtime.lastError.message));
                }
                if (tabs.length > 0 && tabs[0].url) {
                    const tab = tabs[0];
                    const title = tab.title || "タイトルなし";
                    const url = tab.url;

                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;

                    resolve({
                        citationText: `"${title}" ${url} (参照 ${formattedDate})`,
                        url: url
                    });
                } else {
                    reject(new Error('アクティブなタブが見つからないか、URLがありません。'));
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

    // Initial preview load
    updatePreview();

    // Copy button event listener
    if (copyButton) {
        copyButton.addEventListener('click', async () => {
            try {
                const data = await getCitationData();
                await navigator.clipboard.writeText(data.citationText);

                const originalText = copyButton.textContent;
                copyButton.textContent = 'コピーしました！';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            } catch (error) {
                console.error('クリップボードへのコピーに失敗しました:', error);
                alert(`コピーに失敗しました: ${error.message}`);
            }
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
