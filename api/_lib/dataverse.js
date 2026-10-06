// =====================================================================
//  เรียก Dataverse Web API ด้วย client credentials (ตัวแอป ไม่ใช่ผู้ใช้)
// =====================================================================

const ENV_KEYS = ["DATAVERSE_URL", "AZURE_TENANT_ID", "AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET"];
const FMT = "@OData.Community.Display.V1.FormattedValue";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const odataStr = (s) => String(s).replace(/'/g, "''");     // ' → '' ตามกติกา OData
export const shown = (row, col) => row[col + FMT] ?? row[col];    // ค่าที่แสดง (lookup/choice) ก่อนค่าดิบ

function env() {
  const missing = ENV_KEYS.filter((k) => !process.env[k]);
  if (missing.length) throw new HttpError(500, "ยังไม่ได้ตั้งค่า Environment Variables: " + missing.join(", "));
  return {
    org:      process.env.DATAVERSE_URL.replace(/\/+$/, ""),
    tenant:   process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    secret:   process.env.AZURE_CLIENT_SECRET
  };
}

// token อยู่ได้ ~60 นาที เก็บไว้ใช้ซ้ำระหว่างคำขอที่ instance เดียวกัน
let cached = null;

async function getToken() {
  if (cached && cached.exp - 60_000 > Date.now()) return cached.token;
  const { org, tenant, clientId, secret } = env();
  const res = await fetch("https://login.microsoftonline.com/" + tenant + "/oauth2/v2.0/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: secret,
      scope: org + "/.default"
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = String(data.error_description || res.status).split(/\r?\n/)[0];
    throw new HttpError(502, "ขอ token จาก Entra ไม่สำเร็จ — " + detail);
  }
  cached = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

// pathAndQuery เช่น "crb2f_recheckrounds?$select=..." หรือ URL เต็มจาก @odata.nextLink
export async function dvGet(pathAndQuery) {
  const token = await getToken();
  const url = /^https:/.test(pathAndQuery) ? pathAndQuery : env().org + "/api/data/v9.2/" + pathAndQuery;
  const res = await fetch(url, { headers: {
    Authorization: "Bearer " + token,
    Accept: "application/json",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    Prefer: 'odata.include-annotations="OData.Community.Display.V1.FormattedValue",odata.maxpagesize=5000'
  }});
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error.message; } catch (_) {}
    if (res.status === 401 || res.status === 403)
      throw new HttpError(502, "แอปไม่มีสิทธิ์อ่านข้อมูล (" + res.status + ") — ตรวจ Application User และ Security Role ใน Dataverse " + detail);
    throw new HttpError(502, "ดึงข้อมูลไม่สำเร็จ (" + res.status + ") " + detail);
  }
  return res.json();
}

export async function dvGetAll(pathAndQuery) {
  const all = [];
  let next = pathAndQuery;
  while (next) {
    const data = await dvGet(next);
    all.push(...data.value);
    next = data["@odata.nextLink"] || null;
  }
  return all;
}

// ห่อ handler: อ่าน query, ส่ง JSON, แปลง error เป็นข้อความภาษาไทย
// ใช้แค่ Node http API จึงรันได้ทั้งบน Vercel และ dev-server.mjs
export function handle(fn) {
  return async (req, res) => {
    const send = (status, body) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify(body));
    };
    try {
      if (req.method !== "GET") throw new HttpError(405, "รองรับเฉพาะ GET");
      const query = new URL(req.url, "http://localhost").searchParams;
      send(200, await fn(query));
    } catch (e) {
      if (!(e instanceof HttpError)) console.error(e);
      send(e.status || 500, { error: e instanceof HttpError ? e.message : "เกิดข้อผิดพลาดในระบบ" });
    }
  };
}

// รับค่าข้อความจาก query string: ตัดช่องว่าง, จำกัดความยาว
export function param(query, name, max = 100) {
  const v = (query.get(name) || "").trim();
  if (v.length > max) throw new HttpError(400, name + " ยาวเกิน " + max + " ตัวอักษร");
  return v;
}
