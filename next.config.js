/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/my-news-site",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
