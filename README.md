# Recheck Print (Vercel)

หน้าเว็บพิมพ์ใบ Recheck สินค้า ดึงข้อมูลจาก Dataverse ผ่าน Vercel Functions ด้วย **client credentials** (secret อยู่ฝั่ง server ไม่ต้องให้ผู้ใช้ login)

| เปิดด้วย URL | ผลลัพธ์ |
|---|---|
| `…/` | **หน้าค้นหา** แสดงรายการล่าสุด ค้นได้ด้วย RoundId หรือคำอธิบาย กด "พิมพ์" ที่แถวไหนก็ได้ |
| `…/?q=1N` | หน้าค้นหาพร้อมคำค้น |
| `…/?id=RC26-00011` | **ใบพิมพ์** ของ RoundId นั้น (Power Apps เปิดแบบนี้) |
| `…/?demo=1` | ดูหน้าตาด้วยข้อมูลตัวอย่าง ไม่ต่อ Dataverse |

```
Power Apps ── Launch(".../?id=RC26-00011") ──► index.html ──► /api/round  ──(secret)──► Dataverse ──► พิมพ์
ผู้ใช้เปิด ".../" เอง ──► index.html ──► /api/rounds ──(secret)──► Dataverse ──► เลือกใบ ──► พิมพ์
```

ไม่มีหน้า login ใครที่มี URL ก็เปิดได้ API จึงส่งกลับเฉพาะฟิลด์ที่ใช้พิมพ์ (RoundId, คำอธิบาย, คลัง, เวลาสร้าง และค่าสรุปจาก Lines) ฝั่งเบราว์เซอร์สั่ง query ตารางอื่นเองไม่ได้

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าเว็บ (หน้าค้นหา + ใบพิมพ์ A4) — `AUTO_PRINT` อยู่บนสุดของ `<script>` |
| `api/rounds.js` | `GET /api/rounds?q=` ค้นหา Recheck Round (Active, ใหม่ → เก่า, สูงสุด 50) |
| `api/round.js` | `GET /api/round?id=` หัว Round + สรุป Lines สำหรับใบพิมพ์ |
| `api/_lib/config.js` | **ชื่อตาราง/คอลัมน์** ของ Rounds และ Lines (ไม่มี secret) |
| `api/_lib/dataverse.js` | ขอ token (client credentials) + เรียก Dataverse Web API |
| `lib/qrcode.js` | QR Code generator |
| `dev-server.mjs` | รันในเครื่อง (`npm run dev`) ไม่ต้องใช้ Vercel CLI |
| `.env.example` | ตัวอย่าง Environment Variables |

## 1. ตั้งค่าใน Entra ID และ Dataverse

- [ ] **App registration → Certificates & secrets → New client secret** แล้วจดค่า Value ไว้ (เห็นครั้งเดียว)
- [ ] **Power Platform admin center → Environment → Settings → Users + permissions → Application users → New app user** เลือก App registration นี้ แล้วให้ Security Role ที่**อ่าน**ตาราง Recheck Rounds (และ Recheck Lines ถ้าใช้) ได้เท่านั้น
- ไม่ต้องใช้ Redirect URI หรือ `user_impersonation` แบบเดิมแล้ว

## 2. รันในเครื่อง

```bash
cp .env.example .env.local     # แล้วใส่ AZURE_CLIENT_SECRET
npm run dev                    # http://localhost:3000
```

ต้องใช้ Node 20.12 ขึ้นไป ไม่มี dependency ให้ติดตั้ง

## 3. Deploy บน Vercel

1. push repo นี้ขึ้น GitHub แล้วไปที่ Vercel → **Add New → Project → Import** repo
2. Framework Preset: **Other** ไม่ต้องมี Build Command
3. **Environment Variables** ใส่ 4 ค่าตาม `.env.example` (`AZURE_CLIENT_SECRET` ใส่ค่าจริง) แล้ว Deploy
4. ทดสอบ `https://<project>.vercel.app/?demo=1` แล้วตามด้วย `/` (ค่าจริง)

ถ้าแก้ Environment Variables ต้อง **Redeploy** ค่าใหม่ถึงจะมีผล

## 4. Power Apps

```
Launch("https://<project>.vercel.app/", { id: galRounds.Selected.RoundId })
```

## 5. ตั้งค่า Recheck Lines

แก้ `LINES` ใน `api/_lib/config.js` โดยใส่ชื่อตาราง, FILTER และคอลัมน์ item/brand/roundNo/zone/location ถ้าเว้น `TABLE` ว่าง ใบพิมพ์จะแสดงเฉพาะข้อมูลหัว

## 6. แก้ปัญหา

| ข้อความ | สาเหตุ |
|---|---|
| ยังไม่ได้ตั้งค่า Environment Variables: … | ยังไม่ได้ใส่ค่าใน `.env.local` หรือใน Vercel (หรือยังไม่ได้ Redeploy) |
| ขอ token จาก Entra ไม่สำเร็จ — AADSTS7000215 | `AZURE_CLIENT_SECRET` ผิด (ต้องใส่ **Value** ไม่ใช่ Secret ID) |
| ขอ token จาก Entra ไม่สำเร็จ — AADSTS7000222 | secret หมดอายุ ให้ออกใหม่แล้วอัปเดตใน Vercel |
| แอปไม่มีสิทธิ์อ่านข้อมูล (401/403) | ยังไม่ได้สร้าง Application User ใน Dataverse หรือ Security Role ไม่พอ |
| ดึงข้อมูลไม่สำเร็จ (400) | ชื่อตาราง / คอลัมน์ / FILTER ใน `api/_lib/config.js` ผิด |
| ไม่พบ RoundId | ไม่มีแถวที่ตรงกับ RoundId นี้ |

> **Secret อยู่ใน Environment Variables เท่านั้น** ห้ามใส่ในไฟล์ใด ๆ ใน repo (`.env.local` ถูก ignore ไว้แล้ว)
