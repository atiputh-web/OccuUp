/* ---------- Config ---------- */
const BRAND = { short: "OccuUp", full: "OccuUp" };
const APP_URL = (window.SITE && SITE.appUrl) || "https://app.your-domain.com";
document.querySelectorAll("[data-brand]").forEach(el => el.textContent = BRAND.short);
document.querySelectorAll("[data-brand-full]").forEach(el => el.textContent = BRAND.full);
document.querySelectorAll("[data-app]").forEach(el => el.href = APP_URL + el.dataset.app);
const $ = id => document.getElementById(id);
const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Planner: build the generated parts ---------- */
(function buildPlanner(){
  const dots = $("dots");
  for (let i = 0; i < 144; i++) {
    const d = document.createElement("span");
    d.className = "dot" + (((i * 37) % 144) < 25 ? " ret" : "");
    d.style.transitionDelay = (Math.floor(i / 18) * 40 + (i % 18) * 12) + "ms";
    dots.appendChild(d);
  }
  const head = $("mhead");
  for (let m = 0; m < 12; m++) {
    const s = document.createElement("span");
    s.className = "mlab" + (m >= 4 && m <= 9 ? " low" : "");
    head.appendChild(s);
  }
  const MARKETS = [
    ["c_au", "Australia", "1,480", [2,1,1,2,1,3,3,2,1,1,1,3]],
    ["c_uk", "United Kingdom", "1,120", [3,3,2,2,1,1,2,2,1,1,2,3]],
    ["c_de", "Germany", "860", [3,3,2,1,0,0,1,1,1,2,3,3]],
    ["c_in", "India", "640", [1,1,1,2,3,3,1,1,1,3,3,2]],
    ["c_cn", "China", "520", [3,3,1,1,1,1,2,2,1,3,1,1]],
    ["c_gcc", "Gulf states", "310", [1,1,1,1,1,3,3,3,1,1,1,1]]
  ];
  const rows = $("mrows");
  MARKETS.forEach((r, ri) => {
    const row = document.createElement("div");
    row.className = "mgrid it";
    row.style.transitionDelay = (80 + ri * 70) + "ms";
    const nm = document.createElement("span"); nm.className = "mname"; nm.dataset.i18n = r[0]; nm.textContent = r[1];
    const ct = document.createElement("span"); ct.className = "mcount"; ct.textContent = r[2];
    row.append(nm, ct);
    r[3].forEach((v, ci) => {
      const c = document.createElement("span");
      c.className = "cell h" + v;
      c.style.transitionDelay = (140 + ri * 70 + ci * 22) + "ms";
      row.appendChild(c);
    });
    rows.appendChild(row);
  });
})();

/* ---------- Season chart, drawn to scale ---------- */
const OCC = [88,90,86,78,58,55,62,63,50,56,76,87];
const ADD = [0,0,0,0,6.7,8.3,7.5,7.8,9.4,8.6,0,0];
const svgNS = "http://www.w3.org/2000/svg";
const occ = $("occ");
const X0 = 48, X1 = 704, Y0 = 26, Y1 = 278;
const yOf = v => Y1 - (v / 100) * (Y1 - Y0);
const colW = (X1 - X0) / 12, barW = colW * 0.56;
function el(tag, attrs){ const e = document.createElementNS(svgNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); occ.appendChild(e); return e; }
el("rect", { class:"band", x: X0 + colW*4 + 2, y: Y0 - 8, width: colW*6 - 4, height: Y1 - Y0 + 8, rx: 10 });
const bandLabel = el("text", { class:"band-l", x: X0 + colW*4 + 14, y: Y0 + 10 }); bandLabel.textContent = "Low season"; bandLabel.dataset.i18n = "k3";
[0,25,50,75,100].forEach(v => { el("line", { class:"grid", x1: X0, x2: X1, y1: yOf(v), y2: yOf(v) }); const t = el("text", { class:"ax", x: X0 - 10, y: yOf(v) + 4, "text-anchor":"end" }); t.textContent = v + "%"; });
const addBars = [], monthLabels = [];
OCC.forEach((v, i) => {
  const x = X0 + colW*i + (colW - barW)/2;
  el("rect", { class:"base", x, y: yOf(v), width: barW, height: Y1 - yOf(v), rx: 3 });
  if (ADD[i]) { const r = el("rect", { class:"add", x, y: yOf(v + ADD[i]), width: barW, height: yOf(v) - yOf(v + ADD[i]), rx: 3 }); r.dataset.base = yOf(v); r.dataset.top = yOf(v + ADD[i]); addBars.push(r); }
  monthLabels.push(el("text", { class:"mon", x: x + barW/2, y: Y1 + 22, "text-anchor":"middle" }));
});

/* ---------- Calculator ---------- */
const baht = n => "฿" + new Intl.NumberFormat("en-US").format(Math.round(n));
function calc(){
  const adr = Math.max(0, +$("adr").value || 0), n = Math.max(0, +$("nights").value || 0);
  const c = Math.min(60, Math.max(0, +$("comm").value || 0)) / 100, b = Math.max(0, +$("bk").value || 0), fee = Math.max(0, +$("fee").value || 0);
  const gross = adr * n, lost = gross * c, kept = lost * b, net = kept - fee;
  $("kOta").textContent = baht(gross - lost); $("kDir").textContent = baht(gross);
  const RC = 314.159, G = c > 0 && c < 1 ? 2.4 : 0;
  $("rOtaKeep").setAttribute("stroke-dasharray", Math.max(0, RC * (1 - c) - G) + " " + RC);
  $("rOtaLost").setAttribute("stroke-dasharray", Math.max(0, RC * c - G) + " " + RC);
  $("rOtaLost").setAttribute("stroke-dashoffset", -RC * (1 - c));
  $("pOta").textContent = Math.round((1 - c) * 100) + "%"; $("lOta").textContent = baht(lost);
  $("oKept").textContent = baht(kept); $("oFee").textContent = "– " + baht(fee);
  $("oNet").textContent = (net < 0 ? "– " : "") + baht(Math.abs(net));
  $("oYear").textContent = (net < 0 ? "– " : "") + baht(Math.abs(net * 12));
  $("oRn").textContent = new Intl.NumberFormat("en-US").format(n * b * 12);
  $("netRow").classList.toggle("neg", net < 0); $("warnMsg").hidden = net >= 0;
}
$("calcForm").addEventListener("input", calc);
$("calcForm").addEventListener("submit", e => e.preventDefault());
calc();

/* ---------- Thai text layer: English source text -> Thai, applied to every page ---------- */
let LANG = "en";
const langHooks = [];
/* TH_TEXT is defined in /assets/js/i18n-th.js */
function T(en){ return LANG === "th" && TH_TEXT[en] ? TH_TEXT[en] : en; }
const ORIG_TEXT = new WeakMap();
function translateText(){
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode(n){
    const p = n.parentElement;
    if (!p || p.closest("script,style,[data-i18n],[data-notr]")) return NodeFilter.FILTER_REJECT;
    return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
  }});
  let n;
  while ((n = w.nextNode())) {
    let en = ORIG_TEXT.get(n);
    if (en === undefined) { en = n.nodeValue; ORIG_TEXT.set(n, en); }
    const core = en.trim(), th = TH_TEXT[core.replace(/\s+/g, " ")];
    n.nodeValue = (LANG === "th" && th) ? en.replace(core, th) : en;
  }
  document.querySelectorAll("[aria-label]").forEach(el => {
    if (!el.dataset.ariaEn) el.dataset.ariaEn = el.getAttribute("aria-label");
    const th = TH_TEXT[el.dataset.ariaEn];
    el.setAttribute("aria-label", LANG === "th" && th ? th : el.dataset.ariaEn);
  });
  document.querySelectorAll(".glang-t").forEach(s => s.textContent = LANG === "th" ? "EN" : "ไทย");
}

/* ---------- Languages: add a new language by adding one object ---------- */
const DICT = { en: null, th: {
  nav_journey:"แขกกลับมาอย่างไร", nav_numbers:"ตัวเลขของคุณ", nav_how:"วิธีทำงาน", nav_data:"ข้อมูลและ PDPA",
  login:"เข้าสู่ระบบ", cta:"ตรวจรายชื่อแขกฟรี", menu:"เมนู",
  h1:"แขกเก่าทุกคน จับคู่กับฤดูกาลและข้อเสนอที่ใช่",
  lede:"OccuUp อ่านรายชื่อแขกของคุณ รู้ว่าแต่ละประเทศเดินทางมาไทยช่วงไหน จับคู่กับโรงแรมและทำเลของคุณ แล้วเสนอแพ็กเกจที่ควรส่ง จากโดเมนของโรงแรมเอง",
  see:"ดูแขกเก่ากลับมาจองตรง", tr1:"ออกแบบตาม PDPA", tr2:"ส่งจากโดเมนของคุณเอง", tr3:"จ่ายเฉพาะอีเมลที่ผ่านการตรวจ",
  hero_note:"แผงด้านขวาใช้ข้อมูลตัวอย่างของโรงแรม 60 ห้องที่กะตะ",
  pl_title:"วางแผนแคมเปญ", st1:"แขก", st2:"ฤดูกาล", st3:"โรงแรมของคุณ", st4:"แพ็กเกจ",
  p1_cap:"แขกเก่าที่พร้อมติดต่อ จาก 12,480 แถวหลังตรวจฟรี", p1_l1:"แขกที่กลับมาซ้ำ 1,204", p1_l2:"เคยพัก 1 ครั้ง",
  p2_h:"แต่ละตลาดเดินทางมาไทยช่วงไหน", p2_s:"แขกของคุณแยกตามประเทศ เทียบกับเดือนที่แต่ละตลาดมักเดินทาง (ตัวอย่าง)", p2_g:"แขก",
  p2_few:"น้อย", p2_more:"มาก", p2_low:"โลว์ซีซันของคุณ",
  c_au:"ออสเตรเลีย", c_uk:"สหราชอาณาจักร", c_de:"เยอรมนี", c_in:"อินเดีย", c_cn:"จีน", c_gcc:"กลุ่มประเทศอ่าว",
  p3_h:"จับคู่กับโรงแรมและทำเลของคุณ", tg1:"หาดกะตะ ภูเก็ต", tg2:"60 ห้อง", tg3:"ห้องครอบครัว", tg4:"สระว่ายน้ำ", tg5:"โลว์ซีซัน พ.ค. ถึง ต.ค.",
  sg1:"ครอบครัวออสเตรเลีย", sg1n:"ปิดเทอม ปลาย มิ.ย. ถึง ก.ค.", sg1g:"386 คน",
  sg2:"ครอบครัวอินเดีย", sg2n:"ปิดเทอมฤดูร้อน พ.ค. ถึง มิ.ย.", sg2g:"205 คน",
  sg3:"ครอบครัวจากประเทศอ่าว", sg3n:"วันหยุดฤดูร้อน ก.ค. ถึง ส.ค.", sg3g:"142 คน",
  sg4:"คู่รักชาวเยอรมัน", sg4n:"ข้าม: มกราคมห้องเต็มอยู่แล้ว", sg4g:"512 คน", sg4m:"ภายหลัง",
  p4_h:"แพ็กเกจที่ระบบเสนอ", p4_name:"ครอบครัวพักยาว เดือนกรกฎาคม", p4_tag:"ข้อเสนอตัวอย่าง",
  o_who:"กลุ่มเป้าหมาย", o_who_v:"ครอบครัวออสเตรเลีย 386 ครอบครัวที่เคยพัก", o_off:"ข้อเสนอ", o_off_v:"7 คืนในห้องครอบครัว จองตรง",
  o_send:"ส่งเมื่อ", o_send_v:"กลางเดือนพฤษภาคม 6 สัปดาห์ก่อนปิดเทอม", o_from:"ส่งจาก",
  o_note:"เงื่อนไขข้อเสนอจะตรวจกับสัญญา OTA ของคุณก่อนส่งทุกครั้ง", o_a1:"อนุมัติและตั้งเวลาส่ง", o_a2:"แก้ไขข้อเสนอ",
  sample:"ข้อมูลตัวอย่าง",
  scene_h:"ดูว่าในไฟล์รายชื่อแขกมีอะไรอยู่จริง", scene_p:"เลื่อนลงเพื่อดูไฟล์ตัวอย่างผ่านการตรวจฟรี แต่ละชั้นคือสิ่งที่เราคัดออกก่อนส่งอีเมลฉบับแรก",
  r1:"แขกซ้ำ", r1d:"คนเดียวกันเข้าพักหลายครั้ง รวมเป็นรายชื่อเดียวและติดป้ายแขกประจำ",
  r2:"อีเมลใช้ไม่ได้", r2d:"ไม่มี @ โดเมนที่ปิดแล้ว หรือพิมพ์ผิดจนแก้ไม่ได้ ส่วนที่พิมพ์ผิดชัดเจนเราแก้ให้ก่อน",
  r3:"อีเมลตัวกลางของ OTA", r3d:"อีเมลปิดบังจากเว็บจองห้อง ไม่นำมาใช้ทำการตลาด",
  r4:"เอเจนซีและโฮลเซล", r4d:"อีเมลของบริษัท ไม่ใช่ของแขก",
  r5:"ขอยกเลิกรับข่าวสารแล้ว", r5d:"คนที่ขอหยุดรับข่าวสาร จะไม่อยู่ในรายชื่อ",
  r6:"เข้าพักนานกว่า 8 ปี", r6d:"เก่าเกินกว่าจะติดต่อได้อย่างมั่นใจ",
  r7:"พร้อมติดต่อ", r7d:"อีเมลแขกจริง พร้อมตรวจสอบขั้นสุดท้ายและแคมเปญแรก",
  count_cap:"รายชื่อที่เหลือในไฟล์ตัวอย่าง",
  j_h:"ดูแขกเก่ากลับมาจองตรง", j_p:"เอ็มม่าเคยจองผ่าน OTA สามปีต่อมา โรงแรมส่งอีเมลจากโดเมนของตัวเองถึงเธอ แล้วเธอกลับมาพัก 7 คืนในช่วงโลว์ซีซัน โดยจองตรง",
  b1w:"มีนาคม 2023", b1:"พัก 3 คืน จองผ่าน OTA", b1c:"โรงแรมจ่ายค่าคอม OTA",
  b2w:"พฤษภาคม 2026", b2:"ได้รับข้อเสนอสำหรับแขกเก่าจาก yourhotel.com",
  b3w:"มิถุนายน 2026", b3:"จองตรง 7 คืน ในช่วงโลว์ซีซัน", b3c:"ไม่มีค่าคอม OTA",
  t_h:"แขกเก่าจองตรง", t_p:"เอ็มม่า ออสเตรเลีย 7 คืนในเดือนมิถุนายน", t_s:"ค่าคอม OTA ที่ไม่ต้องจ่าย", t_cap:"สิ่งที่ทีมของคุณเห็นในแดชบอร์ด",
  j_fine:"ภาพประกอบ แขก โรงแรม และข้อเสนอเป็นตัวอย่าง คำนวณค่าคอมที่ ฿3,200 ต่อคืน และ 18% ข้อเสนอของแต่ละโรงแรมจะตรวจกับสัญญา OTA ก่อนเสมอ",
  se_h:"เติมเดือนเงียบด้วยแขกที่รู้จักคุณอยู่แล้ว", se_p:"โรงแรมตัวอย่างขนาด 60 ห้องในภูเก็ต สีเทาคืออัตราเข้าพักเดิม สีกรมท่าคือส่วนที่แขกเก่าเพิ่มเข้ามา เมื่อจองตรงแบบพักยาวช่วงพฤษภาคมถึงตุลาคม",
  k1:"อัตราเข้าพักเดิม", k2:"ส่วนที่แขกเก่าเพิ่ม จองตรง", k3:"โลว์ซีซัน",
  tl1:"คืนห้องพักจากแขกเก่า ช่วงพฤษภาคมถึงตุลาคม", tl2v:"6.1 คืน", tl2:"ระยะพักเฉลี่ยของการจองเหล่านี้ เทียบกับ 3.2 คืนของทั้งโรงแรม", tl3:"ค่าคอม OTA ของการจองเหล่านี้",
  se_fine:"ภาพประกอบจากตัวเลขตัวอย่าง ไม่ใช่คำสัญญา ผลจริงของคุณจะแสดงในแดชบอร์ด โดยเทียบกับกลุ่มควบคุมที่ไม่ได้รับอีเมล",
  c_h:"ลองใส่ตัวเลขของคุณเอง", c_p:"คำนวณตรงๆ จากตัวเลขที่คุณใส่ รวมค่าบริการ Growth ของกรอบที่เลือกด้านบนแล้ว ไม่ใช่การพยากรณ์",
  in_adr:"ราคาห้องเฉลี่ยต่อคืน (บาท)", in_n:"จำนวนคืนต่อการจองของแขกเก่า", in_c:"ค่าคอม OTA (%)", in_ch:"รวมส่วนลด Genius หรือ VIP ที่โรงแรมออกเองด้วย",
  in_b:"จำนวนการจองตรงจากแขกเก่าต่อเดือน", in_f:"ค่าบริการรายเดือนของเรา (บาท)", in_fh:"ราคาจริงขึ้นกับจำนวนอีเมลที่ผ่านการตรวจ",
  cmp_ota:"การเข้าพัก 1 ครั้งที่จองผ่าน OTA", cmp_dir:"การเข้าพักเดียวกันที่จองตรง", cmp_note:"เงินที่โรงแรมได้จากการเข้าพัก 1 ครั้ง สีอำพันคือค่าคอม",
  r_kept:"ค่าคอมที่ประหยัดได้ต่อเดือน", r_fee:"ค่าบริการของเราต่อเดือน", r_net:"ส่วนต่างสุทธิต่อเดือน", r_year:"ส่วนต่างสุทธิต่อปี", r_rn:"คืนห้องพักที่จองตรงต่อปี",
  warn:"ที่ตัวเลขนี้ ค่าบริการของเราสูงกว่าค่าคอมที่ประหยัดได้ แพ็กเกจที่เล็กลงหรือจำนวนการจองที่มากขึ้นจะเปลี่ยนผลนี้",
  caveat:"การคำนวณนี้สมมติว่าแขกกลุ่มนี้จะจองผ่าน OTA ถ้าไม่มีแคมเปญ ในความจริงบางคนกลับมาเองอยู่แล้ว เราจึงกันกลุ่มสุ่มเล็กๆ ไว้ไม่ส่งอีเมลในทุกแคมเปญ แล้วรายงานเฉพาะส่วนต่าง",
  how_h:"4 ขั้นตอน จ่ายเฉพาะอีเมลที่ผ่านการตรวจ", how_p:"ไม่มีอีเมลใดถูกส่งออก จนกว่ารายชื่อจะสะอาดและคุณเซ็นสัญญาแล้ว",
  s1:"อัปโหลด", s1d:"ส่งออกชื่อต้น อีเมล วันเข้าพัก ประเทศ และช่องทางการจองจาก PMS ไม่ต้องมีข้อมูลอื่น",
  s2:"ตรวจฟรี", s2d:"เราคัดแขกซ้ำ อีเมลตัวกลาง OTA และอีเมลที่ใช้ไม่ได้ออก แล้วแสดงตัวเลขให้ดู รายชื่อที่กรองแล้วอยู่กับเราจนกว่าคุณจะเซ็นสัญญา",
  s3:"ตรวจสอบยืนยัน", s3d:"หลังเซ็นสัญญา ทุกอีเมลผ่านบริการตรวจสอบอิสระ คุณจ่ายเฉพาะอีเมลที่ผ่าน",
  s4:"ดึงแขกกลับมา", s4d:"ข้อเสนอพักยาวและช่วงโลว์ซีซันส่งจากโดเมนของโรงแรมเอง การจองเข้าระบบจองของคุณ ไม่ผ่าน OTA",
  data_h:"ออกแบบตาม PDPA ตั้งแต่ไฟล์แรก", data_p:"คุณยอมรับข้อตกลงการประมวลผลข้อมูล (DPA) ก่อนอัปโหลดทุกครั้ง และเราขอเฉพาะข้อมูลที่แคมเปญจำเป็นต้องใช้",
  ask_h:"ข้อมูลที่เราขอ", a1:"ชื่อต้น", a2:"อีเมล", a3:"วันเข้าพักและประเภทห้อง", a4:"ประเทศ", a5:"ช่องทางการจอง",
  never_h:"ข้อมูลที่เราไม่ขอ", n1:"ชื่อ-นามสกุลเต็ม", n2:"เลขพาสปอร์ตหรือบัตรประชาชน", n3:"เบอร์โทรศัพท์", n4:"วันเกิด",
  pilot_h:"โครงการนำร่องสำหรับโรงแรมในภูเก็ต", pilot_p:"เรากำลังรับโรงแรมอิสระขนาด 40–300 ห้อง กลุ่มแรกจำนวนจำกัด",
  company:"ชื่อบริษัท เลขทะเบียน และที่อยู่ในภูเก็ตอยู่ตรงนี้", privacy:"ความเป็นส่วนตัว", cookies:"คุกกี้", terms:"เงื่อนไข",
  proto:"ต้นแบบ ชื่อแบรนด์ ลิงก์ และตัวเลขทั้งหมดเป็นข้อมูลสมมติ",
  hx_h:"เลิกจ่ายค่าคอม OTA ให้แขกที่เป็นของคุณอยู่แล้ว",
  hx_p:"เมื่อแขกเก่ากลับมาจองผ่าน OTA โรงแรมต้องจ่ายค่าคอมซ้ำ OccuUp หาแขกเหล่านี้จากรายชื่อของโรงแรมเอง แล้วพากลับมาจองตรง",
  hx_p2:"เมื่อแขกเก่ากลับมาจองผ่าน OTA โรงแรมต้องจ่ายค่าคอมซ้ำ OccuUp พาแขกเหล่านี้กลับมาจองตรงกับโรงแรม",
  t_paid:"จ่ายให้ OTA เพราะแขกคนนี้", t_ill:"ตัวอย่างประกอบ",
  hx_see:"ดูว่าทำงานอย่างไร",
  of_total:"จาก 12,480", kept:"ได้รับ", r_comm:"ค่าคอม", r_comm0:"ไม่มีค่าคอม",
  cmp_note2:"รายได้ที่โรงแรมได้รับจากการเข้าพักหนึ่งครั้ง สีส้มคือค่าคอม รวมส่วนลดที่โรงแรมออกเอง", ex:"ตัวอย่าง",
  hx_sr:"ตัวอย่าง: แขกจองผ่าน OTA 5 คืน ราคา ฿16,000 หลังหักส่วนลดสมาชิกและค่าคอม 18% โรงแรมได้รับ ฿11,808 เธอกลับมาจองผ่าน OTA อีกครั้ง โรงแรมจึงจ่ายซ้ำ เมื่อใช้ OccuUp เธอจองตรง และโรงแรมได้รับเต็มราคา",
  bc_from:"ออสเตรเลีย, 2 ท่าน", bc_room:"ดีลักซ์ วิวสระ", bc_n:"5 คืน", bc_keep:"โรงแรมได้รับ", bc_direct:"จองตรง",
  lg_rate:"ค่าห้อง 5 คืน", lg_disc:"ส่วนลดสมาชิกที่โรงแรมออกเอง 10%", lg_comm:"ค่าคอม OTA 18%", lg_keep:"โรงแรมได้รับ", lg_paid:"จ่ายให้ OTA เพราะเอ็มม่า",
  ss_h:"โลว์ซีซัน พฤษภาคมถึงตุลาคม", ss_k1:"ห้องที่ขายได้", ss_k2:"ห้องว่าง", ss_rate:"ลดราคาเพื่อแข่งขัน", ss_last:"การจองเข้ามา", ss_last_v:"นาทีสุดท้าย",
  rs0:"จองผ่าน OTA", rs1:"อีเมลถูกปิดบัง", rs2:"จ่ายซ้ำ", rs3:"โลว์ซีซัน", rs4:"จองตรง"
}};
const source = {};
document.querySelectorAll("[data-i18n]").forEach(el => { if (!(el.dataset.i18n in source)) source[el.dataset.i18n] = el.textContent; });
DICT.en = source;

function relabel(lang){
  const loc = lang === "th" ? "th-TH" : "en-US";
  const short = new Intl.DateTimeFormat(loc, { month:"short" });
  const narrow = new Intl.DateTimeFormat(loc, { month: lang === "th" ? "short" : "narrow" });
  monthLabels.forEach((t, i) => t.textContent = short.format(new Date(2026, i, 15)));
  document.querySelectorAll("#mhead .mlab").forEach((s, i) => s.textContent = narrow.format(new Date(2026, i, 15)).replace(".", ""));
  document.querySelectorAll(".ssm").forEach((s, i) => s.textContent = short.format(new Date(2026, 4 + i, 15)));
  if (window.__h2Lang) window.__h2Lang();
  if (typeof calc === "function") calc();
  [["filmToggle", filmPaused], ["plToggle", plPaused]].forEach(([id, p]) => {
    const el = $(id); if (!el) return;
    el.textContent = lang === "th" ? (p ? "เล่น" : "หยุด") : (p ? "Play" : "Pause");
  });
}
let filmPaused = false, plPaused = false;
function setLang(lang){
  const d = DICT[lang] || DICT.en;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const v = d[el.dataset.i18n] ?? DICT.en[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  LANG = lang; translateText();
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  try { localStorage.setItem("lang", lang); } catch(e) {}
  relabel(lang);
  langHooks.forEach(f => f(lang));
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}
document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
let saved = "en"; try { saved = localStorage.getItem("lang") || "en"; } catch(e) {}
setLang(saved === "th" ? "th" : "en");

/* ---------- Planner motion ---------- */
(function planner(){
  const chips = [...document.querySelectorAll("#chips .chip")];
  const stages = [0,1,2,3].map(i => $("pst" + i));
  const segs = [...$("prog").children];
  const toggle = $("plToggle"), panel = $("planner");
  let step = 3, timer = null, inView = false;
  function show(k){
    step = k;
    stages.forEach((s, i) => s.classList.toggle("on", i === k));
    chips.forEach((c, i) => { c.classList.toggle("on", i === k); c.classList.toggle("done", i < k); c.setAttribute("aria-pressed", String(i === k)); });
    segs.forEach((s, i) => { s.className = i < k ? "done" : ""; });
    void segs[k].offsetWidth; segs[k].className = REDUCE ? "done" : "on";
  }
  function tick(){ show((step + 1) % 4); }
  function sync(){
    clearInterval(timer); timer = null;
    panel.classList.toggle("paused", plPaused || !inView);
    if (!REDUCE && !plPaused && inView) timer = setInterval(tick, 4400);
  }
  chips.forEach((c, i) => c.addEventListener("click", () => { plPaused = true; toggle.setAttribute("aria-pressed","true"); show(i); sync(); relabel(document.documentElement.lang); }));
  if (REDUCE) { show(3); return; }
  toggle.hidden = false;
  toggle.addEventListener("click", () => { plPaused = !plPaused; toggle.setAttribute("aria-pressed", String(plPaused)); if (!plPaused) show((step + 1) % 4); sync(); relabel(document.documentElement.lang); });
  show(0);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(panel);
  } else { inView = true; sync(); }
})();

/* ---------- Hero (one continuous timeline) ---------- */
(function hero2(){
  const tile = $("tile");
  if (!tile || !window.gsap) return;
  const card = $("tCard"), gate = $("tGate"), num = $("tNum"), lab = $("tLab"), paid = $("tPaid"), paidV = $("tPaidV");
  const cap = $("tCap"), year = $("tYear"), D = $("tD"), C = $("tC"), F = $("tF"), stamp = $("tStamp");
  const relay = $("tRelay"), real = $("tReal"), bars = $("tBars"), barI = [...bars.querySelectorAll("i")];
  const segs = [...document.querySelectorAll("#tSegs .tseg")], pauseBtn = $("tPause");
  const START = [0, 4.6, 8.4, 13.0, 17.0], END = 22.2;
  const REST = [3.9, 7.6, 12.4, 16.3, 21.0];
  const TXT = {
    en: {
      cap: [
        "Emma books five nights through an OTA. After commission and a discount you fund, you keep ฿11,808 of ฿16,000.",
        "She checks out. Her email reached you masked by the OTA, so you can't invite her back.",
        "Three years later she returns, through the OTA again. You pay again for a guest you already had.",
        "Then low season: empty rooms, lower rates, and a wait for last-minute bookings.",
        "OccuUp uses the email she gave at check-in. She books with you directly, with no commission."
      ],
      lab: ["Room revenue, 5 nights", "You keep after commission and discount", "Average occupancy, May to October", "You keep, booked direct"],
      pause: "Pause", play: "Play"
    },
    th: {
      cap: [
        "เอ็มม่าจองผ่าน OTA 5 คืน หลังหักค่าคอมและส่วนลดที่โรงแรมออกเอง โรงแรมได้รับ ฿11,808 จาก ฿16,000",
        "เธอเช็กเอาต์ไป อีเมลที่โรงแรมได้รับถูก OTA ปิดบังไว้ โรงแรมจึงชวนเธอกลับมาไม่ได้",
        "สามปีต่อมา เธอกลับมาอีกครั้ง ผ่าน OTA เหมือนเดิม โรงแรมจ่ายซ้ำให้แขกที่เคยเป็นของตัวเอง",
        "แล้วก็ถึงโลว์ซีซัน ห้องว่าง ราคาตก และต้องรอการจองนาทีสุดท้าย",
        "OccuUp ใช้อีเมลที่เธอให้ไว้ตอนเช็กอิน เธอจองตรงกับโรงแรม โดยไม่มีค่าคอม"
      ],
      lab: ["ค่าห้อง 5 คืน", "โรงแรมได้รับหลังหักค่าคอมและส่วนลด", "อัตราเข้าพักเฉลี่ย พ.ค. ถึง ต.ค.", "โรงแรมได้รับ เมื่อจองตรง"],
      pause: "หยุด", play: "เล่น"
    }
  };
  const fmt = n => "฿" + new Intl.NumberFormat("en-US").format(Math.round(n));
  const val = { n: 16000, p: 4192 };
  const L = () => (document.documentElement.lang === "th" ? "th" : "en");
  const beatAt = t => START.reduce((k, s, i) => (t >= s ? i : k), 0);
  const labAt = t => (t < 1.7 ? 0 : t < START[3] ? 1 : t < START[4] + 0.6 ? 2 : 3);
  let lastBeat = -1, lastLab = "", userPaused = false, inView = true;

  function render(force){
    const t = tl.time(), k = beatAt(t), lk = labAt(t), lang = L();
    num.textContent = lk === 2 ? "57%" : fmt(val.n);
    paidV.textContent = fmt(val.p);
    if (force || k !== lastBeat) {
      cap.textContent = TXT[lang].cap[k];
      if (!force && !REDUCE) gsap.fromTo(cap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", overwrite: true });
      lastBeat = k;
    }
    if (force || lang + lk !== lastLab) { lab.textContent = TXT[lang].lab[lk]; lastLab = lang + lk; }
    year.textContent = t >= 9.2 && t < END - 0.5 ? "2026" : "2023";
    tile.classList.toggle("mask", t >= 4.9 && t < START[4] + 0.9);
    tile.classList.toggle("dir", t >= START[4] + 1.0 && t < END - 0.5);
    segs.forEach((s, i) => {
      const s0 = START[i], s1 = i < 4 ? START[i + 1] : END;
      s.firstElementChild.style.setProperty("--p", Math.max(0, Math.min(1, (t - s0) / (s1 - s0))));
      s.setAttribute("aria-current", String(i === k));
    });
  }

  function dx(){
    const g = gate.getBoundingClientRect(), c = card.getBoundingClientRect();
    const cur = gsap.getProperty(card, "x") || 0;
    return (g.left + g.width / 2) - (c.left - cur + c.width / 2);
  }

  gsap.set(stamp, { xPercent: -50 });
  const tl = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "power3.inOut" }, onUpdate: () => render(false) });
  // reset (every loop)
  tl.set(card, { x: 0, y: 0, scale: 1 }, 0)
    .set([D, C], { x: 0, y: 0, rotate: 0, opacity: 1 }, 0)
    .set(F, { scaleX: 0 }, 0).set(relay, { opacity: 1 }, 0).set(real, { opacity: 0 }, 0)
    .set(stamp, { opacity: 0, y: 8 }, 0).set(bars, { opacity: 0 }, 0).set(barI, { scaleY: 0 }, 0)
    .set(paid, { opacity: 0, y: 6 }, 0).set(val, { n: 16000, p: 4192 }, 0)
    .fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0)
    .fromTo(gate, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, 0);
  // 1. Through the OTA: commission and discount peel off
  tl.to(card, { x: () => dx(), duration: 1.25 }, 0.7)
    .to(D, { x: -70, y: -28, rotate: -10, opacity: 0, duration: 0.9, ease: "power2.in" }, 1.35)
    .to(C, { x: -115, y: -12, rotate: -6, opacity: 0, duration: 0.9, ease: "power2.in" }, 1.5)
    .to(card, { x: 0, duration: 1.25 }, 2.05)
    .to(val, { n: 11808, duration: 1.4, ease: "power2.out" }, 1.7);
  // 2. Email masked
  tl.to(card, { y: -8, duration: 0.7, ease: "power2.out" }, 4.9)
    .to(card, { y: 0, duration: 0.9, ease: "power2.inOut" }, 6.6);
  // 3. Returns through the OTA, pays again
  tl.to([D, C], { x: 0, y: 0, rotate: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 8.5)
    .to(val, { n: 16000, duration: 0.6, ease: "power2.out" }, 8.5)
    .to(card, { x: () => dx(), duration: 1.25 }, 9.0)
    .to(D, { x: -70, y: -28, rotate: -10, opacity: 0, duration: 0.9, ease: "power2.in" }, 9.65)
    .to(C, { x: -115, y: -12, rotate: -6, opacity: 0, duration: 0.9, ease: "power2.in" }, 9.8)
    .to(card, { x: 0, duration: 1.25 }, 10.35)
    .to(val, { n: 11808, duration: 1.3, ease: "power2.out" }, 10.0)
    .to(paid, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 10.5)
    .to(val, { p: 8384, duration: 1.2, ease: "power2.out" }, 10.7);
  // 4. Low season
  tl.to(paid, { opacity: 0, duration: 0.4, ease: "power1.out" }, 13.0)
    .to(card, { scale: 0.9, opacity: 0, y: -20, duration: 0.8, ease: "power2.inOut" }, 13.0)
    .to(bars, { opacity: 1, duration: 0.5, ease: "none" }, 13.2)
    .to(barI, { scaleY: 1, duration: 1.1, stagger: 0.08, ease: "power3.out" }, 13.3);
  // 5. Booked direct: the OTA gate dissolves
  tl.to(barI, { scaleY: 0, duration: 0.6, stagger: 0.04, ease: "power2.in" }, 17.0)
    .to(bars, { opacity: 0, duration: 0.4 }, 17.5)
    .to(gate, { opacity: 0, x: -30, duration: 0.9, ease: "power2.inOut" }, 17.0)
    .to(card, { scale: 1, opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }, 17.3)
    .to(F, { scaleX: 1, duration: 1.0, ease: "power3.inOut" }, 18.0)
    .to(relay, { opacity: 0, duration: 0.4 }, 18.0)
    .to(real, { opacity: 1, duration: 0.5 }, 18.1)
    .to(stamp, { opacity: 1, y: 0, duration: 0.55, ease: "back.out(2)" }, 18.4)
    .to(val, { n: 16000, duration: 1.2, ease: "power2.out" }, 18.1)
    .to([card, stamp], { opacity: 0, duration: 0.5, ease: "power1.in" }, END - 0.55)
    .to({}, { duration: 0.01 }, END);

  function sync(){
    if (REDUCE || userPaused || !inView) tl.pause(); else tl.play();
  }
  function labelPause(){
    const tx = TXT[L()];
    pauseBtn.setAttribute("aria-label", userPaused ? tx.play : tx.pause);
    pauseBtn.setAttribute("aria-pressed", String(userPaused));
  }
  window.__h2Lang = () => { render(true); labelPause(); };

  segs.forEach((s, i) => s.addEventListener("click", () => {
    tl.time(REDUCE || userPaused ? REST[i] : START[i] + 0.01);
    render(true);
    sync();
  }));

  if (REDUCE) { tl.time(REST[0]); render(true); return; }
  pauseBtn.hidden = false;
  labelPause();
  pauseBtn.addEventListener("click", () => { userPaused = !userPaused; labelPause(); sync(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(tile);
  }
  let rT;
  window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { const t = tl.time(); tl.invalidate(); tl.time(t); }, 200); });
  render(true);
  tl.play(0);
})();

/* ---------- Hero slides: five problems, one motion graphic each ---------- */
(function heroSlides(){
  const root = $("hs");
  if (!root) return;
  const slides = [...root.querySelectorAll(".hs-slide")];
  const dots = [...root.querySelectorAll(".hs-dot")];
  const pauseBtn = $("hsPause"), track = $("hsTrack");
  const DUR = 8.5;
  const G = window.gsap;

  function art1(el){
    const lanes = el.querySelectorAll(".a1-lane");
    const oDot = lanes[0].querySelector(".a1-dot"), oChip = lanes[0].querySelector(".a1-chip");
    const dDot = lanes[1].querySelector(".a1-dot"), dChip = lanes[1].querySelector(".a1-chip");
    const tl = G.timeline({ paused: true, repeat: -1, repeatDelay: 0.4 });
    tl.set([oDot, dDot], { left: "0%", opacity: 1 }).set([oChip, dChip], { opacity: 0, y: 8 })
      .to(oDot, { left: "100%", duration: 2.4, ease: "none" }, 0.2)
      .to(oChip, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, 1.3)
      .to(oChip, { opacity: 0, y: -10, duration: 0.5 }, 3.0)
      .to(dDot, { left: "100%", duration: 1.8, ease: "power1.inOut" }, 2.7)
      .to(dChip, { opacity: 1, y: 0, duration: 0.45, ease: "back.out(2)" }, 4.3)
      .to({}, { duration: 2.6 }, 4.8)
      .to([oDot, dDot, dChip], { opacity: 0, duration: 0.3 }, 7.3);
    return tl;
  }
  function art2(el){
    const adds = el.querySelectorAll(".a2-b.low b"), tag = el.querySelector(".a2-tag");
    const tl = G.timeline({ paused: true });
    tl.set(adds, { scaleY: 0 }).set(tag, { opacity: 0, y: 6 })
      .to(adds, { scaleY: 1, duration: 0.8, stagger: 0.18, ease: "power3.out" }, 0.6)
      .to(tag, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.9);
    return tl;
  }
  function art3(el){
    const adds = [...el.querySelectorAll(".a3-nights i.add")], n = el.querySelector(".a3-n");
    const tl = G.timeline({ paused: true });
    tl.call(() => { adds.forEach(a => a.classList.remove("on")); n.textContent = "3"; }, null, 0);
    adds.forEach((a, i) => {
      tl.call(() => { a.classList.add("on"); n.textContent = String(4 + i); }, null, 1.0 + i * 0.55)
        .fromTo(a, { scale: 0.7 }, { scale: 1, duration: 0.45, ease: "back.out(2.4)" }, 1.0 + i * 0.55);
    });
    return tl;
  }
  function art4(el){
    const ms = el.querySelectorAll(".a4-card.m"), rs = el.querySelectorAll(".a4-card.r"), tag = el.querySelector(".a4-tag");
    const tl = G.timeline({ paused: true });
    tl.set(ms, { rotationX: 0 }).set(rs, { rotationX: 180 }).set(tag, { opacity: 0 })
      .to(ms, { rotationX: -180, duration: 0.8, stagger: 0.45, ease: "power2.inOut" }, 1.0)
      .to(rs, { rotationX: 0, duration: 0.8, stagger: 0.45, ease: "power2.inOut" }, 1.0)
      .to(tag, { opacity: 1, duration: 0.5 }, 2.6);
    return tl;
  }
  function art5(el){
    const rect = el.querySelector("#a5rect"), labels = el.querySelectorAll(".a5-leg > span");
    const tl = G.timeline({ paused: true });
    tl.set(rect, { attr: { width: 0 } }).set(labels, { opacity: 0, y: 4 })
      .to(labels, { opacity: 1, y: 0, duration: 0.4, stagger: 0.15 }, 0.2)
      .to(rect, { attr: { width: 560 }, duration: 2.4, ease: "power1.inOut" }, 0.6);
    return tl;
  }
  const REST = [5.2, null, null, null, null];
  const settle = i => { const tl = tls[i]; if (!tl) return; if (REST[i] != null) tl.time(REST[i]).pause(); else tl.progress(1).pause(); };
  const tls = G ? slides.map((s, i) => [art1, art2, art3, art4, art5][i](s.querySelector(".hs-art"))) : [];

  let k = 0, userPaused = false, inView = true, elapsed = 0, last = 0;
  function show(i, restart){
    k = (i + slides.length) % slides.length;
    slides.forEach((s, j) => { s.classList.toggle("is-on", j === k); s.setAttribute("aria-hidden", String(j !== k)); });
    dots.forEach((d, j) => { d.setAttribute("aria-current", String(j === k)); d.firstElementChild.style.setProperty("--p", j < k ? 1 : 0); });
    tls.forEach((tl, j) => { if (j !== k) tl.pause(); });
    if (tls[k]) { if (REDUCE) settle(k); else if (restart !== false) tls[k].restart(); }
    elapsed = 0;
  }
  function running(){ return !REDUCE && !userPaused && inView && !document.hidden; }
  function frame(ts){
    const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0; last = ts;
    if (running()) {
      elapsed += dt;
      dots[k].firstElementChild.style.setProperty("--p", Math.min(1, elapsed / DUR));
      if (elapsed >= DUR) show(k + 1);
    }
    requestAnimationFrame(frame);
  }
  function syncArt(){ if (!tls[k] || REDUCE) return; running() ? tls[k].resume() : tls[k].pause(); }
  dots.forEach((d, i) => d.addEventListener("click", () => show(i)));
  pauseBtn.addEventListener("click", () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute("aria-pressed", String(userPaused));
    pauseBtn.setAttribute("aria-label", T(userPaused ? "Play slides" : "Pause slides"));
    syncArt();
  });
  let x0 = null;
  track.addEventListener("pointerdown", e => { x0 = e.clientX; });
  track.addEventListener("pointerup", e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) show(k + (dx < 0 ? 1 : -1)); });
  if ("IntersectionObserver" in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; syncArt(); }, { threshold: 0.2 }).observe(root);
  document.addEventListener("visibilitychange", syncArt);
  if (REDUCE) { pauseBtn.hidden = true; tls.forEach((tl, i) => settle(i)); }
  window.__hsShow = i => { userPaused = true; pauseBtn.setAttribute("aria-pressed", "true"); show(i); settle(i); };
  show(0);
  requestAnimationFrame(frame);
})();

/* ---------- Scroll scenes (GSAP) ---------- */
const scene = $("scene"), stage = $("stage"), stack = $("stack");
const items = [...document.querySelectorAll("#legend li")];
const countEl = $("count");
const dsegs = [...document.querySelectorAll(".dseg.dr")];
const TOTAL = 12480;
const removedCounts = items.slice(0,6).map(li => +li.dataset.n);
const fmt = new Intl.NumberFormat("en-US");

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    scene.classList.remove("rest");
    const slabs = [...stack.querySelectorAll(".slab")];
    const outs = slabs.slice(1).reverse();
    gsap.set(slabs, { z: i => i * 7, x: 0, y: 0, opacity: 1, scale: 1 });
    gsap.set(stack, { rotationX: 58, rotationZ: -38 });
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: scene, start: "top top", end: () => "+=" + Math.round(window.innerHeight * 2.6), scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
      onUpdate: () => render(tl.time())
    });
    tl.to(slabs, { z: i => i * 46, duration: 1 }, 0).to(stack, { rotationX: 54, rotationZ: -32, duration: 1 }, 0);
    outs.forEach((s, k) => tl.to(s, { x: 260, y: -150, z: "+=40", opacity: 0, duration: 1 }, 1 + k));
    tl.to(slabs[0], { z: 0, scale: 1.12, duration: 1 }, 7).to(stack, { rotationX: 44, rotationZ: -26, duration: 1 }, 7);
    function render(t){
      const peeled = Math.max(0, Math.min(6, t - 1));
      const whole = Math.floor(peeled), part = peeled - whole;
      let removed = 0;
      for (let k = 0; k < whole; k++) removed += removedCounts[k];
      if (whole < 6) removed += removedCounts[whole] * part;
      countEl.textContent = fmt.format(Math.round(TOTAL - removed));
      items.forEach((li, k) => {
        li.classList.toggle("done", k < 6 && k < whole);
        li.classList.toggle("active", (k < 6 && t > 1 && k === whole && whole < 6) || (k === 6 && t >= 7));
      });
      stage.classList.toggle("lit", t >= 7.2);
      dsegs.forEach(c => { const k = +c.dataset.k; c.classList.toggle("gone", k < whole); c.classList.toggle("now", k === whole && t > 1 && whole < 6); });
    }
    render(0);
    return () => { scene.classList.add("rest"); stage.classList.remove("lit"); items.forEach(li => li.classList.remove("done","active")); dsegs.forEach(c => c.classList.remove("gone","now")); countEl.textContent = "6,912"; };
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    addBars.forEach(r => {
      gsap.fromTo(r, { attr: { y: +r.dataset.base, height: 0 } }, {
        attr: { y: +r.dataset.top, height: +r.dataset.base - +r.dataset.top }, ease: "none",
        scrollTrigger: { trigger: occ, start: "top 80%", end: "center 45%", scrub: 0.5 }
      });
    });
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const s = [1,2,3,4].map(n => $("s" + n));
    const beats = [...document.querySelectorAll("#beats .beat")];
    const tap = $("tap"), screen = $("screen"), toast = $("toast"), newMail = $("newMail"), btn = $("filmToggle");
    const setBeat = k => beats.forEach((b, i) => b.classList.toggle("on", i <= k));
    const placeTap = target => { const a = screen.getBoundingClientRect(), b = target.getBoundingClientRect(); gsap.set(tap, { left: b.left - a.left + b.width / 2, top: b.top - a.top + b.height / 2 }); };
    const tapAt = (tl, target, at) => { tl.call(() => placeTap(target), null, at).fromTo(tap, { scale: .4, autoAlpha: .6 }, { scale: 1.7, autoAlpha: 0, duration: .55, ease: "power1.out" }, at + .01); };
    gsap.set(s, { autoAlpha: 0 }); gsap.set(toast, { autoAlpha: 0 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: .4, paused: true, defaults: { ease: "power2.out" } });
    tl.set(s[0], { autoAlpha: 1 }, 0).set(newMail, { y: -50, autoAlpha: 0 }, 0).call(() => setBeat(0), null, 0)
      .to(newMail, { y: 0, autoAlpha: 1, duration: .6, ease: "back.out(1.7)" }, .8).call(() => setBeat(1), null, .8);
    tapAt(tl, newMail, 2.2);
    tl.to(s[0], { autoAlpha: 0, duration: .3 }, 2.7).fromTo(s[1], { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: .45 }, 2.7);
    tapAt(tl, $("mailBtn"), 5.0);
    tl.to(s[1], { autoAlpha: 0, duration: .3 }, 5.5).fromTo(s[2], { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: .45 }, 5.5);
    tapAt(tl, $("bookBtn"), 7.4);
    tl.to(s[2], { autoAlpha: 0, duration: .3 }, 7.9)
      .fromTo(s[3], { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: .5, ease: "back.out(1.6)" }, 7.9)
      .call(() => setBeat(2), null, 8.0)
      .fromTo(toast, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .5 }, 8.5)
      .to([s[3], toast], { autoAlpha: 0, duration: .4 }, 12.2);
    let inView = false;
    const sync = () => (inView && !filmPaused) ? tl.play() : tl.pause();
    btn.hidden = false;
    const onClick = () => { filmPaused = !filmPaused; btn.setAttribute("aria-pressed", String(filmPaused)); relabel(document.documentElement.lang || "en"); sync(); };
    btn.addEventListener("click", onClick);
    ScrollTrigger.create({ trigger: "#film", start: "top 75%", end: "bottom 20%", onToggle: self => { inView = self.isActive; sync(); } });
    return () => { tl.kill(); btn.hidden = true; btn.removeEventListener("click", onClick); gsap.set([...s, toast], { clearProps: "all" }); beats.forEach(b => b.classList.add("on")); };
  });
}
/* ---------- Pricing (latest structure: 5 tiers × 4 packages, THB/month excl. VAT) ---------- */
const TIERS = [
  { label: "Under 5,000", setup: 9900, p: [5900, 8900, 13900, 19900] },
  { label: "5,000–9,999", setup: 14900, p: [8900, 13900, 21900, 32900] },
  { label: "10,000–24,999", setup: 19900, p: [12900, 19900, 31900, 46900] },
  { label: "25,000–49,999", setup: 29900, p: [17900, 27900, 43900, 64900] },
  { label: "50,000 or more", setup: 39900, p: [22900, 35900, 56900, 84900] }
];
const PLANS = [
  { name: "Essential", tag: "Collect and keep guest emails the right way.", f: [
    "Old list cleaned and checked for PDPA",
    "Check-in email capture, front-desk training and a monthly capture report",
    "Automated pre-arrival and post-stay emails",
    "1 win-back campaign a month"] },
  { name: "Growth", tag: "Bring past guests back to book direct.", rec: true, f: [
    "Everything in Essential",
    "2 win-back campaigns a month, by market and season",
    "Low-season long-stay packages, checked against your OTA contracts",
    "Results measured against a holdout group",
    "Quarterly review with the owner"] },
  { name: "Pro", tag: "A full year-round plan for the low season.", f: [
    "Everything in Growth",
    "Up to 4 campaigns a month",
    "Year-round low-season plan",
    "LINE and WhatsApp opt-in list building, plus a referral pilot",
    "Monthly review with the owner"] },
  { name: "Premium", tag: "[Premium positioning to confirm]", f: [
    "Everything in Pro", "[Premium benefits to confirm]"] }
];
const fmtB = n => "฿" + n.toLocaleString("en-US");
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
function renderPlans(box, tierIndex, from){
  if (!box) return;
  const t = TIERS[tierIndex];
  box.innerHTML = PLANS.map((p, i) =>
    '<div class="plan' + (p.rec ? " rec" : "") + '"><div class="top"><h3>' + p.name + "</h3>" + (p.rec ? '<span class="badge">' + T("Recommended") + "</span>" : "") + "</div>" +
    '<p class="tag">' + T(p.tag) + '</p><p class="price">' + (from ? '<span class="from">' + T("From") + "</span>" : "") + "<b>" + fmtB(t.p[i]) + "</b><span>" + T("/month") + "</span></p>" +
    '<p class="vat">' + T("Excl. VAT") + " · " + T("setup") + " " + fmtB(t.setup) + " " + T("one-time") + "</p>" +
    '<a class="btn ' + (p.rec ? "btn-primary" : "btn-line") + '" href="#/signup">' + T("Start with a free check") + "</a>" +
    "<ul>" + p.f.map(x => '<li class="' + (x.startsWith("[") ? "tbd" : "") + '">' + CHECK + "<span>" + T(x) + "</span></li>").join("") + "</ul></div>"
  ).join("");
}
(function pricing(){
  const tiersEl = $("tiers"), plansEl = $("plans"), tbody = $("ptbody"), ov = $("ovPlans");
  let cur = 1;
  function build(){
    renderPlans(ov, 0, true);
    if (!tiersEl) return;
    tiersEl.innerHTML = ""; tbody.innerHTML = "";
    TIERS.forEach((t, i) => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = T(t.label);
      b.addEventListener("click", () => setTier(i, true)); tiersEl.appendChild(b);
      const tr = document.createElement("tr");
      tr.innerHTML = '<th scope="row">' + T(t.label) + "</th>" + t.p.map(v => "<td>" + fmtB(v) + "</td>").join("") + "<td>" + fmtB(t.setup) + "</td>";
      tbody.appendChild(tr);
    });
    setTier(cur, false);
  }
  function setTier(k, animate){
    cur = k;
    [...tiersEl.children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === k)));
    [...tbody.children].forEach((r, i) => r.classList.toggle("on", i === k));
    renderPlans(plansEl, k, false);
    if (animate && !REDUCE && window.gsap) gsap.from(plansEl.querySelectorAll(".price b"), { opacity: .2, y: 8, duration: .4, stagger: .05, ease: "power2.out" });
    const fee = $("fee");
    if (fee) { fee.value = TIERS[k].p[1]; if (typeof calc === "function") calc(); }
  }
  build();
  langHooks.push(build);
})();

/* ---------- Log in / new hotel ---------- */
(function login(){
  const bIn = $("lgIn"), bUp = $("lgUp");
  if (!bIn) return;
  let up = false;
  const localHandoffReady = () => {
    const S = window.SITE || {};
    const loopback = location.hostname === "127.0.0.1" || location.hostname === "localhost";
    return loopback && S.localAppReady === true && !!S.appUrl;
  };
  const publicLoginReady = () => {
    const S = window.SITE || {};
    return S.loginReady === true && !!S.appUrl;
  };
  function paint(){
    bIn.setAttribute("aria-pressed", String(!up)); bUp.setAttribute("aria-pressed", String(up));
    $("lgTitle").textContent = T(up ? "Check your guest list free" : "Log in to OccuUp");
    const localHandoff = localHandoffReady();
    const loginHandoff = !up && (localHandoff || publicLoginReady());
    const liveNow = !!(window.SITE && SITE.appReady) || localHandoff;
    $("lgSub").textContent = T(up ? (liveNow ? "Create an account and see what's in your list before you pay anything." : "Leave your details and we will run the free check with you.") : "Manage campaigns, lists and results for your hotel.");
    const identifier = $("lgForm").elements.email;
    $("lgEmailL").textContent = T(up ? "Company email" : localHandoff ? "Username" : "Email");
    identifier.type = !up && localHandoff ? "text" : "email";
    identifier.autocomplete = !up && localHandoff ? "username" : "email";
    identifier.placeholder = !up && localHandoff ? "admin" : "name@yourhotel.com";
    $("lgPassW").hidden = up || loginHandoff; $("lgHotelW").hidden = !up; $("lgSteps").hidden = !up; $("lgForgot").hidden = up || loginHandoff;
    const live = !!(window.SITE && SITE.appReady);
    $("lgSubmit").textContent = T(up ? (live ? "Send my code" : "Request a free check") : loginHandoff ? "Continue to secure login" : "Log in");
    $("lgSteps").hidden = !up || !live; $("lgConsent").hidden = !up;
    $("lgMsg").textContent = "";
  }
  window.__setLogin = v => { up = v; paint(); };
  langHooks.push(paint);
  bIn.addEventListener("click", () => go("#/login"));
  bUp.addEventListener("click", () => go("#/signup"));
  /* Submit. Config lives in /assets/js/config.js (window.SITE).
     - appReady true  -> hand over to the app (log in / sign up happen there).
     - appReady false -> "New hotel" saves a lead to Supabase table public.web_leads
       (insert-only for the public key, see supabase/migrations/*_web_leads.sql). */
  $("lgForm").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target, msg = $("lgMsg"), btn = $("lgSubmit"), S = window.SITE || {};
    const email = f.email.value.trim(), hotel = f.hotel.value.trim();
    if (!up && localHandoffReady()) {
      const username = email || "admin";
      location.href = S.appUrl.replace(/\/$/, "") + "/login?username=" + encodeURIComponent(username);
      return;
    }
    if (!up && publicLoginReady()) {
      location.href = S.appUrl.replace(/\/$/, "") + "/login" + (email ? "?email=" + encodeURIComponent(email) : "");
      return;
    }
    if (S.appReady && S.appUrl) {
      location.href = S.appUrl + (up ? "/signup" : "/login") + (email ? "?email=" + encodeURIComponent(email) : "");
      return;
    }
    if (!up) { msg.textContent = T("Log in opens when the OccuUp app goes live. Leave your details under New hotel and we will contact you."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = T("Please enter a valid email."); return; }
    if (f.website && f.website.value) return; /* honeypot filled: silently ignore */
    if (!S.supabaseUrl || !S.supabasePublishableKey) { msg.textContent = T("Prototype: this form will connect to the OccuUp app."); return; }
    btn.disabled = true; msg.textContent = T("Sending…");
    try {
      const r = await fetch(S.supabaseUrl.replace(/\/$/, "") + "/rest/v1/web_leads", {
        method: "POST",
        headers: Object.assign({ apikey: S.supabasePublishableKey, "Content-Type": "application/json", Prefer: "return=minimal" },
          /^eyJ/.test(S.supabasePublishableKey) ? { Authorization: "Bearer " + S.supabasePublishableKey } : {}), /* legacy anon JWT also needs Bearer */
        body: JSON.stringify({ email: email, hotel_name: hotel || null, lang: LANG, source: "site-signup", page: (location.hash || "#/").slice(0, 100) })
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      msg.textContent = T("Thank you. We will contact you by email.");
      f.reset();
    } catch (err) {
      msg.textContent = T("Something went wrong. Please email us instead.");
    } finally { btn.disabled = false; }
  });
})();

/* ---------- Pages: one site, five routes ---------- */
const TITLES = { overview: "OccuUp: bring past guests back direct", how: "How it works · OccuUp", pricing: "Pricing · OccuUp", data: "Data & PDPA · OccuUp", login: "Log in · OccuUp" };
let currentPage = null, currentKey = "overview";
function keyFrom(h){ const m = (h || "").match(/^#\/(\w*)/); if (!m) return null; const k = m[1] || "overview"; return (TITLES[k] || k === "signup") ? k : "overview"; }
function route(key){
  const pages = [...document.querySelectorAll("[data-page]")];
  const sheet = $("sheet"), menuBtn = $("menuBtn");
  sheet.hidden = true; menuBtn.setAttribute("aria-expanded", "false");
  currentKey = key;
  const page = key === "signup" ? "login" : key;
  if (window.__setLogin && page === "login") window.__setLogin(key === "signup");
  document.querySelectorAll("[data-route]").forEach(a => a.setAttribute("aria-current", a.dataset.route === page ? "page" : "false"));
  document.title = T(TITLES[page]);
  if (page === currentPage) return;
  pages.forEach(p => p.hidden = p.dataset.page !== page);
  currentPage = page;
  window.scrollTo({ top: 0, behavior: "instant" });
  if (window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
}
function go(href){
  const k = keyFrom(href) || "overview";
  try { if (location.hash !== href) history.pushState(null, "", href); } catch (e) {}
  route(k);
}
(function router(){
  const menuBtn = $("menuBtn"), sheet = $("sheet");
  menuBtn.addEventListener("click", () => { const open = sheet.hidden; sheet.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) { sheet.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); } });
  /* Handle page links ourselves so navigation works even where hash changes are restricted */
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const S = window.SITE || {};
    const localLogin = a.dataset.route === "login" && S.localAppReady === true &&
      (location.hostname === "127.0.0.1" || location.hostname === "localhost") && S.appUrl;
    if (localLogin) {
      e.preventDefault();
      location.href = S.appUrl.replace(/\/$/, "") + "/login?username=admin";
      return;
    }
    e.preventDefault(); go(a.getAttribute("href"));
  });
  window.addEventListener("hashchange", () => { const k = keyFrom(location.hash); if (k) route(k); });
  window.addEventListener("popstate", () => route(keyFrom(location.hash) || "overview"));
  langHooks.push(() => { document.title = T(TITLES[currentPage || "overview"]); });
  route(keyFrom(location.hash) || "overview");
})();

/* ---------- Language switch ---------- */
document.querySelectorAll(".glang").forEach(b => b.addEventListener("click", () => setLang(LANG === "th" ? "en" : "th")));
