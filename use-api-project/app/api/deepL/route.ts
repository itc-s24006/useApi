import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "クエリパラメータが必要です" },
        { status: 400 }
      );
    }

    // DeepL APIにリクエストを送る処理（APIキーも必要）
    const apiKey = process.env.DEEPL_API_KEY;
    const res = await fetch(
      `https://api-free.deepl.com/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(
        query
      )}&target_lang=JA` //翻訳後の言語を日本語に設定
    );
    const data = await res.json();

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
