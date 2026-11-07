// 文本同步自创意对话 01a19aec-48d7-79e3-8f92-ee69b7070fac 的最新稿。
// 剧情节点可独立预览；不代表前置政务已完成，也不固定全年事件数。
const line = (speaker, text, place = 'study', extra = {}) => ({ speaker, text, place, ...extra });

export const places = {
  study: { name: '书房', time: '初习朱批', atmosphere: '窗影轻移，案上朱墨未干。' },
  entrance: { name: '御书房外', time: '殿外闻语', atmosphere: '你停在门外。声音从殿内传来。' },
};

// 接图时只需填写这三个资源路径，流程与提示共用同一份内容。
export const repairMemorial = {
  title: '春汛将至，派谁督修河堤',
  summary: '青川河堤多处损坏，距春汛只剩二十日，需尽快确定督修人选。',
  images: { overview: 'assets/repair-overview-v1.png', a: 'assets/repair-official-a-v1.png', b: 'assets/repair-official-b-v1.png' },
  hints: [
    { key:'a', title:'甲官', text:'甲官曾主持过类似河工，熟悉青川河道。但她出身青川顾氏，顾氏在当地已有很大影响力。用其治水经验，也须考虑钱粮与工程是否都由她一人掌管。' },
    { key:'b', title:'乙官', text:'乙官是皇家信任的近臣，办事认真，却没有治水经验。距春汛只剩二十日，能否及时安排工程，也须一并考虑。' },
    { key:'oversight', title:'另派人员核验钱粮', text:'朝廷可另派人员独立核验钱粮，将施工与财务监督分开。既让熟悉河务的人办事，也为权力立下约束。' },
  ],
};

export const reliefMemorial = {
  title:'东郊流民聚城，常平仓是否开仓',
  summary:'春汛未至，东郊已有流民聚集。京兆府请示：是否开常平仓赈济，是否遣返流民。',
  redTerms:['流民聚集','只够京畿三月之用','青川河工旧役','以工代赈','自家主持赈济'],
  images:{overview:'assets/spring02-overview-v1.png',grain:'assets/spring02-grain-v1.png',work:'assets/spring02-work-v1.png',donation:'assets/spring02-donation-v1.png'},
  hints:[
    {key:'grain',title:'常平仓存粮',text:'常平仓存粮只够京畿三月之用，若全开，后续河工与春耕都要受影响。'},
    {key:'work',title:'以工代赈',text:'流民中不少是青川河工旧役，熟悉河务，可转为以工代赈。'},
    {key:'donation',title:'豪强捐粮',text:'有地方豪强愿捐粮，但希望由自家主持赈济，并求朝廷旌表。'},
  ],
  actual:'限量开仓，以工代赈修河堤；豪强捐粮只记名，不授主持权。这样既救急、用工，也兼顾制衡。',
  options:[
    {id:'a',title:'全开常平仓，并请捐粮豪强主持赈济',feedback:'开仓可，主持之人不可。',risk:'急民可嘉，但将赈济权交给地方豪强，会让救济受制于一门；全开存粮，也会影响后续河工与春耕。'},
    {id:'b',title:'闭仓遣返流民，以免耗粮生乱',feedback:'闭仓遣返，是把小患赶成大患。',risk:'民未乱而先激之。眼下应先安置救急，不能将流民一推了之。'},
    {id:'c',title:'限量开仓，以工代赈修河堤；豪强捐粮只记名，不授主持权',feedback:'救急也要立规矩。',risk:'限量开仓救急，安排熟悉河务的流民修堤，又将捐粮与主持赈济的权力分开，三者可以兼顾。'},
  ],
};
export const tradeMemorial = {
  after:'year-interlude',
  title:'商税新例引发不满，是否暂缓推行',
  summary:'户部为补春季赈灾和边防军需的缺口，拟在部分商路试行新的商税核验办法，以减少漏税。新例推行三个月，商户反映税册繁琐、货物滞留，要求暂缓。',
  redTerms:['减少漏税','陆廷芳','重复索费'],
  images:{},
  hints:[
    {key:'lu',title:'陆家与漕运',text:'陆家掌漕运与仓储，通州仓场的账在陆廷芳手里。'},
    {key:'tax',title:'商税核验',text:'新例实行后，查出过去未登记的商货。有税吏重复索费，商旅在码头要等上好几天。'},
  ],
  actual:'将核验范围缩到两条商路，试满一季再定。改革非一日之功，先在两条商路试行，既能兼顾各方，也不至于无法收场。',
  options:[
    {id:'a',title:'新例不改，先查办重复收费的税吏，商路照常核验',feedback:'查办重复收费的税吏，能让改革进一步推进；但商税新例尚未稳固，立刻问责税吏，还会牵动地方与陆家的不满。',risk:'查税要推进，也须看清眼下能否同时承受各方阻力。'},
    {id:'b',title:'新例暂缓三个月，等秋粮运完再议',feedback:'秋粮按时运到，陆家也能松一口气。不过，暂缓的三个月里，漏税仍会照旧。',risk:'户部会认为你遇阻就退。暂缓容易，日后复行却未必容易。'},
    {id:'c',title:'核验范围缩到两条商路，试满一季再定',feedback:'先缩到两条商路试行，风险较小，也能兼顾各方利益。',risk:'代价是执行拖长、改革放缓。殿下要记得，试行不是搁置，一季后还须再作决定。'},
  ],
};
repairMemorial.number=1; repairMemorial.season='春'; repairMemorial.timelineIndex=0; repairMemorial.episode='memorial';
reliefMemorial.number=2; reliefMemorial.season='春'; reliefMemorial.timelineIndex=1; reliefMemorial.episode='memorial-2';
tradeMemorial.number=8; tradeMemorial.season='秋'; tradeMemorial.timelineIndex=7; tradeMemorial.episode='memorial-8';
export const appointmentMemorial={
  after:'official-preview',
  year:2,number:1,season:'春',timelineIndex:-1,episode:'memorial-appointment',title:'州郡佐官缺额，任用章程如何定',
  summary:'监国三个月，吏部报州郡佐官缺得多，请定任用章程。顾承弼递了条陈，主张“佐官宜由正官举荐，方知底细”。话说得在理，可州郡正官多半出自顾家门生，照这么办，佐官一层也进了顾家的网。主控若准，顾家在中枢之外又多一层；若不准，等于当朝驳回首辅的条陈。',
  images:{overview:'assets/appointment-overview-v1.jpg',gu:'assets/appointment-gu-v1.jpg',humble:'assets/appointment-humble-v1.jpg',xie:'assets/appointment-xie-v1.jpg'},redTerms:['顾家','寒门','谢家'],
  hints:[
    {key:'gu',title:'顾家',text:'顾家门生故吏遍布六部，州郡正官多出其门。'},
    {key:'humble',title:'寒门',text:'寒门出身的官员多卡在佐官这一级，上不去。考选一开，他们才有路。'},
    {key:'xie',title:'谢家',text:'谢家在士林中声望高，对考选一事态度温和，既不反对，也不出头。'},
  ],
  options:[
    {id:'a',title:'准顾承弼所请，佐官由正官举荐',feedback:'旧臣安心，利于维持与顾氏的关系；但佐官一层尽入顾家，寒门无路。',effects:{gu:3,humble:-2,xie:-1,governance:-2}},
    {id:'b',title:'佐官一律由吏部考选，举荐名额取消',feedback:'削弱顾氏，寒门有路，人事权也收回吏部；但顾承弼当面难堪，关系变差。',effects:{gu:-3,humble:2,xie:1,governance:2}},
    {id:'c',title:'七成考选，三成留给正官举荐',feedback:'暂时避免了重大矛盾，但朝局的不平衡没有得到改善，两头都不满意。',effects:{gu:-1,governance:-1}},
  ],
};
export const memorials = [repairMemorial, reliefMemorial, tradeMemorial, appointmentMemorial];

export const episodes = {
  memorial: {
    memorialIndex:0, title: repairMemorial.title, stage:'第一年 · 春 · 奏折一', decision:true,
    lines: [
      line('旁白', repairMemorial.summary, 'study', {visual:'overview'}),
      line('你', '有哪些人选合适？'),
      line('路清河', '综合各方面因素，可选之人有两个：'),
      line('路清河', repairMemorial.hints[0].text, 'study', {visual:'a'}),
      line('路清河', repairMemorial.hints[1].text, 'study', {visual:'b'}),
      line('路清河', repairMemorial.hints[2].text),
    ],
  },
  'memorial-2': {
    memorialIndex:1, title:reliefMemorial.title, stage:'第一年 · 春 · 奏折二', decision:true,
    lines:[
      line('旁白',reliefMemorial.summary,'study',{visual:'overview',redTerms:reliefMemorial.redTerms}),
      line('你','流民聚在城外，该如何赈济安置？'),
      line('路清河','此事要兼顾眼前救急与后续用粮，还有三件事须请殿下留意：'),
      ...reliefMemorial.hints.map(hint=>line('路清河',hint.text,'study',{visual:hint.key,redTerms:reliefMemorial.redTerms})),
    ],
  },
  'memorial-8': {
    memorialIndex:2, title:tradeMemorial.title, stage:'第一年 · 秋 · 奏折八', decision:true, unlockFamily:'lu',
    lines:[
      line('旁白','商税新例试行到第三个月，漕运总督陆廷芳请见。他进门时还带着码头上的泥。'),
      line('陆廷芳','殿下，臣管了几十年漕运。船到码头，一天都等不得。漕粮误了期，京城的米价就要涨。'),
      line('旁白',tradeMemorial.summary,'study',{redTerms:tradeMemorial.redTerms}),
      line('你','陆家与这道奏折，有什么关联？'),
      line('路清河',tradeMemorial.hints[0].text,'study',{redTerms:tradeMemorial.redTerms}),
      line('路清河','殿下，不妨先看舆图。我已将陆家所涉的漕运与仓储记在图上。往后遇到各方家族，也可逐一记下，辨清他们与朝局的关联。'),
      line('路清河','舆图就在书案上，点开便能查看。再点“陆家”二字，就能回顾目前所知的家族信息。','study',{introduceMap:true}),
      line('路清河',tradeMemorial.hints[1].text,'study',{redTerms:tradeMemorial.redTerms}),
      line('你','既要补足钱粮，也不能误了漕运。让我再权衡一番。'),
    ],
  },
  'memorial-appointment':{
    memorialIndex:3,title:appointmentMemorial.title,stage:'第二年 · 春 · 奏折一',decision:true,
    lines:[
      line('旁白',appointmentMemorial.summary,'study',{visual:'overview',redTerms:appointmentMemorial.redTerms}),
      line('你','正官举荐与吏部考选，各会牵动哪些人？'),
      ...appointmentMemorial.hints.map(hint=>line('路清河',hint.text,'study',{visual:hint.key,redTerms:appointmentMemorial.redTerms})),
      line('路清河','顾家势力强势。继续扩大其人事权，可能使各方力量更不平衡，请谨慎决断。殿下也可在地图中查看各方数值。','study',{redTerms:appointmentMemorial.redTerms}),
    ],
  },
  opening: {
    title: '朱笔初醒', stage: '初习朱批 · 开篇', next: 'handover',
    endTitle: '今日学过的，往后才用得上',
    endText: '你重新提起笔。眼前的奏章，似乎也有了与方才不同的分量。',
    lines: [
      line('旁白', '朱笔搁在指间，墨迹已经凝住。你被一声轻唤惊醒，案上的奏章还停在方才那一页。'),
      line('路清河', '怎么又睡着了？', 'study', {introduceCompanion:true}),
      line('路清河', '把奏折批完再睡吧'),
    ],
  },
  handover: {
    title: '殿外闻语', stage: '第二年 · 接掌朝堂', unlock: 'influence',
    lines: [
      line('旁白', '去岁修堤，你留下了老臣的职务，却将钱粮核验交由另一位官员。如今你开始接掌朝堂，旧臣仍对此耿耿于怀。', 'entrance', { heading: '留其职，分其权' }),
      line('旁白', '你有事来寻母皇，刚到殿外，便听见里面传来熟悉的声音。', 'entrance'),
      line('老臣', '臣经手此事多年，从未误过陛下。如今殿下另遣人核验钱粮，岂不是叫旁人以为，臣已失了圣心？', 'entrance', { voice: '殿内' }),
      line('旁白', '你停下脚步。', 'entrance'),
      line('母皇', '她免了你的职？', 'entrance', { voice: '殿内' }),
      line('老臣', '不曾。只是历来……', 'entrance', { voice: '殿内' }),
      line('母皇', '既未免你的职，也未废你的议，不过将经手与核验分开，有何不妥？', 'entrance', { voice: '殿内' }),
      line('旁白', '殿内静了片刻。', 'entrance'),
      line('老臣', '可臣毕竟追随陛下多年。', 'entrance', { voice: '殿内' }),
      line('旁白', '母皇的声音缓了些。', 'entrance'),
      line('母皇', '你的功劳，朕记得。', 'entrance', { voice: '殿内' }),
      line('旁白', '稍停，她又道：', 'entrance'),
      line('母皇', '可这天下，很快便不是朕来做主了。她有她的章程，你也该提前适应适应。', 'entrance', { voice: '殿内', emphasis: true }),
      line('旁白', '你垂眼望着手里的文书，没有再往前走。', 'entrance'),
      line('旁白', '回到书房，你将那份官员名册重新摊开。'),
      line('路清河', '殿下方才要问陛下的事，可问清了？'),
      line('你', '不必问了。'),
      line('旁白', '你提起笔，停在一个熟悉的名字旁。'),
      line('你', '她是真的要我接手。', 'study', { emphasis: true }),
      line('旁白', '路清河看了你片刻，将几份履历移到名册旁。'),
      line('路清河', '那殿下再看看这些人。'),
      line('你', '从前我只想，谁最适合办这件事。'),
      line('路清河', '如今还要多想一步。事情办成之后，她手中会多出什么？朝中又有谁能约束她？'),
      line('旁白', '你缓缓点头。'),
      line('你', '把她们各自掌管的职务，还有家族之间的关系，都拿来吧。'),
    ],
  },
};

export const influenceDimensions = [
  { key:'fiscal',title:'财政',seal:'财',description:'国库丰盈，但难以同时支撑修堤、赈灾、军饷。' },
  { key:'governance',title:'治理',seal:'治',description:'政令运行尚还畅通，但旧制积弊已久。' },
  { key:'military',title:'军事',seal:'军',description:'北境守得住，但兵为将有的隐患已经存在。' },
  { key:'balance',title:'朝局',seal:'局',description:'顾家势力较强，朝局平衡度偏低；需结合六方势力分布观察。' },
];
