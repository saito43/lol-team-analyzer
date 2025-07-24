// /netlify/functions/analyze.js

// GoogleのAIライブラリをインポート
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ★ APIキーを環境変数から安全に読み込む
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { team } = JSON.parse(event.body);

        // プロンプトはサーバー側で組み立てる
        const prompt = `
あなたはリーグ・オブ・レジェンドのプロアナリストです。
以下のチーム構成について、日本語で詳細に分析し、下記の[分析項目]のフォーマット通りにレポートを作成してください。

[チーム構成]
- トップ: ${team.Top}
- ジャングル: ${team.Jungle}
- ミッド: ${team.Mid}
- ボット(ADC): ${team.ADC}
- サポート: ${team.Support}

[分析項目]
必ず以下の見出しを使って、それぞれの内容を記述してください。

**1. 構成の概要:**
(構成全体の戦略、目指す戦い方などを2～3文で要約)

**2. 構成の強み:**
- (強み1)
- (強み2)
- (強み3)

**3. 構成の弱み:**
- (弱み1)
- (弱み2)
- (弱み3)

**4. 勝利への道筋:**
- (勝利条件1)
- (勝利条件2)
- (勝利条件3)

**5. レーン別解説:**
- **トップレーン:** (トップレーンの役割や動き方)
- **ジャングル:** (ジャングラーの役割や動き方)
- **ミッドレーン:** (ミッドレーナーの役割や動き方)
- **ボットレーン:** (ボットレーンのシナジーや役割)
`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ analysis: text }),
        };

    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "サーバー側で分析中にエラーが発生しました。" }),
        };
    }
};