# Ganpati Bappa Morya Reel

Beat-synced 44-second vertical Ganpati reel made in Remotion.

- 1080 × 1920, 30 fps
- hard cuts placed on detected music accents
- selected 60 fps character footage plays at 0.5× speed
- the 31.27-second music track loops once at frame 938
- only the requested Marathi title, `गणपती बाप्पा मोरया`, appears on screen
- camera moves begin only once the idol is visible and centered
- the final musical phrase completes before the short closing fade

Place the supplied media in `public/assets/`, then run:

```bash
npm install
npm run studio
npm run render
```

The render is written to `out/Ganpati_Bappa_Morya_Reel.mp4`.

The bundled loopback preload lets Remotion render in restricted containers where Node cannot enumerate network interfaces.
