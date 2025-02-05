import { NextResponse } from "next/server";

const JSON_URL =
  "https://github.com/rhysd/Irasutoyer/blob/master/irasutoya.json";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  try {
    const res = await fetch(JSON_URL);
    const data = await res.json();

    // 検索ワードがある場合、フィルタリング
    const filteredResults = query
      ? data.filter((item: { title: string }) =>
          item.title.toLowerCase().includes(query)
        )
      : data;

    return NextResponse.json({ results: filteredResults });
  } catch (error) {
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
