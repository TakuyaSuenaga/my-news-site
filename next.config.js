/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/my-news-site",
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
