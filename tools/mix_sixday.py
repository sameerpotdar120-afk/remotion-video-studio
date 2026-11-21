"""Mix the Six-Day War long video and its six Shorts.

    python3 tools/mix_sixday.py     # writes public/sixday/audio/mix_long.wav and mix_s1.wav .. mix_s6.wav

- Voice: the creator's VO at 1.15x (vo_115.wav), placed on the long video's clock (a breath at every chapter break,
  see tools/sixday_timing.py).
- Music (Mixkit free licence), one track per part, equal-power crossfades in the chapter breaks, sidechain-ducked
  under the voice: "Silent Descent", "Unforgiven", "Epical Drums 06", "Vastness", "Epical Drums 02",
  "I Won't Surrender", "Drawing the Sky".
- SFX on every visual hit: Sonniss GDC / Mixkit effects already in the project, plus war sounds synthesised in code
  (tools/synth_sixday_sfx.py: explosions, artillery, tanks, gunfire, radio, ship horn, rumble).
- Each Short is cut from the same stems; its music tail is crossfaded into its head so the Short loops seamlessly.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "sixday" / "audio"
T = json.load(open(ROOT / "src" / "sixday" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DUR = T["duration"]
SH = {s["name"]: s for s in T["shorts"]}
MUSIC_PAUSE, MUSIC_TALK, SFX_DUCK, XF = -10.0, -18.5, 4.0, 2.0

# (start on the long clock, track, offset into the track, level dB)
PARTS = [
    (0.0, "music_silent_descent_mixkit.mp3", 0.0, 0.0),
    (SH["tiran"]["t0"] - 1.2, "music_unforgiven_mixkit.mp3", 0.0, 0.0),
    (SH["ghante"]["t0"] - 1.2, "music_epical_drums_06_mixkit.mp3", 0.0, 1.0),
    (SH["gaza"]["t0"] - 1.2, "music_vastness_mixkit.mp3", 0.0, -1.0),
    (C["ch5"] - 1.0, "music_epical_drums_02_mixkit.mp3", 0.0, 0.0),
    (SH["golan"]["t0"] - 1.2, "music_i_wont_surrender_mixkit.mp3", 0.0, 0.0),
    (SH["naqsha"]["t0"] - 0.8, "music_silent_descent_mixkit.mp3", 40.0, 0.0),
    (SH["fleet"]["t0"] - 1.2, "music_drawing_the_sky_mixkit.mp3", 0.0, -1.0),
    (C["ch8"] - 1.0, "music_vastness_mixkit.mp3", 60.0, 0.0),
]


def cues():
    c = C
    q = []
    A = lambda t, n, lv, **o: q.append((t, n, lv, o))  # noqa: E731
    # hook
    A(0.02, "impact_trailer_epic", -12); A(0.05, "braam_dark", -16); A(c["chhah0"], "heavy_knock", -17); A(c["june67"], "card_flip", -18)
    for k in ("israel0", "egypt0", "jordan0", "syria0"):
        A(c[k], "pop_hard", -19)
    A(c["teen0"], "boom_hit", -15); A(c["aaj0"] - 0.2, "whoosh_cinematic_fast", -17)
    # ch 1
    A(c["ch1"] - 1.4, "page_turn", -17); A(c["ch1"] - 1.2, "wh_big_subtle_tonal", -19); A(c["patli1"] - 0.3, "whoosh_cinematic_fast", -18)
    A(c["km15"] - 0.3, "typewriter_click", -18); A(c["tank1"], "syn_tank", -20, dur=3.2)
    A(c["egypt1"] - 0.3, "whoosh_cinematic_fast", -17); A(c["fauj1"], "pop_hard", -20); A(c["jordan1"] - 0.2, "whoosh_transition_fast", -19)
    A(c["syria1"] - 0.2, "whoosh_transition_fast", -19); A(c["n1948"], "card_flip", -18); A(c["n1956"], "card_flip", -18)
    A(c["golabari1"] - 0.2, "syn_artillery", -18); A(c["golabari1"] + 0.6, "syn_blast_far", -20); A(c["teeno1"] - 0.6, "syn_rumble", -22, dur=4)
    # ch 2
    A(c["ch2"] - 0.8, "wh_big_subtle_tonal", -19); A(c["report1"], "syn_radio", -18); A(c["report1"] + 0.3, "radar_ping", -21)
    A(c["galat"], "heavy_knock", -15); A(c["may14"], "card_flip", -18); A(c["sinai2"] - 0.5, "syn_tank", -19, dur=3.5)
    A(c["parade"] - 0.4, "crowd_cheer", -24, dur=3); A(c["parade"], "syn_tank", -20, dur=3); A(c["unef1"], "pop_hard", -20)
    A(c["may18"], "card_flip", -18); A(c["may18"] + 0.3, "wh_big_subtle_tonal", -21); A(c["hatana1"] + 0.3, "whoosh_transition_fast", -21)
    A(c["redsea1"] - 0.3, "whoosh_cinematic_fast", -17); A(c["chowki"], "wind_howl", -25, dur=2.2); A(c["gali0"], "swell_tonal", -21)
    # Short 1: Tiran
    A(c["s1"] - 0.1, "syn_horn", -18); A(c["s1"] - 0.1, "waves_soft", -24, dur=5); A(c["straits"], "pop_hard", -19)
    A(c["eilat"] - 0.3, "whoosh_cinematic_fast", -18); A(c["eilat"] + 0.4, "harbour", -25, dur=3); A(c["rasta"], "swell_tonal", -21)
    A(c["tanker"], "syn_horn", -21); A(c["n1957b"], "card_flip", -18); A(c["elaan1"], "heavy_knock", -14); A(c["elaan1"] + 0.05, "subdrop", -18)
    A(c["may22"], "card_flip", -18); A(c["nasser"] - 0.1, "whoosh_transition_fast", -20); A(c["nahi_guzrenge"], "metal_thud", -14); A(c["nahi_guzrenge"] + 0.05, "heavy_knock", -15)
    A(c["ulti"] - 0.2, "clock", -21, dur=9); A(c["ulti"], "riser_trailer", -20, dur=9.5); A(c["may30"], "card_flip", -18); A(c["pact"] - 0.6, "syn_radio", -20)
    A(c["june4"], "card_flip", -18); A(c["june5a"], "card_flip", -17)
    for i, d in enumerate((-2.6, -2.0, -1.5, -1.1, -0.6, -0.2)):
        A(c["jal"] + d, "syn_blast_far" if i % 2 else "syn_blast_near", -15 if i == 5 else -18)
    A(c["jal"] - 0.4, "impact_trailer_epic", -13); A(c["jal"], "syn_rumble", -20, dur=5)
    # ch 3
    A(c["ch3"] - 0.8, "wh_big_subtle_tonal", -19); A(c["reservists"] - 0.3, "page_turn", -18); A(c["aam"] + 0.4, "syn_tank", -24, dur=3)
    A(c["dayan"] - 0.1, "whoosh_transition_fast", -20); A(c["intezaar"], "heavy_knock", -19); A(c["vaar"], "heavy_knock", -16)
    A(c["raat"], "wind_howl", -22, dur=4); A(c["raat"], "card_flip", -19); A(c["bridge2"], "riser_trailer", -21, dur=5)
    # Short 2: 3 hours
    A(c["s2"] - 0.6, "syn_blast_near", -17); A(c["s2"] - 0.1, "jet_pass", -14); A(c["s2"], "fire_crackle", -22, dur=4)
    A(c["teen2"], "boom_hit", -16); A(c["t745"] - 0.1, "clock", -19, dur=19); A(c["t745"], "card_flip", -18)
    A(c["tabhi"] - 0.3, "jet_pass", -14); A(c["tabhi"] + 0.8, "jet_pass", -17); A(c["neeche"] + 0.2, "jet_pass", -12); A(c["radar"] - 0.3, "sonar", -21)
    A(c["runway"] - 0.6, "radar_ping", -19)
    for i in range(7):
        A(c["runway"] + 0.5 + i * 0.42, "syn_blast_near" if i % 2 == 0 else "syn_blast_far", -15 if i == 0 else -18)
    for i in range(8):
        A(c["khade2"] + 0.3 + i * 0.35, "syn_blast_far" if i % 2 else "syn_blast_near", -19)
    A(c["n200"] - 0.4, "typewriter_click", -18, dur=2); A(c["n200"] + 1.6, "boom_hit", -16); A(c["lehar2"] - 0.3, "jet_pass", -16)
    A(c["dopahar"] - 0.3, "page_turn", -18); A(c["dopahar"], "fire_crackle", -22, dur=3.5); A(c["jordsyr"] - 0.3, "whoosh_cinematic_fast", -17)
    for i in range(6):
        A(c["jordsyr"] + 0.5 + i * 0.35, "syn_blast_far", -19)
    A(c["focus"], "heavy_knock", -14); A(c["focus"] + 0.05, "stinger", -18); A(c["chhatri"], "subdrop", -20)
    # Short 3: Gaza (quiet, respectful)
    A(c["s3"] - 0.1, "swell_tonal", -19); A(c["s3"] - 0.05, "gong", -24); A(c["battalions"], "pop_hard", -21); A(c["neeli"], "swell_tonal", -22)
    A(c["hatana3"], "whoosh_transition_fast", -22); A(c["jahaaz3"], "syn_horn", -24); A(c["chhid"], "syn_artillery", -16); A(c["chhid"] + 0.6, "syn_gunfire", -20)
    A(c["phans"] + 0.2, "syn_blast_near", -17); A(c["phans"] + 0.9, "syn_blast_far", -19); A(c["n14b"] - 0.1, "subdrop", -18); A(c["brazil"], "pop_hard", -22)
    A(c["sachar"] - 0.2, "swell_tonal", -20)
    # ch 5: Sinai
    A(c["ch5"] - 0.6, "wh_big_subtle_tonal", -19); A(c["teendiv"] - 0.3, "page_turn", -18); A(c["teendiv"], "syn_tank", -17, dur=4)
    A(c["uttar"], "whoosh_transition_fast", -20); A(c["beech"] + 0.3, "syn_tank", -20, dur=3)
    for i, d in enumerate((-1.2, -0.5, 0.2)):
        A(c["toda"] + d, "syn_blast_near" if i == 0 else "syn_blast_far", -17)
    A(c["toda"] - 1.2, "syn_gunfire", -20); A(c["june6"], "card_flip", -18); A(c["june6"] + 0.2, "syn_radio", -19)
    A(c["khali"], "heavy_knock", -14); A(c["phansi"] - 0.2, "page_turn", -18); A(c["pehle_pahunch"] - 0.5, "syn_blast_near", -16)
    A(c["pehle_pahunch"] + 0.2, "syn_artillery", -18); A(c["june8"], "card_flip", -18); A(c["teenguna"], "boom_hit", -16)
    # ch 6
    A(c["ch6"] - 0.6, "wh_big_subtle_tonal", -19); A(c["topen"] + 0.1, "syn_artillery", -17); A(c["telaviv"] + 0.2, "syn_blast_far", -19)
    A(c["koonch"], "syn_tank", -20, dur=3); A(c["banta"] - 0.3, "whoosh_cinematic_fast", -18); A(c["deewar"], "swell_tonal", -21)
    A(c["sadak"] - 0.3, "page_turn", -18); A(c["sadak"], "syn_gunfire", -19); A(c["june7"] + 0.3, "card_flip", -18)
    A(c["para"] - 0.4, "syn_blast_near", -17); A(c["para"] + 0.3, "syn_blast_far", -19); A(c["nadi"], "whoosh_transition_fast", -20)
    A(c["bridge4"], "whoosh_cinematic_fast", -17)
    # Short 4: Golan
    A(c["s4"] - 0.1, "braam_dark", -17); A(c["s4"], "wind_howl", -24, dur=3); A(c["upar"], "syn_artillery", -18); A(c["sagar"], "waves_soft", -25, dur=3)
    A(c["golabari4"] - 0.2, "syn_blast_near", -17); A(c["golabari4"] + 0.4, "syn_blast_far", -19); A(c["june9"], "card_flip", -18)
    A(c["chadhai"] - 0.1, "page_turn", -18); A(c["chadhai"] + 0.5, "syn_tank", -19, dur=3); A(c["chadhai"] + 3.0, "syn_blast_near", -16)
    A(c["bunker"] + 0.2, "syn_blast_near", -16); A(c["bunker"] + 0.9, "syn_blast_far", -18); A(c["june10"], "card_flip", -18)
    A(c["ceasefire"], "gong", -18); A(c["ceasefire"] + 0.05, "heavy_knock", -18); A(c["unchai"], "swell_tonal", -20)
    # Short 5
    A(c["s5"] - 0.1, "impact_trailer_epic", -15); A(c["subah5"] - 0.2, "vhs" if False else "whoosh_cinematic_fast", -17); A(c["km15b"] - 0.3, "typewriter_click", -18)
    A(c["shaam"], "card_flip", -18)
    for k in ("sinaigaza", "wbj", "golan5"):
        A(c[k], "boom_hit", -17)
    A(c["kabza"], "stinger", -18); A(c["keemat"], "subdrop", -18); A(c["il_loss"], "pop_hard", -19); A(c["arab_loss"], "pop_hard", -19)
    A(c["n1982a"], "card_flip", -18); A(c["sinaiback"], "whoosh_transition_fast", -20); A(c["n2005"], "card_flip", -18); A(c["khula"], "swell_tonal", -19)
    # Short 6: the Yellow Fleet
    A(c["s6"] - 0.1, "syn_horn", -17); A(c["s6"], "waves_soft", -23, dur=6); A(c["beechraaste"], "harbour", -24, dur=3)
    A(c["band"] + 0.3, "syn_blast_near", -15); A(c["band"] + 1.0, "syn_blast_far", -17); A(c["duba"], "subdrop", -19)
    A(c["n15b"], "pop_hard", -18); A(c["mahine"], "clock", -21, dur=5); A(c["club"] - 0.3, "page_turn", -18); A(c["olympics"], "crowd_cheer", -24, dur=2.5)
    A(c["reth"], "wind_howl", -23, dur=3); A(c["yellow"], "swell_tonal", -19); A(c["bharat6"] - 0.2, "page_turn", -18); A(c["africa"], "whoosh_transition_fast", -20)
    A(c["khuli"], "card_flip", -18); A(c["do6"], "syn_horn", -18); A(c["ghar6"] + 0.2, "syn_horn", -21)
    # ch 8
    A(c["ch8"] - 0.6, "wh_big_subtle_tonal", -19); A(c["nov22"], "card_flip", -18); A(c["res242"] - 0.2, "page_turn", -18); A(c["lfp"], "heavy_knock", -15)
    A(c["khartoum"], "syn_radio", -20)
    for k in ("na1", "na2", "na3"):
        A(c[k], "heavy_knock", -15)
    A(c["n1973"], "card_flip", -18); A(c["n1973"] + 0.3, "syn_tank", -20, dur=2.5); A(c["n1979"], "swell_tonal", -20); A(c["n1982b"], "card_flip", -18)
    # close
    A(c["close"] - 0.4, "whoosh_cinematic_fast", -18); A(c["teenghante"], "jet_pass", -21); A(c["nayanaqsha"], "boom_hit", -18)
    A(c["gaza9"], "swell_tonal", -19); A(c["chhahdin9"], "heavy_knock", -16); A(DUR - 1.4, "wh_big_tonal", -19)
    return q


def place(buf: np.ndarray, a: np.ndarray, start: float) -> None:
    s = int(round(start * SR))
    if s < 0:
        a, s = a[-s:], 0
    k = min(len(a), len(buf) - s)
    if k > 0:
        buf[s: s + k] += a[:k]


def main() -> None:
    n = int(round(DUR * SR))
    # ---- voice on the long clock
    vo = ff(AUD / "vo_115.wav", VOICE_CHAIN)
    voice = np.zeros((n, 2), np.float32)
    sh = T["shifts"] + [[T["vo_len"] + 10, None]]
    for (src, add), (nxt, _) in zip(sh, sh[1:]):
        a, b = int(src * SR), min(int(nxt * SR), len(vo))
        place(voice, vo[a:b], src + add)
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))
    from scipy import ndimage
    hop = SR // 100
    sp = ndimage.binary_closing(talking[::hop], structure=np.ones(15))
    speech = np.repeat(sp, hop)[:n]
    speech = np.pad(speech, (0, n - len(speech)), constant_values=False)
    activity = envelope(speech.astype(np.float32), 0.025, 0.14)[:, None]

    # ---- music parts with crossfades
    music = np.zeros((n, 2), np.float32)
    bounds = [p[0] for p in PARTS] + [DUR]
    for i, (t0, name, off, lv) in enumerate(PARTS):
        t1 = bounds[i + 1]
        m = ff(AUD / name, "anull")[int(off * SR):]
        need = int((t1 - t0 + XF) * SR)
        while len(m) < need:  # extend by looping the track with an equal-power crossfade
            x = int(XF * SR); w = np.linspace(0, 1, x, dtype=np.float32)[:, None]
            m0 = ff(AUD / name, "anull")
            m = np.concatenate([m[:-x], m[-x:] * np.cos(w * np.pi / 2) + m0[:x] * np.sin(w * np.pi / 2), m0[x:]])
        m = m[:need].copy()
        m *= db(lv + v_ref - 10 * np.log10(np.mean(m ** 2) + 1e-12))
        x = int(XF * SR); w = np.linspace(0, 1, x, dtype=np.float32)[:, None]
        if i:
            m[:x] *= np.sin(w * np.pi / 2)
        m[-x:] *= np.cos(w * np.pi / 2)
        place(music, m, t0)
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    t_ax = np.arange(n) / SR
    mourn = np.clip(1 - np.abs(t_ax - (C["sachar"] + 2.5)) / 4.5, 0, 1)  # music leans back for Captain Sachar
    music *= db(-5.0 * mourn)[:, None]

    # ---- sfx
    sfx = np.zeros((n, 2), np.float32)
    cache: dict = {}
    for t, name, level, opt in cues():
        if name not in cache:
            p = AUD / "sfx" / (f"{name}.wav" if (AUD / "sfx" / f"{name}.wav").exists() else f"{name}.mp3")
            cache[name] = ff(p, "highpass=f=30" if name.startswith("syn_") or name in ("boom_hit", "subdrop", "impact_trailer_epic", "braam_dark") else "highpass=f=70")
        a = cache[name]
        if opt.get("dur"):
            a = fade(a[: int(opt["dur"] * SR)].copy(), 0.08, 0.4)
        r = win_rms_db(a)
        a = a * db(v_ref + level - r.max())
        place(sfx, a, t - r.argmax() / SR if name.startswith(("syn_blast", "boom", "heavy", "metal", "pop", "impact", "card", "gong", "stinger", "subdrop")) else t)
    sfx *= db(-SFX_DUCK * activity)

    def master(mix: np.ndarray, out: Path) -> None:
        tmp = out.with_suffix(".raw.wav")
        write_wav(tmp, mix / max(1.0, float(np.abs(mix).max()) / 0.98))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af",
                        "acompressor=threshold=-14dB:ratio=2:attack=10:release=150,loudnorm=I=-14:TP=-1.0:LRA=9",
                        "-ar", str(SR), str(out)], check=True)
        tmp.unlink()

    master(voice + music + sfx, AUD / "mix_long.wav")
    # ---- the Shorts: the same stems, the bed's tail crossfaded into its head so the loop has no seam
    for i, s in enumerate(T["shorts"]):
        a, b = int(s["t0"] * SR), int(s["t1"] * SR)
        x = int(1.2 * SR); w = np.linspace(0, 1, x, dtype=np.float32)[:, None]
        mu = music[a:b].copy()
        tail = music[b:b + x] if b + x <= n else np.zeros((x, 2), np.float32)
        mu[:x] = mu[:x] * np.sin(w * np.pi / 2) + tail * np.cos(w * np.pi / 2)
        mix = voice[a:b] + mu + sfx[a:b]
        f = int(0.03 * SR); mix[-f:] *= np.linspace(1, 0.6, f)[:, None]
        master(mix, AUD / f"mix_s{i + 1}.wav")
    rms = lambda y: 10 * np.log10(np.mean((y ** 2).mean(1)) + 1e-12)  # noqa: E731
    print(f"cues {len(cues())}  voice {rms(voice[talking]):.1f}  music talking {rms(music[speech]):.1f}  music pauses {rms(music[~speech]):.1f}")


if __name__ == "__main__":
    main()
