(()=>{
  const week=document.body.dataset.week;
  const key='mohammad-week'+week+'-drafts';let drafts={};
  try{drafts=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
  document.querySelectorAll('[data-week-draft]').forEach(input=>{
    input.value=drafts[input.dataset.weekDraft]||'';
    input.addEventListener('input',()=>{drafts[input.dataset.weekDraft]=input.value;try{localStorage.setItem(key,JSON.stringify(drafts))}catch{}});
  });
})();
