import mediapipe as mp, numpy as np, json, sys
from PIL import Image
from mediapipe.tasks.python import vision, BaseOptions
opt=vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=''+__import__("os").environ.get("FACE_MODEL","models/face_landmarker.task")+''),num_faces=1,min_face_detection_confidence=0.2,min_face_presence_confidence=0.2)
det=vision.FaceLandmarker.create_from_options(opt)
L_EYE=[33,133,159,145];R_EYE=[362,263,386,374];MOUTH=[61,291,13,14]
out={}
for f in sys.argv[1:]:
    im=Image.open(f'assets/x/{f}.png').convert('RGBA'); W,H=im.size
    bg=Image.new('RGBA',im.size,(128,128,128,255)); bg.alpha_composite(im)
    s=1600/max(W,H); sm=bg.convert('RGB').resize((int(W*s),int(H*s)))
    r=det.detect(mp.Image(image_format=mp.ImageFormat.SRGB,data=np.array(sm)))
    if not r.face_landmarks: print(f,'NONE'); continue
    lm=r.face_landmarks[0]; P=lambda ids:[float(np.mean([lm[i].x for i in ids])),float(np.mean([lm[i].y for i in ids]))]
    le,re,mo=P(L_EYE),P(R_EYE),P(MOUTH)
    ew=abs(lm[33].x-lm[133].x); mw=abs(lm[61].x-lm[291].x)
    import math; ang=math.degrees(math.atan2((re[1]-le[1])*H,(re[0]-le[0])*W))
    out[f]=dict(le=le,re=re,mouth=mo,eyeW=ew,mouthW=mw,angle=ang,aspect=W/H)
    print(f,'le',[round(v,3) for v in le],'re',[round(v,3) for v in re],'m',[round(v,3) for v in mo],'ang',round(ang,1))
json.dump(out,open('faces.json','w'),indent=1)
