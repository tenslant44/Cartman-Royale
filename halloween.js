const $ = id => document.getElementById(id);
const END = Date.UTC(2026,10,11,5), START = Date.UTC(2026,9,10,19);
const prizes = [['momo','Momo Cartman',100],['mummy','Kenny Mummy',300],['dual','Draclustan',700],['nasty','Nightmare Kenny',1000],['sccary','Ghostface Kyle',5000],['skeleton','Skeleton',6500],['pumpman','Pumpman',8000],['catman','Cart in the Man',10000]];
let data; try { data = JSON.parse(localStorage.getItem('halloween2026') || '{}'); } catch { data = {}; }
if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
const initialCandy=Number(data.candy), initialBoost=Number(data.boostUntil);
const state = { candy: Number.isFinite(initialCandy)&&initialCandy>=0?Math.min(1000000000,initialCandy):50, boostUntil: Number.isFinite(initialBoost)&&initialBoost>0?Math.min(initialBoost,Date.now()+31536000000):0, delivered: Array.isArray(data.delivered)?data.delivered.filter(item=>typeof item==='string'&&item.length<=120).slice(0,100):[] };
const active = () => Date.now()>=START && Date.now()<END;
const save = () => { localStorage.setItem('halloween2026',JSON.stringify(state)); window.TenslantID?.markDirty(); };
function multiplier() {
  const now = new Date();
  const east = new Date(now.toLocaleString('en-US',{timeZone:'America/New_York'}));
  const day = east.getFullYear()*10000+(east.getMonth()+1)*100+east.getDate();
  const final = now>=Date.UTC(2026,10,1,4) && now<END;
  const double = (day*37+Math.floor(day/100)*13)%5===0;
  const early = east.getHours()>=3 && east.getHours()<7;
  const late = east.getDay()===5 && east.getHours()>=21;
  const minutes = east.getHours()*60+east.getMinutes();
  const lunch = minutes>=11*60+7 && minutes<12*60+18;
  const backHome = minutes>=14*60+45 && minutes<15*60+30;
  const halloweenNight = east.getMonth()===9 && east.getDate()===31 && east.getHours()>=19 && east.getHours()<22;
  const paid = state.boostUntil>Date.now();
  return {value:(final?5:double?2:1)*(early?2.5:1)*(late?3:1)*(lunch?1.7:1)*(backHome?2:1)*(halloweenNight?10:1)*(paid?2:1),final,double,early,late,lunch,backHome,halloweenNight,paid};
}
function render() {
  $('candyCount').textContent=state.candy.toLocaleString(); $('menuCandy').textContent=state.candy.toLocaleString();
  const m=multiplier();
  if(!active())$('boostInGame').hidden=true;
  $('boostInGame').textContent='🍬 '+state.candy.toLocaleString()+' Candy · x'+m.value+' '+[m.final?'Finale':m.double?'2x day':'',m.early?'Early bird':'',m.late?'Friday night':'',m.lunch?'Lunch hour':'',m.backHome?'Back home':'',m.halloweenNight?'Halloween Night':'',m.paid?'Shop boost':''].filter(Boolean).join(' + ');
  $('boostStatus').textContent=active()?'Today x'+m.value+' Candy · '+[m.final?'Final ten days x5':m.double?'Surprise 2x day':'',m.early?'Early bird x2.5 (3–7 AM ET)':'',m.late?'Friday night x3 (9 PM–midnight ET)':'',m.lunch?'Lunch hour x1.7 (11:07 AM–12:18 PM ET)':'',m.backHome?'Back home x2 (2:45–3:30 PM ET)':'',m.halloweenNight?'HALLOWEEN NIGHT x10 (Oct 31 · 7–10 PM ET)':'',m.paid?'Shop boost x2 · '+Math.ceil((state.boostUntil-Date.now())/60000)+' min':''].filter(Boolean).join(' · '):'The event has ended. Earned skins remain yours.';
  $('eventTime').textContent=active()?'ENDS NOV 10 · 11:59 PM ET':'EVENT ENDED';
  const eastern=new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}));
  const year=eastern.getFullYear(), month=eastern.getMonth(), day=eastern.getDate(), hour=eastern.getHours();
  const nextDouble=[];
  for(let offset=0;offset<24 && nextDouble.length<3;offset++){
    const date=new Date(Date.UTC(year,month,day+offset));
    const key=date.getUTCFullYear()*10000+(date.getUTCMonth()+1)*100+date.getUTCDate();
    if(date.getTime()>=END || date.getTime()>=Date.UTC(2026,10,1))break;
    if((key*37+Math.floor(key/100)*13)%5===0)nextDouble.push(date.toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric'}));
  }
  let daysToFriday=(5-eastern.getDay()+7)%7;
  if(daysToFriday===0 && hour>=21)daysToFriday=7;
  const fridayDay=new Date(Date.UTC(year,month,day+daysToFriday));
  const friday=fridayDay.getTime()<END?fridayDay.toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric'}):null;
  const nextEarly=new Date(Date.UTC(year,month,day+(hour>=7?1:0)));
  const earlyDate=nextEarly.getTime()<END?nextEarly.toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric'}):null;
  const lunchActive=m.lunch?'ACTIVE NOW · until 12:18 PM ET':'Daily · 11:07 AM–12:18 PM ET';
  const backHomeActive=m.backHome?'ACTIVE NOW · until 3:30 PM ET':'Daily · 2:45–3:30 PM ET';
  const schedule=[
    ['Surprise 2x day',m.final?'Replaced by final x5':m.double?'ACTIVE NOW':nextDouble.length?'Next: '+nextDouble.join(', ')+' (all day ET)':'No more before the finale'],
    ['Early bird x2.5',m.early?'ACTIVE NOW · until 7 AM ET':earlyDate?'Next: '+earlyDate+' · 3–7 AM ET':'No more before the event ends'],
    ['Lunch hour x1.7',lunchActive],
    ['Back home x2',backHomeActive],
    ['Friday night x3',m.late?'ACTIVE NOW · until midnight ET':friday?'Next: '+friday+' · 9 PM–midnight ET':'No more before the event ends'],
    ['Halloween Night x10',m.halloweenNight?'ACTIVE NOW · until 10 PM ET':Date.now()<Date.UTC(2026,9,31,23)?'Oct 31 · 7–10 PM ET':'Event window passed'],
    ['Final ten days x5',m.final?'ACTIVE NOW · through Nov 10':'Nov 1–10 · all day ET'],
    ['Shop boost x2',m.paid?'ACTIVE NOW · '+Math.ceil((state.boostUntil-Date.now())/60000)+' min left':'Inactive · buy 5 minutes in the Candy shop']
  ];
  if(!active())schedule.forEach(row=>row[1]='Event ended');
  const scheduleEl=$('boostSchedule');scheduleEl.replaceChildren();
  for(const [label,when] of schedule){const row=document.createElement('div');row.className='boostRow'+(when.startsWith('ACTIVE')?' isActive':'');const name=document.createElement('strong');name.textContent=label;const detail=document.createElement('span');detail.textContent=when;row.append(name,detail);scheduleEl.append(row);}
  const formula=document.createElement('p');formula.className='boostFormula';formula.textContent='Gameplay Candy multipliers stack: '+(m.final?'5':'1')+' finale × '+(!m.final&&m.double?'2':'1')+' surprise × '+(m.early?'2.5':'1')+' early bird × '+(m.lunch?'1.7':'1')+' lunch × '+(m.backHome?'2':'1')+' back home × '+(m.late?'3':'1')+' Friday night × '+(m.halloweenNight?'10':'1')+' Halloween Night × '+(m.paid?'2':'1')+' shop = x'+m.value+'. Shop Candy purchases are not boosted.';scheduleEl.append(formula);
  const track=$('passTrack'); track.replaceChildren();
  prizes.forEach(([id,name,price],i)=>{
    const card=document.createElement('article'); card.className='passCard'+(state.candy>=price||state.delivered.includes('set')?' unlocked':'');
    const top=document.createElement('small'); top.textContent=(i===prizes.length-1?'GRAND PRIZE':'TIER '+(i+1))+' · '+price.toLocaleString()+' CANDY';
    const icon=document.createElement('div'); icon.className='passIcon'; icon.textContent=['🎃','🧻','🦇','🌑','👻','💀','🎃','🎩'][i];
    const title=document.createElement('h3'); title.textContent=name;
    const meter=document.createElement('div'); meter.className='passMeter'; const fill=document.createElement('span'); fill.style.width=Math.min(100,state.candy/price*100)+'%'; meter.append(fill);
    const note=document.createElement('small'); note.textContent=card.classList.contains('unlocked')?'Unlocked · Equip in Skins Shop':(price-state.candy).toLocaleString()+' Candy to go';
    card.append(top,icon,title,meter,note); track.append(card);
  });
}
async function syncRewards(){if(window.HalloweenGame) for(const [id,,price] of prizes) if(state.candy>=price||state.delivered.includes('set')) await window.HalloweenGame.unlock(id);}
function earn(amount, approved=false){if((!active()&&!approved)||!Number.isFinite(amount)||amount<=0)return;state.candy=Math.round((state.candy+amount*multiplier().value)*100)/100;save();render();syncRewards();}
window.Halloween={active,syncRewards,startRound(){},setPlaying(playing){$('boostInGame').hidden=!playing||!active();render();},award(type){earn({hit:1,kill:1.5,win:10,treatHit:3,treatKill:10,treatWin:50}[type]);},exportSave(){return {candy:state.candy,boostUntil:state.boostUntil,delivered:[...state.delivered]};},validateSave(value){return Boolean(value&&typeof value==='object'&&!Array.isArray(value)&&Number.isFinite(value.candy)&&value.candy>=0&&value.candy<=1000000000&&Number.isFinite(value.boostUntil)&&value.boostUntil>=0&&value.boostUntil<=Date.now()+31536000000&&Array.isArray(value.delivered)&&value.delivered.length<=100&&value.delivered.every(item=>typeof item==='string'&&item.length<=120));},restoreSave(value){if(!this.validateSave(value))throw new Error('Invalid Halloween save.');state.candy=value.candy;state.boostUntil=value.boostUntil;state.delivered=[...new Set(value.delivered)];save();render();syncRewards();}};
$('halloweenOpen').onclick=()=>{$('halloweenPanel').hidden=false;$('halloweenCountdown').style.display='none';render();};
$('halloweenClose').onclick=()=>{$('halloweenPanel').hidden=true;$('halloweenCountdown').style.display='';};
document.querySelectorAll('.eventTabs button').forEach(button=>button.onclick=()=>{document.querySelectorAll('.eventTabs button').forEach(b=>b.classList.toggle('selected',b===button));for(const [tab,page] of [['pass','eventPass'],['shop','eventShop'],['treat','eventTreat']])$(page).hidden=button.dataset.tab!==tab;});
const notice=text=>$('purchaseMessage').textContent=text;
const grid=$('eventOffers');
for(const [label,cost,action] of [['100 Candy',10,()=>earn(100/multiplier().value)],['2x for 5 minutes',25,()=>{state.boostUntil=Math.max(Date.now(),state.boostUntil)+300000;save();render();}]]){
  const b=document.createElement('button');b.className='offer diamondOffer';b.textContent=label+' · '+cost+' diamonds · instant';b.onclick=async()=>{if(!active())return notice('Event ended.');if(!window.HalloweenGame||window.HalloweenGame.getDiamonds()<cost)return notice('Not enough diamonds.');b.disabled=true;try{if(await window.HalloweenGame.spendDiamonds(cost)){action();notice('Purchase complete.');}else notice('Purchase failed; nothing granted.');}finally{b.disabled=false;}};grid.append(b);
}
const msg=document.createElement('p');msg.id='purchaseMessage';msg.className='eventNotice';grid.after(msg);
$('startTreat').onclick=()=>{if(!active()||!window.HalloweenGame?.startTrick)return;$('halloweenPanel').hidden=true;window.HalloweenGame.startTrick();};

const saveStatus=$('saveStatus');
function noticeSave(text){if(saveStatus)saveStatus.textContent=text;}
const saveKeyHex='c5e4df01b0bbe1691ea98ea91ab7da2df3e9d873f6d73b0517db8cdfbeaba6ce';
const saveAad=new TextEncoder().encode('cartman-royale-save-v1');
let saveCryptoKeyPromise;
function saveBytes(value){return new TextEncoder().encode(value);}
function bytesToBase64(bytes){
  let binary='';
  for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(binary);
}
function base64ToBytes(value){return Uint8Array.from(atob(value),character=>character.charCodeAt(0));}
function getSaveCryptoKey(){
  if(!saveCryptoKeyPromise){
    const raw=Uint8Array.from(saveKeyHex.match(/../g),byte=>parseInt(byte,16));
    saveCryptoKeyPromise=crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
  }
  return saveCryptoKeyPromise;
}
const gameSaveKeys=[
  'graphicsQuality','rendererMode','graphicsShadows','graphicsFog','graphicsAA',
  'graphicsParticles','graphicsMaxEnemies','graphicsShadowMap','graphicsRenderDist',
  'selectedSkin','ownedSkins','currencyCredits','currencyDiamonds',
  'halloween2026'
];
const gameSaveKeySet=new Set(gameSaveKeys);
$('downloadSave').addEventListener('click',async()=>{
  const button=$('downloadSave');button.disabled=true;noticeSave('Preparing your full game save…');
  try{
    const storage={};
    for(const key of gameSaveKeys){
      const value=localStorage.getItem(key);if(value!==null)storage[key]=value;
    }
    const cookies={cartman_unlocked:document.cookie.split(';').some(cookie=>cookie.trim()==='cartman_unlocked=true')};
    const payload={format:'cartman-royale-save',version:4,createdAt:new Date().toISOString(),storage,cookies};
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:saveAad},await getSaveCryptoKey(),saveBytes(JSON.stringify(payload)));
    const envelope={format:'cartman-royale-encoded-save',version:1,cipher:'AES-256-GCM',iv:bytesToBase64(iv),data:bytesToBase64(new Uint8Array(encrypted))};
    const blob=new Blob([JSON.stringify(envelope)],{type:'application/octet-stream'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='cartman-royale-save-'+new Date().toISOString().slice(0,10)+'.crsave';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    noticeSave('Encoded save file downloaded. Upload it to Drive, then load it on another computer.');
  }catch(error){console.error('Save export failed:',error);noticeSave('Could not create the save file.');}
  finally{button.disabled=false;}
});
$('loadSave').addEventListener('click',()=>$('saveFile').click());
$('saveFile').addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(file.size>10*1024*1024){noticeSave('That save file is too large.');return;}
  const button=$('loadSave');button.disabled=true;noticeSave('Loading save…');
  try{
    const fileData=JSON.parse(await file.text());
    let payload=fileData;
    if(fileData?.format==='cartman-royale-encrypted-save')throw new Error('This older save is passphrase-encrypted. It needs its original passphrase; new saves do not.');
    if(fileData?.format==='cartman-royale-encoded-save'){
      if(fileData.version!==1||fileData.cipher!=='AES-256-GCM'||typeof fileData.iv!=='string'||typeof fileData.data!=='string')throw new Error('Unsupported encoded save');
      const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(fileData.iv),additionalData:saveAad},await getSaveCryptoKey(),base64ToBytes(fileData.data));
      payload=JSON.parse(new TextDecoder().decode(decrypted));
    }
    const entries=payload?.storage;
    if(payload?.format!=='cartman-royale-save'||![1,2,3,4].includes(payload.version)||!entries||typeof entries!=='object'||Array.isArray(entries)||Object.keys(entries).length>1000)throw new Error('Invalid save contents');
    let bytes=0;for(const [storageKey,value] of Object.entries(entries)){if(typeof storageKey!=='string'||typeof value!=='string')throw new Error('Invalid save contents');bytes+=storageKey.length+value.length;if(bytes>5*1024*1024)throw new Error('Save contents too large');}
    if(payload.version>=2&&(!payload.cookies||typeof payload.cookies.cartman_unlocked!=='boolean'))throw new Error('Invalid save contents');
    if(!window.confirm('Restore this file’s game progress, unlocks and settings? This replaces the current local game save.')){noticeSave('Load cancelled.');return;}
    for(const storageKey of gameSaveKeys)localStorage.removeItem(storageKey);
    for(const [storageKey,value] of Object.entries(entries))if(gameSaveKeySet.has(storageKey))localStorage.setItem(storageKey,value);
    if(typeof payload.cookies?.cartman_unlocked==='boolean'){
      document.cookie=payload.cookies.cartman_unlocked
        ?'cartman_unlocked=true; path=/; max-age=31536000; SameSite=Lax'
        :'cartman_unlocked=; path=/; max-age=0; SameSite=Lax';
    }
    noticeSave('Full game save loaded. Reloading…');
    setTimeout(()=>window.location.reload(),250);
  }catch(error){console.error('Save import failed:',error);noticeSave(error.message.includes('older save')?error.message:'Could not load this save. It may be damaged or incompatible.');}
  finally{button.disabled=false;}
});
setInterval(render,60000);render();save();
