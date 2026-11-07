import { renderRichText } from './rich-text.js';
// 本版接入第一道政务试阅；全年显示春3、夏2、秋3、冬2，计错阈值尚未定义。
import { repairMemorial, memorials } from './story-data.js';
export const playerProfile = { name: '未命名', role: '储君' };
export function setPlayerName(name) {
  playerProfile.name = name;
  document.querySelector('#player-name').textContent = name;
}
const firstMemorial = {
  actual: '由甲官督修青川河堤，另派人员独立核验钱粮。工程与财务监督分开，既用其治水经验，也为钱粮设置约束。',
  options: [
    { id: 'a', title: '交给甲官，工程与钱粮都由其全权处理', attitude: '部分采纳', feedback: '用其所长是对的，可钱粮与工程，不宜尽出一门。', risk: '若工程与钱粮尽出一门，可能削弱独立监督，使地方势力进一步集中权力。' },
    { id: 'b', title: '交给乙官，确保事情掌握在皇家信任的人手中', attitude: '不采纳', feedback: '忠心可贵，却不能代替治水的本事。', risk: '若只看忠心而忽略经验，可能在春汛前延误工期，增加险情。' },
    { id: 'c', title: '由甲官督修，另派人员核验钱粮', attitude: '采纳', feedback: '用人之才，也须立下约束。', risk: '' },
  ],
  questions: [
    ['甲官与乙官，各有什么长处？', '甲官曾主持过类似河工，熟悉青川河道。乙官是皇家信任的近臣，办事认真，却没有治水经验。春汛只剩二十日，熟悉河务的人更容易及时安排工程。'],
    ['甲官出身顾氏，会有什么顾虑？', '青川顾氏在当地已有很大影响力。用甲官的经验，并不意味着工程与钱粮都必须交由她一人掌管。'],
    ['工程与钱粮，可以分开吗？', '可以。朝廷可另派人员核验钱粮，不必把施工与财务监督交给同一人。既让熟悉河务的人办事，也为权力立下约束。'],
  ],
};

export function initStudy({onReadMemorial, onPolicyFeedback} = {}) {
  const memorial = document.querySelector('#memorial-panel');
  const companion = document.querySelector('#companion-panel');
  const form = document.querySelector('#policy-form');
  const submit = document.querySelector('#submit-policy');
  let read = false, activeIndex = 0;
  const completed = new Set();
  const skipped = new Set();
  const policyFor = () => activeIndex === 0 ? firstMemorial : memorials[activeIndex];
  const beginReading = () => onReadMemorial?.(memorials[activeIndex].episode);
  function selectMemorial(index) {
    activeIndex=index;
    const data=memorials[index];
    document.body.dataset.season=data.season==='秋'?'autumn':'spring';
    document.querySelector('#memorial-title').textContent=data.title;
    document.querySelector('.memorial-summary').textContent=data.summary;
    renderRichText(document.querySelector('.memorial-summary'),data.summary,data.redTerms);
    document.querySelector('#memorial-panel .paper-kicker').textContent=`奏折${data.number} · ${data.season}`;
    document.querySelector('#year-progress').textContent=`${data.year===2?'第二年':'第一年'} · ${data.season} · 奏折${data.number}${completed.has(index)?'已阅':''}`;
    document.querySelector('#memorial-hints').replaceChildren();
    for(const hint of data.hints){
      const item=document.createElement('article'),title=document.createElement('h3'),text=document.createElement('p');
      title.textContent=hint.title;renderRichText(text,hint.text,data.redTerms);item.append(title,text);document.querySelector('#memorial-hints').append(item);
    }
    document.querySelector('#policy-options').replaceChildren();
    for(const option of policyFor().options){
      const label=document.createElement('label');label.className='policy-option';
      const input=document.createElement('input');input.type='radio';input.name='policy';input.value=option.id;
      const text=document.createElement('span');text.textContent=option.title;label.append(input,text);document.querySelector('#policy-options').append(label);
    }
    form.reset();submit.disabled=true;
    const readButton=document.querySelector('#read-memorial');
    readButton.disabled=completed.has(index);
    readButton.textContent=readButton.disabled?'奏折已阅':'批阅奏折';
    document.querySelectorAll('.event-dot').forEach((dot,i)=>{dot.classList.toggle('active',i===data.timelineIndex);dot.classList.toggle('complete',memorials.some((m,j)=>m.timelineIndex===i && completed.has(j)));});
    document.querySelectorAll('.quarter-group .quarter-milestone').forEach((mark,i)=>{const season=['春','夏','秋','冬'][i],current=season===data.season;mark.classList.toggle('current',current);mark.setAttribute('aria-label',`${season}季${current?'，当前季度':''}`);});
    recallButton.setAttribute('aria-label',`点击路清河，回顾${data.hints.length}条提示`);
    const questions=document.querySelector('#companion-questions');questions.replaceChildren();
    for(const hint of data.hints){const detail=document.createElement('details'),title=document.createElement('summary'),text=document.createElement('p');title.textContent=hint.title;renderRichText(text,hint.text,data.redTerms);detail.append(title,text);questions.append(detail);}
    document.querySelector('.companion-greeting').textContent='殿下想回顾哪一处？';
  }
  const hintReview = document.querySelector('#memorial-hint-review');
  const recallButton = document.querySelector('#recall-memorial-hints');
  function closeHints() { hintReview.hidden = true; recallButton.setAttribute('aria-expanded','false'); }
  const closePanels = () => { closeHints(); for (const panel of [memorial, companion]) if (panel.open) panel.close(); };
  const openPanel = panel => { closePanels(); panel.showModal(); };
  document.querySelector('#read-memorial').addEventListener('click', () => onReadMemorial ? beginReading() : openPanel(memorial));
  recallButton.addEventListener('click', () => {
    hintReview.hidden = !hintReview.hidden;
    recallButton.setAttribute('aria-expanded',String(!hintReview.hidden));
  });
  document.querySelector('#close-memorial-hints').addEventListener('click',closeHints);
  document.querySelector('#replay-memorial').addEventListener('click', () => { closePanels(); beginReading(); });
  document.querySelector('#ask-companion').addEventListener('click', () => openPanel(companion));
  document.querySelector('#consult-companion').addEventListener('click', () => openPanel(companion));
  document.querySelector('#return-to-memorial').addEventListener('click', () => openPanel(memorial));
  document.querySelectorAll('[data-close-panel]').forEach(button => button.addEventListener('click', closePanels));
  document.querySelector('#player-name').textContent = playerProfile.name;
  document.querySelector('#player-role').textContent = playerProfile.role;

  // 每季奏折数量：春3、夏2、秋3、冬2，最后抵达年末。
  const axis = document.querySelector('#quarter-axis');
  const memorialCounts = [3, 2, 3, 2];
  for (const [index, season] of ['春', '夏', '秋', '冬'].entries()) {
    const group = document.createElement('div'); group.className = 'quarter-group';
    const milestone = document.createElement('span'); milestone.className = `quarter-milestone${index === 0 ? ' current' : ''}`;
    milestone.setAttribute('aria-label', `${season}季${index === 0 ? '，当前季度' : ''}`);
    const dot = document.createElement('i'); dot.setAttribute('aria-hidden', 'true');
    const label = document.createElement('b'); label.textContent = season; milestone.append(dot, label); group.append(milestone);
    for (let n = 0; n < memorialCounts[index]; n++) {
      const timelineIndex=memorialCounts.slice(0,index).reduce((a,b)=>a+b,0)+n;
      const playable=memorials.findIndex(data=>data.timelineIndex===timelineIndex);
      const event = document.createElement(playable>=0 ? 'button' : 'span'); event.className = `event-dot${index === 0 && n === 0 ? ' active' : ''}`;
      if(playable>=0){event.type='button';event.title=memorials[playable].title;event.addEventListener('click',()=>{selectMemorial(playable);beginReading();});}else event.setAttribute('role','img');
      event.setAttribute('aria-label', `${season}季第${n + 1}道奏折`); group.append(event);
    }
    axis.append(group);
  }
  const yearEnd = document.createElement('span'); yearEnd.className = 'quarter-milestone year-end';
  yearEnd.setAttribute('aria-label', '年末');
  const endDot = document.createElement('i'); endDot.setAttribute('aria-hidden', 'true');
  const endLabel = document.createElement('b'); endLabel.textContent = '年末';
  yearEnd.append(endDot, endLabel); axis.append(yearEnd);
  form.addEventListener('change', () => { submit.disabled = !form.querySelector('input:checked'); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const input = form.querySelector('input:checked');
    const choice = policyFor().options.find(option => option.id === input?.value);
    if (!choice) return;
    read = true;
    completed.add(activeIndex);
    document.querySelector('#year-progress').textContent = `${memorials[activeIndex].year===2?'第二年':'第一年'} · ${memorials[activeIndex].season} · 奏折${memorials[activeIndex].number}已阅`;
    document.querySelector('.event-dot.active')?.classList.add('complete');
    closePanels();
    onPolicyFeedback?.({choice, actual:policyFor().actual, memorialIndex:activeIndex});
  });
  selectMemorial(0);
  return { closePanels, get activeMemorialIndex() { return activeIndex; }, get hasPendingMemorial() {return !completed.has(activeIndex);},
  prepareSecondYearMemorial() {selectMemorial(3);document.querySelector('#quarter-axis').hidden=true;},
  enterSecondYear() {
    closePanels();
    document.querySelector('#year-progress').textContent='第二年 · 任务：削弱旧臣大权';
    document.querySelector('#quarter-axis').hidden=true;
    document.querySelector('#read-memorial').disabled=true;
    document.querySelector('#read-memorial').textContent='奏折已阅';
  }, skipMemorial(index=activeIndex) {
    closePanels();
    completed.add(index);skipped.add(index);
    const next=memorials.findIndex((data,i)=>i>index && !completed.has(i));
    selectMemorial(next>=0 ? next : index);
    document.querySelectorAll('.event-dot').forEach((dot,i)=>dot.classList.toggle('skipped',memorials.some((data,j)=>data.timelineIndex===i && skipped.has(j))));
  }, advanceAfterFeedback(index) { selectMemorial(Math.min(index+1,memorials.length-1)); }, openDecision:() => {
    form.reset(); submit.disabled = true; openPanel(memorial);
  }, get hasReadMemorial() { return read; } };
}
