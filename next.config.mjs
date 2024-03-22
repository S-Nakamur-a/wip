/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/wip' : '';
const assetPrefix = isProd ? '/wip/' : '';

const nextConfig = {
    output: 'export',
    basePath,
    assetPrefix,
}

export default nextConfig
