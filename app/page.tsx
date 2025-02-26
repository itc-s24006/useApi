"use client";

import React, { useState } from "react";
import Image from "next/image";

type ImageResult = {
  image_url: string;
  name: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [translatedQuery, setTranslatedQuery] = useState(""); // 翻訳後のワード
  const [originalQuery, setOriginalQuery] = useState(""); // 元のワード

  // 入力が英語か日本語かを判断する関数
  const isEnglish = (text: string) => /^[a-zA-Z0-9\s]+$/.test(text);

  // 翻訳処理
  const translateText = async (text: string) => {
    if (!text) return text;

    // 翻訳対象の言語を決定
    const targetLang = isEnglish(text) ? "JA" : "EN"; // 英語なら日本語、逆なら英語に翻訳
    const apiUrl = `/api/deepL?q=${encodeURIComponent(
      text
    )}&target_lang=${targetLang}`;

    try {
      console.log("API を呼び出す前:", apiUrl); //デバッグ
      const res = await fetch(apiUrl);
      const textResponse = await res.text(); //デバッグ
      console.log("API レスポンス:", textResponse); //デバッグ

      console.log("レスポンスのステータス:", res.status); //デバッグ

      if (!res.ok) {
        throw new Error(`HTTP エラー: ${res.status}`);
      }

      const data = JSON.parse(textResponse); // JSON パース
      console.log("DeepL API のレスポンス:", data); //デバッグ
      return data.translatedText || text;
    } catch (err) {
      console.error("翻訳エラー:", err);
      return text; // エラーが発生した場合はそのままのテキストを返す
    }
  };

  // 画像検索
  const searchImages = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      // クエリの翻訳（英語 → 日本語 or 日本語 → 英語）
      const translatedQuery = await translateText(query);

      // 表示の統一（1行目 = 英語, 2行目 = 日本語）
      const englishText = isEnglish(query) ? query : translatedQuery; // 元が英語ならそのまま、元が日本語なら翻訳
      const japaneseText = isEnglish(query) ? translatedQuery : query; // 元が英語なら翻訳、元が日本語ならそのまま

      setOriginalQuery(japaneseText); // 2行目（日本語）
      setTranslatedQuery(englishText); // 1行目（英語）

      console.log("1行目（英語）：", englishText);
      console.log("2行目（日本語）：", japaneseText);
      console.log("画像検索のクエリ：", japaneseText); // 画像検索は日本語固定

      // 画像検索は **常に日本語クエリを使う**
      const res = await fetch(
        `/api/irasutoya?q=${encodeURIComponent(japaneseText)}`
      );

      if (!res.ok) throw new Error("検索リクエストが失敗しました");
      const data = await res.json();

      setResults(data.results || []);
    } catch (err) {
      setError(
        `検索中にエラーが発生しました: ${
          err instanceof Error ? err.message : "不明なエラー"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="my-4">
        <h1 className="text-center font-weight-bold mb-4">
          イメージで覚える英単語
        </h1>
        <div className="d-flex mb-3 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-control inputBox"
            placeholder="単語を入力"
          />
          <button
            onClick={searchImages}
            className="btn ml-2 button mt-3"
            disabled={loading}
          >
            {loading ? "検索中..." : "検索"}
          </button>
        </div>

        {error && <p className="text-danger mt-2">{error}</p>}

        <div className="d-flex gap-4 mt-6">
          {/* 翻訳結果の表示 */}
          {originalQuery && translatedQuery && (
            <div className="w-33 text_block">
              {isEnglish(query) ? (
                <>
                  <p className="font-weight-bold text_style">{originalQuery}</p>
                  <p className="font-weight-bold text_style">
                    {translatedQuery}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-weight-bold text_style">
                    {translatedQuery}
                  </p>
                  <p className="font-weight-bold text_style">{originalQuery}</p>
                </>
              )}
            </div>
          )}

          <div className="w-66 d-flex justify-content-center image_style">
            {results.length > 0
              ? results.map((item, index) => (
                  <Image
                    key={index}
                    src={item.image_url}
                    alt={item.name}
                    className="rounded-lg shadow-lg object-contain image"
                    width={600}
                    height={600}
                  />
                ))
              : !loading && (
                  <p className="text-muted">イメージが見つかりませんでした。</p>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
変わらず日本語で入力したとき、英語に翻訳されない
[考えられる原因と対処]
・APIキーが無効、または制限に達している可能性 
-> 英語で入力したときは翻訳できてるからキーは有効。実行のたびにAPIの利用状況を更新して確認しているから制限に達していない。
・APIのレスポンス形式が間違っている
-> console.log("DeepL API レスポンス:", JSON.stringify(data, null, 2));で確認したところ、 日本語で入力した単語を英語と誤認識していることがわかったから、
   source_lang を明示的に設定したが変わらなかった
・検索ワードに余分なスペースなどが含まれている可能性
-> リクエスト前にquery.trim();で余分な空白削除を行ったが変わらなかった
・DeepL API free版の問題
-> 同じような問題が報告されているか調べたが見つからなかった。

「犬」以外の日本語で入力したら、翻訳できるものとできないものがあった
「世界」と入力すると中国語判定だけど、worldと表示。画像は出ない
 ->変わらず中国語判定だけど画像が出るようになった。
「お茶」と入力するとtea ceremony(茶道)と翻訳し、画像がヒットしない
 -> 画像が出るようになった
 */
