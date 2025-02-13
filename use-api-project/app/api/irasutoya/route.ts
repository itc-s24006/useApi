import { NextResponse } from "next/server";

const JSON_URL =
  "https://raw.githubusercontent.com/rhysd/Irasutoyer/master/irasutoya.json"; //ここはページのURLではなく生データというやつらしい(raw)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url); //リクエストの URL を解析
  const query = searchParams.get("q")?.toLowerCase() || "";
  /*
    searchParams.get("q")検索ワードをURLに組み込む
    入力が無い場合は空文字をセット
  */

  try {
    const res = await fetch(JSON_URL);

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }

    const fetchedData = await res.json();
    //console.log("Fetched Data:", fetchedData); //デバッグ用

    const data = fetchedData || [];
    //setResults(data.results); ここでは使わずpage.tsxで使うらしい

    //irasutoya.jsonから、検索ワードと一致するものだけを抽出
    const filteredResults = query
      ? data.filter((item: { name: string }) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        )
      : data;

    //最初の一件だけ取得
    const singleResult = filteredResults.length > 0 ? [filteredResults[0]] : [];

    return NextResponse.json({ results: singleResult }); //検索結果をjsonで返してる
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
