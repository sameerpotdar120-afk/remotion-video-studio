import React,{useId} from 'react';
import {random,spring,useCurrentFrame,useVideoConfig} from 'remotion';
export type Mood='neutral'|'panic'|'smug'|'happy'|'angry'|'dead'|'confused'|'sideEye'|'sad'|'scheming'|'shock'|'glow';
export type GooglyEyesProps={size?:number;gap?:number;rotate?:number;lookX?:number;lookY?:number;pupil?:number;lid?:number;browAngle?:number;browUp?:number;mood?:Mood;shake?:number;seed?:number;motionFrame?:number};
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
export function blinkAt(frame:number,fps:number,seed:number):number{
 let next=0;for(let i=0;i<10000;i++){
  next+=Math.max(4,Math.round((2+random(`blink:${seed}:${i}`)*2)*fps));
  if(frame<next)return 0;if(frame<next+3)return [.5,1,.5][frame-next];
 }return 0;
}
export const GooglyEyes:React.FC<GooglyEyesProps>=({size=75,gap=10.5,rotate=0,lookX=0,lookY=0,pupil=1,lid=0,browAngle=0,browUp=0,mood='neutral',shake=0,seed=1,motionFrame})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),uid=useId().replace(/[^a-zA-Z0-9]/g,'');
 const pad=size*.38,width=2*size+gap+2*pad,height=size+2*pad;
 const gaze=spring({frame:Math.max(0,motionFrame??frame),fps,config:{damping:10,stiffness:170,mass:.65}});
 const blink=blinkAt(frame,fps,seed),isGlow=mood==='glow';
 const moodLid=mood==='dead'?.6:mood==='smug'?.45:mood==='scheming'?.4:mood==='sad'?.28:mood==='sideEye'?.18:0;
 const close=clamp(Math.max(blink,lid,moodLid),0,1);
 const pupilScale=clamp(mood==='panic'?.3:mood==='shock'||mood==='dead'||isGlow?.22:pupil,.2,1);
 const jitter=clamp(shake,0,1)*size*.035;
 const jx=(random(`x:${seed}:${frame}`)*2-1)*jitter,jy=(random(`y:${seed}:${frame}`)*2-1)*jitter;
 const brow=browAngle||(mood==='angry'?24:mood==='sad'||mood==='panic'?-18:mood==='confused'?-12:mood==='scheming'?8:0);
 return <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow:'visible'}} aria-label={`${mood} googly eyes`}>
  <defs><filter id={`${uid}shadow`} x="-50%" y="-60%" width="200%" height="220%"><feDropShadow dx="0" dy={size*.035} stdDeviation={size*.03} floodOpacity=".3"/></filter>
   <filter id={`${uid}glow`} x="-70%" y="-90%" width="240%" height="280%"><feGaussianBlur stdDeviation={size*.1}/></filter></defs>
  <g transform={`translate(${jx} ${jy}) rotate(${rotate} ${width/2} ${height/2})`} filter={isGlow?undefined:`url(#${uid}shadow)`}>
   {[0,1].map(i=>{
    const scale=(mood==='confused'&&i===0?1.2:1)*(mood==='shock'?1.12:1);
    const cx=pad+size/2+i*(size+gap),cy=height/2,rx=size*.47*scale,ry=size*.51*scale;
    const pr=size*.22*pupilScale,opening=Math.max(size*.008,ry*(1-close));
    const px=cx+clamp((mood==='sideEye'&&lookX===0?.95:lookX)*gaze,-1.2,1.2)*(rx-pr)*.65;
    const py=cy+clamp((mood==='dead'&&lookY===0?.8:mood==='sad'&&lookY===0?.7:lookY)*gaze,-1.2,1.2)*(ry-pr)*.6;
    const flat=['scheming','sad','dead'].includes(mood)&&blink===0;
    const cut=cy-ry+2*ry*close,half=rx*Math.sqrt(Math.max(0,1-((cut-cy)/ry)**2));
    const flatPath=`M ${cx-half} ${cut} A ${rx} ${ry} 0 ${cut<=cy?1:0} 0 ${cx+half} ${cut} Z`;
    const shape=flat?<path d={flatPath}/>:<ellipse cx={cx} cy={cy} rx={rx} ry={opening}/>;
    return <g key={i}>
     <defs><clipPath id={`${uid}eye${i}`}>{shape}</clipPath></defs>
     {isGlow&&<ellipse cx={cx} cy={cy} rx={rx*.92} ry={opening*.9} fill="white" opacity=".8" filter={`url(#${uid}glow)`}/>}
     {close>=.99?<path d={`M ${cx-rx} ${cy} Q ${cx} ${cy+size*.025} ${cx+rx} ${cy}`} fill="none" stroke={isGlow?'white':'black'} strokeWidth={size*.035} strokeLinecap="round"/>:
      mood==='happy'&&blink===0?<path d={`M ${cx-rx*.8} ${cy+ry*.2} Q ${cx} ${cy-ry*.85} ${cx+rx*.8} ${cy+ry*.2}`} fill="none" stroke="black" strokeWidth={size*.045} strokeLinecap="round"/>:<>
       <g fill="white" stroke={isGlow?'none':'black'} strokeWidth={size*.035} strokeLinejoin="round">{shape}</g>
       <g clipPath={`url(#${uid}eye${i})`}><circle cx={px} cy={py} r={pr} fill="#050505"/>
        <circle cx={px-pr*.32} cy={py-pr*.35} r={pr*.25} fill="white"/><circle cx={px+pr*.35} cy={py+pr*.3} r={pr*.11} fill="white"/>
       </g>
      </>}
     {!isGlow&&<path d={`M ${cx-rx*.8} ${cy-ry-size*.12-browUp-(mood==='shock'?size*.16:0)} Q ${cx} ${cy-ry-size*.2-browUp-(mood==='shock'?size*.16:0)} ${cx+rx*.8} ${cy-ry-size*.12-browUp-(mood==='shock'?size*.16:0)}`} transform={`rotate(${i===0?brow:-brow} ${cx} ${cy-ry-size*.15-browUp})`} stroke="black" strokeWidth={size*.038} strokeLinecap="round" fill="none"/>}
    </g>;
   })}
  </g>
 </svg>;
};
