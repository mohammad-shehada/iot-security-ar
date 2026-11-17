(()=>{
  'use strict';
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const text=(ar,en)=>document.documentElement.lang==='en'?en:ar;
  const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  // Native event dispatch may run microtasks after the capture listener but
  // before the target's click handler. Use the next task to read committed UI.
  const afterAction=callback=>setTimeout(callback,0);
  const key='mohammad-mistakes-v1';let mistakes=load(key,[]);if(!Array.isArray(mistakes))mistakes=[];
  const live=document.createElement('div');live.className='interaction-live';live.setAttribute('role','status');live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');document.body.append(live);
  let clearLive,lastCelebration=0;
  function acknowledge(button,rect,message,emoji,kind='success'){
    live.textContent=message;clearTimeout(clearLive);clearLive=setTimeout(()=>live.textContent='',1500);
    if(button?.isConnected){const cls=kind==='review'?'ui-review':'ui-acknowledge';button.classList.remove(cls);void button.offsetWidth;button.classList.add(cls);setTimeout(()=>button.classList.remove(cls),500)}
    document.querySelectorAll('.interaction-label,.interaction-burst').forEach(n=>n.remove());
    const x=Math.max(100,Math.min(innerWidth-100,rect.left+rect.width/2)),y=Math.max(34,Math.min(innerHeight-70,rect.top-12));
    const label=document.createElement('div');label.className='interaction-label';label.dataset.kind=kind;label.setAttribute('aria-hidden','true');label.textContent=message;label.style.left=x+'px';label.style.top=y+'px';document.body.append(label);
    if(emoji&&!reduced()){
      const burst=document.createElement('div');burst.className='interaction-burst';burst.setAttribute('aria-hidden','true');burst.style.left=(rect.left+rect.width/2)+'px';burst.style.top=rect.top+'px';
      [emoji,'✨'].forEach((symbol,i)=>{const p=document.createElement('span');p.className='interaction-particle';p.textContent=symbol;p.style.setProperty('--drift',(i?-28:26)+'px');p.style.setProperty('--spin',(i?-14:12)+'deg');p.style.setProperty('--delay',(i*.06)+'s');burst.append(p)});document.body.append(burst);setTimeout(()=>burst.remove(),1000);
    }
    setTimeout(()=>label.remove(),1300);
  }
  function record(id,wrong){if(!id)return;const set=new Set(load(key,[]));wrong?set.add(id):set.delete(id);mistakes=[...set];try{localStorage.setItem(key,JSON.stringify(mistakes))}catch{}}
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('button');if(!button)return;
    const rect=button.getBoundingClientRect();
    if(button.matches('.save-post,.bank-save')){
      const bank=button.matches('.bank-save'),card=button.closest('.bank-card,.study-post'),id=card?.id;if(!id)return;
      const before=button.getAttribute('aria-pressed')==='true';
      afterAction(()=>{const saved=load(bank?'muc-bank-saved':'muc-study-saved',[]).includes(id);if(saved===before)return;const target=document.getElementById(id)?.querySelector(bank?'.bank-save':'.save-post');acknowledge(target,rect,saved?text('انضاف للمحفوظات','Added to Saved'):text('انشال من المحفوظات','Removed from Saved'),saved?'🔖':null,saved?'success':'removed')});return;
    }
    if(button.matches('.read-toggle')){
      const before=button.getAttribute('aria-pressed')==='true';
      afterAction(()=>{const reviewed=button.getAttribute('aria-pressed')==='true';if(reviewed===before)return;if(!reviewed){acknowledge(button,rect,text('تم إلغاء علامة المراجعة','Review mark removed'),null,'removed');return}const bar=document.querySelector('#progress');acknowledge(button,rect,bar&&bar.value===bar.max?text('أنهيت مراجعة الأسبوع 🎉','Week reviewed 🎉'):text('خطوة كمان 👏','One more step 👏'),'👏')});return;
    }
    if(!button.matches('.check,.bank-check,.check-blank,.exam-check,.check-all,.check-part'))return;
    const target=button.closest('fieldset.quiz,.bank-card,.exam-blank');
    // A bulk check updates every record but produces only one short reaction.
    const containers=target?[target]:[...document.querySelectorAll('fieldset.quiz,.exam-blank')].filter(c=>c.querySelector('input:checked')||c.querySelector('input[type=text]')?.value.trim());
    afterAction(()=>{
      let graded=false,good=false;
      for(const box of containers){
        const out=box.querySelector('.feedback,.bank-status,.exam-feedback');if(!out||(!out.classList.contains('correct')&&!out.classList.contains('wrong')))continue;
        const wrong=out.classList.contains('wrong');let id;
        if(box.matches('.bank-card')){const q=(window.MUC_QUESTION_BANK||[]).find(q=>q.id===box.id);id=q?.persist||q?.id}
        else if(box.matches('.exam-blank'))id=location.pathname.split('/').pop()+'#'+box.id;
        else id=box.dataset.persist||box.querySelector('input')?.name;
        record(id,wrong);graded=true;good=good||!wrong;
      }
      if(!graded)return;document.dispatchEvent(new CustomEvent('study:graded'));
      if(Date.now()-lastCelebration<900)return;lastCelebration=Date.now();
      const current=target?.matches('.bank-card')?document.getElementById(target.id)?.querySelector('.bank-check'):button;
      acknowledge(current,rect,containers.length>1?text('تم التصحيح؛ راجع التفسير','Marked — review the explanations'):good?text('إجابة صحيحة، أحسنت ✓','Correct, well done ✓'):text('راجع التفسير وجرّب كمان مرة','Review the explanation and try again'),good?'✓':null,good?'success':'review');
    });
  },true);
})();
