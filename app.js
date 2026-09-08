const CONFIG={clientId:"5c69274bcd5348a5b546907aeedd906a",redirectUri:"https://graceful-dragon-6f9f89.netlify.app/",scopes:["user-read-private","user-read-email","playlist-read-private","playlist-read-collaborative","user-library-read","user-read-playback-state","user-modify-playback-state","user-read-currently-playing","streaming"].join(" ")};
const $=id=>document.getElementById(id);const fmt=ms=>{const s=Math.floor((ms||0)/1000);return`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`};
function randomString(n=64){const a=new Uint8Array(n);crypto.getRandomValues(a);return[...a].map(x=>"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[x%62]).join("")}async function sha256(s){return crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))}function b64url(buf){return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}
function setStatus(t){const e=$("statusText");if(e)e.textContent=t}
function systemTheme(){return matchMedia("(prefers-color-scheme:light)").matches?"day":"night"}
function applyTheme(theme){const actual=theme==="auto"?systemTheme():theme;document.body.classList.toggle("theme-day",actual==="day");localStorage.setItem("nf_theme",theme);const b=$("themeToggle");if(b){b.innerHTML=actual==="day"?'<span>☀</span><b>Day</b>':'<span>☾</span><b>Night</b>';b.setAttribute("aria-label",actual==="day"?'Switch to night theme':'Switch to day theme')}const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=actual==="day"?'#edf6fb':'#020204';markSettings()}
function initTheme(){const saved=localStorage.getItem("nf_theme")||"day";applyTheme(saved);$("themeToggle")?.addEventListener("click",()=>applyTheme((localStorage.getItem("nf_theme")||"day")==="day"?"night":"day"));matchMedia("(prefers-color-scheme:light)").addEventListener?.("change",()=>{if(localStorage.getItem("nf_theme")==="auto")applyTheme("auto")})}
function applyAccent(v){const a=["ice","violet","sakura","alpine","sunset","arctic"].includes(v)?v:"ice";document.body.classList.remove(...["ice","violet","sakura","alpine","sunset","arctic"].map(x=>"accent-"+x));document.body.classList.add("accent-"+a);localStorage.setItem("nf_accent",a);markSettings()}
function applyMountain(v){const m=["midnight","dawn","snow"].includes(v)?v:"midnight";document.body.classList.remove("mountain-dawn","mountain-snow");if(m!=="midnight")document.body.classList.add("mountain-"+m);localStorage.setItem("nf_mountain",m);markSettings()}
function applyDensity(v){const d=["compact","comfortable","large"].includes(v)?v:"compact";document.body.classList.remove("density-comfortable","density-large");if(d!=="compact")document.body.classList.add("density-"+d);localStorage.setItem("nf_density",d);markSettings()}
function applyPerformance(v){const p=["maximum","balanced","cinematic"].includes(v)?v:"balanced";document.body.classList.remove("performance-maximum","performance-balanced","performance-cinematic");document.body.classList.add("performance-"+p);localStorage.setItem("nf_performance",p);markSettings()}
function markSettings(){const modal=$("customizeModal");if(!modal)return;const values={theme:localStorage.getItem("nf_theme")||"day",accent:localStorage.getItem("nf_accent")||"sakura",mountain:localStorage.getItem("nf_mountain")||"midnight",density:localStorage.getItem("nf_density")||"compact",performance:localStorage.getItem("nf_performance")||"balanced"};modal.querySelectorAll("[data-setting]").forEach(b=>b.classList.toggle("selected",b.dataset.value===values[b.dataset.setting]))}
function initCustomization(){
  applyAccent(localStorage.getItem("nf_accent")||"sakura");
  applyMountain(localStorage.getItem("nf_mountain")||"midnight");
  applyDensity(localStorage.getItem("nf_density")||"comfortable");
  applyPerformance(localStorage.getItem("nf_performance")||"balanced");
  const modal=$("customizeModal"), apply=$('applyCustomization');
  let pending=null;
  const readValues=()=>({theme:localStorage.getItem("nf_theme")||"day",accent:localStorage.getItem("nf_accent")||"sakura",mountain:localStorage.getItem("nf_mountain")||"midnight",density:localStorage.getItem("nf_density")||"comfortable",performance:localStorage.getItem("nf_performance")||"balanced"});
  const markPending=()=>{
    if(!modal||!pending)return;
    modal.querySelectorAll("[data-setting]").forEach(b=>b.classList.toggle("selected",b.dataset.value===pending[b.dataset.setting]));
    apply?.classList.add("show");
  };
  const open=()=>{pending=readValues();modal.classList.remove("hidden");modal.setAttribute("aria-hidden","false");markPending()};
  const close=()=>{pending=null;modal.classList.add("hidden");modal.setAttribute("aria-hidden","true");apply?.classList.remove("show")};
  const commit=()=>{if(!pending)return;applyTheme(pending.theme);applyAccent(pending.accent);applyMountain(pending.mountain);applyDensity(pending.density);applyPerformance(pending.performance);pending=readValues();markSettings();apply?.classList.remove("show");setTimeout(()=>apply?.classList.add("applied"),10);setTimeout(()=>apply?.classList.remove("applied"),900)};
  $("customizeBtn")?.addEventListener("click",open);
  modal?.querySelectorAll("[data-close-customize]").forEach(x=>x.addEventListener("click",close));
  modal?.querySelectorAll("[data-setting]").forEach(b=>b.addEventListener("click",()=>{if(!pending)pending=readValues();pending[b.dataset.setting]=b.dataset.value;markPending()}));
  apply?.addEventListener("click",commit);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
}
function buildLeaves(){const root=$("fallingLeaves");if(!root||document.body.classList.contains("theme-day")===false)return;root.innerHTML=""}
async function login(){if(!CONFIG.clientId)throw Error("Spotify Client ID is missing");const verifier=randomString();const challenge=b64url(await sha256(verifier));localStorage.setItem("nf_verifier",verifier);const state=randomString(32);localStorage.setItem("nf_state",state);const u=new URL("https://accounts.spotify.com/authorize");u.search=new URLSearchParams({client_id:CONFIG.clientId,response_type:"code",redirect_uri:CONFIG.redirectUri,scope:CONFIG.scopes,code_challenge_method:"S256",code_challenge:challenge,state}).toString();window.location.assign(u.href)}
async function callback(){const p=new URLSearchParams(location.search),code=p.get("code"),state=p.get("state"),err=p.get("error");if(err)throw Error(err);if(!code)return;if(state!==localStorage.getItem("nf_state"))throw Error("Spotify login state mismatch");const body=new URLSearchParams({client_id:CONFIG.clientId,grant_type:"authorization_code",code,redirect_uri:CONFIG.redirectUri,code_verifier:localStorage.getItem("nf_verifier")});const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});const data=await r.json();if(data.error)throw Error(data.error_description||data.error);localStorage.setItem("nf_token",data.access_token);localStorage.setItem("nf_expires",String(Date.now()+data.expires_in*1000));if(data.refresh_token)localStorage.setItem("nf_refresh",data.refresh_token);localStorage.removeItem("nf_state");localStorage.removeItem("nf_verifier");history.replaceState({},document.title,CONFIG.redirectUri)}
async function refreshToken(){const refresh=localStorage.getItem("nf_refresh");if(!refresh)return null;const body=new URLSearchParams({client_id:CONFIG.clientId,grant_type:"refresh_token",refresh_token:refresh});const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});const d=await r.json();if(d.access_token){localStorage.setItem("nf_token",d.access_token);localStorage.setItem("nf_expires",String(Date.now()+d.expires_in*1000));if(d.refresh_token)localStorage.setItem("nf_refresh",d.refresh_token)}return d.access_token}
async function token(){if(Date.now()<Number(localStorage.getItem("nf_expires")||0)-60000)return localStorage.getItem("nf_token");return(await refreshToken())||localStorage.getItem("nf_token")}
async function api(path,opts={}){const t=await token();if(!t)throw Error("Not connected");const r=await fetch("https://api.spotify.com/v1"+path,{...opts,headers:{Authorization:"Bearer "+t,...(opts.headers||{})}});if(r.status===401){const nt=await refreshToken();if(nt)return api(path,opts)}if(!r.ok)throw Error((await r.text()).slice(0,300));return r.status===204?null:r.json()}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function trackHTML(t,i=0){const img=t.album?.images?.[0]?.url;return`<div class="track" data-uri="${esc(t.uri||"")}" data-index="${i}">${img?`<img loading="lazy" src="${img}" alt="">`:`<div class="track-art">♪</div>`}<div><b>${esc(t.name)}</b><small>${esc(t.artists?.map(a=>a.name).join(", ")||"Unknown artist")}</small></div><span class="track-time">${fmt(t.duration_ms)}</span></div>`}
function bindTracks(root){root.querySelectorAll(".track").forEach(el=>el.onclick=()=>playUri(el.dataset.uri))}
async function loadLibrary(){setStatus("Climbing into your library…");const me=await api("/me");$("userChip").textContent=me.display_name||"Spotify";$("userChip").classList.remove("hidden");$("connectBtn").classList.add("hidden");$("heroConnect").textContent="Spotify connected ✓";$("libraryPage").classList.remove("hidden");const data=await api("/me/playlists?limit=50");$("playlistGrid").innerHTML=data.items.map(p=>`<article class="playlist" data-id="${esc(p.id)}">${p.images?.[0]?.url?`<img loading="lazy" src="${p.images[0].url}" alt="">`:`<div class="playlist-art">N</div>`}<h3>${esc(p.name)}</h3><p>${p.items?.total??0} tracks</p></article>`).join("");document.querySelectorAll(".playlist").forEach(x=>{x.onclick=()=>openPlaylist(x.dataset.id)});setStatus(`${data.items.length} playlists at base camp`);initPlayer()}
async function openPlaylist(id){setStatus("Opening playlist…");const [meta,p]=await Promise.all([api(`/playlists/${id}?fields=name,images,description`),api(`/playlists/${id}/items?limit=50&fields=items(item(name,uri,duration_ms,artists(name),album(name,images)))`)]);const items=(p.items||[]).filter(x=>x.item);$("playlistGrid").classList.add("hidden");$("playlistView").classList.remove("hidden");$("playlistHero").innerHTML=`<div class="playlist-banner">${meta.images?.[0]?.url?`<img loading="lazy" src="${meta.images[0].url}" alt="">`:`<div class="playlist-art">N</div>`}<div><div class="eyebrow">SPOTIFY PLAYLIST</div><h2>${esc(meta.name)}</h2><p>${esc(meta.description||`${items.length} tracks`)}</p></div></div>`;$("playlistTracks").innerHTML=items.map((x,i)=>trackHTML(x.item,i)).join("");bindTracks($("playlistTracks"));setStatus(`${items.length} tracks ready`);window.scrollTo({top:0,behavior:"smooth"})}
let player=null,playerStarting=false,lastPlaybackState=null,playbackDuration=0,progressDragging=false;
async function playUri(uri){if(!uri)return;try{if(!player){setStatus("Waking NorthFace player…");await initPlayer(true)}if(!player)throw Error("player_unavailable");if(player.activateElement)await player.activateElement();const device=localStorage.getItem("nf_device");if(!device)throw Error("player_not_ready");await api("/me/player",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({device_ids:[device],play:false})});await api("/me/player/play?device_id="+encodeURIComponent(device),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({uris:[uri]})});setStatus("Playing · NorthFace is alive");setMusicMode(true)}catch(e){console.error(e);const m=String(e.message||e);if(m.includes("Premium"))setStatus("Spotify Premium is required for web playback");else if(m.includes("player_not_ready"))setStatus("Player is not ready yet · tap the song again");else setStatus("Spotify playback failed · tap the song again")}}
function setMusicMode(on){document.body.classList.toggle("music-active",!!on&&matchMedia("(pointer:coarse)").matches)}
window.onSpotifyWebPlaybackSDKReady=()=>initPlayer();
async function initPlayer(userGesture=false){if(player)return true;if(playerStarting)return false;const t=await token();if(!t||!window.Spotify)return false;playerStarting=true;try{player=new Spotify.Player({name:"NorthFace · Everest",volume:.72,getOAuthToken:async cb=>cb(await token()),enableMediaSession:true});player.addListener("ready",({device_id})=>{localStorage.setItem("nf_device",device_id);setStatus("NorthFace player ready · choose a song")});player.addListener("not_ready",({device_id})=>{if(localStorage.getItem("nf_device")===device_id)localStorage.removeItem("nf_device");setStatus("NorthFace player went offline")});player.addListener("player_state_changed",s=>{if(!s)return;lastPlaybackState=s;playbackDuration=s.duration||0;const t=s.track_window.current_track;setTrack(t);$("play").textContent=s.paused?"▶":"Ⅱ";$("npPlay").textContent=s.paused?"▶":"Ⅱ";syncProgressVisual($("progress"),s.duration?s.position/s.duration*100:0);syncProgressVisual($("npProgress"),s.duration?s.position/s.duration*100:0);$("time").textContent=fmt(s.position);$("npTime").textContent=fmt(s.position);$("duration").textContent=fmt(s.duration);$("npDuration").textContent=fmt(s.duration);$("lyricsTrack").textContent=t.name;$("lyricsArtist").textContent=t.artists?.map(a=>a.name).join(", ")||"";const img=t.album?.images?.[0]?.url;if(img){$("miniCover").style.backgroundImage=`url('${img}')`;$("miniCover").textContent=""}setMusicMode(!s.paused);document.body.classList.toggle("nf-playing",!s.paused)});player.addListener("autoplay_failed",()=>setStatus("Tap play again to start audio on this phone"));player.addListener("initialization_error",()=>setStatus("This browser cannot start Spotify playback"));player.addListener("authentication_error",e=>{console.warn(e.message);setStatus("Spotify player authentication failed · reconnect Spotify")});player.addListener("account_error",e=>{console.warn(e.message);setStatus("Spotify Premium is required for NorthFace playback")});player.addListener("playback_error",e=>{console.warn(e.message);setStatus("Spotify could not play this track")});const ok=await player.connect();if(!ok)throw Error("connect_failed");if(userGesture&&player.activateElement)await player.activateElement();return true}catch(e){console.error(e);player=null;setStatus("NorthFace player could not connect to Spotify");return false}finally{playerStarting=false}}
let currentLyrics=[];let lyricsTimer=null;let currentTrackId="";
function setTrack(t){
  $("trackName").textContent=t?.name||"Nothing playing";
  $("artistName").textContent=t?.artists?.map(a=>a.name).join(", ")||"Connect Spotify to begin";
  $("npTrack").textContent=t?.name||"Nothing playing";
  $("npArtist").textContent=t?.artists?.map(a=>a.name).join(", ")||"Connect Spotify to begin";
  const url=t?.album?.images?.[0]?.url;
  [$("cover"),$("miniCover"),$("npCover")].forEach(el=>{if(!el)return;if(url){el.style.setProperty("--cover-bg",`url('${url}')`);el.classList.add("has-art");el.textContent=""}else{el.style.removeProperty("--cover-bg");el.classList.remove("has-art");el.textContent="N"}});
  if($("player")) $("player").style.setProperty("--player-art",url?`url('${url}')`:'none');
  if(t?.id && t.id!==currentTrackId){currentTrackId=t.id;loadLyrics(t)}
}
async function loadLyrics(t){
  currentLyrics=[];$("lyricsScroll").innerHTML='<p class="muted-line">Finding lyrics…</p>';$("lyricsSource").textContent="Searching the lyrics library…";
  try{
    const artist=t.artists?.[0]?.name||"", title=t.name||"";
    const r=await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`);
    if(!r.ok)throw Error("not_found");
    const d=await r.json();const raw=d.syncedLyrics||"";
    if(!raw)throw Error("no_synced");
    currentLyrics=[];raw.split(/\r?\n/).forEach(line=>{const tags=[...line.matchAll(/\[(\d+):([\d.]+)\]/g)];const text=line.replace(/(?:\[\d+:\d+(?:\.\d+)?\])+/,"").trim();if(!text||!tags.length)return;tags.forEach(m=>currentLyrics.push({time:Number(m[1])*60+Number(m[2]),text}))});currentLyrics.sort((a,b)=>a.time-b.time);
    if(!currentLyrics.length)throw Error("no_synced");
    $("lyricsScroll").innerHTML=currentLyrics.map((x,i)=>`<p class="lyric-line" data-lyric-index="${i}">${esc(x.text)}</p>`).join("");
    $("lyricsSource").textContent="Synced lyrics · NorthFace lyric flow";
    startLyricsSync();
  }catch(e){
    currentLyrics=[];
    $("lyricsScroll").innerHTML='<p class="muted-line">Lyrics aren’t available for this track yet.</p><p class="muted-line small">Try another song with synced lyrics.</p>';
    $("lyricsSource").textContent="No synced lyrics found";
  }
}
function startLyricsSync(){
  stopLyricsSync();
  let raf=0,lastIndex=-1,lastPoll=0;
  const tick=async now=>{
    if(document.hidden||!currentLyrics.length||!player){raf=requestAnimationFrame(tick);return}
    if(now-lastPoll<350){raf=requestAnimationFrame(tick);return}
    lastPoll=now;
    const state=await player.getCurrentState().catch(()=>null);
    if(!state){raf=requestAnimationFrame(tick);return}
    const pos=state.position/1000;
    let idx=0;
    for(let i=0;i<currentLyrics.length;i++){if(currentLyrics[i].time<=pos)idx=i;else break}
    if(idx!==lastIndex){
      document.querySelectorAll('[data-lyric-index]').forEach((el,i)=>el.classList.toggle('active-line',i===idx));
      const active=document.querySelector(`[data-lyric-index="${idx}"]`);
      if(active&&$('lyricsPage')&&!$('lyricsPage').classList.contains('hidden'))active.scrollIntoView({behavior:'smooth',block:'center'});
      lastIndex=idx;
    }
    raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);
  lyricsTimer={cancel:()=>cancelAnimationFrame(raf)};
}
function stopLyricsSync(){if(lyricsTimer&&typeof lyricsTimer.cancel==='function')lyricsTimer.cancel();lyricsTimer=null}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopLyricsSync();else if(currentLyrics.length)startLyricsSync()});

function openPage(page){
  document.querySelectorAll(".app-page").forEach(p=>p.classList.toggle("hidden",p.dataset.page!==page));
  document.body.classList.toggle("page-mode",page!=="home");
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.nav===page));
  window.scrollTo({top:0,behavior:"smooth"});
  if(page==="library" && localStorage.getItem("nf_token") && !$("playlistView").classList.contains("hidden")){}
  if(page==="search")setTimeout(()=>$("searchInput")?.focus(),120);
}
function showHome(){document.querySelectorAll(".app-page").forEach(p=>p.classList.add("hidden"));document.body.classList.remove("page-mode");document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.nav==="home"));window.scrollTo({top:0,behavior:"smooth"})}
async function loadSavedTracks(){
  try{
    const d=await api("/me/tracks?limit=50");const items=(d.items||[]).map(x=>x.track).filter(Boolean);
    $("savedTracks").innerHTML=items.length?items.map(trackHTML).join(""):'<div class="search-empty"><b>No liked songs yet</b><span>Save songs on Spotify and they will appear here.</span></div>';
    bindTracks($("savedTracks"));
  }catch(e){$("savedTracks").innerHTML='<div class="search-empty"><b>Couldn’t load liked songs</b><span>Reconnect Spotify and try again.</span></div>'}
}
async function search(q){if(!q.trim()){$("searchResults").innerHTML="";return}if(!localStorage.getItem("nf_token")){$("searchResults").innerHTML=`<div class="search-empty"><b>Connect Spotify first</b><span>NorthFace needs your Spotify connection to search your music universe.</span><button class="hero-ghost" onclick="login()">Connect Spotify ↗</button></div>`;return}try{setStatus("Searching Spotify…");const d=await api(`/search?q=${encodeURIComponent(q)}&type=track&limit=10`);const items=d?.tracks?.items||[];$("searchResults").innerHTML=items.length?items.map(trackHTML).join(""):`<div class="search-empty"><b>No tracks found</b><span>Try another song, artist, or phrase.</span></div>`;bindTracks($("searchResults"));setStatus(`${items.length} tracks found`)}catch(e){console.error(e);$("searchResults").innerHTML=`<div class="search-empty"><b>Spotify search failed</b><span>${esc(e.message||"Please reconnect Spotify and try again.")}</span><button class="hero-ghost" onclick="login()">Reconnect ↗</button></div>`}}
function buildWave(){const w=$("wave");if(!w)return;const n=matchMedia("(pointer:coarse)").matches?18:32;w.innerHTML=Array.from({length:n},()=>`<i class="bar"></i>`).join("")}
function navTo(kind){
  if(kind==="home"){showHome();return}
  if(kind==="library"){
    openPage("library");
    if(localStorage.getItem("nf_token")) loadLibrary().catch(e=>{console.error(e);setStatus("Library could not load · reconnect Spotify")});
    else renderConnectPrompt("playlistGrid","Connect Spotify to open your Library.");
    return;
  }
  if(kind==="search"){
    openPage("search");
    if(!localStorage.getItem("nf_token")) renderConnectPrompt("searchResults","Connect Spotify to search your music universe.");
  }
}
function renderConnectPrompt(id,msg){
  const el=$(id); if(!el)return;
  el.innerHTML=`<div class="search-empty"><b>${esc(msg)}</b><span>Spotify authorization is required for your personal music data.</span><button id="promptConnect" class="hero-cta" type="button">Connect Spotify ↗</button></div>`;
  $("promptConnect")?.addEventListener("click",login);
}
function initUI(){
 const on=(id,event,fn)=>{const el=$(id);if(el)el.addEventListener(event,fn)};
 const doLogin=()=>{setStatus("Opening Spotify authorization…");return login().catch(e=>{console.error(e);setStatus("Spotify authorization could not start · check Spotify settings")})};
 window.northFaceLogin=doLogin;
 on("connectBtn","click",doLogin);
 on("heroConnect","click",doLogin);
 on("searchOpen","click",()=>navTo("search"));
 on("refreshBtn","click",()=>loadLibrary().catch(e=>setStatus("Couldn’t refresh Library")));
 on("homeBtn","click",showHome);
 on("demoBtn","click",()=>document.querySelector("#experience")?.scrollIntoView({behavior:"smooth"}));
 on("backLibrary","click",()=>{$("playlistView")?.classList.add("hidden");$("playlistGrid")?.classList.remove("hidden")});
 on("searchClose","click",showHome);
 let searchTimer;
 on("searchInput","input",e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>search(e.target.value),260)});
 on("lyricsBtn","click",()=>openPage("lyrics")); on("player","click",e=>{if(e.target.closest("button,input"))return;openPage("nowplaying")});
 on("npLyrics","click",()=>openPage("lyrics")); on("npOpenLyrics","click",()=>openPage("lyrics"));
 document.querySelectorAll(".page-back").forEach(b=>b.onclick=showHome);
 document.querySelectorAll(".bottom-nav button").forEach(b=>b.onclick=()=>navTo(b.dataset.nav));
 document.querySelectorAll("[data-library-tab]").forEach(b=>b.onclick=async()=>{
   document.querySelectorAll("[data-library-tab]").forEach(x=>x.classList.toggle("selected",x===b));
   const saved=b.dataset.libraryTab==="saved";
   $("playlistGrid").classList.toggle("hidden",saved);$("savedTracks").classList.toggle("hidden",!saved);$("playlistView").classList.add("hidden");
   if(!localStorage.getItem("nf_token")){renderConnectPrompt(saved?"savedTracks":"playlistGrid","Connect Spotify to view your Library.");return}
   if(saved)await loadSavedTracks();else await loadLibrary();
 });
 document.querySelectorAll(".mini-play").forEach(b=>b.onclick=e=>{e.stopPropagation();if(localStorage.getItem("nf_token"))setStatus(`${b.closest(".experience-card").dataset.demo} selected · pick a Spotify track`);else doLogin()});
 on("play","click",async()=>{try{if(!player)await initPlayer(true);if(player){await player.activateElement?.();await player.togglePlay()}}catch(e){console.error(e);setStatus("Tap a song first, then tap play again")}});
 async function skipTrack(direction){
  try{
    if(!localStorage.getItem("nf_token")){setStatus("Connect Spotify first");return}
    if(!player)await initPlayer(true);
    if(!player){setStatus("NorthFace player is not ready yet");return}
    await api(`/me/player/${direction}`,{method:"POST"});
    setStatus(direction==="next"?"Next track · NorthFace is alive":"Previous track · NorthFace is alive");
  }catch(e){
    console.error(e);
    const msg=String(e.message||e);
    if(msg.includes("Premium"))setStatus("Spotify Premium is required for playback");
    else setStatus(direction==="next"?"Couldn’t play the next track":"Couldn’t play the previous track");
  }
}
on("prev","click",()=>skipTrack("previous"));on("next","click",()=>skipTrack("next"));
 on("progress","pointerdown",()=>{progressDragging=true});
 on("progress","pointerup",e=>{progressDragging=false;seekSlider(e.target)});
 on("progress","change",e=>seekSlider(e.target));
 on("progress","input",e=>{if(progressDragging)e.target.style.setProperty("--seek",e.target.value+"%");});
 on("npPlay","click",async()=>{try{if(!player)await initPlayer(true);if(player){await player.activateElement?.();await player.togglePlay()}}catch(e){setStatus("Tap a song first, then tap play again")}});
 on("npPrev","click",()=>skipTrack("previous"));on("npNext","click",()=>skipTrack("next"));
 on("mediaOutput","click",()=>setStatus("NorthFace audio output · This phone"));
 on("playerAdd","click",()=>setStatus("Saved to your NorthFace library"));
 function seekSlider(el){if(!player)return;const duration=playbackDuration||lastPlaybackState?.duration||0;if(!duration){setStatus("Play a song first, then seek");return}const value=Math.max(0,Math.min(100,Number(el.value)||0));el.value=value;player.seek(Math.round(duration*value/100)).then(()=>setStatus("Seeked · NorthFace is alive")).catch(()=>setStatus("Couldn’t seek right now"));}
function syncProgressVisual(el,value){if(!el)return;const v=Math.max(0,Math.min(100,Number(value)||0));el.value=v;el.style.setProperty("--seek",v+"%");el.parentElement?.style.setProperty("--seek",v+"%");}
 setInterval(async()=>{if(document.hidden||!player||progressDragging)return;const s=await player.getCurrentState().catch(()=>null);if(!s)return;lastPlaybackState=s;playbackDuration=s.duration||playbackDuration;const pct=s.duration?Math.min(100,s.position/s.duration*100):0;const p=$("progress"),np=$("npProgress");if(p)syncProgressVisual(p,pct);if(np)syncProgressVisual(np,pct);$("time")&&( $("time").textContent=fmt(s.position) );$("npTime")&&($("npTime").textContent=fmt(s.position));$("duration")&&($("duration").textContent=fmt(s.duration));$("npDuration")&&($("npDuration").textContent=fmt(s.duration));},500);
 on("npProgress","pointerdown",()=>{progressDragging=true});
 on("npProgress","pointerup",e=>{progressDragging=false;seekSlider(e.target)});
 on("npProgress","change",e=>seekSlider(e.target));
 on("npProgress","input",e=>{if(progressDragging)e.target.style.setProperty("--seek",e.target.value+"%");});
 on("npShare","click",async()=>{try{const t=$("npTrack").textContent;const share={title:`${t} · NorthFace`,text:`Listening to ${t} on NorthFace`,url:location.href};if(navigator.share)await navigator.share(share);else{await navigator.clipboard.writeText(location.href);setStatus("NorthFace link copied")}}catch(e){}});
 on("npLike","click",async()=>{const s=await player?.getCurrentState().catch(()=>null);const id=s?.track_window?.current_track?.id;if(!id){setStatus("Play a song first");return}try{await api("/me/tracks",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[id]})});$("npLike").textContent="♥";setStatus("Saved to your library")}catch(e){setStatus("Couldn’t save this song")}});
}
initUI();initTheme();initCustomization();buildLeaves();buildWave();
(async()=>{try{await callback();if(localStorage.getItem("nf_token")){$("heroConnect").textContent="Spotify connected ✓";setStatus("Spotify connected · waking NorthFace player…");await loadLibrary()}else setStatus("The summit is quiet. Connect Spotify to begin.")}catch(e){console.error(e);setStatus(e.message||"Something went wrong")}})();
