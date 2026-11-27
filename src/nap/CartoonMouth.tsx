import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';

export const VISEMES = ['rest','A','E','O','U','MBP','FV','L','smile','smirk','scream','frown','chew','huh'] as const;
export type Viseme = typeof VISEMES[number];
// width, left corner Y, right corner Y, upper control Y, lower control Y,
// teeth opacity, tongue opacity. Every outline uses the same two cubic segments.
const shapes: Record<Viseme, number[]> = {
  rest:[.65,0,0,-.018,.018,0,0], A:[.82,0,0,-.54,.54,1,1],
  E:[.95,0,0,-.21,.3,1,1], O:[.45,0,0,-.55,.55,0,1],
  U:[.33,0,0,-.34,.34,0,.5], MBP:[.72,0,0,-.01,.035,0,0],
  FV:[.72,-.02,.02,-.07,.2,1,.2], L:[.74,0,0,-.28,.35,1,1],
  smile:[.95,-.14,-.14,.14,.4,1,1], smirk:[.75,.04,-.21,.01,.2,.3,.2],
  scream:[.9,0,0,-.78,.78,1,1], frown:[.75,.12,.12,-.24,-.12,0,0],
  chew:[.68,0,0,-.1,.17,.5,.5], huh:[.38,-.01,.01,-.25,.3,0,.7],
};
export type CartoonMouthProps = {width?:number; rotate?:number; viseme?:Viseme;
  /** Deterministic two-frame transition; supplied automatically by LipSync. */
  fromViseme?:Viseme; transitionFrame?:number};
export const CartoonMouth: React.FC<CartoonMouthProps> = ({width=160,rotate=0,
  viseme='rest',fromViseme='rest',transitionFrame}) => {
  const frame=useCurrentFrame(),uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  const t=Math.max(0,Math.min(1,(transitionFrame??frame)/2));
  const smooth=t*t*(3-2*t);
  const p=shapes[fromViseme].map((a,i)=>a+(shapes[viseme][i]-a)*smooth);
  if(viseme==='chew') {const c=.6+.4*Math.sin(frame*Math.PI/3);p[3]*=c;p[4]*=c;}
  const [w,ly,ry,top,bottom,teeth,tongue]=p;
  const cx=width*.6,cy=width*.48,pad=width*.1;
  const d=`M ${cx-w*width/2} ${cy+ly*width} C ${cx-w*width*.32} ${cy+top*width} ${cx+w*width*.32} ${cy+top*width} ${cx+w*width/2} ${cy+ry*width} C ${cx+w*width*.32} ${cy+bottom*width} ${cx-w*width*.32} ${cy+bottom*width} ${cx-w*width/2} ${cy+ly*width} Z`;
  const tongueY=viseme==='L'?cy-width*.035:cy+width*.23;
  return <svg xmlns="http://www.w3.org/2000/svg" width={width+2*pad} height={width*1.04}
    viewBox={`0 0 ${width+2*pad} ${width*1.04}`} style={{overflow:'visible'}} aria-label={`${viseme} mouth`}>
    <defs><clipPath id={`${uid}clip`}><path d={d}/></clipPath>
      <filter id={`${uid}shadow`} x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy={width*.025} stdDeviation={width*.025} floodOpacity=".32"/></filter>
    </defs>
    <g transform={`rotate(${rotate} ${cx} ${cy})`} filter={`url(#${uid}shadow)`}>
      <path d={d} fill="#681225" stroke="black" strokeWidth={width*.045} strokeLinejoin="round"/>
      <g clipPath={`url(#${uid}clip)`}>
        <path d={`M ${cx-width*.52} ${cy-width*.54} H ${cx+width*.52} V ${cy-width*.04} Q ${cx} ${cy+width*.045} ${cx-width*.52} ${cy-width*.04} Z`}
          fill="white" opacity={teeth}/>
        <ellipse cx={cx+width*.06} cy={tongueY} rx={width*.26} ry={viseme==='L'?width*.25:width*.18}
          fill="#f681a2" opacity={tongue}/>
        <path d={`M ${cx+width*.06} ${tongueY-width*.12} V ${tongueY+width*.04}`} stroke="#c34268" strokeWidth={width*.014} opacity={tongue} strokeLinecap="round"/>
      </g>
      <path d={d} fill="none" stroke="black" strokeWidth={width*.045} strokeLinejoin="round"/>
    </g>
  </svg>;
};
