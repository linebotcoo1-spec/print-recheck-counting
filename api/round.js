// GET /api/round?id=RC26-00011  →  ข้อมูลหัว + สรุป Zone/Location จาก Lines สำหรับใบพิมพ์
import { LINES as L, ROUNDS as R } from "./_lib/config.js";
import { HttpError, dvGet, dvGetAll, handle, odataStr, param, shown } from "./_lib/dataverse.js";
import INVENTDIM from "./_lib/inventdim.js";

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
  const warehouse = (R.WAREHOUSE && shown(head, R.WAREHOUSE)) || "";

  // 2) Lines — ถ้าดึงไม่ได้ ใบพิมพ์ยังพิมพ์หัวได้ แล้วแสดง error แทนตาราง
  let lines = null;
  if (L.TABLE) {
    try {
      lines = await summarizeLines(id, head[R.GUID], warehouseCode(warehouse));
    } catch (e) {
      if (!(e instanceof HttpError)) throw e;
      lines = { error: e.message };
    }
  }

  return {
    roundId:     head[R.ROUND_ID],
    description: (R.DESCRIPTION && head[R.DESCRIPTION]) || "",
    warehouse,
    createdOn:   head[R.CREATED_ON] || null,
    lines
  };
});

// "HO" / "ho" / "HO, 01" → "HO"
const warehouseCode = (wh) => String(wh).trim().split(/[\s,]+/)[0].toUpperCase();

// นับเฉพาะ line ที่ inventDimId อยู่ใน InventDim ของคลังนี้ — นอกนั้นตัดทิ้ง
// → คลังทั่วไป:        { mode: "zones", count, zoneCount, locationCount, brands, roundNos,
//                        zones: [{ zone, lines, locations: [{ location, lines }] }] }
// → คลังใน LOCATION_ONLY: { mode: "locations", count, locationCount, brands, roundNos,
//                        locations: [{ location, lines }] }
async function summarizeLines(id, guid, wh) {
  const load = INVENTDIM[wh];
  if (!load) throw new HttpError(422, `ยังไม่มีข้อมูล InventDim ของคลัง ${wh || "(ว่าง)"} — มีแค่ ${Object.keys(INVENTDIM).join(", ")}`);

  const LC = L.COLUMNS;
  const cols = [...new Set([L.INVENTDIM, LC.brand, LC.roundNo].filter(Boolean))];
  const filter = L.FILTER.replace("{id}", odataStr(id)).replace("{guid}", guid);
  const [all, { default: dims }] = await Promise.all([
    dvGetAll(L.TABLE + "?$select=" + cols.join(",") + "&$filter=" + encodeURIComponent(filter)),
    load()
  ]);

  // zone → location → จำนวน line
  const zones = new Map();
  const rows = [];
  for (const r of all) {
    const dimId = String(shown(r, L.INVENTDIM) ?? "").trim();
    const hit = dims[dimId.replace(/^#/, "").toUpperCase()];
    if (!hit) continue;
    rows.push(r);
    const [location, zone] = [hit[0] || "(ไม่มี Location)", hit[1] || "(ไม่มี Zone)"];

    if (!zones.has(zone)) zones.set(zone, new Map());
    const locs = zones.get(zone);
    locs.set(location, (locs.get(location) || 0) + 1);
  }

  const list = [...zones].map(([zone, locs]) => ({
    zone,
    lines: [...locs.values()].reduce((a, b) => a + b, 0),
    locations: [...locs].map(([location, n]) => ({ location, lines: n }))
                        .sort((a, b) => byText(a.location, b.location))
  })).sort((a, b) => byText(a.zone, b.zone));

  const distinct = (c) => c
    ? [...new Set(rows.map((r) => shown(r, c)).filter((v) => v !== null && v !== undefined && v !== ""))]
        .map(String).sort(byText)
    : null;

  const base = {
    count:         rows.length,
    locationCount: list.reduce((a, z) => a + z.locations.length, 0),
    brands:        distinct(LC.brand),
    roundNos:      distinct(LC.roundNo)
  };
  if (L.LOCATION_ONLY.includes(wh)) {
    // Location เดียวกันอาจอยู่ต่าง Zone ใน Excel — รวมยอดตาม Location
    const byLoc = new Map();
    for (const z of list) for (const l of z.locations) byLoc.set(l.location, (byLoc.get(l.location) || 0) + l.lines);
    const locations = [...byLoc].map(([location, n]) => ({ location, lines: n }))
                                .sort((a, b) => byText(a.location, b.location));
    return { mode: "locations", ...base, locationCount: locations.length, locations };
  }
  return { mode: "zones", ...base, zoneCount: list.length, zones: list };
}
