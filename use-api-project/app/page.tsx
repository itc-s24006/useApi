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

    try {
      const res = await fetch(
        `/api/deepL?q=${encodeURIComponent(text)}&target_lang=${targetLang}`
      );

      const data = await res.json();
      return data.translatedText || text; // 翻訳結果を返す
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

      <div className="mt-4">
        {/* 翻訳結果の表示 */}
        {originalQuery && translatedQuery && (
          <div className="text-lg font-semibold text-center">
            {isEnglish(query) ? (
              <>
                <p>{originalQuery}</p> {/* 英語（元の入力 or 翻訳前） */}
                <p>{translatedQuery}</p> {/* 日本語（翻訳後） */}
              </>
            ) : (
              <>
                <p>{translatedQuery}</p> {/* 英語（翻訳後） */}
                <p>{originalQuery}</p> {/* 日本語（元の入力 or 翻訳前） */}
              </>
            )}
          </div>
        )}

        <div className="mt-2 grid grid-cols-3 gap-4">
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
                <p className="text-gray-500">
                  イメージが見つかりませんでした。
                </p>
              )}
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
「お茶」と入力するとtea ceremony(茶道)と翻訳し、画像がヒットしない*/

// "use client";

// import React, { useState } from "react";
// import Image from "next/image";

// type ImageResult = {
//   image_url: string;
//   name: string;
// };

// export default function Home() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<ImageResult[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [translatedQuery, setTranslatedQuery] = useState(""); // 翻訳後のワード
//   const [originalQuery, setOriginalQuery] = useState(""); // 元のワード

//   // 入力が英語か日本語かを判断する関数
//   const isEnglish = (text: string) => /^[a-zA-Z0-9\s]+$/.test(text);

//   // 翻訳処理
//   const translateText = async (text: string) => {
//     if (!text) return text;

//     // 翻訳対象の言語を決定
//     const targetLang = isEnglish(text) ? "JA" : "EN"; // 英語なら日本語、逆なら英語に翻訳

//     try {
//       const res = await fetch(
//         `/api/deepL?q=${encodeURIComponent(text)}&target_lang=${targetLang}`
//       );

//       const data = await res.json();
//       return data.translatedText || text; // 翻訳結果を返す
//     } catch (err) {
//       console.error("翻訳エラー:", err);
//       return text; // エラーが発生した場合はそのままのテキストを返す
//     }
//   };

//   // 画像検索
//   const searchImages = async () => {
//     if (!query.trim()) return;

//     setLoading(true);
//     setError("");

//     console.log("入力された検索クエリ:", query); //デバッグ

//     try {
//       // 必要なら翻訳
//       const translatedQuery = await translateText(query); // 英語か日本語かにかかわらず翻訳を実行

//       setOriginalQuery(query); // 入力されたものを記録
//       setTranslatedQuery(translatedQuery); // 翻訳後の検索クエリを記録

//       console.log("翻訳後の検索クエリ：", translatedQuery); //デバッグ

//       // 日本語の検索クエリで画像検索を実行
//       const res = await fetch(
//         `/api/irasutoya?q=${encodeURIComponent(translatedQuery)}`
//       );
//       if (!res.ok) throw new Error("検索リクエストが失敗しました");
//       const data = await res.json();

//       setResults(data.results || []);
//     } catch (err) {
//       setError(
//         `検索中にエラーが発生しました: ${
//           err instanceof Error ? err.message : "不明なエラー"
//         }`
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">イメージで覚える英単語</h1>
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="border p-2 flex-1"
//           placeholder="単語を入力"
//         />
//         <button
//           onClick={searchImages}
//           className="bg-blue-500 text-white p-2 rounded"
//           disabled={loading}
//         >
//           {loading ? "検索中..." : "検索"}
//         </button>
//       </div>

//       {error && <p className="text-red-500 mt-2">{error}</p>}

//       <div className="mt-4">
//         {/* 翻訳結果の表示 */}
//         {originalQuery && translatedQuery && (
//           <div className="text-lg font-semibold text-center">
//             {isEnglish(query) ? (
//               <>
//                 <p>{originalQuery}</p> {/* 英語（元の入力 or 翻訳前） */}
//                 <p>{translatedQuery}</p> {/* 日本語（翻訳後） */}
//               </>
//             ) : (
//               <>
//                 <p>{translatedQuery}</p> {/* 英語（翻訳後） */}
//                 <p>{originalQuery}</p> {/* 日本語（元の入力 or 翻訳前） */}
//               </>
//             )}
//           </div>
//         )}

//         <div className="mt-2 grid grid-cols-3 gap-4">
//           {results.length > 0
//             ? results.map((item, index) => (
//                 <Image
//                   key={index}
//                   src={item.image_url}
//                   alt={item.name}
//                   className="w-full h-auto rounded shadow"
//                   width={300}
//                   height={300}
//                 />
//               ))
//             : !loading && (
//                 <p className="text-gray-500">
//                   イメージが見つかりませんでした。
//                 </p>
//               )}
//         </div>
//       </div>
//     </div>
//   );
// }

// 日本語で入力したら一行目も二行目も日本語になる
// 英語で入力しても同じく２行とも日本語になる
// 画像は表示される

// "use client";

// import React, { useState } from "react";
// import Image from "next/image";

// type ImageResult = {
//   image_url: string;
//   name: string;
// };

// export default function Home() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<ImageResult[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [translatedQuery, setTranslatedQuery] = useState(""); // 日本語訳
//   const [originalQuery, setOriginalQuery] = useState(""); // 英語訳

//   // 英語か日本語かを判断する関数
//   const isEnglish = (text: string) => /^[a-zA-Z0-9\s]+$/.test(text); // 英語文字と数字かどうかの判断

//   // 翻訳処理
//   const translateText = async (text: string, targetLang: string) => {
//     if (!text) return text;

//     try {
//       const res = await fetch(
//         `/api/deepL?q=${encodeURIComponent(text)}&target_lang=${targetLang}`
//       );
//       const data = await res.json();
//       return data.translatedText || text; // 翻訳結果を返す
//     } catch (err) {
//       console.error("翻訳エラー:", err);
//       return text; // エラーが発生した場合はそのままのテキストを返す
//     }
//   };

//   // 画像検索
//   const searchImages = async () => {
//     if (!query.trim()) return;

//     setLoading(true);
//     setError("");

//     try {
//       // 日本語の場合は翻訳せず、英語の場合は翻訳する
//       const searchQuery = isEnglish(query)
//         ? await translateText(query, "JA")
//         : query;

//       // 英語の場合は翻訳して検索、結果を表示
//       const translatedToJapanese = isEnglish(query)
//         ? await translateText(searchQuery, "JA")
//         : searchQuery;

//       setOriginalQuery(searchQuery); // 英語
//       setTranslatedQuery(translatedToJapanese); // 日本語

//       // 日本語に翻訳した検索クエリで画像検索を実行
//       const res = await fetch(
//         `/api/irasutoya?q=${encodeURIComponent(translatedToJapanese)}`
//       );
//       if (!res.ok) throw new Error("検索に失敗しました");
//       const data = await res.json();

//       setResults(data.results || []);
//     } catch (err) {
//       setError("エラーが発生しました");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">イメージで覚える英単語</h1>
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="border p-2 flex-1"
//           placeholder="単語を入力"
//         />
//         <button
//           onClick={searchImages}
//           className="bg-blue-500 text-white p-2 rounded"
//           disabled={loading}
//         >
//           {loading ? "検索中..." : "検索"}
//         </button>
//       </div>

//       {error && <p className="text-red-500 mt-2">{error}</p>}

//       <div className="mt-4">
//         {/* 翻訳結果の表示 */}
//         {originalQuery && translatedQuery && (
//           <div className="text-lg font-semibold text-center">
//             <p>{originalQuery}</p> {/* 英語訳 */}
//             <p>{translatedQuery}</p> {/* 日本語訳 */}
//           </div>
//         )}

//         <div className="mt-2 grid grid-cols-3 gap-4">
//           {results.length > 0
//             ? results.map((item, index) => (
//                 <Image
//                   key={index}
//                   src={item.image_url}
//                   alt={item.name}
//                   className="w-full h-auto rounded shadow"
//                   width={300}
//                   height={300}
//                 />
//               ))
//             : !loading && (
//                 <p className="text-gray-500">
//                   イメージが見つかりませんでした。
//                 </p>
//               )}
//         </div>
//       </div>
//     </div>
//   );
// }
