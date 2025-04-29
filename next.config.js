/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },
  // Improve build caching
  generateBuildId: async () => {
    return "build-" + Date.now();
  },
};

module.exports = nextConfig;
