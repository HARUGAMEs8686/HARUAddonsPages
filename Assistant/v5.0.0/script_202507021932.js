// APIキーの不正利用は禁止です

let API_KEY = ''; // APIキーはローカルストレージから読み込むため、初期値は空にする

const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

let addonQA = null;

let chatHistory = [];

const chatBox = document.getElementById('chat-box');

const userInput = document.getElementById('user-input');

const sendButton = document.getElementById('send-button');

const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyButton = document.getElementById('save-api-key-button');

// Q&A情報を読み込む関数
async function loadAddonQA() {
    try {
        const response = await fetch('addon_qa.json'); // JSONファイルのパスを指定
        if (!response.ok) {
            throw new Error(`Failed to load addon_qa.json: ${response.status} ${response.statusText}`);
        }
        addonQA = await response.json(); // 読み込んだJSONデータをaddonQA変数に格納
        console.log('アドオンQ&A情報が正常にロードされました:', addonQA);

        const initialPrompt = `
あなたは私のアドオン「${addonQA.title}」のサポートチャットボットです。
ユーザーからの質問に対し、以下の情報に基づいて正確かつ丁寧に回答してください。
もし提供された情報で答えられない場合は、「その情報については持ち合わせておりません」のように回答してください。
****を使った太字は見出しなどの時のみ利用
HARUAddonsのアドオンに関係しないことの回答は禁止
Q&A通りに回答せずに、分かりやすい文章や言葉遣いに変換してもOKです

---
アドオン名: ${addonQA.title}
説明: ${addonQA.description}

よくある質問と回答 (Q&A):
${addonQA.faqs.map(item => `Q: ${item.q}\nA: ${item.a}`).join('\n\n')}
---
`;
        chatHistory.push({ role: 'user', parts: [{ text: initialPrompt }] });

        // APIキーに関する注意書きを一番下のbotメッセージとして表示
        const apiKeyNoticeDiv = chatBox.querySelector('.api-key-notice');
        if (apiKeyNoticeDiv) {
            apiKeyNoticeDiv.style.opacity = '1'; // 非表示になっていれば表示
            apiKeyNoticeDiv.style.transform = 'translateY(0)'; // アニメーション
        }
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error('アドオンQ&A情報のロード中にエラーが発生しました:', error);
        addMessage('アドオン情報を読み込めませんでした。サポートチャットが正常に機能しない可能性があります。', 'bot');
    }
}

// メッセージをチャットボックスに追加する関数 (タイピング効果なし)
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    const paragraph = document.createElement('p');
    let formattedText = text;
    formattedText = formattedText.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formattedText = formattedText.replace(urlRegex, url => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    paragraph.innerHTML = formattedText;
    messageDiv.appendChild(paragraph);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// タイピング効果でメッセージを追加する関数
function typeMessage(text, sender, element, callback) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    const paragraph = document.createElement('p');
    messageDiv.appendChild(paragraph);
    chatBox.appendChild(messageDiv);

    let i = 0;
    const speed = 30; // 1文字あたりの表示速度 (ミリ秒)
    let typedContent = ''; // タイピング中のコンテンツを保持

    function type() {
        if (i < text.length) {
            typedContent += text.charAt(i);
            let currentDisplay = typedContent;

            // 改行をリアルタイムで<br>に変換
            currentDisplay = currentDisplay.replace(/\n/g, '<br>');

            // ** または * で囲まれた部分を一時的に <span class="temp-bold"> で強調
            // ネストされた強調を避けるため、正規表現の順序に注意
            currentDisplay = currentDisplay.replace(/\*\*(.*?)\*\*/g, '<span class="temp-bold">$1</span>');
            currentDisplay = currentDisplay.replace(/\*(.*?)\*/g, '<span class="temp-bold">$1</span>');

            // URLも一時的にリンクとして表示
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            currentDisplay = currentDisplay.replace(urlRegex, url => {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });

            paragraph.innerHTML = currentDisplay;
            chatBox.scrollTop = chatBox.scrollHeight;
            i++;
            setTimeout(type, speed);
        } else {
            // 全ての文字が入力されたら、最終的なHTMLフォーマットを適用
            let finalFormattedText = text;
            finalFormattedText = finalFormattedText.replace(/\n/g, '<br>');
            finalFormattedText = finalFormattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            finalFormattedText = finalFormattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            finalFormattedText = finalFormattedText.replace(urlRegex, url => {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });
            paragraph.innerHTML = finalFormattedText; // 最終的なHTMLを適用

            if (callback) {
                callback();
            }
        }
    }
    type();
}

// Gemini APIにリクエストを送信する関数
async function sendMessageToGemini(message) {
    if (!API_KEY) {
        addMessage('Gemini APIキーが設定されていません。画面上部に表示されているAPIキー入力をお願いします。', 'bot');
        return;
    }
    if (!addonQA) {
        addMessage('アドオン情報がまだ読み込まれていません。しばらくお待ちください。', 'bot');
        return;
    }

    addMessage(message, 'user');
    chatHistory.push({ role: 'user', parts: [{ text: message }] });

    userInput.value = '';
    sendButton.disabled = true;
    userInput.disabled = true;

    try {
        const payload = {
            contents: chatHistory,
        };

        const response = await fetch(`${API_URL_BASE}?key=${API_KEY}`, { // API_KEYをURLに含める
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`APIリクエストが失敗しました: ${response.status} ${response.statusText}. 詳細: ${errorBody}`);
        }

        const data = await response.json();
        const geminiResponse = data.candidates[0].content.parts[0].text;
        typeMessage(geminiResponse, 'bot', chatBox, () => {
            chatHistory.push({ role: 'model', parts: [{ text: geminiResponse }] });
        });
    } catch (error) {
        console.error('Gemini APIエラー:', error);
        addMessage('エラーが発生しました。APIキーが正しいか確認してください。', 'bot'); // エラーメッセージにAPIキーの確認を促す
    } finally {
        sendButton.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// APIキーをローカルストレージから読み込む
function loadApiKey() {
    return localStorage.getItem('gemini_api_key');
}

// APIキーをローカルストレージに保存する
function saveApiKey(key) {
    localStorage.setItem('gemini_api_key', key);
}

// APIキー入力モーダルを表示する
function showApiKeyModal() {
    apiKeyModal.style.display = 'flex'; // flexを使って中央寄せを維持
    userInput.disabled = true;
    sendButton.disabled = true;
}

// APIキー入力モーダルを非表示にする
function hideApiKeyModal() {
    apiKeyModal.style.display = 'none';
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
}

// 保存ボタンのクリックイベント
saveApiKeyButton.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        saveApiKey(key);
        API_KEY = key; // グローバル変数にセット
        hideApiKeyModal();
        addMessage('APIキーが保存されました。チャットを開始できます！', 'bot');
    } else {
        alert('APIキーを入力してください。');
    }
});

// 送信ボタンクリックイベント
sendButton.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        sendMessageToGemini(message);
    }
});

// Enterキー押下イベント
userInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});

// ページがロードされたときにQ&A情報を読み込み、APIキーの有無を確認
document.addEventListener('DOMContentLoaded', () => {
    loadAddonQA(); // まずQ&A情報をロード

    API_KEY = loadApiKey(); // ローカルストレージからAPIキーを読み込む

    if (!API_KEY) {
        showApiKeyModal(); // APIキーがなければモーダルを表示
    }
});