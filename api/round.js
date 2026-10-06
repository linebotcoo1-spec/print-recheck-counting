// GET /api/round?id=RC26-00011  →  ข้อมูลหัว + สรุป Zone/Location จาก Lines สำหรับใบพิมพ์
import { LINES as L, ROUNDS as R } from "./_lib/config.js";
import { HttpError, dvGet, dvGetAll, handle, odataStr, param, shown } from "./_lib/dataverse.js";
import INVENTDIM from "./_lib/inventdim.js";

const NOT_FOUND = "ไม่พบใน InventDim (DAL)";
const byText = (a, b) => a.localeCompare(b, "th", { numeric: true });

export default handle(async (query) => {
  const id = param(query, "id");
  if (!id) throw new HttpError(400, "ไม่ได้ระบุ RoundId (?id=...)");

  // 1) หัว Recheck Round
  const cols = [R.GUID, R.ROUND_ID, R.DESCRIPTION, R.WAREHOUSE, R.CREATED_ON].filter(Boolean);
  const url = R.TABLE + "?$select=" + cols.join(",") + "&$top=1&$filter=" +
              encodeURIComponent(R.ROUND_ID + " eq '" + odataStr(id) + "'");
  const head = (await dvGet(url)).value[0];
  if (!head) throw new HttpError(404, "ไม่พบ RoundId: " + id);

  // 2) Lines — ถ้าดึงไม่ได้ ใบพิมพ์ยังพิมพ์หัวได้ แล้วแสดง error แทนตาราง
  let lines = null;
  if (L.TABLE) {
    try {
      lines = await summarizeLines(id, head[R.GUID]);
    } catch (e) {
      if (!(e instanceof HttpError)) throw e;
      lines = { error: e.message };
    }
  }

  return {
    roundId:     head[R.ROUND_ID],
    description: (R.DESCRIPTION && head[R.DESCRIPTION]) || "",
    warehouse:   (R.WAREHOUSE && shown(head, R.WAREHOUSE)) || "",
    createdOn:   head[R.CREATED_ON] || null,
    lines
  };
});

// → { count, zoneCount, locationCount, notFound, brands, roundNos,
//     zones: [{ zone, missing, lines, locations: [{ location, lines }] }] }
//   missing = กลุ่ม inventDimId ที่ไม่พบใน InventDim (location = inventDimId)
async function summarizeLines(id, guid) {
  const LC = L.COLUMNS;
  const cols = [...new Set([L.INVENTDIM, LC.brand, LC.roundNo].filter(Boolean))];
  const filter = L.FILTER.replace("{id}", odataStr(id)).replace("{guid}", guid);
  const rows = await dvGetAll(L.TABLE + "?$select=" + cols.join(",") +
                              "&$filter=" + encodeURIComponent(filter));

  // zone → location → จำนวน line
  const zones = new Map();
  let notFound = 0;
  for (const r of rows) {
    const dimId = String(shown(r, L.INVENTDIM) ?? "").trim();
    const hit = INVENTDIM[dimId.replace(/^#/, "").toUpperCase()];
    let zone, location;
    if (hit) [location, zone] = [hit[0] || "(ไม่มี Location)", hit[1] || "(ไม่มี Zone)"];
    else { notFound++; zone = NOT_FOUND; location = dimId || "(ว่าง)"; }

    if (!zones.has(zone)) zones.set(zone, new Map());
    const locs = zones.get(zone);
    locs.set(location, (locs.get(location) || 0) + 1);
  }

  const list = [...zones].map(([zone, locs]) => ({
    zone,
    missing: zone === NOT_FOUND,
    lines: [...locs.values()].reduce((a, b) => a + b, 0),
    locations: [...locs].map(([location, n]) => ({ location, lines: n }))
                        .sort((a, b) => byText(a.location, b.location))
  })).sort((a, b) => a.missing - b.missing || byText(a.zone, b.zone));

  const found = list.filter((z) => !z.missing);
  const distinct = (c) => c
    ? [...new Set(rows.map((r) => shown(r, c)).filter((v) => v !== null && v !== undefined && v !== ""))]
        .map(String).sort(byText)
    : null;

  return {
    count:         rows.length,
    zoneCount:     found.length,
    locationCount: found.reduce((a, z) => a + z.locations.length, 0),
    notFound,
    brands:        distinct(LC.brand),
    roundNos:      distinct(LC.roundNo),
    zones:         list
  };
}
