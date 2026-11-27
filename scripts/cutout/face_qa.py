import json,sys
from PIL import Image,ImageDraw
F=json.load(open(sys.argv[1])); keys=sys.argv[3:] or sorted(F)
tiles=[]
for k in keys:
    v=F[k]; im=Image.open(f'assets/x/{k}.png').convert('RGBA'); W,H=im.size
    bg=Image.new('RGBA',im.size,(70,70,70,255)); bg.alpha_composite(im)
    cx=(v['le'][0]+v['re'][0])/2*W; cy=(v['le'][1]+v['mouth'][1])/2*H
    d=max(abs(v['re'][0]-v['le'][0])*W*3.2, abs(v['mouth'][1]-v['le'][1])*H*3.2, 120)
    c=bg.crop((int(cx-d/2),int(cy-d/2),int(cx+d/2),int(cy+d/2))).resize((300,300)); s=300/d; ox,oy=cx-d/2,cy-d/2
    dr=ImageDraw.Draw(c)
    for p,col in ((v['le'],'lime'),(v['re'],'cyan'),(v['mouth'],'red')):
        x=(p[0]*W-ox)*s; y=(p[1]*H-oy)*s; dr.ellipse((x-6,y-6,x+6,y+6),outline=col,width=3)
    dr.text((4,4),k,fill='yellow'); tiles.append(c)
cols=6; rows=(len(tiles)+cols-1)//cols; sheet=Image.new('RGB',(300*cols,300*rows))
for i,t in enumerate(tiles): sheet.paste(t,((i%cols)*300,(i//cols)*300))
sheet.save(sys.argv[2])
