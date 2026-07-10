// Minimal Node-stdlib static file server for the built Storybook (no new dep).
// Usage: node serve-static.mjs <rootDir> <port>
// DEC-VRT-003: the container only serves + captures; the host builds storybook-static.
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'

const root = path.resolve(process.argv[2] ?? 'storybook-static')
const port = Number(process.argv[3] ?? 6006)

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json; charset=utf-8',
}

const server = createServer((req, res) => {
    // strip query string (e.g. iframe.html?id=…) and decode
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
    let filePath = path.join(root, urlPath === '/' ? 'index.html' : urlPath)

    // block path traversal outside root
    if (!filePath.startsWith(root)) {
        res.writeHead(403).end('Forbidden')
        return
    }
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html')
    }
    if (!existsSync(filePath)) {
        res.writeHead(404).end('Not found')
        return
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream' })
    createReadStream(filePath).pipe(res)
})

server.listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`))
