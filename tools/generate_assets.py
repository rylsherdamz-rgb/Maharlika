#!/usr/bin/env python3
"""BANTAY asset generator.

Bantay is a night-watch roguelike set in a Philippine barrio. Every piece of
art is defined here as a hand-drawn pixel map (or a small procedural routine)
and rendered to PNG with nearest-neighbour upscaling so it stays crisp on
high-density Android screens.

    python3 tools/generate_assets.py

Outputs:
    assets/sprites/**    guardians, folklore creatures, weapons, shots, items, tiles
    assets/ui/**         HUD icons and touch controls
    assets/screens/**    title / select / defeat / dawn backgrounds, logo, titles
    assets/rooms/**      pre-rendered purok (village zone) maps
    assets/brand/**      brand sheet: logo, palette, cast lineup
    assets/icon.png ...  app icon, adaptive icon layers, splash
    src/game/rooms.json  collision grids matching the rendered rooms
    src/assets.ts        typed require() registry for every PNG
    assets/preview.png   contact sheet of everything
"""
import json
import math
import os
import random

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")

SPRITE_SCALE = 8   # 16px art -> 128px png
SCREEN_SCALE = 4   # 320x180 art -> 1280x720 png
ROOM_SCALE = 4

# ---------------------------------------------------------------- palette
# Moonlit teal night + warm lantern amber + bamboo and leaf greens.
PAL = {
    "K": (12, 22, 28),       # outline (teal-black)
    "k": (28, 48, 58),       # deep shade
    "W": (255, 252, 236),
    "w": (222, 214, 190),    # cloth off-white
    "D": (36, 28, 30),       # black hair
    "R": (214, 58, 48),      # red
    "r": (126, 30, 34),      # dark red
    "O": (240, 132, 40),     # flame orange
    "A": (255, 186, 72),     # lantern amber
    "Y": (255, 232, 130),    # glow yellow
    "y": (176, 122, 42),     # brass / ochre
    "G": (98, 178, 74),      # leaf
    "g": (42, 106, 58),      # dark leaf
    "Q": (204, 196, 102),    # bamboo
    "q": (134, 128, 54),     # bamboo shade
    "T": (54, 164, 160),     # teal
    "t": (24, 92, 104),      # dark teal
    "C": (130, 238, 214),    # spirit green-cyan
    "V": (214, 255, 238),    # spirit glow
    "N": (152, 94, 52),      # wood
    "n": (92, 56, 32),       # dark wood
    "F": (212, 148, 100),    # skin
    "f": (166, 104, 70),     # skin shade
    "E": (20, 14, 18),       # eyes
    "M": (236, 112, 150),    # flower pink
    "S": (156, 162, 156),    # stone
    "s": (100, 106, 104),    # stone shade
    "X": (255, 76, 56),      # red glow
    "B": (66, 112, 196),
    "b": (34, 56, 116),
    "H": (232, 228, 206),    # bone / moon
    "h": (170, 164, 140),
}


def rows_to_img(rows, w=16, h=16, outline=True, pal=PAL):
    """Turn a list of strings into an RGBA image. Short rows are padded."""
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(rows[:h]):
        if len(row) > w:
            raise ValueError(f"row too long ({len(row)}>{w}): {row!r}")
        for x, ch in enumerate(row):
            if ch in pal:
                px[x, y] = pal[ch] + (255,)
    if outline:
        add_outline(img)
    return img


def add_outline(img, color=PAL["K"]):
    w, h = img.size
    src = img.copy().load()
    px = img.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3] != 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] != 0:
                    px[x, y] = color + (255,)
                    break
    return img


def up(img, s):
    return img.resize((img.width * s, img.height * s), Image.NEAREST)


MANIFEST = []


def save(img, rel, scale=SPRITE_SCALE):
    path = os.path.join(ASSETS, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out = up(img, scale) if scale > 1 else img
    out.save(path, optimize=True)
    MANIFEST.append((rel, img))
    return img


def shift_up(rows, n):
    rows = list(rows) + [""] * 16
    return rows[n:16 + n]


# ---------------------------------------------------------------- guardians
# body rows 0..13 plus two leg rows for a 2-frame walk cycle (facing right).
HEROES = {
    # Kidlat: barrio watchman, red putong headwrap, bamboo-plate vest
    "kidlat": {
        "body": [
            "................",
            ".....DDDDDD.....",
            "....DDDDDDDD....",
            "..RRRRRRRRRRR...",
            ".Rr.DFFFFFFFD...",
            ".r..DFEFFFEFD...",
            "....DFFFFFFFf...",
            ".....FFffFFf....",
            "......FFFF......",
            "....QQWQQWQQ....",
            "...QqQWQQWQqQ...",
            "..FQqQQWWQQqQF..",
            "...qQQQWWQQQq...",
            "....kkkkkkkk....",
        ],
        "legs": ["....kk....kk....", ".....kk..kk....."],
    },
    # Liksi: scout in a salakot hat and banana-leaf cloak
    "liksi": {
        "body": [
            "................",
            ".......y........",
            "......yQy.......",
            "....yyQQQyy.....",
            ".yyyQQQQQQQyyy..",
            "..qqqqqqqqqqq...",
            "....FFFFFFF.....",
            "....FEFFFEF.....",
            "....FFFFFFf.....",
            "...gGGGGGGGg....",
            "..gGGgGGGgGGg...",
            "..FgGGGNGGGgF...",
            "...gGGGGGGGg....",
            "....nnnnnnn.....",
        ],
        "legs": ["....nn...nn.....", ".....nn.nn......"],
    },
    # Mayumi: babaylan (spirit healer-priestess), sampaguita in her hair, beads
    "mayumi": {
        "body": [
            "................",
            ".....DDDDDD.....",
            "....DDDDDDDDM...",
            "...DDDDDDDDMMM..",
            "...DDFFFFFFDM...",
            "...DFEFFFEFFD...",
            "...DFFFFFFFFD...",
            "...DDFFMFFFDD...",
            "...DDARARARADD..",
            "...DTTTTTTTTD...",
            "..DTTtTTTTtTTD..",
            "..FTTtTAATtTTF..",
            "...TTtTTTTtTT...",
            "...tttttttttt...",
        ],
        "legs": ["....FF....FF....", ".....FF..FF....."],
    },
    # Amihan: herbalist (manghihilot) in a striped tapis
    "amihan": {
        "body": [
            "................",
            "......DDDD......",
            ".....DDDDDD.....",
            "....DDDDDDDD....",
            "...DDFFFFFFDD...",
            "...DFEFFFFEFD...",
            "...DFFFFFFFFD...",
            "....FFFMMFFF....",
            ".....FFFFFF.....",
            "...wwWWWWWWww...",
            "..wwWWWWWWWWww..",
            "..FRRORRORRORF..",
            "...RROrRROrRR...",
            "...rrrrrrrrrr...",
        ],
        "legs": ["....FF....FF....", ".....FF..FF....."],
    },
}

# ---------------------------------------------------------------- creatures
DUWENDE = [
    "", "",
    ".......R........",
    "......RRr.......",
    ".....RRRRr......",
    "....RRRRRRr.....",
    "...RRRRRRRRr....",
    "....FFFFFFF.....",
    "....FEFFFEF.....",
    "...FFFFFfFFF....",
    "....wwwwwww.....",
    "...gwwwWwwwg....",
    "...ggwwwwwgg....",
    "....ggggggg.....",
    "....nn...nn.....",
]

MANANANGGAL_UP = [
    "",
    ".r............r.",
    ".rr...DDDD...rr.",
    ".rRr.DDDDDD.rRr.",
    ".rRrDDFFFFDDrRr.",
    "..rrDFXFFXFDrr..",
    "...rDFFFFFFDr...",
    "....DDFMMFDD....",
    ".....DwwwwD.....",
    "......wwww......",
    "......RrrR......",
    ".......Rr.......",
    ".......r........",
]
MANANANGGAL_DOWN = [
    "", "",
    "......DDDD......",
    ".....DDDDDD.....",
    "....DDFFFFDD....",
    "..rrDFXFFXFDrr..",
    ".rRrDFFFFFFDrRr.",
    ".rRrrDFMMFDrrRr.",
    ".rRr.DwwwwD.rRr.",
    ".rr...wwww...rr.",
    ".r....RrrR....r.",
    ".......Rr.......",
    "........r.......",
]

TIKBALANG = [
    "",
    ".....DD.........",
    "....DDNNN.......",
    "....DNNNNNN.....",
    "...DDNENNNNNN...",
    "...DNNNNNNNNNw..",
    "...DNNNnnNNNN...",
    "...DDNNN........",
    "....DNNN........",
    "...nNNNNNn......",
    "..nNNNNNNNn.....",
    "..FnNNNNNnF.....",
    "...nNNNNNn......",
    "....nnnnn.......",
    "....kk..kk......",
]

KAPRE = [
    "",
    "....DDDDDDD.....",
    "...DDDDDDDDD....",
    "..DDnnnnnnnDD...",
    "..DnXnnnnXnnD...",
    "..DnnnnnnnDwwwO.",
    "..DDnnnnnnnDD...",
    ".DDDDDDDDDDDDD..",
    ".DDnDDDDDDDnDD..",
    ".DnnDDDDDDDnnD..",
    ".DnnDDgggDDnnD..",
    "..nnDDgggDDnn...",
    "...DDDDDDDDD....",
    "...DDD...DDD....",
    "...nnn...nnn....",
]


def with_legs(rows, legs):
    r = list(rows) + [""] * 16
    r[14] = legs
    return r[:16]


ENEMIES = {
    "duwende": [DUWENDE, shift_up(DUWENDE, 2)],
    "manananggal": [MANANANGGAL_UP, MANANANGGAL_DOWN],
    "tikbalang": [TIKBALANG, with_legs(TIKBALANG, "...kk....kk.....")],
    # kapre fur is dark bark brown so it reads on the night ground
    "kapre": [[r.translate(str.maketrans("Dn", "nN")) for r in rows]
              for rows in (KAPRE, with_legs(KAPRE, "....nnn.nnn....."))],
}


def bakunawa_frame(f):
    """Bakunawa, the moon-eating sea serpent. 32x32, procedural, outlined."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    T, t, C = PAL["T"], PAL["t"], PAL["C"]
    wave = 1 if f else 0
    # coils (back to front)
    d.ellipse([3, 20 + wave, 17, 30 + wave], fill=t)
    d.ellipse([14, 21 - wave, 29, 30 - wave], fill=t)
    d.ellipse([5, 21 + wave, 15, 28 + wave], fill=T)
    d.ellipse([16, 22 - wave, 27, 29 - wave], fill=T)
    # belly scales
    for x in range(7, 26, 3):
        d.point((x, 27), fill=PAL["Q"])
    # neck rising
    d.polygon([(11, 23), (19, 23), (21, 12), (13, 10)], fill=T)
    d.line([(14, 22), (17, 12)], fill=PAL["Q"], width=2)
    # dorsal fins
    for i, (x, y) in enumerate(((10, 18), (11, 14), (4, 21), (25, 21))):
        d.polygon([(x, y), (x - 3, y - 3 - wave), (x + 1, y - 1)], fill=PAL["R"])
    # head
    d.ellipse([10, 3, 24, 13], fill=T)
    d.polygon([(20, 6), (30, 7), (30, 9), (21, 11)], fill=T)          # upper snout
    jaw = 2 + f * 2
    d.polygon([(19, 11), (29, 10 + jaw), (28, 12 + jaw), (18, 13)], fill=t)  # jaw
    d.polygon([(21, 10), (29, 9), (29, 10 + jaw)], fill=PAL["r"])         # mouth
    d.point([(23, 10), (26, 10)], fill=PAL["W"])                           # fangs
    # horns + whiskers
    d.line([(13, 4), (9, 0)], fill=PAL["H"])
    d.line([(16, 3), (14, -1)], fill=PAL["H"])
    d.line([(28, 8), (31, 5 - wave)], fill=PAL["Y"])
    # eye
    eye = PAL["X"] if f else PAL["A"]
    d.rectangle([18, 6, 19, 7], fill=eye)
    # moon-glow scales
    for (x, y) in ((12, 7), (14, 9), (6, 24), (20, 25), (24, 24)):
        d.point((x, y), fill=C)
    add_outline(img)
    return img


# ---------------------------------------------------------------- weapons (point right)
WEAPONS = {
    # tirador: slingshot (free to fire)
    "tirador": [
        "", "", "", "", "",
        "..........nN....",
        "..........N.....",
        "..nnNNNNNNNRRR..",
        "..........N.....",
        "..........nN....",
    ],
    # sumpit: bamboo blowgun, rapid darts
    "sumpit": [
        "", "", "", "", "", "",
        ".qQQQqQQQQqQQQQ.",
        ".qqqqqqqqqqqqqq.",
    ],
    # lantaka: brass swivel cannon, scatter shot
    "lantaka": [
        "", "", "", "", "",
        "............Ay..",
        "..nnyAAAAAAAAAy.",
        ".nNNyyyyyyyyyyy.",
        ".nn..N......Ay..",
        ".n...N..........",
    ],
    # agimat: anting-anting amulet rod, piercing spirit orbs
    "agimat": [
        "", "", "", "", "",
        "...........CC...",
        "..nnnnNNNNCVVC..",
        "..nNNNNNNNCVVC..",
        "...........CC...",
    ],
}

# ---------------------------------------------------------------- shots (8x8)
PROJECTILES = {
    "shot_pebble": [
        "........",
        "..SSS...",
        ".SWSSs..",
        ".SSSss..",
        "..sss...",
    ],
    "shot_dart": [
        "........",
        "........",
        "........",
        ".qQQQAA.",
        "........",
    ],
    "shot_scatter": [
        "........",
        "........",
        "...OO...",
        "..OYYO..",
        "...OO...",
    ],
    "shot_spirit": [
        "........",
        "..CCC...",
        ".CVVVC..",
        ".CVWVC..",
        ".CVVVC..",
        "..CCC...",
    ],
    "shot_enemy": [
        "........",
        "..rRr...",
        ".rRORr..",
        ".ROYOR..",
        ".rRORr..",
        "..rRr...",
    ],
}

# ---------------------------------------------------------------- items
ITEMS = {
    # barya: old gold coin with a sun stamp
    "coin": [
        "", "", "", "",
        "......yyyy......",
        ".....yAAAAy.....",
        ".....yAYAAy.....",
        ".....yAAYAy.....",
        ".....yAAAAy.....",
        "......yyyy......",
    ],
    # alitaptap: firefly, restores light (energy)
    "energy_orb": [
        "", "", "", "",
        "......w.w.......",
        ".......k........",
        "......CVC.......",
        ".......C........",
    ],
    # herb bundle, restores health
    "potion_health": [
        "", "", "",
        "......G.G.......",
        ".....GgGgG......",
        "......GGG.......",
        "......RRR.......",
        ".......q........",
        ".......q........",
        "......qq........",
    ],
    # gasera: oil lamp, restores lots of light
    "potion_energy": [
        "", "", "",
        ".......Y........",
        "......YAY.......",
        ".......O........",
        "......sSs.......",
        ".....SSSSS......",
        ".....yAAAy......",
        ".....yyyyy......",
    ],
    # baul: narra chest with brass fittings
    "chest_closed": [
        "", "", "", "",
        "...NNNNNNNNNN...",
        "..NNNNNNNNNNNN..",
        "..yyyyyyyyyyyy..",
        "..nNNNNAANNNNn..",
        "..nNNNNAyNNNNn..",
        "..nyNNNNNNNNyn..",
        "..nyNNNNNNNNyn..",
        "..nnnnnnnnnnnn..",
    ],
    "chest_open": [
        "", "",
        "...NNNNNNNNNN...",
        "..NNNNNNNNNNNN..",
        "..yyyyyyyyyyyy..",
        "..kkkkkkkkkkkk..",
        "..kAWAkAAkAWAk..",
        "..nNNNNNNNNNNn..",
        "..nNNNNAyNNNNn..",
        "..nyNNNNNNNNyn..",
        "..nyNNNNNNNNyn..",
        "..nnnnnnnnnnnn..",
    ],
}


def gate_frame(f):
    """Spirit gate: a ring of fireflies orbiting a pale glow."""
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    px = img.load()
    cx = cy = 7.5
    for y in range(16):
        for x in range(16):
            r = math.hypot(x - cx, y - cy)
            if r < 2.2:
                px[x, y] = PAL["V"] + (255,)
            elif r < 3.6:
                px[x, y] = PAL["C"] + (200,)
            elif 5.2 < r < 6.6:
                a = math.atan2(y - cy, x - cx) + f * math.pi / 4
                if math.sin(a * 4) > 0.35:
                    px[x, y] = (PAL["Y"] if math.sin(a * 4) > 0.8 else PAL["G"]) + (255,)
    return img


# ---------------------------------------------------------------- tiles
def tile_floor(seed):
    """Packed earth of the barrio plaza, moonlit, with grass tufts."""
    rnd = random.Random(seed)
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    base, hi, lo = (58, 70, 62), (70, 84, 72), (44, 54, 50)
    d.rectangle([0, 0, 15, 15], fill=base)
    for _ in range(10):
        img.putpixel((rnd.randrange(16), rnd.randrange(16)), rnd.choice([hi, lo]) + (255,))
    if seed % 3 == 0:  # grass tuft
        x, y = rnd.randrange(2, 13), rnd.randrange(4, 14)
        for dx, dy in ((0, 0), (1, -1), (2, 0), (1, 0)):
            img.putpixel((x + dx, y + dy), (72, 124, 66, 255))
    if seed % 7 == 2:  # pebble
        x, y = rnd.randrange(2, 13), rnd.randrange(2, 13)
        img.putpixel((x, y), (120, 124, 116, 255))
        img.putpixel((x + 1, y), (92, 96, 90, 255))
    if seed % 11 == 5:  # fallen leaf
        x, y = rnd.randrange(2, 12), rnd.randrange(2, 12)
        for dx in range(3):
            img.putpixel((x + dx, y + (dx == 1)), (150, 112, 50, 255))
    return img


def tile_fence():
    """Bamboo fence (wall face): vertical poles with node rings."""
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 15, 15], fill=(20, 30, 30))
    for i, x in enumerate((0, 4, 8, 12)):
        d.rectangle([x, 0, x + 2, 15], fill=PAL["Q"])
        d.line([(x + 2, 0), (x + 2, 15)], fill=PAL["q"])
        ny = 5 if i % 2 == 0 else 10
        d.line([(x, ny), (x + 2, ny)], fill=PAL["q"])
    d.rectangle([0, 3, 15, 3], fill=PAL["n"])   # lashing rail
    d.rectangle([0, 12, 15, 12], fill=PAL["n"])
    d.rectangle([0, 14, 15, 15], fill=(16, 22, 22))
    return img


def tile_hedge():
    """Dense foliage seen from above (wall top)."""
    rnd = random.Random(42)
    img = Image.new("RGBA", (16, 16), (24, 58, 40, 255))
    for _ in range(40):
        x, y = rnd.randrange(16), rnd.randrange(16)
        img.putpixel((x, y), rnd.choice([(34, 80, 52), (20, 46, 34), (44, 96, 60)]) + (255,))
    return img


def tile_pot():
    """Palayok: stacked clay pots (obstacle)."""
    return rows_to_img([
        "",
        "................",
        ".....nnnnnn.....",
        "....NOONNNNN....",
        "...NOONNNNNNN...",
        "...NONNNNNNNN...",
        "...NNNNNNNNNn...",
        "....yyyyyyyy....",
        "...NOONNNNNNN...",
        "..NOONNNNNNNNN..",
        "..NONNNNNNNNNN..",
        "..NNNNNNNNNNNn..",
        "..NNNNNNNNNNnn..",
        "...nNNNNNNNnn...",
        "....nnnnnnnn....",
    ])


def tile_stump():
    """Balete tree stump with roots (obstacle)."""
    return rows_to_img([
        "",
        "...nNNNNNNNNn...",
        "..nNyyyyyyyyNn..",
        "..NyNNNNNNNNyN..",
        "..NyNnnnnnnNyN..",
        "..NyNnNNNNnNyN..",
        "..NyNnnnnnnNyN..",
        "..nNyyyyyyyyNn..",
        "...nNNNNNNNNn...",
        "...nNNnNNnNNn...",
        "...nNNnNNnNNn...",
        "..nNNNnNNnNNNn..",
        ".nNNnNNNNNNnNNn.",
        ".nn.nnNNNNnn.nn.",
        "....n.nnnn.n....",
    ])


def tile_sulo(f):
    """Sulo: bamboo torch."""
    a, b = ("Y", "O") if f == 0 else ("O", "Y")
    return rows_to_img([
        "",
        "",
        f".......{a}........",
        f"......{a}{b}........",
        f"......{b}W{a}.......",
        f"......{a}{b}{a}.......",
        "......qQq.......",
        ".......Q........",
        ".......q........",
        ".......Q........",
        ".......Q........",
        ".......q........",
    ])


# ---------------------------------------------------------------- UI icons (8x8)
UI_ICONS = {
    "heart": (8, [
        ".RR.RR..",
        "RWRRRRR.",
        "RRRRRRR.",
        "RRRRRRR.",
        ".RRRRR..",
        "..RRR...",
        "...R....",
    ]),
    # anting-anting amulet = armor
    "shield": (8, [
        "...y....",
        "..yTy...",
        ".yTCTy..",
        "yTCVCTy.",
        ".yTCTy..",
        "..yTy...",
        "...y....",
    ]),
    # lantern flame = energy (light)
    "energy": (8, [
        "...Y....",
        "..YA....",
        "..AAY...",
        ".AOAAA..",
        ".AOOAA..",
        "..AOA...",
        "..yyy...",
    ]),
    "gem": (8, [
        "..CCCC..",
        ".CWVVCC.",
        "CCVVVCCt",
        ".tCVCCt.",
        "..tCCt..",
        "...tt...",
    ]),
    "skull": (8, [
        ".HHHHH..",
        "HHHHHHH.",
        "HEEHEEH.",
        "HEEHEEH.",
        "HHHEHHH.",
        ".HHHHH..",
        ".HEHEH..",
    ]),
    "star": (8, [
        "...A....",
        "...A....",
        "AAAYAAA.",
        ".AAAAA..",
        "..AAA...",
        ".AA.AA..",
        ".A...A..",
    ]),
    "moon": (8, [
        "..HHH...",
        ".HHh....",
        "HHh.....",
        "HHh.....",
        "HHh.....",
        ".HHh....",
        "..HHH...",
    ]),
}


def circle_img(size, fill, ring, alpha=255, ring_w=2):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    c = (size - 1) / 2
    for y in range(size):
        for x in range(size):
            r = math.hypot(x - c, y - c)
            if r <= c - ring_w + 0.3:
                px[x, y] = fill + (alpha,)
            elif r <= c + 0.3:
                px[x, y] = ring + (255,)
    return img


def diamond_img(size, fill, ring, alpha=210):
    """Buttons are diamond-cut (like a woven banig motif), not circles."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    c = (size - 1) / 2
    for y in range(size):
        for x in range(size):
            r = abs(x - c) + abs(y - c)
            if r <= c - 2.2:
                px[x, y] = fill + (alpha,)
            elif r <= c + 0.3:
                px[x, y] = ring + (255,)
    return img


def button(icon_rows, bg, ring, size=26):
    img = diamond_img(size, bg, ring)
    icon = rows_to_img(icon_rows, 16, 16)
    img.alpha_composite(icon, ((size - 16) // 2, (size - 16) // 2))
    return img


BTN_FIRE = [  # slingshot stone
    "", "", "",
    "......AAAA......",
    ".....AYYYAA.....",
    "....AYWYAAAA....",
    "....AYYAAAAA....",
    "....AAAAAAOA....",
    "....AAAAAOOA....",
    ".....AAOOOA.....",
    "......AAAA......",
]
BTN_SKILL = [  # lightning / spirit spark
    "",
    ".........CC.....",
    "........CC......",
    ".......CC.......",
    "......CCV.......",
    ".....CCVCCCC....",
    "....CCCCVCC.....",
    "........CC......",
    ".......CC.......",
    "......CC........",
    ".....CC.........",
    "....C...........",
]
BTN_SWAP = [
    "", "",
    "......WW........",
    ".....WWW........",
    "....WWWWWWWWWW..",
    ".....WWW........",
    "......WW........",
    "",
    "........WW......",
    "........WWW.....",
    "..WWWWWWWWWW....",
    "........WWW.....",
    "........WW......",
]
BTN_PAUSE = [
    "", "", "",
    ".....WW..WW.....",
    ".....WW..WW.....",
    ".....WW..WW.....",
    ".....WW..WW.....",
    ".....WW..WW.....",
    ".....WW..WW.....",
    ".....WW..WW.....",
]

# ---------------------------------------------------------------- display font (6x8, chunky)
FONT = {
    "A": ["011110", "110011", "110011", "111111", "110011", "110011", "110011"],
    "B": ["111110", "110011", "110011", "111110", "110011", "110011", "111110"],
    "D": ["111100", "110110", "110011", "110011", "110011", "110110", "111100"],
    "E": ["111111", "110000", "110000", "111110", "110000", "110000", "111111"],
    "F": ["111111", "110000", "110000", "111110", "110000", "110000", "110000"],
    "H": ["110011", "110011", "110011", "111111", "110011", "110011", "110011"],
    "K": ["110011", "110110", "111100", "111000", "111100", "110110", "110011"],
    "N": ["110011", "111011", "111111", "110111", "110011", "110011", "110011"],
    "R": ["111110", "110011", "110011", "111110", "111100", "110110", "110011"],
    "S": ["011111", "110000", "110000", "011110", "000011", "000011", "111110"],
    "T": ["111111", "001100", "001100", "001100", "001100", "001100", "001100"],
    "I": ["111111", "001100", "001100", "001100", "001100", "001100", "111111"],
    "U": ["110011", "110011", "110011", "110011", "110011", "110011", "011110"],
    "Y": ["110011", "110011", "011110", "001100", "001100", "001100", "001100"],
    "!": ["001100", "001100", "001100", "001100", "001100", "000000", "001100"],
    " ": ["000000"] * 7,
}


def text_img(text, scale, top, bottom, shadow=PAL["K"], depth=2):
    gw = 7  # glyph advance
    w = len(text) * gw * scale + 2
    h = 7 * scale + 2 + depth
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    for i, ch in enumerate(text):
        for gy, row in enumerate(FONT[ch]):
            for gx, bit in enumerate(row):
                if bit != "1":
                    continue
                for sy in range(scale):
                    for sx in range(scale):
                        x = 1 + i * gw * scale + gx * scale + sx
                        y = 1 + gy * scale + sy
                        t = (gy * scale + sy) / (7 * scale - 1)
                        c = tuple(int(top[k] + (bottom[k] - top[k]) * t) for k in range(3))
                        px[x, y] = c + (255,)
    base = img.copy()
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    deep = tuple(int(c * 0.45) for c in bottom)
    for dy in range(depth, 0, -1):  # extruded 3D edge
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        lp, bp = layer.load(), base.load()
        for y in range(h - dy):
            for x in range(w):
                if bp[x, y][3]:
                    lp[x, y + dy] = deep + (255,)
        out.alpha_composite(layer)
    out.alpha_composite(base)
    add_outline(out, shadow)
    return out


# ---------------------------------------------------------------- scene helpers (320x180)
def dither_gradient(img, top, bottom, y0, y1):
    px = img.load()
    bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    steps = 6
    cols = [tuple(int(top[k] + (bottom[k] - top[k]) * i / (steps - 1)) for k in range(3))
            for i in range(steps)]
    for y in range(y0, y1):
        t = (y - y0) / max(1, (y1 - y0 - 1)) * (steps - 1)
        i = int(t)
        frac = t - i
        for x in range(img.width):
            j = i + (1 if frac * 16 > bayer[y % 4][x % 4] else 0)
            px[x, y] = cols[min(j, steps - 1)] + (255,)


def stars(img, n, seed, y_max):
    rnd = random.Random(seed)
    px = img.load()
    for _ in range(n):
        x, y = rnd.randrange(img.width), rnd.randrange(y_max)
        px[x, y] = rnd.choice([(255, 255, 240), (190, 240, 230), (255, 230, 170)]) + (255,)


def glow_disc(img, cx, cy, r, color, rings=((10, 26), (6, 44), (3, 70))):
    for gr, a in rings:
        g = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(g).ellipse([cx - r - gr, cy - r - gr, cx + r + gr, cy + r + gr], fill=color + (a,))
        img.alpha_composite(g)


def moon(img, cx, cy, r, color=(240, 236, 206), shade=(206, 200, 168)):
    glow_disc(img, cx, cy, r, color)
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    for (ox, oy, cr) in ((-8, -5, 5), (6, 4, 4), (-3, 10, 3), (10, -9, 2)):
        d.ellipse([cx + ox - cr, cy + oy - cr, cx + ox + cr, cy + oy + cr], fill=shade)


def serpent_arc(img, cx, cy, r, a0, a1, width, color, fin):
    """A coiling Bakunawa body drawn as thick dots along an arc."""
    d = ImageDraw.Draw(img)
    steps = int(abs(a1 - a0) * r)
    for i in range(steps):
        a = a0 + (a1 - a0) * i / steps
        x, y = cx + math.cos(a) * r, cy + math.sin(a) * r
        w = width * (0.45 + 0.55 * math.sin(math.pi * i / steps))
        d.ellipse([x - w, y - w, x + w, y + w], fill=color)
        if i % 9 == 0:
            d.polygon([(x, y - w), (x - 3, y - w - 4), (x + 2, y - w)], fill=fin)
    return cx + math.cos(a1) * r, cy + math.sin(a1) * r


def palm(img, x, base, h, color, lean=1):
    d = ImageDraw.Draw(img)
    top = (x + lean * 8, base - h)
    for i in range(h):  # curved trunk
        t = i / h
        tx = x + lean * 8 * t * t
        d.rectangle([tx, base - i, tx + 2, base - i], fill=color)
    tx, ty = top
    for ang in (-2.6, -2.0, -1.2, -0.5, 0.2, 0.7):  # fronds
        for j in range(16):
            fx = tx + math.cos(ang) * j * 1.2
            fy = ty + math.sin(ang) * j * 0.9 + (j * j) * 0.035
            d.rectangle([fx, fy, fx + 1, fy + 1], fill=color)


def nipa_hut(img, x, base, w, color, window):
    """Bahay kubo on stilts with a steep thatched roof."""
    d = ImageDraw.Draw(img)
    h = w * 0.55
    floor = base - w * 0.32
    for sx in (x + 2, x + w // 2, x + w - 4):  # stilts
        d.rectangle([sx, floor, sx + 1, base], fill=color)
    d.rectangle([x, floor - h, x + w, floor], fill=color)
    d.polygon([(x - 6, floor - h + 2), (x + w / 2, floor - h - w * 0.55), (x + w + 6, floor - h + 2)], fill=color)
    d.rectangle([x + w * 0.3, floor - h * 0.7, x + w * 0.3 + 4, floor - h * 0.7 + 4], fill=window)
    d.rectangle([x + w * 0.62, floor - h * 0.7, x + w * 0.62 + 4, floor - h * 0.7 + 4], fill=window)
    # ladder
    d.line([(x + w * 0.45, floor), (x + w * 0.4, base)], fill=color)
    d.line([(x + w * 0.55, floor), (x + w * 0.5, base)], fill=color)


def fireflies(img, n, seed, y0, y1, color=(200, 255, 140)):
    rnd = random.Random(seed)
    px = img.load()
    for _ in range(n):
        x, y = rnd.randrange(img.width), rnd.randrange(y0, y1)
        px[x, y] = color + (255,)
        if rnd.random() < 0.4 and x + 1 < img.width:
            px[x + 1, y] = tuple(c // 2 for c in color) + (255,)


def ground(img, y, top, body, seed):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(img)
    d.rectangle([0, y, img.width, img.height], fill=body)
    for x in range(img.width):
        gh = rnd.choice([0, 1, 1, 2, 3, 4])
        d.line([(x, y - gh), (x, y + 1)], fill=top)


# ---------------------------------------------------------------- screens
def title_bg():
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (6, 18, 30), (22, 70, 86), 0, 180)
    stars(img, 120, 1, 110)
    moon(img, 222, 58, 30)
    # the Bakunawa coiling around the moon, mouth open toward it
    body = (40, 118, 118)
    serpent_arc(img, 222, 58, 43, 2.4, 5.6, 6, (16, 50, 56), (150, 36, 36))  # shadow side
    hx, hy = serpent_arc(img, 222, 57, 42, 2.4, 5.6, 5, body, (196, 52, 44))
    d = ImageDraw.Draw(img)
    # head with open jaws closing in on the moon
    d.polygon([(hx - 8, hy - 6), (hx + 14, hy), (hx + 6, hy + 5), (hx - 6, hy + 6)], fill=body)
    d.polygon([(hx + 2, hy + 7), (hx + 16, hy + 12), (hx - 4, hy + 11)], fill=(30, 92, 94))
    d.polygon([(hx + 4, hy + 5), (hx + 14, hy + 2), (hx + 14, hy + 11)], fill=(120, 24, 30))
    d.line([(hx - 6, hy - 6), (hx - 10, hy - 13)], fill=PAL["H"])
    d.line([(hx - 2, hy - 5), (hx - 3, hy - 12)], fill=PAL["H"])
    d.rectangle([hx + 1, hy - 3, hx + 2, hy - 2], fill=PAL["X"])
    # far hills, palms, huts
    for x in range(320):
        hh = 8 * math.sin(x * 0.03 + 1) + 4 * math.sin(x * 0.08)
        d.line([(x, 136 - hh), (x, 180)], fill=(12, 36, 44))
    for px_, h, lean in ((18, 52, 1), (44, 64, -1), (282, 58, -1), (300, 44, 1), (150, 40, 1)):
        palm(img, px_, 154, h, (8, 22, 26), lean)
    nipa_hut(img, 70, 156, 34, (10, 26, 30), (255, 196, 90))
    nipa_hut(img, 196, 156, 28, (10, 26, 30), (255, 196, 90))
    ground(img, 154, (20, 60, 42), (8, 20, 22), 5)
    fireflies(img, 30, 9, 110, 170)
    return img


def select_bg():
    """Inside a bahay kubo: woven sawali walls, bamboo slat floor, gasera lamps."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    px = img.load()
    for y in range(0, 116):
        for x in range(320):
            cell = ((x // 4) + (y // 4)) % 2
            band = (y % 4 == 0) if cell else (x % 4 == 0)
            c = (112, 92, 52) if cell else (128, 106, 60)
            if band:
                c = (78, 62, 36)
            px[x, y] = c + (255,)
    d = ImageDraw.Draw(img)
    for x in range(0, 320, 64):  # posts
        d.rectangle([x, 0, x + 5, 116], fill=PAL["n"])
        d.line([(x + 5, 0), (x + 5, 116)], fill=(60, 36, 20))
    for y in range(116, 180, 6):  # floor slats
        d.rectangle([0, y, 320, y + 4], fill=PAL["q"])
        d.line([(0, y + 5), (320, y + 5)], fill=(70, 66, 30))
    # capiz window with the night outside
    d.rectangle([128, 14, 192, 70], fill=PAL["n"])
    for gy in range(3):
        for gx in range(4):
            x0, y0 = 132 + gx * 15, 18 + gy * 17
            d.rectangle([x0, y0, x0 + 12, y0 + 14], fill=(30, 80, 96))
    d.ellipse([170, 22, 182, 34], fill=(240, 236, 206))
    # hanging gasera lamps with warm glow
    for lx in (52, 268):
        g = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(g).ellipse([lx - 40, 2, lx + 40, 82], fill=(255, 180, 80, 46))
        img.alpha_composite(g)
        d.line([(lx, 0), (lx, 26)], fill=(40, 30, 20))
        d.rectangle([lx - 4, 26, lx + 4, 36], fill=PAL["y"])
        d.rectangle([lx - 2, 28, lx + 2, 33], fill=PAL["Y"])
    # vignette
    vign = Image.new("RGBA", img.size, (0, 0, 0, 0))
    vp = vign.load()
    for y in range(180):
        for x in range(320):
            dx, dy = (x - 160) / 160, (y - 90) / 90
            vp[x, y] = (6, 12, 16, max(0, min(180, int((dx * dx + dy * dy - 0.4) * 230))))
    img.alpha_composite(vign)
    return img


def defeat_bg():
    """The moon is swallowed: black disc with a blood-red rim over the barrio."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (8, 4, 8), (70, 16, 20), 0, 180)
    stars(img, 40, 11, 90)
    glow_disc(img, 160, 54, 26, (200, 40, 40), ((14, 30), (8, 50), (3, 90)))
    d = ImageDraw.Draw(img)
    d.ellipse([134, 28, 186, 80], fill=(10, 6, 8))
    serpent_arc(img, 160, 54, 34, 0.3, 2.9, 4, (24, 8, 12), (90, 20, 24))
    for x in range(320):
        hh = 6 * math.sin(x * 0.04 + 2)
        d.line([(x, 140 - hh), (x, 180)], fill=(26, 8, 12))
    for px_, h, lean in ((30, 50, 1), (270, 60, -1), (300, 40, 1)):
        palm(img, px_, 152, h, (14, 4, 8), lean)
    nipa_hut(img, 90, 154, 30, (16, 6, 10), (60, 20, 20))
    nipa_hut(img, 200, 154, 34, (16, 6, 10), (60, 20, 20))
    ground(img, 152, (36, 14, 18), (12, 4, 8), 13)
    return img


def dawn_bg():
    """Dawn over the rice terraces."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (40, 62, 110), (255, 178, 104), 0, 120)
    glow_disc(img, 160, 104, 22, (255, 220, 140), ((22, 30), (12, 50), (5, 90)))
    d = ImageDraw.Draw(img)
    d.ellipse([138, 82, 182, 126], fill=(255, 236, 170))
    for x in range(320):  # mountain
        hh = 26 * math.exp(-((x - 80) / 70) ** 2) + 18 * math.exp(-((x - 250) / 60) ** 2)
        d.line([(x, 112 - hh), (x, 180)], fill=(70, 88, 104))
    # terraces: stacked curved bands, lighter on top edges
    cols = [(64, 130, 72), (78, 150, 80), (92, 166, 88), (70, 140, 76), (84, 158, 84), (98, 172, 92)]
    for i in range(6):
        y0 = 112 + i * 11
        for x in range(320):
            yy = y0 + int(3 * math.sin(x * 0.03 + i))
            d.line([(x, yy), (x, 180)], fill=cols[i])
            d.point((x, yy), fill=(150, 210, 130))
            if i % 2 == 0 and x % 2 == 0:
                d.point((x, yy + 2), fill=(170, 200, 220))  # water glint
    palm(img, 20, 150, 50, (40, 70, 56), 1)
    palm(img, 296, 150, 56, (40, 70, 56), -1)
    rnd = random.Random(23)
    for _ in range(14):  # birds
        x, y = rnd.randrange(40, 280), rnd.randrange(20, 70)
        d.point([(x, y), (x + 1, y - 1), (x + 2, y), (x + 3, y - 1), (x + 4, y)], fill=(60, 50, 70))
    return img


# ---------------------------------------------------------------- rooms
ROOM_W, ROOM_H = 22, 13  # tiles
FLOOR, WALL, CRATE, PILLAR = 0, 1, 2, 3


def make_layout(seed, kind):
    rnd = random.Random(seed)
    g = [[FLOOR] * ROOM_W for _ in range(ROOM_H)]
    for y in range(ROOM_H):
        for x in range(ROOM_W):
            if x == 0 or y < 2 or x == ROOM_W - 1 or y == ROOM_H - 1:
                g[y][x] = WALL
    cx, cy = ROOM_W // 2, ROOM_H // 2 + 1

    def free(x, y):
        # keep spawn lane (left) and the gate + reward chest area clear
        if x <= 3 or (cx - 1 <= x <= cx + 4 and abs(y - cy) <= 1) or (y == cy and x < cx):
            return False
        return 2 < y < ROOM_H - 2 and 1 < x < ROOM_W - 2

    if kind == "boss":
        for (x, y) in ((4, 4), (17, 4), (4, 10), (17, 10)):
            g[y][x] = PILLAR
    elif kind == "start":
        for (x, y) in ((7, 4), (15, 4), (7, 10), (15, 10)):
            g[y][x] = PILLAR
    else:
        for _ in range(rnd.randint(3, 5)):
            x, y = rnd.randrange(4, ROOM_W - 3), rnd.randrange(3, ROOM_H - 2)
            t = rnd.choice([CRATE, CRATE, PILLAR])
            shape = rnd.choice([[(0, 0), (1, 0)], [(0, 0), (0, 1)], [(0, 0), (1, 0), (0, 1), (1, 1)],
                                [(0, 0)], [(0, 0), (1, 0), (2, 0)]])
            for dx, dy in shape:
                if free(x + dx, y + dy):
                    g[y + dy][x + dx] = t
    return g


def render_room(g, seed, kind):
    rnd = random.Random(seed)
    img = Image.new("RGBA", (ROOM_W * 16, ROOM_H * 16), (0, 0, 0, 255))
    fence, hedge = tile_fence(), tile_hedge()
    pot, stump = tile_pot(), tile_stump()
    for y in range(ROOM_H):
        for x in range(ROOM_W):
            t = g[y][x]
            pos = (x * 16, y * 16)
            if t == WALL:
                below_floor = y + 1 < ROOM_H and g[y + 1][x] != WALL
                img.alpha_composite(fence if below_floor else hedge, pos)
            else:
                img.alpha_composite(tile_floor(rnd.randrange(1000)), pos)
                if t == CRATE:
                    img.alpha_composite(pot, pos)
                elif t == PILLAR:
                    img.alpha_composite(stump, pos)
    for x in (5, ROOM_W // 2, ROOM_W - 6):
        img.alpha_composite(tile_sulo(0), (x * 16, 16 - 2))
    fx = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    d.rectangle([16, 32, ROOM_W * 16 - 17, 34], fill=(0, 0, 0, 80))
    if kind == "boss":  # moonlight pool + shoreline water at the boss lair
        d.ellipse([110, 70, 250, 170], fill=(150, 230, 220, 26))
        d.rectangle([16, ROOM_H * 16 - 30, ROOM_W * 16 - 17, ROOM_H * 16 - 17], fill=(40, 120, 140, 70))
    img.alpha_composite(fx)
    return img


# ---------------------------------------------------------------- app icon / splash / brand
def hero_frame(name, f):
    h = HEROES[name]
    return rows_to_img(h["body"] + [h["legs"][f]])


def app_icon():
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    img.alpha_composite(diamond_img(32, (16, 46, 56), PAL["A"], alpha=255))
    d = ImageDraw.Draw(img)
    d.ellipse([18, 6, 25, 13], fill=(240, 236, 206))
    img.alpha_composite(hero_frame("kidlat", 0), (8, 10))
    return img


def brand_sheet():
    """One-page brand reference: logo, tagline swatches, cast lineup."""
    W, H = 320, 200
    img = Image.new("RGBA", (W, H), (10, 24, 30, 255))
    d = ImageDraw.Draw(img)
    logo = text_img("BANTAY", 3, (255, 232, 130), (226, 96, 40))
    img.alpha_composite(logo, ((W - logo.width) // 2, 10))
    # palette swatches
    sw = [("K", "night"), ("t", "deep teal"), ("T", "teal"), ("C", "spirit"), ("A", "lantern"),
          ("O", "flame"), ("R", "putong red"), ("Q", "bamboo"), ("G", "leaf"), ("N", "narra")]
    for i, (k, _) in enumerate(sw):
        x = 20 + i * 28
        d.rectangle([x, 44, x + 22, 58], fill=PAL[k])
        d.rectangle([x, 44, x + 22, 58], outline=(0, 0, 0))
    # guardians
    for i, name in enumerate(HEROES):
        img.alpha_composite(up(hero_frame(name, 0), 3), (16 + i * 52, 72))
    # creatures
    for i, name in enumerate(ENEMIES):
        img.alpha_composite(up(rows_to_img(ENEMIES[name][0]), 2), (20 + i * 40, 140))
    img.alpha_composite(up(bakunawa_frame(1), 2), (236, 118))
    return img


# ---------------------------------------------------------------- main
def main():
    for name in HEROES:
        for f in range(2):
            save(hero_frame(name, f), f"sprites/heroes/{name}_{f}.png")
    for name, frames in ENEMIES.items():
        for f, rows in enumerate(frames):
            save(rows_to_img(rows), f"sprites/enemies/{name}_{f}.png")
    for f in range(2):
        save(bakunawa_frame(f), f"sprites/enemies/bakunawa_{f}.png")
    for name, rows in WEAPONS.items():
        save(rows_to_img(rows), f"sprites/weapons/{name}.png")
    for name, rows in PROJECTILES.items():
        save(rows_to_img(rows, 8, 8, outline=False), f"sprites/projectiles/{name}.png")
    for name, rows in ITEMS.items():
        save(rows_to_img(rows), f"sprites/items/{name}.png")
    for f in range(4):
        save(gate_frame(f), f"sprites/items/gate_{f}.png")
    save(tile_floor(0), "sprites/tiles/ground_0.png")
    save(tile_floor(3), "sprites/tiles/ground_1.png")
    save(tile_floor(5), "sprites/tiles/ground_2.png")
    save(tile_fence(), "sprites/tiles/fence.png")
    save(tile_hedge(), "sprites/tiles/hedge.png")
    save(tile_pot(), "sprites/tiles/palayok.png")
    save(tile_stump(), "sprites/tiles/stump.png")
    for f in range(2):
        save(tile_sulo(f), f"sprites/tiles/sulo_{f}.png")
    for name, (sz, rows) in UI_ICONS.items():
        save(rows_to_img(rows, sz, sz), f"ui/{name}.png")
    save(circle_img(48, (14, 34, 40), (90, 150, 140), alpha=140, ring_w=2), "ui/joystick_base.png", 4)
    save(diamond_img(22, (230, 214, 170), (120, 90, 50), alpha=235), "ui/joystick_knob.png", 4)
    save(button(BTN_FIRE, (120, 56, 20), PAL["A"]), "ui/btn_fire.png", 4)
    save(button(BTN_SKILL, (16, 70, 76), PAL["C"]), "ui/btn_skill.png", 4)
    save(button(BTN_SWAP, (30, 44, 48), (150, 170, 160)), "ui/btn_swap.png", 4)
    save(button(BTN_PAUSE, (30, 44, 48), (150, 170, 160), size=22), "ui/btn_pause.png", 4)
    save(title_bg(), "screens/title_bg.png", SCREEN_SCALE)
    save(select_bg(), "screens/select_bg.png", SCREEN_SCALE)
    save(defeat_bg(), "screens/gameover_bg.png", SCREEN_SCALE)
    save(dawn_bg(), "screens/victory_bg.png", SCREEN_SCALE)
    save(text_img("BANTAY", 4, (255, 232, 130), (226, 96, 40), depth=3), "screens/logo.png", 4)
    save(text_img("DEFEATED", 3, (255, 130, 110), (150, 24, 34)), "screens/gameover_text.png", 4)
    save(text_img("SUNRISE!", 3, (255, 248, 200), (240, 150, 50)), "screens/victory_text.png", 4)
    save(brand_sheet(), "brand/brand_sheet.png", 4)

    layouts = {}
    plan = [("start", "start", 100), ("room_a", "combat", 211), ("room_b", "combat", 212),
            ("room_c", "combat", 213), ("room_d", "combat", 214), ("room_e", "combat", 215),
            ("boss", "boss", 300)]
    for name, kind, seed in plan:
        g = make_layout(seed, kind)
        layouts[name] = {"kind": kind, "grid": g}
        save(render_room(g, seed, kind), f"rooms/{name}.png", ROOM_SCALE)
    with open(os.path.join(ROOT, "src", "game", "rooms.json"), "w") as fh:
        json.dump({"tile": 16, "width": ROOM_W, "height": ROOM_H, "rooms": layouts}, fh)

    icon = app_icon()
    up(icon, 32).save(os.path.join(ASSETS, "icon.png"))
    fg = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    fg.alpha_composite(hero_frame("kidlat", 0), (8, 8))
    up(fg, 32).save(os.path.join(ASSETS, "android-icon-foreground.png"))
    bgi = Image.new("RGBA", (32, 32), (16, 46, 56, 255))
    stars(bgi, 10, 7, 32)
    ImageDraw.Draw(bgi).ellipse([22, 3, 28, 9], fill=(240, 236, 206))
    up(bgi, 32).save(os.path.join(ASSETS, "android-icon-background.png"))
    mono = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    kp = hero_frame("kidlat", 0).load()
    for y in range(16):
        for x in range(16):
            if kp[x, y][3]:
                mono.putpixel((x + 8, y + 8), (255, 255, 255, 255))
    up(mono, 32).save(os.path.join(ASSETS, "android-icon-monochrome.png"))
    up(icon, 8).save(os.path.join(ASSETS, "favicon.png"))
    splash = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    splash.alpha_composite(up(hero_frame("kidlat", 0), 2), (16, 12))
    up(splash, 16).save(os.path.join(ASSETS, "splash-icon.png"))

    contact_sheet()
    write_registry()
    print(f"generated {len(MANIFEST)} assets")


def contact_sheet():
    cell, cols = 72, 12
    small = [(r, i) for r, i in MANIFEST if i.width <= 32]
    big = [i for r, i in MANIFEST if i.width > 32 and not r.startswith("brand")]
    rows = math.ceil(len(small) / cols)
    W = cols * cell
    layout, x, y, rowh = [], 0, 0, 0
    for im in big:
        im = up(im, 4) if im.width < 300 else im
        if im.width < 400:
            im = up(im, 2)
        if im.width > W:
            im = im.resize((W, int(im.height * W / im.width)), Image.NEAREST)
        if x + im.width > W:
            x, y, rowh = 0, y + rowh + 6, 0
        layout.append((im, x, y))
        x += im.width + 6
        rowh = max(rowh, im.height)
    sheet = Image.new("RGBA", (W, rows * cell + y + rowh + 14), (10, 24, 30, 255))
    for i, (_, im) in enumerate(small):
        s = 6 if im.width <= 8 else 4 if im.width <= 16 else 2
        t = up(im, s)
        sheet.alpha_composite(t, ((i % cols) * cell + (cell - t.width) // 2, (i // cols) * cell + (cell - t.height) // 2))
    for im, bx, by in layout:
        sheet.alpha_composite(im, (bx, rows * cell + 8 + by))
    sheet.save(os.path.join(ASSETS, "preview.png"))


def write_registry():
    """Emit src/assets.ts with static requires (Metro needs literal paths)."""
    groups = {}
    for root, _, files in os.walk(ASSETS):
        for f in sorted(files):
            rel = os.path.relpath(os.path.join(root, f), ASSETS).split(os.sep)
            if f.endswith(".png") and len(rel) >= 2 and rel[0] != "brand":
                groups.setdefault("/".join(rel[:-1]), []).append(f)
    out = ["// AUTO-GENERATED by tools/generate_assets.py - do not edit.", "", "export const IMG = {"]
    for g in sorted(groups):
        prefix = "screen" if g == "screens" else g.split("/")[-1]
        for f in sorted(groups[g]):
            out.append(f"  {prefix}_{f[:-4]}: require('../assets/{g}/{f}'),")
    out += ["} as const;", "", "export type ImgKey = keyof typeof IMG;", ""]
    with open(os.path.join(ROOT, "src", "assets.ts"), "w") as fh:
        fh.write("\n".join(out))


if __name__ == "__main__":
    main()
