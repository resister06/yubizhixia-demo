// Second-year starting values supplied by the author, 2026-11-07.
export const factionLabels={gu:'顾家',xie:'谢家',lu:'陆家',pei:'裴家',palace:'内廷',humble:'寒门',governance:'治理',fiscal:'财政',military:'军事'};
export const factionValues={gu:70,xie:56,lu:50,pei:60,palace:46,humble:30,governance:50,fiscal:50,military:50};
const applied=new Map();
export function applyFactionEffects(memorial,choice){
  if(applied.has(memorial.episode))return {...applied.get(memorial.episode),repeated:true};
  const changes=[];
  for(const [key,delta] of Object.entries(choice.effects||{})){
    const before=factionValues[key],after=Math.max(0,Math.min(100,before+delta));
    factionValues[key]=after;changes.push({key,label:factionLabels[key],delta,before,after});
  }
  const result={changes,repeated:false};applied.set(memorial.episode,result);return result;
}

export function factionStatus(value){return value>=80?'膨胀':value>=60?'强势':value>=40?'常态':value>=20?'偏弱':'边缘';}
export function mechanismStatus(value){return value<=20?'崩溃边缘':value<=40?'紧张':value<=60?'平稳':value<=80?'良好':'鼎盛';}
