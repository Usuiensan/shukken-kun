// options.js - 設定ページのJavaScript

// 設定の読み込み
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['copyFormat'], function(result) {
        const format = result.copyFormat || 'citation';
        const radio = document.querySelector(`input[value="${format}"]`);
        if (radio) {
            radio.checked = true;
        }
        updatePreview();
    });

    // ラジオボタンの変更時にプレビューを更新
    const radios = document.querySelectorAll('input[name="copyFormat"]');
    radios.forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });

    // 設定の保存ボタンのイベントリスナー
    document.getElementById('saveButton').addEventListener('click', function() {
        const selectedFormat = document.querySelector('input[name="copyFormat"]:checked').value;
        
        chrome.storage.sync.set({
            copyFormat: selectedFormat
        }, function() {
            const statusMessage = document.getElementById('statusMessage');
            statusMessage.textContent = '設定が保存されました！';
            statusMessage.className = 'status-message success';
            statusMessage.style.display = 'block';
            
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        });
    });
});

// プレビューの更新
function updatePreview() {
    const selectedFormat = document.querySelector('input[name="copyFormat"]:checked').value;
    const previewArea = document.getElementById('formatPreview');
    
    const sampleTitle = "サンプルページタイトル";
    const sampleUrl = "https://example.com";
    const sampleDate = "2025-01-01";
    
    let preview = "";
    switch(selectedFormat) {
        case 'citation':
            preview = `"${sampleTitle}" ${sampleUrl} (参照 ${sampleDate})`;
            break;
        case 'html':
            preview = `<a href="${sampleUrl}">${sampleTitle}</a>`;
            break;
        case 'markdown':
            preview = `[${sampleTitle}](${sampleUrl})`;
            break;
    }
    previewArea.textContent = preview;
}