(()=>{
  'use strict';
  const exam=JSON.parse(document.querySelector('#final-exam-data').textContent);
  const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
  const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  const en=()=>document.documentElement.lang==='en';const text=(a,b)=>en()?b:a;
  let state=load('muc-week3-final-v1',{});if(!state||typeof state!=='object'||Array.isArray(state))state={};
  state.blanks=state.blanks||{};state.blankChecked=state.blankChecked||{};state.drafts=state.drafts||{};state.manual=state.manual||{};state.strokes=Array.isArray(state.strokes)?state.strokes:[];
  let answers=load('muc-lecture1-answers',{});if(!answers||typeof answers!=='object'||Array.isArray(answers))answers={};
  const persist=()=>{save('muc-week3-final-v1',state);save('muc-lecture1-answers',answers)};
  const normalize=v=>String(v).trim().toLowerCase().replace(/[.،,;:!?]/g,'').replace(/\s+/g,' ');
  function mcqFeedback(field,i,mark){
    const chosen=field.querySelector('input:checked'),out=field.querySelector('.feedback');if(!chosen){if(mark)out.textContent=text('اختَر إجابة أولًا.','Choose an answer first.');return}
    const q=exam.mcqs[i],correct=Number(chosen.value)===q[2],key='w3-final-mcq-'+(i+1);
    if(mark){answers[key]={value:chosen.value,checked:true};persist()}
    if(mark||answers[key]?.checked){out.className='feedback '+(correct?'correct':'wrong');out.textContent=(correct?text('✓ إجابة صحيحة. ','✓ Correct. '):text('راجع إجابتك. الصحيح: ','Review your answer. Correct: ')+String.fromCharCode(65+q[2])+'. ')+q[3];}
  }
  function blankCorrect(i){return normalize(state.blanks[i]||'')===normalize(exam.blanks[i][1])}
  function blankFeedback(box,i,mark){
    const out=box.querySelector('.exam-feedback'),value=(state.blanks[i]||'').trim();if(mark&&!value){out.textContent=text('اكتب إجابتك أولًا.','Write an answer first.');return}
    if(mark){state.blankChecked[i]=true;persist()}
    if(state.blankChecked[i]){const good=blankCorrect(i);out.className='exam-feedback '+(good?'correct':'wrong');out.textContent=(good?text('✓ إجابة صحيحة. ','✓ Correct. '):text('راجع إجابتك. الصحيح: ','Review your answer. Correct: ')+exam.blanks[i][1]+'. ')+exam.blanks[i][2];}
  }
  const manualKeys=[...exam.short.map((q,i)=>({key:'final-short-'+(i+1),max:q.marks,group:'short'})),...exam.cases.map((q,i)=>({key:'final-case-'+(i+1),max:q.marks,group:'cases'}))];
  function updateScore(){
    let mcq=0,blanks=0;exam.mcqs.forEach((q,i)=>{const a=answers['w3-final-mcq-'+(i+1)];if(a?.checked&&Number(a.value)===q[2])mcq++});exam.blanks.forEach((q,i)=>{if(state.blankChecked[i]&&blankCorrect(i))blanks++});
    const manual={short:0,cases:0,diagram:0},present={short:0,cases:0,diagram:0};
    manualKeys.forEach(item=>{const value=state.manual[item.key];if(value!==undefined&&value!==null&&value!==''&&Number.isFinite(Number(value))){manual[item.group]+=Math.max(0,Math.min(item.max,Number(value)));present[item.group]++;}});
    $('#score-mcq').textContent=mcq+' / 20';$('#score-blanks').textContent=blanks+' / 10';
    $('#score-short').textContent=(present.short?manual.short:'—')+' / 15';$('#score-cases').textContent=(present.cases?manual.cases:'—')+' / 15';$('#score-diagram').textContent=(present.diagram?manual.diagram:'—')+' / 10';
    const total=mcq+blanks+manual.short+manual.cases+manual.diagram;$('#score-total').textContent=total+' / 60';const complete=present.short===5&&present.cases===3;
    $('#exam-score-note').textContent=complete?text('اكتملت درجات التقييم الذاتي. المجموع يجمعها مع التصحيح التلقائي.','Self-assessment scores are complete. The total combines them with automatic marking.'):text('المجموع الحالي جزئي؛ سجّل درجات الأقسام الكتابية والرسم بعد مقارنة إجاباتك بالنموذج.','The current total is partial. Enter written and diagram scores after comparing your work with the model answers.');
  }
  all('#exam-mcqs fieldset').forEach((field,i)=>{
    const key='w3-final-mcq-'+(i+1),record=answers[key];if(record){const r=field.querySelector('input[value="'+record.value+'"]');if(r)r.checked=true;}
    field.querySelectorAll('input').forEach(r=>r.addEventListener('change',()=>{answers[key]={value:r.value,checked:false};field.querySelector('.feedback').textContent='';field.querySelector('.feedback').className='feedback';persist();updateScore()}));
    field.querySelector('.check').onclick=()=>{mcqFeedback(field,i,true);updateScore()};mcqFeedback(field,i,false);
  });
  all('.exam-blank').forEach((box,i)=>{
    const input=box.querySelector('input');input.value=state.blanks[i]||'';input.addEventListener('input',()=>{state.blanks[i]=input.value;state.blankChecked[i]=false;box.querySelector('.exam-feedback').textContent='';persist();updateScore()});box.querySelector('.check-blank').onclick=()=>{blankFeedback(box,i,true);updateScore()};blankFeedback(box,i,false);
  });
  all('[data-draft]').forEach(input=>{input.value=state.drafts[input.dataset.draft]||'';input.addEventListener('input',()=>{state.drafts[input.dataset.draft]=input.value;persist()})});
  all('[data-manual]').forEach(input=>{
    const key=input.dataset.manual;input.value=state.manual[key]??'';
    input.addEventListener('input',()=>{if(input.value==='')delete state.manual[key];else{const value=Number(input.value);if(!Number.isFinite(value))return;const bounded=Math.max(0,Math.min(Number(input.max),value));state.manual[key]=bounded;if(bounded!==value)input.value=bounded;}persist();updateScore()});
  });
  $('.exam-check').onclick=()=>{all('#exam-mcqs fieldset').forEach((f,i)=>mcqFeedback(f,i,true));all('.exam-blank').forEach((b,i)=>blankFeedback(b,i,true));updateScore()};
  $('.exam-reset').onclick=()=>{
    if(!window.confirm(text('تبدأ محاولة جديدة وتمسح إجابات هذا الاختبار والرسم؟','Start a new attempt and clear this exam’s answers and drawing?')))return;
    Object.keys(answers).filter(k=>/^w3-final-mcq-/.test(k)).forEach(k=>delete answers[k]);state={blanks:{},blankChecked:{},drafts:{},manual:{},strokes:[]};persist();location.reload();
  };
  all('#mini-practice fieldset').forEach((field,i)=>{
    const key='mini-direct-q'+(i+1),record=answers[key];if(record){const r=field.querySelector('input[value="'+record.value+'"]');if(r)r.checked=true;}
    field.querySelectorAll('input').forEach(r=>r.addEventListener('change',()=>{answers[key]={value:r.value,checked:false};persist()}));
    field.querySelector('.check').onclick=()=>{const chosen=field.querySelector('input:checked'),out=field.querySelector('.feedback');if(!chosen){out.textContent=text('اختَر إجابة أولًا.','Choose an answer first.');return}const q=(exam.mini||[])[i],good=Number(chosen.value)===q[2];answers[key]={value:chosen.value,checked:true};persist();out.className='feedback '+(good?'correct':'wrong');out.textContent=(good?text('✓ إجابة صحيحة. ','✓ Correct. '):text('الصحيح: ','Correct: ')+String.fromCharCode(65+q[2])+'. ')+q[3];};
  });
  const canvas=$('#exam-canvas');let context=null;try{context=canvas.getContext('2d')}catch{}
  let tool='pen',current=null;
  function point(e){const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))]}
  function paint(stroke){
    if(!context||!stroke.points.length)return;context.strokeStyle=stroke.tool==='eraser'?'#fff':'#1268d3';context.fillStyle=context.strokeStyle;context.lineWidth=stroke.tool==='eraser'?24:4;context.lineCap='round';context.lineJoin='round';
    const points=stroke.points;if(points.length===1){context.beginPath();context.arc(points[0][0]*canvas.width,points[0][1]*canvas.height,context.lineWidth/2,0,Math.PI*2);context.fill();return}
    context.beginPath();context.moveTo(points[0][0]*canvas.width,points[0][1]*canvas.height);for(const p of points.slice(1))context.lineTo(p[0]*canvas.width,p[1]*canvas.height);context.stroke();
  }
  function redraw(){if(!context)return;context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);state.strokes.forEach(paint)}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();current={tool,points:[point(e)]};state.strokes.push(current);canvas.setPointerCapture?.(e.pointerId);paint(current)});
  canvas.addEventListener('pointermove',e=>{if(!current)return;e.preventDefault();current.points.push(point(e));paint(current)});
  function finishDrawing(){if(current){current=null;persist()}}canvas.addEventListener('pointerup',finishDrawing);canvas.addEventListener('pointercancel',finishDrawing);canvas.addEventListener('lostpointercapture',finishDrawing);
  all('[data-draw-tool]').forEach(button=>button.onclick=()=>{tool=button.dataset.drawTool;all('[data-draw-tool]').forEach(b=>b.setAttribute('aria-pressed',b===button))});
  $('#draw-clear').onclick=()=>{if(state.strokes.length&&!window.confirm(text('تمسح الرسم الحالي؟','Clear the current drawing?')))return;state.strokes=[];current=null;persist();redraw()};
  $('#draw-download').onclick=()=>{if(!context)return;const link=document.createElement('a');link.download='Mohammad-Week3-Drawing.png';link.href=canvas.toDataURL('image/png');link.click()};redraw();
  function localize(){
    const asideTitle=document.querySelector('aside>h2');if(asideTitle)asideTitle.textContent=text('خطة الاختبار','Exam Sections');
    document.title=text('الاختبار النهائي التجريبي','Final Practice Exam')+' — IoT Security | Mohammad';$('#exam-title').textContent=text('الاختبار الشامل — الأسبوع الثالث','Week 3 — Final Mock Exam');$('#exam-note').textContent=text('الاختيار والفراغات إلها تصحيح تلقائي. باقي الأقسام قارنها بالنموذج وسجّل علامتك للتقييم الذاتي.','Multiple choice and blanks are marked automatically. Compare the written and drawing sections with the models, then enter your self-assessed scores.');
    $('.exam-check').textContent=text('صحّح الاختيار والفراغات','Mark MCQs & Blanks');$('.exam-reset').textContent=text('ابدأ محاولة جديدة','Start a New Attempt');all('.check-blank').forEach(b=>b.textContent=text('تحقّق من الإجابة','Check Answer'));all('#exam-mcqs fieldset').forEach((f,i)=>mcqFeedback(f,i,false));all('.exam-blank').forEach((b,i)=>blankFeedback(b,i,false));updateScore();
  }
  $('#muc-language')?.addEventListener('change',localize);$('#print').onclick=()=>window.print();$('#share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('#share-status').textContent=text('تم نسخ الرابط.','Link copied.')}catch{}};
  localize();
})();
