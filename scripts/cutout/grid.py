import sys
from PIL import Image,ImageDraw
keys=sys.argv[2:]; T=440; tiles=[]
for k in keys:
    im=Image.open(f'assets/x/{k}.png').convert('RGBA'); W,H=im.size
    bg=Image.new('RGBA',im.size,(60,90,60,255)); bg.alpha_composite(im)
    # crop to top part of alpha bbox (head region)
    x0,y0,x1,y1=im.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox()
    c=bg.resize((T,int(T*H/W))) if W>=H else bg.resize((int(T*W/H),T))
    c=c.convert('RGB'); w,h=c.size; d=ImageDraw.Draw(c)
    for i in range(1,20):
        x=w*i/20; y=h*i/20; col=(255,255,0) if i%2==0 else (120,120,0)
        d.line((x,0,x,h),fill=col,width=1); d.line((0,y,w,y),fill=col,width=1)
        if i%2==0: d.text((x+1,1),str(i*5),fill='white'); d.text((1,y+1),str(i*5),fill='white')
    d.text((4,h-14),k,fill='red'); tiles.append(c)
cols=3; rows=(len(tiles)+cols-1)//cols; S=Image.new('RGB',(T*cols,T*rows),(0,0,0))
for i,t in enumerate(tiles): S.paste(t,((i%cols)*T,(i//cols)*T))
S.save(sys.argv[1])
