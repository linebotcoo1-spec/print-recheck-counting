// GET /api/rounds?q=คำค้น  →  รายการ Recheck Round ล่าสุด (ค้นด้วย RoundId หรือคำอธิบาย)
import { ROUNDS as R, SEARCH_TOP } from "./_lib/config.js";
import { dvGet, handle, odataStr, param } from "./_lib/dataverse.js";

export default handle(async (query) => {
  const q = param(query, "q");

  const filters = [];
  if (R.ACTIVE_ONLY) filters.push("statecode eq 0");
  if (q) {
    const s = odataStr(q);
    const parts = ["contains(" + R.ROUND_ID + ",'" + s + "')"];
    if (R.DESCRIPTION) parts.push("contains(" + R.DESCRIPTION + ",'" + s + "')");
    filters.push("(" + parts.join(" or ") + ")");
  }

  const cols = [R.ROUND_ID, R.DESCRIPTION, R.CREATED_ON].filter(Boolean);
  let url = R.TABLE + "?$select=" + cols.join(",") +
            "&$orderby=" + R.CREATED_ON + " desc&$top=" + SEARCH_TOP;
  if (filters.length) url += "&$filter=" + encodeURIComponent(filters.join(" and "));

  const rows = (await dvGet(url)).value;
  return {
    top: SEARCH_TOP,
    rows: rows.map((r) => ({
      roundId:     r[R.ROUND_ID] || "",
      description: (R.DESCRIPTION && r[R.DESCRIPTION]) || "",
      createdOn:   r[R.CREATED_ON] || null
    }))
  };
});
