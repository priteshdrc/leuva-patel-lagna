/* ================= Groups: shared planning for one ceremony (needs the server) =================
   Inlined into app.js's closure by build.js, so it uses t, tx, esc, ic, n, L, S, render, go, toast, RITUALS.
   Every piece of user text is passed through esc() before it touches innerHTML. */
Object.assign(T,{
  navGroups:["ગ્રુપ","Groups","ग्रुप"],
  gTitle:["પ્રસંગનું ગ્રુપ","Ceremony groups","प्रसंग का ग्रुप"],
  gIntro:["આખું કુટુંબ સાથે મળીને એક જ યાદી પર કામ કરે. ગ્રુપ કોડ નાખો એટલે તમે પ્રસંગની તૈયારીમાં જોડાઈ જશો.","The whole family works on one shared list. Enter a group code to join the planning.","पूरा परिवार मिलकर एक ही सूची पर काम करे। ग्रुप कोड डालें और तैयारी में जुड़ जाएँ।"],
  gCode:["ગ્રુપ કોડ","Group code","ग्रुप कोड"],
  gCodePh:["દા.ત. ABC-DEF-GHJ","e.g. ABC-DEF-GHJ","जैसे ABC-DEF-GHJ"],
  gJoin:["જોડાઓ","Join","जुड़ें"],
  gMine:["મારાં ગ્રુપ","My groups","मेरे ग्रुप"],
  gNone:["હજુ કોઈ ગ્રુપમાં નથી. કોડ મળે એટલે ઉપર નાખો.","You're not in any group yet. Enter a code above when you get one.","अभी किसी ग्रुप में नहीं हैं। कोड मिलने पर ऊपर डालें।"],
  gCreate:["નવું ગ્રુપ બનાવો","Create a new group","नया ग्रुप बनाएँ"],
  gCreateHint:["એક ગ્રુપ = એક પ્રસંગ. જુદા પ્રસંગ માટે જુદું ગ્રુપ બનાવો.","One group = one ceremony. Make a separate group for each ceremony.","एक ग्रुप = एक प्रसंग। अलग प्रसंग के लिए अलग ग्रुप बनाएँ।"],
  gName:["પ્રસંગનું નામ","Name of the ceremony","प्रसंग का नाम"],
  gNamePh:["દા.ત. દીપની સગાઈ","e.g. Deep's ring ceremony","जैसे दीप की सगाई"],
  gRitual:["કઈ વિધિ?","Which ritual?","कौन सी रस्म?"],
  gSide:["કયા પક્ષ માટે?","For which side?","किस पक्ष के लिए?"],
  gYou:["તમારું નામ","Your name","आपका नाम"],
  gYouPh:["દા.ત. પ્રિતેશ","e.g. Pritesh","जैसे प्रितेश"],
  gMake:["ગ્રુપ બનાવો","Create group","ग्रुप बनाएँ"],
  gWho:["તમે કોણ છો?","Who are you?","आप कौन हैं?"],
  gWhoHint:["તમારું નામ પસંદ કરો, કે નવું નામ લખો.","Pick your name, or type a new one.","अपना नाम चुनें, या नया नाम लिखें।"],
  gIam:["હું {name}","I am {name}","मैं {name}"],
  gNew:["હું નવો/નવી છું","I'm new here","मैं नया/नई हूँ"],
  gMembers:["સભ્યો","Members","सदस्य"],
  gInvite:["WhatsApp પર આમંત્રણ","Invite on WhatsApp","WhatsApp पर न्योता"],
  gCopyCode:["કોડ કૉપી","Copy code","कोड कॉपी"],
  gInviteText:["{title} ની તૈયારીમાં જોડાઓ!\nગ્રુપ કોડ: {code}\nઅહીં ખોલો: {link}","Join the planning for {title}!\nGroup code: {code}\nOpen: {link}","{title} की तैयारी में जुड़ें!\nग्रुप कोड: {code}\nयहाँ खोलें: {link}"],
  gTabGroup:["ગ્રુપ","Group","ग्रुप"],
  gAll:["બધું","All","सब"],gLeft:["બાકી","Left","बाकी"],gMineF:["મારું","Mine","मेरा"],
  gTotal:["કુલ ખર્ચ","Total cost","कुल खर्च"],gPaid:["પૂરું થયું","Done","पूरा"],
  gAddPh:["અહીં લખો…","Type here…","यहाँ लिखें…"],
  gAddSec:["+ નવો વિભાગ","+ New type","+ नया विभाग"],
  gAddSecPh:["નવા વિભાગનું નામ","Name of the new type","नए विभाग का नाम"],
  gAddStepPh:["નવી વિધિ લખો…","Add a step…","नई विधि लिखें…"],
  gEdit:["બદલો","Edit","बदलें"],gDelete:["કાઢી નાખો","Delete","हटाएँ"],gRestore:["પાછું લાવો","Restore","वापस लाएँ"],
  gPurge:["કાયમ માટે કાઢો","Delete forever","हमेशा के लिए हटाएँ"],
  gPurgeQ:["કાયમ માટે કાઢી નાખવું છે? આ પાછું નહીં આવે.","Delete forever? This can't be undone.","हमेशा के लिए हटाना है? यह वापस नहीं आएगा।"],
  gDeletedBy:["{name}એ કાઢ્યું","deleted by {name}","{name} ने हटाया"],
  gDoneBy:["✓ {name}","✓ {name}","✓ {name}"],
  gSave:["સાચવો","Save","सहेजें"],gCancel:["રદ કરો","Cancel","रद्द करें"],
  gText:["શું?","What?","क्या?"],gAssign:["કોણ લાવશે / કરશે?","Who will bring / do it?","कौन लाएगा / करेगा?"],gNobody:["હજુ નક્કી નથી","Not decided","अभी तय नहीं"],
  gAmount:["ખર્ચ ₹ (જરૂર હોય તો)","Cost ₹ (optional)","खर्च ₹ (ज़रूरत हो तो)"],
  gSecName:["વિભાગનું નામ","Type name","विभाग का नाम"],
  gStepText:["વિધિ","Step","विधि"],
  gActivity:["છેલ્લી પ્રવૃત્તિ","Recent activity","हाल की गतिविधि"],
  gNoActivity:["હજુ કંઈ થયું નથી.","Nothing yet.","अभी कुछ नहीं हुआ।"],
  gDetails:["પ્રસંગની વિગત","Ceremony details","प्रसंग की जानकारी"],
  gMyName:["તમારું નામ (આ ગ્રુપમાં)","Your name (in this group)","आपका नाम (इस ग्रुप में)"],
  gLeave:["આ ફોન પરથી ગ્રુપ છોડો","Leave this group on this phone","इस फ़ोन से ग्रुप छोड़ें"],
  gLeaveQ:["ગ્રુપ છોડવું છે? ફરી જોડાવા કોડ જોઈશે.","Leave the group? You'll need the code to join again.","ग्रुप छोड़ना है? फिर जुड़ने के लिए कोड चाहिए।"],
  gAdminBox:["એડમિન","Admin","एडमिन"],
  gRotate:["નવો કોડ બનાવો (જૂનો બંધ થશે)","Make a new code (old one stops working)","नया कोड बनाएँ (पुराना बंद होगा)"],
  gPurgeAll:["કાઢેલું બધું કાયમ માટે કાઢો","Delete all deleted things forever","हटाई गई सब चीज़ें हमेशा के लिए हटाएँ"],
  gRemove:["ગ્રુપમાંથી કાઢો","Remove from group","ग्रुप से हटाएँ"],
  gDelGroup:["આખું ગ્રુપ કાઢી નાખો","Delete the whole group","पूरा ग्रुप हटाएँ"],
  gDelGroupQ:["પાકું કરવા ગ્રુપનું નામ જેમ છે તેમ લખો:","To confirm, type the group name exactly:","पक्का करने के लिए ग्रुप का नाम वैसा ही लिखें:"],
  gAdminLogin:["એડમિન લૉગિન","Admin login","एडमिन लॉगिन"],
  gAdminHint:["ફક્ત સાઇટના માલિક માટે. એડમિન જ ગ્રુપ બનાવી શકે અને કાયમ માટે કાઢી શકે.","Only for the site owner. Only the admin can create groups and delete things forever.","सिर्फ़ साइट के मालिक के लिए। एडमिन ही ग्रुप बना सकता है और हमेशा के लिए हटा सकता है।"],
  gPassword:["પાસવર્ડ","Password","पासवर्ड"],gLogin:["લૉગિન","Log in","लॉगिन"],gLogout:["લૉગઆઉટ","Log out","लॉगआउट"],
  gAdminOn:["તમે એડમિન તરીકે લૉગિન છો.","You are logged in as admin.","आप एडमिन के रूप में लॉगिन हैं।"],
  gAllGroups:["બધાં ગ્રુપ (એડમિન)","All groups (admin)","सभी ग्रुप (एडमिन)"],
  gAdminName:["એડમિન","Admin","एडमिन"],
  gSomeone:["કોઈ","Someone","कोई"],
  gNeedServer:["ગ્રુપ ફક્ત ઘરના સર્વર પરની સાઇટમાં ચાલે છે.","Groups work only on the site hosted on the home server.","ग्रुप सिर्फ़ घर के सर्वर वाली साइट पर चलते हैं।"],
  gLoading:["લોડ થાય છે…","Loading…","लोड हो रहा है…"],
  gSaved:["સચવાયું","Saved","सहेजा गया"],
  gLive:["બધાના ફેરફાર આપોઆપ દેખાય છે","Everyone's changes show up automatically","सबके बदलाव अपने-आप दिखते हैं"],
  gOffline:["સર્વર સાથે જોડાણ નથી — ફરી પ્રયત્ન થાય છે","Can't reach the server — retrying","सर्वर से जुड़ाव नहीं — फिर कोशिश हो रही है"],
  gMembersN:["{n} સભ્ય","{n} members","{n} सदस्य"],
  gJust:["હમણાં","just now","अभी"],gMin:["{n} મિનિટ પહેલાં","{n} min ago","{n} मिनट पहले"],gHr:["{n} કલાક પહેલાં","{n} h ago","{n} घंटे पहले"],
  mCopy:["કૉપી","Copy","कॉपी"],
  mTitle:["AI એજન્ટ (MCP)","AI agents (MCP)","AI एजेंट (MCP)"],
  mHint:["Claude જેવી AI એપ તમારાં ગ્રુપ જોઈ અને બદલી શકે. દરેક ફેરફાર પ્રવૃત્તિમાં “MCP” નામ સાથે દેખાય છે.","Let an AI app like Claude read and update your groups. Every change shows in the activity log as “MCP”.","Claude जैसी AI ऐप आपके ग्रुप देख और बदल सके। हर बदलाव गतिविधि में “MCP” नाम से दिखता है।"],
  mConnector:["claude.ai / Claude ઍપ: Settings → Connectors → Add custom connector, URL:","claude.ai / Claude app: Settings → Connectors → Add custom connector, URL:","claude.ai / Claude ऐप: Settings → Connectors → Add custom connector, URL:"],
  mConnHint:["પછી અહીંનો એડમિન પાસવર્ડ પૂછશે.","It then asks for this site's admin password.","फिर यहाँ का एडमिन पासवर्ड पूछेगा।"],
  mNew:["Claude Code માટે નવું ટોકન","New token for Claude Code","Claude Code के लिए नया टोकन"],
  mName:["નામ (કઈ એપ / ઉપકરણ)","Name (which app / device)","नाम (कौन सी ऐप / डिवाइस)"],
  mAccess:["છૂટ","Access","अनुमति"],
  mRead:["ફક્ત જોવું","Read only","सिर्फ़ देखना"],mAdd:["જોવું + ઉમેરવું / બદલવું","Read, add and edit","देखना + जोड़ना / बदलना"],mFull:["બધું (કાયમ કાઢવું પણ)","Full (incl. delete forever)","सब (हमेशा हटाना भी)"],
  mDays:["ક્યાં સુધી","Expires","कब तक"],mD30:["૩૦ દિવસ","30 days","30 दिन"],mD90:["૯૦ દિવસ","90 days","90 दिन"],mD365:["૧ વર્ષ","1 year","1 साल"],mD0:["ક્યારેય નહીં","Never","कभी नहीं"],
  mCreate:["ટોકન બનાવો","Create token","टोकन बनाएँ"],
  mOnce:["આ ટોકન ફક્ત એક જ વાર દેખાશે. હમણાં જ કૉપી કરો:","This token is shown only once. Copy it now:","यह टोकन सिर्फ़ एक बार दिखेगा। अभी कॉपी करें:"],
  mCmd:["Claude Code માં ચલાવો:","Run in Claude Code:","Claude Code में चलाएँ:"],
  mList:["જોડાયેલી એપ અને ટોકન","Connected apps and tokens","जुड़ी ऐप और टोकन"],
  mNone:["હજુ કંઈ જોડાયેલું નથી.","Nothing connected yet.","अभी कुछ जुड़ा नहीं है।"],
  mRevoke:["બંધ કરો","Revoke","बंद करें"],mRevokeQ:["આ જોડાણ બંધ કરવું છે?","Revoke this connection?","यह जुड़ाव बंद करना है?"],
  mOauth:["એપ (લૉગિન)","app (sign-in)","ऐप (लॉगिन)"],mToken:["ટોકન","token","टोकन"],
  mUsed:["છેલ્લે વપરાયું","last used","आख़िरी बार"],mNever:["હજુ નહીં","not yet","अभी नहीं"],mExp:["પૂરું","expires","ख़त्म"],
  e_set_PUBLIC_URL:["સર્વરની .env માં PUBLIC_URL નાખો.","Set PUBLIC_URL in the server's .env.","सर्वर की .env में PUBLIC_URL डालें।"],
  gAddMem:["+ સભ્ય ઉમેરો","+ Add member","+ सदस्य जोड़ें"],
  gAddMemPh:["નામ, દા.ત. દીપ","Name, e.g. Deep","नाम, जैसे दीप"],
  gAddMemHint:["ઉમેરેલા સભ્ય આમંત્રણ ખોલે ત્યારે પોતાનું નામ પસંદ કરી શકે.","Added people pick their name when they open the invite.","जोड़े गए सदस्य न्योता खोलकर अपना नाम चुन सकते हैं।"],
  e_member_exists:["આ નામના સભ્ય પહેલેથી છે.","A member with this name already exists.","इस नाम का सदस्य पहले से है।"],
  e_wrong_code:["આ કોડનું કોઈ ગ્રુપ નથી. કોડ ફરી તપાસો.","No group has this code. Check the code again.","इस कोड का कोई ग्रुप नहीं है। कोड फिर से देखें।"],
  e_too_many_attempts:["ઘણા પ્રયત્ન થયા. ૧૦–૧૫ મિનિટ પછી ફરી કરો.","Too many tries. Try again in 10–15 minutes.","बहुत कोशिशें हुईं। 10–15 मिनट बाद फिर करें।"],
  e_wrong_password:["પાસવર્ડ ખોટો છે.","Wrong password.","पासवर्ड गलत है।"],
  e_not_member:["તમે હવે આ ગ્રુપમાં નથી. ફરી જોડાવા કોડ નાખો.","You're no longer in this group. Enter the code to join again.","आप अब इस ग्रुप में नहीं हैं। फिर जुड़ने के लिए कोड डालें।"],
  e_no_group:["આ ગ્રુપ હવે નથી.","This group no longer exists.","यह ग्रुप अब नहीं है।"],
  e_admin_only:["આ ફક્ત એડમિન કરી શકે.","Only the admin can do this.","यह सिर्फ़ एडमिन कर सकता है।"],
  e_limit:["મર્યાદા પૂરી થઈ ગઈ.","Limit reached.","सीमा पूरी हो गई।"],
  e_fields:["બધી વિગત ભરો.","Please fill in every field.","सारी जानकारी भरें।"],
  e_text:["લખાણ ખાલી છે કે બહુ લાંબું છે.","The text is empty or too long.","टेक्स्ट खाली है या बहुत लंबा है।"],
  e_amount:["ખર્ચમાં ફક્ત આંકડા લખો.","Use digits only for the cost.","खर्च में सिर्फ़ अंक लिखें।"],
  e_confirm:["નામ મેળ ખાતું નથી.","The name doesn't match.","नाम मेल नहीं खाता।"],
  e_slow_down:["થોડું ધીમે — થોડી વારમાં ફરી કરો.","Slow down a little — try again shortly.","थोड़ा धीरे — थोड़ी देर में फिर करें।"],
  e_net:["ઇન્ટરનેટ / સર્વર સાથે જોડાણ નથી.","Can't reach the server. Check the internet.","इंटरनेट / सर्वर से जुड़ाव नहीं।"],
  e_other:["કંઈક ખોટું થયું. ફરી પ્રયત્ન કરો.","Something went wrong. Please try again.","कुछ गलत हुआ। फिर कोशिश करें।"]
});
const ACT={create:["ગ્રુપ બનાવ્યું","created the group","ग्रुप बनाया"],join:["જોડાયા","joined","जुड़े"],
  addEntry:["ઉમેર્યું","added","जोड़ा"],editEntry:["બદલ્યું","edited","बदला"],done:["✓ કર્યું","ticked","✓ किया"],undone:["✓ કાઢ્યું","unticked","✓ हटाया"],
  delEntry:["કાઢી નાખ્યું","deleted","हटाया"],restoreEntry:["પાછું લાવ્યા","restored","वापस लाए"],
  addSection:["નવો વિભાગ ઉમેર્યો","added a type","नया विभाग जोड़ा"],editSection:["વિભાગ બદલ્યો","renamed a type","विभाग बदला"],
  delSection:["વિભાગ કાઢ્યો","deleted a type","विभाग हटाया"],restoreSection:["વિભાગ પાછો લાવ્યા","restored a type","विभाग वापस लाए"],
  addStep:["વિધિ ઉમેરી","added a step","विधि जोड़ी"],editStep:["વિધિ બદલી","edited a step","विधि बदली"],delStep:["વિધિ કાઢી","deleted a step","विधि हटाई"],restoreStep:["વિધિ પાછી લાવ્યા","restored a step","विधि वापस लाए"],
  editGroup:["વિગત બદલી","changed the details","जानकारी बदली"],renameMe:["નામ બદલ્યું","changed their name","नाम बदला"],
  purge:["કાયમ માટે કાઢ્યું","deleted forever","हमेशा के लिए हटाया"],purgeAll:["કાઢેલું બધું કાયમ કાઢ્યું","cleared all deleted things","हटाई चीज़ें हमेशा के लिए हटाईं"],
  addMember:["સભ્ય ઉમેર્યા","added a member","सदस्य जोड़ा"],removeMember:["સભ્યને કાઢ્યા","removed a member","सदस्य हटाया"],rotateCode:["નવો કોડ બનાવ્યો","made a new code","नया कोड बनाया"]};
Object.assign(P,{
  people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  pencil:'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  up:'<path d="M6 15l6-6 6 6"/>',down:'<path d="M6 9l6 6 6-6"/>',
  user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>'
});
const icS=(n,label)=>'<span class="sr">'+esc(label)+'</span>'+ic(n);

const G={on:false,failed:false,landing:!location.hash,health:null,cur:null,poll:null,adminGroups:null,join:null,busy:false,confirm:null};
const GKEY="lp-groups-v1",AKEY="lp-admin-v1";
const ID_RE=/^[a-z2-9]{12}$/;
function gLoad(){try{const v=JSON.parse(localStorage.getItem(GKEY)||"{}");return v&&typeof v==="object"?v:{};}catch(e){return{};}}
function gSave(v){try{localStorage.setItem(GKEY,JSON.stringify(v));}catch(e){}}
let MY=gLoad();
let ADMIN=(()=>{try{return localStorage.getItem(AKEY)||"";}catch(e){return"";}})();
function setAdmin(tk){ADMIN=tk||"";try{tk?localStorage.setItem(AKEY,tk):localStorage.removeItem(AKEY);}catch(e){}}
const fmtCode=(c)=>String(c||"").replace(/(...)(?=.)/g,"$1-");
const rupee=(x)=>"₹"+n(Number(x||0).toLocaleString("en-IN"));
function errText(code){return T["e_"+code]?t("e_"+code):t("e_other");}

async function api(method,path,body,gid){
  const h={"Content-Type":"application/json"};
  if(gid&&MY[gid])h.Authorization="Bearer "+MY[gid].token;
  if(gid&&MY[gid]&&MY[gid].owner)h["X-Owner-Token"]=MY[gid].owner;
  if(ADMIN)h["X-Admin-Token"]=ADMIN;
  let res;
  try{res=await fetch(path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:"no-store",credentials:"omit"});}
  catch(e){const er=new Error("net");er.code="net";throw er;}
  let data=null;try{data=await res.json();}catch(e){}
  if(!res.ok){const er=new Error((data&&data.error)||"other");er.code=(data&&data.error)||"other";er.status=res.status;throw er;}
  return data;
}

/* ---------- health check: groups only appear when the server is there ---------- */
(async()=>{
  try{const ctl=new AbortController();const tm=setTimeout(()=>ctl.abort(),5000);
    const r=await fetch("/api/health",{signal:ctl.signal,cache:"no-store",credentials:"omit"});clearTimeout(tm);
    const d=r.ok?await r.json():null;
    if(d&&d.app==="lagna"){G.on=true;G.health=d;
      if(ADMIN){api("GET","/api/admin/me").then(x=>{if(!x.admin)setAdmin("");render();}).catch(()=>{});}
      G.landing=false;if(!location.hash){location.replace("#"+landingRoute());return;}
      route=readHash();render();gRoute();return;}
  }catch(e){}
  G.failed=true;G.landing=false;render();
})();

/* ---------- routing hooks ---------- */
// Where the app opens on the home server: straight into your group if you have
// exactly one, otherwise the group list.
function landingRoute(){const ids=Object.keys(MY).filter(k=>ID_RE.test(k));return ids.length===1?"g-"+ids[0]:"groups";}
function gRoute(){
  stopPoll();G.confirm=null;
  if(!G.on)return;
  if(route.startsWith("g-")){const id=route.slice(2);if(!G.cur||G.cur.gid!==id)G.cur={gid:id,data:null,tab:"items",filter:"all",edit:null,err:null};loadGroup();}
  else G.cur=null;
  if(route.startsWith("j-")){const code=route.slice(2);G.join={code,data:null,err:null};preview(code);}
  if(route==="groups"&&ADMIN)loadAdminGroups();
}
async function loadAdminGroups(){try{G.adminGroups=(await api("GET","/api/admin/groups")).groups;}catch(e){if(e.code==="admin_only")setAdmin("");G.adminGroups=null;}render();}
async function loadGroup(){
  const c=G.cur;if(!c)return;
  try{const d=await api("GET","/api/g/"+c.gid,undefined,c.gid);if(G.cur!==c)return;c.data=d;c.err=null;c.offline=false;
    if(MY[c.gid]){MY[c.gid].title=d.group.title;MY[c.gid].ritual=d.group.ritual;MY[c.gid].code=d.group.code;gSave(MY);}
    render();startPoll();}
  catch(e){if(G.cur!==c)return;
    if(e.code==="net"){c.offline=true;render();setTimeout(()=>{if(G.cur===c)loadGroup();},5000);return;}
    c.err=e.code;if((e.code==="not_member"||e.code==="no_group")&&MY[c.gid]){delete MY[c.gid];gSave(MY);}render();}
}
function stopPoll(){if(G.poll){G.poll.stop=true;G.poll=null;}}
function startPoll(){
  stopPoll();const c=G.cur;if(!c||!c.data)return;const p={stop:false};G.poll=p;
  (async()=>{
    while(!p.stop&&G.cur===c){
      try{const w=await api("GET","/api/g/"+c.gid+"/wait?rev="+c.data.group.rev,undefined,c.gid);
        if(p.stop)return;
        if(w.rev===-1){c.err="no_group";render();return;}
        if(w.rev!==c.data.group.rev){await refresh();}
        if(c.offline){c.offline=false;render();}
      }catch(e){if(p.stop)return;if(e.code==="not_member"||e.code==="no_group"){c.err=e.code;render();return;}
        c.offline=e.code==="net";render();await new Promise(r=>setTimeout(r,4000));}
    }
  })();
}
async function refresh(){const c=G.cur;if(!c)return;try{const d=await api("GET","/api/g/"+c.gid,undefined,c.gid);if(G.cur===c){c.data=d;render();}}catch(e){}}
async function preview(code){
  const j=G.join;
  try{const d=await api("POST","/api/join",{code});if(G.join!==j)return;
    j.data=d;if(MY[d.group.id]){go("g-"+d.group.id);return;}}
  catch(e){if(G.join!==j)return;j.err=e.code;}
  render();
}
async function op(body,admin){
  const c=G.cur;if(!c)return false;
  try{await api("POST","/api/g/"+c.gid+(admin?"/admin":"/op"),body,c.gid);await refresh();return true;}
  catch(e){toast(errText(e.code));if(e.code==="not_member"){c.err=e.code;render();}return false;}
}

/* ---------- small view helpers ---------- */
function memberName(id){const d=G.cur&&G.cur.data;if(!id)return t("gAdminName");const m=d&&d.members.find(x=>x.id===id);return m?m.name:t("gSomeone");}
const txt=(r)=>r.i18n&&r.i18n[L()]?r.i18n[L()]:r.text||r.name;
function ago(ms){const s=(Date.now()-ms)/1000;if(s<60)return t("gJust");if(s<3600)return t("gMin",{n:n(Math.floor(s/60))});if(s<86400)return t("gHr",{n:n(Math.floor(s/3600))});const d=new Date(ms);return n(d.getDate()+"/"+(d.getMonth()+1));}
function ritualOf(id){return RITUALS.find(r=>r.id===id);}
function daysText(date){if(!date)return"";const d=new Date(date+"T00:00:00");if(isNaN(d))return"";const now=new Date();now.setHours(0,0,0,0);const k=Math.round((d-now)/86400000);return k>0?t("daysLeft",{n:n(k)}):k===0?t("today"):t("past");}
function ritualOptions(sel){return RITUALS.map(r=>'<option value="'+esc(r.id)+'"'+(r.id===sel?" selected":"")+'>'+esc(tx(r.name))+'</option>').join("");}
const canPurge=()=>{const d=G.cur&&G.cur.data;return !!(d&&(d.me.admin||d.me.owner));};
function confirmBox(key,q,yesAttrs){
  return '<div class="confirm"><b>'+esc(q)+'</b><div class="row"><button type="button" class="btn" '+yesAttrs+'>'+esc(t("yes"))+'</button><button type="button" class="btn ghost" data-gconf-no>'+esc(t("no"))+'</button></div></div>';
}

/* ---------- views ---------- */
function viewGroups(){
  let h='<section class="hello"><h1>'+esc(t("gTitle"))+'</h1><p>'+esc(t("gIntro"))+'</p>';
  h+='<form class="joinf" data-gjoin><label class="label" for="g-code">'+esc(t("gCode"))+'</label><div class="add"><input id="g-code" class="codein" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="14" placeholder="'+esc(t("gCodePh"))+'"><button class="btn" type="submit">'+esc(t("gJoin"))+'</button></div></form></section>';
  const mine=Object.entries(MY);
  h+='<h2 class="sec-title">'+esc(t("gMine"))+'</h2>';
  if(!mine.length)h+='<p class="empty">'+esc(t("gNone"))+'</p>';
  else h+='<ul class="glist">'+mine.map(([id,g])=>{const r=ritualOf(g.ritual);return '<li><button type="button" class="rit" data-gopen="'+esc(id)+'"><span class="ic">'+ic(r?r.icon:"lamp")+'</span><span class="tx"><span class="nm">'+esc(g.title||"")+'</span><span class="sh">'+esc(r?tx(r.name):"")+'</span></span><span class="chev" aria-hidden="true">›</span></button></li>';}).join("")+'</ul>';
  if(ADMIN||(G.health&&G.health.openCreate))h+=createForm();
  if(ADMIN&&G.adminGroups&&G.adminGroups.length){
    h+='<h2 class="sec-title">'+esc(t("gAllGroups"))+'<span>'+n(G.adminGroups.length)+'</span></h2><ul class="glist">'+G.adminGroups.map(g=>{const r=ritualOf(g.ritual);
      return '<li><button type="button" class="rit" data-gopen="'+esc(g.id)+'"><span class="ic">'+ic(r?r.icon:"lamp")+'</span><span class="tx"><span class="nm">'+esc(g.title)+'</span><span class="sh">'+esc(fmtCode(g.code))+' · '+esc(t("gMembersN",{n:n(g.members)}))+'</span></span><span class="chev" aria-hidden="true">›</span></button></li>';}).join("")+'</ul>';
  }
  return h;
}
function createForm(){
  return '<section class="card"><h2 style="font-size:1.15rem">'+esc(t("gCreate"))+'</h2><p class="hint">'+esc(t("gCreateHint"))+'</p><form class="stack" data-gcreate>'+
    '<label class="label" for="gc-title">'+esc(t("gName"))+'</label><input class="inp" id="gc-title" maxlength="80" required placeholder="'+esc(t("gNamePh"))+'">'+
    '<label class="label" for="gc-ritual">'+esc(t("gRitual"))+'</label><select class="inp" id="gc-ritual">'+ritualOptions("sagai")+'</select>'+
    '<label class="label" for="gc-date">'+esc(t("date"))+'</label><input class="inp" type="date" id="gc-date">'+
    '<label class="label" for="gc-side">'+esc(t("gSide"))+'</label><select class="inp" id="gc-side"><option value="all">'+esc(t("hostBoth"))+'</option><option value="b">'+esc(t("tagB"))+'</option><option value="g">'+esc(t("tagG"))+'</option></select>'+
    '<label class="label" for="gc-name">'+esc(t("gYou"))+'</label><input class="inp" id="gc-name" maxlength="60" required placeholder="'+esc(t("gYouPh"))+'">'+
    '<button class="btn" type="submit">'+esc(t("gMake"))+'</button></form></section>';
}
function viewJoin(){
  const j=G.join;let h='<button type="button" class="back" data-go="groups">'+ic("back").replace('aria-hidden','style="width:20px;height:20px" aria-hidden')+esc(t("back"))+'</button>';
  if(!j||(!j.data&&!j.err))return h+'<p class="empty">'+esc(t("gLoading"))+'</p>';
  if(j.err)return h+'<section class="card"><p style="margin:0">'+esc(errText(j.err))+'</p><button type="button" class="btn" data-go="groups">'+esc(t("gCode"))+'</button></section>';
  const g=j.data.group,r=ritualOf(g.ritual);
  h+='<div class="rhead"><span class="ic">'+ic(r?r.icon:"lamp")+'</span><div><h1>'+esc(g.title)+'</h1><p>'+esc(r?tx(r.name):"")+(g.date?' · '+esc(daysText(g.date)):'')+'</p></div></div>';
  h+='<section class="card"><h2 style="font-size:1.15rem">'+esc(t("gWho"))+'</h2><p class="hint">'+esc(t("gWhoHint"))+'</p><div class="whos">'+
    j.data.members.map(m=>'<button type="button" class="btn ghost" data-gclaim="'+esc(m.id)+'">'+ic("user")+esc(t("gIam",{name:m.name}))+'</button>').join("")+'</div>'+
    '<form class="stack" data-gnewme><label class="label" for="gj-name">'+esc(t("gNew"))+'</label><div class="add"><input id="gj-name" maxlength="60" placeholder="'+esc(t("gYouPh"))+'" autocomplete="given-name"><button class="btn" type="submit">'+esc(t("gJoin"))+'</button></div></form></section>';
  return h;
}
function viewGroup(){
  const c=G.cur;let h='<button type="button" class="back" data-go="groups">'+ic("back").replace('aria-hidden','style="width:20px;height:20px" aria-hidden')+esc(t("navGroups"))+'</button>';
  if(!c)return h;
  if(c.err)return h+'<section class="card"><p style="margin:0">'+esc(errText(c.err))+'</p><button type="button" class="btn" data-go="groups">'+esc(t("gCode"))+'</button></section>';
  if(!c.data)return h+'<p class="empty">'+esc(c.offline?t("gOffline"):t("gLoading"))+'</p>';
  const d=c.data,g=d.group,r=ritualOf(g.ritual);
  const live=d.members.filter(m=>!m.removed);
  h+='<section class="ghead"><div class="rhead"><span class="ic">'+ic(r?r.icon:"lamp")+'</span><div style="min-width:0"><h1>'+esc(g.title)+'</h1><p>'+esc(r?tx(r.name):"")+(g.date?' · <b>'+esc(daysText(g.date))+'</b>':'')+'</p></div></div>';
  h+='<div class="avatars" aria-label="'+esc(t("gMembers"))+'">'+live.slice(0,8).map(m=>'<span class="av'+(m.id===d.me.memberId?" me":"")+'" title="'+esc(m.name)+'">'+esc(Array.from(m.name)[0]||"?")+'</span>').join("")+(live.length>8?'<span class="av more">+'+n(live.length-8)+'</span>':'')+'<span class="hint">'+esc(t("gMembersN",{n:n(live.length)}))+'</span></div>';
  const link=location.origin+location.pathname+"#j-"+g.code;
  const inv=t("gInviteText",{title:g.title,code:fmtCode(g.code),link});
  h+='<div class="codebox"><span class="label">'+esc(t("gCode"))+'</span><span class="code" translate="no">'+esc(fmtCode(g.code))+'</span></div>';
  h+='<div class="actions"><a class="btn wa" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text='+encodeURIComponent(inv)+'">'+ic("wa")+esc(t("gInvite"))+'</a><button type="button" class="btn ghost" data-gcopy="'+esc(fmtCode(g.code))+'">'+ic("copy")+esc(t("gCopyCode"))+'</button></div>';
  h+='<p class="live'+(c.offline?" off":"")+'">'+esc(c.offline?t("gOffline"):t("gLive"))+'</p></section>';

  const cnt=(kind)=>{const secs=new Set(d.sections.filter(s=>s.kind===kind&&!s.deleted_at).map(s=>s.id));const es=d.entries.filter(e=>secs.has(e.section_id)&&!e.deleted_at);return{d:es.filter(e=>e.done_at).length,a:es.length};};
  const ci=cnt("item"),ct=cnt("todo"),stN=d.steps.filter(s=>!s.deleted_at).length;
  const tabs=[["items","tabItems",n(ci.d)+" / "+n(ci.a)],["todos","tabTodos",n(ct.d)+" / "+n(ct.a)],["steps","tabSteps",n(stN)],["group","gTabGroup",n(live.length)]];
  h+='<div class="tabs g4" role="tablist">'+tabs.map(x=>'<button type="button" role="tab" data-gtab="'+x[0]+'" aria-selected="'+(c.tab===x[0])+'">'+esc(t(x[1]))+'<small>'+x[2]+'</small></button>').join("")+'</div>';
  h+='<div class="view">';
  if(c.tab==="items"||c.tab==="todos")h+=viewLists(c.tab==="items"?"item":"todo");
  else if(c.tab==="steps")h+=viewSteps();
  else h+=viewGroupInfo();
  h+='</div>';
  if(c.edit)h+=sheet();
  return h;
}
function rowActions(kind,id,deleted){
  if(deleted){
    let a='<button type="button" class="mini" data-grestore="'+kind+':'+esc(id)+'">'+ic("undo")+esc(t("gRestore"))+'</button>';
    if(canPurge())a+=G.confirm===kind+":"+id?confirmBox(kind+":"+id,t("gPurgeQ"),'data-gpurge-yes="'+kind+':'+esc(id)+'"'):'<button type="button" class="mini danger2" data-gpurge="'+kind+':'+esc(id)+'">'+ic("trash")+esc(t("gPurge"))+'</button>';
    return '<div class="rowact">'+a+'</div>';
  }
  return "";
}
function viewLists(kind){
  const c=G.cur,d=c.data,me=d.me.memberId;
  const secs=d.sections.filter(s=>s.kind===kind);
  let h='<div class="filters" role="group">'+[["all","gAll"],["left","gLeft"],["mine","gMineF"]].map(x=>'<button type="button" data-gfilter="'+x[0]+'" aria-pressed="'+(c.filter===x[0])+'">'+esc(t(x[1]))+'</button>').join("")+'</div>';
  const live=d.entries.filter(e=>!e.deleted_at&&secs.some(s=>s.id===e.section_id&&!s.deleted_at));
  const tot=live.reduce((a,e)=>a+(e.amount||0),0);
  if(tot){const dn=live.filter(e=>e.done_at).reduce((a,e)=>a+(e.amount||0),0);h+='<div class="totals"><span>'+esc(t("gTotal"))+' <b>'+rupee(tot)+'</b></span><span>'+esc(t("gPaid"))+' <b>'+rupee(dn)+'</b></span></div>';}
  secs.forEach(s=>{
    const es=d.entries.filter(e=>e.section_id===s.id);
    if(s.deleted_at){
      h+='<section class="gsec gone"><div class="ghd"><h3>'+esc(txt(s))+'</h3><span class="chip">'+esc(t("gDeletedBy",{name:memberName(s.deleted_by)}))+'</span></div>'+rowActions("sec",s.id,true)+'</section>';return;}
    const vis=es.filter(e=>c.filter==="all"||(c.filter==="left"&&!e.done_at&&!e.deleted_at)||(c.filter==="mine"&&e.assignee&&e.assignee===me));
    const liveN=es.filter(e=>!e.deleted_at),doneN=liveN.filter(e=>e.done_at).length;
    h+='<section class="gsec"><div class="ghd"><h3>'+esc(txt(s))+'</h3><span class="pct">'+n(doneN)+' / '+n(liveN.length)+'</span>'+
      '<button type="button" class="icb" data-gedit="sec:'+esc(s.id)+'">'+icS("pencil",t("gEdit"))+'</button><button type="button" class="icb" data-gdel="sec:'+esc(s.id)+'">'+icS("trash",t("gDelete"))+'</button></div>';
    h+='<ul class="checks">'+vis.map(e=>entryRow(e)).join("")+'</ul>';
    h+='<form class="add" data-gadd="'+esc(s.id)+'"><label class="sr" for="ga-'+esc(s.id)+'">'+esc(t("gAddPh"))+'</label><input id="ga-'+esc(s.id)+'" maxlength="200" placeholder="'+esc(t("gAddPh"))+'" autocomplete="off"><button class="btn" type="submit">'+esc(t("add"))+'</button></form></section>';
  });
  h+='<form class="add newsec" data-gaddsec="'+kind+'"><label class="sr" for="gs-new-'+kind+'">'+esc(t("gAddSecPh"))+'</label><input id="gs-new-'+kind+'" maxlength="60" placeholder="'+esc(t("gAddSecPh"))+'" autocomplete="off"><button class="btn ghost" type="submit">'+esc(t("gAddSec"))+'</button></form>';
  return h;
}
function entryRow(e){
  const meta=[];
  if(e.assignee)meta.push('<span class="who">'+ic("user")+esc(memberName(e.assignee))+'</span>');
  if(e.amount)meta.push('<span class="amt">'+rupee(e.amount)+'</span>');
  if(e.side)meta.push(tagChip(e.side));
  if(e.done_at)meta.push('<span class="by">'+esc(t("gDoneBy",{name:memberName(e.done_by)}))+'</span>');
  if(e.deleted_at){
    return '<li class="gdel"><div class="ck gone"><span class="t"><span class="tt">'+esc(txt(e))+'</span><span class="meta"><span class="by">'+esc(t("gDeletedBy",{name:memberName(e.deleted_by)}))+' · '+esc(ago(e.deleted_at))+'</span></span></span></div>'+rowActions("ent",e.id,true)+'</li>';
  }
  return '<li><div class="ck'+(e.done_at?" on":"")+'"><label class="tick"><input type="checkbox" data-gck="'+esc(e.id)+'"'+(e.done_at?" checked":"")+'><span class="box">'+ic("check")+'</span><span class="sr">'+esc(txt(e))+'</span></label>'+
    '<button type="button" class="t tbtn" data-gedit="ent:'+esc(e.id)+'"><span class="tt">'+esc(txt(e))+'</span>'+(meta.length?'<span class="meta">'+meta.join("")+'</span>':'')+'</button></div></li>';
}
function viewSteps(){
  const d=G.cur.data;let i=0;
  let h='<ol class="gsteps">'+d.steps.map(s=>{
    if(s.deleted_at)return '<li class="gdel"><div class="stp gone"><span class="no">–</span><span class="tt">'+esc(txt(s))+'</span></div><div class="meta"><span class="by">'+esc(t("gDeletedBy",{name:memberName(s.deleted_by)}))+'</span></div>'+rowActions("stp",s.id,true)+'</li>';
    i++;
    return '<li><div class="stp"><span class="no">'+n(i)+'</span><button type="button" class="tt tbtn" data-gedit="stp:'+esc(s.id)+'">'+esc(txt(s))+'</button>'+
      '<span class="mv"><button type="button" class="icb" data-gmove="'+esc(s.id)+':-1">'+icS("up","↑")+'</button><button type="button" class="icb" data-gmove="'+esc(s.id)+':1">'+icS("down","↓")+'</button></span></div></li>';
  }).join("")+'</ol>';
  h+='<form class="add" data-gaddstep><label class="sr" for="gst-new">'+esc(t("gAddStepPh"))+'</label><input id="gst-new" maxlength="200" placeholder="'+esc(t("gAddStepPh"))+'" autocomplete="off"><button class="btn" type="submit">'+esc(t("add"))+'</button></form>';
  const r=ritualOf(d.group.ritual);
  if(r&&r.tip)h+='<aside class="tip"><b>'+esc(t("tip"))+'</b><span>'+esc(tx(r.tip))+'</span></aside>';
  return h;
}
function viewGroupInfo(){
  const d=G.cur.data,g=d.group;
  let h='<section class="card"><h2 style="font-size:1.1rem">'+esc(t("gActivity"))+'</h2>';
  h+=d.activity.length?'<ul class="acts">'+d.activity.slice(0,40).map(a=>'<li><b>'+esc(a.via||memberName(a.member_id))+'</b> '+esc(ACT[a.action]?tx(ACT[a.action]):a.action)+(a.detail&&a.action!=="purgeAll"?' <span class="q">“'+esc(a.detail)+'”</span>':'')+'<time>'+esc(ago(a.at))+'</time></li>').join("")+'</ul>':'<p class="hint">'+esc(t("gNoActivity"))+'</p>';
  h+='</section>';
  h+='<section class="card"><h2 style="font-size:1.1rem">'+esc(t("gMembers"))+'</h2><ul class="mems">'+d.members.filter(m=>!m.removed).map(m=>'<li><span class="av'+(m.id===d.me.memberId?" me":"")+'">'+esc(Array.from(m.name)[0]||"?")+'</span><span class="nm">'+esc(m.name)+'</span>'+
    (canPurge()&&m.id!==d.me.memberId?(G.confirm==="mem:"+m.id?confirmBox("mem:"+m.id,t("gRemove")+"?",'data-gremove-yes="'+esc(m.id)+'"'):'<button type="button" class="mini danger2" data-gremove="'+esc(m.id)+'">'+esc(t("gRemove"))+'</button>'):'')+'</li>').join("")+'</ul>'+
    '<form class="add" data-gaddmem><label class="sr" for="gm-new">'+esc(t("gAddMemPh"))+'</label><input id="gm-new" maxlength="60" placeholder="'+esc(t("gAddMemPh"))+'" autocomplete="off"><button class="btn ghost" type="submit">'+esc(t("gAddMem"))+'</button></form><p class="hint">'+esc(t("gAddMemHint"))+'</p></section>';
  h+='<section class="card"><h2 style="font-size:1.1rem">'+esc(t("gDetails"))+'</h2><form class="stack" data-ginfo>'+
    '<label class="label" for="gi-title">'+esc(t("gName"))+'</label><input class="inp" id="gi-title" maxlength="80" value="'+esc(g.title)+'">'+
    '<label class="label" for="gi-date">'+esc(t("date"))+'</label><input class="inp" type="date" id="gi-date" value="'+esc(g.date)+'">'+
    (d.me.memberId?'<label class="label" for="gi-me">'+esc(t("gMyName"))+'</label><input class="inp" id="gi-me" maxlength="60" value="'+esc(memberName(d.me.memberId))+'">':'')+
    '<button class="btn" type="submit">'+esc(t("gSave"))+'</button></form>';
  if(MY[G.cur.gid])h+=G.confirm==="leave"?confirmBox("leave",t("gLeaveQ"),'data-gleave-yes'):'<button type="button" class="danger" data-gleave>'+esc(t("gLeave"))+'</button>';
  h+='</section>';
  if(canPurge()){
    h+='<section class="card adminbox"><h2 style="font-size:1.1rem">'+ic("key").replace('aria-hidden','style="width:20px;height:20px;vertical-align:-3px" aria-hidden')+' '+esc(t("gAdminBox"))+'</h2>';
    h+=G.confirm==="rotate"?confirmBox("rotate",t("gRotate")+"?",'data-grotate-yes'):'<button type="button" class="btn ghost" data-grotate>'+esc(t("gRotate"))+'</button>';
    h+=G.confirm==="purgeall"?confirmBox("purgeall",t("gPurgeQ"),'data-gpurgeall-yes'):'<button type="button" class="btn ghost" data-gpurgeall>'+esc(t("gPurgeAll"))+'</button>';
    if(d.me.admin)h+='<form class="stack" data-gdelgroup><label class="label" for="gd-confirm">'+esc(t("gDelGroupQ"))+' <b>'+esc(g.title)+'</b></label><input class="inp" id="gd-confirm" maxlength="80" autocomplete="off"><button class="btn danger3" type="submit">'+esc(t("gDelGroup"))+'</button></form>';
    h+='</section>';
  }
  return h;
}
function sheet(){
  const c=G.cur,d=c.data,[type,id]=c.edit.split(":");
  let body="",title="";
  if(type==="ent"){const e=d.entries.find(x=>x.id===id);if(!e)return"";title=t("gEdit");
    body='<label class="label" for="ge-text">'+esc(t("gText"))+'</label><textarea class="inp" id="ge-text" maxlength="200" rows="3">'+esc(txt(e))+'</textarea>'+
      '<label class="label" for="ge-who">'+esc(t("gAssign"))+'</label><select class="inp" id="ge-who"><option value="">'+esc(t("gNobody"))+'</option>'+d.members.filter(m=>!m.removed).map(m=>'<option value="'+esc(m.id)+'"'+(m.id===e.assignee?" selected":"")+'>'+esc(m.name)+'</option>').join("")+'</select>'+
      '<label class="label" for="ge-amt">'+esc(t("gAmount"))+'</label><input class="inp" id="ge-amt" inputmode="numeric" pattern="[0-9]*" maxlength="10" value="'+(e.amount==null?"":esc(String(e.amount)))+'">';}
  else if(type==="sec"){const s=d.sections.find(x=>x.id===id);if(!s)return"";title=t("gSecName");
    body='<label class="label" for="ge-text">'+esc(t("gSecName"))+'</label><input class="inp" id="ge-text" maxlength="60" value="'+esc(txt(s))+'">';}
  else if(type==="stp"){const s=d.steps.find(x=>x.id===id);if(!s)return"";title=t("gStepText");
    body='<label class="label" for="ge-text">'+esc(t("gStepText"))+'</label><textarea class="inp" id="ge-text" maxlength="200" rows="3">'+esc(txt(s))+'</textarea>';}
  return '<div class="scrim" data-gclose></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h"><h2 id="sheet-h">'+esc(title)+'</h2><form class="stack" data-gsave="'+esc(c.edit)+'">'+body+
    '<div class="row2"><button class="btn" type="submit">'+esc(t("gSave"))+'</button><button class="btn ghost" type="button" data-gclose>'+esc(t("gCancel"))+'</button></div>'+
    (type!=="sec"?'<button type="button" class="danger" data-gdel="'+esc(c.edit)+'">'+esc(t("gDelete"))+'</button>':'')+'</form></div>';
}
function adminCard(){
  if(!G.on)return"";
  let h='<section class="card"><h2 style="font-size:1.15rem">'+esc(t("gAdminLogin"))+'</h2><p class="hint">'+esc(t("gAdminHint"))+'</p>';
  if(ADMIN)h+='<p style="margin:0">'+esc(t("gAdminOn"))+'</p><button type="button" class="btn ghost" data-glogout>'+esc(t("gLogout"))+'</button>';
  if(ADMIN){h+='</section>'+mcpCard();return h;}
  else h+='<form class="add" data-glogin><label class="sr" for="g-pass">'+esc(t("gPassword"))+'</label><input id="g-pass" type="password" autocomplete="current-password" placeholder="'+esc(t("gPassword"))+'" maxlength="200"><button class="btn" type="submit">'+esc(t("gLogin"))+'</button></form>';
  return h+'</section>';
}

/* ---------- MCP tokens (admin) ---------- */
const MC={list:null,made:null,loading:false};
async function mcpLoad(){if(MC.loading)return;MC.loading=true;try{MC.list=await api("GET","/api/admin/mcp");}catch(e){MC.list={error:e.code};}MC.loading=false;render();}
function mcpCard(){
  if(!MC.list&&!MC.loading)setTimeout(mcpLoad,0);
  const url=((MC.list&&MC.list.publicUrl)||location.origin)+"/mcp";
  let h='<section class="card"><h2 style="font-size:1.15rem">'+esc(t("mTitle"))+'</h2><p class="hint">'+esc(t("mHint"))+'</p>';
  h+='<div class="label">'+esc(t("mConnector"))+'</div><div class="codebox"><span class="code mono" translate="no">'+esc(url)+'</span><button type="button" class="mini" data-gcopy="'+esc(url)+'">'+ic("copy")+esc(t("mCopy"))+'</button></div><p class="hint">'+esc(t("mConnHint"))+'</p>';
  if(MC.made){
    const cmd='claude mcp add --transport http --scope user leuva-lagna '+url+' --header "Authorization: Bearer '+MC.made+'"';
    h+='<div class="made"><b>'+esc(t("mOnce"))+'</b><pre class="mono" translate="no">'+esc(MC.made)+'</pre><button type="button" class="mini" data-gcopy="'+esc(MC.made)+'">'+ic("copy")+esc(t("mCopy"))+'</button>'+
      '<b>'+esc(t("mCmd"))+'</b><pre class="mono" translate="no">'+esc(cmd)+'</pre><button type="button" class="mini" data-gcopy="'+esc(cmd)+'">'+ic("copy")+esc(t("mCopy"))+'</button></div>';
  }
  h+='<form class="stack" data-gmcpnew><div class="label">'+esc(t("mNew"))+'</div>'+
    '<label class="label" for="mc-name">'+esc(t("mName"))+'</label><input class="inp" id="mc-name" maxlength="60" placeholder="Claude Code – laptop">'+
    '<label class="label" for="mc-access">'+esc(t("mAccess"))+'</label><select class="inp" id="mc-access"><option value="read">'+esc(t("mRead"))+'</option><option value="add" selected>'+esc(t("mAdd"))+'</option><option value="full">'+esc(t("mFull"))+'</option></select>'+
    '<label class="label" for="mc-days">'+esc(t("mDays"))+'</label><select class="inp" id="mc-days"><option value="30">'+esc(t("mD30"))+'</option><option value="90" selected>'+esc(t("mD90"))+'</option><option value="365">'+esc(t("mD365"))+'</option><option value="0">'+esc(t("mD0"))+'</option></select>'+
    '<button class="btn" type="submit">'+esc(t("mCreate"))+'</button></form>';
  h+='<div class="label">'+esc(t("mList"))+'</div>';
  const rows=MC.list&&MC.list.tokens||[];
  if(MC.list&&MC.list.error)h+='<p class="hint">'+esc(errText(MC.list.error))+'</p>';
  else if(!rows.length)h+='<p class="hint">'+esc(MC.list?t("mNone"):t("gLoading"))+'</p>';
  else h+='<ul class="mems">'+rows.map(r=>{const lvl={read:"mRead",add:"mAdd",full:"mFull"}[r.access];
    return '<li><span class="nm">'+esc(r.name)+'<span class="hint" style="display:block;font-weight:400">'+esc(t(r.kind==="oauth"?"mOauth":"mToken"))+' · '+esc(t(lvl))+' · '+esc(t("mUsed"))+': '+esc(r.last_used?ago(r.last_used):t("mNever"))+(r.expires_at?' · '+esc(t("mExp"))+' '+esc(new Date(r.expires_at).toLocaleDateString()):'')+'</span></span>'+
      (G.confirm==="mcp:"+r.id?confirmBox("mcp:"+r.id,t("mRevokeQ"),'data-gmcprevoke-yes="'+esc(r.id)+'"'):'<button type="button" class="mini danger2" data-gmcprevoke="'+esc(r.id)+'">'+esc(t("mRevoke"))+'</button>')+'</li>';}).join("")+'</ul>';
  return h+'</section>';
}

/* ---------- events ---------- */
const kindTable={ent:["delEntry","restoreEntry","purgeEntry"],sec:["delSection","restoreSection","purgeSection"],stp:["delStep","restoreStep","purgeStep"]};
function gClick(el,e){
  const d=el.dataset;
  if(d.gopen){if(ID_RE.test(d.gopen))go("g-"+d.gopen);return true;}
  if(d.gtab){G.cur.tab=d.gtab;G.confirm=null;render();return true;}
  if(d.gfilter){G.cur.filter=d.gfilter;render();return true;}
  if(d.gedit){G.cur.edit=d.gedit;render();const f=document.getElementById("ge-text");if(f)f.focus();return true;}
  if(d.gclose!==undefined){G.cur.edit=null;render();return true;}
  if(d.gdel){const [k,id]=d.gdel.split(":");G.cur.edit=null;op({op:kindTable[k][0],id}).then(ok=>ok&&toast(t("removed")));return true;}
  if(d.grestore){const [k,id]=d.grestore.split(":");op({op:kindTable[k][1],id});return true;}
  if(d.gpurge){G.confirm=d.gpurge;render();return true;}
  if(d.gpurgeYes){const [k,id]=d.gpurgeYes.split(":");G.confirm=null;op({op:kindTable[k][2],id},true);return true;}
  if(d.gconfNo!==undefined){G.confirm=null;render();return true;}
  if(d.gmove){const [id,dir]=d.gmove.split(":");op({op:"moveStep",id,dir:+dir});return true;}
  if(d.gremove){G.confirm="mem:"+d.gremove;render();return true;}
  if(d.gremoveYes){G.confirm=null;op({op:"removeMember",id:d.gremoveYes},true);return true;}
  if(d.grotate!==undefined){G.confirm="rotate";render();return true;}
  if(d.grotateYes!==undefined){G.confirm=null;op({op:"rotateCode"},true);return true;}
  if(d.gpurgeall!==undefined){G.confirm="purgeall";render();return true;}
  if(d.gpurgeallYes!==undefined){G.confirm=null;op({op:"purgeAllDeleted"},true);return true;}
  if(d.gleave!==undefined){G.confirm="leave";render();return true;}
  if(d.gleaveYes!==undefined){const gid=G.cur.gid;api("POST","/api/g/"+gid+"/leave",{},gid).catch(()=>{});delete MY[gid];gSave(MY);G.confirm=null;go("groups");return true;}
  if(d.gclaim){doJoin({memberId:d.gclaim});return true;}
  if(d.gcopy){const v=d.gcopy;try{navigator.clipboard.writeText(v).then(()=>toast(t("copied")),()=>toast(v));}catch(err){toast(v);}return true;}
  if(d.gmcprevoke){G.confirm="mcp:"+d.gmcprevoke;render();return true;}
  if(d.gmcprevokeYes){G.confirm=null;api("POST","/api/admin/mcp/revoke",{id:d.gmcprevokeYes}).then(()=>{MC.list=null;MC.made=null;mcpLoad();toast(t("removed"));}).catch(e=>toast(errText(e.code)));return true;}
  if(d.glogout!==undefined){MC.list=null;MC.made=null;api("POST","/api/admin/logout",{}).catch(()=>{});setAdmin("");G.adminGroups=null;render();return true;}
  return false;
}
async function doJoin(extra){
  const j=G.join;if(!j||!j.data)return;
  try{const r=await api("POST","/api/join",Object.assign({code:j.code},extra));
    MY[r.groupId]={token:r.token,memberId:r.memberId,title:j.data.group.title,ritual:j.data.group.ritual};gSave(MY);go("g-"+r.groupId);}
  catch(e){toast(errText(e.code));}
}
function val(id){const el=document.getElementById(id);return el?el.value.trim():"";}
function gSubmit(f){
  const d=f.dataset;
  if(d.gjoin!==undefined){const code=val("g-code").toUpperCase().replace(/[^A-Z0-9]/g,"");if(code.length<6){toast(t("e_wrong_code"));return true;}go("j-"+code);return true;}
  if(d.gnewme!==undefined){const nm=val("gj-name");if(!nm){toast(t("e_fields"));return true;}doJoin({name:nm});return true;}
  if(d.glogin!==undefined){const pw=document.getElementById("g-pass").value;
    api("POST","/api/admin/login",{password:pw}).then(r=>{setAdmin(r.token);toast(t("gAdminOn"));render();}).catch(e=>toast(errText(e.code)));return true;}
  if(d.gcreate!==undefined){
    const body={title:val("gc-title"),ritual:val("gc-ritual"),date:val("gc-date"),side:val("gc-side"),name:val("gc-name")};
    if(!body.title||!body.name){toast(t("e_fields"));return true;}
    api("POST","/api/groups",body).then(r=>{MY[r.groupId]={token:r.token,memberId:r.memberId,title:body.title,ritual:body.ritual,owner:r.ownerToken||undefined};gSave(MY);go("g-"+r.groupId);}).catch(e=>toast(errText(e.code)));return true;}
  if(d.gadd){const inp=f.querySelector("input");const v=inp.value.trim();if(!v)return true;op({op:"addEntry",sectionId:d.gadd,text:v}).then(ok=>{if(ok){toast(t("added"));const i=document.getElementById(inp.id);if(i){i.value="";i.focus();}}});inp.value="";return true;}
  if(d.gaddsec){const inp=f.querySelector("input");const v=inp.value.trim();if(!v)return true;inp.value="";op({op:"addSection",kind:d.gaddsec,name:v});return true;}
  if(d.gaddmem!==undefined){const inp=f.querySelector("input");const v=inp.value.trim();if(!v)return true;inp.value="";op({op:"addMember",name:v}).then(ok=>ok&&toast(t("added")));return true;}
  if(d.gaddstep!==undefined){const inp=f.querySelector("input");const v=inp.value.trim();if(!v)return true;inp.value="";op({op:"addStep",text:v});return true;}
  if(d.gsave){const [k,id]=d.gsave.split(":");const text=val("ge-text");
    let body;
    if(k==="ent"){const e=G.cur.data.entries.find(x=>x.id===id);const amtRaw=val("ge-amt").replace(/[^0-9]/g,"");
      body={op:"editEntry",id,assignee:val("ge-who")||null,amount:amtRaw===""?null:+amtRaw};if(e&&text!==txt(e))body.text=text;}
    else if(k==="sec"){const s=G.cur.data.sections.find(x=>x.id===id);if(s&&text===txt(s)){G.cur.edit=null;render();return true;}body={op:"editSection",id,name:text};}
    else {const s=G.cur.data.steps.find(x=>x.id===id);if(s&&text===txt(s)){G.cur.edit=null;render();return true;}body={op:"editStep",id,text};}
    op(body).then(ok=>{if(ok){G.cur.edit=null;render();toast(t("gSaved"));}});return true;}
  if(d.ginfo!==undefined){const g=G.cur.data.group;const title=val("gi-title"),date=val("gi-date"),me=val("gi-me");
    const jobs=[];if(title!==g.title||date!==g.date)jobs.push(op({op:"editGroup",title,date}));
    if(G.cur.data.me.memberId&&me&&me!==memberName(G.cur.data.me.memberId))jobs.push(op({op:"renameMe",name:me}));
    Promise.all(jobs).then(r=>{if(r.length&&r.every(Boolean))toast(t("gSaved"));});return true;}
  if(d.gmcpnew!==undefined){const body={name:val("mc-name")||"Claude Code",access:val("mc-access"),days:+val("mc-days")};
    api("POST","/api/admin/mcp",body).then(r=>{MC.made=r.token;MC.list=null;mcpLoad();}).catch(e=>toast(errText(e.code)));return true;}
  if(d.gdelgroup!==undefined){const gid=G.cur.gid;
    api("POST","/api/g/"+gid+"/admin",{op:"deleteGroup",confirm:val("gd-confirm")},gid).then(()=>{delete MY[gid];gSave(MY);toast(t("removed"));go("groups");}).catch(e=>toast(errText(e.code)));return true;}
  return false;
}
function gChange(el){
  if(el.dataset&&el.dataset.gck){const id=el.dataset.gck;el.closest(".ck").classList.toggle("on",el.checked);op({op:"toggle",id,done:el.checked});return true;}
  return false;
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&G.cur&&G.cur.edit){G.cur.edit=null;render();}});
