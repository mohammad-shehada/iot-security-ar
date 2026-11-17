(()=>{
  'use strict';
  const isEnglish=()=>document.documentElement.lang==='en';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const answers=read('muc-lecture1-answers',{});
  const groups=[...document.querySelectorAll('fieldset.quiz')];
  const key=f=>f.dataset.persist||f.querySelector('input')?.name;
  function score(section){
    if(!section)return;
    const questions=[...section.querySelectorAll('.imported-quiz')];
    let attempted=0,correct=0;
    questions.forEach(f=>{const selected=f.querySelector('input:checked');if(selected)attempted++;if(f.dataset.checked==='true'&&selected?.value===f.dataset.answer)correct++});
    const output=section.querySelector('.practice-score');
    if(output)output.textContent=isEnglish()?`${attempted}/${questions.length} answered · ${correct} correct after checking`:`أجبت ${attempted} من ${questions.length} · الصحيح بعد التصحيح: ${correct}`;
  }
  groups.forEach(f=>{
    const id=key(f);if(!id)return;
    const record=answers[id];
    if(record){const input=f.querySelector(`input[value="${record.value}"]`);if(input)input.checked=true;}
    f.addEventListener('change',()=>{
      const selected=f.querySelector('input:checked');if(!selected)return;
      answers[id]={value:selected.value,checked:false};f.dataset.checked='false';
      const feedback=f.querySelector('.feedback');if(feedback){feedback.textContent='';feedback.className='feedback';}
      write('muc-lecture1-answers',answers);score(f.closest('.imported-practice'));
    });
    f.querySelector('.check')?.addEventListener('click',()=>{
      const selected=f.querySelector('input:checked');if(!selected)return;
      f.dataset.checked='true';answers[id]={value:selected.value,checked:true};write('muc-lecture1-answers',answers);
      score(f.closest('.imported-practice'));
    });
    if(record?.checked)f.querySelector('.check')?.click();
  });
  document.querySelectorAll('.imported-practice').forEach(section=>{
    section.querySelector('.check-part').onclick=()=>section.querySelectorAll('.quiz .check').forEach(b=>b.click());
    section.querySelector('.retry-part').onclick=()=>{
      section.querySelectorAll('.quiz').forEach(f=>{
        f.querySelectorAll('input').forEach(i=>i.checked=false);f.dataset.checked='false';delete answers[key(f)];
        const out=f.querySelector('.feedback');out.textContent='';out.className='feedback';
      });write('muc-lecture1-answers',answers);score(section);
    };
    section.querySelector('.reveal-blanks').onclick=()=>{
      const details=[...section.querySelectorAll('.blank-question details')],open=details.some(d=>!d.open);details.forEach(d=>d.open=open);
    };score(section);
  });
  const banner=document.querySelector('.resume-banner');
  const last=read('muc-lecture1-last-slide',null);
  if(banner&&Number.isInteger(last)&&last>=1&&last<=29){
    banner.hidden=false;banner.querySelector('.resume-label').textContent=isEnglish()?`Your last reading position: Slide ${last}`:`آخر موضع قراءة: سلايد ${last}`;
    banner.querySelector('button').onclick=()=>{location.hash=(isEnglish()?'en-':'')+'slide-'+last;};
  }
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{
      entries.filter(e=>e.isIntersecting).forEach(e=>{const n=Number(e.target.id.match(/slide-(\d+)$/)?.[1]);if(n)write('muc-lecture1-last-slide',n);});
    },{rootMargin:'-15% 0px -55% 0px',threshold:0});
    document.querySelectorAll('section[id^="slide-"],section[id^="en-slide-"]').forEach(s=>observer.observe(s));
  }
  document.querySelector('#muc-language')?.addEventListener('change',()=>{
    document.querySelectorAll('.imported-practice').forEach(score);
    if(banner&&!banner.hidden)banner.querySelector('.resume-label').textContent=isEnglish()?`Your last reading position: Slide ${last}`:`آخر موضع قراءة: سلايد ${last}`;
  });
})();
