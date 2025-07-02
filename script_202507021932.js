const API_URL = `/.netlify/functions/gemini-proxy`; 

let addonQA = null;
let chatHistory = [];

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Q&A情報を読み込む関数
async function loadAddonQA() {
    try {
        const response = await fetch('addon_qa.json'); // JSONファイルのパスを指定
        if (!response.ok) {
            throw new Error(`Failed to load addon_qa.json: ${response.status} ${response.statusText}`);
        }
        addonQA = await response.json(); // 読み込んだJSONデータをaddonQA変数に格納
        console.log('アドオンQ&A情報が正常にロードされました:', addonQA);

        // Q&A情報を初期プロンプトとしてchatHistoryに追加
        const initialPrompt = `
あなたは私のアドオン「${addonQA.title}」のサポートチャットボットです。
ユーザーからの質問に対し、以下の情報に基づいて正確かつ丁寧に回答してください。
もし提供された情報で答えられない場合は、「その情報については持ち合わせておりません」のように回答してください。
****を使った太字は見出しなどの時のみ利用
HARUAddonsのアドオンに関係しないことの回答は禁止

---
アドオン名: ${addonQA.title}
説明: ${addonQA.description}

よくある質問と回答 (Q&A):
${addonQA.faqs.map(item => `Q: ${item.q}\nA: ${item.a}`).join('\n\n')}
---
`;
        // 初期プロンプトをユーザーのロールとして追加し、Geminiがこれをコンテキストとして利用できるようにする
        chatHistory.push({ role: 'user', parts: [{ text: initialPrompt }] });
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

    paragraph.innerHTML = formattedText; // innerHTMLを使用
    messageDiv.appendChild(paragraph);
    chatBox.appendChild(messageDiv);
    // スクロールを一番下へ
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

    function type() {
        if (i < text.length) {
            paragraph.textContent += text.charAt(i);
            chatBox.scrollTop = chatBox.scrollHeight; // スクロールを維持
            i++;
            setTimeout(type, speed);
        } else {
            // 全ての文字が入力されたら、最終的なHTMLフォーマットを適用
            let formattedText = text;
            formattedText = formattedText.replace(/\n/g, '<br>');
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            formattedText = formattedText.replace(urlRegex, url => {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });
            paragraph.innerHTML = formattedText; // 最終的なHTMLを適用

            if (callback) {
                callback();
            }
        }
    }
    type();
}

// Gemini APIにリクエストを送信する関数
async function sendMessageToGemini(message) {
    if (!addonQA) {
        addMessage('アドオン情報がまだ読み込まれていません。しばらくお待ちください。', 'bot');
        return;
    }

    addMessage(message, 'user');
    chatHistory.push({ role: 'user', parts: [{ text: message }] });

    userInput.value = ''; // 入力欄をクリア
    sendButton.disabled = true; // 送信ボタンを無効化（処理中）
    userInput.disabled = true; // 入力欄も無効化

    try {
        const payload = {
            contents: chatHistory, // 会話履歴全体を送信
        };

        const response = await fetch(API_URL, { // ここでNetlify Functionsのエンドポイントを呼び出す
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

        // Geminiの応答をチャット履歴に追加し、表示 (タイピング効果を使用)
        // タイピング完了後にチャット履歴にモデルの応答を追加する
        typeMessage(geminiResponse, 'bot', chatBox, () => {
            chatHistory.push({ role: 'model', parts: [{ text: geminiResponse }] });
        });
    } catch (error) {
        console.error('Gemini APIエラー:', error);
        addMessage('エラーが発生しました。もう一度お試しいただくか、しばらくお待ちください。', 'bot');
    } finally {
        sendButton.disabled = false; // 送信ボタンを有効化
        userInput.disabled = false; // 入力欄も有効化
        userInput.focus(); // 入力欄にフォーカス
    }
}

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
        sendButton.click(); // 送信ボタンのクリックイベントを発火
    }
});

// ページがロードされたときにQ&A情報を読み込む
loadAddonQA();