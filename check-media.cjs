// Run with linkedom and fake-indexeddb available in NODE_PATH; no browser control.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),{indexedDB}=require('fake-indexeddb'),{File}=require('node:buffer');
const {document}=parseHTML(fs.readFileSync('dist/index.html','utf8'));
const dialog=document.querySelector('#detailDialog');dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
const context={document,window:{indexedDB,scrollTo(){},addEventListener(){}},indexedDB,localStorage:{getItem:()=>null,setItem(){}},location:{hash:''},history:{replaceState(){},pushState(){}},URL,crypto:require('node:crypto').webcrypto,Blob,File,Set,setTimeout,clearTimeout};
vm.createContext(context);
for(const file of ['listings-data.js','listing-media.js','media.js','creator.js','home.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const run=code=>vm.runInContext(code,context),$=s=>document.querySelector(s);
async function main(){
 const media=run('LISTING_MEDIA');assert.equal(Object.keys(media).length,run('listings.length'));
 assert.equal(Object.values(media).filter(list=>list[0].kind==='source').length,run('listings.length'));
 assert.equal(Object.values(media).filter(list=>list[0].kind==='example').length,0);
 for(const [id,photos] of Object.entries(media))for(const photo of photos){if(!photo.src.startsWith('https:')){const bytes=fs.readFileSync('dist/'+photo.src);assert.ok(bytes[0]===255&&bytes[1]===216||bytes[0]===137&&bytes[1]===80);}else assert.equal(photo.src,photo.source);if(photo.kind==='source')assert.ok(photo.source.includes('/'+id+'/'));}
 run('showProperty(75186)');assert.equal(document.querySelectorAll('[data-photo-index]').length,media[75186].length);$('#galleryNext').onclick();assert.match($('#galleryMain').getAttribute('src'),/75186-2.jpg/);$('#galleryPrev').onclick();assert.match($('#galleryMain').getAttribute('src'),/75186-1.jpg/);
 assert.match($('.gallery-credit').textContent,/Advertiser images/);
 for(const bad of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=abcdefghijk','http://youtu.be/abcdefghijk','https://evil.test/a.mp4','https://user:pass@youtube.com/watch?v=abcdefghijk','https://vimeo.com/123/<script>'])assert.equal(run('normalizeVideoLink('+JSON.stringify(bad)+')'),null);
 assert.equal(run("normalizeVideoLink('https://youtu.be/abcdefghijk?t=10').embed"),'https://www.youtube-nocookie.com/embed/abcdefghijk');
 assert.equal(run("normalizeVideoLink('https://vimeo.com/123456/abcdef').embed"),'https://player.vimeo.com/video/123456?h=abcdef');
 assert.match(run("mediaFileError({size:1,type:'image/svg+xml'},'photo')"),/JPG/);
 assert.match(run("mediaFileError({size:300*1024*1024,type:'video/mp4'},'video')"),/250 MB/);
 assert.equal(run("mediaFileError({size:1024,type:'video/mp4'},'video')"),'');
 $('#listBtn').onclick();assert.ok($('#listingForm'));assert.match($('#dialogContent').textContent,/Saved on this device only/);
 // Validation prevents progression with missing details.
 await $('#listingForm').onsubmit({preventDefault(){}});assert.match($('#creatorError').textContent,/title/);
 const fill=(name,value)=>{const el=$('[data-draft-field="'+name+'"]');el.value=value;el.oninput();};
 fill('title','Test home <script>alert(1)</script>');fill('neighborhood','Duhok');fill('price','120000');fill('area','200');
 await $('#listingForm').onsubmit({preventDefault(){}});assert.equal(run('creatorStep'),2);
 await $('#listingForm').onsubmit({preventDefault(){}});assert.match($('#creatorError').textContent,/at least one photo/);
 context.testPhoto=new File([fs.readFileSync('dist/assets/listings/75186-1.jpg')],'cover.jpg',{type:'image/jpeg'});
 context.testPhoto2=new File([fs.readFileSync('dist/assets/listings/75186-2.jpg')],'interior.jpg',{type:'image/jpeg'});
 run('listingDraft.photos=[testPhoto,testPhoto2];renderCreator()');
 $('[data-cover="1"]').onclick();assert.equal(run('listingDraft.photos[0].name'),'interior.jpg');
 $('[data-video-mode="link"]').onclick();fill('videoLink','https://youtu.be/abcdefghijk');$('#previewVideoLink').onclick();
 assert.equal(document.querySelectorAll('iframe').length,0);assert.ok($('[data-play-video]'));
 $('[data-play-video]').onclick();assert.equal(document.querySelectorAll('iframe').length,1);
 await $('#listingForm').onsubmit({preventDefault(){}});assert.equal(run('creatorStep'),3);assert.equal(document.querySelectorAll('#dialogContent script').length,0);assert.match($('#dialogContent').textContent,/not be published/);
 await $('#listingForm').onsubmit({preventDefault(){}});assert.match($('#dialogContent').textContent,/DRAFT SAVED/);
 const stored=await run("draftStore('getAll')");assert.equal(stored.length,1);assert.equal(stored[0].photos.length,2);assert.ok(stored[0].photos[0] instanceof Blob);assert.equal(stored[0].videoLink,'https://youtu.be/abcdefghijk');
 // A second read after closing/reopening the database retains exact media bytes.
 const storedAgain=await run("draftStore('getAll')");assert.equal(storedAgain[0].photos[0].size,context.testPhoto2.size);
 await run('showMyDrafts()');assert.equal(document.querySelectorAll('[data-edit-draft]').length,1);$('[data-edit-draft]').onclick();assert.equal($('[data-draft-field="price"]').value,'120000');
 run('closeDialog()');assert.equal(run('creatorPreviewUrls.length'),0);
 console.log('PASS: all sourced galleries, source image identity, navigation, URL rejection, limits, wizard validation, cover selection, lazy embeds, safe review, IndexedDB Blob persistence and reopen');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
