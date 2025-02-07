/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // 1〜4のやつは、Next.js の画像最適化機能 (next/image) に許可する画像ホスト を設定するためのもの
        //外部の画像URLを安全に使うために、許可するドメインを設定しないといけない
        //なかったらエラーが出た
        protocol: "https", // https の画像を許可
        hostname: "1.bp.blogspot.com",
        pathname: "/**",
      },
      {
        protocol: "https", // https の画像を許可
        hostname: "2.bp.blogspot.com",
        pathname: "/**",
      },
      {
        protocol: "https", // https の画像を許可
        hostname: "3.bp.blogspot.com",
        pathname: "/**",
      },
      {
        protocol: "https", // https の画像を許可
        hostname: "4.bp.blogspot.com",
        pathname: "/**",
      },
      {
        protocol: "http", // http の画像も許可
        hostname: "1.bp.blogspot.com",
        pathname: "/**",
      },
      {
        protocol: "http", // http の画像も許可
        hostname: "2.bp.blogspot.com",
        pathname: "/**",
      },
      {
        protocol: "http", // http の画像も許可
        hostname: "3.bp.blogspot.com",
        pathname: "/**",
      },
      {
        protocol: "http", // http の画像も許可
        hostname: "4.bp.blogspot.com",
        pathname: "/**",
      },
    ], // 画像のプロトコル（httpとhttps両方）を設定
  },
};

export default nextConfig;
