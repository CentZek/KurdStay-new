const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{parseHTML}=require('linkedom');
const {document,window}=parseHTML(fs.readFileSync('dist/index.html','utf8'));
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return this.querySelector('option[selected]')?.getAttribute('value')||this.querySelector('option[selected]')?.textContent||this.querySelector('option')?.getAttribute('value')||this.querySelector('option')?.textContent||'';},set(v){this.querySelectorAll('option').forEach(o=>{if((o.getAttribute('value')||o.textContent)===v)o.setAttribute('selected','');else o.removeAttribute('selected');});},configurable:true});
const dialog=document.querySelector('dialog');dialog.showModal=()=>dialog.open=true;dialog.close=()=>dialog.open=false;
const events={};let mapCreated=0;
const fakeMap={center:null,zoom:0,setView(p,z){this.center=p;this.zoom=z;events.zoomend?.();return this;},on(n,fn){events[n]=fn;return this;},invalidateSize(){return this;},getZoom(){return this.zoom;},getBounds(){return {contains:()=>true};},latLngToLayerPoint:([a,b])=>({x:a*1000,y:b*1000}),fitBounds(points){this.center=points[0];return this;},zoomIn(){this.zoom++;events.zoomend?.();},zoomOut(){this.zoom--;events.zoomend?.();}};
const L={map(){mapCreated++;return fakeMap;},tileLayer(){return {addTo(){return this;},on(){return this;},redraw(){}};},layerGroup(){return {items:[],addTo(){return this;},clearLayers(){this.items=[];}};},divIcon:x=>x,marker(point,{icon}){const node=document.createElement('div');node.innerHTML=icon.html;return {point,addTo(layer){layer.items.push(this);return this;},getElement:()=>node};},control:{scale:()=>({addTo(){}})}};
const context={document,window:{scrollTo(){},addEventListener(){},matchMedia:()=>({matches:false})},L,location:{hash:''},history:{pushState(_a,_b,hash){context.location.hash=hash;},replaceState(_a,_b,hash){context.location.hash=hash;}},localStorage:{getItem:()=>null,setItem(){}},crypto:require('node:crypto').webcrypto,Set,URL,setTimeout,clearTimeout,requestAnimationFrame:fn=>fn()};
vm.createContext(context);for(const f of ['listings-data.js','listing-media.js','media.js','creator.js','home.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),context);
const run=s=>vm.runInContext(s,context),$=s=>document.querySelector(s);assert.equal(mapCreated,0);
for(const region of ['Duhok','Erbil','Sulaymaniyah','Halabja']){
 const count=run('regionInventory('+JSON.stringify(region)+').length'),videos=run('regionInventory('+JSON.stringify(region)+').filter(hasPlayableVideo).length');
 run('showRegion('+JSON.stringify(region)+')');assert.equal(run('state.region'),region);assert.equal(run('getFiltered().length'),count);assert.equal(document.querySelectorAll('.listing-card').length,Math.min(count,24));assert.ok($('#mapHeading').textContent.includes(region.toUpperCase()));assert.equal(run('listingLayer.items.length')>0,true);
 const r=run('regionByName('+JSON.stringify(region)+')');assert.deepEqual(Array.from(fakeMap.center),[r.lat,r.lng]);
 assert.ok(run('getFiltered().every(p=>p.region===state.region)'));$('#videoOnly').onchange({target:{checked:true}});assert.equal(run('getFiltered().length'),videos);assert.ok($('#activeFilters').textContent.includes('With video'));
 run("clearSearchFilter('all')");assert.equal(run('getFiltered().length'),count);
 const d=run('districts[0].name');run('chooseDistrict('+JSON.stringify(d)+')');assert.ok(run('getFiltered().every(p=>p.district===state.district)'));
}
assert.equal(mapCreated,1);assert.ok($('.coverage-note').textContent.includes(run('regionInventory("Halabja").length')+' sourced listings'));
context.location.hash='#erbil';run('route()');assert.equal(run('state.region'),'Erbil');run('saved.add(76770);saved.add(76399)');context.location.hash='#saved-erbil';run('route()');assert.equal(run('getFiltered().length'),1);assert.equal(run('getFiltered()[0].id'),76770);
run('showRegions()');$('#featuredRegion').onchange({target:{value:'Sulaymaniyah'}});assert.equal(document.querySelectorAll('[data-home-property]').length,3);$('[data-home-property]').onclick();assert.equal(run('state.region'),'Sulaymaniyah');assert.ok($('#dialogTitle').textContent.includes('Suli View'));assert.equal(document.querySelectorAll('iframe').length,0);
$('[data-play-video]').onclick();assert.equal(document.querySelectorAll('iframe').length,1);assert.match($('iframe').getAttribute('src'),/^https:\/\/www.youtube-nocookie.com\/embed\//);run('closeDialog()');assert.equal(document.querySelectorAll('iframe').length,0);
run('showProperty(74712)');assert.equal(document.querySelectorAll('[data-play-video]').length,0);assert.match($('.listing-videos').textContent,/could not be confirmed/);
run("showRegion('Halabja');openListingCreator()");assert.equal(run('listingDraft.region'),'Halabja');assert.equal(document.querySelectorAll('[data-draft-field="region"] option').length,4);
const data=JSON.parse(fs.readFileSync('dist/listings.json','utf8')).listings;assert.ok(data.length>1000);assert.equal(new Set(data.map(p=>p.id)).size,data.length);assert.equal(data.filter(p=>p.videos?.some(v=>v.embedAvailable)).length,4);
for(const p of data){assert.ok(p.price>0);assert.equal(p.lat,null);assert.equal(p.lng,null);const src=run('getListingPhotos(listings.find(p=>p.id==='+p.id+'))[0].src');assert.ok(src.startsWith('https://d2gaul3mrxbclc.cloudfront.net/')||fs.existsSync('dist/'+src));}
run("closeDialog();showRegion('Erbil')");
const firstIds=Array.from(document.querySelectorAll('[data-open]'),e=>e.dataset.open),allCount=run('getFiltered().length');
$('#nextPage').onclick();assert.equal(run('state.page'),2);assert.equal(document.querySelectorAll('.listing-card').length,24);
assert.ok(Array.from(document.querySelectorAll('[data-open]'),e=>e.dataset.open).every(id=>!firstIds.includes(id)));
assert.equal(run('getFiltered().length'),allCount);assert.ok($('#mapKey').textContent.startsWith(String(run('getFiltered().filter(p=>mapPosition(p)).length'))));
$('#maxPrice').oninput({target:{value:'100000'}});assert.equal(run('state.page'),1);assert.ok(run('getFiltered().every(p=>p.price<=100000)'));
run("clearSearchFilter('all');state.page=Math.ceil(getFiltered().length/state.pageSize);renderResults()");assert.equal($('#nextPage').disabled,true);assert.equal(document.querySelectorAll('.listing-card').length,allCount%24||24);
run('showMapGroup({items:getFiltered().slice(0,95)})');assert.equal(document.querySelectorAll('[data-group-property]').length,40);const groupFirst=$('[data-group-property]').dataset.groupProperty;
$('#groupNext').onclick();assert.equal(document.querySelectorAll('[data-group-property]').length,40);assert.notEqual($('[data-group-property]').dataset.groupProperty,groupFirst);
$('#groupNext').onclick();assert.equal(document.querySelectorAll('[data-group-property]').length,15);assert.equal($('#groupNext').disabled,true);
run("closeDialog();showRegions()");$('#featuredRegion').onchange({target:{value:'Halabja'}});assert.equal(document.querySelectorAll('[data-home-property]').length,run("regionInventory('Halabja').length"));
console.log('PASS: four regional routes and maps; inventory filters, favorites, media and drafts; 24-card pagination, filter resets, full-result map coverage and 40-item group pagination');
