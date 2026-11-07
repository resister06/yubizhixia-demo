import {formTitle,stopTitleParticles} from './title-particles.js';
import {factionValues,applyFactionEffects,factionStatus,mechanismStatus} from './faction-state.js';
import { renderRichText } from './rich-text.js';
import { episodes, places, influenceDimensions, repairMemorial, memorials } from './story-data.js';
import { initStudy, playerProfile, setPlayerName } from './study.js';
import { initIdentityEffects } from './identity-effects.js';

const screens = [...document.querySelectorAll('.screen')];
const transition = document.querySelector('#transition');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const openingFilm = document.querySelector('#opening-film-video');
const trailerVideo=document.querySelector('#official-preview-video');
const trailerPlay=document.querySelector('#play-official-preview');
const mapIntroVideo = document.querySelector('#map-intro-video');
const mapIntroPlay = document.querySelector('#play-map-intro');
let mapIntroShown = false;
let finaleTimer = null;
const filmPlayButton = document.querySelector('#play-opening-film');
const curtainVideos = [...transition.querySelectorAll('video')];
function coverWithSeal() {
  transition.classList.remove('instant-clear');
  void transition.offsetWidth;
  transition.classList.add('active');
  if (!reducedMotion.matches) curtainVideos.forEach(video => {
    video.currentTime = 0; video.playbackRate = 2.7; video.play().catch(() => {});
  });
}
function revealFromSeal() { transition.classList.remove('active'); }
function stopTransitionVideos() { curtainVideos.forEach(video => video.pause()); }
let currentScreen = 'cover';
const openingMusic=document.querySelector('#opening-music');
const memorialMusic=document.querySelector('#memorial-music');
const mapEndingMusic=document.querySelector('#map-ending-music');
let musicRoute='opening';
const musicRetry=document.querySelector('#music-retry');
musicRetry.addEventListener('click',()=>{const audio=activeMusic();audio.muted=false;audio.volume=1;playActiveMusic();});
function activeMusic(){return musicRoute==='opening'?openingMusic:musicRoute==='daily'?memorialMusic:mapEndingMusic;}
function playActiveMusic(){
  const current=activeMusic();
  if(!current.paused)return;
  current.play().then(()=>{if(current!==activeMusic())current.pause();else musicRetry.hidden=true;}).catch(()=>{
    if(current===activeMusic() && ['map','ending'].includes(musicRoute)){musicRetry.textContent=musicRoute==='ending'?'点击播放结尾音乐':'点击播放地图音乐';musicRetry.hidden=false;}
  });
}
function syncMusic(id){
  musicRetry.hidden=true;
  const next=['cover','identity','naming','prologue'].includes(id)?'opening':
    id==='faction-map'?'map':['official-preview','title-finale','epilogue-one','epilogue-two'].includes(id)?'ending':'daily';
  const previous=musicRoute;
  musicRoute=next;
  const current=activeMusic();
  for(const track of [openingMusic,memorialMusic,mapEndingMusic])if(track!==current)track.pause();
  if(id==='cover' || (next==='opening' && previous!=='opening'))openingMusic.currentTime=0;
  if((next==='map' || next==='ending') && next!==previous)mapEndingMusic.currentTime=0;
  playActiveMusic();
}
document.addEventListener('pointerdown',playActiveMusic,{capture:true});
document.addEventListener('keydown',playActiveMusic,{capture:true});
playActiveMusic();

let changing = false;
let navigationVersion = 0;
let pendingScreen = 'cover';
let lineIndex = 0;
let selectedIdentity = null;
let nameConfirmed = false;
let episodeId = 'opening';
let companionIntroduced = false;
let mapUnlocked = false;
let valuesUnlocked = false;
let mapGuideNeeded = false;
let noticeTimer = null;
const announcedMemorials = new Set();
function announceNewMemorial(){
  if(!studyUI.hasPendingMemorial)return;
  const data=memorials[studyUI.activeMemorialIndex];
  if(announcedMemorials.has(data.episode))return;
  announcedMemorials.add(data.episode);
  const notice=document.querySelector('#memorial-notice');
  clearTimeout(noticeTimer);notice.hidden=false;
  noticeTimer=setTimeout(()=>notice.hidden=true,3300);
}
function dismissMapGuide(){
  document.querySelector('#map-guide').hidden=true;deskMap.classList.remove('map-guided');mapGuideNeeded=false;
}

let pendingMapStory = null;
const deskMap = document.querySelector('#desk-map');
function unlockLuFamily() {
  mapUnlocked = true;
  deskMap.hidden = false;
  document.querySelector('#lu-family-marker').hidden = false;
}
function openFactionMap() {
  if (!mapUnlocked || changing || advancing) return;
  dismissMapGuide();
  refreshMechanismValues();
  document.querySelector('#memorial-notice').hidden=true;
  document.querySelector('#family-profile').hidden = true;
  document.querySelectorAll('.family-marker').forEach(marker=>marker.setAttribute('aria-expanded','false'));
  document.querySelector('#resume-map-story').hidden = !pendingMapStory;
  document.querySelector('#close-map').textContent = '← 返回书房';
  showScreen('faction-map');
}
deskMap.addEventListener('click',openFactionMap);
document.querySelector('#open-mechanics-help').addEventListener('click',()=>document.querySelector('#mechanics-help').showModal());
document.querySelector('#close-mechanics-help').addEventListener('click',()=>document.querySelector('#mechanics-help').close());
document.querySelector('#close-map').addEventListener('click',()=>showScreen('governance'));
const mapFactions = [
  {id:'gu',name:'顾家',domain:'中枢 · 人事',text:'顾家族中在朝十九人，门生遍六部，掌中枢与人事，又是太后旧臣。',affairs:'中枢政务、人事任用',x:62,y:70},
  {id:'xie',name:'谢家',domain:'书院 · 清议',text:'谢家掌书院清议，一句话能坏一个官员的名声，官位低。',affairs:'书院、清议',x:43,y:27},
  {id:'lu',name:'陆家',domain:'漕运 · 仓储',text:'陆家掌漕运仓储。通州仓场的账由漕运总督陆廷芳掌管。',affairs:'漕粮转运、仓储与商路核验',x:53,y:52},
  {id:'pei',name:'裴家',domain:'北境 · 军镇',text:'裴家世镇北境，掌六万边军，兵认将令。',affairs:'北境镇守',x:62,y:12},
  {id:'palace',name:'内廷',domain:'宫中 · 渠道',text:'内廷掌宫中渠道，不显山露水，知道的事最多。',affairs:'宫中渠道',x:71,y:38},
  {id:'humble',name:'寒门',domain:'考绩 · 进身',text:'寒门没有根基，卡在佐官一级上不去，靠考绩往上走。',affairs:'凭考绩进身',x:80,y:78},
];
const familyPanel=document.querySelector('#family-profile');
const markers=[];
for(const faction of mapFactions){
  const marker=faction.id==='lu'?document.querySelector('#lu-family-marker'):document.createElement('button');
  if(faction.id!=='lu'){
    marker.type='button';marker.className='family-marker';marker.hidden=true;
    const dot=document.createElement('i');dot.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.textContent=faction.name;marker.append(dot,label);
    document.querySelector('.map-stage').insertBefore(marker,familyPanel);
  }
  marker.dataset.faction=faction.id;
  marker.style.left=`${faction.x}%`;marker.style.top=`${faction.y}%`;
  marker.setAttribute('aria-label',`${faction.name}，查看势力介绍`);
  marker.setAttribute('aria-expanded','false');marker.setAttribute('aria-controls','family-profile');
  markers.push(marker);
  marker.addEventListener('click',()=>{
    markers.forEach(item=>item.setAttribute('aria-expanded',String(item===marker)));
    document.querySelector('#family-title').textContent=faction.name;
    familyPanel.querySelector('.family-kicker').textContent=faction.domain;
    familyPanel.querySelector('h3 + .family-rule + p').textContent=faction.text;
    const details=familyPanel.querySelector('dl');details.replaceChildren();
    const appendDetail=(title,value)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=title;dd.textContent=value;details.append(dt,dd);};
    if(faction.id==='lu')appendDetail('已知人物','陆廷芳 · 漕运总督');
    appendDetail('所涉事务',faction.affairs);
    familyPanel.querySelector('.family-record').hidden=faction.id!=='lu';
    document.querySelector('#resume-map-story').hidden=!pendingMapStory;
    const valuePanel=document.querySelector('#family-values');valuePanel.hidden=!valuesUnlocked;
    if(valuesUnlocked){
      const value=factionValues[faction.id];
      document.querySelector('#family-value').textContent=`${value}%`;
      document.querySelector('#family-meter').style.width=`${value}%`;
      document.querySelector('#family-risk').hidden=value<80;
      document.querySelector('#family-status').textContent=factionStatus(value);
      valuePanel.classList.toggle('is-inflated',value>=80);
      document.querySelector('#governance-value').textContent=`治理：${factionValues.governance}/100 · ${mechanismStatus(factionValues.governance)}`;
    }
    familyPanel.hidden=false;
  });
}
function unlockAllFactions(){
  unlockLuFamily();
  markers.forEach(marker=>marker.hidden=false);
  document.querySelector('.map-heading p').textContent='六方势力 · 全图已录';
}
document.querySelector('#close-family').addEventListener('click',()=>{
  familyPanel.hidden=true;markers.forEach(marker=>marker.setAttribute('aria-expanded','false'));
});
function resumeMapStory() {
  if (changing || advancing) return;
  if (!pendingMapStory) { showScreen('governance'); return; }
  episodeId=pendingMapStory.episodeId;lineIndex=pendingMapStory.lineIndex;pendingMapStory=null;
  showScreen('story');
}
document.querySelector('#resume-map-story').addEventListener('click',resumeMapStory);
document.querySelector('#governance').addEventListener('click',event=>{
  if(!document.querySelector('#map-guide').hidden && !event.target.closest('#desk-map')){event.preventDefault();event.stopImmediatePropagation();}
},true);
document.querySelector('#continue-influence').addEventListener('click',()=>{
  if(changing || advancing)return;
  if(!valuesUnlocked){
    valuesUnlocked=true;unlockAllFactions();studyUI.prepareSecondYearMemorial();
    setPlayerRole('储君监国');mapGuideNeeded=true;
  }
  if(!mapIntroShown)showScreen('map-intro-film');
  else showScreen('governance');
});
function setPlayerRole(role){playerProfile.role=role;document.querySelector('#player-role').textContent=role;}


let typingTimer = null;
let typing = false;
let instantText = reducedMotion.matches;
let advancing = false;
let revealedThrough = 0;
const story = document.querySelector('#story');
const dialogue = document.querySelector('#dialogue');
const nextButton = document.querySelector('#next');
const historyDialog = document.querySelector('#history-dialog');
const studyUI = initStudy({onReadMemorial:id => { if(pendingMapStory?.episodeId===id) resumeMapStory(); else { pendingMapStory=null; startEpisode(id); } }, onPolicyFeedback:showMemorialFeedback});

const identityCards = [...document.querySelectorAll('[data-identity]')];
const identityStatus = document.querySelector('#identity-status');
const confirmIdentity = document.querySelector('#confirm-identity');
const chooseFemale = document.querySelector('#choose-female');
const identityEffects = initIdentityEffects(reducedMotion);
function selectIdentity(identity) {
  if (changing) return;
  selectedIdentity = identity;
  identityCards.forEach(card => {
    const selected = card.dataset.identity === identity;
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
  const male = identity === 'male';
  applyIdentityAppearance();
  identityStatus.textContent=male?'皇子线暂未开放，请选择公主身份。':'已选择公主身份';
  identityStatus.classList.toggle('unavailable',male);
  confirmIdentity.disabled=male;
  confirmIdentity.textContent=male?'皇子线暂未开放':'为公主定名 →';
  chooseFemale.hidden=true;
}
function applyIdentityAppearance(){
  const male=selectedIdentity==='male',gender=male?'male':'female';
  document.body.dataset.identity=gender;
  document.querySelectorAll('.naming-portrait img,.hud-avatar img,#player-character').forEach(image=>{
    image.src=`assets/hero-${gender}-transparent-v1.png`;image.alt=male?'皇子立绘':'公主立绘';
  });
  document.querySelectorAll('.companion-intro-portrait,.hub-character img,#story .companion,.decision-companion img').forEach(image=>{
    image.src=`assets/companion-${gender}-transparent-v1.png`;image.alt='路清河立绘';
  });
}
function resetIdentity() {
  selectedIdentity = null;
  nameConfirmed = false;
  identityCards.forEach(card => { card.classList.remove('is-selected'); card.setAttribute('aria-pressed', 'false'); });
  identityStatus.textContent = '请选择你将扮演的身份';
  identityStatus.classList.remove('unavailable');
  confirmIdentity.disabled = true;
  confirmIdentity.textContent = '请先选择身份';
  chooseFemale.hidden = true;
}
identityCards.forEach(card => card.addEventListener('click', () => selectIdentity(card.dataset.identity)));
chooseFemale.addEventListener('click', () => {
  selectIdentity('female');
  identityCards[0].focus({ preventScroll: true });
});
confirmIdentity.addEventListener('click', () => {
  if (selectedIdentity==='female') showScreen('naming');
});

const nameInput = document.querySelector('#character-name');
const validPlayerName = name => /^[\p{Script=Han}]{1,4}$/u.test(name);
function updateNamePreview() {
  const name = nameInput.value;
  const valid = validPlayerName(name);
  document.querySelector('#name-length').textContent = `${[...name].length} / 4`;
  document.querySelector('#confirm-name').disabled = !valid;
  document.querySelector('#name-error').textContent = name && !valid ? '请输入1—4个汉字' : '';
  if (name && !valid) nameInput.setAttribute('aria-invalid', 'true');
  else nameInput.removeAttribute('aria-invalid');
}
nameInput.addEventListener('input', event => {
  if (event.isComposing) {
    document.querySelector('#confirm-name').disabled = true;
    document.querySelector('#name-error').textContent = '';
    return;
  }
  updateNamePreview();
});
nameInput.addEventListener('compositionend', updateNamePreview);
document.querySelector('#back-to-identity').addEventListener('click', () => showScreen('identity'));
document.querySelector('#naming-form').addEventListener('submit', event => {
  event.preventDefault();
  if (changing || selectedIdentity!=='female') return;
  const name = nameInput.value;
  if (!validPlayerName(name)) {
    document.querySelector('#name-error').textContent = '请输入1—4个汉字';
    nameInput.setAttribute('aria-invalid', 'true'); nameInput.focus(); return;
  }
  setPlayerName(name); nameConfirmed = true;
  startEpisode('opening');
});
const speakerName = name => ['你', '我'].includes(name) ? playerProfile.name : name;

function stopTyping() { clearTimeout(typingTimer); typingTimer = null; typing = false; }
function currentEpisode() { return episodes[episodeId]; }
function setNextLabel() {
  const last = lineIndex === currentEpisode().lines.length - 1;
  const label = typing ? '显示全文' : last ? (currentEpisode().unlock ? '查看各方势力' : '继续前行') : '继续';
  nextButton.textContent = label;
  const mark = document.createElement('span'); mark.textContent = '◆'; mark.setAttribute('aria-hidden', 'true'); nextButton.append(mark);
}
function revealText(text) {
  stopTyping();
  dialogue.textContent = '';
  if (instantText || reducedMotion.matches) { renderRichText(dialogue,text,currentEpisode().lines[lineIndex].redTerms); setNextLabel(); return; }
  typing = true; setNextLabel();
  const chars = [...text]; let offset = 0;
  const tick = () => {
    if (currentScreen !== 'story') { stopTyping(); return; }
    const char = chars[offset++];
    renderRichText(dialogue,chars.slice(0,offset).join(''),currentEpisode().lines[lineIndex].redTerms);
    if (offset < chars.length) typingTimer = setTimeout(tick, /[。！？；，：]/.test(char) ? 110 : 22);
    else { stopTyping(); setNextLabel(); }
  };
  typingTimer = setTimeout(tick, 25);
}
function completeLine() {
  stopTyping(); renderRichText(dialogue,currentEpisode().lines[lineIndex].text,currentEpisode().lines[lineIndex].redTerms); setNextLabel();
}

function renderDialogue() {
  // Repeated clicks advance the story; they must not leave native text highlights.
  const selection = window.getSelection();
  const box = dialogue.closest('.dialogue-box');
  if (selection && (box.contains(selection.anchorNode) || box.contains(selection.focusNode))) selection.removeAllRanges();
  const episode = currentEpisode();
  const line = episode.lines[lineIndex];
  story.dataset.visual = line.visual || '';
  const visual = document.querySelector('#memorial-visual');
  visual.hidden = !line.visual;
  const visualImage = visual.querySelector('img');
  const memorialData=memorials[episode.memorialIndex ?? 0];
  const visualSource = memorialData.images[line.visual];
  story.classList.toggle('memorial-backdrop',Boolean(visualSource && line.visual !== 'overview'));
  if(visualSource)story.style.setProperty('--memorial-background',`url("${visualSource}")`);
  visualImage.hidden = !visualSource;
  if (visualSource) { visualImage.src = visualSource; visualImage.alt = line.visual === 'overview' ? memorialData.title : memorialData.hints.find(hint => hint.key === line.visual).title; }
  else visualImage.removeAttribute('src');
  visual.querySelector('figcaption').textContent = line.visual === 'overview' ? memorialData.title : memorialData.hints.find(hint => hint.key === line.visual)?.title || '';
  const place = places[line.place];
  story.dataset.place = line.place;
  story.dataset.speaker = line.speaker;
  const playerSpeaking = ['你', '我', playerProfile.name].includes(line.speaker);
  story.classList.toggle('player-speaking', playerSpeaking);
  document.querySelector('#player-character').hidden = !playerSpeaking;
  document.querySelector('#player-character').alt = `${playerProfile.name}的立绘`;
  story.classList.toggle('emphasis', Boolean(line.emphasis));
  story.setAttribute('aria-label', `${episode.title} · ${place.name}`);
  document.querySelector('#speaker').textContent = speakerName(line.speaker);
  document.querySelector('#voice-origin').textContent = '';
  document.querySelector('#scene-place').textContent = place.name;
  document.querySelector('#scene-stage').textContent = episode.stage;
  document.querySelector('#scene-seal').textContent = line.place === 'entrance' ? '闻' : '习';
  document.querySelector('#scene-atmosphere').textContent = place.atmosphere;
  document.querySelector('#dialogue-count').textContent = `${String(lineIndex + 1).padStart(2, '0')} / ${String(episode.lines.length).padStart(2, '0')}`;
  document.querySelector('#episode-label').textContent = episode.title;
  document.querySelector('#previous').disabled = advancing || lineIndex === 0;
  revealedThrough = Math.max(revealedThrough, lineIndex);
  revealText(line.text);
}

function showMemorialFeedback({choice, actual, memorialIndex}) {
  const data=memorials[memorialIndex];
  let texts;
  if(choice.effects){
    const result=applyFactionEffects(data,choice);
    const changes=result.changes.map(change=>`${change.label}${change.delta>0?'+':''}${change.delta}（${change.before}% → ${change.after}%）`).join('；');
    texts=[`${result.repeated?'本奏已结算，回顾数值变化：':'本次选择导致的数值变化：'}${changes}。`,choice.feedback];
    if(choice.id==='c')texts[0]+='寒门数值不变，谢家数值不变。';
  }else{
    const verdict=choice.id==='c'?'没错':'不太对哦';
    texts=[`${verdict}，${choice.feedback}`];
    if(choice.risk)texts.push(choice.risk);
    if(actual)texts.push(actual);
  }
  episodes['memorial-feedback'] = {
    title:`${memorials[memorialIndex].title} · 复盘`, stage:`${data.year===2?'第二年':'第一年'} · ${memorials[memorialIndex].season} · 奏折${memorials[memorialIndex].number}反馈`, completedMemorial:memorialIndex, nextScreen:memorials[memorialIndex].after,
    lines:texts.map(text => ({speaker:'路清河', text, place:'study'})),
  };
  startEpisode('memorial-feedback');
}

function startEpisode(id) {
  if (changing || advancing || !episodes[id] || selectedIdentity!=='female') return;
  document.querySelector('#memorial-notice').hidden=true;
  const seasonIndex=episodes[id].memorialIndex ?? episodes[id].completedMemorial;
  if(seasonIndex!==undefined)document.body.dataset.season=memorials[seasonIndex].season==='秋'?'autumn':'spring';
  episodeId = id; lineIndex = 0; revealedThrough = 0;
  if (id === 'opening') {
    companionIntroduced = false;
    showScreen('prologue');
    return;
  }
  if (currentScreen === 'story') renderDialogue();
  else showScreen('story');
}

async function moveToLine(index) {
  if (index < 0 || index >= currentEpisode().lines.length || advancing || changing) return;
  stopTyping();
  advancing = true;
  const version = navigationVersion;
  nextButton.disabled = true;
  document.querySelector('#previous').disabled = true;
  const next = currentEpisode().lines[index];
  const differentPlace = next.place !== story.dataset.place;
  if (differentPlace) {
    coverWithSeal();
    await delay(reducedMotion.matches ? 0 : 420);
    if (version !== navigationVersion) return;
  }
  lineIndex = index; renderDialogue();
  if (differentPlace) {
    await delay(reducedMotion.matches ? 0 : 60);
    if (version !== navigationVersion) return;
    revealFromSeal();
    await delay(reducedMotion.matches ? 0 : 420);
    if (version !== navigationVersion) return;
    stopTransitionVideos();
  }
  advancing = false;
  nextButton.disabled = false;
  document.querySelector('#previous').disabled = lineIndex === 0;
}

function setInstantText(value) {
  instantText = value;
  const button = document.querySelector('#instant-text');
  button.textContent = value ? '文字即时' : '文字逐字'; button.setAttribute('aria-pressed', String(value));
  if (typing) completeLine();
}
document.querySelector('#instant-text').addEventListener('click', () => setInstantText(!instantText));
setInstantText(instantText);
document.querySelector('#previous').addEventListener('click', () => moveToLine(lineIndex - 1));
dialogue.addEventListener('click', () => { if (!changing && !advancing) nextLine(); });
document.querySelector('#open-history').addEventListener('click', () => {
  if (changing || advancing) return;
  completeLine();
  document.querySelector('#history-episode').textContent = currentEpisode().title;
  const list = document.querySelector('#history-lines'); list.replaceChildren();
  for (const line of currentEpisode().lines.slice(0, revealedThrough + 1)) {
    const item = document.createElement('li'); const speaker = document.createElement('b'); const text = document.createElement('p');
    speaker.textContent = speakerName(line.speaker); renderRichText(text,line.text,line.redTerms);
    item.append(speaker, text); list.append(item);
  }
  historyDialog.showModal(); list.scrollTop = list.scrollHeight;
});
document.querySelector('#close-history').addEventListener('click', () => historyDialog.close());
document.querySelector('#back-chapters').addEventListener('click', () => showScreen('chapter'));
document.querySelectorAll('[data-chapters]').forEach(button => button.addEventListener('click', () => showScreen('chapter')));
document.querySelectorAll('[data-study]').forEach(button => button.addEventListener('click', () => showScreen('governance')));
document.querySelectorAll('[data-episode]').forEach(button => button.addEventListener('click', () => startEpisode(button.dataset.episode)));
for (const dimension of influenceDimensions) {
  const item = document.createElement('article'); const seal = document.createElement('span'); const title = document.createElement('h3'); const desc = document.createElement('p');
  seal.textContent = dimension.seal; seal.className = 'dimension-seal'; seal.setAttribute('aria-hidden', 'true');
  title.textContent = dimension.title; desc.textContent = dimension.description;
  const value=document.createElement('strong');value.className='mechanism-value';value.dataset.mechanism=dimension.key;
  item.append(seal, title, value, desc);
  document.querySelector('#influence-dimensions').append(item);
}

function refreshMechanismValues(){
  document.querySelectorAll('[data-mechanism]').forEach(node=>{
    const key=node.dataset.mechanism;
    node.textContent=key==='balance'?'平衡度偏低':`${factionValues[key]}/100 · ${mechanismStatus(factionValues[key])}`;
  });
  markers.forEach(marker=>{
    let value=marker.querySelector('.marker-value');
    if(!value){value=document.createElement('small');value.className='marker-value';marker.append(value);}
    const amount=factionValues[marker.dataset.faction];
    value.hidden=!valuesUnlocked;value.textContent=`${amount}% · ${factionStatus(amount)}`;
  });
  const bar=document.querySelector('#map-mechanisms');bar.hidden=!valuesUnlocked;bar.replaceChildren();
  for(const dimension of influenceDimensions){
    const item=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');
    label.textContent=dimension.title;value.textContent=dimension.key==='balance'?'平衡度偏低':`${factionValues[dimension.key]}/100`;
    item.append(label,value);bar.append(item);
  }
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let activeDayCycle = null;
function newDay(atNight, atDawn) {
  if(activeDayCycle)return;
  const veil=document.querySelector('#day-cycle');
  let committed=false;
  const commit=()=>{if(committed)return;committed=true;changing=false;atNight();changing=true;};
  const finish=()=>{
    if(!activeDayCycle)return;
    clearTimeout(activeDayCycle.timer);commit();
    const effect=activeDayCycle.effect;activeDayCycle=null;
    effect.cancel();veil.hidden=true;changing=false;
    atDawn?.();
    if(currentScreen==='governance' && !changing)announceNewMemorial();
  };
  changing=true;veil.hidden=false;
  const effect=veil.animate([
    {opacity:0,offset:0},{opacity:1,offset:.38},
    {opacity:1,offset:.6},{opacity:0,offset:1}
  ],{duration:reducedMotion.matches?300:2100,easing:'ease-in-out',fill:'forwards'});
  activeDayCycle={effect,finish,timer:setTimeout(commit,reducedMotion.matches?120:850)};
  effect.finished.then(finish).catch(()=>{});
}

async function showScreen(id, { instant = false } = {}) {
  if (changing || advancing || (!instant && currentScreen === id)) return;
  // 当前仅开放公主线，各入口均保护身份选择。
  if (['naming', 'governance', 'chapter', 'story', 'influence', 'preview-end', 'companion-intro', 'faction-map', 'prologue', 'year-interlude', 'year-mission', 'opening-film', 'map-intro-film', 'official-preview', 'title-finale', 'epilogue-one', 'epilogue-two'].includes(id) && selectedIdentity!=='female') return;
  if (['governance', 'chapter', 'story', 'influence', 'preview-end', 'companion-intro', 'faction-map', 'prologue', 'year-interlude', 'year-mission', 'opening-film', 'map-intro-film', 'official-preview', 'title-finale', 'epilogue-one', 'epilogue-two'].includes(id) && !nameConfirmed) return;
  if(id!=='opening-film') openingFilm.pause();
  if(id!=='map-intro-film')mapIntroVideo.pause();
  if(id!=='official-preview')trailerVideo.pause();
  if(id!=='title-finale'){stopTitleParticles();clearTimeout(finaleTimer);}
  syncMusic(id);
  changing = true;
  pendingScreen = id;
  const version = ++navigationVersion;
  stopTyping();
  if (historyDialog.open) historyDialog.close();
  studyUI.closePanels();
  const unfoldPortrait = currentScreen === 'identity' && id === 'naming';
  const sourceStage = unfoldPortrait ? identityCards.find(card=>card.dataset.identity===selectedIdentity).querySelector('.portrait-stage') : null;
  const sourceRect = sourceStage?.getBoundingClientRect();
  const sourceImageRect = sourceStage?.querySelector('img').getBoundingClientRect();
  if (!instant && !unfoldPortrait) {
    coverWithSeal();
    await delay(reducedMotion.matches ? 0 : 420);
    if (version !== navigationVersion) return;
  }
  screens.forEach(screen => { screen.hidden = screen.id !== id; });
  currentScreen = id;
  if(id==='opening-film') {openingFilm.muted=true;openingFilm.currentTime=0;filmPlayButton.hidden=true;}
  if(id==='map-intro-film'){mapIntroVideo.muted=true;mapIntroVideo.currentTime=0;mapIntroPlay.hidden=false;}
  if(id==='official-preview'){trailerVideo.currentTime=0;trailerVideo.muted=true;trailerPlay.hidden=false;}
  if(id==='year-mission') {studyUI.enterSecondYear();setPlayerRole('储君监国');unlockAllFactions();}
  if(id==='influence') {document.querySelector('#open-influence').hidden=false;refreshMechanismValues();}
  if (id === 'identity') { resetIdentity(); if (!instant) identityEffects.play(); else identityEffects.stop(); }
  else identityEffects.stop();
  if (id === 'naming') {
    nameInput.value = playerProfile.name === '未命名' ? '' : playerProfile.name;
    updateNamePreview();
  }
  if (id === 'story') renderDialogue();
  if (id === 'preview-end') {
    document.querySelector('#end-heading').textContent = '御笔初执';
    document.querySelector('#end-copy').textContent = currentEpisode().endText;
  }
  syncParticles();
  if (!instant && unfoldPortrait && !reducedMotion.matches) {
    const portrait = document.querySelector('.naming-portrait');
    const target = portrait.getBoundingClientRect();
    const height = Math.min(target.height, target.width * 4 / 3);
    const width = height * 3 / 4;
    const moving = document.createElement('div');
    moving.className = 'naming-moving-portrait';
    moving.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.src = sourceStage.querySelector('img').src;
    moving.append(image);
    document.body.append(moving);
    portrait.classList.add('portrait-unfolding');
    document.querySelector('#naming').classList.add('naming-arriving');
    const start = {left:`${sourceImageRect.left}px`,top:`${sourceImageRect.top}px`,width:`${sourceImageRect.width}px`,height:`${sourceImageRect.height}px`,clipPath:`circle(${sourceRect.width/2}px at ${sourceRect.width/2}px ${sourceRect.top + sourceRect.height/2 - sourceImageRect.top}px)`};
    const finish = {left:`${target.left+(target.width-width)/2}px`,top:`${target.bottom-height}px`,width:`${width}px`,height:`${height}px`,clipPath:'circle(100% at 50% 50%)'};
    await moving.animate([start,finish],{duration:1900,easing:'cubic-bezier(.22,.65,.25,1)',fill:'forwards'}).finished;
    if (version !== navigationVersion) return;
    portrait.classList.remove('portrait-unfolding');
    moving.remove();
    document.querySelector('#naming').classList.remove('naming-arriving');
  } else if (!instant) {
    await delay(reducedMotion.matches ? 0 : 60);
    if (version !== navigationVersion) return;
    revealFromSeal();
    await delay(reducedMotion.matches ? 0 : 420);
    if (version !== navigationVersion) return;
    stopTransitionVideos();
  }
  changing = false;
  syncContinueButton();
  if(id==='governance'){
    if(mapGuideNeeded){document.querySelector('#map-guide').hidden=false;deskMap.classList.add('map-guided');}
    if(!activeDayCycle)announceNewMemorial();
  }
  if(id==='opening-film') playOpeningFilm();
  if(id==='map-intro-film')playMapIntro();
  if(id==='official-preview')playTrailer();
  if(id==='title-finale')formTitle(document.querySelector('#finale-particles'),document.querySelector('#finale-title'),reducedMotion.matches,()=>{
    finaleTimer=setTimeout(()=>{if(currentScreen==='title-finale')showScreen('epilogue-one');},1800);
  });
  const target = id === 'naming' ? nameInput : id === 'identity' ? identityCards[0] : document.querySelector(`#${id} .gold-button, #${id} #next, #${id} #enter`);
  target?.focus({ preventScroll: true });
  if (id === 'naming') nameInput.select();
}

// 统一继续入口，沿用各页面原来的继续动作。
const continueAll=document.querySelector('#continue-all');
function syncContinueButton(){
  const modal=document.querySelector('dialog[open]');
  const host=modal||document.body;
  if(continueAll.parentElement!==host)host.append(continueAll);
  continueAll.disabled=modal?.id==='memorial-panel'?document.querySelector('#submit-policy').disabled:
    currentScreen==='identity'?selectedIdentity!=='female':currentScreen==='naming'?!validPlayerName(nameInput.value):false;
  continueAll.title=continueAll.disabled?(currentScreen==='identity'?'请先选择身份':currentScreen==='naming'?'请先写下名字':'请先选择奏折选项'):'快进';
}
continueAll.addEventListener('click',()=>{
  if(activeDayCycle){activeDayCycle.finish();return;}
  if(changing || advancing)return;
  const modal=document.querySelector('dialog[open]');
  if(modal){
    if(modal.id==='memorial-panel'){
      if(!document.querySelector('#submit-policy').disabled)document.querySelector('#policy-form').requestSubmit();
    }else modal.close();
    syncContinueButton();return;
  }
  const actions={
    cover:()=>showScreen('identity'),identity:()=>confirmIdentity.click(),naming:()=>document.querySelector('#naming-form').requestSubmit(),
    prologue:()=>document.querySelector('#continue-prologue').click(),
    'opening-film':()=>finishOpeningFilm(),'companion-intro':()=>continueCompanionIntro(),
    story:()=>nextLine(),chapter:()=>startEpisode('opening'),
    governance:()=>{
      if(!document.querySelector('#map-guide').hidden || pendingMapStory)openFactionMap();
      else if(!document.querySelector('#read-memorial').disabled)document.querySelector('#read-memorial').click();
      else if(mapUnlocked)openFactionMap();
    },
    'faction-map':()=>pendingMapStory?resumeMapStory():showScreen('governance'),
    influence:()=>document.querySelector('#continue-influence').click(),
    'year-interlude':()=>showScreen('year-mission'),'year-mission':()=>startEpisode('handover'),
    'map-intro-film':()=>finishMapIntro(),'official-preview':()=>finishTrailer(),
    'title-finale':()=>showScreen('epilogue-one'),'epilogue-one':()=>showScreen('epilogue-two'),
    'epilogue-two':()=>showScreen('cover'),'preview-end':()=>startEpisode('handover'),
  };
  actions[currentScreen]?.();
});
document.addEventListener('input',()=>queueMicrotask(syncContinueButton));
document.addEventListener('change',()=>queueMicrotask(syncContinueButton));
document.addEventListener('click',()=>queueMicrotask(syncContinueButton));
const continuePortal=new MutationObserver(syncContinueButton);
document.querySelectorAll('dialog').forEach(dialog=>continuePortal.observe(dialog,{attributes:true,attributeFilter:['open']}));
syncContinueButton();
document.querySelector('#cover').addEventListener('click', event => {
  if (event.target.closest('#fullscreen')) return;
  showScreen('identity');
});
document.querySelector('#begin').addEventListener('click', () => startEpisode('opening'));
document.querySelectorAll('[data-home]').forEach(button => button.addEventListener('click', () => showScreen('cover')));
function nextLine() {
  if (changing || advancing || historyDialog.open) return;
  if (typing) { completeLine(); return; }
  if (currentEpisode().lines[lineIndex].introduceMap) {
    unlockLuFamily();
    pendingMapStory={episodeId,lineIndex:lineIndex+1};
    showScreen('governance');return;
  }
  if (currentEpisode().lines[lineIndex].introduceCompanion && !companionIntroduced) {
    showScreen('companion-intro'); return;
  }
  if (lineIndex < currentEpisode().lines.length - 1) moveToLine(lineIndex + 1);
  else finishEpisode();
}
function continueCompanionIntro(instant = false) {
  if (changing || advancing) return;
  companionIntroduced = true;
  if (currentEpisode().lines[lineIndex].introduceCompanion) lineIndex++;
  showScreen('story', {instant});
}
document.querySelector('#continue-year-interlude').addEventListener('click',()=>showScreen('year-mission'));
document.querySelector('#continue-year-mission').addEventListener('click',()=>startEpisode('handover'));
document.querySelector('#open-influence').addEventListener('click',()=>showScreen('influence'));
document.querySelector('#continue-prologue').addEventListener('click',()=>showScreen('opening-film'));
function playOpeningFilm() {
  if(currentScreen!=='opening-film')return;
  openingFilm.play().then(()=>{filmPlayButton.hidden=true;}).catch(()=>{
    if(currentScreen==='opening-film')filmPlayButton.hidden=false;
  });
}
function finishOpeningFilm(instant=false) {
  if(changing || advancing)return;
  openingFilm.pause();episodeId='opening';lineIndex=0;revealedThrough=0;companionIntroduced=false;
  showScreen('story',{instant});
}
document.querySelector('#continue-finale').addEventListener('click',()=>showScreen('epilogue-one'));
document.querySelector('#continue-epilogue').addEventListener('click',()=>showScreen('epilogue-two'));
document.querySelector('#previous-epilogue').addEventListener('click',()=>showScreen('epilogue-one'));
function playTrailer(){
  if(currentScreen!=='official-preview')return;
  trailerVideo.play().then(()=>trailerPlay.hidden=true).catch(()=>{trailerPlay.hidden=false;});
}
function finishTrailer(){
  if(changing || advancing)return;
  trailerVideo.pause();showScreen('title-finale',{instant:true});
}
trailerVideo.addEventListener('ended',finishTrailer);
trailerVideo.addEventListener('error',()=>{trailerPlay.hidden=false;trailerVideo.controls=true;});
trailerPlay.addEventListener('click',()=>{trailerVideo.load();playTrailer();});
document.querySelector('#preview-sound').addEventListener('click',event=>{
  trailerVideo.muted=!trailerVideo.muted;
  event.currentTarget.title=trailerVideo.muted?'开启预告声音':'关闭预告声音';
  event.currentTarget.setAttribute('aria-label',event.currentTarget.title);
});
mapIntroVideo.addEventListener('error',()=>{mapIntroPlay.hidden=false;mapIntroVideo.controls=true;});
function playMapIntro(){
  if(currentScreen!=='map-intro-film')return;
  mapIntroVideo.muted=true;
  mapIntroVideo.play().then(()=>mapIntroPlay.hidden=true).catch(()=>{
    if(currentScreen==='map-intro-film')mapIntroPlay.hidden=false;
  });
}
function finishMapIntro(instant=false){
  if(changing || advancing)return;
  mapIntroVideo.pause();mapIntroShown=true;mapGuideNeeded=true;
  showScreen('governance',{instant});
}
mapIntroVideo.addEventListener('ended',()=>finishMapIntro());
mapIntroPlay.addEventListener('click',playMapIntro);
openingFilm.addEventListener('ended',()=>finishOpeningFilm());
filmPlayButton.addEventListener('click',playOpeningFilm);
document.querySelector('#continue-companion-intro').addEventListener('click', () => continueCompanionIntro());
function finishEpisode({instant = false} = {}) {
  if(currentEpisode().unlockFamily==='lu') { unlockLuFamily(); pendingMapStory=null; }
  if (currentEpisode().completedMemorial !== undefined) {
    const index=currentEpisode().completedMemorial;
    const nextScreen=currentEpisode().nextScreen || memorials[index].after;
    newDay(()=>{
      studyUI.advanceAfterFeedback(index);
      showScreen('governance',{instant:true});
    },()=>{if(nextScreen)showScreen(nextScreen);});
    return;
  }
  if (currentEpisode().decision) {
    showScreen('governance', {instant:true});
    studyUI.openDecision();
  } else showScreen(currentEpisode().unlock ? 'influence' : 'governance', {instant});
}
document.querySelector('#next').addEventListener('click', nextLine);
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || changing || advancing || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest('input, textarea, [contenteditable="true"]') || currentScreen === 'naming') return;
  if (event.key === 'Escape' && currentScreen !== 'cover') { showScreen(currentScreen === 'story' ? 'chapter' : 'cover'); return; }
  // 聚焦按钮时使用浏览器原生键盘点击，避免一次按键推进两次。
  if (event.target.closest('button')) return;
  if (event.code === 'Space' || event.key === 'Enter') {
    event.preventDefault();
    if (currentScreen === 'cover') showScreen('identity');
    else if (currentScreen === 'chapter') startEpisode('opening');
    else if (currentScreen === 'story') nextLine();
  }
});

const fullscreen = document.querySelector('#fullscreen');
if (!document.fullscreenEnabled) fullscreen.hidden = true;
fullscreen.addEventListener('click', async event => {
  event.stopPropagation();
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { fullscreen.title = '当前环境暂不支持全屏'; }
});
document.addEventListener('fullscreenchange', () => {
  const label = document.fullscreenElement ? '退出全屏' : '进入全屏';
  fullscreen.setAttribute('aria-label', label);
  fullscreen.title = label;
});

// 本地 Canvas 鎏金微粒：不依赖图片服务，离开封面或切到后台便停止绘制。
const canvas = document.querySelector('#gold-dust');
const context = canvas.getContext('2d');
let width = 0, height = 0, frame = null, last = 0, particles = [];
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(68, Math.max(24, Math.round(width * height / 18000))) }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    radius: Math.random() * 1.15 + .35, speed: Math.random() * 9 + 5,
    phase: Math.random() * Math.PI * 2, opacity: Math.random() * .42 + .14,
  }));
}
function draw(time) {
  frame = null;
  if (!context) return;
  const dt = Math.min((time - (last || time)) / 1000, .05); last = time;
  context.clearRect(0, 0, width, height);
  context.globalCompositeOperation = 'lighter';
  for (const p of particles) {
    p.y -= p.speed * dt; p.x += Math.sin(time / 4000 + p.phase) * dt * 5;
    if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
    const alpha = p.opacity * (.5 + Math.sin(time / 1600 + p.phase) * .35);
    context.beginPath(); context.fillStyle = `rgba(236,193,108,${alpha})`;
    context.shadowBlur = 7; context.shadowColor = '#efbb61';
    context.arc(p.x, p.y, p.radius, 0, Math.PI * 2); context.fill();
  }
  // 两道极淡的流金弧线，只在封面下半部流动，保留人物面部。
  context.shadowBlur = 12;
  for (let i = 0; i < 2; i++) {
    const t = time / 18000 + i * Math.PI;
    const y = height * (.77 + Math.sin(t) * .04);
    const gradient = context.createLinearGradient(0, y, width, y);
    gradient.addColorStop(0, 'transparent'); gradient.addColorStop(.43, '#b9843120');
    gradient.addColorStop(.62, '#f6d79055'); gradient.addColorStop(1, 'transparent');
    context.strokeStyle = gradient; context.lineWidth = .7;
    context.beginPath(); context.moveTo(-20, y + 60);
    context.bezierCurveTo(width * .3, y - 45, width * .65, y + 50, width + 20, y - 95); context.stroke();
  }
  context.shadowBlur = 0;
  frame = requestAnimationFrame(draw);
}
function syncParticles() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null; last = 0;
  if (!document.hidden && currentScreen === 'cover' && !reducedMotion.matches && context) frame = requestAnimationFrame(draw);
  else context?.clearRect(0, 0, width, height);
}
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', syncParticles);
reducedMotion.addEventListener('change', syncParticles);
resize(); syncParticles();
