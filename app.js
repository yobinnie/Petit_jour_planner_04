'use strict';

// Everything stays in this browser. Export/import makes the journal portable.
const STORE_KEY = 'petit-jour-journal-v1';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => globalThis.crypto?.randomUUID?.() || `j${Date.now()}${Math.random().toString(16).slice(2)}`;
const iso = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const dateObj = value => new Date(`${value}T12:00:00`);
const addDays = (value, days) => { const d = dateObj(value); d.setDate(d.getDate()+days); return iso(d); };
const TODAY = iso(new Date());
const weekStart = value => addDays(value, -(dateObj(value).getDay()+6)%7);
const dateText = (value, options) => dateObj(value).toLocaleDateString('en-US', options);
const monthName = (value, short=false) => dateText(value, {month:short?'short':'long'});
const weekdays = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(dateObj(value).getTime()) && iso(dateObj(value)) === value;
const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const minutes = time => { const [h,m] = time.split(':').map(Number); return h*60+m; };
const clock = value => `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;
const icons = {
  book:'<path d="M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a5 5 0 0 0-4 2 5 5 0 0 0-4-2H3z"/><path d="M12 6v15"/>',
  home:'<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-8h6v8"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  todo:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 5-6"/>',
  week:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4M8 10v11m8-11v11"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4M7 14h2m3 0h2m3 0h1M7 17h2m3 0h2"/>',
  note:'<path d="M6 3h12v18H6zM3 7h5M3 12h5m-5 5h5m3-9h4m-4 4h4m-4 4h3"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 1.2-3.6 1.5 1.5 0 0 1 .8-2.7H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><circle cx="7.5" cy="10" r=".7"/><circle cx="11" cy="6.8" r=".7"/><circle cx="16" cy="8" r=".7"/>',
  settings:'<path d="m9 3-1 3-3 .5-1.5 2.6L5 12l-1.5 2.9L5 17.5l3 .5 1 3h6l1-3 3-.5 1.5-2.6L19 12l1.5-2.9L19 6.5 16 6l-1-3z"/><circle cx="12" cy="12" r="3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
  edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  pin:'<path d="m8 3 9 2-2 5 2 4-6-1-4 3 1-6zM11 13l-4 8"/>',
  play:'<path d="m8 4 12 8-12 8z"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',
  repeat:'<path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1 3 4 3 4-3 4-3M8 9h.01M16 9h.01"/>',
  calm:'<circle cx="12" cy="12" r="9"/><path d="M7 9h3m4 0h3m-8 6s3 2 6 0"/>',
  focus:'<circle cx="12" cy="12" r="9"/><path d="M8 9h.01M16 9h.01M10 15h4"/>',
  tired:'<circle cx="12" cy="12" r="9"/><path d="m7 8 3 2-3 1m10-3-3 2 3 1m-7 5h4"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  heart:'<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 0 9 8 15 8-6 12-11 8-15Z"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const themes = {
  rose: {name:'로즈',accent:'#a96c7e',dark:'#8c5264',tint:'#eddae0',light:'#f7edf0',bg:'#ffffff'},
  sage: {name:'세이지',accent:'#879477',dark:'#637151',tint:'#e0e6d8',light:'#f0f3e9',bg:'#ffffff'},
  mauve: {name:'모브',accent:'#9b85a2',dark:'#77617f',tint:'#e7dfeb',light:'#f3edf6',bg:'#ffffff'}
};

function seedJournal() {
  const start=weekStart(TODAY);
  const t=(title,cat,extra={})=>({id:uid(),title,cat,date:TODAY,done:false,doneDates:[],repeat:'none',time:'',priority:false,note:'',...extra});
  const e=(title,cat,from,to,extra={})=>({id:uid(),title,cat,date:TODAY,start:from,end:to,repeat:false,weekday:dateObj(TODAY).getDay(),location:'',...extra});
  return {version:1,name:'Yebin',theme:'rose',decor:true,lastDate:TODAY,
    categories:[{id:'design',name:'디자인',short:'디자인',color:'#dec3cd'},{id:'life',name:'일상',short:'일상',color:'#d5dccb'},{id:'me',name:'개인',short:'개인',color:'#d9d0e2'}],
    tasks:[t('레퍼런스 수집','design',{done:true}),t('포트폴리오 시안 수정','design',{time:'10:00'}),t('작업 정리','design'),t('물 마시기','life',{repeat:'daily',doneDates:[TODAY]}),t('산책','life'),t('독서 10페이지','me')],
    events:[e('디자인 작업','design','10:00','12:00',{repeat:true}),e('점심','life','13:00','14:00'),e('자료 조사','me','15:00','16:30'),
      ...[0,1,4].filter(i=>addDays(start,i)!==TODAY).map(i=>e(i===4?'작업 정리':'디자인 작업','design','10:00','12:00',{date:addDays(start,i),repeat:true,weekday:dateObj(addDays(start,i)).getDay()}))],
    notes:{},moods:{}};
}
function loadJournal() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return seedJournal();
    const data = JSON.parse(raw);
    if (!Array.isArray(data.categories) || !data.categories.length || !Array.isArray(data.tasks) || !Array.isArray(data.events)) return seedJournal();
    return {...data,notes:data.notes || {},moods:data.moods || {},theme:themes[data.theme]?data.theme:'rose',name:data.name || 'Yebin',decor:data.decor!==false};
  } catch { return seedJournal(); }
}
let journal = loadJournal();
let selectedDate = validDate(journal.lastDate) ? journal.lastDate : TODAY;
let quickCategory=null;
const quickDrafts={};
let memoOpen=false;
let memoSaveState="저장됨";
let view = 'daily';
let selectedCollection = null;
let editor = null;
let editingCategory = null;
let chosenColor = '#dec3cd';
let toastTimeout;
let noteTimeout;
let storageWarningShown = false;
// Migrate only the examples shipped in v1; keep custom text and record state.
if(!journal.uiVersion||journal.uiVersion<2){
  for(const c of journal.categories){const defaults={design:['Design & create','디자인'],life:['Everyday things','일상'],me:['Just for me','개인']};const d=defaults[c.id];if(d&&c.name===d[0]){c.name=d[1];c.short=d[1];}}
  const labels={'플래너 레퍼런스 모으기':'레퍼런스 수집','포트폴리오 메인 시안 다듬기':'포트폴리오 시안 수정','오늘의 작업 아카이빙':'작업 정리','아침 물 한 잔, 천천히 시작하기':'물 마시기','잠깐이라도 바깥 공기 쐬기':'산책','자기 전 책 10페이지 읽기':'독서 10페이지','가고 싶던 전시 다녀오기':'전시 관람','다음 주를 위한 작은 준비':'다음 주 준비','이번 주 작업 정리하기':'주간 작업 정리','차분히, 디자인 작업':'디자인 작업','점심 & 느긋한 휴식':'점심','영감을 모으는 시간':'자료 조사','나를 위한 집중 시간':'집중','한 주의 작업 마무리':'작업 정리'};
  for(const r of [...journal.tasks,...journal.events])if(Object.hasOwn(labels,r.title))r.title=labels[r.title];
  for(const [date,text] of Object.entries(journal.notes))if(text==='작은 일 하나도 충분해.\n오늘도 나의 속도로.')delete journal.notes[date];
  journal.uiVersion=2;
}

const category = id => journal.categories.find(c=>c.id===id) || journal.categories[0];
const categoryStyle = id => `--cat:${esc(category(id).color)}`;
function eventStyle(id) {
  const c = category(id);
  return `--event-bg:color-mix(in srgb, ${esc(c.color)} 53%, #fcfaf7);--event-ink:color-mix(in srgb, ${esc(c.color)} 42%, #6d594b)`;
}
function taskOnDate(task,date) {
  if (task.repeat === 'daily') return date >= task.date;
  if (task.repeat === 'weekdays') return date >= task.date && dateObj(date).getDay()>0 && dateObj(date).getDay()<6;
  if (task.repeat === 'weekly') return date >= task.date && dateObj(date).getDay()===dateObj(task.date).getDay();
  return task.date === date;
}
const taskDone = (task,date) => task.repeat && task.repeat!=='none' ? (task.doneDates || []).includes(date) : !!task.done;
const inCollection = record => !selectedCollection || record.cat===selectedCollection;
const tasksForDate = date => journal.tasks.filter(task=>inCollection(task)&&taskOnDate(task,date));
const eventsForDate = date => journal.events.filter(e=>inCollection(e)&&(e.repeat ? date >= e.date && dateObj(date).getDay()===Number(e.weekday) : e.date===date)).sort((a,b)=>minutes(a.start)-minutes(b.start));
function save(showSaved=false) {
  journal.lastDate = selectedDate;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(journal));
    $('#save-state').textContent='저장됨';
    memoSaveState='저장됨';if($('#memo-save-status'))$('#memo-save-status').textContent=memoSaveState;
    if (showSaved) toast('저장됨');
    return true;
  } catch {
    $('#save-state').textContent='저장 공간을 확인해 주세요';
    memoSaveState='저장 실패';if($('#memo-save-status'))$('#memo-save-status').textContent=memoSaveState;
    if (!storageWarningShown) {toast('저장 실패. 설정에서 기록을 내보내세요.');storageWarningShown=true;}
    return false;
  }
}
function toast(message) {
  clearTimeout(toastTimeout);$('#toast').textContent=message;$('#toast').classList.add('show');
  toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),3000);
}
function applyTheme() {
  const t=themes[journal.theme] || themes.rose;
  for (const [key,val] of Object.entries({'--accent':t.accent,'--accent-dark':t.dark,'--tint':t.tint,'--tint-light':t.light,'--bg':t.bg})) document.documentElement.style.setProperty(key,val);
  document.body.classList.toggle('no-decor',!journal.decor);
  $('#account-name').textContent=journal.name;
  $('.account-avatar').textContent=journal.name.slice(0,1).toUpperCase();
}
const koDays=['일','월','화','수','목','금','토'];
const views=[{id:'daily',title:'할 일',icon:'todo'},{id:'week',title:'시간표',icon:'week'},{id:'month',title:'달력',icon:'calendar'}];
function stitchBanner(){return '<div class="stitch-banner"><img src="assets/stitch-banner.svg" alt="Petit Jour." width="1000" height="180"></div>';}
function renderNavigation(){
  $('#navigation').innerHTML=views.map(v=>`<button class="nav-button ${!selectedCollection&&view===v.id?'active':''}" data-action="view" data-view="${v.id}" ${!selectedCollection&&view===v.id?'aria-current="page"':''}>${icon(v.icon)}<span>${v.title}</span></button>`).join('');
  $('#collections').innerHTML=journal.categories.map(c=>`<button class="nav-button collection-item ${selectedCollection===c.id?'active':''}" data-action="collection" data-id="${esc(c.id)}" style="--cat:${esc(c.color)}" ${selectedCollection===c.id?'aria-current="page"':''}><span class="collection-folder" aria-hidden="true"></span><span>${esc(c.name)}</span></button>`).join('');
  document.title=`petit jour. — ${selectedCollection?category(selectedCollection).name+' · ':''}${views.find(v=>v.id===view)?.title||'할 일'}`;
}
function collectionToolbar(){
  if(!selectedCollection)return '';
  const c=category(selectedCollection);
  return `<section class="collection-toolbar" aria-label="${esc(c.name)} 컬렉션"><div class="collection-title"><span class="collection-folder" aria-hidden="true"></span><h1>${esc(c.name)}</h1><button class="icon-button" data-action="edit-category" data-id="${esc(c.id)}" aria-label="${esc(c.name)} 컬렉션 수정">${icon('edit')}</button></div><div class="collection-tabs" role="tablist" aria-label="컬렉션 보기">${[{id:'daily',label:'일별'},{id:'week',label:'시간표'},{id:'month',label:'달력'}].map(t=>`<button type="button" role="tab" class="collection-tab ${view===t.id?'active':''}" aria-selected="${view===t.id}" data-action="collection-view" data-view="${t.id}">${t.label}</button>`).join('')}</div></section>`;
}
function applyCollectionColor(){
  const shell=$('.app-shell');shell.classList.toggle('collection-active',!!selectedCollection);
  if(selectedCollection)shell.style.setProperty('--collection-color',category(selectedCollection).color);
  else shell.style.removeProperty('--collection-color');
}

function heading(){
  const d=dateObj(selectedDate),start=weekStart(selectedDate),end=addDays(start,6);
  let label=`${d.getMonth()+1}월 ${d.getDate()}일`;
  if(view==='week')label=`${dateObj(start).getMonth()+1}월 ${dateObj(start).getDate()}일 — ${dateObj(end).getMonth()+1!==dateObj(start).getMonth()+1?dateObj(end).getMonth()+1+'월 ':''}${dateObj(end).getDate()}일`;
  if(view==='month')label=`${d.getFullYear()}년 ${d.getMonth()+1}월`;
  const unit=view==='week'?'주':view==='month'?'달':'날';
  return `<header class="page-heading"><${selectedCollection?'h2':'h1'}><button class="heading-date" data-action="date-picker" aria-label="날짜 선택">${label}${view==='daily'?`<span>${koDays[d.getDay()]}요일</span>`:''}${icon('calendar')}</button></${selectedCollection?'h2':'h1'}><div class="header-actions">${view!=='daily'?`<button class="primary-button" data-action="new-event">${icon('plus')} 일정</button>`:''}<button class="today-button" data-action="today">오늘</button><button class="icon-button" data-action="date-prev" aria-label="이전 ${unit}">‹</button><button class="icon-button" data-action="date-next" aria-label="다음 ${unit}">›</button><button class="icon-button search-button" data-action="search" aria-label="검색">${icon('search')}</button></div></header>`;
}
function dateStrip(){
  const start=weekStart(selectedDate);
  return `<section class="week-strip" aria-label="날짜"><button class="icon-button" data-action="strip-prev" aria-label="이전 주">‹</button><div class="strip-days">${Array.from({length:7},(_,i)=>{const date=addDays(start,i),d=dateObj(date),tasks=tasksForDate(date),done=tasks.filter(t=>taskDone(t,date)).length;return `<button class="strip-day ${date===selectedDate?'selected':''} ${date===TODAY?'is-today':''} ${d.getDay()===0?'sunday':''}" data-action="select-date" data-date="${date}" aria-label="${date} 할 일" ${date===selectedDate?'aria-current="date"':''}><span>${koDays[d.getDay()]}</span><b>${d.getDate()}</b><small>${tasks.length?done+'/'+tasks.length:''}</small></button>`;}).join('')}</div><button class="icon-button" data-action="strip-next" aria-label="다음 주">›</button></section>`;
}
function taskMarkup(task,date){
  const done=taskDone(task,date);
  return `<div class="task-row ${done?'done':''}" style="${categoryStyle(task.cat)}"><button class="check-button ${done?'checked':''}" data-action="toggle-task" data-id="${esc(task.id)}" data-date="${date}" role="checkbox" aria-checked="${done}" aria-label="${esc(task.title)} ${done?'완료 취소':'완료'}">${done?icon('check'):''}</button><button class="task-label" data-action="edit-task" data-id="${esc(task.id)}"><span class="task-title">${esc(task.title)}</span>${task.time||task.repeat!=='none'?`<span class="task-details">${esc(task.time)}${task.repeat!=='none'?icon('repeat'):''}</span>`:''}</button>${task.priority?'<span class="priority-star" aria-label="중요">✧</span>':''}<button class="icon-button row-edit" data-action="edit-task" data-id="${esc(task.id)}" aria-label="${esc(task.title)} 수정">${icon('edit')}</button></div>`;
}
function memoPanel(){
  const text=journal.notes[selectedDate]||'';
  return `<section class="daily-memo" aria-label="메모"><div class="memo-heading"><h2>메모</h2>${!memoOpen?`<button class="text-button memo-edit" data-action="edit-memo" aria-label="메모 ${text?'수정':'작성'}">${text?'수정':'작성'}</button>`:''}</div>${memoOpen?`<textarea class="daily-note" id="daily-note" aria-label="${selectedDate} 메모" placeholder="메모" maxlength="5000">${esc(text)}</textarea><div class="memo-footer"><span id="memo-save-status" role="status">${esc(memoSaveState)}</span><button class="primary-button" data-action="finish-memo">완료</button></div>`:text?`<p class="memo-content">${esc(text)}</p>`:''}</section>`;
}
function finishMemo(){
  const input=$('#daily-note');if(!input)return;
  clearTimeout(noteTimeout);journal.notes[selectedDate]=input.value;
  if(save()){memoOpen=false;render();$('.memo-edit')?.focus();}
}
function dailyEvents(){
  const events=eventsForDate(selectedDate);
  return `<section class="collection-agenda" aria-label="일정"><div class="group-header"><h2 class="section-label">일정</h2><button class="icon-button group-add" data-action="new-event" aria-label="일정 추가">+</button></div>${events.length?events.map(e=>`<button class="agenda-row" data-action="edit-event" data-id="${esc(e.id)}" aria-label="${esc(e.title)} 일정 수정"><time>${e.start} — ${e.end}</time><span>${esc(e.title)}</span>${e.repeat?`<span class="agenda-repeat" aria-label="매주 반복">${icon('repeat')}</span>`:''}${e.location?`<small>${esc(e.location)}</small>`:''}</button>`).join(''):'<p class="empty-agenda">일정 없음</p>'}</section>`;
}
function renderDaily(){
  const tasks=tasksForDate(selectedDate),categories=journal.categories.filter(c=>!selectedCollection||c.id===selectedCollection);
  return heading()+dateStrip()+`<div class="todos">${categories.map(c=>{const entries=tasks.filter(t=>t.cat===c.id);return `<section class="todo-group" aria-label="${esc(c.name)} 할 일"><div class="group-header">${selectedCollection?'<h2 class="section-label">할 일</h2>':`<button class="category-chip" style="--cat:${esc(c.color)}" data-action="edit-category" data-id="${esc(c.id)}" aria-label="${esc(c.name)} 설정">${esc(c.name)}</button>`}<button class="icon-button group-add" data-action="focus-add" data-id="${esc(c.id)}" aria-label="${esc(c.name)} 할 일 추가">+</button></div>${entries.map(t=>taskMarkup(t,selectedDate)).join('')}${quickCategory===c.id||!entries.length?`<form class="quick-add" data-quick-add data-cat="${esc(c.id)}"><span aria-hidden="true">+</span><input name="title" aria-label="${esc(c.name)} 할 일 입력" placeholder="할 일 추가" value="${esc(quickDrafts[c.id]||'')}" maxlength="140" required><button type="submit" aria-label="${esc(c.name)} 할 일 저장">추가 ${icon('arrow')}</button></form>`:''}</section>`;}).join('')}${selectedCollection?dailyEvents():memoPanel()}</div>`;
}
function weekTaskLane(days){
  return `<div class="week-tasks" aria-label="주간 할 일"><span class="week-task-label">할 일</span>${days.map(date=>`<div class="week-task-cell">${tasksForDate(date).map(t=>taskMarkup(t,date)).join('')}<button class="week-task-add" data-action="new-task" data-date="${date}" aria-label="${date} 할 일 추가">+</button></div>`).join('')}</div>`;
}

// Partition simultaneous blocks into columns so overlapping events stay editable.
function positionEvents(events) {
  const placed=[],groups=[];
  let active=[],group=null;
  for(const event of events){
    const start=minutes(event.start),end=minutes(event.end);
    active=active.filter(p=>p.end>start);
    if(!active.length){group={items:[],columns:1};groups.push(group);}
    const used=new Set(active.map(p=>p.column));let column=0;while(used.has(column))column++;
    const item={event,start,end,column,group};placed.push(item);active.push(item);group.items.push(item);group.columns=Math.max(group.columns,column+1);
  }
  return placed;
}

function renderWeek() {
  const start=weekStart(selectedDate),days=Array.from({length:7},(_,i)=>addDays(start,i));
  const all=days.flatMap(d=>eventsForDate(d));
  const first=Math.min(8,...all.map(e=>Math.floor(minutes(e.start)/60))),last=Math.max(21,...all.map(e=>Math.ceil(minutes(e.end)/60)));
  const range=last-first,height=range*40;
  return heading()+`<section class="paper-panel week-panel" aria-label="주간 시간표"><div class="week-head"><div class="week-corner"></div>${days.map(day=>`<button class="week-day ${day===TODAY?'today':''} ${day===selectedDate?'selected':''}" data-action="week-select" data-date="${day}" aria-label="${day} 선택"><small>${koDays[dateObj(day).getDay()]}</small><b>${dateObj(day).getDate()}</b></button>`).join('')}</div>${selectedCollection?weekTaskLane(days):''}<div class="week-grid" style="height:${height}px"><div class="week-hours">${Array.from({length:range},(_,i)=>`<div class="week-hour">${String(first+i).padStart(2,'0')}:00</div>`).join('')}</div>${days.map(day=>`<div class="week-column ${day===selectedDate?'selected':''}" data-date="${day}" data-first-hour="${first}">${Array.from({length:range},(_,i)=>`<button class="week-slot" style="top:${i*40}px" data-action="new-event" data-date="${day}" data-time="${String(first+i).padStart(2,'0')}:00" aria-label="${day} ${first+i}시에 일정 추가">+</button>`).join('')}${positionEvents(eventsForDate(day)).map(p=>`<button draggable="true" class="schedule-event week-event ${p.end-p.start<60?'short-event':''}" data-action="edit-event" data-id="${esc(p.event.id)}" data-occurrence="${day}" style="${eventStyle(p.event.cat)};top:${(p.start-first*60)/60*40}px;height:${(p.end-p.start)/60*40-3}px;left:calc(4px + (100% - 8px) * ${p.column/p.group.columns});width:calc((100% - 8px) / ${p.group.columns} - 2px)" aria-label="${esc(p.event.title)} ${day} ${p.event.start}, 클릭해서 수정"><small>${p.event.start} — ${p.event.end}</small><b>${esc(p.event.title)}</b>${p.end-p.start>=75?`<span>${esc(p.event.location)} ${p.event.repeat?'↻':''}</span>`:''}</button>`).join('')}</div>`).join('')}</div></section>`;
}
function monthItems(date){
  const events=eventsForDate(date),tasks=tasksForDate(date);
  const eventChip=e=>`<button class="month-item" style="${eventStyle(e.cat)}" data-action="edit-event" data-id="${esc(e.id)}">${e.start} ${esc(e.title)}</button>`;
  if(!selectedCollection)return events.slice(0,2).map(eventChip).join('')+(events.length>2?`<button class="month-task" data-action="select-date" data-date="${date}">+ ${events.length-2}개</button>`:'')+(tasks.length?`<button class="month-task" data-action="select-date" data-date="${date}">${icon('todo')} ${tasks.filter(t=>taskDone(t,date)).length}/${tasks.length} 할 일</button>`:'');
  const items=[...events.map(record=>({type:'event',record})),...tasks.map(record=>({type:'task',record}))];
  const preview=events.length&&tasks.length?[{type:'event',record:events[0]},{type:'task',record:tasks[0]}]:items.slice(0,2);
  return preview.map(item=>{
    if(item.type==='event')return eventChip(item.record);
    const t=item.record,done=taskDone(t,date);
    return `<button class="month-item month-checklist ${done?'done':''}" style="${eventStyle(t.cat)}" data-action="edit-task" data-id="${esc(t.id)}" aria-label="${esc(t.title)} ${date} 할 일 수정">${icon(done?'check':'todo')}<span>${esc(t.title)}</span></button>`;
  }).join('')+(items.length>preview.length?`<button class="month-task" data-action="select-date" data-date="${date}">+ ${items.length-preview.length}개</button>`:'');
}
function renderMonth(){
  const first=`${selectedDate.slice(0,7)}-01`,start=addDays(first,-dateObj(first).getDay());
  const rows=Math.ceil((dateObj(first).getDay()+new Date(dateObj(first).getFullYear(),dateObj(first).getMonth()+1,0).getDate())/7),month=selectedDate.slice(0,7);
  return heading()+`<section class="paper-panel month-panel" aria-label="월간 캘린더"><div class="month-weekdays">${koDays.map(d=>`<span>${d}</span>`).join('')}</div><div class="month-grid">${Array.from({length:rows*7},(_,i)=>{const date=addDays(start,i);return `<div class="month-cell ${date.slice(0,7)!==month?'outside':''} ${date===selectedDate?'selected':''} ${date===TODAY?'is-today':''}"><button class="month-day" data-action="select-date" data-date="${date}" aria-label="${date} 하루 페이지 보기">${dateObj(date).getDate()}</button><button class="month-add" data-action="new-event" data-date="${date}" aria-label="${date} 일정 추가">+</button>${monthItems(date)}</div>`;}).join('')}</div></section>`;
}
function render(){
  if(selectedCollection&&!journal.categories.some(c=>c.id===selectedCollection))selectedCollection=null;
  renderNavigation();applyCollectionColor();
  $('#main').innerHTML=stitchBanner()+collectionToolbar()+(view==='week'?renderWeek():view==='month'?renderMonth():renderDaily());
}
function writeRoute(){history.replaceState(null,'',selectedCollection?`#collection/${encodeURIComponent(selectedCollection)}/${view}`:`#${view}`);}
function readRoute(){
  const parts=location.hash.slice(1).split('/');selectedCollection=null;view='daily';
  if(parts[0]==='collection'){
    let id='';try{id=decodeURIComponent(parts[1]||'');}catch{}
    if(journal.categories.some(c=>c.id===id)){selectedCollection=id;view=views.some(v=>v.id===parts[2])?parts[2]:'daily';}
  }else if(views.some(v=>v.id===parts[0]))view=parts[0];
  else if(parts[0].startsWith('collection-')){let id='';try{id=decodeURIComponent(parts[0].slice(11));}catch{}if(journal.categories.some(c=>c.id===id))selectedCollection=id;}
}
function navigate(next,collection=null){
  view=views.some(v=>v.id===next)?next:'daily';selectedCollection=collection&&journal.categories.some(c=>c.id===collection)?collection:null;quickCategory=null;memoOpen=false;
  writeRoute();render();window.scrollTo({top:0,behavior:'instant'});
}
function changeDate(date,daily=false){
  if(!validDate(date))return;
  selectedDate=date;quickCategory=null;memoOpen=false;if(daily)view='daily';
  writeRoute();save();render();
}
function shiftMonth(date,n){const d=dateObj(date),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return iso(d);}

function categoryOptions(selected) {return journal.categories.map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.name)}</option>`).join('');}
function openEditor(type='task',id=null,options={}) {
  const existing=id?(type==='task'?journal.tasks:journal.events).find(r=>r.id===id):null;
  if(id&&!existing)return;
  editor={type,id,date:options.date||selectedDate,start:options.time||'09:00',cat:options.cat||selectedCollection||journal.categories[0].id,...(existing||{})};
  renderEditor();$('#editor-dialog').showModal();
  setTimeout(()=>$('#editor-form [name="title"]')?.focus(),30);
}
function renderEditor(){
  const isTask=editor.type==='task',start=editor.start||'09:00',end=editor.end||clock(Math.min(1439,minutes(start)+60));
  const optional=!!(editor.time||editor.priority||editor.note||(editor.repeat&&editor.repeat!=='none'));
  $('#editor-form').innerHTML=`<div class="dialog-header"><h2>${isTask?'할 일':'일정'}${editor.id?' 수정':''}</h2><button type="button" class="icon-button" data-close="editor-dialog" aria-label="닫기">×</button></div><label class="field">제목<input name="title" aria-label="제목" maxlength="140" value="${esc(editor.title||'')}" required autofocus></label><div class="field-row"><label class="field">날짜<input type="date" name="date" value="${esc(editor.date)}" required></label><label class="field">컬렉션<select name="cat">${categoryOptions(editor.cat)}</select></label></div>${isTask?`<details class="editor-options" ${optional?'open':''}><summary>옵션</summary><div class="field-row"><label class="field">시간<input type="time" name="time" value="${esc(editor.time||'')}"></label><label class="field">반복<select name="repeat"><option value="none" ${!editor.repeat||editor.repeat==='none'?'selected':''}>없음</option><option value="daily" ${editor.repeat==='daily'?'selected':''}>매일</option><option value="weekdays" ${editor.repeat==='weekdays'?'selected':''}>평일</option><option value="weekly" ${editor.repeat==='weekly'?'selected':''}>매주</option></select></label></div><label class="check-field"><input type="checkbox" name="priority" ${editor.priority?'checked':''}>중요</label><label class="field">메모<textarea name="note" maxlength="2000">${esc(editor.note||'')}</textarea></label></details>`:`<div class="field-row"><label class="field">시작<input type="time" name="start" value="${esc(start)}" required></label><label class="field">종료<input type="time" name="end" value="${esc(end)}" required></label></div><label class="check-field"><input type="checkbox" name="weekly" ${editor.repeat?'checked':''}>매주 ${koDays[dateObj(editor.date).getDay()]}요일</label><details class="editor-options" ${editor.location?'open':''}><summary>메모</summary><label class="field">장소 · 메모<input name="location" maxlength="120" value="${esc(editor.location||'')}"></label></details>`}<div class="dialog-footer">${editor.id?'<button type="button" class="delete-button" data-action="request-delete">삭제</button>':''}<button type="submit" class="primary-button">저장</button></div><div class="delete-confirm hidden" id="delete-confirm">${editor.repeat&&editor.repeat!=='none'?'반복 기록을 모두 삭제할까요?':'삭제할까요?'}<button type="button" data-action="confirm-delete">삭제</button></div>`;
}

function captureEditor() {
  const f=new FormData($('#editor-form'));
  editor.title=f.get('title');editor.date=f.get('date');editor.cat=f.get('cat');
  if(editor.type==='task'){editor.time=f.get('time');editor.repeat=f.get('repeat');editor.priority=f.has('priority');editor.note=f.get('note');}
  else{editor.start=f.get('start');editor.end=f.get('end');editor.repeat=f.has('weekly');editor.location=f.get('location');}
}
function submitEditor(event) {
  event.preventDefault();captureEditor();
  const title=String(editor.title||'').trim();
  if(!title){$('#editor-form [name="title"]').setCustomValidity('제목을 입력하세요.');$('#editor-form [name="title"]').reportValidity();return;}
  if(!validDate(editor.date)){toast('날짜를 확인하세요.');return;}
  if(editor.type==='event' && (!validTime(editor.start)||!validTime(editor.end)||minutes(editor.end)<=minutes(editor.start))){const el=$('#editor-form [name="end"]');el.setCustomValidity('종료는 시작 이후로 설정하세요.');el.reportValidity();return;}
  if(editor.type==='task') {
    const old=editor.id?journal.tasks.find(t=>t.id===editor.id):null;
    const record={id:editor.id||uid(),title,date:editor.date,cat:editor.cat,done:old?.done||false,doneDates:old?.doneDates||[],repeat:editor.repeat||'none',time:editor.time||'',priority:!!editor.priority,note:editor.note||''};
    if(old)journal.tasks[journal.tasks.indexOf(old)]=record;else journal.tasks.push(record);
  } else {
    const old=editor.id?journal.events.find(e=>e.id===editor.id):null;
    const record={id:editor.id||uid(),title,date:editor.date,cat:editor.cat,start:editor.start,end:editor.end,repeat:!!editor.repeat,weekday:dateObj(editor.date).getDay(),location:editor.location||''};
    if(old)journal.events[journal.events.indexOf(old)]=record;else journal.events.push(record);
  }
  save();$('#editor-dialog').close();render();editor=null;
}
function renderSettings(){
  $('#settings-dialog').innerHTML=`<div class="dialog-header"><h2>설정</h2><button class="icon-button" data-close="settings-dialog" aria-label="설정 닫기">×</button></div><div class="settings-section"><label class="field">이름<input id="journal-name" maxlength="24" value="${esc(journal.name)}" aria-label="이름"></label></div><div class="settings-section"><h3>테마</h3><div class="theme-options">${Object.entries(themes).map(([key,t])=>`<button class="theme-option ${journal.theme===key?'selected':''}" data-action="theme" data-theme="${key}" aria-pressed="${journal.theme===key}"><span class="theme-preview" style="--theme-bg:${t.bg};--theme-color:${t.tint}"><i></i><i></i><i></i></span>${t.name}</button>`).join('')}</div></div><div class="settings-section"><h3>백업</h3><div class="backup-buttons"><button class="outline-button" data-action="export">${icon('download')} 내보내기</button><button class="outline-button" data-action="import">${icon('upload')} 가져오기</button></div><p class="settings-hint">이 브라우저에 저장됩니다. 가져온 기록은 추가됩니다.</p></div>`;
}
function openSettings(){renderSettings();$('#settings-dialog').showModal();}
const catColors=['#dec3cd','#d5dccb','#d9d0e2','#d9cbb7','#c4d5dd','#dfd39f','#d7bcb1'];
function openCategory(id=null){
  const existing=id?category(id):null;editingCategory=existing?.id||null;chosenColor=existing?.color||catColors[0];
  $('#category-form').innerHTML=`<div class="dialog-header"><h2>컬렉션${id?' 수정':''}</h2><button type="button" class="icon-button" data-close="category-dialog" aria-label="닫기">×</button></div><label class="field">이름<input name="name" aria-label="컬렉션 이름" maxlength="32" required value="${esc(existing?.name||'')}"></label><div class="field">색상<div class="color-options">${catColors.map(c=>`<button type="button" class="color-option ${chosenColor===c?'active':''}" style="--cat:${c}" data-action="category-color" data-color="${c}" aria-label="${c} 색상" aria-pressed="${chosenColor===c}"></button>`).join('')}</div></div><div class="dialog-footer"><button class="primary-button" type="submit">저장</button></div>`;
  $('#category-dialog').showModal();setTimeout(()=>$('#category-form [name="name"]')?.focus(),20);
}

function searchResults(query) {
  const q=query.trim().toLowerCase();
  if(!q)return '';
  const results=[
    ...journal.tasks.filter(t=>inCollection(t)&&[t.title,t.note,category(t.cat).name].some(s=>String(s||'').toLowerCase().includes(q))).map(t=>({type:'task',id:t.id,title:t.title,date:t.date,subtitle:`할 일 · ${category(t.cat).name}`,icon:'todo'})),
    ...journal.events.filter(e=>inCollection(e)&&[e.title,e.location,category(e.cat).name].some(s=>String(s||'').toLowerCase().includes(q))).map(e=>({type:'event',id:e.id,title:e.title,date:e.date,subtitle:`일정 · ${e.start} — ${e.end}`,icon:'calendar'})),
    ...(selectedCollection?[]:Object.entries(journal.notes)).filter(([,text])=>text.toLowerCase().includes(q)).map(([date,text])=>({type:'note',id:date,title:text.slice(0,60),date,subtitle:'메모',icon:'note'}))
  ];
  return results.length?results.slice(0,30).map(r=>`<button class="search-result" data-action="search-result" data-type="${r.type}" data-id="${esc(r.id)}">${icon(r.icon)}<span><b>${esc(r.title)}</b><small>${esc(r.subtitle)} · ${r.date}</small></span><span>↗</span></button>`).join(''):'<div class="search-empty">검색 결과 없음</div>';
}
function openSearch() {
  $('#search-dialog').innerHTML=`<div class="search-input-row">${icon('search')}<input id="global-search" placeholder="검색" aria-label="할 일, 일정, 메모 검색" autocomplete="off"><button data-close="search-dialog" aria-label="검색 닫기"><kbd>ESC</kbd></button></div><div class="search-results" id="search-results">${searchResults('')}</div>`;
  $('#search-dialog').showModal();setTimeout(()=>$('#global-search')?.focus(),20);
}

function exportJournal(){
  save();const blob=new Blob([JSON.stringify({...journal,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`petit-jour-${TODAY}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('내보내기 완료');
}
function validateImport(data) {
  if(!data || data.version!==1 || !Array.isArray(data.categories) || !data.categories.length || data.categories.length>100 || !Array.isArray(data.tasks) || !Array.isArray(data.events) || data.tasks.length+data.events.length>15000)throw new Error('petit jour에서 내보낸 파일인지 확인해 주세요.');
  const seen=new Set();
  const categories=data.categories.map(c=>{
    if(!c || typeof c.id!=='string' || typeof c.name!=='string' || !c.name.trim() || !/^#[\da-fA-F]{6}$/.test(c.color) || seen.has(c.id))throw new Error('컬렉션 정보가 올바르지 않아요.');seen.add(c.id);
    return {id:c.id.slice(0,100),name:c.name.trim().slice(0,32),short:String(c.short||c.name).slice(0,10),color:c.color};
  });
  const cats=new Set(categories.map(c=>c.id)),taskIds=new Set(),eventIds=new Set();
  const tasks=data.tasks.map(t=>{
    if(!t || typeof t.id!=='string' || typeof t.title!=='string' || !t.title.trim() || !validDate(t.date) || !cats.has(t.cat) || taskIds.has(t.id) || (t.time&&!validTime(t.time)))throw new Error('할 일 정보가 올바르지 않아요.');taskIds.add(t.id);
    return {id:t.id,title:t.title.trim().slice(0,140),date:t.date,cat:t.cat,done:!!t.done,doneDates:Array.isArray(t.doneDates)?t.doneDates.filter(validDate):[],repeat:['none','daily','weekdays','weekly'].includes(t.repeat)?t.repeat:'none',time:t.time||'',priority:!!t.priority,note:String(t.note||'').slice(0,2000)};
  });
  const events=data.events.map(e=>{
    if(!e || typeof e.id!=='string' || typeof e.title!=='string' || !e.title.trim() || !validDate(e.date) || !validTime(e.start) || !validTime(e.end) || minutes(e.end)<=minutes(e.start) || !cats.has(e.cat) || eventIds.has(e.id))throw new Error('일정 정보가 올바르지 않아요.');eventIds.add(e.id);
    return {id:e.id,title:e.title.trim().slice(0,140),date:e.date,cat:e.cat,start:e.start,end:e.end,repeat:!!e.repeat,weekday:dateObj(e.date).getDay(),location:String(e.location||'').slice(0,120)};
  });
  const notes={},moods={};
  for(const [day,text] of Object.entries(data.notes||{}))if(validDate(day)&&typeof text==='string')notes[day]=text.slice(0,5000);
  for(const [day,mood] of Object.entries(data.moods||{}))if(validDate(day)&&['calm','smile','focus','tired'].includes(mood))moods[day]=mood;
  return {categories,tasks,events,notes,moods};
}
async function importJournal(file) {
  if(!file)return;
  try{
    if(file.size>10*1024*1024)throw new Error('10MB 이하의 기록 파일을 선택해 주세요.');
    const data=validateImport(JSON.parse(await file.text()));
    const catMap=new Map();
    for(const c of data.categories){
      const existing=journal.categories.find(x=>x.id===c.id);
      if(existing && existing.name!==c.name){const newid=uid();catMap.set(c.id,newid);journal.categories.push({...c,id:newid});}
      else{catMap.set(c.id,c.id);if(!existing)journal.categories.push(c);}
    }
    let added=0;
    for(const type of ['tasks','events'])for(const record of data[type]){
      const mapped={...record,cat:catMap.get(record.cat)};
      const existing=journal[type].find(x=>x.id===record.id);
      if(!existing){journal[type].push(mapped);added++;}
      else if(JSON.stringify(existing)!==JSON.stringify(mapped)){journal[type].push({...mapped,id:uid()});added++;}
    }
    for(const [day,note] of Object.entries(data.notes)){
      if(!journal.notes[day])journal.notes[day]=note;
      else if(journal.notes[day]!==note&&!journal.notes[day].includes(note))journal.notes[day]+=`\n\n— 가져온 기록 —\n${note}`;
    }
    for(const [day,mood] of Object.entries(data.moods))if(!journal.moods[day])journal.moods[day]=mood;
    const saved=save();render();if(saved)toast(`${added}개 추가됨`);
  }catch(err){toast(err instanceof SyntaxError?'기록 파일을 읽을 수 없어요. JSON 파일인지 확인해 주세요.':err.message||'이 파일은 가져올 수 없어요.');}
  $('#import-file').value='';
}

document.addEventListener('click',event=>{
  const close=event.target.closest('[data-close]');if(close){$('#'+close.dataset.close)?.close();return;}
  const button=event.target.closest('[data-action]');if(!button)return;
  const {action,id,date,time}=button.dataset;
  switch(action){
    case 'view':navigate(button.dataset.view);break;
    case 'collection':navigate('daily',id);break;
    case 'collection-view':navigate(button.dataset.view,selectedCollection);break;
    case 'edit-memo':memoOpen=true;render();$('#daily-note')?.focus();break;
    case 'finish-memo':finishMemo();break;
    case 'settings':openSettings();break;
    case 'new-task':openEditor('task',null,{cat:id||selectedCollection,date:date||selectedDate});break;
    case 'new-event':openEditor('event',null,{cat:selectedCollection,date:date||selectedDate,time:time||'09:00'});break;
    case 'edit-task':openEditor('task',id);break;
    case 'edit-event':openEditor('event',id);break;
    case 'toggle-task':{
      const task=journal.tasks.find(t=>t.id===id);if(!task)break;
      const day=date||selectedDate;
      if(task.repeat!=='none'){task.doneDates=task.doneDates||[];if(task.doneDates.includes(day))task.doneDates=task.doneDates.filter(d=>d!==day);else task.doneDates.push(day);}else task.done=!task.done;
      save();render();break;
    }
    case 'focus-add':quickCategory=id;render();$$('[data-quick-add]').find(f=>f.dataset.cat===id)?.querySelector('input').focus();break;
    case 'select-date':changeDate(date,true);break;
    case 'week-select':changeDate(date);break;
    case 'today':changeDate(TODAY);break;
    case 'strip-prev':case 'strip-next':changeDate(addDays(selectedDate,action==='strip-next'?7:-7));break;
    case 'date-prev':case 'date-next':{const n=action==='date-next'?1:-1;changeDate(view==='month'?shiftMonth(selectedDate,n):addDays(selectedDate,view==='week'?n*7:n));break;}
    case 'date-picker':$('#date-form [name="date"]').value=selectedDate;$('#date-dialog').showModal();break;
    case 'theme':journal.theme=button.dataset.theme;applyTheme();save();renderSettings();break;
    case 'category':openCategory();break;
    case 'edit-category':openCategory(id);break;
    case 'category-color':chosenColor=button.dataset.color;$$('.color-option').forEach(b=>{const active=b.dataset.color===chosenColor;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});break;
    case 'request-delete':$('#delete-confirm').classList.remove('hidden');break;
    case 'confirm-delete':{const list=editor.type==='task'?'tasks':'events';journal[list]=journal[list].filter(r=>r.id!==editor.id);save();$('#editor-dialog').close();editor=null;render();break;}
    case 'search':openSearch();break;
    case 'search-result':$('#search-dialog').close();if(button.dataset.type==='note'){selectedCollection=null;changeDate(id,true);memoOpen=true;render();$('#daily-note')?.focus();}else openEditor(button.dataset.type,id);break;
    case 'export':exportJournal();break;
    case 'import':$('#import-file').click();break;
  }
});
document.addEventListener('submit',event=>{
  if(event.target.id==='editor-form'){submitEditor(event);return;}
  if(event.target.id==='date-form'){event.preventDefault();changeDate(new FormData(event.target).get('date'));$('#date-dialog').close();return;}
  if(event.target.matches('[data-quick-add]')){
    event.preventDefault();const f=new FormData(event.target),title=String(f.get('title')||'').trim(),cat=event.target.dataset.cat;if(!title)return;
    journal.tasks.push({id:uid(),title,date:selectedDate,cat,done:false,doneDates:[],repeat:'none',time:'',priority:false,note:''});
    quickDrafts[cat]='';quickCategory=cat;save();render();$$('[data-quick-add]').find(f=>f.dataset.cat===cat)?.querySelector('input').focus();return;
  }
  if(event.target.id==='category-form'){
    event.preventDefault();const f=new FormData(event.target),name=String(f.get('name')||'').trim();if(!name)return;
    const c={id:editingCategory||uid(),name,short:name.slice(0,10),color:chosenColor};
    if(editingCategory){const old=journal.categories.findIndex(x=>x.id===editingCategory);journal.categories[old]=c;}else journal.categories.push(c);
    save();$('#category-dialog').close();render();
  }
});
document.addEventListener('input',event=>{
  if(event.target.matches('#editor-form input'))event.target.setCustomValidity('');
  if(event.target.matches('[data-quick-add] input'))quickDrafts[event.target.closest('form').dataset.cat]=event.target.value;
  if(event.target.id==='daily-note'){journal.notes[selectedDate]=event.target.value;memoSaveState='저장 중';$('#save-state').textContent=memoSaveState;if($('#memo-save-status'))$('#memo-save-status').textContent=memoSaveState;clearTimeout(noteTimeout);noteTimeout=setTimeout(()=>save(),350);}
  if(event.target.id==='journal-name'){journal.name=event.target.value.trim()||'My';applyTheme();save();}
  if(event.target.id==='global-search')$('#search-results').innerHTML=searchResults(event.target.value);
});
document.addEventListener('change',event=>{
  if(event.target.id==='import-file')importJournal(event.target.files[0]);
  if(event.target.matches('#editor-form [name="date"]')&&editor?.type==='event'){const day=event.target.value;if(validDate(day))$('#editor-form .check-field').lastChild.textContent=`매주 ${koDays[dateObj(day).getDay()]}요일`;}
});
document.addEventListener('keydown',event=>{
  const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if((event.key==='/'&&!typing)||((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')){if($$('dialog[open]').length)return;event.preventDefault();openSearch();}
});

let draggedEvent=null;
document.addEventListener('dragstart',event=>{
  const el=event.target.closest('.week-event');if(!el)return;
  draggedEvent={id:el.dataset.id,occurrence:el.dataset.occurrence};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',el.dataset.id);
});
document.addEventListener('dragover',event=>{
  const column=event.target.closest('.week-column');if(!column||!draggedEvent)return;
  event.preventDefault();event.dataTransfer.dropEffect='move';$$('.week-column.dragover').forEach(c=>c.classList.remove('dragover'));column.classList.add('dragover');
});
document.addEventListener('dragleave',event=>{const column=event.target.closest('.week-column');if(column&&!column.contains(event.relatedTarget))column.classList.remove('dragover');});
document.addEventListener('drop',event=>{
  const column=event.target.closest('.week-column');if(!column||!draggedEvent)return;event.preventDefault();
  const record=journal.events.find(e=>e.id===draggedEvent.id);if(!record)return;
  const offset=event.clientY-column.getBoundingClientRect().top,first=Number(column.dataset.firstHour),duration=minutes(record.end)-minutes(record.start);
  const start=Math.max(0,Math.min(1439-duration,first*60+Math.floor(offset/20)*30));
  record.start=clock(start);record.end=clock(start+duration);
  if(record.repeat){record.weekday=dateObj(column.dataset.date).getDay();record.date=addDays(weekStart(record.date),(record.weekday+6)%7);}else record.date=column.dataset.date;
  const saved=save();draggedEvent=null;render();if(saved)toast('이동됨');
});
document.addEventListener('dragend',()=>{draggedEvent=null;$$('.week-column.dragover').forEach(c=>c.classList.remove('dragover'));});
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
window.addEventListener('beforeunload',()=>save());
window.addEventListener('storage',event=>{if(event.key===STORE_KEY){journal=loadJournal();applyTheme();render();}});

readRoute();
window.addEventListener('hashchange',()=>{readRoute();quickCategory=null;memoOpen=false;render();});
$$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
applyTheme();save();render();
