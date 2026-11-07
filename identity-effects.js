// 并蒂宝相花：保留原立绘，花框与光线由矢量绘制。
export function initIdentityEffects(reducedMotion) {
  const screen = document.querySelector('#identity');
  const video = screen.querySelector('video');
  // 大片重瓣与小花团错落穿插，避免等距、等大的花瓣阵列。
  function blossom(angle, scale, tilt) {
    const outer = [-66,-36,-6,27,61].map((a,i)=>`<g transform="rotate(${a} 0 9)"><path d="M0 15 C-13 5 -31 -8 -27 -28 C-25 -39 -15 -39 -14 -49 C-4 -44 0 -35 2 -28 C14 -39 23 -24 19 -11 C16 1 7 11 0 15Z" fill="${i%2?'#799d89':'#3c6a68'}" stroke="#e8c386" stroke-width="1.4"/><path d="M0 10 Q-17 -8 -14 -30 Q-1 -14 0 10" fill="#ddb875" opacity=".8"/><path d="M-3 5 Q-14 -8 -14 -21" fill="none" stroke="#f5dba0" stroke-width=".8"/></g>`).join('');
    const inner = [-46,-15,20,53].map((a,i)=>`<path transform="rotate(${a} 0 13)" d="M0 18 C-13 7 -24 -4 -19 -19 Q-8 -16 -5 -32 Q7 -26 12 -16 Q24 -13 17 0 Q10 12 0 18Z" fill="${i%2?'#b84c2c':'#8e2c22'}" stroke="#efc780" stroke-width="1.3"/>`).join('');
    return `<g transform="rotate(${angle} 250 250)"><g transform="translate(250 60) rotate(${tilt}) scale(${scale})">${outer}${inner}<path d="M-15 14 Q-13 -3 0 -10 Q14 0 16 14 Q0 31 -15 14Z" fill="#e2b265" stroke="#ffe1a0" stroke-width="1.3"/><path d="M-20 20 Q0 9 22 19 Q12 33 -4 30Z" fill="#658d79" stroke="#e8c386" stroke-width="1.2"/><circle cy="17" r="3" fill="#fff0ba"/></g></g>`;
  }
  const petals = [[-19,1.25,-9],[66,.64,16],[135,1.05,9],[214,.78,-17],[275,.47,12]].map(v=>blossom(...v)).join('');
  const flourishes = [-62,21,43,98,174,194,245,305].map((a,i)=>`<g transform="rotate(${a} 250 250)"><path d="M250 65 C224 56 216 79 232 87 C249 95 259 78 250 75 C240 69 241 83 248 81 M233 69 Q210 53 203 69 Q210 84 227 79" fill="${i%2?'#598775':'#927649'}" stroke="#e8c483" stroke-width="1.4"/><path d="M250 66 Q270 44 283 55 Q280 73 260 76" fill="#46776d" stroke="#e8c483" stroke-width="1.3"/></g>`).join('');
  const frame = `<svg class="flower-frame" viewBox="0 0 500 500" aria-hidden="true"><defs><radialGradient id="flowerGold"><stop stop-color="#fff4c0"/><stop offset=".5" stop-color="#e4b365"/><stop offset="1" stop-color="#9b642e"/></radialGradient></defs><circle cx="250" cy="250" r="194" fill="none" stroke="#6a3521" stroke-width="17"/><circle cx="250" cy="250" r="194" fill="none" stroke="url(#flowerGold)" stroke-width="5"/><circle cx="250" cy="250" r="183" fill="none" stroke="#e6ba73" stroke-width="1.5"/>${flourishes}${petals}<circle class="flower-trace" cx="250" cy="250" r="194" fill="none" stroke="#fff1b6" stroke-width="3" pathLength="1"/></svg>`;
  screen.querySelectorAll('.identity-card').forEach(card=>{
    card.insertAdjacentHTML('afterbegin',frame);
    card.querySelector('.identity-reveal-hint').textContent='点击选择';
  });
  screen.querySelector('.identity-light').innerHTML=`<svg viewBox="0 0 1440 900" preserveAspectRatio="none"><defs><filter id="beamGlow"><feGaussianBlur stdDeviation="3"/></filter></defs><g class="twin-vines" fill="none" stroke="#ecc17d" stroke-width="2"><path d="M460 670 C530 720 600 704 720 650 C840 704 910 720 980 670 M720 650 C665 640 650 600 681 597 C710 597 704 625 689 619 M720 650 C775 640 790 600 759 597 C730 597 736 625 751 619"/></g>${Array.from({length:16},(_,i)=>{const left=i<8;const endX=(left?460:980)+Math.cos(i*1.7)*180;const endY=450+Math.sin(i*1.7)*180;return `<path class="split-ray" style="--ray:${i*.035}s" d="M720 450 Q${left?540:900} ${250+i%8*48} ${endX} ${endY}" fill="none" stroke="#ffdf8e" stroke-width="2" pathLength="1"/>`;}).join('')}</svg>`;
  function play(){
    screen.classList.remove('flowers-opening');
    void screen.offsetWidth;
    screen.classList.add('flowers-opening');
    if(!reducedMotion.matches){video.currentTime=0;video.play().catch(()=>{});}
  }
  document.querySelector('#replay-identity').addEventListener('click',play);
  return {play,stop(){video.pause();screen.classList.remove('flowers-opening');}};
}
