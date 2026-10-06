// =====================================================================
//  ตั้งค่าตาราง/คอลัมน์ Dataverse (ฝั่ง server เท่านั้น)
// =====================================================================
//  ค่าลับ (CLIENT_SECRET) และ URL/ID ต่าง ๆ อยู่ใน Environment Variables
//  ดู .env.example — ห้ามใส่ secret ในไฟล์นี้
// =====================================================================

// ---------------------------------------------------------------
// ตารางหัว Recheck Round  (ตาม re_schema.xlsx — ปกติไม่ต้องแก้)
// ---------------------------------------------------------------
export const ROUNDS = {
  TABLE:       "crb2f_recheckrounds",
  GUID:        "crb2f_recheckroundid",
  ROUND_ID:    "crb2f_roundid",       // RoundId
  DESCRIPTION: "crb2f_description",   // คำอธิบาย
  WAREHOUSE:   "crb2f_warehosue",     // คลัง (สะกดตาม schema จริง)
  CREATED_ON:  "createdon",           // เวลาสร้าง
  ACTIVE_ONLY: true                   // ค้นหาเฉพาะรายการที่ Status = Active
};

// ---------------------------------------------------------------
// ตาราง Recheck Lines — ใช้นับ Item / Brand / รอบที่ / Zone / Location
// เว้น TABLE ว่าง "" = ใบพิมพ์แสดงเฉพาะข้อมูลหัว
// ---------------------------------------------------------------
export const LINES = {
  TABLE: "",                            // เช่น "crb2f_rechecklines"
  // {id} = RoundId (ข้อความ), {guid} = crb2f_recheckroundid ของหัว
  //   RoundId บน Lines เป็นข้อความ :  "crb2f_roundid eq '{id}'"
  //   RoundId บน Lines เป็น Lookup  :  "_crb2f_roundid_value eq {guid}"
  FILTER: "crb2f_roundid eq '{id}'",
  COLUMNS: {                            // เว้น "" ถ้าไม่มี
    item:     "",
    brand:    "",
    roundNo:  "",
    zone:     "",
    location: ""
  }
};

export const SEARCH_TOP = 50;           // จำนวนผลค้นหาสูงสุด (เรียงจากใหม่ไปเก่า)
