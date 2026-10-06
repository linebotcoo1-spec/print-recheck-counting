// รันในเครื่องแบบไม่ต้องติดตั้ง/ล็อกอิน Vercel CLI:  npm run dev  →  http://localhost:3000
// เสิร์ฟ index.html + lib/ และส่ง /api/<name> ไปที่ api/<name>.js เหมือนบน Vercel
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(root, ".env.local")); }
catch { console.warn("⚠ ไม่พบ .env.local — คัดลอกจาก .env.example แล้วใส่ AZURE_CLIENT_SECRET (ยังเปิด ?demo=1 ได้)"); }

const PORT = Number(process.env.PORT) || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  try {
    const api = pathname.match(/^\/api\/([a-z-]+)\/?$/);
    if (api) {
      const mod = await import(pathToFileURL(path.join(root, "api", api[1] + ".js")).href);
      return await mod.default(req, res);
    }
    const rel = pathname === "/" ? "index.html" : pathname.slice(1);
    if (rel !== "index.html" && !/^lib\/[\w.-]+\.js$/.test(rel)) throw Object.assign(new Error(), { code: "ENOENT" });
    const body = await readFile(path.join(root, rel));
    res.writeHead(200, { "Content-Type": TYPES[path.extname(rel)], "Cache-Control": "no-store" });  // แก้ไฟล์แล้วรีเฟรชเห็นทันที
    res.end(body);
  } catch (e) {
    const notFound = e.code === "ENOENT" || e.code === "ERR_MODULE_NOT_FOUND";
    if (!notFound) console.error(e);
    res.writeHead(notFound ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(notFound ? "Not found" : "Server error");
  }
}).listen(PORT, () => console.log("Recheck Print → http://localhost:" + PORT));
