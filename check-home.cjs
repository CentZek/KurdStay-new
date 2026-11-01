const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
const el=(name)=>{if(!elements.has(name))elements.set(name,{innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){}});return elements.get(name)};
const context={document:{querySelector:el,querySelectorAll:()=>[],body:el('body')},window:{addEventListener(){},scrollTo(){}},location:{hash:''},localStorage:{getItem:()=>null,setItem(){}},L:{map(){throw Error('Homepage must not initialize map')}},Set};
vm.createContext(context);
vm.runInContext(fs.readFileSync('dist/listings-data.js','utf8'),context);
for(const file of ['listing-media.js','media.js','creator.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
vm.runInContext(fs.readFileSync('dist/home.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);
const home=elements.get('#homePage').innerHTML;
assert.match(home,/Find your place/);
for(const region of ['Duhok','Erbil','Sulaymaniyah','Halabja'])assert.ok(home.includes('data-home-region="'+region+'"'));
assert.equal(vm.runInContext('new Set(Object.values(regionPhotos).map(p=>p.file)).size',context),4);
for(const photo of vm.runInContext('Object.values(regionPhotos)',context)){
  assert.ok(fs.existsSync('dist/'+photo.file));assert.ok(home.includes(photo.landmark));
  assert.ok(home.includes(photo.source));assert.ok(home.includes(photo.licenseUrl));
}
assert.equal((home.match(/data-home-property=/g)||[]).length,3);
assert.equal(vm.runInContext('state.view',context),'regions');
assert.equal(vm.runInContext('map',context),undefined);
console.log('PASS: homepage renders four real landmark photographs with credits and three property links without initializing the map');

assert.equal(vm.runInContext("resolveHomeSearch('  ZAKHO  ').district",context),'Zakho');
assert.equal(vm.runInContext("resolveHomeSearch('Zakho').query",context),'');
assert.equal(vm.runInContext("resolveHomeSearch('bright').query",context),'bright');
assert.equal(vm.runInContext("resolveHomeSearch('').district",context),'All');
const lands=vm.runInContext("featuredMarkup('Land')",context);
assert.equal((lands.match(/data-home-property=/g)||[]).length,3);
assert.ok(!lands.includes('Illustrative house photograph'));
assert.match(home,/id="homeSearch"/);
assert.match(home,/data-search-type="Apartment"/);
assert.ok(home.includes(vm.runInContext('listings.length',context)+' source advertisements'));
assert.ok(!home.includes('Sample listing'));
assert.match(home,/assets\/listings\/75186-1.jpg/);
assert.match(lands,/assets\/listings\/74662-1.jpg/);
console.log('PASS: district search normalization, property keyword search, featured type filter, and search controls');
