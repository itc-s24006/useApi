"use client";

import React from "react";
import { useState, useEffect } from "react";
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
  const [apiData, setApiData] = useState<ImageResult[]>([]);

  // 英語の入力があった場合に翻訳を行う関数
  const translateText = async (text: string) => {
    if (!text) return text;

    const res = await fetch(`/api/deepL?q=${encodeURIComponent(text)}`);
    const data = await res.json();

    console.log("翻訳APIのレスポンス：", data); //デバッグ用

    return data.translatedText || text; // 翻訳結果を返す
  };

  // 入力が英語か日本語かを判断する関数
  const isEnglish = (text: string) => {
    return /^[a-zA-Z0-9]+$/.test(text); // 英語文字だけを含んでいる場合はtrue
  };

  // 画像検索
  const searchImages = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      // 日本語の場合は翻訳せず、英語の場合は翻訳する
      const searchQuery = isEnglish(query) ? await translateText(query) : query;

      // 翻訳後またはそのままの検索クエリで画像検索を実行
      const res = await fetch(
        `/api/irasutoya?q=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) throw new Error("検索に失敗しました");
      const data = await res.json();

      setApiData(data.results || []);
    } catch (err) {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 画像が更新されるタイミングで結果を設定
  useEffect(() => {
    if (apiData.length > 0) {
      setResults(apiData);
    }
  }, [apiData]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">イメージで覚える英単語</h1>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 flex-1"
          placeholder="単語を入力"
        />
        <button
          onClick={searchImages}
          className="bg-blue-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "検索中..." : "検索"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4 grid grid-cols-3 gap-4">
        {results.length > 0
          ? results.map((item, index) => (
              <Image
                key={index}
                src={item.image_url}
                alt={item.name}
                className="w-full h-auto rounded shadow"
                width={300}
                height={300}
              />
            ))
          : !loading && (
              <p className="text-gray-500">イメージが見つかりませんでした。</p>
            )}
      </div>
    </div>
  );
}
