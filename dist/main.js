(()=>{var e={279:(e,t)=>{t.DefaultMinMinutes=30,t.DefaultMaxMinutes=90},21:(e,t)=>{t.MediaList=[{path:"media/worms-transparent.gif",durationMillis:4410},{path:"media/big-buck-bunny_trailer.webm",durationMillis:31e3},{path:"media/worms.gif",durationMillis:3290}]}},t={};function i(a){var n=t[a];if(void 0!==n)return n.exports;var s=t[a]={exports:{}};return e[a](s,s.exports,i),s.exports}(()=>{"use strict";const e=i(279),t=i(21),a=60*e.DefaultMinMinutes*1e3,n=60*e.DefaultMaxMinutes*1e3,s=t.MediaList[0],r=function(e){let t,i=e.slice((Math.max(0,e.lastIndexOf("."))||1/0)+1);switch(i){case"apng":case"avif":case"gif":case"jpg":case"jpeg":case"jpe":case"jif":case"png":case"svg":case"jfif":case"webp":t="img";break;case"webm":t="video";break;default:throw"File extension ."+i+" is not yet supported"}return t}(s.path),o=function(e){let t=document.createElement(e);switch(t.id="rendered-media",t.style="max-width: 25%; max-height: 25%; object-fit: contain",e){case"img":default:return t;case"video":return function(e){let t=document.createElement("source");return t.src=s.path,t.type="video/webm",e.autoplay=!0,e.appendChild(t),e}(t)}}(r);document.getElementById("media-div").appendChild(o);const l=function(){let e=new Proxy(new URLSearchParams(window.location.search),{get:(e,t)=>e.get(t||"")}),t=c(e.skipDelay),i=u(e.min)?60*e.min*1e3:a,s=u(e.max)?60*e.max*1e3:n,r=c(e.slideshow),o=c(e.randomize);return s<=i&&(i=a,s=n),{skipDelay:t,minDelay:i,maxDelay:s,slideshow:r,shouldRandomize:o}}();function u(e){return!isNaN(e)&&!isNaN(parseFloat(e))&&parseFloat(e)>0}function c(e){return"true"===e}!function e(t){let i=l.skipDelay?0:(a=l.minDelay,n=l.maxDelay,Math.floor(Math.random()*(n-a+1)+a));var a,n;setTimeout((()=>{"img"===r?(t.src="",t.src=s.path):(t.currentTime=0,t.play()),t.style.visibility="visible",setTimeout((()=>{t.style.visibility="hidden",e(t)}),s.durationMillis)}),i)}(o)})()})();