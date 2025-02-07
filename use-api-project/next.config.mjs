/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "1.bp.blogspot.com",
      "2.bp.blogspot.com",
      "3.bp.blogspot.com",
      "4.bp.blogspot.com",
    ], // 1〜4のやつは、Next.js の画像最適化機能 (next/image) に許可する画像ホスト を設定するためのもの
    //外部の画像URLを安全に使うために、許可するドメインを設定しないといけない
    //なかったらエラーが出た
  },
};

export default nextConfig;
