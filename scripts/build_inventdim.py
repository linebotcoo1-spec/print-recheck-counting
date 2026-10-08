"""แปลง InventDim.xlsx → map inventDimId → [Location, Zone] แยกไฟล์ตามคลัง

ใช้:  python scripts/build_inventdim.py "C:/path/to/InventDim.xlsx" [DAL,HO]   (ค่าเริ่มต้น DAL,HO)
ได้:  api/_lib/inventdim-dal.js, api/_lib/inventdim-ho.js, ...  และ api/_lib/inventdim.js (ตัวเลือกไฟล์ตามคลัง)
แล้ว commit + push  (Vercel deploy ให้อัตโนมัติ)

คอลัมน์ที่ใช้: inventDimId, Warehouse, wMSLocationId, Zone — เก็บเฉพาะแถวของ Warehouse ที่ระบุ
Excel แปลง Location บางตัวเป็นวันที่ (เช่น "09-01" → 9 ม.ค.) หรือเป็นตัวเลข — สคริปต์แปลงกลับเป็นข้อความเดิม
"""
import datetime
import json
import sys
from pathlib import Path

import openpyxl

LIB = Path(__file__).resolve().parent.parent / "api" / "_lib"
HEAD = "// สร้างด้วย scripts/build_inventdim.py จาก InventDim.xlsx — ห้ามแก้มือ\n"


def text(v):
    if v is None:
        return ""
    if isinstance(v, datetime.datetime):            # "09-01" ที่ Excel อ่านเป็น 9 ม.ค. (format d-mmm)
        return f"{v.day:02d}-{v.month:02d}"
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v).strip()


def key(v):
    return text(v).lstrip("#").upper()


def main(src, warehouses):
    ws = openpyxl.load_workbook(src, read_only=True, data_only=True).worksheets[0]
    rows = ws.iter_rows(values_only=True)
    header = [text(h) for h in next(rows)]
    i_id, i_wh, i_loc, i_zone = (header.index(c) for c in ("inventDimId", "Warehouse", "wMSLocationId", "Zone"))

    data = {wh: {} for wh in warehouses}
    for r in rows:
        k, wh = key(r[i_id]), text(r[i_wh]).upper()
        if k and wh in data:
            data[wh][k] = [text(r[i_loc]), text(r[i_zone])]

    for wh, m in data.items():
        out = LIB / f"inventdim-{wh.lower()}.js"
        out.write_text(
            HEAD + f"// Warehouse {wh}: key = inventDimId (ตัด # นำหน้า, ตัวพิมพ์ใหญ่) → [Location, Zone]\n"
            "export default " + json.dumps(m, ensure_ascii=False, separators=(",", ":")) + ";\n",
            encoding="utf-8",
        )
        print(f"{wh}: {len(m):,} รายการ → {out.name}  ({out.stat().st_size / 1024:,.0f} KB)")

    # import แบบข้อความตายตัว เพื่อให้ Vercel รวมไฟล์เข้า function และโหลดเฉพาะคลังที่ใช้
    index = LIB / "inventdim.js"
    index.write_text(
        HEAD + "// คลัง → โหลด map ของคลังนั้นเมื่อต้องใช้\nexport default {\n"
        + ",\n".join(f'  "{wh}": () => import("./inventdim-{wh.lower()}.js")' for wh in data)
        + "\n};\n",
        encoding="utf-8",
    )
    print(f"index → {index.name}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "InventDim.xlsx",
         [w.strip().upper() for w in (sys.argv[2] if len(sys.argv) > 2 else "DAL,HO").split(",") if w.strip()])
