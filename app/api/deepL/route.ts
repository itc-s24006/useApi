export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    let targetLang = url.searchParams.get("target_lang");

    console.log(request.url);
    console.log("リクエストのクエリ:", query);
    console.log("ターゲット言語:", targetLang);

    if (!query) {
      return NextResponse.json(
        { error: "クエリパラメータが必要です" },
        { status: 400 }
      );
    }

    // 英語と日本語の判定
    const isEnglish = /^[a-zA-Z0-9\s]+$/.test(query); // 英語を判定
    const isJapanese = /[ぁ-んァ-ン一-龯々〆〤]/.test(query); // 日本語を判定

    let sourceLang = "";
    if (isEnglish) {
      sourceLang = "EN"; // 英語のときは source_lang=EN
    } else if (isJapanese) {
      sourceLang = "JA"; // 日本語のときは source_lang=JA
    }

    // 日本語の場合は "EN" に設定、それ以外は "JA"
    targetLang = targetLang || (isEnglish ? "JA" : isJapanese ? "EN" : "EN");

    // もし日本語が入力されている場合、翻訳元を日本語から英語に強制的に設定
    if (isJapanese && !targetLang) {
      targetLang = "EN";
    }

    console.log("最終的なターゲット言語:", targetLang);

    // DeepL APIにリクエストを送る処理（APIキーも必要）
    const apiKey = process.env.DEEPL_API_KEY;
    const res = await fetch(
      `https://api-free.deepl.com/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(
        query
      )}&target_lang=${targetLang}` // リクエストのtarget_langを動的に設定
    );
    const data = await res.json();

    console.log("DeepL API レスポンス:", JSON.stringify(data, null, 2));

    if (res.ok && data && data.translations) {
      return NextResponse.json({ translatedText: data.translations[0].text });
    } else {
      return NextResponse.json(
        { error: "翻訳に失敗しました" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("エラー:", err);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   try {
//     const url = new URL(request.url);
//     const query = url.searchParams.get("q");
//     let targetLang = url.searchParams.get("target_lang");

//     console.log(request.url);
//     console.log("リクエストのクエリ:", query);
//     console.log("ターゲット言語:", targetLang);

//     if (!query) {
//       return NextResponse.json(
//         { error: "クエリパラメータが必要です" },
//         { status: 400 }
//       );
//     }

//     const isEnglish = /^[a-zA-Z0-9\s]+$/.test(query); // 英語を判定
//     const isJapanese = /[ぁ-んァ-ン一-龯々〆〤]/.test(query); // 日本語を判定

//     // 言語判定ロジック
//     targetLang = targetLang || (isEnglish ? "JA" : isJapanese ? "EN" : "EN"); // 日本語もしくは英語を適切に判定

//     // DeepL APIにリクエストを送る処理（APIキーも必要）
//     const apiKey = process.env.DEEPL_API_KEY;
//     const res = await fetch(
//       `https://api-free.deepl.com/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(
//         query
//       )}&target_lang=${targetLang}` // リクエストのtarget_langを動的に設定
//     );
//     const data = await res.json();

//     //console.error("DeepL API レスポンス:", JSON.stringify(data)); //デバッグ用

//     if (res.ok && data && data.translations) {
//       return NextResponse.json({ translatedText: data.translations[0].text });
//     } else {
//       return NextResponse.json(
//         { error: "翻訳に失敗しました" },
//         { status: 500 }
//       );
//     }
//   } catch (err) {
//     console.error("エラー:", err);
//     return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
//   }
// }

// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   try {
//     const url = new URL(request.url);
//     const query = url.searchParams.get("q");

//     if (!query) {
//       return NextResponse.json(
//         { error: "クエリパラメータが必要です" },
//         { status: 400 }
//       );
//     }

//     // DeepL APIにリクエストを送る処理（APIキーも必要）
//     const apiKey = process.env.DEEPL_API_KEY;
//     const res = await fetch(
//       `https://api-free.deepl.com/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(
//         query
//       )}&target_lang=JA` //翻訳後の言語を日本語に設定
//     );
//     const data = await res.json();

//     if (res.ok && data && data.translations) {
//       return NextResponse.json({ translatedText: data.translations[0].text });
//     } else {
//       return NextResponse.json(
//         { error: "翻訳に失敗しました" },
//         { status: 500 }
//       );
//     }
//   } catch (err) {
//     console.error("エラー:", err);
//     return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
//   }
// }
