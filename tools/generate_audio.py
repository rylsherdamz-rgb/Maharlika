#!/usr/bin/env python3
"""MAHARLIKA audio generator.

Every sound in the game is synthesized here, in the same spirit as generate_assets.py:
no samples, only small procedural routines. The palette is the kulintang ensemble of the
southern islands (a row of tuned gong-chimes), the big hanging agung, the dabakan drum,
and the babandil (a small time-keeping gong), plus a few non-musical effects.

    python3 tools/generate_audio.py      (needs numpy, scipy and ffmpeg)

Outputs:
    assets/audio/sfx/*.wav     short effects (WAV so they start with no codec delay)
    assets/audio/music/*.m4a   looping tracks (AAC; plays on Android, iOS and the web)
    src/sounds.ts              typed require() registry
"""
import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio")
SR = 22050
rng = np.random.default_rng(1521)  # Mactan


# ---------------------------------------------------------------- primitives
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env(dur, attack=0.004, decay=0.2):
    t = t_axis(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def noise(dur):
    return rng.uniform(-1, 1, int(dur * SR))


def filt(x, kind, freq, order=2):
    nyq = SR / 2
    if isinstance(freq, (list, tuple)):
        wn = [min(f / nyq, 0.99) for f in freq]
    else:
        wn = min(freq / nyq, 0.99)
    return sosfilt(butter(order, wn, btype=kind, output="sos"), x)


def sweep(f0, f1, dur, shape="sine"):
    t = t_axis(dur)
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if shape == "square":
        return np.sign(np.sin(ph))
    if shape == "tri":
        return 2 / np.pi * np.arcsin(np.sin(ph))
    return np.sin(ph)


def gong(freq, dur=1.2, decay=0.45, bright=1.0, bend=0.0):
    """A bossed gong-chime: inharmonic partials, a soft mallet click, a slight pitch drop."""
    t = t_axis(dur)
    out = np.zeros_like(t)
    partials = [(1.0, 1.0, 1.0), (2.01, 0.42 * bright, 0.55), (2.76, 0.22 * bright, 0.35), (4.1, 0.1 * bright, 0.2), (0.5, 0.18, 1.3)]
    for ratio, amp, dk in partials:
        f = freq * ratio * (1 + bend * np.exp(-t * 18))
        out += amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (decay * dk))
    click = filt(noise(0.012), "bandpass", [freq * 2, min(freq * 8, 9000)]) * 0.25
    out[: len(click)] += click
    att = np.clip(t / 0.002, 0, 1)
    return out * att


def agung(freq=62, dur=3.0):
    """The big hanging gong: low, slow, with a beating shimmer."""
    t = t_axis(dur)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t / 1.4)
    x += 0.5 * np.sin(2 * np.pi * freq * 1.012 * t) * np.exp(-t / 1.2)
    x += 0.3 * np.sin(2 * np.pi * freq * 2.03 * t) * np.exp(-t / 0.6)
    x += 0.12 * np.sin(2 * np.pi * freq * 3.4 * t) * np.exp(-t / 0.3)
    thump = filt(noise(0.05), "lowpass", 300) * np.exp(-t_axis(0.05) / 0.015)
    x[: len(thump)] += thump * 0.8
    return x * np.clip(t / 0.01, 0, 1)


def drum(dur=0.25, pitch=120, slap=0.35):
    """Dabakan: a skin drum, a thump plus a slap of noise."""
    t = t_axis(dur)
    body = sweep(pitch * 1.8, pitch, dur) * np.exp(-t / 0.08)
    s = filt(noise(dur), "bandpass", [800, 4000]) * np.exp(-t / 0.025) * slap
    return body + s


def pluck(freq, dur=0.35, damp=0.996):
    """Karplus-Strong string, used for the bow."""
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out


def mix(*parts):
    n = max(len(p) for _, p in parts)
    out = np.zeros(n)
    for start, p in parts:
        s = int(start * SR)
        end = min(n, s + len(p))
        if s < n:
            out[s:end] += p[: end - s]
    return out


def norm(x, peak=0.85):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def write_wav(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ---------------------------------------------------------------- tuning
def hz(semitones_from_a4):
    return 440.0 * 2 ** (semitones_from_a4 / 12)


# a pentatonic row like an 8-gong kulintang set (low to high), around D4-D5
ROW_CALM = [hz(s) for s in (-7, -5, -2, 0, 2, 5, 7, 10)]          # D E G A B D E G
ROW_WAR = [hz(s) for s in (-7, -4, -2, 0, 3, 5, 8, 10)]           # D F G A C D F G
ROW_DARK = [hz(s) for s in (-7, -6, -2, 0, 1, 5, 6, 10)]          # D Eb G A Bb D Eb G


# ---------------------------------------------------------------- sound effects
def sfx():
    S = {}
    # attacks
    w = filt(noise(0.16), "bandpass", [900, 5000]) * env(0.16, 0.01, 0.05)
    S["slash"] = norm(w + 0.3 * sweep(900, 300, 0.16, "tri") * env(0.16, 0.002, 0.04), 0.7)
    S["bow"] = norm(mix((0, pluck(196, 0.3) * env(0.3, 0.001, 0.12)), (0, 0.3 * filt(noise(0.05), "highpass", 3000) * env(0.05, 0.001, 0.01))), 0.6)
    S["orb"] = norm(sweep(500, 1400, 0.14) * env(0.14, 0.005, 0.06) + 0.4 * sweep(750, 2100, 0.14) * env(0.14, 0.005, 0.04), 0.45)
    S["dart"] = norm(filt(noise(0.08), "bandpass", [1500, 6000]) * env(0.08, 0.002, 0.02), 0.55)
    S["enemy_shot"] = norm(sweep(380, 200, 0.12, "tri") * env(0.12, 0.002, 0.05), 0.4)
    # contact
    S["hit"] = norm(drum(0.1, 160, 0.6) * env(0.1, 0.001, 0.04), 0.6)
    S["kill"] = norm(mix((0, drum(0.12, 90, 0.8)), (0.03, gong(hz(7), 0.4, 0.12, 0.6))), 0.7)
    S["hurt"] = norm(mix((0, sweep(240, 90, 0.25, "square") * env(0.25, 0.002, 0.1) * 0.5), (0, drum(0.2, 70, 0.5))), 0.75)
    S["block"] = norm(mix((0, gong(hz(19), 0.3, 0.07, 1.4)), (0, 0.4 * filt(noise(0.03), "highpass", 4000) * env(0.03, 0.001, 0.008))), 0.6)
    S["dodge"] = norm(filt(noise(0.2), "bandpass", [400, 2500]) * np.sin(np.linspace(0, np.pi, int(0.2 * SR))) ** 2, 0.5)
    # pickups
    S["coin"] = norm(mix((0, gong(hz(15), 0.25, 0.06, 0.5)), (0.05, gong(hz(22), 0.3, 0.08, 0.5))), 0.45)
    S["light"] = norm(sweep(900, 1500, 0.09) * env(0.09, 0.003, 0.04), 0.3)
    S["heal"] = norm(mix(*[(i * 0.07, gong(f, 0.5, 0.18, 0.5)) for i, f in enumerate([hz(3), hz(7), hz(10), hz(15)])]), 0.55)
    # moments
    S["skill"] = norm(mix((0, agung(78, 1.6)), (0, gong(hz(10), 1.2, 0.4)), (0.08, gong(hz(17), 1.0, 0.3)), (0, filt(noise(0.6), "highpass", 5000) * env(0.6, 0.05, 0.2) * 0.3)), 0.85)
    S["boon"] = norm(mix(*[(i * 0.09, gong(f, 1.0, 0.4)) for i, f in enumerate(ROW_CALM[2:7])]), 0.7)
    S["wave"] = norm(mix(*[(i * 0.09, drum(0.25, 110 + i * 6, 0.4)) for i in range(4)], (0.36, agung(70, 1.2) * 0.6)), 0.7)
    S["island_clear"] = norm(mix((0, gong(ROW_CALM[3], 1.4, 0.5)), (0.18, gong(ROW_CALM[5], 1.4, 0.5)), (0.36, gong(ROW_CALM[7], 1.8, 0.7)), (0.36, agung(74, 2.0) * 0.5)), 0.75)
    water = filt(noise(1.6), "lowpass", 900) * np.sin(np.linspace(0, np.pi, int(1.6 * SR))) * 0.6
    S["sail"] = norm(mix((0, agung(66, 2.4)), (0.1, water)), 0.75)
    t = t_axis(1.6)
    growl = filt(noise(1.6), "lowpass", 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
    S["roar"] = norm((growl + 0.8 * sweep(110, 45, 1.6, "tri")) * env(1.6, 0.15, 0.7), 0.9)
    S["death"] = norm(mix((0, agung(55, 2.5)), (0.1, gong(ROW_DARK[3], 1.6, 0.6)), (0.5, gong(ROW_DARK[1], 1.8, 0.7)), (0.9, gong(ROW_DARK[0], 2.2, 0.9))), 0.8)
    S["victory"] = norm(mix(*[(i * 0.12, gong(f, 1.4, 0.5)) for i, f in enumerate(ROW_CALM)], (0.96, agung(74, 2.5)), (0.96, gong(ROW_CALM[7] * 2, 2.0, 0.8, 0.6))), 0.8)
    S["tap"] = norm(gong(hz(12), 0.15, 0.04, 0.8), 0.4)
    S["talk"] = norm(gong(hz(14), 0.12, 0.03, 0.5), 0.3)
    return S


# ---------------------------------------------------------------- music
def render_loop(events, bars, bpm, beats_per_bar=4):
    """events: list of (beat, sound). Tails past the end wrap to the start so it loops cleanly."""
    beat = 60 / bpm
    n = int(bars * beats_per_bar * beat * SR)
    out = np.zeros(n)
    for b, snd in events:
        s = int(b * beat * SR) % n
        k = len(snd)
        first = min(k, n - s)
        out[s : s + first] += snd[:first]
        if k > first:
            rest = snd[first:]
            out[: len(rest)] += rest[: n]
    return out


def melody(row, bars, rng_m, density=0.75, motif_len=8, steps=2):
    """A kulintang line: a motif in 16ths, repeated and varied the way players embroider it."""
    motif = []
    i = rng_m.integers(2, 6)
    for _ in range(motif_len):
        i = int(np.clip(i + rng_m.integers(-2, 3), 0, len(row) - 1))
        motif.append(i if rng_m.random() < density else None)
    notes = []
    per_bar = 4 * steps
    for bar in range(bars):
        var = motif[:]
        if bar % 4 == 3:  # the turnaround bar climbs and resolves
            var = [min(len(row) - 1, (m or 3) + 1) if k % 2 == 0 else None for k, m in enumerate(var)]
            var[-1] = 3
        elif bar % 2 == 1:
            j = rng_m.integers(0, motif_len)
            var[j] = int(np.clip((var[j] if var[j] is not None else 3) + rng_m.choice([-1, 1]), 0, len(row) - 1))
        for k in range(per_bar):
            m = var[k % motif_len]
            if m is not None:
                notes.append((bar * 4 + k / steps, m))
    return notes


def track(row, bpm, bars, seed, drums, agung_every, dark=False, lead_decay=0.3, bass_pattern=(0, 2.5)):
    rm = np.random.default_rng(seed)
    beat = 60 / bpm
    ev = []
    tones = {i: gong(f, 1.0, lead_decay, 1.0 if not dark else 1.3) * (0.55 if not dark else 0.5) for i, f in enumerate(row)}
    for b, i in melody(row, bars, rm, 0.8 if drums else 0.65, 8, 2):
        ev.append((b, tones[i] * (0.8 + 0.2 * rm.random())))
    # gandingan / low gongs answering on the off-beats
    low = {i: gong(row[i] / 2, 1.2, 0.5, 0.6) * 0.45 for i in range(len(row))}
    for bar in range(bars):
        root = [0, 0, 2, 3][bar % 4] if not dark else [0, 1, 0, 3][bar % 4]
        for off in bass_pattern:
            ev.append((bar * 4 + off, low[root]))
    # agung on the downbeat
    ag = agung(58 if dark else 66, 3.0) * 0.7
    for bar in range(0, bars, agung_every):
        ev.append((bar * 4, ag))
    # babandil keeping time
    tick = gong(hz(27), 0.1, 0.025, 0.4) * 0.18
    for b in range(bars * 4):
        ev.append((b + 0.5, tick))
    if drums:
        d1 = drum(0.25, 120, 0.4) * 0.6
        d2 = drum(0.15, 180, 0.7) * 0.4
        for bar in range(bars):
            for b, d in [(0, d1), (1, d2), (1.5, d2), (2, d1), (2.75, d2), (3, d2), (3.5, d2)]:
                ev.append((bar * 4 + b, d))
            if dark and bar % 2 == 1:
                for k in range(4):
                    ev.append((bar * 4 + 3 + k / 4, d2 * 0.8))
    x = render_loop(ev, bars, bpm)
    # a little room: a short feedback echo, wrapped so the loop stays seamless
    d = int(beat * 0.75 * SR)
    wet = np.roll(x, d) * 0.22 + np.roll(x, 2 * d) * 0.08
    return norm(filt(x + wet, "lowpass", 7000), 0.8)


def write_m4a(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    write_wav(tmp, x)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-c:a", "aac", "-b:a", "80k", "-ac", "1", path], check=True)
    os.remove(tmp)


def music():
    return {
        # title and port of Tondo: calm, open, unhurried
        "title": track(ROW_CALM, 84, 16, 7, drums=False, agung_every=2, lead_decay=0.45, bass_pattern=(0,)),
        # the islands: driving, with the dabakan
        "island": track(ROW_WAR, 118, 16, 11, drums=True, agung_every=1, bass_pattern=(0, 2.5)),
        # the shore of Albay: dark scale, heavier agung, drum rolls
        "boss": track(ROW_DARK, 132, 16, 23, drums=True, agung_every=1, dark=True, lead_decay=0.25, bass_pattern=(0, 1.5, 2.5)),
    }


# ---------------------------------------------------------------- registry
def write_registry(sfx_names, music_names):
    lines = ["// AUTO-GENERATED by tools/generate_audio.py - do not edit.", "", "export const SFX = {"]
    for n in sfx_names:
        lines.append(f"  {n}: require('../assets/audio/sfx/{n}.wav'),")
    lines += ["} as const;", "", "export const MUSIC = {"]
    for n in music_names:
        lines.append(f"  {n}: require('../assets/audio/music/{n}.m4a'),")
    lines += ["} as const;", "", "export type SfxId = keyof typeof SFX;", "export type MusicId = keyof typeof MUSIC;", ""]
    with open(os.path.join(ROOT, "src", "sounds.ts"), "w") as f:
        f.write("\n".join(lines))


def main():
    S = sfx()
    for name, x in S.items():
        write_wav(os.path.join(OUT, "sfx", f"{name}.wav"), x)
    M = music()
    for name, x in M.items():
        write_m4a(os.path.join(OUT, "music", f"{name}.m4a"), x)
    write_registry(sorted(S), sorted(M))
    print(f"wrote {len(S)} effects and {len(M)} tracks to {OUT}")


if __name__ == "__main__":
    main()
