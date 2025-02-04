"use client"; // クライアントコンポーネントとして指定

import Image from "next/image";
import styles from "./page.module.css";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchImages = async () => {
    const res = await fetch(`https://example.com/api/search?q=${query}`);
    const data = await res.json();
    setResults(data.results); // 取得したデータを状態にセット
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <h1 className="text-2xl font-bold mb-4">いらすと検索</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 mr-2"
          placeholder="検索ワードを入力"
        />
        <button
          onClick={searchImages}
          className="bg-blue-500 text-white p-2 rounded"
        >
          検索
        </button>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {results.map((item: { image_url: string; title: string }, index) => (
            <Image
              key={index}
              src={item.image_url}
              alt={item.title}
              className="w-full h-auto"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
