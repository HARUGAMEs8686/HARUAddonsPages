// casualConversations.js
const casualResponses = {
    greetings: {
        patterns: ["こんにちは", "こんちゃ", "やあ", "ハロー", "ちゃ", "ねえ", "こんちは", "こ～んにちは", "こ～んに～ちは", "hello"],
        response: (playerName, message) => {
            const greeting = message.includes("こんちゃ") ? "こんちゃ" : "こんにちは";
            return `${greeting}、${playerName}さん！お元気ですか？`;
        }
    },
    morning: {
        patterns: ["おはよう", "朝", "おっは", "オッハー"],
        response: (playerName, message) => {
            const greeting = message.includes("おっは") ? "おっは" : "おはようございます";
            return `${greeting}、${playerName}さん！朝から元気そうですね。今日の予定はありますか？`;
        }
    },
    evening: {
        patterns: ["こんばんは", "ばんちゃ", "夜", "夕方", "ばん"],
        response: (playerName, message) => {
            const greeting = message.includes("ばんちゃ") ? "ばんちゃ" : "こんばんは";
            return `${greeting}、${playerName}さん。夜は落ち着きますね。何か面白いことありました？`;
        }
    },
    thanks: {
        patterns: ["ありがとう", "ありがと", "感謝", "サンキュー", "あざす"],
        response: (playerName, message) => {
            const thanks = message.includes("サンキュー") ? "サンキュー" : "ありがとうございます";
            return `${thanks}、${playerName}さん！そう言っていただけると嬉しいです。また何かお手伝いできることがあれば教えてくださいね。`;
        }
    },
    tired: {
        patterns: ["疲れた", "眠い", "だるい", "休みたい", "つかれた", "ねむい"],
        response: (playerName, message) => {
            const state = message.includes("ねむい") ? "眠そう" : "お疲れ";
            return `${playerName}さん、${state}なんですね。無理せずゆっくり休んでくださいね。何かお手伝いできることがあれば言ってください。`;
        }
    },
    happy: {
        patterns: ["楽しい", "嬉しい", "うれしい", "たのしい"],
        response: (playerName) => {
            return `${playerName}さん、楽しそうで何よりです！何がそんなに嬉しいんですか？私も一緒に喜びたいです。`;
        }
    },
    sad: {
        patterns: ["悲しい", "辛い", "つらい", "かなしい"],
        response: (playerName) => {
            return `${playerName}さん、悲しい気持ちなんですね…。もしよければお話を聞かせてください。私、しっかりお聞きしますよ。`;
        }
    },
    doing: {
        patterns: ["何してる", "いま", "どうしてる", "何してますか", "いま何", "何やってる", "なにしてんの"],
        response: (playerName) => {
            return `今は${playerName}さんとこうやってお話ししていますよ。${playerName}さんは何をしていますか？`;
        }
    },
    naruhodo: {
        patterns: ["なるほど", "分かった", "ナルホド", "わかった", "わかりました", "分かりました", "ワカリマシタ", "ワカッタ", "分かりやすい", "わかりやすい", "ok", "おけ", "オッケー", "了解", "理解した", "りょうかい"],
        response: (playerName) => {
            return `${playerName}さん、理解頂けて嬉しいです。他にも何か分からないことがあれば、いつでもお声がけください！`;
        }
    },
    genkiwhat: {
        patterns: ["元気です？","元気ですか", "元気?", "げんきです?", "げんきっす?", "元気?", "ゲンキデス?", "調子いい?", "調子よい?", "ちょういいい?", "ちょうしよい?","元気？","ゲンキデス？", "調子いい？", "調子よい？", "ちょういいい？", "ちょうしよい？"],
        response: (playerName) => {
            return `私は元気ですよ。ありがとうございます！、いつでもお声がけください！`;
        }
    },
    genki: {
        patterns: ["元気です", "元気っす", "げんきです", "げんきっす", "元気よ", "ゲンキデス", "調子いい", "調子よい", "ちょういいい", "ちょうしよい","元気！","元気!"],
        response: (playerName) => {
            return `${playerName}さん、元気そうで何よりです。分からないことがあれば、いつでもお声がけください！`;
        }
    },
    hanasitakuanai: {
        patterns: ["したくない", "ほしくない", "やだ", "嫌だ", "いやだ", "欲しくない", "だまれ", "黙って"],
        response: (playerName) => {
            return `${playerName}さん、失礼しました！また何か、ご質問などあればいつでもお待ちしますよ！`;
        }
    },
    gomen: {
        patterns: ["ごめん", "ソーリー", "sorry", "すまん", "めんご", "申し訳"],
        response: (playerName) => {
            return `${playerName}さん、全然大丈夫ですよ！また何か、ご質問などあればいつでもお待ちしますよ！`;
        }
    },
    hazimemasite: {
        patterns: ["自己紹介", "はじめまして", "初めまして", "じこしょうかい", "よろしく", "ヨロシク", "お願いします"],
        response: (playerName) => {
            return `${playerName}さん、はじめまして！私はHARUassistantです。よろしくお願いします！何か面白いことや質問があれば、いつでもどうぞ！`;
        }
    },
    // New patterns added below
    hungry: {
        patterns: ["お腹すいた", "腹減った", "はらへった", "空腹", "おなかすいた"],
        response: (playerName) => {
            return `${playerName}さん、お腹ペコペコなんですね！何か美味しいもの食べたい？おすすめはカレーかラーメンかな、どっちがいい？`;
        }
    },
    excited: {
        patterns: ["ワクワク", "楽しみ", "たのしみ", "テンション上がる", "やばい"],
        response: (playerName) => {
            return `${playerName}さん、めっちゃテンション高そう！何がワクワクしてるの？教えて教えて！`;
        }
    },
    bored: {
        patterns: ["暇", "ひま", "退屈", "やることない", "つまんない"],
        response: (playerName) => {
            return `${playerName}さん、暇っちゃう？何か面白いこと探そうよ！ゲームでもするか、変なクイズでも出してみる？`;
        }
    },
    love: {
        patterns: ["好き", "大好き", "すき", "だいすき", "愛してる"],
        response: (playerName) => {
            return `${playerName}さん、うわっ、情熱的！何がそんなに好きなん？私もその熱にあやかりたいな！`;
        }
    },
    angry: {
        patterns: ["ムカつく", "イライラ", "腹立つ", "むかつく", "うざい"],
        response: (playerName) => {
            return `${playerName}さん、ちょっとイライラしてる？何かあったら話してみて！スッキリするかもよ。`;
        }
    },
    weather: {
        patterns: ["天気", "晴れ", "雨", "曇り", "雪", "てんき"],
        response: (playerName) => {
            return `${playerName}さん、今日の天気どう？晴れてたらお散歩、雨ならまったり映画でもいいよね！どんな天気が好き？`;
        }
    },
    help: {
        patterns: ["助けて", "たすけて", "ヘルプ", "困った", "こまった"],
        response: (playerName) => {
            return `${playerName}さん、ピンチ！？どんな困りごと？私、できる限り助けるよ！教えて教えて！`;
        }
    },
    joke: {
        patterns: ["面白い", "ネタ", "ジョーク", "おもしろい", "笑える"],
        response: (playerName) => {
            return `${playerName}さん、笑いたい気分？じゃあ、軽いジョークどう？「カレーは辛え」…なんちゃって！もっと聞きたい？`;
        }
    },
    bye: {
        patterns: ["じゃあね", "バイバイ", "またね", "じゃ", "ばいばい"],
        response: (playerName) => {
            return `${playerName}さん、またねー！いつでも戻ってきてよ、待ってるから！`;
        }
    },
    cool: {
        patterns: ["かっこいい", "クール", "すごい", "すげえ", "やばい"],
        response: (playerName) => {
            return `${playerName}さん、うお、めっちゃカッコいいこと言ってる！何がすごいん？教えてよ！`;
        }
    },
    food: {
        patterns: ["食べたい", "美味しい", "おいしい", "ご飯", "めし"],
        response: (playerName) => {
            return `${playerName}さん、食いしん坊モード？何食べたい？ピザ？寿司？それとも甘いスイーツ？`;
        }
    },
    sleepy: {
        patterns: ["寝る", "ねる", "おやすみ", "おやす", "グンナイ"],
        response: (playerName) => {
            return `${playerName}さん、おやすみなさい！いい夢見てね。羊を数えるか、星を数えるか、どっちがいい？`;
        }
    },
    challenge: {
        patterns: ["挑戦", "やってみる", "やるぞ", "負けない", "勝負"],
        response: (playerName) => {
            return `${playerName}さん、めっちゃ闘志燃えてるね！何に挑戦するの？私も応援するよ、ガンバ！`;
        }
    },
    kaiketu: {
        patterns: ["解決", "いけた", "かいけつ"],
        response: (playerName) => {
            return `${playerName}さん、よかったです！またいつでも気軽に話しかけてくださいね！`;
        }
    },
    w: {
        patterns: ["www", "笑", "ww"],
        response: (playerName) => {
            return `www`;
        }
    },
    daizyoubu: {
        patterns: ["大丈夫！", "大丈夫です", "大丈夫!","大丈夫っす","大丈夫だよ","No Problem","問題ない","だいじょうぶ","ダイジョウブ"],
        response: (playerName) => {
            return `おっ本当ですか、良かったです！またいつでも気軽に話しかけてくださいね！`;
        }
    },
    watasiname: {
        patterns: ["私の名前","僕の名前","俺の名前","我の名前","自分の名前","わたしの名前","ぼくの名前","おれの名前","われの名前","わたしのなまえ","ぼくのなまえ","じぶんのなまえ","われのなまえ",],
        response: (playerName) => {
            return `貴方のお名前ですか？${playerName}さんですよね！知ってますよ！^^`;
        }
    },
    confused: {
        patterns: ["分からない", "わからない", "意味不明", "？", "？？", "何それ"],
        response: (playerName) => {
            return `${playerName}さん、ん？何かチンプンカンプン？何が分からないか教えてよ、ゆっくり解きほぐすよ！`;
        }
    },
};

// 日常会話パターン検出関数
function detectCasualPattern(message) {
    for (let pattern in casualResponses) {
        if (casualResponses[pattern].patterns.some(keyword => message.includes(keyword))) {
            return pattern;
        }
    }
    return null;
}

// 日常会話応答取得関数
function getCasualResponse(pattern, playerName, message) {
    const responseFunc = casualResponses[pattern]?.response;
    if (!responseFunc) return null;
    return responseFunc(playerName, message);
}

export { detectCasualPattern, getCasualResponse };