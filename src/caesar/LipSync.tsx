import React from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {CartoonMouth,type Viseme} from './CartoonMouth';
export type TimedWord={w:string;s:number;e:number};
export function visemeFromWord(word:string):Viseme[] {
  const clean=word.toLowerCase().replace(/[^a-z]/g,'');
  const result:Viseme[]=[];
  const put=(v:Viseme)=>{if(result[result.length-1]!==v)result.push(v);};
  for(let i=0;i<clean.length;i++) {
    const pair=clean.slice(i,i+2);
    if(['oo','ou','ow','wh'].includes(pair)){put('U');i++;continue;}
    if(['ee','ea','ie','sh','ch','th'].includes(pair)){put('E');i++;continue;}
    if(pair==='ph'){put('FV');i++;continue;}
    if(['ai','ay','ei'].includes(pair)){put('A');put('E');i++;continue;}
    const c=clean[i];
    if('mbp'.includes(c))put('MBP');else if('fv'.includes(c))put('FV');
    else if(c==='l')put('L');else if(c==='a')put('A');
    else if('eiy'.includes(c))put('E');else if(c==='o')put('O');
    else if('uwqr'.includes(c))put('U');else if('tdsznxj'.includes(c))put('E');
    else if(c==='h')put('huh');else put('A');
  }
  return result.length?result:['rest'];
}
export type MouthSegment={viseme:Viseme;s:number;e:number};
export function mouthTimeline(words:TimedWord[]):MouthSegment[] {
  const result:MouthSegment[]=[];let cursor=0;
  for(const word of [...words].filter(w=>Number.isFinite(w.s)&&Number.isFinite(w.e)&&w.e>w.s).sort((a,b)=>a.s-b.s)){
    const start=Math.max(0,cursor,word.s),end=Math.max(start,word.e);
    if(end<=start)continue;
    if(start>cursor)result.push({viseme:'rest',s:cursor,e:start});
    const seq=visemeFromWord(word.w),step=(end-start)/seq.length;
    seq.forEach((viseme,i)=>result.push({viseme,s:start+i*step,e:start+(i+1)*step}));
    cursor=end;
  }
  result.push({viseme:'rest',s:cursor,e:Infinity});return result;
}
export const LipSync:React.FC<{words:TimedWord[];fps?:number;width?:number;rotate?:number}>=({words,fps:override,width=160,rotate=0})=>{
  const frame=useCurrentFrame(),config=useVideoConfig(),fps=override??config.fps;
  if(!(fps>0))throw new Error('LipSync fps must be positive');
  const time=frame/fps,timeline=mouthTimeline(words);
  let index=timeline.findIndex(seg=>time>=seg.s&&time<seg.e);
  if(index<0)index=0;
  const segment=timeline[index],previous=timeline[Math.max(0,index-1)];
  return <CartoonMouth width={width} rotate={rotate} viseme={segment.viseme}
    fromViseme={index===0?'rest':previous.viseme} transitionFrame={frame-segment.s*fps}/>;
};
