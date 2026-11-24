(function(){
"use strict";
/* ---------- UI strings: [gu, en, hi] ---------- */
const T = {
  brand:["લેઉવા પટેલ લગ્ન માર્ગદર્શિકા","Leuva Patel Wedding Guide","लेउवा पटेल विवाह मार्गदर्शिका"],
  brandSub:["સૌરાષ્ટ્રના રીત-રિવાજ","Saurashtra customs","सौराष्ट्र के रीति-रिवाज"],
  hello:["શુભ પ્રસંગની તૈયારી સરળ બનાવો","Plan every ritual, step by step","हर रस्म की तैयारी, आसान तरीके से"],
  helloP:["ચાંદલાથી કંકુ પગલાં સુધી — દરેક વિધિ શું છે, કયો સામાન જોઈએ અને કયું કામ બાકી છે, બધું એક જગ્યાએ.","From Chandlo to Kanku Pagla — what each ritual means, what to buy and what is left to do, all in one place.","चांदला से कंकु पगलां तक — हर रस्म का मतलब, कौन सा सामान चाहिए और क्या काम बाकी है, सब एक जगह।"],
  how1:["વિધિ પર દબાવો","Tap a ritual","रस्म पर दबाएँ"],
  how2:["સામાન / કામ પર ✓ કરો","Tick items & tasks","सामान / काम पर ✓ करें"],
  how3:["WhatsApp પર મોકલો","Send on WhatsApp","WhatsApp पर भेजें"],
  whose:["કોના લગ્ન છે?","Whose wedding is it?","किसकी शादी है?"],
  whoseHint:["પસંદ કરવાથી ફક્ત તમારા પક્ષની યાદી દેખાશે.","Choosing this shows only your side's lists.","चुनने से सिर्फ आपके पक्ष की सूची दिखेगी।"],
  sideB:["દીકરીના લગ્ન","Daughter's wedding","बेटी की शादी"],
  sideG:["દીકરાના લગ્ન","Son's wedding","बेटे की शादी"],
  sideAll:["બધું બતાવો","Show all","सब दिखाएँ"],
  date:["લગ્નની તારીખ","Wedding date","शादी की तारीख"],
  dateHint:["તારીખ નાખો એટલે બાકી દિવસ દેખાશે.","Add the date to see the countdown.","तारीख डालें तो बाकी दिन दिखेंगे।"],
  daysLeft:["લગ્નને {n} દિવસ બાકી","{n} days to the wedding","शादी में {n} दिन बाकी"],
  today:["આજે લગ્ન છે — શુભ લગ્ન!","The wedding is today — best wishes!","आज शादी है — शुभ विवाह!"],
  past:["લગ્ન થઈ ગયા — અભિનંદન!","The wedding is done — congratulations!","शादी हो गई — बधाई हो!"],
  progress:["કુલ તૈયારી","Overall progress","कुल तैयारी"],
  rituals:["વિધિઓ — ક્રમ પ્રમાણે","Rituals — in order","रस्में — क्रम से"],
  ritualsCount:["{n} વિધિ","{n} rituals","{n} रस्में"],
  hostB:["કન્યા પક્ષના ઘરે","At bride's home","कन्या पक्ष के घर"],
  hostG:["વર પક્ષના ઘરે","At groom's home","वर पक्ष के घर"],
  hostBoth:["બંને ઘરે","At both homes","दोनों घर"],
  tagB:["કન્યા પક્ષ","Bride side","कन्या पक्ष"],
  tagG:["વર પક્ષ","Groom side","वर पक्ष"],
  doneChip:["તૈયાર","Ready","तैयार"],
  back:["પાછા","Back","वापस"],
  tabSteps:["વિધિ","Ritual","विधि"],
  tabItems:["સામાન","Items","सामान"],
  tabTodos:["કામ","To-do","काम"],
  whatIs:["આ વિધિ શું છે?","What is this ritual?","यह रस्म क्या है?"],
  howDone:["કેવી રીતે થાય છે?","How it is done","कैसे होती है?"],
  tip:["વડીલોની સલાહ","Elders' tip","बड़ों की सलाह"],
  vary:["દરેક ગામ અને કુટુંબના રિવાજ થોડા અલગ હોય છે. ગોર મહારાજ અને ઘરના વડીલોને પૂછીને નક્કી કરો.","Customs differ a little by village and family. Confirm with your family priest (gor maharaj) and elders.","हर गाँव और परिवार के रिवाज थोड़े अलग होते हैं। गोर महाराज और घर के बड़ों से पूछकर तय करें।"],
  itemsTitle:["સામાનની યાદી","Items to arrange","सामान की सूची"],
  todosTitle:["કરવાના કામ","Things to do","करने के काम"],
  addItem:["તમારો સામાન ઉમેરો…","Add your own item…","अपना सामान जोड़ें…"],
  addTodo:["તમારું કામ ઉમેરો…","Add your own task…","अपना काम जोड़ें…"],
  add:["Add","Add","Add"], // kept in English in every language, as asked
  added:["ઉમેરાયું","Added","जुड़ गया"],
  remove:["કાઢી નાખો","Remove","हटाएँ"],
  wa:["WhatsApp પર મોકલો","Send on WhatsApp","WhatsApp पर भेजें"],
  copy:["યાદી કૉપી કરો","Copy list","सूची कॉपी करें"],
  copied:["યાદી કૉપી થઈ ગઈ","List copied","सूची कॉपी हो गई"],
  copyFail:["કૉપી ન થયું — નીચેનું લખાણ દબાવી રાખી કૉપી કરો","Couldn't copy — press and hold the text below to copy","कॉपी नहीं हुआ — नीचे का टेक्स्ट दबाकर कॉपी करें"],
  reset:["આ યાદીના બધા ✓ કાઢી નાખો","Clear all ticks in this list","इस सूची के सभी ✓ हटाएँ"],
  resetQ:["ખરેખર બધા ✓ કાઢી નાખવા છે?","Clear all ticks in this list?","क्या सच में सभी ✓ हटाने हैं?"],
  yes:["હા, કાઢી નાખો","Yes, clear","हाँ, हटाएँ"],
  no:["ના","No","नहीं"],
  navHome:["વિધિઓ","Rituals","रस्में"],
  navPending:["બાકી કામ","Pending","बाकी काम"],
  navSetup:["સેટિંગ","Settings","सेटिंग"],
  pendingTitle:["હજુ બાકી છે","Still to do","अभी बाकी है"],
  pendingHint:["બધી વિધિનો બાકી સામાન અને કામ એક જગ્યાએ. ✓ કરતા જાવ.","Everything left across all rituals. Tick as you go.","सभी रस्मों का बाकी सामान और काम एक जगह। ✓ करते जाएँ।"],
  fAll:["બધું","All","सब"],
  allDone:["વાહ! બધું તૈયાર છે.","Wonderful — everything is ready.","वाह! सब तैयार है।"],
  open:["ખોલો","Open","खोलें"],
  setupTitle:["સેટિંગ","Settings","सेटिंग"],
  lang:["ભાષા","Language","भाषा"],
  size:["અક્ષરનું માપ","Text size","अक्षर का आकार"],
  sizeS:["નાના","Small","छोटा"],sizeM:["મધ્યમ","Medium","मध्यम"],sizeL:["મોટા","Large","बड़ा"],
  saved:["તમારા ✓ આ ફોનમાં સચવાય છે.","Your ticks are saved on this phone.","आपके ✓ इस फ़ोन में सेव रहते हैं।"],
  savedCloud:["તમારા ✓ તમારા Claude ખાતામાં સચવાય છે — બીજા ફોનમાં પણ દેખાશે.","Your ticks are saved to your Claude account — they show on your other devices too.","आपके ✓ आपके Claude खाते में सेव हैं — दूसरे डिवाइस पर भी दिखेंगे।"],
  resetAll:["બધું ફરીથી શરૂ કરો","Start everything again","सब फिर से शुरू करें"],
  resetAllQ:["બધા ✓ અને તમે ઉમેરેલી વસ્તુઓ કાઢી નાખવી છે?","Remove all ticks and everything you added?","सभी ✓ और आपकी जोड़ी चीज़ें हटानी हैं?"],
  aboutTitle:["આ માર્ગદર્શિકા વિશે","About this guide","इस मार्गदर्शिका के बारे में"],
  aboutP:["સૌરાષ્ટ્રના લેઉવા પટેલ પરિવારો માટે બનાવેલી સરળ માર્ગદર્શિકા. સમાજ સાદાઈથી લગ્ન અને દહેજ વગરના લગ્નને પ્રોત્સાહન આપે છે. યાદીઓ ફક્ત સૂચન છે — તમારા કુટુંબ પ્રમાણે ઉમેરો કે ઘટાડો.","A simple guide made for Saurashtra Leuva Patel families. The samaj encourages simple, dowry-free weddings. The lists are suggestions — add or skip things to suit your family.","सौराष्ट्र के लेउवा पटेल परिवारों के लिए सरल मार्गदर्शिका। समाज सादगी से और बिना दहेज की शादी को बढ़ावा देता है। सूचियाँ सिर्फ सुझाव हैं — अपने परिवार के हिसाब से जोड़ें या घटाएँ।"],
  shareItems:["સામાનની યાદી","Item list","सामान की सूची"],
  shareTodos:["કામની યાદી","To-do list","काम की सूची"],
  sharePending:["લગ્નની બાકી તૈયારી","Wedding – still to do","शादी – बाकी तैयारी"],
  shareFoot:["— લેઉવા પટેલ લગ્ન માર્ગદર્શિકા","— Leuva Patel Wedding Guide","— लेउवा पटेल विवाह मार्गदर्शिका"],
  of:["{a} / {b}","{a} / {b}","{a} / {b}"],
  removed:["કાઢી નાખ્યું","Removed","हटा दिया"],
  cleared:["✓ કાઢી નાખ્યા","Ticks cleared","✓ हटा दिए"],
  yours:["તમે ઉમેરેલું","Added by you","आपने जोड़ा"]
};
const LANGS=["gu","en","hi"];

/* ---------- Icons ---------- */
const P = {
  ring:'<circle cx="12" cy="15" r="6"/><path d="M12 3l3 3-3 3-3-3z"/>',
  coconut:'<path d="M12 7c4.4 0 7 3.3 7 7s-3 6-7 6-7-2.3-7-6 2.6-7 7-7z"/><path d="M12 7c-.6-2-2.4-3.4-5-3.6M12 7c.6-2 2.4-3.4 5-3.6"/><circle cx="10" cy="12" r=".9" fill="currentColor"/><circle cx="14" cy="12" r=".9" fill="currentColor"/><circle cx="12" cy="15" r=".9" fill="currentColor"/>',
  pot:'<path d="M8.5 4h7M9.5 4v2.2C6.6 7.4 4.5 10 4.5 13.5c0 4 3.4 6.5 7.5 6.5s7.5-2.5 7.5-6.5c0-3.5-2.1-6.1-5-7.3V4"/><path d="M5 12.5h14M6 15.5h12"/>',
  letter:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  ganesh:'<path d="M12 4v16M4 12h16M12 4h5M20 12v5M12 20H7M4 12V7"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
  haldi:'<path d="M3 12h18a9 8 0 0 1-18 0z"/><path d="M7 12c.4-1.8 2.4-3 5-3s4.6 1.2 5 3"/><path d="M15 9l4-5"/>',
  gift:'<rect x="4" y="10" width="16" height="10" rx="1"/><rect x="3" y="7" width="18" height="3" rx="1"/><path d="M12 7v13M12 7c-1-3-5-4-5-1.5S10 7 12 7zm0 0c1-3 5-4 5-1.5S14 7 12 7z"/>',
  lamp:'<path d="M3 13c2 4 5 6 9 6s7-2 9-6z"/><path d="M12 4c2.2 2.6 2.2 5 0 6.5-2.2-1.5-2.2-3.9 0-6.5z"/>',
  dhol:'<path d="M5 7h14v10H5z"/><ellipse cx="5" cy="12" rx="2" ry="5"/><ellipse cx="19" cy="12" rx="2" ry="5"/><path d="M7 7l3 10 4-10 3 10"/>',
  horse:'<path d="M8 20l1-6-3.5-2L8 6l3 1.5L13 4l1.2 3C17.5 8 19 11 19 14.5V20"/><circle cx="10.5" cy="9.5" r=".9" fill="currentColor"/>',
  mandap:'<path d="M3 9l9-5 9 5M5 9v11M19 9v11M3 20h18M9 20v-6h6v6"/><path d="M5 11.5h14" stroke-dasharray="1.5 2"/>',
  fire:'<path d="M5 15h14l-2 5H7z"/><path d="M12 4c3 3 3 6.5 0 9-3-2.5-3-6 0-9zM8 9c1.4 1.6 1.4 3.6 0 5M16 9c-1.4 1.6-1.4 3.6 0 5"/>',
  palki:'<path d="M5 11h14v6H5zM6.5 11c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5M2 13h20M8 17v3M16 17v3"/>',
  feet:'<path d="M8 20c-2 0-3-2-2.6-5S6.8 9 8.5 9s2 2.4 1.7 5.2S10 20 8 20zM16 16c-2 0-2.4-2.5-2.2-5S15 5 16.5 5s2.4 2.6 2 5.6S18 16 16 16z"/><circle cx="7" cy="6.6" r=".8" fill="currentColor"/><circle cx="9.3" cy="6.4" r=".8" fill="currentColor"/><circle cx="15" cy="2.8" r=".8" fill="currentColor"/><circle cx="17.4" cy="2.8" r=".8" fill="currentColor"/>',
  kalash:'<path d="M8 9h8M9 9c-2.8 1-4 3.6-4 6 0 3 3 5 7 5s7-2 7-5c0-2.4-1.2-5-4-6"/><path d="M12 9c-1-2.2-3-3.2-5-3M12 9c1-2.2 3-3.2 5-3"/><circle cx="12" cy="5" r="2"/><path d="M7 14h10"/>',
  home:'<path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M4 18h2.5"/>',
  gear:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="3"/>',
  wa:'<path d="M4 20l1.3-4A8 8 0 1 1 8.4 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z" fill="currentColor" stroke="none"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  back:'<path d="M15 5l-7 7 7 7"/>'
};
const ic = (n)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P[n]||P.lamp)+'</svg>';

/* ---------- State ---------- */
const KEY="lp-lagna-v1";
const DEF={lang:0,side:"all",date:"",fs:19,ck:{},custom:{},upd:0};
let S=load();
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||"null");if(v&&typeof v==="object")return Object.assign({},DEF,v);}catch(e){}return Object.assign({},DEF);}
let cloudRef=null,cloudOn=false,cloudTimer=null;
function save(){
  S.upd=Date.now();
  try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
  if(cloudRef){clearTimeout(cloudTimer);cloudTimer=setTimeout(pushCloud,900);}
}
function pushCloud(){if(!cloudRef)return;cloudRef.set({state:JSON.stringify(S),upd:S.upd}).catch(()=>{});}
async function initCloud(){
  try{
    if(!window.claude||typeof window.claude.use!=="function")return;
    const [db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]);
    if(!db||!user)return;
    const id=await user.id(); if(!id)return;
    cloudRef=db.doc("data/users/"+id+"/plan");
    const snap=await cloudRef.get();
    const d=snap.exists?snap.data():null;
    let remote=null; try{remote=d&&typeof d.state==="string"?JSON.parse(d.state):null;}catch(e){}
    if(remote&&(remote.upd||0)>(S.upd||0)){S=Object.assign({},DEF,remote);try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
    else if(S.upd)pushCloud();
    cloudOn=true;render();
  }catch(e){cloudRef=null;}
}

/* ---------- Helpers ---------- */
const L=()=>S.lang;
const t=(k,vars)=>{let s=(T[k]||[k])[L()]||T[k][0];if(vars)for(const v in vars)s=s.split("{"+v+"}").join(vars[v]);return s;};
const tx=(arr)=>arr?(arr[L()]||arr[0]):"";
const GU="૦૧૨૩૪૫૬૭૮૯";
const n=(x)=>L()===0?String(x).replace(/[0-9]/g,d=>GU[d]):String(x);
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=(s,r=document)=>r.querySelector(s);
function sideOk(tag){return !tag||S.side==="all"||tag===S.side;}
function hk(str){let h=5381;for(let i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;return (h>>>0).toString(36);}
function entries(r,kind,withHeads){ // kind: "i" items, "t" todos
  const base=(kind==="i"?r.items:r.todos)||[];
  let out=[];
  base.forEach(e=>{
    if(!Array.isArray(e)&&e&&e.h){out.push({head:tx(e.h)});return;}
    if(sideOk(e[3]))out.push({key:r.id+"|"+kind+"|"+hk(e[1]||e[0]),text:tx(e),tag:e[3]||"",custom:false});
  });
  out=out.filter((e,i)=>!e.head||(out[i+1]&&!out[i+1].head));
  const c=((S.custom[r.id]||{})[kind])||[];
  if(c.length&&out.some(e=>e.head))out.push({head:t("yours")});
  c.forEach(e=>out.push({key:r.id+"|c"+kind+"|"+e.id,text:e.t,tag:"",custom:true,cid:e.id}));
  return withHeads?out:out.filter(e=>!e.head);
}
function stat(r,kind){const e=kind?entries(r,kind):entries(r,"i").concat(entries(r,"t"));const d=e.filter(x=>S.ck[x.key]).length;return{d,all:e.length};}
function totals(){let d=0,a=0;RITUALS.forEach(r=>{const s=stat(r);d+=s.d;a+=s.all;});return{d,a};}
function hostChip(h){return h==="b"?'<span class="chip b">'+esc(t("hostB"))+'</span>':h==="g"?'<span class="chip g">'+esc(t("hostG"))+'</span>':'<span class="chip">'+esc(t("hostBoth"))+'</span>';}
function tagChip(tag){return tag==="b"?'<span class="chip b">'+esc(t("tagB"))+'</span>':tag==="g"?'<span class="chip g">'+esc(t("tagG"))+'</span>':"";}
let toastT;function toast(m){const el=$("#toast");el.textContent=m;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2200);}
function daysTo(){if(!S.date)return null;const d=new Date(S.date+"T00:00:00");if(isNaN(d))return null;const now=new Date();now.setHours(0,0,0,0);return Math.round((d-now)/86400000);}
function countText(){const d=daysTo();if(d===null)return"";if(d>0)return t("daysLeft",{n:n(d)});if(d===0)return t("today");return t("past");}

/* ---------- Routing ---------- */
let route="home",tab="steps",confirmFor=null,pendFilter="all";
function readHash(){const h=(location.hash||"").slice(1);if(h.startsWith("r-")&&RITUALS.some(r=>"r-"+r.id===h))return h;if(h==="pending"||h==="setup"||h==="groups")return h;
  if(/^g-[a-z2-9]{12}$/.test(h)||/^j-[A-Z0-9]{6,12}$/.test(h))return h;return"home";}
function go(r){if(location.hash.slice(1)!==r){location.hash=r;}else{route=r;render();}}
window.addEventListener("hashchange",()=>{const r=readHash();if(r!==route){if(r.startsWith("r-"))tab="steps";confirmFor=null;}route=r;if(typeof gRoute==="function")gRoute();render();window.scrollTo(0,0);});

/* ---------- Views ---------- */
function checkRow(e,opts){
  if(e.head)return '<li class="grp">'+esc(e.head)+'</li>';
  const on=!!S.ck[e.key];
  return '<li><label class="ck'+(on?" on":"")+'"><input type="checkbox" data-ck="'+esc(e.key)+'"'+(on?" checked":"")+'><span class="box">'+ic("check")+'</span><span class="t">'+esc(e.text)+'</span>'+tagChip(e.tag)+
    (e.custom&&!opts?'<button type="button" class="del" data-del="'+esc(e.key)+'" aria-label="'+esc(t("remove"))+'">×</button>':"")+'</label></li>';
}
function viewHome(){
  const tt=totals();const pct=tt.a?Math.round(tt.d*100/tt.a):0;
  const ct=countText();
  let h='<section class="hello"><h1>'+esc(t("hello"))+'</h1><p>'+esc(t("helloP"))+'</p><ol class="how"><li><b>'+n(1)+'</b>'+esc(t("how1"))+'</li><li><b>'+n(2)+'</b>'+esc(t("how2"))+'</li><li><b>'+n(3)+'</b>'+esc(t("how3"))+'</li></ol></section>';
  if(ct||tt.d)h+='<section class="card">'+(ct?'<p class="count">'+esc(ct)+'</p>':'')+'<div class="label">'+esc(t("progress"))+'</div><div class="overall"><div class="bar"><i style="width:'+pct+'%"></i></div><span class="pct">'+n(pct)+'%</span></div></section>';
  h+='<h2 class="sec-title">'+esc(t("rituals"))+'<span>'+esc(t("ritualsCount",{n:n(RITUALS.length)}))+'</span></h2><ol class="timeline">';
  RITUALS.forEach((r,i)=>{const s=stat(r);const done=s.all&&s.d===s.all;
    h+='<li><button type="button" class="rit'+(done?" done":"")+'" data-open="'+r.id+'"><span class="num">'+n(i+1)+'</span><span class="ic">'+ic(r.icon)+'</span><span class="tx"><span class="nm">'+esc(tx(r.name))+'</span><span class="sh">'+esc(tx(r.short))+'</span><span class="meta"><span class="chip">'+esc(tx(r.when))+'</span>'+(done?'<span class="chip ok">✓ '+esc(t("doneChip"))+'</span>':'<span class="chip">'+n(s.d)+' / '+n(s.all)+'</span>')+'</span></span><span class="chev" aria-hidden="true">›</span></button></li>';});
  h+='</ol>';
  h+='<section class="card" id="mine"><div class="label" id="whose-l">'+esc(t("whose"))+'</div>'+sideButtons()+'<p class="hint">'+esc(t("whoseHint"))+'</p>';
  h+='<label class="label" for="date-home">'+esc(t("date"))+'</label><div class="date-row"><input type="date" id="date-home" value="'+esc(S.date)+'"></div>'+(ct?'<p class="count">'+esc(ct)+'</p>':'<p class="hint">'+esc(t("dateHint"))+'</p>');
  h+='</section>';
  h+='<p class="note">'+esc(t("vary"))+'</p>';
  return h;
}
function sideButtons(){
  const o=[["b","sideB"],["g","sideG"],["all","sideAll"]];
  return '<div class="choice" role="group" aria-labelledby="whose-l">'+o.map(x=>'<button type="button" data-side="'+x[0]+'" aria-pressed="'+(S.side===x[0])+'">'+esc(t(x[1]))+'</button>').join("")+'</div>';
}
function shareText(title,groups){
  let s="*"+title+"*\n";
  groups.forEach(g=>{if(g.head)s+="\n*"+g.head+"*\n";g.rows.forEach(e=>{if(e.head){s+="\n_"+e.head+"_\n";return;}s+=(S.ck[e.key]?"✅ ":"⬜ ")+e.text+"\n";});});
  return s+"\n"+t("shareFoot");
}
function shareBlock(text,resetKind){
  let h='<div class="actions"><a class="btn wa full" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(text)+'">'+ic("wa")+esc(t("wa"))+'</a><button type="button" class="btn ghost full" data-copy>'+ic("copy")+esc(t("copy"))+'</button></div>';
  h+='<textarea id="copy-src" class="sr" readonly tabindex="-1" aria-hidden="true">'+esc(text)+'</textarea><div id="copy-fallback" hidden></div>';
  if(resetKind){
    if(confirmFor===resetKind)h+='<div class="confirm"><b>'+esc(t("resetQ"))+'</b><div class="row"><button type="button" class="btn" data-reset-yes="'+resetKind+'">'+esc(t("yes"))+'</button><button type="button" class="btn ghost" data-reset-no>'+esc(t("no"))+'</button></div></div>';
    else h+='<button type="button" class="danger" data-reset="'+resetKind+'">'+esc(t("reset"))+'</button>';
  }
  return h;
}
function viewRitual(id){
  const r=RITUALS.find(x=>x.id===id);
  const si=stat(r,"i"),st=stat(r,"t");
  let h='<button type="button" class="back" data-go="home">'+ic("back").replace('aria-hidden','style="width:20px;height:20px" aria-hidden')+esc(t("back"))+'</button>';
  h+='<div class="rhead"><span class="ic">'+ic(r.icon)+'</span><div><h1>'+esc(tx(r.name))+'</h1><p>'+esc(tx(r.when))+'</p><div class="meta" style="margin-top:6px">'+hostChip(r.host)+'</div></div></div>';
  const tabs=[["steps","tabSteps",""],["items","tabItems",n(si.d)+" / "+n(si.all)],["todos","tabTodos",n(st.d)+" / "+n(st.all)]];
  h+='<div class="tabs" role="tablist">'+tabs.map(x=>'<button type="button" role="tab" id="tab-'+x[0]+'" data-tab="'+x[0]+'" aria-selected="'+(tab===x[0])+'" aria-controls="panel">'+esc(t(x[1]))+(x[2]?'<small>'+x[2]+'</small>':'')+'</button>').join("")+'</div>';
  h+='<div id="panel" role="tabpanel" aria-labelledby="tab-'+tab+'" class="view">';
  if(tab==="steps"){
    h+='<section class="card"><h2 style="font-size:1.15rem">'+esc(t("whatIs"))+'</h2><p class="about">'+esc(tx(r.about))+'</p></section>';
    h+='<section class="card"><h2 style="font-size:1.15rem">'+esc(t("howDone"))+'</h2><ol class="steps">'+r.steps.map(s=>'<li><span>'+esc(tx(s))+'</span></li>').join("")+'</ol></section>';
    if(r.tip)h+='<aside class="tip"><b>'+esc(t("tip"))+'</b><span>'+esc(tx(r.tip))+'</span></aside>';
    h+='<div class="actions"><button type="button" class="btn" data-tab="items">'+esc(t("tabItems"))+' ('+n(si.all)+')</button><button type="button" class="btn" data-tab="todos">'+esc(t("tabTodos"))+' ('+n(st.all)+')</button></div>';
    h+='<p class="note">'+esc(t("vary"))+'</p>';
  }else{
    const kind=tab==="items"?"i":"t";const s=kind==="i"?si:st;const rows=entries(r,kind,true);
    const pct=s.all?Math.round(s.d*100/s.all):0;
    h+='<div class="listhead"><h2 style="font-size:1.15rem;flex:1">'+esc(t(kind==="i"?"itemsTitle":"todosTitle"))+'</h2><span class="pct">'+n(s.d)+' / '+n(s.all)+'</span></div>';
    h+='<div class="bar"><i style="width:'+pct+'%"></i></div>';
    h+='<ul class="checks">'+rows.map(e=>checkRow(e)).join("")+'</ul>';
    h+='<form class="add" data-add="'+kind+'"><label class="sr" for="add-'+kind+'">'+esc(t(kind==="i"?"addItem":"addTodo"))+'</label><input id="add-'+kind+'" maxlength="120" placeholder="'+esc(t(kind==="i"?"addItem":"addTodo"))+'" autocomplete="off"><button class="btn" type="submit">'+esc(t("add"))+'</button></form>';
    h+=shareBlock(shareText(tx(r.name)+" – "+t(kind==="i"?"shareItems":"shareTodos"),[{rows}]),kind);
  }
  h+='</div>';
  return h;
}
function viewPending(){
  let h='<section class="hello"><h1>'+esc(t("pendingTitle"))+'</h1><p>'+esc(t("pendingHint"))+'</p>'+(countText()?'<p class="count">'+esc(countText())+'</p>':'')+'</section>';
  const f=[["all","fAll"],["i","tabItems"],["t","tabTodos"]];
  h+='<div class="filters" role="group">'+f.map(x=>'<button type="button" data-pf="'+x[0]+'" aria-pressed="'+(pendFilter===x[0])+'">'+esc(t(x[1]))+'</button>').join("")+'</div>';
  const groups=[];
  RITUALS.forEach(r=>{let rows=[];if(pendFilter!=="t")rows=rows.concat(entries(r,"i"));if(pendFilter!=="i")rows=rows.concat(entries(r,"t"));rows=rows.filter(e=>!S.ck[e.key]);if(rows.length)groups.push({r,rows});});
  if(!groups.length)h+='<p class="empty">'+esc(t("allDone"))+'</p>';
  groups.forEach(g=>{h+='<section class="group"><h3><span class="ic" style="width:28px;height:28px;color:var(--kanku);display:inline-grid">'+ic(g.r.icon)+'</span><button type="button" data-open="'+g.r.id+'">'+esc(tx(g.r.name))+'</button><span class="chip">'+n(g.rows.length)+'</span></h3><ul class="checks">'+g.rows.map(e=>checkRow(e,true)).join("")+'</ul></section>';});
  if(groups.length)h+=shareBlock(shareText(t("sharePending")+(countText()?" ("+countText()+")":""),groups.map(g=>({head:tx(g.r.name),rows:g.rows}))),null);
  return h;
}
function viewSetup(){
  let h='<h1 style="font-size:1.5rem;color:var(--kanku)">'+esc(t("setupTitle"))+'</h1>';
  h+='<section class="card"><div class="label" id="lang-l">'+esc(t("lang"))+'</div><div class="choice" role="group" aria-labelledby="lang-l">'+[["ગુજરાતી","gu"],["English","en"],["हिन्दी","hi"]].map((x,i)=>'<button type="button" data-lang="'+i+'" lang="'+x[1]+'" aria-pressed="'+(S.lang===i)+'">'+x[0]+'</button>').join("")+'</div></section>';
  h+='<section class="card"><div class="label" id="size-l">'+esc(t("size"))+'</div><div class="sizes" role="group" aria-labelledby="size-l">'+[[16,"sizeS",".9rem"],[19,"sizeM","1.05rem"],[22,"sizeL","1.25rem"]].map(x=>'<button type="button" data-fs="'+x[0]+'" aria-pressed="'+(S.fs===x[0])+'" style="font-size:'+x[2]+'">'+esc(t(x[1]))+'</button>').join("")+'</div></section>';
  if(G.on){
    // On the home server the ceremony, date and side live in each group, so Settings keeps only
    // what belongs to this phone: language, text size and the admin login.
    h+=adminCard();
    h+='<section class="card"><h2 style="font-size:1.15rem">'+esc(t("aboutTitle"))+'</h2><p style="margin:0">'+esc(t("aboutP"))+'</p>';
  }else{
    h+='<section class="card"><div class="label" id="whose-l">'+esc(t("whose"))+'</div>'+sideButtons()+'<label class="label" for="date-set">'+esc(t("date"))+'</label><div class="date-row"><input type="date" id="date-set" value="'+esc(S.date)+'"></div>'+(countText()?'<p class="count">'+esc(countText())+'</p>':'')+'</section>';
    h+='<section class="card"><h2 style="font-size:1.15rem">'+esc(t("aboutTitle"))+'</h2><p style="margin:0">'+esc(t("aboutP"))+'</p><p class="sync">'+esc(t(cloudOn?"savedCloud":"saved"))+'</p>';
    if(confirmFor==="all")h+='<div class="confirm"><b>'+esc(t("resetAllQ"))+'</b><div class="row"><button type="button" class="btn" data-resetall-yes>'+esc(t("yes"))+'</button><button type="button" class="btn ghost" data-reset-no>'+esc(t("no"))+'</button></div></div>';
    else h+='<button type="button" class="danger" data-resetall>'+esc(t("resetAll"))+'</button>';
  }
  h+='</section>';
  return h;
}

/* ---------- Render ---------- */
function render(){
  document.documentElement.lang=LANGS[S.lang];
  document.documentElement.style.setProperty("--fs",S.fs+"px");
  $("#brand").innerHTML=esc(t("brand"))+'<small>'+esc(t("brandSub"))+'</small>';
  document.querySelectorAll(".langs button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.lang===S.lang)));
  const m=$("#main");
  const ae=document.activeElement,focusId=ae&&ae.id,sel=ae&&typeof ae.selectionStart==="number"?[ae.selectionStart,ae.selectionEnd]:null;
  // keep what people are typing when the page re-renders (e.g. a family member's change arrives)
  const kept={};m.querySelectorAll("input[id],textarea[id],select[id]").forEach(el=>{if(el.type!=="checkbox"&&el.type!=="password"&&el.dataset.dirty)kept[el.id]=el.value;});
  const groupView=()=>!G.on?'<p class="empty">'+esc(G.failed?t("gNeedServer"):t("gLoading"))+'</p>':route==="groups"?viewGroups():route.startsWith("g-")?viewGroup():viewJoin();
  if(G.landing){m.innerHTML='<div class="view"><p class="empty">'+esc(t("gLoading"))+'</p></div>';}else
  m.innerHTML='<div class="view">'+(route.startsWith("r-")?viewRitual(route.slice(2)):route==="pending"?viewPending():route==="setup"?viewSetup():(route==="groups"||route.startsWith("g-")||route.startsWith("j-"))?groupView():viewHome())+'</div>';
  for(const id in kept){const el=document.getElementById(id);if(el){el.value=kept[id];el.dataset.dirty="1";}}
  if(focusId){const f=document.getElementById(focusId);if(f&&(f.tagName==="INPUT"||f.tagName==="TEXTAREA")&&f.type!=="checkbox"){f.focus();if(sel)try{f.setSelectionRange(sel[0],sel[1]);}catch(e){}}}
  const tt=totals();const left=tt.a-tt.d;
  const navs=[["home","home","navHome"],["groups","people","navGroups"],["pending","list","navPending"],["setup","gear","navSetup"]];
  $("#nav-groups").hidden=!G.on;
  // On the home server: Groups | Pending | Settings | Rituals. The static guide keeps Rituals first.
  const navHome=$("#nav-home");if(G.on&&navHome.nextElementSibling)navHome.parentNode.appendChild(navHome);
  navs.forEach(x=>{const b=$("#nav-"+x[0]);const cur=x[0]===route||(x[0]==="home"&&route.startsWith("r-"))||(x[0]==="groups"&&(route.startsWith("g-")||route.startsWith("j-")));
    b.innerHTML=ic(x[1])+'<span>'+esc(t(x[2]))+'</span>'+(x[0]==="pending"&&left>0?'<span class="badge">'+n(left>999?"999+":left)+'</span>':"");
    if(cur)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
  document.title=t("brand");
  const hd=document.querySelector(".top");if(hd)document.documentElement.style.setProperty("--hh",hd.offsetHeight+"px");
}

/* ---------- Events ---------- */
document.addEventListener("click",e=>{
  const el=e.target.closest("button,[data-open]");if(!el)return;
  const d=el.dataset;
  if(gClick(el,e))return;
  if(d.lang!==undefined){S.lang=+d.lang;save();render();return;}
  if(el.id==="brand"){go(G.on?landingRoute():"home");return;}
  if(d.go){go(d.go);return;}
  if(d.open){tab="steps";go("r-"+d.open);return;}
  if(d.tab){tab=d.tab;confirmFor=null;render();const tb=$(".tabs");if(tb&&tb.getBoundingClientRect().top<0||d.tab!==undefined&&el.classList.contains("btn"))$("#panel").scrollIntoView({block:"start"});return;}
  if(d.side){S.side=d.side;save();render();return;}
  if(d.fs){S.fs=+d.fs;save();render();return;}
  if(d.pf){pendFilter=d.pf;render();return;}
  if(d.del){e.preventDefault();const [rid,kc,cid]=d.del.split("|");const kind=kc.slice(1);const c=S.custom[rid];if(c&&c[kind])c[kind]=c[kind].filter(x=>x.id!==cid);delete S.ck[d.del];save();render();toast(t("removed"));return;}
  if(d.reset){confirmFor=d.reset;render();return;}
  if(d.resetNo!==undefined){confirmFor=null;render();return;}
  if(d.resetYes){const rid=route.slice(2);Object.keys(S.ck).forEach(k=>{const p=k.split("|");if(p[0]===rid&&(p[1]===d.resetYes||p[1]==="c"+d.resetYes))delete S.ck[k];});confirmFor=null;save();render();toast(t("cleared"));return;}
  if(d.resetall!==undefined){confirmFor="all";render();return;}
  if(d.resetallYes!==undefined){S.ck={};S.custom={};confirmFor=null;save();render();toast(t("cleared"));return;}
  if(d.copy!==undefined){const txt=$("#copy-src").value;
    const fb=()=>{const f=$("#copy-fallback");f.hidden=false;f.innerHTML='<p class="hint">'+esc(t("copyFail"))+'</p><textarea readonly style="width:100%;min-height:160px;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--surface)">'+esc(txt)+'</textarea>';const ta=f.querySelector("textarea");ta.focus();ta.select();};
    try{navigator.clipboard.writeText(txt).then(()=>toast(t("copied")),fb);}catch(err){fb();}return;}
});
document.addEventListener("change",e=>{
  const el=e.target;
  if(gChange(el))return;
  if(el.dataset&&el.dataset.ck){if(el.checked)S.ck[el.dataset.ck]=1;else delete S.ck[el.dataset.ck];save();
    // update in place to keep scroll position, then refresh counts
    const y=window.scrollY;render();window.scrollTo(0,y);return;}
  if(el.type==="date"){S.date=el.value||"";save();const y=window.scrollY;render();window.scrollTo(0,y);}
});
document.addEventListener("input",e=>{const el=e.target;if(el&&el.id&&el.dataset)el.dataset.dirty="1";});
document.addEventListener("submit",e=>{
  const g=e.target.closest("form");if(g&&Object.keys(g.dataset).some(k=>k.startsWith("g"))){e.preventDefault();gSubmit(g);return;}
  const f=e.target.closest("form[data-add]");if(!f)return;e.preventDefault();
  const inp=f.querySelector("input");const v=(inp.value||"").trim();if(!v)return;
  const rid=route.slice(2),kind=f.dataset.add;
  S.custom[rid]=S.custom[rid]||{};S.custom[rid][kind]=S.custom[rid][kind]||[];
  S.custom[rid][kind].push({id:Date.now().toString(36),t:v.slice(0,120)});
  save();render();toast(t("added"));const ni=document.getElementById("add-"+kind);if(ni)ni.focus();
});

/*GROUPS*/
route=readHash();render();
initCloud();
})();
