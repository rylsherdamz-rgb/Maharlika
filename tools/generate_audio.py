#!/usr/bin/env python3
"""MAHARLIKA audio generator: every note of music and every sound effect, synthesized.

The music is built from the sounds of the islands' own instruments, approximated with simple
synthesis: the kulintang (a row of small tuned gongs), the agung (large hanging gong), the
dabakan (goblet drum), bamboo percussion, the kubing (bamboo jaw harp) and the suling (flute).
Nothing is sampled, so there is nothing to license.

    python3 tools/generate_audio.py        # needs numpy and ffmpeg

Outputs (mono MP3, which plays on Android, iOS and the web):
    assets/audio/music_*.mp3   looping tracks: title, island, cave, boss
    assets/audio/sfx_*.mp3     sound effects and short jingles
    src/sounds.ts              typed require() registry
"""
import os
import subprocess
import tempfile
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio")
SR = 22050
rng = np.random.default_rng(7)

# a pentatonic tuning in the spirit of kulintang melodies (not a transcription of any real tuning)
SCALE = [0, 2, 4, 7, 9]


def note_hz(degree, octave=4, base=261.63):
    """Pentatonic degree (can run past 5) to frequency."""
    o, d = divmod(degree, len(SCALE))
    return base * 2 ** (octave - 4 + o + SCALE[d] / 12)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, attack=0.005, decay=0.3, sustain=0.0, release=0.0):
    """Attack then exponential decay toward `sustain`, as a sample-length array."""
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = sustain + (1 - sustain) * np.exp(-t / max(decay, 1e-4))
    out = a * d
    if release:
        r = int(release * SR)
        out[-r:] *= np.linspace(1, 0, r)
    return out


def lowpass(x, cutoff):
    """One-pole low-pass filter."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def bandnoise(n, lo, hi):
    noise = rng.standard_normal(n)
    return lowpass(noise, hi) - lowpass(noise, lo)


# ---------------------------------------------------------------- instruments
def kulintang(freq, dur=0.9, vel=1.0):
    """Small bossed gong: bright inharmonic partials, fast decay, slight shimmer."""
    t = t_axis(dur)
    partials = [(1.0, 1.0, 0.55), (2.0, 0.35, 0.3), (2.76, 0.25, 0.22), (5.4, 0.08, 0.1)]
    x = sum(a * np.sin(2 * np.pi * freq * r * t + 0.3 * np.sin(2 * np.pi * 5 * t)) * np.exp(-t / d) for r, a, d in partials)
    x += 0.15 * bandnoise(len(t), 1500, 6000) * np.exp(-t / 0.01)  # the mallet strike
    return vel * x * env(len(t), 0.002, 10)


def agung(freq=70, dur=2.5, vel=1.0):
    """Large hanging gong: deep, beating tone that swells a little after the strike."""
    t = t_axis(dur)
    x = np.sin(2 * np.pi * freq * t) + 0.8 * np.sin(2 * np.pi * (freq * 1.012) * t)  # beating
    x += 0.4 * np.sin(2 * np.pi * freq * 2.02 * t) * np.exp(-t / 0.8)
    x += 0.5 * np.sin(2 * np.pi * 45 * t) * np.exp(-t / 0.12)  # the thump
    swell = (1 - np.exp(-t / 0.05)) * np.exp(-t / (dur / 2.5))
    return vel * 0.6 * x * swell


def dabakan(dur=0.35, vel=1.0, pitch=110):
    """Goblet drum: a low pitch drop and a slap of skin."""
    t = t_axis(dur)
    f = pitch * (1 + 0.8 * np.exp(-t / 0.03))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    slap = bandnoise(len(t), 200, 3000) * np.exp(-t / 0.02)
    return vel * (0.9 * body + 0.4 * slap)


def bamboo(dur=0.12, vel=1.0, tone=900):
    """Bamboo slit-drum or stamping tube: a short, woody knock."""
    t = t_axis(dur)
    x = np.sin(2 * np.pi * tone * t) * np.exp(-t / 0.025) + 0.5 * bandnoise(len(t), 600, 2500) * np.exp(-t / 0.01)
    return vel * 0.6 * x


def kubing(freq, dur, vel=1.0):
    """Bamboo jaw harp: a buzzy drone whose vowel slowly opens and closes."""
    t = t_axis(dur)
    saw = 2 * ((freq * t) % 1) - 1
    wah = 600 + 500 * np.sin(2 * np.pi * 0.7 * t) ** 2
    x = np.zeros_like(saw)
    # cheap moving formant: blend two fixed low-passes by the wah amount
    lo, hi = lowpass(saw, 500), lowpass(saw, 1300)
    k = (wah - 600) / 500
    x = lo * (1 - k) + hi * k
    return vel * 0.35 * x * env(len(t), 0.05, 99, 1, 0.2)


def suling(freq, dur, vel=1.0):
    """Bamboo flute: soft sine with vibrato and breath."""
    t = t_axis(dur)
    vib = 1 + 0.008 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.3, 0, 1)
    tone = np.sin(2 * np.pi * np.cumsum(freq * vib) / SR) + 0.15 * np.sin(2 * np.pi * np.cumsum(2 * freq * vib) / SR)
    breath = 0.08 * bandnoise(len(t), 800, 5000)
    return vel * 0.4 * (tone + breath) * env(len(t), 0.08, 99, 1, min(0.3, dur / 3))


def drip(freq=1800, vel=1.0):
    """A water drop in a cave: a quick falling blip."""
    t = t_axis(0.25)
    f = freq * (1 + 1.5 * np.exp(-t / 0.01))
    return vel * 0.3 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)


# ---------------------------------------------------------------- mixing helpers
def place(buf, sound, at_sec, loop=True):
    """Mix a sound into the buffer; with `loop`, what runs past the end wraps to the start."""
    i = int(at_sec * SR)
    n = len(sound)
    end = i + n
    if end <= len(buf):
        buf[i:end] += sound
    else:
        k = len(buf) - i
        buf[i:] += sound[:k]
        if loop:
            rest = sound[k:]
            buf[: len(rest)] += rest[: len(buf)]


def mix(*sounds):
    """Sum sounds of different lengths, padding the shorter ones with silence."""
    out = np.zeros(max(len(x) for x in sounds))
    for x in sounds:
        out[: len(x)] += x
    return out


def master(x, peak=0.85):
    x = x - np.mean(x)
    x = np.tanh(1.2 * x / (np.max(np.abs(x)) + 1e-9))  # gentle limiting
    return peak * x / (np.max(np.abs(x)) + 1e-9)


def write_mp3(x, name, kbps=64):
    os.makedirs(OUT, exist_ok=True)
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        with wave.open(tmp.name, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        path = os.path.join(OUT, f"{name}.mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-codec:a", "libmp3lame", "-b:a", f"{kbps}k", path], check=True)
    os.unlink(tmp.name)
    return path


# ---------------------------------------------------------------- music
def track_title():
    """Gabi ng Bakunawa: slow, wide, a gong on every bar and a flute over a kubing drone."""
    bpm, beats = 84, 48
    b = 60 / bpm
    buf = np.zeros(int(beats * b * SR))
    place(buf, kubing(note_hz(0, 2), beats * b, 0.5), 0)
    for bar in range(beats // 4):
        place(buf, agung(65, 3.0, 0.9), bar * 4 * b)
        place(buf, agung(98, 2.0, 0.35), (bar * 4 + 2.5) * b)
    melody = [4, None, 3, 2, 3, None, 0, None, 2, 3, 4, None, 6, 5, 4, None,
              4, None, 3, 2, 0, None, 1, 2, 3, None, 2, 0, 0, None, None, None]
    for i, d in enumerate(melody):
        if d is not None:
            place(buf, kulintang(note_hz(d, 5), 1.4, 0.55), i * 1.5 * b / 1)
    # the suling answers in the second half
    for at, d, ln in [(24, 4, 3), (27, 3, 1), (28, 2, 4), (33, 0, 2), (36, 2, 3), (40, 4, 6)]:
        place(buf, suling(note_hz(d, 5), ln * b, 0.7), at * b)
    for i in range(beats):
        if i % 2 == 1:
            place(buf, bamboo(0.1, 0.25, 700), i * b)
    return master(buf, 0.75)


def track_island():
    """Paglalayag: a bright kulintang ostinato over bamboo and dabakan, agung on the downbeats."""
    bpm, bars = 118, 16
    b = 60 / bpm
    buf = np.zeros(int(bars * 4 * b * SR))
    ost_a = [0, 2, 4, 2, 3, 2, 4, 5]
    ost_b = [5, 4, 3, 4, 2, 3, 0, 2]
    for bar in range(bars):
        t0 = bar * 4 * b
        place(buf, agung(73, 2.2, 0.8), t0)
        place(buf, agung(110, 1.4, 0.3), t0 + 2 * b)
        for s in range(8):  # eighth notes
            ost = ost_a if (bar // 2) % 2 == 0 else ost_b
            vel = 0.75 if s % 2 == 0 else 0.5
            place(buf, kulintang(note_hz(ost[s] + (5 if bar >= 8 and s % 4 == 0 else 0), 5), 0.6, vel), t0 + s * b / 2)
        for s in range(16):  # bamboo sixteenths with accents
            if s % 4 in (0, 3) or s in (6, 10, 14):
                place(buf, bamboo(0.08, 0.35 + 0.25 * (s % 4 == 0), 950 if s % 2 else 750), t0 + s * b / 4)
        for s, p in [(0, 110), (1.5, 140), (2, 110), (3, 140), (3.5, 165)]:
            place(buf, dabakan(0.3, 0.7, p), t0 + s * b)
        if bar % 4 == 3:
            for i, d in enumerate([7, 6, 5, 4]):
                place(buf, kulintang(note_hz(d, 5), 0.5, 0.45), t0 + (2 + i * 0.5) * b)
    return master(buf, 0.75)


def track_cave():
    """Yungib: low drone, far-off gongs and dripping water."""
    bpm, beats = 66, 40
    b = 60 / bpm
    dur = beats * b
    buf = np.zeros(int(dur * SR))
    place(buf, kubing(note_hz(0, 1) * 1.0, dur, 0.55), 0)
    place(buf, kubing(note_hz(3, 1), dur, 0.25), 0)
    for i in range(0, beats, 8):
        place(buf, agung(55, 4.0, 0.7), i * b)
    for at, d in [(3, 2), (5.5, 1), (11, 4), (12, 3), (19, 0), (27, 2), (28.5, 1), (35, 4)]:
        place(buf, kulintang(note_hz(d, 4), 2.0, 0.3), at * b)
    for _ in range(26):
        place(buf, drip(rng.uniform(1300, 2600), rng.uniform(0.3, 0.8)), rng.uniform(0, dur))
    wind = lowpass(rng.standard_normal(len(buf)), 300) * 0.6
    buf += wind * (0.6 + 0.4 * np.sin(2 * np.pi * np.arange(len(buf)) / len(buf)))
    return master(buf, 0.7)


def track_boss():
    """Laban: driving dabakan, agung on the off-beats, a fast and tense kulintang line."""
    bpm, bars = 148, 16
    b = 60 / bpm
    buf = np.zeros(int(bars * 4 * b * SR))
    line = [0, 0, 1, 0, 3, 1, 0, 1, 0, 0, 1, 0, 4, 3, 1, 0]
    for bar in range(bars):
        t0 = bar * 4 * b
        lift = 2 if bar >= 8 else 0
        for s in range(16):
            vel = 0.7 if s % 4 == 0 else 0.45
            place(buf, kulintang(note_hz(line[s] + lift, 4), 0.35, vel), t0 + s * b / 4)
        for beat in range(4):
            place(buf, dabakan(0.25, 0.9, 95), t0 + beat * b)
            place(buf, dabakan(0.2, 0.5, 150), t0 + (beat + 0.5) * b)
            place(buf, agung(62 if beat % 2 else 82, 1.0, 0.55), t0 + (beat + 0.5) * b)
        for s in range(16):
            place(buf, bamboo(0.06, 0.3, 1100), t0 + s * b / 4)
        if bar % 4 == 3:
            for i in range(4):
                place(buf, agung(55, 1.5, 0.8), t0 + (2 + i * 0.5) * b)
    return master(buf, 0.8)


# ---------------------------------------------------------------- effects
def sfx():
    s = {}

    def sweep(f0, f1, dur, shape=np.sin):
        t = t_axis(dur)
        f = f0 * (f1 / f0) ** (t / dur)
        return shape(2 * np.pi * np.cumsum(f) / SR)

    n = lambda d: int(d * SR)  # noqa: E731
    # attacks
    s["slash"] = bandnoise(n(0.18), 900, 5000) * env(n(0.18), 0.02, 0.05) * 1.2
    t = t_axis(0.22)
    s["shoot"] = (np.sin(2 * np.pi * 220 * t) * np.exp(-t / 0.05) + 0.6 * bandnoise(len(t), 2000, 7000) * np.exp(-t / 0.02))  # bowstring
    s["magic"] = kulintang(note_hz(4, 6), 0.4, 0.8) + kulintang(note_hz(2, 6), 0.4, 0.4)
    s["cannon"] = dabakan(0.5, 1.2, 60) + bandnoise(n(0.5), 60, 1500) * env(n(0.5), 0.002, 0.12) * 1.5
    s["boom"] = bandnoise(n(0.7), 40, 900) * env(n(0.7), 0.002, 0.2) * 1.8 + 0.6 * sweep(120, 40, 0.7) * env(n(0.7), 0.002, 0.25)
    # contact
    s["hit"] = dabakan(0.12, 0.9, 180) + bandnoise(n(0.12), 1500, 5000) * env(n(0.12), 0.001, 0.015)
    s["kill"] = bandnoise(n(0.35), 300, 3000) * env(n(0.35), 0.005, 0.1) + 0.5 * sweep(500, 120, 0.35) * env(n(0.35), 0.005, 0.12)
    s["hurt"] = sweep(320, 110, 0.25, lambda p: np.sign(np.sin(p))) * env(n(0.25), 0.002, 0.08) * 0.5
    s["dodge"] = bandnoise(n(0.25), 300, 2500) * (np.sin(np.linspace(0, np.pi, n(0.25))) ** 2)
    # pickups and rewards
    s["coin"] = kulintang(note_hz(4, 6), 0.3, 0.6) + np.pad(kulintang(note_hz(6, 6), 0.25, 0.5), (n(0.06), 0))[: n(0.3)]
    s["pickup"] = sweep(500, 1100, 0.15) * env(n(0.15), 0.005, 0.08) * 0.7
    s["chest"] = np.concatenate([bamboo(0.1, 1, 500), np.zeros(n(0.05))])
    chime = np.zeros(n(0.9))
    for i, d in enumerate([0, 2, 4, 7]):
        place(chime, kulintang(note_hz(d, 5), 0.6, 0.6), 0.12 + i * 0.08, loop=False)
    s["chest"] = np.concatenate([s["chest"], np.zeros(len(chime) - len(s["chest"]))]) + chime
    lv = np.zeros(n(1.0))
    for i, d in enumerate([0, 2, 4, 5, 7]):
        place(lv, kulintang(note_hz(d, 5), 0.6, 0.7), i * 0.09, loop=False)
    place(lv, agung(130, 0.8, 0.5), 0.45, loop=False)
    s["levelup"] = lv
    rel = np.zeros(n(1.6))
    for i in range(12):
        place(rel, kulintang(note_hz(int(rng.integers(0, 10)), 6), 0.7, 0.35), i * 0.07, loop=False)
    place(rel, suling(note_hz(4, 5), 1.0, 0.8), 0.3, loop=False)
    s["relic"] = rel
    s["skill"] = mix(agung(98, 1.4, 1.2), kulintang(note_hz(4, 5), 1.0, 0.5))
    s["heal"] = np.concatenate([suling(note_hz(2, 5), 0.18, 0.7), suling(note_hz(4, 5), 0.3, 0.7)])
    # world
    s["door"] = agung(50, 1.6, 1.0) + bandnoise(n(1.6), 50, 600) * env(n(1.6), 0.2, 0.5) * 0.6
    s["sail"] = bandnoise(n(1.2), 150, 1200) * (np.sin(np.linspace(0, np.pi, n(1.2))) ** 2) * 0.8 + agung(73, 1.2, 0.4)
    roar_t = t_axis(1.4)
    s["roar"] = (sweep(90, 55, 1.4, lambda p: np.sign(np.sin(p))) * 0.4 + bandnoise(len(roar_t), 80, 1200) * 0.8) * env(len(roar_t), 0.15, 0.5)
    s["click"] = bamboo(0.06, 1.2, 1200)
    # jingles
    win = np.zeros(n(3.2))
    for i, d in enumerate([0, 2, 4, 7, 9, 7, 9, 10]):
        place(win, kulintang(note_hz(d, 5), 1.0, 0.7), i * 0.16, loop=False)
    place(win, agung(65, 2.4, 1.0), 1.3, loop=False)
    place(win, suling(note_hz(5, 5), 1.4, 0.8), 1.4, loop=False)
    s["victory"] = win
    lose = np.zeros(n(3.0))
    for i, d in enumerate([4, 3, 2, 0]):
        place(lose, kulintang(note_hz(d, 4), 1.4, 0.6), i * 0.4, loop=False)
    place(lose, agung(49, 2.6, 0.9), 1.4, loop=False)
    s["defeat"] = lose
    return {k: master(v, 0.8) for k, v in s.items()}


def write_registry(music, effects):
    lines = ["// AUTO-GENERATED by tools/generate_audio.py - do not edit.", "", "export const MUSIC = {"]
    lines += [f"  {k}: require('../assets/audio/music_{k}.mp3')," for k in music]
    lines += ["} as const;", "", "export const SFX = {"]
    lines += [f"  {k}: require('../assets/audio/sfx_{k}.mp3')," for k in effects]
    lines += ["} as const;", "", "export type MusicId = keyof typeof MUSIC;", "export type SfxId = keyof typeof SFX;", ""]
    with open(os.path.join(ROOT, "src", "sounds.ts"), "w") as fh:
        fh.write("\n".join(lines))


def main():
    music = {"title": track_title, "island": track_island, "cave": track_cave, "boss": track_boss}
    for name, fn in music.items():
        write_mp3(fn(), f"music_{name}", 64)
    effects = sfx()
    for name, x in effects.items():
        write_mp3(x, f"sfx_{name}", 64)
    write_registry(music, effects)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"generated {len(music)} tracks and {len(effects)} effects, {total // 1024} KB")


if __name__ == "__main__":
    main()
