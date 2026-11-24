import React, {useId} from 'react';
import {random, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type Mood = 'neutral'|'panic'|'smug'|'happy'|'angry'|'dead'|'confused';
export type GooglyEyesProps = {
  size?: number; gap?: number; rotate?: number; lookX?: number; lookY?: number;
  pupil?: number; lid?: number; browAngle?: number; browUp?: number;
  mood?: Mood; shake?: number; seed?: number;
  /** Local frame of a new gaze movement; omit when mounting in a Sequence. */
  motionFrame?: number;
};
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export function blinkAt(frame: number, fps: number, seed: number): number {
  let next = 0;
  for (let i=0; i<10000; i++) {
    next += Math.max(4, Math.round((2+random(`blink:${seed}:${i}`)*2)*fps));
    if (frame < next) return 0;
    if (frame < next+3) return [.5,1,.5][frame-next];
  }
  return 0;
}
export const GooglyEyes: React.FC<GooglyEyesProps> = ({
  size=100, gap=14, rotate=0, lookX=0, lookY=0, pupil=1, lid=0,
  browAngle=0, browUp=0, mood='neutral', shake=0, seed=1, motionFrame,
}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  const pad=size*.38, width=2*size+gap+2*pad, height=size+2*pad;
  const gaze=spring({frame:Math.max(0,motionFrame??frame),fps,
    config:{damping:10,stiffness:170,mass:.65}});
  const blink=blinkAt(frame,fps,seed);
  const effectiveLid=Math.max(blink,lid,mood==='dead'?.6:mood==='smug'?.45:0);
  const pScale=clamp(mood==='panic'?.3:mood==='dead'?.22:pupil,.2,1);
  const jitter=clamp(shake,0,1)*size*.035;
  const jx=(random(`x:${seed}:${frame}`)*2-1)*jitter;
  const jy=(random(`y:${seed}:${frame}`)*2-1)*jitter;
  const baseBrow=browAngle || (mood==='angry'?24:mood==='panic'?-18:mood==='confused'?-12:0);
  return <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}
    viewBox={`0 0 ${width} ${height}`} style={{overflow:'visible'}} aria-label={`${mood} googly eyes`}>
    <defs><filter id={`${uid}shadow`} x="-40%" y="-50%" width="180%" height="200%">
      <feDropShadow dx="0" dy={size*.045} stdDeviation={size*.035} floodOpacity=".3"/>
    </filter></defs>
    <g transform={`translate(${jx} ${jy}) rotate(${rotate} ${width/2} ${height/2})`}
      filter={`url(#${uid}shadow)`}>
      {[0,1].map(i=>{
        const scale=mood==='confused'&&i===0?1.2:1;
        const cx=pad+size/2+i*(size+gap),cy=height/2;
        const rx=size*.48*scale, ry=size*.48*scale;
        const opening=Math.max(size*.008,ry*(1-clamp(effectiveLid,0,1)));
        const pr=size*.22*pScale;
        const px=cx+clamp(lookX*gaze,-1.2,1.2)*(rx-pr)*.65;
        const py=cy+clamp(lookY*gaze,-1.2,1.2)*(ry-pr)*.6;
        return <g key={i}>
          <defs><clipPath id={`${uid}eye${i}`}><ellipse cx={cx} cy={cy} rx={rx} ry={opening}/></clipPath></defs>
          {effectiveLid>=.99 ? <path d={`M ${cx-rx} ${cy} Q ${cx} ${cy+size*.025} ${cx+rx} ${cy}`}
            fill="none" stroke="black" strokeWidth={size*.06} strokeLinecap="round"/> :
            mood==='happy'&&blink===0 ? <path d={`M ${cx-rx*.8} ${cy+ry*.2} Q ${cx} ${cy-ry*.85} ${cx+rx*.8} ${cy+ry*.2}`}
              fill="none" stroke="black" strokeWidth={size*.075} strokeLinecap="round"/> : <>
              <ellipse cx={cx} cy={cy} rx={rx} ry={opening} fill="white" stroke="black" strokeWidth={size*.06}/>
              <g clipPath={`url(#${uid}eye${i})`}><circle cx={px} cy={py} r={pr} fill="#050505"/>
                <circle cx={px-pr*.32} cy={py-pr*.35} r={pr*.25} fill="white"/>
                <circle cx={px+pr*.35} cy={py+pr*.3} r={pr*.11} fill="white"/>
              </g>
            </>}
          <path d={`M ${cx-rx*.8} ${cy-ry-size*.12-browUp} Q ${cx} ${cy-ry-size*.2-browUp} ${cx+rx*.8} ${cy-ry-size*.12-browUp}`}
            transform={`rotate(${i===0?baseBrow:-baseBrow} ${cx} ${cy-ry-size*.15-browUp})`}
            stroke="black" strokeWidth={size*.065} strokeLinecap="round" fill="none"/>
        </g>;
      })}
    </g>
  </svg>;
};
