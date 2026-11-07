// Safe text rendering shared by the typewriter, history, and memorial hints.
export function renderRichText(element,text,terms=[]) {
  element.replaceChildren();
  const matches=terms.filter(Boolean).sort((a,b)=>b.length-a.length);
  let plain='';
  for(let i=0;i<text.length;) {
    const term=matches.find(term=>text.startsWith(term,i));
    if(term){
      if(plain){element.append(document.createTextNode(plain));plain='';}
      const span=document.createElement('strong');span.className='story-emphasis';span.textContent=term;element.append(span);i+=term.length;
    }else plain+=text[i++];
  }
  if(plain)element.append(document.createTextNode(plain));
}
