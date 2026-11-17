(()=>{
  const select=document.querySelector('#feed-week');if(!select)return;
  const requested=new URLSearchParams(location.search).get('week');
  const key='mohammad-feed-week';let value=requested;
  if(!value)try{value=localStorage.getItem(key)}catch{}
  if(['1','2','3','all'].includes(value))select.value=value;
  select.addEventListener('change',()=>{try{localStorage.setItem(key,select.value)}catch{}render()});
  render();
})();
