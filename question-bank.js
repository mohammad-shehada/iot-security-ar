(()=>{
  'use strict';
  const data=window.MUC_QUESTION_BANK||[];
  const $=s=>document.querySelector(s);
  const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain=s=>String(s??'').replace(/<[^>]*>/g,' ');
  const norm=s=>plain(s).toLowerCase().replace(/[\u064b-\u065f]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
  const en=()=>document.documentElement.lang==='en';
  const text=(ar,english)=>en()?english:ar;
  let bookmarks=load('muc-bank-saved',[]);if(!Array.isArray(bookmarks))bookmarks=[];
  let answers=load('muc-lecture1-answers',{});if(!answers||typeof answers!=='object'||Array.isArray(answers))answers={};
  const restored=load('muc-bank-view',{});let page=Number.isInteger(restored.page)?Math.max(1,restored.page):1;
  let onlySaved=restored.onlySaved===true;
  const query=new URLSearchParams(location.search);let directId=query.get('id');
  const pageSize=20;
  const labels={mcq:['اختيار من متعدد','Multiple Choice'],blank:['فراغات','Fill in the Blanks'],short:['إجابة قصيرة','Short Answer'],case:['حالة دراسية','Case Study'],diagram:['رسم','Diagram']};
  const input=$('#bank-search'),type=$('#bank-type'),scope=$('#bank-scope');
  input.value=query.get('q')||restored.search||'';
  if([...type.options].some(o=>o.value===(query.get('type')||restored.type)))type.value=query.get('type')||restored.type;
  if([...scope.options].some(o=>o.value===(query.get('scope')||restored.scope)))scope.value=query.get('scope')||restored.scope;
  data.forEach(q=>q.searchText=norm([q.prompt,q.context,q.answerHTML,q.group,...(q.options||[])].join(' ')));
  function groupLabel(q){return q.group==='final'?text('الاختبار النهائي','Final Exam'):q.group==='mini'?text('تدريب مباشر إضافي','Extra Direct Practice'):text('سلايد ','Slide ')+q.group.replace('-','–')}
  function viewState(){save('muc-bank-view',{page,search:input.value,type:type.value,scope:scope.value,onlySaved})}
  function matching(){const terms=norm(input.value).split(' ').filter(Boolean);return data.filter(q=>(!directId||q.id===directId)&&(type.value==='all'||q.type===type.value)&&(scope.value==='all'||q.lecture===scope.value)&&(!onlySaved||bookmarks.includes(q.id))&&terms.every(t=>q.searchText.includes(t)))}
  function feedback(q,record){if(!record?.checked)return '';const correct=Number(record.value)===q.correct;return (correct?text('✓ إجابة صحيحة. ','✓ Correct. '):text('راجع إجابتك. الصحيح: ','Review your answer. Correct: ')+String.fromCharCode(65+q.correct)+'. ')+(q.explanation||'')}
  function card(q){
    const record=answers[q.persist||q.id],saved=bookmarks.includes(q.id);
    let html='<article class="bank-card" id="'+q.id+'"><div class="bank-meta"><span class="bank-badge">'+labels[q.type][en()?1:0]+'</span><span>'+escape(groupLabel(q))+'</span></div><h2 dir="ltr" lang="en">'+escape(q.prompt)+'</h2>';
    if(q.context)html+='<p class="source-context" dir="ltr" lang="en">'+escape(q.context)+'</p>';
    if(q.questionsHTML)html+=q.questionsHTML;
    if(q.type==='mcq'){
      html+='<div dir="ltr" lang="en" class="bank-options">'+q.options.map((option,i)=>'<label class="bank-choice"><input type="radio" name="bank-'+q.id+'" value="'+i+'"'+(String(record?.value)===String(i)?' checked':'')+'>'+String.fromCharCode(65+i)+'. '+escape(option)+'</label>').join('')+'</div>';
      html+='<p class="bank-status '+(record?.checked?(Number(record.value)===q.correct?'correct':'wrong'):'')+'" role="status" dir="auto">'+escape(feedback(q,record))+'</p>';
    }
    html+='<details'+(record?.checked?' open':'')+'><summary>'+text(q.answerOrigin==='study'?'تحليل الإجابة للمراجعة':'إظهار الإجابة والتفسير',q.answerOrigin==='study'?'Study Analysis':'Show Answer & Explanation')+'</summary><div class="bank-answer">'+q.answerHTML+'</div></details><div class="bank-actions">';
    if(q.type==='mcq')html+='<button type="button" class="bank-check">'+text('تحقّق من الإجابة','Check Answer')+'</button>';
    html+='<button type="button" class="bank-save" aria-pressed="'+saved+'">'+(saved?text('♥ محفوظ','♥ Saved'):text('♡ حفظ السؤال','♡ Save Question'))+'</button><button type="button" class="bank-share">'+text('مشاركة','Share')+'</button><a class="bank-jump" href="'+escape(q.href)+'">'+text('الرجوع للشرح / الاختبار','Open Lesson / Exam')+'</a></div></article>';
    return html;
  }
  function render(){
    const items=matching(),pages=Math.max(1,Math.ceil(items.length/pageSize));page=Math.min(page,pages);
    $('#bank-title').textContent=text('بنك الأسئلة','Question Bank');$('#bank-intro').textContent=text('كل أسئلة السلايدات والتدريبات والاختبار النهائي، مع الإجابات والتفسير.','Slide questions, practice sets, and the final exam in one place, with answers and explanations.');
    document.title=text('بنك الأسئلة','Question Bank')+' — IoT Security | MUC';
    const asideTitle=document.querySelector('aside>h2');if(asideTitle)asideTitle.textContent=text('بنك الأسئلة','Question Bank');
    input.placeholder=text('ابحث بمصطلح أو سؤال…','Search a term or question…');input.setAttribute('aria-label',text('البحث في الأسئلة','Search Questions'));
    const typeNames=[text('كل الأنواع','All Types'),...['mcq','blank','short','case','diagram'].map(k=>labels[k][en()?1:0])];[...type.options].forEach((o,i)=>o.textContent=typeNames[i]);
    const scopes=[text('كل المادة','Entire Course'),text('المحاضرة الأولى','Lecture 1'),text('المحاضرة الثانية','Lecture 2'),text('الاختبار والتدريب المباشر','Exam & Direct Practice')];[...scope.options].forEach((o,i)=>o.textContent=scopes[i]);
    $('#bank-only-saved').textContent=text('المحفوظة فقط','Saved Only');$('#bank-only-saved').setAttribute('aria-pressed',onlySaved);
    $('#bank-count').textContent=text(items.length+' بطاقة من أصل '+data.length+' · الحالة الدراسية قد تضم عدة أسئلة.',items.length+' of '+data.length+' cards · Case cards may contain several questions.');
    $('#bank-results').innerHTML=items.slice((page-1)*pageSize,page*pageSize).map(card).join('');$('#bank-empty').hidden=items.length!==0;$('#bank-empty').textContent=text('ما في أسئلة مطابقة. جرّب كلمة أو تصنيفًا آخر.','No matching questions. Try a different term or filter.');
    $('#bank-page').textContent=text('صفحة '+page+' من '+pages,'Page '+page+' of '+pages);$('#bank-prev').textContent=text('السابق','Previous');$('#bank-next').textContent=text('التالي','Next');$('#bank-prev').disabled=page<=1;$('#bank-next').disabled=page>=pages;
    $('#bank-results').querySelectorAll('.bank-card').forEach(el=>{
      const q=data.find(item=>item.id===el.id),key=q.persist||q.id;
      el.querySelectorAll('input[type=radio]').forEach(radio=>radio.addEventListener('change',()=>{answers[key]={value:radio.value,checked:false};save('muc-lecture1-answers',answers);const out=el.querySelector('.bank-status');out.textContent='';out.className='bank-status';}));
      el.querySelector('.bank-check')?.addEventListener('click',()=>{const selected=el.querySelector('input:checked'),out=el.querySelector('.bank-status');if(!selected){out.textContent=text('اختَر إجابة أولًا.','Choose an answer first.');return}const record={value:selected.value,checked:true};answers[key]=record;save('muc-lecture1-answers',answers);out.textContent=feedback(q,record);out.className='bank-status '+(Number(selected.value)===q.correct?'correct':'wrong');el.querySelector('details').open=true;});
      el.querySelector('.bank-save').addEventListener('click',()=>{bookmarks=bookmarks.includes(q.id)?bookmarks.filter(id=>id!==q.id):[...bookmarks,q.id];save('muc-bank-saved',bookmarks);render();});
      el.querySelector('.bank-share').addEventListener('click',async e=>{const url=new URL('questions.html',location.href);url.searchParams.set('id',q.id);try{await navigator.clipboard.writeText(url.href);e.target.textContent=text('✓ نُسخ الرابط','✓ Link Copied')}catch{e.target.textContent=text('رابط السؤال في شريط العنوان','Question link in address bar');history.replaceState(null,'',url.href)}});
    });viewState();
  }
  function changed(){page=1;if(directId){const u=new URL(location.href);u.searchParams.delete('id');history.replaceState(null,'',u.href)}directId=null;render()}
  input.addEventListener('input',changed);type.addEventListener('change',changed);scope.addEventListener('change',changed);$('#bank-only-saved').onclick=()=>{onlySaved=!onlySaved;changed()};
  $('#bank-prev').onclick=()=>{page--;render();$('#bank-results').scrollIntoView({block:'start'})};$('#bank-next').onclick=()=>{page++;render();$('#bank-results').scrollIntoView({block:'start'})};
  $('#muc-language')?.addEventListener('change',render);
  $('#print').onclick=()=>window.print();$('#share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('#share-status').textContent=text('تم نسخ الرابط.','Link copied.')}catch{}};
  render();
})();
