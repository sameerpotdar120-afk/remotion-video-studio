# Kalpasar: Omni prompts for Null

Null appears once, at the end, for about 5 seconds in the bottom half of a split screen (the map stays in the top half):

> ये बनेगा, या बस कल्पना ही रह जाएगा? … आपको क्या लगता है? हाँ या ना?

Make one 10-second clip. I'll cut the best 5 seconds from it and play our VO over it (the Omni audio is muted, and the watermark is cropped out).

## How to generate
- Tool: Google Omni (Gemini Omni Flash), vertical 9:16, 10 seconds.
- Starting frame: attach `public/null/studio_master_9x16.jpg` every time.
- Make 2–3 takes. If one is blocked or the hands go wrong, use the backup prompt.
- Name the files `null_kalpasar_A1.mp4`, `null_kalpasar_A2.mp4`, and so on, and send them with the VO.

## Clip A: "बनेगा, या कल्पना? … हाँ या ना?" (main)
```
Animate this stylised 3D character as a friendly podcast host in his studio. Keep the image, character design, studio, microphone, lighting and framing exactly as they are, with a static camera.

He is weighing two options and then asking his audience:
0–3 s: he lifts his right hand, palm up, beside the microphone, as if holding one option, then lifts his left hand, palm up, on the other side, as if holding the other option, moving them gently up and down like a balance scale.
3–6 s: he brings his hands together, then points his right index finger straight at the camera, as if asking "you".
6–10 s: he opens both palms toward the camera in a calm, curious "what do you think?" gesture, holds it, and rests his hands on the desk.

Smooth, slow, confident movements, with his hands beside the microphone. His face design stays the same throughout. No dialogue, no text.
```

## Clip B: backup (shorter, if A is blocked)
```
Animate this 3D animated podcast host. Static camera, same studio. He holds out one palm, then the other, like weighing two choices, then points one finger at the camera, then opens both palms in a curious "what do you think?" gesture and rests his hands on the desk. Smooth and slow, hands beside the microphone.
```

## What I check when it comes back
- The face design stays steady (shape, gold line, eye glow).
- The gloves keep five fingers, and the mic doesn't move.
- The Gemini sparkle sits in the bottom right as before; the split-screen band crops it out.
