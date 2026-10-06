"""แปลง InventDim.xlsx → api/_lib/inventdim.js  (map inventDimId → [Location, Zone])

ใช้:  python scripts/build_inventdim.py "C:/path/to/InventDim.xlsx"
แล้ว commit + push ไฟล์ api/_lib/inventdim.js  (Vercel deploy ให้อัตโนมัติ)

คอลัมน์ที่ใช้: inventDimId, wMSLocationId, Zone
Excel แปลง Location บางตัวเป็นวันที่ (เช่น "09-01" → 9 ม.ค.) หรือเป็นตัวเลข — สคริปต์แปลงกลับเป็นข้อความเดิม
"""
import datetime
import json
import sys
from pathlib import Path

import openpyxl

OUT = Path(__file__).resolve().parent.parent / "api" / "_lib" / "inventdim.js"


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


def main(src):
    ws = openpyxl.load_workbook(src, read_only=True, data_only=True).worksheets[0]
    rows = ws.iter_rows(values_only=True)
    header = [text(h) for h in next(rows)]
    i_id, i_loc, i_zone = (header.index(c) for c in ("inventDimId", "wMSLocationId", "Zone"))

    data = {}
    for r in rows:
        k = key(r[i_id])
        if k:
            data[k] = [text(r[i_loc]), text(r[i_zone])]

    OUT.write_text(
        "// สร้างจาก InventDim.xlsx ด้วย scripts/build_inventdim.py — ห้ามแก้มือ\n"
        "// key = inventDimId (ตัด # นำหน้า, ตัวพิมพ์ใหญ่) → [Location, Zone]\n"
        "export default " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"{len(data):,} รายการ → {OUT}  ({OUT.stat().st_size / 1024:,.0f} KB)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "InventDim.xlsx")
