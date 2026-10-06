// =====================================================================
//  มินิเกมพักสายตา — ปุ่มลอยมุมขวาล่าง ไม่แสดงตอนพิมพ์
//   1) 📦 นับไว นับถูก   กดนับกล่อง ห้ามนับแมว/หัวหน้า · แพ้ทันที: นับ ⚡ หรือ แมวครบ 3 ตัว
//   2) ⚡ สายฟ้าแลบ       วัดความไว 3 ครั้ง
//   3) 💬 คำหวานหรือคำโกหก ทายว่าประโยคไหนจริงใจ ประโยคไหนเจ้าชู้
// =====================================================================
(function () {
  "use strict";

  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

  // ---------- สไตล์ (ฉีดเองเพื่อให้ไฟล์นี้ครบในตัว) ----------
  const css = `
  /* ปุ่มลอยชวนกด: วงแหวนกระพริบ + ส่ายเป็นระยะ + บับเบิลข้อความวน (CSS ล้วน ไม่มี JS timer) */
  .rg-fab { position: fixed; right: 20px; bottom: 24px; z-index: 50; width: 68px; height: 68px; padding: 0;
            border-radius: 50%; border: 3px solid #fff; background: linear-gradient(135deg, #ff4f9a, #ffb300);
            box-shadow: 0 6px 18px rgba(255, 79, 154, .55); animation: rg-wiggle 6s ease-in-out infinite; }
  .rg-fab::after { content: ""; position: absolute; inset: -7px; border-radius: 50%; border: 3px solid #ff4f9a;
                   animation: rg-ring 2s ease-out infinite; pointer-events: none; }
  .rg-fab:hover { animation: none; transform: scale(1.1) rotate(-6deg); }
  .rg-fab .ico { font-size: 34px; line-height: 1; }
  .rg-fab .lbl { position: absolute; left: 50%; bottom: -12px; transform: translateX(-50%); padding: 2px 9px;
                 background: #000; color: #fff; font-size: 11px; border-radius: 999px; white-space: nowrap; }
  .rg-fab .tease { position: absolute; right: -6px; bottom: calc(100% + 16px);
                   display: grid; padding: 8px 12px; background: #fff; color: #000; border: 2px solid #000;
                   border-radius: 14px; font-size: 13px; font-weight: bold; white-space: nowrap;
                   box-shadow: 0 3px 8px rgba(0,0,0,.2); }
  .rg-fab .tease::after { content: ""; position: absolute; right: 34px; bottom: -9px;
                          border: 7px solid transparent; border-top: 9px solid #000; border-bottom: 0; }
  .rg-fab .tease span { grid-area: 1 / 1; opacity: 0; animation: rg-tease 12s infinite; }
  .rg-fab .tease span:nth-child(2) { animation-delay: 4s; }
  .rg-fab .tease span:nth-child(3) { animation-delay: 8s; }
  @keyframes rg-tease { 0% { opacity: 0; transform: translateY(4px); } 4%, 29% { opacity: 1; transform: none; } 33%, 100% { opacity: 0; } }
  @keyframes rg-ring { 0% { transform: scale(.9); opacity: .9; } 100% { transform: scale(1.35); opacity: 0; } }
  @keyframes rg-wiggle { 0%, 86%, 100% { transform: rotate(0); } 88% { transform: rotate(-14deg) scale(1.08); }
                         91% { transform: rotate(12deg) scale(1.08); } 94% { transform: rotate(-8deg); } 97% { transform: rotate(5deg); } }
  /* จอกว้าง: วางกลางพื้นที่เทาข้างกระดาษ ระดับสายตา */
  @media (min-width: 1280px) {
    .rg-fab { bottom: auto; top: 42%; right: max(24px, calc((100vw - 210mm) / 4 - 34px)); }
  }
  @media (max-width: 640px) { .rg-fab .tease { display: none; } }
  .rg-panel { position: fixed; right: 16px; bottom: 16px; z-index: 51; width: min(340px, calc(100vw - 32px));
              background: #fff; color: #000; border: 1.5px solid #000; border-radius: 8px;
              box-shadow: 0 6px 24px rgba(0,0,0,.35); font-size: 14px; overflow: hidden; }
  .rg-head { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #000; color: #fff; font-weight: bold; }
  .rg-head .rg-title { flex: 1; }
  .rg-head button { background: none; padding: 2px 8px; font-size: 18px; line-height: 1; }
  .rg-head .rg-back { font-size: 13px; padding: 2px 6px; }
  .rg-intro, .rg-result { padding: 14px 16px 16px; text-align: center; line-height: 1.6; }
  .rg-intro p, .rg-result p { margin: 0 0 10px; }
  .rg-big { font-size: 22px; font-weight: bold; margin-bottom: 4px !important; }
  .rg-note { color: #555; font-size: 12px; }
  .rg-warn { color: #b00020; }
  .rg-table { width: 100%; font-size: 13px; margin: 6px 0 12px; border-collapse: collapse; }
  .rg-table td { padding: 3px 4px; border-bottom: 1px dashed #ccc; text-align: left; }
  .rg-table td:last-child { text-align: right; font-weight: bold; }

  /* เมนู */
  .rg-menu { padding: 12px; display: grid; gap: 8px; }
  .rg-menu button { display: flex; align-items: center; gap: 12px; text-align: left; width: 100%;
                    background: #fff; color: #000; border: 1.5px solid #000; padding: 10px 12px; }
  .rg-menu button:hover { background: #f2f2f2; }
  .rg-menu .ico { font-size: 28px; }
  .rg-menu small { display: block; font-weight: normal; color: #555; font-size: 12px; }

  /* เกม 1: นับไว นับถูก */
  .rg-hud { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 13px; }
  .rg-hud b { font-size: 15px; }
  .rg-time { height: 4px; background: #eee; margin: 0 12px; border-radius: 2px; overflow: hidden; }
  .rg-time i { display: block; height: 100%; background: #000; width: 100%; }
  .rg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 10px 12px; }
  .rg-slot { position: relative; height: 72px; background: #f3efe6; border: 1px solid #c9bfa8;
             border-bottom: 4px solid #8a7a5a; border-radius: 4px; overflow: hidden; }
  .rg-slot small { position: absolute; left: 4px; bottom: 2px; font-size: 9px; color: #6b5e45; }
  .rg-item { position: absolute; inset: 0; margin: auto; width: 54px; height: 54px; padding: 0;
             background: none; border: 0; font-size: 38px; line-height: 54px; cursor: pointer;
             animation: rg-pop .14s ease-out; }
  .rg-item:hover { transform: scale(1.08); }
  .rg-item.flip { animation: rg-flip .22s ease-out; }
  @keyframes rg-flip { from { transform: rotateY(180deg) scale(1.3); } }
  @keyframes rg-pop { from { transform: translateY(40px) scale(.6); } to { transform: none; } }
  .rg-slot.ok  { background: #dff5e1; }
  .rg-slot.bad { background: #fde0e0; animation: rg-shake .25s; }
  @keyframes rg-shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  .rg-toast { min-height: 20px; padding: 0 12px 8px; font-size: 13px; color: #b00020; font-weight: bold; text-align: center; }

  /* เกม 2: สายฟ้าแลบ */
  .rg-react { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
              width: calc(100% - 24px); height: 230px; margin: 12px; border: 0; border-radius: 8px;
              font-size: 16px; line-height: 1.5; text-align: center; user-select: none; touch-action: manipulation; }
  .rg-react .ico { font-size: 56px; line-height: 1; }
  .rg-react.wait  { background: #1b1b2f; color: #9a9ab0; }
  .rg-react.go    { background: #ffd400; color: #000; font-size: 22px; }
  .rg-react.early { background: #b00020; color: #fff; }
  .rg-react.done  { background: #f3f3f3; color: #000; }
  .rg-dots { text-align: center; font-size: 13px; color: #555; padding-bottom: 10px; }

  /* เกม 3: คำหวานหรือคำโกหก */
  .rg-quiz { padding: 12px 14px 14px; }
  .rg-q-no { font-size: 12px; color: #555; display: flex; justify-content: space-between; }
  .rg-quote { position: relative; margin: 10px 0 14px; padding: 14px 14px 14px 44px; background: #fff7d1;
              border: 1.5px solid #000; border-radius: 12px; font-size: 16px; font-weight: bold; line-height: 1.5; min-height: 76px; }
  .rg-quote::before { content: "⚡"; position: absolute; left: 12px; top: 12px; font-size: 22px; }
  .rg-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .rg-choices button { padding: 12px 8px; font-size: 15px; }
  .rg-choices .sweet { background: #fff; color: #000; border: 1.5px solid #000; }
  .rg-feedback { margin-top: 12px; padding: 10px 12px; border-radius: 6px; font-size: 13px; line-height: 1.5; }
  .rg-feedback.right { background: #dff5e1; }
  .rg-feedback.wrong { background: #fde0e0; }
  .rg-feedback b { display: block; font-size: 15px; }
  .rg-feedback button { margin-top: 8px; width: 100%; }

  /* จอเต็ม "คุณเป็นคนเจ้าชู้" */
  .rg-party { position: fixed; inset: 0; z-index: 100; overflow: hidden; display: flex; flex-direction: column;
              align-items: center; justify-content: center; gap: 10px; padding: 24px; text-align: center;
              background: radial-gradient(circle at 50% 45%, var(--c1) 0%, var(--c2) 55%, var(--c3) 100%);
              animation: rg-fade .25s ease-out; }
  @keyframes rg-fade { from { opacity: 0; } }
  .rg-party .rain { position: absolute; top: -10vh; font-size: 26px; pointer-events: none;
                    animation: rg-fall linear infinite; }
  @keyframes rg-fall { to { transform: translate(var(--sway), 120vh) rotate(var(--spin)); } }
  .rg-sticker { position: absolute; font-size: 64px; line-height: 1; pointer-events: none;
                filter: drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff)
                        drop-shadow(0 -3px 0 #fff) drop-shadow(0 4px 6px rgba(0,0,0,.35));
                transform: rotate(var(--rot)); animation: rg-stick .45s cubic-bezier(.3,1.6,.5,1) both,
                rg-bob 2.4s ease-in-out infinite alternate; animation-delay: var(--d), calc(var(--d) + .45s); }
  .rg-sticker.say { font-size: 17px; font-weight: bold; color: var(--accent); background: #fff; padding: 8px 14px;
                    border: 3px solid var(--accent); border-radius: 18px; white-space: nowrap;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,.3)); }
  @keyframes rg-stick { from { transform: rotate(var(--rot)) scale(0); } }
  @keyframes rg-bob { to { transform: rotate(calc(var(--rot) * -1)) translateY(-8px); } }
  .rg-party h2 { position: relative; margin: 0; font-size: clamp(34px, 8vw, 72px); line-height: 1.15; color: #fff;
                 text-shadow: 0 0 0 var(--accent), 3px 3px 0 var(--accent), -2px -2px 0 var(--accent), 2px -2px 0 var(--accent), -2px 2px 0 var(--accent),
                              0 8px 18px rgba(0,0,0,.25);
                 animation: rg-wobble 1.2s ease-in-out infinite; }
  .rg-party h2 small { display: block; font-size: .45em; }
  @keyframes rg-wobble { 0%,100% { transform: rotate(-3deg) scale(1); } 50% { transform: rotate(3deg) scale(1.06); } }
  .rg-party .big { font-size: clamp(70px, 14vw, 130px); line-height: 1; animation: rg-beat .6s ease-in-out infinite; }
  @keyframes rg-beat { 50% { transform: scale(1.18); } }
  .rg-stamp { position: relative; padding: 6px 18px; border: 5px double var(--stamp); border-radius: 10px; color: var(--stamp);
              font-size: clamp(20px, 4vw, 30px); font-weight: bold; background: rgba(255,255,255,.75);
              margin: 14px 0 10px; transform: rotate(-12deg); animation: rg-slam .35s cubic-bezier(.2,1.4,.4,1) 1.1s both; }
  @keyframes rg-slam { from { transform: rotate(-12deg) scale(3.5); opacity: 0; } }
  .rg-party p { position: relative; margin: 0; font-size: 16px; color: var(--deep); font-weight: bold; }
  .rg-party .coupon { padding: 6px 14px; border: 2px dashed var(--accent); border-radius: 8px; background: #fff; font-size: 14px; }
  .rg-party .acts { position: relative; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 6px; }
  .rg-party .acts button { font-size: 16px; padding: 12px 22px; border-radius: 999px; }
  .rg-party .acts .alt { background: #fff; color: var(--accent); border: 2px solid var(--accent); }

  @media (prefers-reduced-motion: reduce) {
    .rg-fab, .rg-fab::after { animation: none; }
    .rg-fab .tease span { animation: none; }
    .rg-fab .tease span:first-child { opacity: 1; }
    .rg-item, .rg-slot.bad, .rg-party, .rg-party h2, .rg-party .big, .rg-sticker, .rg-stamp { animation: none; }
    .rg-party .rain { display: none; }
  }
  @media print { .rg-fab, .rg-panel, .rg-party { display: none !important; } }`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- โครง UI ----------
  const fab = el("button", { className: "rg-fab", type: "button" });
  fab.setAttribute("aria-label", "เปิดมินิเกมพักสายตา");
  fab.innerHTML = `<span class="ico">🎮</span><span class="lbl">พักสายตา</span>
    <span class="tease" aria-hidden="true"><span>เบื่อนับของยัง? 😏</span><span>พี่กิ๊ฟเลี้ยงข้าวนะ 🍛</span><span>ใครเจ้าชู้ กดเลย ⚡</span></span>`;
  const panel = el("section", { className: "rg-panel", hidden: true });
  panel.setAttribute("aria-label", "มินิเกมพักสายตา");
  panel.innerHTML = `
    <div class="rg-head">
      <button type="button" class="rg-back" hidden>← เมนู</button>
      <span class="rg-title"></span>
      <button type="button" class="rg-close" aria-label="ปิดเกม">×</button>
    </div>
    <div class="rg-body"></div>`;
  document.body.append(fab, panel);
  const body = panel.querySelector(".rg-body");
  const title = panel.querySelector(".rg-title");
  const back = panel.querySelector(".rg-back");

  fab.onclick = () => { fab.hidden = true; panel.hidden = false; showMenu(); };
  panel.querySelector(".rg-close").onclick = close;
  back.onclick = showMenu;
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const party = document.querySelector(".rg-party");
    if (party) party.remove();
    else if (!panel.hidden) close();
  });

  // งานที่กำลังรัน (timer / rAF) ของเกมปัจจุบัน — ล้างทุกครั้งที่ออกจากเกม
  let game = null;

  function close() {
    stop();
    panel.hidden = true;
    fab.hidden = false;
    fab.focus();
  }

  function screen(name, html, isMenu) {
    stop();
    title.textContent = name;
    back.hidden = !!isMenu;
    body.innerHTML = html;
  }

  const GAMES = [
    { ico: "📦", name: "นับไว นับถูก",     desc: "กดนับกล่อง ห้ามนับแมวกับหัวหน้า", intro: countIntro },
    { ico: "⚡", name: "สายฟ้าแลบ",        desc: "วัดความไว ใครไวกว่าตอนเปลี่ยนใจ", intro: reactIntro },
    { ico: "💬", name: "คำหวานหรือคำโกหก", desc: "ทายว่าจริงใจ หรือเจ้าชู้",          intro: quizIntro }
  ];

  function showMenu() {
    screen("🎮 พักสายตา", `<div class="rg-menu">${GAMES.map((g, i) =>
      `<button type="button" data-i="${i}"><span class="ico">${g.ico}</span>
         <span><b>${g.name}</b><small>${g.desc}</small></span></button>`).join("")}</div>`, true);
    body.querySelectorAll("[data-i]").forEach((b) => { b.onclick = () => GAMES[b.dataset.i].intro(); });
    body.querySelector("button").focus();
  }

  // หน้าเริ่ม/หน้าผล: ใส่ HTML + ปุ่มเดียว
  function card(name, cls, html, btnText, onBtn) {
    screen(name, `<div class="${cls}">${html}<button type="button">${btnText}</button></div>`);
    const btn = body.querySelector(`.${cls} > button`);
    btn.onclick = onBtn;
    btn.focus();
  }

  // =====================================================================
  //  เกม 1: 📦 นับไว นับถูก
  // =====================================================================
  const COUNT = {
    NAME: "📦 นับไว นับถูก",
    ROUND_MS: 20000,
    CAT_LIMIT: 3,
    EMOJI: { box: "📦", cat: "🐈", boss: "🧑‍💼", flirt: "⚡" },
    // ความยาก (p = ความคืบหน้า 0→1): ยิ่งท้ายเกม ⚡ ยิ่งบ่อย กล่องยิ่งไว
    FLIRT_P:    (p) => 0.08 + 0.14 * p,  // โอกาส ⚡ โผล่ตรง ๆ   8% → 22%
    CAT_P:      0.13,
    BOSS_P:     0.09,
    DISGUISE_P: (p) => 0.12 + 0.20 * p,  // กล่องแอบเจ้าชู้ (📦 แล้วพลิกเป็น ⚡)  12% → 32% ของกล่อง
    FLIP_MS:    () => 260 + Math.random() * 260,
    BOX_LIFE:   (p) => 1050 - 450 * p,   // ms ก่อนกล่องหลุด
    FLIRT_LIFE: (p) => 1700 - 400 * p,   // ⚡ อยู่นานกว่า ล่อให้กด
    SPAWN_MS:   (p) => 560 - 300 * p + Math.random() * 160,
    LABEL: { box: "กล่องสินค้า", cat: "แมวคลัง", boss: "หัวหน้า", flirt: "หนุ่มเจ้าชู้" },
    LOSE: {
      flirt: { emoji: "💘", title: "ยินดีด้วย! คุณเป็นคนเจ้าชู้",
               text: "ให้นับของ ดันไปนับหนุ่มเจ้าชู้ — ตัดสิทธิ์ Recheck รอบนี้" },
      cat:   { emoji: "🐈🐈🐈", title: "แพ้! นับแมวครบ 3 ตัว",
               text: "ยินดีด้วย คุณได้รับตำแหน่งทาสแมวประจำคลัง DAL" }
    },
    WRONG_MSG: {
      cat:  ["แมวไม่ใช่ SKU! 🐈", "เหมียวไม่มีบาร์โค้ด", "แมวคลัง +1 ea ?!"],
      boss: ["นับหัวหน้าเข้าสต็อก 😱", "หัวหน้ามาตรวจ อย่านับ!", "หัวหน้า 1 ea ตัดจ่ายไม่ได้"]
    },
    DEFAULT_LOCS: ["1N-3-20", "1N-4-18", "1N-4-19", "1O-3-01", "1P-3-11", "3Q-1-01", "3Q-2-02", "1J-5-01", "1K-2-03"]
  };

  function countIntro() {
    const best = loadBest("rg-best");
    card(COUNT.NAME, "rg-intro", `
      <p class="rg-big">ภารกิจ Recheck 20 วินาที</p>
      <p>กด <b>📦</b> ให้ทันก่อนหายไป<br>
         ห้ามนับ <b>🐈 แมวคลัง</b> และ <b>🧑‍💼 หัวหน้า</b><br>
         ส่วนต่างเกิน 5% = โดนออกใบ Recheck</p>
      <p class="rg-warn"><b>แพ้ทันที:</b> นับ ⚡ หนุ่มเจ้าชู้ หรือ นับแมวครบ ${COUNT.CAT_LIMIT} ตัว</p>
      ${best !== null ? `<p class="rg-note">สถิติดีที่สุดของคุณ: ส่วนต่าง ${best}%</p>` : ""}`,
      "เริ่มนับ!", countStart);
  }

  function countStart() {
    const locs = [...new Set([...document.querySelectorAll("table.zones .loc")]
      .map((n) => n.firstChild.textContent.trim()))];
    const src = locs.length ? locs : COUNT.DEFAULT_LOCS;
    const labels = Array.from({ length: 9 }, (_, i) => src[i % src.length]);

    screen(COUNT.NAME, `
      <div class="rg-hud"><span>นับได้ <b class="rg-n">0</b> ea</span><span>หลุด <b class="rg-miss">0</b></span><span>นับผิด <b class="rg-bad">0</b></span></div>
      <div class="rg-time"><i></i></div>
      <div class="rg-grid">${labels.map((l) => `<div class="rg-slot"><small>${escapeHtml(l)}</small></div>`).join("")}</div>
      <div class="rg-toast" aria-live="polite"></div>`);

    game = newGame({ counted: 0, spawned: 0, missed: 0, cat: 0, boss: 0, t0: performance.now() });
    const slots = [...body.querySelectorAll(".rg-slot")];
    const bar = body.querySelector(".rg-time i");

    const tick = () => {
      if (!game) return;
      const left = Math.max(0, 1 - (performance.now() - game.t0) / COUNT.ROUND_MS);
      bar.style.width = (left * 100) + "%";
      if (left <= 0) return countFinish();
      game.raf = requestAnimationFrame(tick);
    };
    game.raf = requestAnimationFrame(tick);

    const spawnLoop = () => {
      if (!game) return;
      const progress = (performance.now() - game.t0) / COUNT.ROUND_MS;   // ยิ่งท้าย ยิ่งเร็ว
      countSpawn(slots, progress);
      later(spawnLoop, COUNT.SPAWN_MS(progress));
    };
    later(spawnLoop, 400);
    later(() => toast("⚠️ ช่วงนี้ ⚡ ระบาดหนัก!"), COUNT.ROUND_MS / 2);
  }

  function countSpawn(slots, progress) {
    const free = slots.filter((s) => !s.querySelector(".rg-item"));
    if (!free.length) return;
    const slot = pick(free);
    const r = Math.random(), pF = COUNT.FLIRT_P(progress);
    let type = r < pF ? "flirt" : r < pF + COUNT.CAT_P ? "cat" : r < pF + COUNT.CAT_P + COUNT.BOSS_P ? "boss" : "box";
    const disguised = type === "box" && Math.random() < COUNT.DISGUISE_P(progress);

    const item = el("button", { className: "rg-item", type: "button", textContent: COUNT.EMOJI[type] });
    item.setAttribute("aria-label", COUNT.LABEL[type]);
    if (type === "box") game.spawned++;
    slot.appendChild(item);

    const life = later(() => {                      // หมดเวลา: กล่องหลุด / ตัวอื่นเดินผ่านไป
      item.remove();
      if (type === "box" && game) { game.missed++; countHud(); }
    }, type === "flirt" ? COUNT.FLIRT_LIFE(progress) : COUNT.BOX_LIFE(progress));

    // กล่องแอบเจ้าชู้: ถ้ายังไม่ถูกกด จะพลิกเป็น ⚡ (ไม่นับเป็นกล่องในระบบแล้ว)
    const flip = disguised && later(() => {
      if (!item.isConnected || !game) return;
      type = "flirt";
      game.spawned--;
      item.textContent = COUNT.EMOJI.flirt;
      item.setAttribute("aria-label", COUNT.LABEL.flirt);
      item.classList.add("flip");
    }, COUNT.FLIP_MS());

    item.onpointerdown = (e) => {
      e.preventDefault();
      if (!game) return;
      for (const t of [life, flip]) if (t) { clearTimeout(t); game.timers.delete(t); }
      item.remove();
      if (type === "box") { game.counted++; flash(slot, "ok"); }
      else if (type === "flirt") return countFinish("flirt");
      else {
        game[type]++;
        if (type === "cat" && game.cat >= COUNT.CAT_LIMIT) return countFinish("cat");
        flash(slot, "bad");
        toast(type === "cat" ? pick(COUNT.WRONG_MSG.cat) + ` (${game.cat}/${COUNT.CAT_LIMIT})` : pick(COUNT.WRONG_MSG[type]));
      }
      countHud();
    };
  }

  // reason = "flirt" | "cat" เมื่อแพ้ทันที, ไม่ส่ง = หมดเวลา
  function countFinish(reason) {
    const g = game;
    stop();
    if (reason) {
      const lose = COUNT.LOSE[reason];
      card(COUNT.NAME, "rg-result", `
        <p class="rg-big">${lose.emoji}</p>
        <p class="rg-big">${lose.title}</p>
        <p>${lose.text}</p>
        <table class="rg-table">
          <tr><td>นับกล่องได้ก่อนพลาด</td><td>${g.counted} ea</td></tr>
          <tr><td>แมวที่ถูกนับ</td><td>${g.cat} ตัว</td></tr>
          <tr><td>หัวหน้าที่ถูกนับ</td><td>${g.boss} คน</td></tr>
        </table>`, "แก้ตัวใหม่", countStart);
      return party(reason, {
        stat: reason === "flirt" ? `นับกล่องได้ ${g.counted} ea ก่อนหลงเสน่ห์ ⚡`
                                 : `นับแมวไป ${g.cat} ตัว · กล่อง ${g.counted} ea`,
        onRetry: countStart
      });
    }

    const wrong = g.cat + g.boss;
    const variance = g.spawned ? Math.round(((g.missed + wrong) / g.spawned) * 1000) / 10 : 0;
    const best = loadBest("rg-best");
    const isBest = best === null || variance < best;
    if (isBest) saveBest("rg-best", variance);

    let verdict, emoji;
    if (variance === 0)      { emoji = "🏆"; verdict = "แม่นกว่าระบบ! ไปสอนน้องใหม่ได้เลย"; }
    else if (variance <= 5)  { emoji = "✅"; verdict = "ผ่าน! ส่วนต่างไม่เกิน 5% กลับไปทำงานได้"; }
    else if (variance <= 20) { emoji = "📋"; verdict = "ส่วนต่างเกิน 5% — ระบบออกใบ Recheck ให้คุณแล้ว"; }
    else                     { emoji = "🚨"; verdict = "สต็อกหายเยอะมาก… หัวหน้าเรียกพบด่วน"; }

    const extra = [];
    if (g.boss) extra.push(`นับหัวหน้าเข้าสต็อก ${g.boss} ea — ตัดจ่ายไม่ได้นะ`);
    if (g.cat) extra.push(`แมวคลังถูกนับ ${g.cat} ครั้ง — เหมียวงงมาก`);

    card(COUNT.NAME, "rg-result", `
      <p class="rg-big">${emoji} ส่วนต่าง ${variance}%</p>
      <p>${verdict}</p>
      <table class="rg-table">
        <tr><td>ยอดในระบบ (กล่องที่โผล่)</td><td>${g.spawned} ea</td></tr>
        <tr><td>นับได้</td><td>${g.counted} ea</td></tr>
        <tr><td>หลุดสายตา</td><td>${g.missed} ea</td></tr>
        <tr><td>นับผิด (แมว/หัวหน้า)</td><td>${wrong} ea</td></tr>
      </table>
      ${extra.map((t) => `<p class="rg-warn" style="font-size:12px">${t}</p>`).join("")}
      ${isBest && best !== null ? `<p style="font-size:12px">🎉 สถิติใหม่! (เดิม ${best}%)</p>` : ""}`,
      "Recheck อีกรอบ", countStart);
    party(variance <= 5 ? "win" : "recheck", {
      stat: `ส่วนต่าง ${variance}% · นับได้ ${g.counted}/${g.spawned} ea`,
      onRetry: countStart
    });
  }

  // =====================================================================
  //  จอเต็มตอนจบเกม — ชนะ = พี่กิ๊ฟเลี้ยงข้าว, แพ้ = แซวตามสาเหตุ (สุ่มหัวข้อ/ตรายาง/สติ๊กเกอร์ทุกครั้ง)
  // =====================================================================
  const FLIRT_THEME = {
    colors: ["#ffd1e6", "#ff8cc0", "#ff4f9a", "#c2185b", "#5a0030", "#d50000"],   // c1 c2 c3 accent deep stamp
    big:    ["💘", "😘", "💋"],
    rain:   ["💗", "💕", "💘", "💋", "🌹", "💌"],
    emoji:  ["😘", "💋", "🌹", "😏", "💌", "⚡", "😍"],
    say:    ["ใจเดียวไม่มีอยู่จริง", "แชทเต็มเลยสิ", "หัวใจมีหลายห้อง 🏠", "ว่างไหมคะพี่ 👉👈",
             "ทักทุกคนเลยปะ", "น้องสาวอีกแล้ว?"],
    titles: [["ยินดีด้วย!", "คุณเป็นคนเจ้าชู้"], ["ตรวจพบ!", "ความเจ้าชู้ 100%"], ["หัวใจคุณ", "มีหลายห้องเกินไป"]],
    stamps: ["เจ้าชู้ตัวพ่อ ✔ CERTIFIED", "ใจเดียว ✘ ไม่ผ่าน QC", "เจ้าชู้ระดับ ISO 9001"],
    accept: "ยอมรับแต่โดยดี 😳",
    retry:  "ไม่ใช่นะ! ขอแก้ตัว"
  };
  const THEMES = {
    win: {
      colors: ["#fff6c8", "#ffd54f", "#ff9800", "#e65100", "#4e2600", "#2e7d32"],
      big:    ["🍛", "🍜", "🍗", "🥳"],
      rain:   ["🍚", "🍜", "🍗", "🍣", "🧋", "🎉", "🍤"],
      emoji:  ["🍛", "🍗", "🍣", "🧋", "🥢", "🎉", "🤤"],
      say:    ["ไม่ต้องเกรงใจ", "ขอเพิ่มไข่ดาว 🍳", "แคปจอไปทวงเลย 📸", "พี่กิ๊ฟใจดีที่สุด 💛", "จัดหนักได้!", "อิ่มนี้ฟรี"],
      titles: [["ยินดีด้วย!", "พี่กิ๊ฟเลี้ยงข้าวคุณ 1 มื้อ"]],
      stamps: ["คูปองข้าวฟรี ✔ พี่กิ๊ฟจ่าย", "อนุมัติแล้ว ✔ 1 มื้อ", "ใช้ได้จริง ✔ ห้ามเบี้ยว"],
      menus:  ["ข้าวมันไก่", "กะเพราไข่ดาว", "หมูกระทะ", "ส้มตำไก่ย่าง", "ชาบู", "ข้าวขาหมู", "ก๋วยเตี๋ยวเรือ"],
      accept: "รับคูปอง 🍛",
      retry:  "เล่นอีกรอบ"
    },
    flirt: FLIRT_THEME,
    impatient: Object.assign({}, FLIRT_THEME, {
      titles: [["ใจร้อน!", "เหมือนคนเจ้าชู้"], ["รีบไปไหน!", "ทักทุกคนไว้ก่อนเลยปะ"], ["กดก่อนคิด!", "สไตล์คนเจ้าชู้"]],
      stamps: ["ใจร้อน ✔ เจ้าชู้แน่นอน", "กดก่อนคิด ✔ CERTIFIED", "รอไม่เป็น ✘ ไม่ผ่าน"]
    }),
    cat: {
      colors: ["#fff1dc", "#ffc27a", "#ff8f3d", "#b85c00", "#4a2400", "#6d4c41"],
      big:    ["🙀", "😹", "🐈"],
      rain:   ["🐾", "🐈", "🐟", "🧶"],
      emoji:  ["🐈", "😺", "🐟", "🧶", "🐾", "😼", "🙀"],
      say:    ["เหมียว~", "นับแมวทำไม", "แมวไม่มีบาร์โค้ด", "ให้อาหารด้วยนะ 🐟", "ทาสแมวตัวจริง", "หนูไม่ใช่ SKU"],
      titles: [["แพ้!", "นับแมวครบ 3 ตัว"], ["เหมียว!", "คุณถูกแมวตกแล้ว"], ["ยินดีด้วย!", "คุณคือทาสแมวประจำคลัง"]],
      stamps: ["ทาสแมว ✔ ประจำคลัง DAL", "แมวไม่ใช่สต็อก ✘", "ใบรับรองคนรักแมว ✔"],
      accept: "ยอมเป็นทาส 🐾",
      retry:  "ขอแก้ตัว"
    },
    recheck: {
      colors: ["#e3f2fd", "#90caf9", "#42a5f5", "#0d47a1", "#062a5c", "#d50000"],
      big:    ["📋", "😵", "🚨"],
      rain:   ["📋", "📦", "❓", "🧾", "📉"],
      emoji:  ["📦", "📋", "🧑‍💼", "❓", "📉", "😰", "🔍"],
      say:    ["ยอดไม่ตรงนะ", "หัวหน้าเรียกพบ", "นับใหม่หมดเลย", "กล่องหายไปไหน?", "OT คืนนี้ 🌙", "ระบบไม่ผิด คุณผิด"],
      titles: [["ส่วนต่างเกิน 5%!", "ต้อง Recheck รอบ 2"], ["สต็อกไม่ตรง!", "หัวหน้าเรียกพบหลังเลิกงาน"], ["นับหลุด!", "กล่องหายไปไหนหมด"]],
      stamps: ["ต้อง Recheck ✔ รอบ 2", "ไม่ผ่าน ✘ ส่วนต่างเกิน", "ส่ง QC ด่วน 🚨"],
      accept: "รับใบ Recheck 📋",
      retry:  "นับใหม่"
    },
    slow: {
      colors: ["#e8f5e9", "#a5d6a7", "#66bb6a", "#1b5e20", "#0b2e10", "#2e7d32"],
      big:    ["🐢", "🐌", "😴"],
      rain:   ["🐢", "🐌", "💤", "⏳"],
      emoji:  ["🐢", "🐌", "😴", "⏳", "💤", "📵", "🦥"],
      say:    ["อ่านแล้วไม่ตอบ", "เดี๋ยวค่อยกด", "เน็ตช้าหรือใจช้า", "สายฟ้าไปไกลแล้ว ⚡", "รอบหน้าค่อยไว", "ตื่นยัง?"],
      titles: [["ช้ากว่าเต่า!", "สายฟ้าผ่านไปนานแล้ว"], ["อ่านแล้วไม่ตอบ", "ตัวจริงเสียงจริง"], ["ไวไม่ทัน!", "เขาเปลี่ยนใจไปแล้ว"]],
      stamps: ["ตอบไลน์ช้า ✔ CERTIFIED", "สายฟ้า ✘ ไม่ทัน", "ช้าแต่ชัวร์ (มั้ง)"],
      accept: "ยอมรับว่าช้า 🐢",
      retry:  "แลบอีกรอบ"
    },
    fooled: {
      colors: ["#f3e5f5", "#ce93d8", "#ab47bc", "#6a1b9a", "#2e0b3d", "#d50000"],
      big:    ["🥺", "💌", "🫠"],
      rain:   ["💌", "💘", "🥺", "🌹"],
      emoji:  ["🥺", "💌", "🫠", "🌹", "⚡", "🎣", "🙈"],
      say:    ["เชื่อเขาไปได้ไง", "น้องสาวทั้งนั้น", "โดนตกแล้ว 🎣", "แบตหมดจริงเหรอ?", "ระวังคำหวาน", "อย่าเชื่อง่าย!"],
      titles: [["โดนหลอกแล้ว!", "คำหวานทั้งนั้นเลย"], ["หลอกง่ายจัง!", "คุณคือเป้าหมายคนเจ้าชู้"], ["เรดาร์พัง!", "จับคนเจ้าชู้ไม่ได้เลย"]],
      stamps: ["เป้าหมายคนเจ้าชู้ ✔ VIP", "เรดาร์ ✘ ไม่ผ่าน", "หลอกง่าย ✔ CERTIFIED"],
      accept: "ยอมรับว่าใจอ่อน 🥺",
      retry:  "ฟังใหม่"
    }
  };
  // ตำแหน่งสติ๊กเกอร์รอบขอบจอ (ซ้าย%, บน%) — emoji 6 ตัว + คำพูด 4 อัน
  const EMOJI_SPOTS = [[6, 8], [82, 6], [3, 44], [87, 40], [6, 74], [84, 72]];
  const SAY_SPOTS = [[22, 10], [56, 14], [14, 90], [58, 91]];

  function party(key, { stat, onRetry }) {
    const t = THEMES[key];
    const [title, sub] = pick(t.titles);
    const old = document.querySelector(".rg-party");
    if (old) old.remove();

    const party = el("div", { className: "rg-party" });
    party.setAttribute("role", "dialog");
    party.setAttribute("aria-modal", "true");
    party.setAttribute("aria-label", title + " " + sub);
    ["--c1", "--c2", "--c3", "--accent", "--deep", "--stamp"].forEach((v, i) => party.style.setProperty(v, t.colors[i]));

    const rain = Array.from({ length: 28 }, () => {
      const r = el("span", { className: "rain", textContent: pick(t.rain) });
      r.style.left = Math.random() * 100 + "vw";
      r.style.animationDuration = 3 + Math.random() * 4 + "s";
      r.style.animationDelay = -Math.random() * 6 + "s";
      r.style.setProperty("--sway", (Math.random() * 120 - 60) + "px");
      r.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
      return r;
    });
    const stickers = [
      ...shuffle(t.emoji).slice(0, EMOJI_SPOTS.length).map((s, i) => [EMOJI_SPOTS[i], s, false]),
      ...shuffle(t.say).slice(0, SAY_SPOTS.length).map((s, i) => [SAY_SPOTS[i], s, true])
    ].map(([[x, y], s, say], i) => {
      const st = el("span", { className: "rg-sticker" + (say ? " say" : ""), textContent: s });
      st.style.left = x + "%";
      st.style.top = y + "%";
      st.style.setProperty("--rot", (i % 2 ? 1 : -1) * (6 + Math.random() * 12) + "deg");
      st.style.setProperty("--d", 0.15 + i * 0.08 + "s");
      return st;
    });
    party.append(...rain, ...stickers);

    const coupon = key === "win"
      ? `<p class="coupon"><b style="font-size:17px">🎟️ คูปองเลี้ยงข้าวจากพี่กิ๊ฟ</b><br>
           รหัส GIFT-${1000 + Math.floor(Math.random() * 9000)} · เมนูแนะนำ: ${pick(t.menus)}<br>
           <span style="font-weight:normal">แคปหน้าจอไปทวงพี่กิ๊ฟได้เลย 📸</span></p>`
      : "";
    party.insertAdjacentHTML("beforeend", `
      <div class="big">${pick(t.big)}</div>
      <h2>${title}<small>${sub}</small></h2>
      <div class="rg-stamp">${pick(t.stamps)}</div>
      <p>${escapeHtml(stat)}</p>
      ${coupon}
      <div class="acts">
        <button type="button" class="alt">${t.accept}</button>
        <button type="button">${t.retry}</button>
      </div>`);
    const [accept, retry] = party.querySelectorAll(".acts button");
    accept.onclick = () => party.remove();
    retry.onclick = () => { party.remove(); onRetry(); };
    document.body.appendChild(party);
    accept.focus();
  }

  function countHud() {
    body.querySelector(".rg-n").textContent = game.counted;
    body.querySelector(".rg-miss").textContent = game.missed;
    body.querySelector(".rg-bad").textContent = game.cat + game.boss;
  }

  // =====================================================================
  //  เกม 2: ⚡ สายฟ้าแลบ — รอจอเหลืองแล้วกดให้ไวที่สุด
  //  กับดัก (ไม่บอกผู้เล่น): สายฟ้าปลอมแลบหลอกก่อนของจริง กดโดน = นับเป็นกดก่อน
  // =====================================================================
  const REACT = {
    NAME: "⚡ สายฟ้าแลบ",
    TRIES: 5,
    WIN_AVG: 260,                        // เฉลี่ยไม่เกินนี้ (ms) = ชนะ
    EARLY_LIMIT: 2,                      // กดก่อน/โดนหลอกครบเท่านี้ = แพ้ทันที
    WAIT_MS: () => 1500 + Math.random() * 3000,
    DECOY_P: 0.55,                       // โอกาสมีสายฟ้าปลอมในแต่ละครั้ง
    DECOYS: [                            // [ไอคอน, ข้อความ, สีพื้น, สีตัวอักษร]
      ["💋", "กดสิ~", "#ff4f9a", "#fff"],
      ["😘", "แลบแล้วจ้า!", "#ff8cc0", "#000"],
      ["🔥", "กด!", "#ff9800", "#000"],
      ["🌩️", "เกือบแลบ…", "#5c5c8a", "#fff"],
      ["💛", "กด!", "#ffe9a8", "#000"]
    ],
    EARLY_MSG: ["ใจร้อนเหมือนคนเจ้าชู้ รีบเกิน!", "ยังไม่แลบเลย กดไปก่อนแล้ว!", "รีบขนาดนี้ ทักใครไว้กี่คน?"],
    DECOY_MSG: ["โดนหลอกแล้ว! นั่นสายฟ้าปลอม 😘", "เห็นอะไรวิบวับก็กด เจ้าชู้ชัด ๆ", "ของปลอมก็หลงเหรอ!"],
    RANKS: [                             // [ms ไม่เกิน, ไอคอน, ฉายา]
      [200, "⚡", "ไวกว่าตอนเปลี่ยนใจ"],
      [260, "🏎️", "ไวเท่าตอนกดหัวใจสตอรี่"],
      [330, "😎", "ไวพอ ๆ กับตอบแชทคนที่ชอบ"],
      [450, "🐌", "ช้าเหมือนตอบไลน์แฟนเก่า"],
      [Infinity, "🐢", "อ่านแล้วไม่ตอบ"]
    ]
  };

  function reactIntro() {
    const best = loadBest("rg-react-best");
    card(REACT.NAME, "rg-intro", `
      <p class="rg-big">ไวกว่าสายฟ้าไหม?</p>
      <p>รอจนจอกลายเป็น <b style="background:#ffd400;padding:0 4px">สีเหลือง ⚡</b><br>
         แล้วกด (หรือกด Space) ให้ไวที่สุด · เล่น ${REACT.TRIES} ครั้ง<br>
         เฉลี่ยไม่เกิน ${REACT.WIN_AVG} ms = ได้ข้าวพี่กิ๊ฟ 🍛</p>
      <p class="rg-warn">กดก่อนสายฟ้าแลบ ${REACT.EARLY_LIMIT} ครั้ง = แพ้ ใจร้อนเหมือนคนเจ้าชู้</p>
      ${best !== null ? `<p class="rg-note">สถิติดีที่สุดของคุณ: ${best} ms</p>` : ""}`,
      "เริ่ม!", reactStart);
  }

  function reactStart() {
    screen(REACT.NAME, `<button type="button" class="rg-react"></button><div class="rg-dots"></div>`);
    game = newGame({ times: [], early: 0, fooled: 0, state: "", t0: 0 });
    const pad = body.querySelector(".rg-react");
    const dots = body.querySelector(".rg-dots");

    const show = (state, html, bg, fg) => {
      game.state = state;
      pad.className = "rg-react " + state;
      pad.style.background = bg || "";
      pad.style.color = fg || "";
      pad.innerHTML = html;
    };
    const progress = () => {
      dots.textContent = "ครั้งที่ " + Math.min(game.times.length + 1, REACT.TRIES) + " / " + REACT.TRIES +
        " · พลาด " + game.early + "/" + REACT.EARLY_LIMIT +
        (game.times.length ? " · " + game.times.map((t) => t + " ms").join(" · ") : "");
    };
    const waiting = () => show("wait", `<span class="ico">🌩️</span><span>รอสายฟ้า…</span>`);
    const arm = () => {
      progress();
      waiting();
      const realAt = REACT.WAIT_MS();
      if (Math.random() < REACT.DECOY_P) {           // สายฟ้าปลอม: แลบหลอกแล้วดับ ก่อนของจริงอย่างน้อย ~0.3 วิ
        const dur = 350 + Math.random() * 300;
        const at = 400 + Math.random() * Math.max(0, realAt - dur - 700);
        const [ico, text, bg, fg] = pick(REACT.DECOYS);
        later(() => {
          if (game.state !== "wait") return;
          show("decoy", `<span class="ico">${ico}</span><b>${text}</b>`, bg, fg);
          later(() => { if (game.state === "decoy") waiting(); }, dur);
        }, at);
      }
      later(() => {
        if (!game) return;
        show("go", `<span class="ico">⚡</span><b>กด!</b>`);
        game.t0 = performance.now();
      }, realAt);
    };

    const press = () => {
      if (!game) return;
      if (game.state === "wait" || game.state === "decoy") {   // กดก่อน / โดนหลอก: ยกเลิกครั้งนี้
        const fooled = game.state === "decoy";
        game.timers.forEach(clearTimeout); game.timers.clear();
        game.early++;
        if (fooled) game.fooled++;
        if (game.early >= REACT.EARLY_LIMIT) return reactFinish("impatient");
        show("early", `<span class="ico">💔</span><b>${pick(fooled ? REACT.DECOY_MSG : REACT.EARLY_MSG)}</b>
                       <span>พลาด ${game.early}/${REACT.EARLY_LIMIT} · แตะเพื่อลองใหม่</span>`);
      } else if (game.state === "go") {
        const ms = Math.round(performance.now() - game.t0);
        game.times.push(ms);
        if (game.times.length >= REACT.TRIES) return reactFinish();
        show("done", `<span class="ico">${rankOf(ms)[1]}</span><b style="font-size:26px">${ms} ms</b><span>แตะเพื่อไปต่อ</span>`);
        progress();
      } else if (game.state === "early" || game.state === "done") {
        arm();
      }
    };
    pad.onpointerdown = (e) => { e.preventDefault(); press(); };
    pad.onkeydown = (e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) press(); }
    };
    pad.focus();
    arm();
  }

  // reason = "impatient" เมื่อกดก่อนครบ EARLY_LIMIT, ไม่ส่ง = เล่นครบทุกครั้ง
  function reactFinish(reason) {
    const g = game;
    stop();
    const n = g.times.length;
    const bestNow = n ? Math.min(...g.times) : null;
    const avg = n ? Math.round(g.times.reduce((a, b) => a + b, 0) / n) : null;
    const missLine = `กดก่อน ${g.early} ครั้ง` + (g.fooled ? ` (โดนสายฟ้าปลอม ${g.fooled})` : "");

    if (reason) {
      card(REACT.NAME, "rg-result", `
        <p class="rg-big">💔 ใจร้อน!</p>
        <p>${missLine} — แพ้ก่อนครบ ${REACT.TRIES} ครั้ง</p>
        <table class="rg-table">
          ${g.times.map((t, i) => `<tr><td>ครั้งที่ ${i + 1}</td><td>${t} ms</td></tr>`).join("")}
        </table>`, "แลบอีกรอบ", reactStart);
      return party("impatient", { stat: missLine + ` · ทำได้ ${n}/${REACT.TRIES} ครั้ง`, onRetry: reactStart });
    }

    const [, ico, rank] = rankOf(bestNow);
    const best = loadBest("rg-react-best");
    const isBest = best === null || bestNow < best;
    if (isBest) saveBest("rg-react-best", bestNow);

    card(REACT.NAME, "rg-result", `
      <p class="rg-big">${ico} ${bestNow} ms</p>
      <p><b>${rank}</b></p>
      <table class="rg-table">
        ${g.times.map((t, i) => `<tr><td>ครั้งที่ ${i + 1}</td><td>${t} ms</td></tr>`).join("")}
        <tr><td>เฉลี่ย</td><td>${avg} ms</td></tr>
        <tr><td>กดก่อนสายฟ้าแลบ</td><td>${g.early} ครั้ง</td></tr>
      </table>
      ${isBest && best !== null ? `<p style="font-size:12px">🎉 สถิติใหม่! (เดิม ${best} ms)</p>` : ""}`,
      "แลบอีกรอบ", reactStart);
    // ชนะ = เฉลี่ยไม่เกิน REACT.WIN_AVG ms
    party(avg <= REACT.WIN_AVG ? "win" : "slow", {
      stat: `เร็วสุด ${bestNow} ms · เฉลี่ย ${avg} ms` + (g.early ? ` · ${missLine}` : ""),
      onRetry: reactStart
    });
  }

  const rankOf = (ms) => REACT.RANKS.find((r) => ms <= r[0]);

  // =====================================================================
  //  เกม 3: 💬 คำหวานหรือคำโกหก — ⚡ พูดมา ทายว่าจริงใจหรือเจ้าชู้
  // =====================================================================
  const QUIZ = {
    NAME: "💬 คำหวานหรือคำโกหก",
    QUESTIONS: 8,
    WIN_SCORE: 7,                        // ทายถูกอย่างน้อยเท่านี้ = ชนะ
    LINES: [                             // [ประโยค, true = เจ้าชู้, เฉลย]
      ["ผมคุยแค่คุณคนเดียวจริง ๆ นะ", true, "ข้อความนี้ถูกส่งออกไป 12 แชทพร้อมกัน"],
      ["ที่ไม่ตอบเพราะแบตหมด 3 วันติด", true, "แต่สตอรี่ขึ้นทุกชั่วโมง"],
      ["เธอเป็นคนแรกที่ผมพามาร้านนี้", true, "พนักงานร้านทักชื่อเขาตั้งแต่หน้าประตู"],
      ["คนนั้นแค่น้องสาวน่ะ", true, "น้องสาวคนที่ 7 ของเดือนนี้"],
      ["ผมไม่ค่อยเล่นโซเชียลหรอก", true, "มี 4 แอคเคานต์ ใช้ไม่ซ้ำกันเลย"],
      ["ฝันถึงเธอทุกคืนเลย", true, "แต่เล่าความฝันแล้วเรียกชื่อผิด"],
      ["เลิกกับแฟนเก่าเด็ดขาดแล้ว", true, "แฟนเก่ายังกดไลก์ทุกรูปเมื่อเช้า"],
      ["ผมไม่เคยเจ้าชู้เลยในชีวิต", true, "ประโยคนี้ฟ้าผ่ากลางคลัง ⚡"],
      ["เธอน่ารักที่สุดในคลังเลย", true, "พูดประโยคนี้ครบทุกโซนแล้ว ตั้งแต่ 1J ถึง 3Q"],
      ["เดี๋ยวช่วยยกกล่องให้ หนักไหม", false, "จริงใจ แค่อยากช่วยจริง ๆ"],
      ["วันนี้ขอกลับก่อนนะ ต้องไปรับแม่", false, "จริงใจ ไม่ใช่ทุกคำจะเป็นมุก"],
      ["นับ 1N-4-19 ได้ 64 ชิ้น ตรงยอดระบบเป๊ะ", false, "จริงใจ และตรงสต็อก 👏"],
      ["ขอโทษนะ เมื่อวานผมนับผิดเอง", false, "ยอมรับผิด = จริงใจของแท้"],
      ["ซื้อกาแฟมาฝากทุกคนในทีมเลย", false, "ทุกคนจริง ๆ ไม่ได้เลือกเฉพาะคนน่ารัก"],
      ["ยังไม่พร้อมมีแฟน ขอโฟกัสงานก่อน", false, "บางคนก็พูดจริงนะ เชื่อเขาสักครั้ง"],
      ["ไม่รู้เหมือนกัน เดี๋ยวไปถามหัวหน้าให้", false, "ซื่อตรงสุด ๆ ไม่มั่ว"],
      ["เก็บเทปกาวที่พื้นให้แล้วนะ", false, "คนดีของคลัง ไม่หวังผล"],
      ["ขอบคุณที่ช่วย Recheck วันนี้นะ", false, "จริงใจ งานเสร็จเพราะทุกคน"]
    ],
    RANKS: [                             // [คะแนนขั้นต่ำ, ไอคอน, ผล]
      [8, "📡", "เรดาร์ระดับ NASA — ไม่มีใครหลอกคุณได้"],
      [6, "🕵️", "จับได้เกือบหมด เหลือรอดไปไม่กี่คำ"],
      [4, "😵", "โดนหลอกไปครึ่ง ๆ ระวังหน่อยนะ"],
      [0, "💘", "หลอกง่ายมาก — ยินดีด้วย คุณคือเป้าหมายของคนเจ้าชู้"]
    ]
  };

  function quizIntro() {
    const best = loadBest("rg-quiz-best");
    card(QUIZ.NAME, "rg-intro", `
      <p class="rg-big">⚡ พูดมา คุณทายมา</p>
      <p>ฟังคำพูด ${QUIZ.QUESTIONS} ประโยค<br>
         แล้วตัดสินว่า <b>💗 จริงใจ</b> หรือ <b>⚡ เจ้าชู้</b></p>
      ${best !== null ? `<p class="rg-note">สถิติดีที่สุดของคุณ: ${best}/${QUIZ.QUESTIONS}</p>` : ""}`,
      "เริ่มฟัง!", quizStart);
  }

  function quizStart() {
    const flirt = shuffle(QUIZ.LINES.filter((l) => l[1]));
    const sweet = shuffle(QUIZ.LINES.filter((l) => !l[1]));
    const nFlirt = 4 + Math.floor(Math.random() * 2);              // เจ้าชู้ 4–5 ข้อ ที่เหลือจริงใจ
    const deck = shuffle([...flirt.slice(0, nFlirt), ...sweet.slice(0, QUIZ.QUESTIONS - nFlirt)]);
    game = newGame({ deck, i: 0, score: 0 });
    quizAsk();
  }

  function quizAsk() {
    const g = game;
    const [line] = g.deck[g.i];
    screen(QUIZ.NAME, `
      <div class="rg-quiz">
        <div class="rg-q-no"><span>ข้อ ${g.i + 1} / ${g.deck.length}</span><span>ถูก ${g.score}</span></div>
        <div class="rg-quote">“${escapeHtml(line)}”</div>
        <div class="rg-choices">
          <button type="button" class="sweet" data-flirt="0">💗 จริงใจ</button>
          <button type="button" data-flirt="1">⚡ เจ้าชู้</button>
        </div>
        <div class="rg-out" aria-live="polite"></div>
      </div>`);
    game = g;                                         // screen() ล้าง game — คืนค่าไว้ใช้ต่อ
    body.querySelectorAll("[data-flirt]").forEach((b) => { b.onclick = () => quizAnswer(b.dataset.flirt === "1"); });
    body.querySelector("[data-flirt]").focus();
  }

  function quizAnswer(saidFlirt) {
    const g = game;
    const [, isFlirt, why] = g.deck[g.i];
    const right = saidFlirt === isFlirt;
    if (right) g.score++;
    body.querySelectorAll("[data-flirt]").forEach((b) => { b.disabled = true; });
    const last = g.i + 1 >= g.deck.length;
    body.querySelector(".rg-out").innerHTML = `
      <div class="rg-feedback ${right ? "right" : "wrong"}">
        <b>${right ? "ถูกต้อง!" : "ผิด!"} ${isFlirt ? "⚡ เจ้าชู้" : "💗 จริงใจ"}</b>${escapeHtml(why)}
        <button type="button">${last ? "ดูผล" : "ข้อต่อไป →"}</button>
      </div>`;
    const next = body.querySelector(".rg-feedback button");
    next.onclick = () => { g.i++; game = g; last ? quizFinish() : quizAsk(); };
    next.focus();
  }

  function quizFinish() {
    const g = game;
    stop();
    const [, ico, verdict] = QUIZ.RANKS.find((r) => g.score >= r[0]);
    const best = loadBest("rg-quiz-best");
    const isBest = best === null || g.score > best;
    if (isBest) saveBest("rg-quiz-best", g.score);
    card(QUIZ.NAME, "rg-result", `
      <p class="rg-big">${ico} ${g.score} / ${g.deck.length}</p>
      <p><b>${verdict}</b></p>
      ${isBest && best !== null ? `<p style="font-size:12px">🎉 สถิติใหม่! (เดิม ${best}/${g.deck.length})</p>` : ""}`,
      "ฟังอีกรอบ", quizStart);
    party(g.score >= QUIZ.WIN_SCORE ? "win" : "fooled", {
      stat: `ทายถูก ${g.score} / ${g.deck.length}`,
      onRetry: quizStart
    });
  }

  // =====================================================================
  //  ตัวช่วย
  // =====================================================================
  function newGame(state) { return Object.assign({ timers: new Set(), raf: 0 }, state); }
  function stop() {
    if (!game) return;
    cancelAnimationFrame(game.raf);
    game.timers.forEach(clearTimeout);
    game = null;
  }
  function later(fn, ms) {
    const g = game;
    const id = setTimeout(() => { if (g) g.timers.delete(id); fn(); }, ms);
    g.timers.add(id);
    return id;
  }
  function flash(slot, cls) {
    slot.classList.remove("ok", "bad");
    void slot.offsetWidth;                          // รีสตาร์ทแอนิเมชัน
    slot.classList.add(cls);
    setTimeout(() => slot.classList.remove(cls), 250);
  }
  function toast(msg) {
    const t = body.querySelector(".rg-toast");
    if (t) t.textContent = msg;
  }
  function loadBest(key) {
    try { const v = localStorage.getItem(key); return v === null ? null : Number(v); } catch (_) { return null; }
  }
  function saveBest(key, v) {
    try { localStorage.setItem(key, String(v)); } catch (_) {}
  }
  function el(tag, props) { return Object.assign(document.createElement(tag), props); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();
