// GET /api/round?id=RC26-00011  →  ข้อมูลหัว + สรุปจาก Lines สำหรับใบพิมพ์
import { LINES as L, ROUNDS as R } from "./_lib/config.js";
import { HttpError, dvGet, dvGetAll, handle, odataStr, param, shown } from "./_lib/dataverse.js";

export default handle(async (query) => {
  const id = param(query, "id");
  if (!id) throw new HttpError(400, "ไม่ได้ระบุ RoundId (?id=...)");

  // 1) หัว Recheck Round
  const cols = [R.GUID, R.ROUND_ID, R.WAREHOUSE, R.CREATED_ON].filter(Boolean);
  const url = R.TABLE + "?$select=" + cols.join(",") + "&$top=1&$filter=" +
              encodeURIComponent(R.ROUND_ID + " eq '" + odataStr(id) + "'");
  const head = (await dvGet(url)).value[0];
  if (!head) throw new HttpError(404, "ไม่พบ RoundId: " + id);

  // 2) Lines (ถ้าตั้งค่าไว้) — ส่งกลับเฉพาะค่าสรุป ไม่ส่งแถวดิบ
  let summary = null;
  if (L.TABLE) {
    const LC = L.COLUMNS;
    const lineCols = [...new Set(Object.values(LC).filter(Boolean))];
    if (!lineCols.length) throw new HttpError(500, "ตั้งค่า LINES.TABLE แล้ว แต่ยังไม่ได้ระบุ LINES.COLUMNS");
    const filter = L.FILTER.replace("{id}", odataStr(id)).replace("{guid}", head[R.GUID]);
    const lines = await dvGetAll(L.TABLE + "?$select=" + lineCols.join(",") +
                                 "&$filter=" + encodeURIComponent(filter));

    const distinct = (c) => c
      ? [...new Set(lines.map((r) => shown(r, c)).filter((v) => v !== null && v !== undefined && v !== ""))]
          .map(String).sort((a, b) => a.localeCompare(b, "th", { numeric: true }))
      : null;
    const count = (c) => { const d = distinct(c); return d ? d.length : null; };

    summary = {
      brands:    distinct(LC.brand),
      roundNos:  distinct(LC.roundNo),
      zones:     count(LC.zone),
      locations: count(LC.location),
      items:     count(LC.item)
    };
  }

  return {
    roundId:   head[R.ROUND_ID],
    warehouse: (R.WAREHOUSE && shown(head, R.WAREHOUSE)) || "",
    createdOn: head[R.CREATED_ON] || null,
    lines:     summary
  };
});
