import { Capacitor, SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

if(Capacitor.isNativePlatform()){
  document.documentElement.classList.add('native-app');
  SystemBars.setStyle({style:SystemBarsStyle.Dark,bar:SystemBarType.StatusBar}).catch(()=>{});
  SystemBars.setStyle({style:SystemBarsStyle.Light,bar:SystemBarType.NavigationBar}).catch(()=>{});
  App.addListener('backButton',async()=>{
    if(window.KurdStayMobile?.handleBack())return;
    await App.minimizeApp();
  });
  App.addListener('appStateChange',({isActive})=>{
    if(isActive)window.KurdStayMobile?.resume();
    else document.querySelectorAll('video').forEach(v=>v.pause());
  });
  document.addEventListener('click',async event=>{
    const link=event.target.closest?.('a[href]');
    if(!link||event.defaultPrevented||link.hasAttribute('download'))return;
    let url;try{url=new URL(link.href,location.href);}catch{return;}
    if(url.protocol!=='https:'||url.origin===location.origin)return;
    event.preventDefault();
    try{await Browser.open({url:url.href,toolbarColor:'#102b3d'});}
    catch{window.open(url.href,'_blank','noopener,noreferrer');}
  });
}
