const dialog=document.querySelector('.video-dialog');
const player=dialog.querySelector('video');
const scene=document.querySelector('.edit-scene');
const replay=document.querySelector('.scene-replay');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const works=JSON.parse(document.querySelector('#works-data').textContent);
const status=document.querySelector('.video-status');
let priorFocus=null,animationTimer=null,loadingTimer=null,videoSession=0;
function stopScene(){clearTimeout(animationTimer);scene.classList.remove('is-assembling');}
function assemble(){if(preference.matches||document.hidden||dialog.open)return;stopScene();void scene.offsetWidth;scene.classList.add('is-assembling');animationTimer=setTimeout(stopScene,1400);}
replay.hidden=preference.matches;
replay.addEventListener('click',assemble);
preference.addEventListener('change',()=>{stopScene();replay.hidden=preference.matches;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopScene();if(dialog.open)player.pause();}});
if('IntersectionObserver' in window){new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stopScene();},{threshold:.1}).observe(scene);}
const poster=scene.querySelector('.cut-poster');
if(poster.complete)assemble();else poster.addEventListener('load',assemble,{once:true});
function field(label,value){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;return[dt,dd];}
function openVideo(link){if(dialog.open)return;const work=works.find(w=>w.id===link.dataset.work);if(!work)return;const ownSession=++videoSession;clearTimeout(loadingTimer);priorFocus=link;stopScene();document.querySelector('#video-title').textContent=work.title+' / '+work.category;document.querySelector('.archive-note').hidden=work.status!=='archive';const detail=document.querySelector('.dialog-case');detail.replaceChildren();const dl=document.createElement('dl');for(const [label,key]of[['Задача','task'],['Роль','role'],['Год','year']])if(work[key])dl.append(...field(label,String(work[key])));if(dl.children.length)detail.append(dl);if(work.description){const p=document.createElement('p');p.textContent=work.description;detail.append(p)}detail.hidden=!detail.children.length;status.hidden=true;status.textContent='';player.poster=work.poster;player.src=work.video;dialog.showModal();document.body.classList.add('modal-open');loadingTimer=setTimeout(()=>{if(dialog.open&&player.readyState<3){status.textContent='Видео загружается…';status.hidden=false}},1800);player.play().catch(()=>{if(dialog.open&&videoSession===ownSession&&player.readyState>=1){status.textContent='Нажмите Play в проигрывателе, чтобы посмотреть видео.';status.hidden=false}});}
if(typeof dialog.showModal==='function')document.querySelectorAll('[data-work]').forEach(link=>link.addEventListener('click',event=>{if(works.some(w=>w.id===link.dataset.work)){event.preventDefault();openVideo(link)}}));
player.addEventListener('playing',()=>{clearTimeout(loadingTimer);status.hidden=true;});
player.addEventListener('error',()=>{if(!dialog.open||!player.error)return;clearTimeout(loadingTimer);status.textContent='Не удалось загрузить видео. Попробуйте открыть его ещё раз или посмотреть демо в канале Avero.';status.hidden=false;});
function clearVideo(){videoSession++;clearTimeout(loadingTimer);player.pause();player.removeAttribute('src');player.removeAttribute('poster');player.load();document.body.classList.remove('modal-open');priorFocus?.focus({preventScroll:true});}
function closeVideo(){dialog.close();clearVideo();}
dialog.querySelector('.dialog-close').addEventListener('click',closeVideo);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeVideo();});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeVideo();});
dialog.addEventListener('close',()=>{if(!dialog.open)clearVideo();});
