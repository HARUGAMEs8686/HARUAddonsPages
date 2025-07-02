// netlify/functions/gemini-proxy.js
const fetch = require('node-fetch'); // Netlify FunctionsはNode.js環境なので、node-fetchが使える

// Netlifyの環境変数からAPIキーを取得する
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Netlify Functionsのエントリーポイント (Lambda関数と同じ形式)
exports.handler = async function(event, context) {
    // POSTリクエストのみを受け付ける (セキュリティのため)
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // APIキーが設定されているか確認
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set in Netlify environment variables.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: API Key missing.' })
        };
    }

    try {
        // クライアントから送られてきたJSONボディをパース
        const payload = JSON.parse(event.body);

        // Gemini APIへリクエストを送信
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload), // クライアントから受け取ったボディをそのまま転送
        });

        // Gemini APIからの応答をJSONとして取得
        const data = await response.json();

        // Gemini APIからの応答をそのままクライアントに返す
        return {
            statusCode: response.status, // Gemini APIのステータスコードをそのまま返す
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Netlify Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to communicate with Gemini API', details: error.message })
        };
    }
};