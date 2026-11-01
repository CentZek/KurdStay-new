// DOM interaction checks; uses the same external linkedom dependency as check-media.cjs.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const {document}=parseHTML(fs.readFileSync('dist/index.html','utf8'));
const dialog=document.querySelector('dialog');dialog.showModal=()=>dialog.open=true;dialog.close=()=>dialog.open=false;
const context={document,window:{scrollTo(){},addEventListener(){},matchMedia:()=>({matches:false})},location:{hash:''},history:{pushState(){},replaceState(){}},localStorage:{getItem:()=>null,setItem(){}},Set,URL,setTimeout,clearTimeout,requestAnimationFrame:fn=>fn()};
vm.createContext(context);
for(const f of ['listings-data.js','listing-media.js','media.js','creator.js','home.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),context);
const run=s=>vm.runInContext(s,context),$=s=>document.querySelector(s);
run('showDuhok()');assert.equal(document.querySelectorAll('.listing-card').length,Math.min(24,run('regionInventory("Duhok").length')));
$('#maxPrice').value='100000';$('#maxPrice').oninput({target:$('#maxPrice')});
assert.ok(run('getFiltered().every(p=>p.price<=100000)'));assert.ok(run('getFiltered().length')>0);
$('#minPrice').value='60000';$('#minPrice').oninput({target:$('#minPrice')});
assert.ok(run('getFiltered().every(p=>p.price>=60000&&p.price<=100000)'));
$('#minBeds').oninput({target:{value:'3'}});
assert.ok(run('getFiltered().every(p=>p.beds>=3&&p.price>=60000&&p.price<=100000)'));
assert.equal(document.querySelectorAll('[data-clear-filter]').length,4);
// linkedom's select.value has no setter; supply browser-like setters for reset behavior.
for(const id of ['district','minBeds'])Object.defineProperty($('#'+id),'value',{writable:true,value:'0'});
$('[data-clear-filter="all"]').onclick();assert.equal(run('getFiltered().length'),run('regionInventory("Duhok").length'));assert.ok($('#activeFilters').hidden);
$('[data-layout="map"]').onclick();assert.equal(document.body.dataset.browseLayout,'map');assert.equal($('[data-layout="map"]').getAttribute('aria-pressed'),'true');
$('[data-layout="list"]').onclick();assert.equal(document.body.dataset.browseLayout,'list');
context.window.matchMedia=()=>({matches:true});run("setBrowseLayout('split')");assert.equal(document.body.dataset.browseLayout,'list');
run('showProperty(75186)');assert.equal(dialog.getAttribute('aria-labelledby'),'dialogTitle');assert.ok($('.detail-quick-actions a').href.includes('paya-realestate.com'));
assert.ok($('.evidence-disclosure .source-evidence'));$('#quickSave').onclick();assert.match($('#detailSave').textContent,/Saved/);assert.match($('#quickSave').textContent,/Saved/);
$('#showOnMap').onclick();assert.equal(document.body.dataset.browseLayout,'map');assert.equal(dialog.open,false);
console.log('PASS: combined price/bedroom filters, clear all, map/list modes, mobile default, detail actions, save synchronization and map reveal');
