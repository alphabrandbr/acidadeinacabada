import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // a pasta fica dentro de um diretório maior que tem um package-lock.json solto
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;
