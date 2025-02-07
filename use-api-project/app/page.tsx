"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// 画像データの型を定義
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

  useEffect(() => {
    if (apiData.length > 0) {
      setResults(apiData);
    }
  }, [apiData]);

  const searchImages = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      console.log("検索クエリ:", query);

      const res = await fetch(`/api/irasutoya?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("検索に失敗しました");
      const data = await res.json();

      // console.log("全データ：", data);
      // console.log("検索結果：", data.results);

      setApiData(data.results || []);
    } catch (err) {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

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
