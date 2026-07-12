/** @type {import('next').NextConfig} */

// Slike: danas iz public/images; nakon selidbe na Bunny postavi
// NEXT_PUBLIC_IMAGE_BASE=https://wediplan.b-cdn.net (ista struktura foldera)
// i remotePattern se doda automatski.
const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE;
const remotePatterns = [];
if (imageBase && imageBase.startsWith("http")) {
  const u = new URL(imageBase);
  remotePatterns.push({
    protocol: u.protocol.replace(":", ""),
    hostname: u.hostname,
    pathname: `${u.pathname.replace(/\/$/, "")}/**`,
  });
}

const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns },
  async redirects() {
    // ukinuta kategorija "Auto za mladence" -> spojena u najam-limuzina
    return [
      { source: "/auto-za-mladence", destination: "/najam-limuzina", permanent: true },
      { source: "/:region/auto-za-mladence", destination: "/:region/najam-limuzina", permanent: true },
    ];
  },
};
export default nextConfig;
