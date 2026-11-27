import mediapipe as mp, numpy as np, json, sys, math
from PIL import Image
from mediapipe.tasks.python import vision, BaseOptions
det=vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=''+__import__("os").environ.get("FACE_MODEL","models/face_landmarker.task")+''),num_faces=1,min_face_detection_confidence=0.15,min_face_presence_confidence=0.15))
L_EYE=[33,133,159,145];R_EYE=[362,263,386,374];MOUTH=[61,291,13,14]
out=json.load(open('faces.json'))
for f in sys.argv[1:]:
    im=Image.open(f'assets/x/{f}.png').convert('RGBA'); W,H=im.size
    bg=Image.new('RGBA',im.size,(128,128,128,255)); bg.alpha_composite(im); bg=bg.convert('RGB')
    x0,y0,x1,y1=im.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox()
    bw,bh=x1-x0,y1-y0; found=None
    cands=[]
    for frac in (0.22,0.3,0.4):
        side=int(bh*frac)
        for cy in np.linspace(y0, y0+bh*0.5, 6):
            for cx in np.linspace(x0, x1-side, max(2,int(bw/side*2))):
                cands.append((int(cx),int(cy),side))
    for cx,cy,side in cands:
        box=(cx,cy,min(W,cx+side),min(H,cy+side)); c=bg.crop(box).resize((640,640))
        r=det.detect(mp.Image(image_format=mp.ImageFormat.SRGB,data=np.array(c)))
        if r.face_landmarks:
            lm=r.face_landmarks[0]; sx=(box[2]-box[0])/W; sy=(box[3]-box[1])/H
            P=lambda ids:[box[0]/W+float(np.mean([lm[i].x for i in ids]))*sx, box[1]/H+float(np.mean([lm[i].y for i in ids]))*sy]
            le,re,mo=P(L_EYE),P(R_EYE),P(MOUTH)
            ang=math.degrees(math.atan2((re[1]-le[1])*H,(re[0]-le[0])*W))
            found=dict(le=le,re=re,mouth=mo,eyeW=abs(lm[33].x-lm[133].x)*sx,mouthW=abs(lm[61].x-lm[291].x)*sx,angle=ang,aspect=W/H); break
    if found: out[f]=found; print(f,'le',[round(v,3) for v in found['le']],'re',[round(v,3) for v in found['re']],'m',[round(v,3) for v in found['mouth']],'ang',round(found['angle'],1))
    else: print(f,'NONE')
json.dump(out,open('faces.json','w'),indent=1)
