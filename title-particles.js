let raf=0,run=0;
export function stopTitleParticles(){run++;cancelAnimationFrame(raf);}
export async function formTitle(canvas,image,reducedMotion,onComplete){
  stopTitleParticles();const token=run;
  const screen=canvas.closest('.title-finale');screen.classList.remove('assembled');
  try{await image.decode();}catch{screen.classList.add('assembled');image.style.opacity='1';onComplete?.();return;}
  if(token!==run)return;
  const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=w*dpr;canvas.height=h*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  const sw=800,sh=Math.round(sw*image.naturalHeight/image.naturalWidth);
  const sample=document.createElement('canvas');sample.width=sw;sample.height=sh;
  const scan=sample.getContext('2d',{willReadFrequently:true});scan.drawImage(image,0,0,sw,sh);
  const pixels=scan.getImageData(0,0,sw,sh).data;
  const width=Math.min(w*.76,1120),scale=width/sw,left=(w-width)/2,top=h*.45-sh*scale/2;
  const particles=[];
  for(let y=0;y<sh;y+=5)for(let x=0;x<sw;x+=5){
    const i=(y*sw+x)*4;
    if(pixels[i+3]<100||pixels[i]+pixels[i+1]+pixels[i+2]<80)continue;
    particles.push({x:left+x*scale,y:top+y*scale,sx:Math.random()*w,sy:Math.random()*h,delay:Math.random()*.25,r:.7+Math.random()*1.3,color:`rgb(${Math.max(190,pixels[i])},${Math.max(135,pixels[i+1])},${Math.min(160,Math.max(65,pixels[i+2]))})`,wave:Math.random()*Math.PI*2});
  }
  const duration=reducedMotion?400:4400,start=performance.now();
  function draw(now){
    if(token!==run)return;
    const t=Math.min(1,(now-start)/duration);ctx.clearRect(0,0,w,h);
    for(const p of particles){
      const progress=Math.max(0,Math.min(1,(t-p.delay)/(1-p.delay))),ease=1-Math.pow(1-progress,3);
      const x=p.sx+(p.x-p.sx)*ease+Math.sin(progress*8+p.wave)*(1-ease)*40;
      const y=p.sy+(p.y-p.sy)*ease+Math.cos(progress*8+p.wave)*(1-ease)*40;
      ctx.globalAlpha=Math.min(1,progress*5+.12)*(1-Math.max(0,(t-.86)/.14));ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();
    }
    image.style.opacity=String(Math.max(0,(t-.76)/.24));
    if(t<1)raf=requestAnimationFrame(draw);else{ctx.clearRect(0,0,w,h);ctx.globalAlpha=1;screen.classList.add('assembled');image.style.opacity='1';onComplete?.();}
  }
  image.style.opacity='0';raf=requestAnimationFrame(draw);
}
