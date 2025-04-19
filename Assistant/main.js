import { detectTopic, getTopicResponse } from './topics.js';
import { detectCasualPattern, getCasualResponse } from './casualConversations.js';

// --- グローバル設定 ---
const MAX_HISTORY = 7;
const FOLLOW_UP_PROBABILITY = 0.5;
const RESPONSE_DEBOUNCE_MS = 100;

// --- データ管理 ---
class PlayerSession {
  constructor() {
    this.data = new Map();
  }

  getPlayerData(playerId, playerName) {
    if (!this.data.has(playerId)) {
      this.data.set(playerId, {
        assistantHistory: [
          `<span class="assistant-message">[HARUassistant]</span> <span class="green">こんにちは、<span class="bold">${playerName}</span>さん！ 何かお話ししましょう！</span>`,
        ],
        contextData: {
          lastContext: null,
          recentTopics: [],
          interactionCount: 0,
        },
      });
    }
    return this.data.get(playerId);
  }
}

const playerSession = new PlayerSession();

// --- ユーティリティ ---
function normalizeInput(text) {
  // 全角を半角に変換（日本語IME対応）
  return text
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/　/g, ' ')
    .trim()
    .toLowerCase();
}

// --- 応答生成関数 ---
const followUpOptions = {
  topic: [
    (topic) => `<span class="yellow">他に <span class="highlight">${topic}</span> について聞きたいことはありますか？</span>`,
    (topic) => `<span class="yellow"><span class="highlight">${topic}</span> の話、続けますか？ それとも別の話題が良いですか？</span>`,
    (topic) => `<span class="yellow">なるほど！ <span class="highlight">${topic}</span> について、他にはどんなことが気になりますか？</span>`,
  ],
  recentTopic: [
    (topic) => `<span class="yellow">そういえば、前に <span class="highlight">${topic}</span> の話をしましたね。そちらの話もしますか？</span>`,
    (topic) => `<span class="yellow">ところで、<span class="highlight">${topic}</span> については、もう解決しましたか？</span>`,
    (topic) => `<span class="yellow">話は変わりますが、<span class="highlight">${topic}</span> について何か新しい情報はありましたか？</span>`,
  ],
  fallback: [
    (name) => `ふむふむ、<span class="bold">${name}</span>さんの言うこと、もう少し詳しく教えてもらえますか？`,
    () => `なるほど...。もっと聞かせてください！`,
    (name) => `<span class="bold">${name}</span>さん、興味深いですね。それで、どうなりましたか？`,
    () => `そうなんですね！ 他に何か気になることはありますか？`,
  ],
  generic: [
    () => `<span class="yellow">何か私に手伝えることや、知りたい情報はありますか？</span>`,
    () => `<span class="yellow">どんなことでも良いので、気軽に話しかけてくださいね！</span>`,
    () => `<span class="yellow">マイクラの事でも、全然違う話でも大丈夫ですよ！</span>`,
  ],
  complex: [
    (name, topics) => `<span class="bold">${name}</span>さん、色々な話題ですね！ 特に <span class="highlight">${topics[0]}</span> についてもっと話したい？`,
    (name) => `<span class="bold">${name}</span>さん、面白い質問！ どれか一つ掘り下げてみますか？`,
    () => `うわ、盛りだくさんな話題！ どこから始めようかな？`,
  ],
};

function getRandomFollowUp(type, param) {
  const options = followUpOptions[type];
  return options[Math.floor(Math.random() * options.length)](param);
}

function generateResponse(rawMessage, player, contextData) {
  const message = normalizeInput(rawMessage);
  const response = ['[HARUassistant]'];
  const { name: playerName } = player;

  // 複数トピックの検出
  const topics = [];
  let casualPattern = null;
  const words = message.split(/\s+/);
  for (const word of words) {
    const topic = detectTopic(word);
    if (topic && !topics.includes(topic)) topics.push(topic);
    if (!casualPattern) casualPattern = detectCasualPattern(word);
  }

  if (topics.length > 1) {
    // 複雑な質問（複数トピック）
    const combinedResponse = topics
      .map((topic) => getTopicResponse(topic, playerName, false))
      .join(' それから、');
    response.push(`${combinedResponse} <span class="yellow">色々話したいみたいですね！</span>`);
    response.push(getRandomFollowUp('complex', [playerName, topics]));
    contextData.recentTopics = [
      ...topics,
      ...contextData.recentTopics.filter((t) => !topics.includes(t)),
    ].slice(0, 3);
  } else if (topics.length === 1) {
    // 単一トピック
    response.push(getTopicResponse(topics[0], playerName, false));
    response.push(getRandomFollowUp('topic', topics[0]));
    contextData.recentTopics = [
      topics[0],
      ...contextData.recentTopics.filter((t) => t !== topics[0]),
    ].slice(0, 3);
  } else if (casualPattern) {
    // カジュアルな会話
    response.push(getCasualResponse(casualPattern, playerName, message));
    if (
      contextData.recentTopics.length > 0 &&
      Math.random() < FOLLOW_UP_PROBABILITY
    ) {
      response.push(getRandomFollowUp('recentTopic', contextData.recentTopics[0]));
    } else if (contextData.lastContext?.topic) {
      response.push(
        `<span class="yellow">少し前の <span class="highlight">${contextData.lastContext.topic}</span> の話に戻りますか？ それとも、何か新しい話題はありますか？</span>`
      );
    } else {
      response.push(`<span class="yellow">他に何か話したいことはありますか？</span>`);
    }
  } else {
    // フォールバック（マッチしない場合）
    response.push(getRandomFollowUp('fallback', playerName));
    if (contextData.recentTopics.length > 0) {
      response.push(
        getRandomFollowUp('recentTopic', contextData.recentTopics[0])
      );
    } else if (contextData.lastContext?.topic) {
      response.push(
        `<span class="yellow">少し前の <span class="highlight">${contextData.lastContext.topic}</span> の話に戻ってみるのも良いかもしれませんね。</span>`
      );
    } else {
      // 疑似生成的な応答
      const generativeResponses = [
        `おっと、<span class="bold">${playerName}</span>さん、なかなかユニークな質問ですね！ 何か具体的な話題、たとえば${contextData.recentTopics[0] || 'ゲーム'}について話したい？`,
        `ふむ、ちょっとトリッキーな質問だ！ <span class="bold">${playerName}</span>さん、どんな気持ちでそれ言ったの？ もう少しヒントくれると、ピッタリの答え考えるよ！`,
        `へえ、<span class="bold">${playerName}</span>さん、面白いこと考えるね！ それ、どんな話に繋げたい？ 私は${contextData.recentTopics[0] || 'なんでも'}でもイケるよ！`,
      ];
      response.push(generativeResponses[Math.floor(Math.random() * generativeResponses.length)]);
      response.push(getRandomFollowUp('generic'));
    }
  }

  return `<span class="assistant-message">${response.join(' ')}</span>`;
}

// --- メイン処理 ---
function chatLoop4(player) {
  if (!player?.id || !player?.name || typeof player !== 'object') {
    console.warn('[HARUassistant] Invalid player object:', player);
    return;
  }

  const playerData = playerSession.getPlayerData(player.id, player.name);
  const { assistantHistory: chatHistory, contextData } = playerData;

  // チャット履歴を更新
  const updateChatHistory = () => {
    const displayHistory = chatHistory
      .slice(-MAX_HISTORY)
      .map((line) =>
        line.includes(`[${player.name}]`)
          ? `<span class="user-message">>> ${line.substring(line.indexOf(']') + 2)}</span>`
          : line
      )
      .join('<br>');
    const chatHistoryElement = document.getElementById('chat-history');
    chatHistoryElement.innerHTML = `<span class="bold">--- Support Chat ---</span><br>${
      displayHistory || '<span class="user-message">(まだ会話がありません)</span>'
    }<br><span class="bold">--------------------</span>`;
    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
  };

  updateChatHistory();

  // DOM要素のキャッシュ
  const input = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const exitButton = document.getElementById('exit-button');

  // 入力フィールドの設定（半角入力対応）
  input.setAttribute('lang', 'ja');
  input.setAttribute('type', 'text');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocorrect', 'off');

  // デバウンス処理
  let isProcessing = false;
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      if (isProcessing) return;
      isProcessing = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
        isProcessing = false;
      }, wait);
    };
  };

  // イベントハンドラ
  const handleInput = debounce(() => {
    const message = input.value.trim();
    if (!message) return;

    if (message.toLowerCase() === 'exit') {
      exitButton.click();
      return;
    }

    chatHistory.push(`<span class="user-message">[${player.name}] ${message}</span>`);
    let response;
    try {
      response = generateResponse(message, player, contextData);
    } catch (e) {
      console.error(`[HARUassistant] Error during message processing: ${e.stack || e}`);
      response = `<span class="assistant-message">[HARUassistant]</span> <span class="error-message">大変申し訳ありません、<span class="bold">${player.name}</span>さん！ 内部エラーが発生しました...。 もう一度試してみてください。</span>`;
    }

    chatHistory.push(response);
    contextData.interactionCount++;
    const currentTopic = detectTopic(normalizeInput(message));
    contextData.lastContext = {
      timestamp: Date.now(),
      topic: currentTopic,
      message: normalizeInput(message),
      response: response
        .replace(/<span class="[^"]+">[^<]*<\/span>/g, '')
        .replace('[HARUassistant] ', '')
        .trim(),
    };

    updateChatHistory();
    input.value = '';
  }, RESPONSE_DEBOUNCE_MS);

  // イベントリスナー設定
  sendButton.onclick = handleInput;
  input.onkeypress = (e) => e.key === 'Enter' && handleInput();
  exitButton.onclick = () => {
    chatHistory.push(
      `<span class="assistant-message">[HARUassistant]</span> <span class="green">分かりました、<span class="bold">${player.name}</span>さん。またお話ししましょう！ いつでもどうぞ！</span>`
    );
    updateChatHistory();
    input.disabled = true;
    sendButton.disabled = true;
    exitButton.disabled = true;
  };
}

// --- 初期化 ---
const player = {
  id: 'user-1',
  name: 'Player',
  isValid: () => true,
};
chatLoop4(player);