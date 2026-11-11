#!/usr/bin/env python3
"""Check rendered speech against the original, using the authored 1x cut map."""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.signal import correlate, correlation_lags

RATE = 16000
FPS = 30


def decode(path):
    result = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(path), '-vn', '-ac', '1',
         '-ar', str(RATE), '-f', 'f32le', '-'],
        check=True, stdout=subprocess.PIPE,
    )
    return np.frombuffer(result.stdout, dtype='<f4').astype(np.float64)


source_path, final_path, composition_path = map(Path, sys.argv[1:4])
markup = composition_path.read_text()
cuts = re.findall(
    r'<Sequence name="Ira cut (\d+)" from=\{(\d+)\} '
    r'durationInFrames=\{(\d+)\}><NarrationSlice trimBefore=\{(\d+)\}',
    markup,
)
assert len(cuts) == 27, 'Unexpected narration cut count'
assert 'playbackRate' not in markup, 'Unexpected playback-rate override'
source = decode(source_path)
final = decode(final_path)
allow_partial = '--allow-partial' in sys.argv[4:]
measurements = []
for number, out, duration, trim in cuts:
    out, duration, trim = int(out), int(duration), int(trim)
    if (out + duration) / FPS > final.size / RATE:
        if allow_partial:
            break
        raise ValueError(f'Export ends before narration cut {number}')
    # Use spoken material away from AAC/cut boundary padding.
    inset = min(0.15, duration / FPS / 8)
    count = round((duration / FPS - inset * 2) * RATE)
    source_start = round((trim / FPS + inset) * RATE)
    output_start = round((out / FPS + inset) * RATE)
    reference = source[source_start:source_start + count]
    candidate = final[output_start:output_start + count]
    reference = reference - reference.mean()
    candidate = candidate - candidate.mean()
    corr = correlate(candidate, reference, method='fft')
    lags = correlation_lags(candidate.size, reference.size)
    allowed = np.abs(lags) < RATE // 8
    shift = int(lags[allowed][np.argmax(corr[allowed])])
    if shift >= 0:
        x, y = reference[:count - shift], candidate[shift:]
    else:
        x, y = reference[-shift:], candidate[:count + shift]
    similarity = float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y)))
    measurements.append({'cut': int(number), 'correlation': round(similarity, 5),
                         'offset_ms': round(shift * 1000 / RATE, 2)})

minimum = min(row['correlation'] for row in measurements)
report = {'source_seconds': source.size / RATE,
          'export_audio_seconds': final.size / RATE,
          'minimum_speech_correlation': minimum,
          'checked_cuts': len(measurements),
          'cuts': measurements,
          'passed': minimum > 0.92}
print(json.dumps(report, indent=2))
sys.exit(0 if report['passed'] else 1)
