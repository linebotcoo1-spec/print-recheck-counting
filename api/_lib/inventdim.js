// สร้างด้วย scripts/build_inventdim.py จาก InventDim.xlsx — ห้ามแก้มือ
// คลัง → โหลด map ของคลังนั้นเมื่อต้องใช้
export default {
  "DAL": () => import("./inventdim-dal.js"),
  "HO": () => import("./inventdim-ho.js")
};
