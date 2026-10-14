#!/usr/bin/env python3
"""MAHARLIKA asset generator.

Maharlika is a roguelike set in an archipelago that was never colonized. Every piece of
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
    assets/story/**      illustrated story panels (intro + ending)
    assets/portraits/**  32x32 dialogue portraits
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
    # Banog: bagani (proven warrior) of Bukidnon, red tangkulo headcloth with a hawk feather
    "banog": {
        "body": [
            "..........W.....",
            ".........WH.....",
            "....RRRRRRRR....",
            "...RRrRRRrRRR...",
            "...nnfffffffn...",
            "...nfEfffEffn...",
            "...nffffffffn...",
            "....ffffrfff....",
            ".....ffffff.....",
            "...RRDDDDDDRR...",
            "..RrDDyDDyDDrR..",
            "..fRDDDDDDDDRf..",
            "...RDDyyyyDDR...",
            "....DDDDDDDD....",
        ],
        "legs": ["....ff....ff....", ".....ff..ff....."],
    },
    # Dalisay: pearl diver of Sulu, teal kumbong veil, pearl string, patterned malong
    "dalisay": {
        "body": [
            "................",
            ".....TTTTTT.....",
            "....TTTTTTTT....",
            "...TTtTTTTtTT...",
            "...TTFFFFFFTT...",
            "...TFEFFFFEFT...",
            "...TFFFFFFFFT...",
            "...TTFFMMFFTT...",
            "....tWHWHWHt....",
            "...BBBBBBBBBB...",
            "..BBYBBYBBYBBB..",
            "..FBBBBBBBBBBF..",
            "...BYBBYBBYBB...",
            "...bbbbbbbbbb...",
        ],
        "legs": ["....FF....FF....", ".....FF..FF....."],
    },
}

# ---------------------------------------------------------------- guardian animation
# Every guardian gets a full set of poses built from the same pixel map, so the
# moves stay on-model: idle breathing, a 4-step walk, a two-beat attack, a tucked
# dodge roll and a hurt recoil. All frames face right; the game mirrors them.
def leg_char(name):
    return next(c for c in HEROES[name]["legs"][0] if c != ".")


def body_img(name, legs):
    h = HEROES[name]
    return rows_to_img(h["body"] + [legs], outline=False)


def offset(img, dx=0, dy=0):
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.alpha_composite(img, (max(dx, 0), max(dy, 0)), (max(-dx, 0), max(-dy, 0)))
    return out


def lift_top(img, y_split, dy):
    """Move the rows above `y_split` by `dy` (a breath or a step bob), keep the legs planted."""
    out = img.copy()
    top = img.crop((0, 0, img.width, y_split))
    ImageDraw.Draw(out).rectangle([0, 0, img.width, y_split - 1 + max(dy, 0)], fill=(0, 0, 0, 0))
    out.alpha_composite(top, (0, dy))
    return out


def recolor(img, fn):
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            p = px[x, y]
            if p[3]:
                px[x, y] = fn(p[:3]) + (p[3],)
    return out


def hero_pose(name, pose, f):
    c = leg_char(name)
    stand = HEROES[name]["legs"][0]
    if pose == "idle":
        img = body_img(name, stand)
        if f == 1:
            img = lift_top(img, 9, 1)            # shoulders drop on the out-breath
    elif pose == "walk":
        strides = [f"...{c}{c}.....{c}{c}....", HEROES[name]["legs"][1],
                   f"....{c}{c}.....{c}{c}...", f"......{c}{c}{c}{c}......"]
        img = body_img(name, strides[f])
        if f % 2 == 1:                           # body rises on the passing step, legs stretch
            img = offset(img, 0, -1)
            ImageDraw.Draw(img).rectangle([0, 14, 15, 14], fill=(0, 0, 0, 0))
            img.alpha_composite(rows_to_img([""] * 14 + [strides[f]], outline=False))
    elif pose == "attack":
        if f == 0:                               # wind up: weight on the back foot
            img = offset(body_img(name, f"..{c}{c}.....{c}{c}....."), -1, 0)
        else:                                    # strike: lunge, lead arm thrown out
            img = offset(body_img(name, f"...{c}{c}......{c}{c}.."), 1, 0)
            d = ImageDraw.Draw(img)
            d.point([(15, 10), (15, 11)], fill=PAL["F"])
    elif pose == "roll":
        ball = body_img(name, stand).resize((12, 12), Image.NEAREST)
        img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
        img.alpha_composite(ball, (2, 3))
        img = img.rotate(-90 * f, resample=Image.NEAREST, center=(8, 9))
    elif pose == "hurt":
        img = offset(body_img(name, f".{c}{c}......{c}{c}....."), -1, 1)
        img = recolor(img, lambda p: (min(255, p[0] + 45), int(p[1] * 0.82), int(p[2] * 0.82)))
    else:
        raise ValueError(pose)
    return add_outline(img)


HERO_POSES = {"idle": 2, "walk": 4, "attack": 2, "roll": 4, "hurt": 1}

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


# Tiyanak: lures travelers as a crying infant, then shows its true form
TIYANAK_BABY = [
    "", "", "", "", "",
    "......FFFF......",
    ".....FFFFFF.....",
    ".....FEFFEF.....",
    ".....FFffFF.....",
    "....wwFFFFww....",
    "...wwwwwwwwww...",
    "...wwWwwwwWww...",
    "...wwwwwwwwww...",
    "....wwwwwwww....",
    ".....wwwwww.....",
]
TIYANAK = [
    "", "", "",
    "......ssss......",
    ".....ssssss.....",
    "....sXsssXss....",
    "....ssssssss....",
    "....sWsWsWss....",
    ".....ssssss.....",
    "...ssssssssss...",
    "..s.ssssssss.s..",
    "..W.ssssssss.W..",
    ".....ssssss.....",
    ".....ss..ss.....",
    ".....WW..WW.....",
]

# Sigbin: walks backward, head hung low between its hind legs; unseen until close
SIGBIN = [
    "", "", "",
    "............nD..",
    "...........nD...",
    "...nnnnnnnnnD...",
    "..nNNNNNNNNNn...",
    ".nNNNNNNNNNNNn..",
    ".nNnNNNNNNNNn...",
    "DD.nN.....nNn...",
    "DnD.nN....nN....",
    ".nXn.N....N.....",
    "..nn.kk...kk....",
]

# Santelmo: a wandering ball of fire, said to be a lost soul
SANTELMO = [
    "", "",
    ".......Y........",
    "......YAY.......",
    ".....YAOAY......",
    "....YAOOOAY.....",
    "...YAOOROOAY....",
    "...YAORRROAY....",
    "...YAOORROAY....",
    "....YAOOOAY.....",
    ".....YAAAY......",
    "......YYY.......",
]
SANTELMO_FLICKER = [
    "", "",
    "........Y.......",
    ".......YAY......",
    "......YAOAY.....",
    "....YYAOOAY.....",
    "...YAOOROOAY....",
    "...YAORRROAY....",
    "...YAOORROAY....",
    "....YAOOOAY.....",
    ".....YAAAY......",
    "......YYY.......",
]

# Bungisngis: the one-eyed giant who never stops laughing
BUNGISNGIS = [
    "",
    "....DDDDDDDD....",
    "...DFFFFFFFFD...",
    "...FFFWWWWFFF...",
    "...FFWWEEWWFF...",
    "...FFFWWWWFFF...",
    "...FFFFFFFFFF...",
    "...FrrrrrrrrF...",
    "...FrWrWWrWrF...",
    "...FFrrrrrrFF...",
    "..FFNNNNNNNNFF..",
    ".FF.NNNNNNNN.FF.",
    ".FF.NNyyyyNN.FF.",
    "....NNNNNNNN....",
    "....FF....FF....",
    "....nn....nn....",
]
BUNGISNGIS_LAUGH = [
    "",
    "....DDDDDDDD....",
    "...DFFFFFFFFD...",
    "...FFFWWWWFFF...",
    "...FFWWEEWWFF...",
    "...FFFFFFFFFF...",
    "...FrrrrrrrrF...",
    "...FrWrWWrWrF...",
    "...FrrrrrrrrF...",
    "...FFrrrrrrFF...",
    "..FFNNNNNNNNFF..",
    "FF..NNNNNNNN..FF",
    "FF..NNyyyyNN..FF",
    "....NNNNNNNN....",
    "...FF......FF...",
    "...nn......nn...",
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
    "tiyanak": [TIYANAK, with_legs(TIYANAK, "....WW....WW....")],
    "sigbin": [SIGBIN, with_legs(SIGBIN, "..nn..kk.kk.....")],
    "santelmo": [SANTELMO, SANTELMO_FLICKER],
    "bungisngis": [BUNGISNGIS, BUNGISNGIS_LAUGH],
}
# extra single-frame looks (the tiyanak's disguise)
ENEMY_EXTRA = {"tiyanak_baby": TIYANAK_BABY}


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
# Each maharlika carries one signature weapon from the islands' own arsenal.
WEAPONS = {
    # kampilan: long single-edged sword with the forked tip, Lapulapu's blade (melee)
    "kampilan": [
        "", "", "", "", "",
        "............S.S.",
        ".nyySSSSSSSSSWS.",
        ".nyywwwwwwwwwS..",
        "..y.............",
    ],
    # pana: bow with a nocked arrow
    "pana": [
        "",
        "........NN......",
        "........wNN.....",
        "........w.NN....",
        "........w..N....",
        "........w..N....",
        "..QQQQQQQQQNS...",
        "........w..N....",
        "........w..N....",
        "........w.NN....",
        "........wNN.....",
        "........NN......",
    ],
    # agimat: anting-anting amulet rod, piercing spirit orbs
    "agimat": [
        "", "", "", "", "",
        "...........CC...",
        "..nnnnNNNNCVVC..",
        "..nNNNNNNNCVVC..",
        "...........CC...",
    ],
    # sumpit: blowgun with poisoned darts
    "sumpit": [
        "", "", "", "", "", "",
        ".qQQQqQQQQqQQQQ.",
        ".qqqqqqqqqqqqqq.",
    ],
    # kris: the wavy-bladed dagger-sword of Mindanao and Sulu (fast melee)
    "kris": [
        "", "", "", "", "",
        ".......SS...SS..",
        ".nyyySSWSSSSWSW.",
        "..y.SS...SS.....",
    ],
    # bangkaw: a throwing spear with a leaf-shaped iron head
    "bangkaw": [
        "", "", "", "", "", "",
        "............SS..",
        "nnNNNNNNNNNySSWS",
        "............SS..",
    ],
    # lingganay: the babaylan's bronze bell; its ring scatters spirits
    "lingganay": [
        "", "", "", "",
        "...........yy...",
        ".........yyAAy..",
        "..nnNNNyyAAAAAy.",
        "..nNNNNyyAAYAAy.",
        ".........yyAAy..",
        "...........yy...",
    ],
    # panabas: heavy, wide-bladed chopping sword of Mindanao (slow, wide melee)
    "panabas": [
        "", "", "", "",
        "..........SSSS..",
        ".........SSSSWS.",
        ".nnyyNNNSSSSSS..",
        ".nnyyNNN........",
    ],
    # balaraw: a short double-edged dagger (very fast, short melee)
    "balaraw": [
        "", "", "", "", "", "",
        "........SS......",
        "..nnyySSSSWS....",
        "........SS......",
    ],
    # baston: rattan sticks of arnis / eskrima (fast melee that knocks foes back)
    "baston": [
        "", "", "", "",
        "............Q...",
        "..........QQ....",
        "........QQ......",
        "......qQ........",
        "....qQ.....QQ...",
        "..qQ.....QQ.....",
        ".......QQ.......",
        ".....qQ.........",
        "...qQ...........",
    ],
    # buntot pagi: stingray-tail whip; the barbs carry venom (long, narrow melee)
    "buntot_pagi": [
        "", "", "", "", "", "",
        ".nn.............",
        ".nnshshshshshsh.",
        "...............s",
    ],
    # lantaka: a small bronze swivel cannon, carried on Sulu and Moro boats
    "lantaka": [
        "", "", "", "",
        "........yy......",
        "..yyyyyyyyyyyyy.",
        ".yAAYAAAAAAAAAyk",
        ".yAAAAAAAAAAAAyk",
        "..yyyyyyyyyyyyy.",
        "....nn..........",
        "...nnnn.........",
    ],
    # barang: a bamboo tube of spirit beetles, the sorcery Siquijor is feared for
    "barang": [
        "", "", "", "", "",
        "..........gGg...",
        ".qQQQQQqnnGgGg..",
        ".qqqqqqqnnGGGg..",
        "..........gGg...",
    ],
}

# ---------------------------------------------------------------- shots (8x8, drawn pointing right)
PROJECTILES = {
    "shot_arrow": [
        "........",
        "........",
        "........",
        "RqQQQQSW",
        "........",
    ],
    "shot_spirit": [
        "........",
        "..CCC...",
        ".CVVVC..",
        ".CVWVC..",
        ".CVVVC..",
        "..CCC...",
    ],
    "shot_dart": [
        "........",
        "........",
        "........",
        ".gGGGSW.",
        "........",
    ],
    "shot_spear": [
        "........",
        "........",
        "......S.",
        "nNNNNySW",
        "......S.",
    ],
    "shot_chime": [
        "........",
        "..AAA...",
        ".A...A..",
        ".A.Y.A..",
        ".A...A..",
        "..AAA...",
    ],
    "shot_beetle": [
        "........",
        "..g.g...",
        ".gGGGg..",
        "gGCGGGg.",
        ".gGGGg..",
        "..g.g...",
    ],
    "shot_cannon": [
        "........",
        "..kkk...",
        ".kSSSk..",
        ".kSWSk..",
        ".kSSSk..",
        "..kkk...",
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


def slash_fx(f):
    """Kampilan swing: a bright crescent pointing right (32x32)."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    px = img.load()
    for y in range(32):
        for x in range(32):
            dx, dy = x - 8, y - 15.5
            r = math.hypot(dx, dy)
            a = math.degrees(math.atan2(dy, dx))
            if 12 < r < 20 and abs(a) < 75:
                edge = (r - 12) / 8
                if edge > 0.65:
                    c, al = PAL["W"], 255
                elif edge > 0.3:
                    c, al = PAL["V"], 220
                else:
                    c, al = PAL["C"], 140
                if f == 1:
                    al = al // 2
                px[x, y] = c + (al,)
    return img

def dust_fx(f):
    """Footstep / roll dust: a puff that grows and thins out (8x8)."""
    img = Image.new("RGBA", (8, 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = 1.5 + f * 1.2
    al = (200, 150, 90)[f]
    for cx, cy, k in ((3.5, 4.5, 1.0), (2, 5.5, 0.7), (5.5, 5, 0.8)):
        rr = r * k
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(206, 196, 170, al))
    return img


def hit_fx(f):
    """Impact spark when a blow or shot lands (8x8)."""
    rows = [
        ["...Y....", "...W....", ".Y.W.Y..", "..WWW...", "YWWVWWY.", "..WWW...", ".Y.W.Y..", "...W...."],
        ["Y......Y", ".Y....Y.", "...WW...", "..W..W..", "..W..W..", "...WW...", ".Y....Y.", "Y......Y"],
    ][f]
    return rows_to_img(rows, 8, 8, outline=False)


def boom_fx(f):
    """Lantaka blast: flash, fireball, smoke (16x16)."""
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if f == 0:
        d.ellipse([3, 3, 12, 12], fill=PAL["Y"] + (255,))
        d.ellipse([5, 5, 10, 10], fill=PAL["W"] + (255,))
    elif f == 1:
        d.ellipse([1, 1, 14, 14], fill=PAL["O"] + (255,))
        d.ellipse([3, 3, 12, 12], fill=PAL["A"] + (255,))
        d.ellipse([6, 5, 10, 9], fill=PAL["Y"] + (255,))
    else:
        for cx, cy, r in ((5, 6, 4), (10, 5, 4), (8, 10, 4), (4, 11, 3), (12, 10, 3)):
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(110, 100, 104, 190))
    return img


def sparkle_fx(f):
    """Glints for chests, upgrades and pickups (8x8)."""
    rows = [
        ["........", "...Y....", "...Y....", ".YYWYY..", "...Y....", "...Y....", "........", "........"],
        ["Y.....Y.", "........", "...W....", "..WYW...", "...W....", "........", "Y.....Y.", "........"],
    ][f]
    return rows_to_img(rows, 8, 8, outline=False)


def heal_fx(f):
    """A rising green cross when health returns (8x8)."""
    rows = [
        ["........", "........", "...G....", "..GVG...", "...G....", "........", "........", "........"],
        ["...G....", "..GVG...", "...G....", "........", "......G.", ".G...GVG", "GVG...G.", ".G......"],
    ][f]
    return rows_to_img(rows, 8, 8, outline=False)


def poof_fx(f):
    """Smoke puff when a creature is banished (16x16)."""
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = 3 + f * 2
    al = (230, 170, 90)[f]
    for a in range(0, 360, 60):
        cx = 8 + math.cos(math.radians(a + f * 20)) * (2 + f * 2)
        cy = 8 + math.sin(math.radians(a + f * 20)) * (2 + f * 2)
        d.ellipse([cx - r / 2, cy - r / 2, cx + r / 2, cy + r / 2], fill=(200, 190, 210, al))
    if f == 0:
        d.ellipse([5, 5, 10, 10], fill=PAL["W"] + (255,))
    return img


def ring_fx(color, width=2):
    """A thin ring, scaled in game: Banog's kalasag and Dalisay's wave (32x32)."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([1, 1, 30, 30], outline=color + (230,), width=width)
    d.ellipse([4, 4, 27, 27], outline=color + (90,), width=1)
    return img


# kaban: a carved wooden chest bound in brass, found on cleared islands
CHEST = [
    "", "", "",
    "...nnnnnnnnnn...",
    "..nNNNNNNNNNNn..",
    "..nyyyyyyyyyyn..",
    "..nNNNNyyNNNNn..",
    "..nNNNNAYNNNNn..",
    "..nNNNNyyNNNNn..",
    "..nyyyyyyyyyyn..",
    "..nNNNNNNNNNNn..",
    "..nnnnnnnnnnnn..",
]
CHEST_OPEN = [
    "",
    "...nnnnnnnnnn...",
    "..nNNNNNNNNNNn..",
    "..nyyyyyyyyyyn..",
    "..nkkkkkkkkkkn..",
    "..nkYkAkkYkkkn..",
    "..nyyyyyyyyyyn..",
    "..nNNNNNNNNNNn..",
    "..nNNNNNNNNNNn..",
    "..nyyyyyyyyyyn..",
    "..nNNNNNNNNNNn..",
    "..nnnnnnnnnnnn..",
]

# ---------------------------------------------------------------- items
ITEMS = {
    # hasaan: whetstone, sharpens whatever weapon you carry (+1 level)
    "whetstone": [
        "", "", "", "",
        "........Y.......",
        "...SSSSSSSSs....",
        "..SSWWSSSSSSs...",
        "..sSSSSSSSSss...",
        "...sssssssss....",
    ],
    # ginto: a gold bead, the islands' old currency
    "coin": [
        "", "", "", "",
        "......yyyy......",
        ".....yAAAAy.....",
        ".....yAYAAy.....",
        ".....yAAYAy.....",
        ".....yAAAAy.....",
        "......yyyy......",
    ],
    # alitaptap: firefly, feeds the light that powers skills
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
}

# dambana: a roadside shrine with a carved anito figure and an offering bowl
DAMBANA = [
    "",
    "......nnnn......",
    ".....nNNNNn.....",
    ".....NENNEN.....",
    ".....NNNNNN.....",
    "......NwwN......",
    ".....nNNNNn.....",
    "....nNNyyNNn....",
    ".....NNNNNN.....",
    ".....nN..Nn.....",
    "...SSSSSSSSSS...",
    "..SsAAOsssssSS..",
    "..SsyyysssssSs..",
    "..ssssssssssss..",
]


def balangay(f):
    """Balangay: the plank boat of the islands, docked with its sail half raised (32x20)."""
    img = Image.new("RGBA", (32, 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    bob = f
    # outrigger float + arms
    d.line([(3, 17 + bob), (28, 17 + bob)], fill=PAL["q"], width=2)
    d.line([(8, 12 + bob), (8, 17 + bob)], fill=PAL["n"])
    d.line([(23, 12 + bob), (23, 17 + bob)], fill=PAL["n"])
    # hull with upswept ends
    d.polygon([(1, 8 + bob), (5, 11 + bob), (26, 11 + bob), (31, 7 + bob), (28, 14 + bob), (4, 14 + bob)], fill=PAL["N"])
    d.line([(4, 12 + bob), (27, 12 + bob)], fill=PAL["n"])
    d.point([(9, 13 + bob), (15, 13 + bob), (21, 13 + bob)], fill=PAL["y"])
    # mast + square sail with a red stripe
    d.line([(15, 0 + bob), (15, 11 + bob)], fill=PAL["n"])
    d.rectangle([10, 1 + bob, 20, 8 + bob], fill=PAL["w"])
    d.rectangle([10, 4 + bob, 20, 5 + bob], fill=PAL["R"])
    d.point((21, 2 + bob), fill=PAL["A"])  # lamp
    add_outline(img)
    return img

# ---------------------------------------------------------------- island tiles
# Each island is drawn from the same parts with its own ground palette and props.
ISLANDS = {
    "port":   {"ground": (74, 66, 52), "grass": (98, 88, 66), "sand": (196, 170, 116), "deco": "lantern", "big": "pillar"},
    "pulo1":  {"ground": (62, 92, 54), "grass": (88, 140, 70), "sand": (190, 170, 110), "deco": "punso", "big": "palm"},
    "pulo2":  {"ground": (44, 70, 52), "grass": (60, 104, 64), "sand": (170, 156, 110), "deco": "banana", "big": "balete"},
    "pulo3":  {"ground": (78, 78, 70), "grass": (98, 108, 84), "sand": (150, 144, 128), "deco": "rock", "big": "boulder"},
    "pulo4":  {"ground": (40, 58, 44), "grass": (54, 84, 54), "sand": (140, 130, 100), "deco": "fern", "big": "balete"},
    "shore":  {"ground": (74, 68, 74), "grass": (92, 84, 90), "sand": (104, 96, 100), "deco": "rock", "big": "boulder"},
    # Sulu Sea: white coral sand, reef, houses on stilts over the shallows
    "sulu":   {"ground": (176, 160, 118), "grass": (120, 150, 96), "sand": (226, 214, 176), "deco": "coral", "big": "stilt"},
    # Ifugao: the rice terraces of the Cordillera, guarded by carved bulul
    "ifugao": {"ground": (70, 98, 52), "grass": (130, 160, 70), "sand": (120, 104, 72), "deco": "palay", "big": "bulul"},
}


def tile_ground(theme, seed):
    rnd = random.Random(seed)
    t = ISLANDS[theme]
    img = Image.new("RGBA", (16, 16), t["ground"] + (255,))
    for _ in range(12):
        c = rnd.choice([t["grass"], tuple(max(0, v - 14) for v in t["ground"])])
        img.putpixel((rnd.randrange(16), rnd.randrange(16)), c + (255,))
    if seed % 3 == 0:
        x, y = rnd.randrange(2, 13), rnd.randrange(4, 14)
        for dx, dy in ((0, 0), (1, -1), (2, 0), (1, 0)):
            img.putpixel((x + dx, y + dy), t["grass"] + (255,))
    return img


def tile_sand(theme, seed):
    rnd = random.Random(seed)
    s = ISLANDS[theme]["sand"]
    img = Image.new("RGBA", (16, 16), s + (255,))
    for _ in range(14):
        img.putpixel((rnd.randrange(16), rnd.randrange(16)), tuple(max(0, v - 22) for v in s) + (255,))
    return img


def tile_water(seed, deep=False):
    rnd = random.Random(seed)
    base = (18, 66, 86) if not deep else (12, 44, 62)
    img = Image.new("RGBA", (16, 16), base + (255,))
    d = ImageDraw.Draw(img)
    for _ in range(3):
        x, y = rnd.randrange(0, 12), rnd.randrange(1, 15)
        d.line([(x, y), (x + rnd.randrange(2, 5), y)], fill=(40, 104, 120))
    return img


def tile_planks():
    img = Image.new("RGBA", (16, 16), PAL["N"] + (255,))
    d = ImageDraw.Draw(img)
    for y in (0, 5, 10, 15):
        d.line([(0, y), (15, y)], fill=PAL["n"])
    d.point([(3, 2), (12, 7), (6, 12)], fill=PAL["n"])
    return img


DECO = {
    # punso: anthill mound, home of the duwende ("tabi-tabi po")
    "punso": [
        "", "", "", "", "",
        "......NNN.......",
        ".....NNnNN......",
        "....NNNNNnN.....",
        "...NNnNNNNNN....",
        "...NNNNNnNNNn...",
        "..NNNNNNNNNNNn..",
        "..nnNNNNNNNnnn..",
        "...nnnnnnnnnn...",
    ],
    "banana": [
        "",
        "...G.....G......",
        "..GGg...GGg.....",
        ".GGGGg.GGGGg....",
        "..GGGGgGGGg..G..",
        "....GGGGGg..GGg.",
        "..GGGGqGGGGGGg..",
        ".GGg..q..GGGg...",
        "......q.........",
        "......q.........",
        "......qq........",
        ".....qqq........",
    ],
    "rock": [
        "", "", "", "", "",
        "......SSS.......",
        "....SSWSSSs.....",
        "...SSSSSSSSs....",
        "...SSSSSSSss....",
        "..SSSSSSSssss...",
        "..sSSSSSsssss...",
        "...ssssssssss...",
    ],
    "fern": [
        "", "", "",
        ".......g........",
        "..g...gGg...g...",
        "..Gg.gGGGg.gG...",
        "...GgGGgGGgG....",
        "....GGgGgGG.....",
        "..gGGGGgGGGGg...",
        ".gGG..GgG..GGg..",
        ".......g........",
    ],
    # coral head on the Sulu reef
    "coral": [
        "", "", "", "",
        "....M...M.......",
        "...MMM.MMM..M...",
        "....M.M.M..MMM..",
        "..M..MMMM...M...",
        ".MMM..MM..M.M...",
        "..M.MMMMMMMM....",
        "....MMMMMMM.....",
        "...wwwwwwwww....",
    ],
    # palay: ripening rice tufts on the terraces
    "palay": [
        "", "", "",
        "...Y.....Y......",
        "..YQ.Y..YQ..Y...",
        "...Q.QY..Q.YQ...",
        "...GgQ..GgQ.Q...",
        "..GGgG.GGgGGg...",
        "...GgGGgGgGg....",
        "....gggggggg....",
    ],
    # bronze lamp post on the Tondo docks
    "lantern": [
        "",
        "......yyyy......",
        ".....yYAAYy.....",
        ".....yAYYAy.....",
        ".....yYAAYy.....",
        "......yyyy......",
        ".......y........",
        ".......y........",
        ".......y........",
        ".......y........",
        ".......y........",
        "......yyy.......",
        ".....sssss......",
    ],
}

BIG = {
    # coconut palm seen from above
    "palm": [
        "..G.........G...",
        "...GG.....GG....",
        "G...GG...GG...G.",
        ".GG..GGgGG..GG..",
        "...GGGgNgGGG....",
        "......gNNg......",
        "...GGGgNgGGG....",
        ".GG..GG.GGg.GG..",
        "G...GG...GG...G.",
        "...GG.....GG....",
        "..G..........G..",
    ],
    # balete: strangler fig, home of the kapre, roots hanging into the ground
    "balete": [
        "..gggggggggggg..",
        ".gGGgGGGGgGGGGg.",
        ".gGGGGGgGGGGgGg.",
        "..gGGGGGGGGGGg..",
        "...nNnNNnNNnN...",
        "...nNnNnnNnNn...",
        "...nNnNnnNnNn...",
        "...nNnNnnNnNn...",
        "..nnNnNnnNnNnn..",
        ".nn.nn.nn.nn.nn.",
    ],
    "boulder": [
        "",
        "....SSSSSS......",
        "..SSSWWSSSSs....",
        ".SSSSSSSSSSSs...",
        ".SSSSSSSSSSss...",
        "SSSSSSSSSSssss..",
        "sSSSSSSSSsssss..",
        "ssSSSSSSssssss..",
        ".ssssssssssss...",
    ],
    # bahay sa dagat: a nipa house on stilts (seen from above)
    "stilt": [
        "..qqqqqqqqqqqq..",
        ".qQQQQQQQQQQQQq.",
        "qQQqQQQqQQQqQQQq",
        "qQQQQQQQQQQQQQQq",
        ".qqqqqqqqqqqqqq.",
        "..nNNNNNNNNNNn..",
        "..n.n..nn..n.n..",
        "..n.n..nn..n.n..",
        "..n.n..nn..n.n..",
    ],
    # bulul: carved wooden rice guardian of the Ifugao
    "bulul": [
        "",
        "......nnnn......",
        ".....nNNNNn.....",
        ".....NENNEN.....",
        ".....nNNNNn.....",
        "......nNNn......",
        ".....NNNNNN.....",
        "....nN.NN.Nn....",
        "....nN.NN.Nn....",
        ".....NNNNNN.....",
        ".....NN..NN.....",
        "....sssssssss...",
    ],
    # carved post with a bronze lamp
    "pillar": [
        "",
        ".....yyyyyy.....",
        ".....yAYYAy.....",
        "......nNNn......",
        "......nENn......",
        "......nNNn......",
        "......nyyn......",
        "......nNNn......",
        "......nNNn......",
        ".....nnNNnn.....",
        "....sssssss.....",
    ],
}

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


# HUD pips (diamond beads) and blessing icons for the Tagalog deities.
PIPS = {
    "pip_hp": ["...R....", "..RWR...", ".RRRRR..", "RRRRRRR.", ".RRRRR..", "..RRR...", "...R...."],
    "pip_hp_empty": ["...k....", "..kkk...", ".kkkkk..", "kkkkkkk.", ".kkkkk..", "..kkk...", "...k...."],
    "pip_armor": ["...C....", "..CVC...", ".CCCCC..", "CCCCCCC.", ".CCCCC..", "..CCC...", "...C...."],
    "pip_armor_empty": ["...t....", "..ttt...", ".ttttt..", "ttttttt.", ".ttttt..", "..ttt...", "...t...."],
}

BOONS = {
    # Apolaki, god of the sun and of war
    "apolaki": [
        "",
        ".......A........",
        "..A....A....A...",
        "...A..YYY..A....",
        "....YYYYYYY.....",
        "...YYYWYYYYY....",
        "AAYYYYYYYYYYYAA.",
        "...YYYYYYYYY....",
        "....YYYYYYY.....",
        "...A..YYY..A....",
        "..A....A....A...",
        ".......A........",
    ],
    # Mayari, goddess of the moon
    "mayari": [
        "",
        "......HHHH......",
        "....HHHh........",
        "...HHHh.........",
        "..HHHh..........",
        "..HHHh..........",
        "..HHHh.....C....",
        "..HHHh..........",
        "...HHHh.........",
        "....HHHh........",
        "......HHHH......",
    ],
    # Tala, goddess of the stars
    "tala": [
        "",
        "...........Y....",
        "..........YWY...",
        "...Y.......Y....",
        "..YWY...........",
        "...Y.....Y......",
        "........YYY.....",
        ".......YYWYY....",
        "........YYY.....",
        ".........Y......",
        "..Y.............",
        ".YWY.......Y....",
        "..Y.............",
    ],
    # Anitun Tabu, goddess of wind and rain
    "anitun_tabu": [
        "", "",
        "....wwwwww......",
        "..ww......w.....",
        ".w...wwww..w....",
        ".w..w....w.w....",
        ".w..w.ww.w.w....",
        "..w..w..w..w....",
        "...w..ww..w.....",
        "....w....w......",
        ".....wwww.......",
        "..B.....B....B..",
        ".B.....B....B...",
    ],
    # Dumakulem, guardian of the mountains
    "dumakulem": [
        "", "",
        ".......W........",
        "......WSS.......",
        ".....SSSSs......",
        "....SSSSSSs.....",
        "...SSSsSSSSs.S..",
        "..SSSsSSSSSsSSs.",
        ".SSSsSSSSSSSsSSs",
        "SSSsSSSSSSSSSsSs",
        "ssssssssssssssss",
    ],
    # Lakapati, goddess of fertility and the harvest
    "lakapati": [
        "",
        "........Y.......",
        ".......YAY......",
        "......YA.Y......",
        ".....YA..YA.....",
        "......Y.AY......",
        ".......Gq.......",
        "......G.q.G.....",
        ".....G..q..G....",
        "........q.......",
        "........q.......",
        "........q.......",
    ],
    # Aman Sinaya, goddess of the sea
    "aman_sinaya": [
        "", "", "",
        "....TTT.........",
        "...TCCCT........",
        "..TC..CT...TT...",
        ".TC....TTTTCCT..",
        ".TC...TCCCCC.T..",
        "TTTTTTTTTTTTTTTT",
        "tttttttttttttttt",
        "TTTTTTTTTTTTTTTT",
    ],
    # Lakan Bakod, protector of fences and of what they keep safe
    "lakan_bakod": [
        "", "",
        "..Q...Q...Q...Q.",
        ".QQQ.QQQ.QQQ.QQQ",
        ".QqQ.QqQ.QqQ.QqQ",
        "nnnnnnnnnnnnnnnn",
        ".QqQ.QqQ.QqQ.QqQ",
        ".QqQ.QqQ.QqQ.QqQ",
        "nnnnnnnnnnnnnnnn",
        ".QqQ.QqQ.QqQ.QqQ",
        ".qqq.qqq.qqq.qqq",
    ],
}

BTN_ATTACK = [  # crossed blades
    "",
    ".W............W.",
    "..W..........W..",
    "...W........W...",
    "....W......W....",
    ".....W....W.....",
    "......W..W......",
    ".......WW.......",
    ".......WW.......",
    "......y..y......",
    ".....y....y.....",
    "....yy....yy....",
]
BTN_DODGE = [  # gust of wind
    "", "",
    "..WWWWWWWW......",
    "..........W.....",
    "....WWWWWW......",
    "",
    ".WWWWWWWWWWW....",
    "............W...",
    ".....WWWWWWW....",
    "",
    "...WWWWWW.......",
    ".........W......",
]
BTN_LIGHT = [  # rising sun of power
    "",
    ".......Y........",
    "...Y...Y...Y....",
    "....Y.....Y.....",
    "......YYY.......",
    "..YY.YYWYY.YY...",
    "......YYY.......",
    "....Y.....Y.....",
    "...Y...Y...Y....",
    ".......Y........",
]


def medallion(size=40):
    """Gold diamond frame around the hero portrait in the HUD."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    c = (size - 1) / 2
    for y in range(size):
        for x in range(size):
            r = abs(x - c) + abs(y - c)
            if c - 4 < r <= c - 1.5:
                px[x, y] = PAL["A"] + (255,)
            elif c - 1.5 < r <= c + 0.3:
                px[x, y] = PAL["y"] + (255,)
            elif r <= c - 4:
                px[x, y] = (16, 38, 44, 230)
    return img

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


FONT.update({
    "M": ["110011", "111111", "111111", "110011", "110011", "110011", "110011"],
    "L": ["110000", "110000", "110000", "110000", "110000", "110000", "111111"],
    "O": ["011110", "110011", "110011", "110011", "110011", "110011", "011110"],
    "G": ["011111", "110000", "110000", "110111", "110011", "110011", "011111"],
})


BAYBAYIN_TTF = os.path.join(ROOT, "node_modules", "@expo-google-fonts", "noto-sans-tagalog",
                            "400Regular", "NotoSansTagalog_400Regular.ttf")


def baybayin_img(text, size, color, outline=PAL["K"]):
    """Render Baybayin script with the Noto Sans Tagalog face, snapped to pixels."""
    from PIL import ImageFont
    font = ImageFont.truetype(BAYBAYIN_TTF, size * 4)
    probe = Image.new("L", (size * 4 * len(text) + 40, size * 8), 0)
    ImageDraw.Draw(probe).text((10, size), text, font=font, fill=255)
    box = probe.getbbox()
    probe = probe.crop(box).resize(((box[2] - box[0]) // 4 + 1, (box[3] - box[1]) // 4 + 1), Image.BILINEAR)
    img = Image.new("RGBA", (probe.width + 4, probe.height + 4), (0, 0, 0, 0))
    pp, px = probe.load(), img.load()
    for y in range(probe.height):
        for x in range(probe.width):
            if pp[x, y] > 90:
                px[x + 2, y + 2] = color + (255,)
    add_outline(img, outline)
    return img

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


# ---------------------------------------------------------------- islands (maps)
ROOM_W, ROOM_H = 22, 13  # tiles
FLOOR, WALL, CRATE, PILLAR, WATER = 0, 1, 2, 3, 4


def make_island(seed, kind):
    """An island blob in the sea. Walking stops at the water; shots fly over it."""
    rnd = random.Random(seed)
    g = [[WATER] * ROOM_W for _ in range(ROOM_H)]
    cx, cy = ROOM_W // 2, ROOM_H // 2 + 1
    ph = [rnd.random() * 6.28 for _ in range(3)]
    for y in range(ROOM_H):
        for x in range(ROOM_W):
            a = math.atan2(y - cy, x - cx)
            wob = 0.12 * math.sin(3 * a + ph[0]) + 0.08 * math.sin(5 * a + ph[1]) + 0.05 * math.sin(7 * a + ph[2])
            rx, ry = 10.6, 5.4
            if ((x - cx + 0.5) / rx) ** 2 + ((y - cy + 0.5) / ry) ** 2 < 1 + wob:
                g[y][x] = FLOOR
    # the landing beach (left) and the dock (right) along the centre row
    for x in range(1, ROOM_W - 1):
        g[cy][x] = FLOOR
    for y in (cy - 1, cy + 1):
        for x in (1, 2, ROOM_W - 3, ROOM_W - 2):
            g[y][x] = FLOOR
    g[cy][ROOM_W - 1] = WATER  # the boat floats here

    def free(x, y):
        if g[y][x] != FLOOR:
            return False
        if x <= 3 or x >= ROOM_W - 4 or (cx - 1 <= x <= cx + 2 and abs(y - cy) <= 1) or y == cy:
            return False
        return 2 < y < ROOM_H - 2

    if kind == "shore":
        for (x, y) in ((5, 4), (16, 4), (5, 10), (16, 10)):
            if g[y][x] == FLOOR:
                g[y][x] = PILLAR
    elif kind == "port":
        for (x, y) in ((7, 5), (15, 5), (7, 9), (15, 9)):
            if g[y][x] == FLOOR:
                g[y][x] = PILLAR
    else:
        for _ in range(rnd.randint(5, 8)):
            x, y = rnd.randrange(4, ROOM_W - 4), rnd.randrange(3, ROOM_H - 2)
            t = rnd.choice([CRATE, CRATE, PILLAR])
            shape = rnd.choice([[(0, 0)], [(0, 0), (1, 0)], [(0, 0), (0, 1)], [(0, 0), (1, 1)]])
            for dx, dy in shape:
                if 0 <= y + dy < ROOM_H and 0 <= x + dx < ROOM_W and free(x + dx, y + dy):
                    g[y + dy][x + dx] = t
    # every walkable tile must be reachable from the landing beach
    seen, stack = {(2, cy)}, [(2, cy)]
    while stack:
        x, y = stack.pop()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < ROOM_W and 0 <= ny < ROOM_H and (nx, ny) not in seen and g[ny][nx] == FLOOR:
                seen.add((nx, ny))
                stack.append((nx, ny))
    for y in range(ROOM_H):
        for x in range(ROOM_W):
            if g[y][x] == FLOOR and (x, y) not in seen:
                g[y][x] = WATER
    return g


def render_island(g, seed, theme):
    rnd = random.Random(seed)
    img = Image.new("RGBA", (ROOM_W * 16, ROOM_H * 16), (0, 0, 0, 255))
    deco = rows_to_img(DECO[ISLANDS[theme]["deco"]])
    big = rows_to_img(BIG[ISLANDS[theme]["big"]])

    def land(x, y):
        return 0 <= x < ROOM_W and 0 <= y < ROOM_H and g[y][x] != WATER

    for y in range(ROOM_H):
        for x in range(ROOM_W):
            pos = (x * 16, y * 16)
            if g[y][x] == WATER:
                near = any(land(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1))
                img.alpha_composite(tile_water(rnd.randrange(999), deep=not near), pos)
                continue
            coast = any(not land(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if theme == "port" and abs(y - (ROOM_H // 2 + 1)) <= 1 and x >= ROOM_W - 4:
                img.alpha_composite(tile_planks(), pos)
            elif coast:
                img.alpha_composite(tile_sand(theme, rnd.randrange(999)), pos)
            else:
                img.alpha_composite(tile_ground(theme, rnd.randrange(999)), pos)
            if g[y][x] == FLOOR and rnd.random() < 0.16:  # ambient detail, does not block
                dx, dy = pos[0] + rnd.randrange(3, 12), pos[1] + rnd.randrange(3, 12)
                kind = rnd.random()
                if coast:
                    img.putpixel((dx, dy), (236, 226, 214, 255))          # shell
                    img.putpixel((dx + 1, dy), (200, 170, 160, 255))
                elif kind < 0.4:
                    for c, (ox, oy) in ((PAL["M"], (0, 0)), (PAL["Y"], (1, 0)), (PAL["M"], (2, 0)), (PAL["g"], (1, 1))):
                        img.putpixel((dx + ox, dy + oy), c + (255,))      # wildflowers
                else:
                    for ox in range(3):
                        for oy in range(2 + (ox % 2)):
                            img.putpixel((dx + ox * 2, dy - oy), ISLANDS[theme]["grass"] + (255,))  # tall grass
            if g[y][x] == CRATE:
                img.alpha_composite(deco, pos)
            elif g[y][x] == PILLAR:
                img.alpha_composite(big, pos)
    # surf: a light line wherever land meets water
    px = img.load()
    for y in range(ROOM_H):
        for x in range(ROOM_W):
            if g[y][x] != WATER:
                continue
            for dx, dy, edge in ((0, -1, "top"), (0, 1, "bottom"), (-1, 0, "left"), (1, 0, "right")):
                if land(x + dx, y + dy):
                    for i in range(16):
                        if rnd.random() < 0.75:
                            if edge == "top":
                                px[x * 16 + i, y * 16] = (190, 230, 230, 255)
                            elif edge == "bottom":
                                px[x * 16 + i, y * 16 + 15] = (190, 230, 230, 255)
                            elif edge == "left":
                                px[x * 16, y * 16 + i] = (190, 230, 230, 255)
                            else:
                                px[x * 16 + 15, y * 16 + i] = (190, 230, 230, 255)
    if theme == "ifugao":  # terrace walls: a stone step every third row of land
        d = ImageDraw.Draw(img)
        for y in range(ROOM_H):
            if y % 3:
                continue
            for x in range(ROOM_W):
                if g[y][x] == FLOOR and land(x, y - 1):
                    d.line([(x * 16, y * 16), (x * 16 + 15, y * 16)], fill=(96, 84, 64, 255))
                    d.line([(x * 16, y * 16 + 1), (x * 16 + 15, y * 16 + 1)], fill=(60, 52, 40, 255))
    if theme == "sulu":  # clear turquoise shallows
        fx = Image.new("RGBA", img.size, (0, 0, 0, 0))
        fp = fx.load()
        for y in range(ROOM_H):
            for x in range(ROOM_W):
                if g[y][x] == WATER and any(land(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1)):
                    for yy in range(16):
                        for xx in range(16):
                            fp[x * 16 + xx, y * 16 + yy] = (60, 200, 190, 90)
        img.alpha_composite(fx)
    if theme == "shore":  # red tide tint over the water
        fx = Image.new("RGBA", img.size, (0, 0, 0, 0))
        fp = fx.load()
        for y in range(ROOM_H):
            for x in range(ROOM_W):
                if g[y][x] == WATER:
                    for yy in range(16):
                        for xx in range(16):
                            fp[x * 16 + xx, y * 16 + yy] = (150, 20, 30, 120)
        img.alpha_composite(fx)
    return img

# ---------------------------------------------------------------- app icon / splash / brand
def hero_frame(name, f):
    h = HEROES[name]
    return rows_to_img(h["body"] + [h["legs"][f]])


def app_icon():
    img = Image.new("RGBA", (32, 32), (24, 14, 34, 255))
    stars(img, 8, 5, 32)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 31, 31], outline=PAL["y"])
    img.alpha_composite(app_icon_art())
    return img


def brand_sheet():
    W, H = 320, 210
    img = Image.new("RGBA", (W, H), (14, 12, 28, 255))
    logo = text_img("MAHARLIKA", 3, (255, 232, 130), (210, 110, 40))
    img.alpha_composite(logo, ((W - logo.width) // 2, 8))
    bay = baybayin_img("ᜋᜑᜇ᜔ᜎᜒᜃ", 9, (230, 200, 120))
    img.alpha_composite(bay, ((W - bay.width) // 2, 36))
    d = ImageDraw.Draw(img)
    sw = ["K", "t", "T", "C", "A", "y", "O", "R", "Q", "G", "N", "H"]
    for i, k in enumerate(sw):
        x = 22 + i * 24
        d.rectangle([x, 58, x + 18, 70], fill=PAL[k], outline=(0, 0, 0))
    for i, name in enumerate(HEROES):
        img.alpha_composite(up(hero_frame(name, 0), 3), (6 + i * 34, 80))
    img.alpha_composite(up(rows_to_img(HALIYA), 3), (212, 80))
    img.alpha_composite(up(balangay(0), 2), (260, 96))
    for i, name in enumerate(ENEMIES):
        img.alpha_composite(up(rows_to_img(ENEMIES[name][0]), 2), (16 + i * 40, 150))
    img.alpha_composite(up(bakunawa_frame(1), 2), (236, 136))
    return img

def animation_sheet():
    """Every guardian pose in a row, followed by both of their weapons."""
    order = [(p, f) for p, n in HERO_POSES.items() for f in range(n)]
    cell = 20
    W = 8 + 44 + (len(order) + 1) * cell + 2 * cell + 8
    H = 16 + len(HEROES) * (cell + 4) + 6
    img = Image.new("RGBA", (W, H), (14, 12, 28, 255))
    d = ImageDraw.Draw(img)
    x = 52
    for pose, n in HERO_POSES.items():
        d.text((x + 1, 2), pose.upper()[:n * 3 + 1], fill=(255, 186, 72))
        x += n * cell
    d.text((x + cell + 1, 2), "ARMS", fill=(255, 186, 72))
    loadouts = {"kidlat": ("kampilan", "kris"), "liksi": ("pana", "bangkaw"),
                "mayumi": ("agimat", "lingganay"), "amihan": ("sumpit", "barang"),
                "banog": ("panabas", "baston"), "dalisay": ("buntot_pagi", "lantaka")}
    for r, name in enumerate(HEROES):
        y = 16 + r * (cell + 4)
        d.text((6, y + 4), name.upper(), fill=(255, 246, 228))
        for i, (pose, f) in enumerate(order):
            cx = 52 + i * cell
            d.rectangle([cx, y, cx + 17, y + 17], fill=(26, 22, 48))
            img.alpha_composite(hero_pose(name, pose, f), (cx + 1, y + 1))
        for j, w in enumerate(loadouts[name]):
            cx = 52 + (len(order) + 1 + j) * cell
            d.rectangle([cx, y, cx + 17, y + 17], fill=(42, 36, 68))
            img.alpha_composite(rows_to_img(WEAPONS[w]), (cx + 1, y + 1))
    return img


# ---------------------------------------------------------------- story cast: Haliya, portraits, props
# Haliya: the Bicolano masked goddess of moonlight, sworn enemy of the Bakunawa.
HALIYA = [
    "",
    "......DDDD......",
    ".....DDDDDD.....",
    "....DDYYYYDD....",
    "....DYAYYAYD....",
    "....DYYYYYYD....",
    "....DDYyyYDD....",
    "....DD.FF.DD....",
    "...DDHHHHHHDD...",
    "...DHHHHHHHHD...",
    "..FHHHHYHHHHHF..",
    "...HHHHHHHHHH...",
    "...hHHHHHHHHh...",
    "...hhhhhhhhhh...",
    "....hh....hh....",
]

AGUNG = [
    "",
    ".QQQQQQQQQQQQQQ.",
    ".Q.....nn.....Q.",
    ".Q....yyyy....Q.",
    ".Q...yAAAAy...Q.",
    ".Q..yAAyyAAy..Q.",
    ".Q..yAyYYyAy..Q.",
    ".Q..yAyYYyAy..Q.",
    ".Q..yAAyyAAy..Q.",
    ".Q...yAAAAy...Q.",
    ".Q....yyyy....Q.",
    ".Q............Q.",
    ".q............q.",
    ".q............q.",
    ".qq..........qq.",
]

def portrait(skin, shade, hair, outfit, style, extras=()):
    """32x32 dialogue bust built from a few shared parts so the cast stays consistent."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # shoulders + neck
    d.ellipse([3, 23, 28, 44], fill=outfit)
    d.rectangle([13, 19, 18, 24], fill=shade)
    if style == "long":
        d.rectangle([7, 6, 10, 27], fill=hair)
        d.rectangle([21, 6, 24, 27], fill=hair)
    # head
    d.rounded_rectangle([9, 5, 22, 21], radius=4, fill=skin)
    d.line([(22, 9), (22, 18)], fill=shade)
    d.line([(12, 21), (19, 21)], fill=shade)
    d.rectangle([8, 12, 8, 15], fill=skin)
    d.rectangle([23, 12, 23, 15], fill=shade)
    # hair
    if style in ("short", "long", "bun"):
        d.rounded_rectangle([8, 3, 23, 9], radius=3, fill=hair)
        d.rectangle([8, 6, 9, 12], fill=hair)
        d.rectangle([22, 6, 23, 12], fill=hair)
        if style == "bun":
            d.ellipse([9, -1, 22, 6], fill=hair)
            d.ellipse([12, -2, 19, 3], fill=hair)
    elif style == "elder":
        d.rectangle([9, 4, 22, 6], fill=PAL["h"])
        d.rectangle([8, 6, 9, 11], fill=PAL["h"])
        d.rectangle([22, 6, 23, 11], fill=PAL["h"])
    # face
    for ex in (12, 18):
        d.rectangle([ex, 13, ex + 1, 14], fill=PAL["E"])
        d.point((ex, 13), fill=PAL["W"])
        d.line([(ex, 11), (ex + 1, 11)], fill=hair if style != "elder" else PAL["h"])
    d.line([(15, 18), (16, 18)], fill=PAL["r"])
    if "blush" in extras:
        d.point([(11, 16), (20, 16)], fill=PAL["M"])
    if "streak" in extras:  # grey streaks of an older woman
        d.line([(10, 4), (14, 1)], fill=PAL["h"])
        d.line([(17, 3), (21, 5)], fill=PAL["h"])
        d.point([(9, 8), (22, 8)], fill=PAL["h"])
    if "earrings" in extras:
        d.point([(8, 16), (23, 16)], fill=PAL["A"])
    if "beard" in extras:
        d.polygon([(11, 17), (20, 17), (19, 23), (15, 26), (12, 23)], fill=PAL["w"])
        d.line([(14, 18), (17, 18)], fill=PAL["h"])
    if "wrinkles" in extras:
        d.point([(11, 15), (20, 15), (13, 9), (18, 9)], fill=shade)
    if "mask" in extras:  # Haliya's golden mask
        d.rectangle([9, 9, 22, 17], fill=PAL["Y"])
        d.line([(9, 17), (22, 17)], fill=PAL["y"])
        d.rectangle([11, 12, 13, 13], fill=PAL["E"])
        d.rectangle([18, 12, 20, 13], fill=PAL["E"])
        d.point((15, 10), fill=PAL["W"])
    # headgear / accessories
    if "putong" in extras or "putong_faded" in extras:
        c1, c2 = (PAL["R"], PAL["r"]) if "putong" in extras else (PAL["M"], PAL["r"])
        d.rectangle([8, 7, 23, 9], fill=c1)
        d.polygon([(8, 7), (2, 11), (3, 14), (8, 10)], fill=c2)
    if "salakot" in extras:
        d.polygon([(1, 10), (15, 0), (16, 0), (30, 10)], fill=PAL["Q"])
        d.line([(1, 10), (30, 10)], fill=PAL["q"])
        d.line([(15, 1), (15, 9)], fill=PAL["y"])
    if "flower" in extras:
        d.ellipse([20, 3, 25, 8], fill=PAL["M"])
        d.point((22, 5), fill=PAL["Y"])
    if "beads" in extras:
        for i, x in enumerate(range(10, 23, 2)):
            d.point((x, 25 + (1 if 12 < x < 20 else 0)), fill=PAL["A"] if i % 2 else PAL["R"])
    if "vest" in extras:
        d.rectangle([10, 26, 21, 31], fill=PAL["Q"])
        d.line([(13, 26), (13, 31)], fill=PAL["W"])
        d.line([(18, 26), (18, 31)], fill=PAL["W"])
    if "leaf" in extras:
        d.polygon([(5, 27), (15, 24), (26, 27), (28, 31), (3, 31)], fill=PAL["G"])
        d.line([(15, 24), (15, 31)], fill=PAL["g"])
    if "tapis" in extras:
        for y in (28, 30):
            d.line([(5, y), (26, y)], fill=PAL["O"])
    if "tangkulo" in extras:  # Bagani's red headcloth with a hawk feather
        d.rectangle([8, 3, 23, 8], fill=PAL["R"])
        d.line([(8, 8), (23, 8)], fill=PAL["r"])
        d.polygon([(22, 3), (27, -1), (28, 0), (24, 5)], fill=PAL["W"])
        d.line([(24, 3), (27, 0)], fill=PAL["h"])
    if "redtrim" in extras:
        d.line([(9, 26), (22, 26)], fill=PAL["R"])
        d.point([(12, 28), (15, 28), (19, 28)], fill=PAL["y"])
    if "kumbong" in extras:  # Sulu veil over the hair and shoulders
        d.rounded_rectangle([6, 2, 25, 10], radius=4, fill=PAL["T"])
        d.rectangle([6, 8, 8, 26], fill=PAL["T"])
        d.rectangle([23, 8, 25, 26], fill=PAL["t"])
        d.line([(9, 9), (22, 9)], fill=PAL["t"])
    if "pearls" in extras:
        for i, x in enumerate(range(10, 23, 2)):
            d.point((x, 24 + (1 if 12 < x < 20 else 0)), fill=PAL["W"] if i % 2 else PAL["H"])
    if "cane" in extras:
        d.line([(27, 18), (27, 31)], fill=PAL["n"])
        d.line([(25, 18), (27, 18)], fill=PAL["n"])
    add_outline(img)
    return img


def bakunawa_portrait():
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    T, t = PAL["T"], PAL["t"]
    for x, y in ((4, 6), (9, 3), (14, 4)):  # crest fins
        d.polygon([(x, y + 4), (x + 2, y - 3), (x + 5, y + 4)], fill=PAL["R"])
    d.ellipse([1, 6, 23, 26], fill=T)
    d.polygon([(16, 9), (31, 12), (31, 16), (17, 18)], fill=T)           # snout
    d.polygon([(15, 19), (30, 19), (28, 26), (12, 26)], fill=t)          # lower jaw
    d.polygon([(17, 17), (30, 17), (29, 21), (16, 21)], fill=PAL["r"])  # mouth
    for x in (19, 23, 27):
        d.point([(x, 17), (x + 1, 21)], fill=PAL["W"])
    d.ellipse([9, 10, 15, 15], fill=PAL["Y"])
    d.line([(12, 10), (12, 15)], fill=PAL["E"])
    d.line([(7, 7), (2, 0)], fill=PAL["H"])
    d.line([(29, 13), (31, 9)], fill=PAL["Y"])
    for (x, y) in ((4, 15), (6, 20), (10, 22), (5, 11)):
        d.point((x, y), fill=PAL["C"])
    add_outline(img)
    return img


# ---------------------------------------------------------------- story panels (320x180)
def bangka(d, x, y, hull=(30, 20, 18), trim=(140, 40, 34)):
    d.polygon([(x, y), (x + 34, y), (x + 29, y + 6), (x + 5, y + 6)], fill=hull)
    d.line([(x + 2, y), (x + 32, y)], fill=trim)
    d.line([(x + 8, y - 1), (x + 4, y - 6)], fill=hull)
    d.line([(x + 26, y - 1), (x + 30, y - 6)], fill=hull)
    d.line([(x - 2, y - 6), (x + 36, y - 6)], fill=hull)


def sea(img, y0, top, bottom, seed, glint=(200, 230, 230)):
    dither_gradient(img, top, bottom, y0, img.height)
    rnd = random.Random(seed)
    d = ImageDraw.Draw(img)
    for _ in range(70):
        x, y = rnd.randrange(img.width), rnd.randrange(y0 + 2, img.height)
        d.line([(x, y), (x + rnd.randrange(3, 9), y)], fill=glint)


def moon_path(img, x, y0, color):
    d = ImageDraw.Draw(img)
    for i, y in enumerate(range(y0, img.height, 3)):
        w = 4 + i // 2
        d.line([(x - w + (i % 3), y), (x + w - (i % 2), y)], fill=color)


def person(d, x, y, color, h=14):
    """Tiny villager silhouette."""
    d.ellipse([x - 2, y - h, x + 2, y - h + 4], fill=color)
    d.rectangle([x - 2, y - h + 4, x + 2, y - 3], fill=color)
    d.line([(x - 1, y - 3), (x - 2, y)], fill=color)
    d.line([(x + 1, y - 3), (x + 2, y)], fill=color)


def agung_big(img, cx, cy, r, cracked=True):
    d = ImageDraw.Draw(img)
    d.rectangle([cx - r - 12, cy - r - 16, cx - r - 8, cy + r + 30], fill=PAL["q"])
    d.rectangle([cx + r + 8, cy - r - 16, cx + r + 12, cy + r + 30], fill=PAL["q"])
    d.rectangle([cx - r - 16, cy - r - 18, cx + r + 16, cy - r - 14], fill=PAL["Q"])
    d.line([(cx, cy - r - 14), (cx, cy - r)], fill=PAL["n"])
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=PAL["y"])
    d.ellipse([cx - r + 3, cy - r + 3, cx + r - 3, cy + r - 3], fill=PAL["A"])
    d.ellipse([cx - r // 2, cy - r // 2, cx + r // 2, cy + r // 2], fill=PAL["y"])
    d.ellipse([cx - r // 4, cy - r // 4, cx + r // 4, cy + r // 4], fill=PAL["Y"])
    d.arc([cx - r + 5, cy - r + 5, cx + r - 5, cy + r - 5], 200, 260, fill=PAL["W"])
    if cracked:
        pts = [(cx + 2, cy - r), (cx - 3, cy - r // 2), (cx + 4, cy), (cx - 2, cy + r // 2), (cx + 3, cy + r)]
        d.line(pts, fill=PAL["K"], width=2)


def sprite_at(img, rows_img, x, y, s):
    img.alpha_composite(up(rows_img, s), (int(x), int(y)))




def story_legend():
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (44, 28, 18), (112, 76, 42), 0, 180)
    d = ImageDraw.Draw(img)
    ink, pale = (40, 24, 14), (236, 206, 150)
    # banig border
    for x in range(0, 320, 8):
        for y in (2, 172):
            d.polygon([(x + 4, y), (x + 8, y + 3), (x + 4, y + 6), (x, y + 3)], fill=(150, 104, 56))
    # the seven moons; six already swallowed (hollow)
    for i in range(7):
        cx, cy = 34 + i * 42, 46 + abs(i - 3) * 7
        if i == 6:
            glow_disc(img, cx, cy, 11, pale, ((6, 40), (3, 70)))
            d.ellipse([cx - 11, cy - 11, cx + 11, cy + 11], fill=pale)
        else:
            d.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], outline=(170, 124, 70), width=2)
    # serpent sweeping across the sky toward the last moon
    hx, hy = serpent_arc(img, 150, 230, 175, 3.55, 5.55, 9, ink, (150, 54, 30))
    d.polygon([(hx - 10, hy + 2), (hx + 16, hy - 10), (hx + 14, hy + 2), (hx + 2, hy + 10)], fill=ink)
    d.polygon([(hx + 4, hy + 2), (hx + 18, hy + 6), (hx + 2, hy + 12)], fill=ink)
    d.rectangle([hx + 2, hy - 4, hx + 3, hy - 3], fill=(230, 90, 50))
    # carved people below, arms raised
    for x in range(30, 300, 26):
        person(d, x, 168, ink, 16)
        d.line([(x - 2, 156), (x - 5, 150)], fill=ink)
        d.line([(x + 2, 156), (x + 5, 150)], fill=ink)
    return img














# ---------------------------------------------------------------- Maharlika scenes
def mayon(img, x, base, h, color, smoke=None):
    """Mayon: the near-perfect volcanic cone of Albay."""
    d = ImageDraw.Draw(img)
    for i in range(h):
        w = int((i / h) ** 1.35 * h * 1.5) + 1
        d.line([(x - w, base - h + i), (x + w, base - h + i)], fill=color)
    if smoke:
        for i in range(6):
            d.ellipse([x - 3 + i * 3, base - h - 6 - i * 4, x + 3 + i * 4, base - h - i * 4], fill=smoke)


def eclipse(img, cx, cy, r, bite):
    """A moon with the serpent's shadow across it (bite 0..1)."""
    glow_disc(img, cx, cy, r, (220, 90, 70), ((12, 26), (7, 44), (3, 80)))
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(214, 120, 96))
    for (ox, oy, cr) in ((-6, -4, 4), (5, 4, 3), (-2, 8, 2)):
        d.ellipse([cx + ox - cr, cy + oy - cr, cx + ox + cr, cy + oy + cr], fill=(184, 96, 80))
    off = int(2 * r * (1 - bite))
    d.ellipse([cx - r + off, cy - r - 2, cx + r + off, cy + r - 2], fill=(20, 8, 16))


def baybayin_banner(img, x, y, text, color=(230, 200, 120), size=7):
    b = baybayin_img(text, size, color, outline=(40, 20, 16))
    d = ImageDraw.Draw(img)
    d.rectangle([x - 2, y - 2, x + b.width + 1, y + b.height + 1], fill=(120, 30, 30))
    img.alpha_composite(b, (x, y))


def balangay_fleet(img, specs):
    for (x, y, s, f) in specs:
        img.alpha_composite(up(balangay(f), s), (int(x), int(y)))


def title_bg():
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (10, 10, 26), (64, 28, 44), 0, 132)
    stars(img, 110, 3, 100)
    eclipse(img, 236, 48, 24, 0.55)
    body = (40, 118, 118)
    serpent_arc(img, 236, 48, 36, 1.9, 5.3, 5, body, (196, 52, 44))
    mayon(img, 72, 132, 58, (30, 18, 34), smoke=(60, 40, 56))
    sea(img, 130, (40, 24, 44), (12, 10, 24), 5, glint=(200, 120, 110))
    moon_path(img, 236, 132, (220, 120, 100))
    balangay_fleet(img, [(160, 140, 1, 0), (30, 150, 2, 1), (244, 152, 2, 0)])
    return img


def loading_bg():
    """Loading screen: the Bakunawa coiled around the last moon over a quiet sea."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (8, 8, 22), (34, 20, 44), 0, 140)
    stars(img, 140, 11, 130)
    glow_disc(img, 160, 70, 30, (240, 200, 150))
    moon(img, 160, 70, 22)
    serpent_arc(img, 160, 70, 34, 0.4, 5.6, 6, (40, 118, 118), (196, 52, 44))
    sea(img, 136, (30, 22, 44), (10, 8, 22), 13, glint=(220, 200, 160))
    moon_path(img, 160, 136, (230, 210, 170))
    balangay_fleet(img, [(40, 150, 1, 0), (250, 154, 1, 1)])
    return img


def app_icon_art():
    """The app icon: the last moon as a red crescent, the Bakunawa coiled beneath it, a kampilan across."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    px = img.load()
    for y in range(32):
        for x in range(32):
            in_moon = (x - 15.5) ** 2 + (y - 12.5) ** 2 < 8.5 ** 2
            in_bite = (x - 20.5) ** 2 + (y - 9.5) ** 2 < 7.5 ** 2
            if in_moon and not in_bite:
                px[x, y] = (226, 104, 72, 255) if x + y < 26 else (176, 64, 50, 255)
    d = ImageDraw.Draw(img)
    d.arc([3, 6, 29, 30], 10, 175, fill=(54, 164, 160), width=3)      # coil under the moon
    d.arc([5, 8, 27, 28], 30, 150, fill=(24, 92, 104), width=1)
    for a in (40, 80, 120, 160):                                          # dorsal fins
        x = 16 + 14 * math.cos(math.radians(a))
        y = 18 + 13 * math.sin(math.radians(a))
        d.point((x, y + 1), fill=PAL["R"])
    d.ellipse([25, 13, 30, 18], fill=(54, 164, 160))                      # head rising to the moon
    d.point((27, 14), fill=PAL["X"])
    d.line([(6, 27), (23, 4)], fill=PAL["S"], width=2)                    # kampilan
    d.point([(23, 3), (25, 4)], fill=PAL["W"])
    d.line([(4, 30), (7, 26)], fill=PAL["y"], width=2)
    add_outline(img)
    return img


def dawn_bg():
    """Victory: dawn over the sea of Albay, the fleet sailing home past Mayon."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (40, 62, 110), (255, 178, 104), 0, 128)
    glow_disc(img, 220, 118, 18, (255, 220, 140), ((22, 30), (12, 50), (5, 90)))
    d = ImageDraw.Draw(img)
    d.ellipse([200, 98, 240, 138], fill=(255, 236, 170))
    d.ellipse([60, 22, 72, 34], fill=(240, 236, 220))  # the moon, whole, in the morning sky
    mayon(img, 90, 128, 60, (90, 80, 110), smoke=(220, 200, 200))
    sea(img, 126, (70, 130, 170), (30, 70, 110), 7, glint=(255, 220, 160))
    moon_path(img, 220, 128, (255, 214, 140))
    balangay_fleet(img, [(130, 128, 1, 0), (176, 136, 1, 1), (40, 142, 2, 0), (252, 146, 2, 1)])
    return img


def story_mactan():
    """April 27, 1521: Lapulapu's warriors hold the shallows of Mactan."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (90, 120, 160), (250, 190, 120), 0, 110)
    glow_disc(img, 60, 96, 14, (255, 220, 150), ((14, 30), (6, 60)))
    d = ImageDraw.Draw(img)
    d.ellipse([46, 82, 74, 110], fill=(255, 232, 170))
    sea(img, 104, (70, 120, 140), (40, 80, 100), 11, glint=(255, 230, 180))
    # three foreign ships turning away on the horizon
    for x, s in ((200, 1.0), (240, 0.8), (276, 0.7)):
        hull = (40, 30, 34)
        d.polygon([(x, 104), (x + 24 * s, 104), (x + 20 * s, 109), (x + 4 * s, 109)], fill=hull)
        for m in (0.3, 0.6):
            mx = x + 24 * s * m
            d.line([(mx, 104), (mx, 104 - 26 * s)], fill=hull)
            d.rectangle([mx - 6 * s, 104 - 24 * s, mx + 6 * s, 104 - 14 * s], fill=(200, 190, 170))
    # warriors in the shallows with kampilan and shields raised
    d.rectangle([0, 150, 320, 180], fill=(60, 90, 100))
    sil = (24, 20, 22)
    for i, x in enumerate(range(20, 300, 22)):
        h = 28 + (i * 7) % 6
        d.ellipse([x - 3, 150 - h, x + 3, 150 - h + 6], fill=sil)
        d.rectangle([x - 3, 150 - h + 6, x + 3, 156], fill=sil)
        d.line([(x + 3, 150 - h + 10), (x + 9, 150 - h - 6)], fill=(200, 210, 210), width=2)  # kampilan
        d.rectangle([x - 8, 150 - h + 8, x - 4, 150 - h + 20], fill=(90, 60, 40))           # kalasag shield
    return img


def story_maharlika():
    """Five centuries on: Tondo harbour, never conquered."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (8, 16, 32), (40, 50, 80), 0, 120)
    stars(img, 70, 13, 80)
    moon(img, 270, 30, 12)
    d = ImageDraw.Draw(img)
    # great houses with upswept roof ends, bronze lamps lit
    for i, x in enumerate((10, 70, 140, 212)):
        w = 50 + (i % 2) * 10
        base = 118
        d.rectangle([x, base - 30, x + w, base], fill=(40, 26, 24))
        d.polygon([(x - 10, base - 28), (x + w / 2, base - 64), (x + w + 10, base - 28)], fill=(70, 40, 30))
        d.line([(x - 10, base - 28), (x - 16, base - 36)], fill=(200, 150, 60), width=2)
        d.line([(x + w + 10, base - 28), (x + w + 16, base - 36)], fill=(200, 150, 60), width=2)
        for wx in range(x + 6, x + w - 4, 12):
            d.rectangle([wx, base - 22, wx + 5, base - 15], fill=(255, 196, 90))
    baybayin_banner(img, 24, 70, "ᜆᜓᜈ᜔ᜇᜓ")      # Tondo
    baybayin_banner(img, 152, 66, "ᜋᜑᜇ᜔ᜎᜒᜃ")    # Maharlika
    sea(img, 118, (20, 50, 70), (8, 22, 34), 14, glint=(255, 200, 120))
    balangay_fleet(img, [(20, 124, 2, 0), (90, 134, 2, 1), (170, 126, 2, 0), (240, 140, 3, 1)])
    return img


def story_haliya():
    """Haliya, masked goddess of moonlight, guards Bulan from the serpent."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (8, 14, 34), (30, 40, 80), 0, 140)
    stars(img, 80, 17, 120)
    moon(img, 160, 54, 34)
    sea(img, 136, (24, 40, 80), (10, 16, 36), 18, glint=(200, 210, 240))
    moon_path(img, 160, 138, (220, 220, 240))
    d = ImageDraw.Draw(img)
    # goddess silhouette, gold mask, spear raised
    gx = 160
    d.polygon([(gx - 14, 150), (gx - 6, 110), (gx + 6, 110), (gx + 14, 150)], fill=(230, 226, 240))
    d.ellipse([gx - 8, 94, gx + 8, 112], fill=(30, 22, 30))
    d.rectangle([gx - 7, 99, gx + 7, 106], fill=PAL["Y"])
    d.point([(gx - 3, 102), (gx + 3, 102)], fill=PAL["E"])
    d.line([(gx + 10, 150), (gx + 22, 76)], fill=(150, 120, 80), width=2)
    d.polygon([(gx + 21, 76), (gx + 25, 66), (gx + 25, 78)], fill=PAL["H"])
    # the serpent coiling below in the dark water
    serpent_arc(img, 100, 176, 40, 3.4, 5.9, 6, (24, 70, 76), (150, 40, 36))
    return img


def story_eclipse():
    """The moon begins to bleed; the creatures of the night come out."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (16, 6, 14), (80, 24, 32), 0, 140)
    stars(img, 40, 21, 90)
    eclipse(img, 92, 46, 20, 0.35)
    d = ImageDraw.Draw(img)
    d.polygon([(76, 44), (88, 38), (92, 46), (96, 38), (108, 44), (96, 48), (92, 54), (88, 48)], fill=(14, 6, 10))
    tree = (14, 8, 12)
    d.rectangle([236, 60, 262, 160], fill=tree)
    d.ellipse([196, 18, 316, 92], fill=tree)
    for x in range(232, 268, 4):
        d.line([(x, 80), (x + (x % 3) - 1, 150)], fill=(26, 12, 16))
    d.point([(244, 86), (252, 86)], fill=PAL["X"])
    d.line([(256, 92), (266, 90)], fill=PAL["w"])
    d.point((267, 90), fill=PAL["O"])
    d.polygon([(166, 150), (170, 118), (178, 112), (186, 114), (182, 120), (176, 122), (178, 150)], fill=tree)
    d.point((180, 116), fill=PAL["X"])
    for x in range(320):
        h = 18 + int(6 * math.sin(x * 0.2)) + (x * 7) % 5
        d.line([(x, 180 - h - 12), (x, 180)], fill=(26, 10, 14))
    for x in (24, 60, 112, 196, 290):
        d.polygon([(x - 8, 166), (x, 152), (x + 8, 166)], fill=(50, 26, 22))
        d.point([(x - 2, 160), (x + 2, 160)], fill=PAL["X"])
    nipa_hut(img, 120, 160, 26, (20, 8, 12), (90, 30, 20))
    return img


def story_call():
    """At the Tondo docks, Haliya calls four maharlika."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (10, 10, 28), (50, 26, 44), 0, 132)
    stars(img, 50, 71, 80)
    eclipse(img, 270, 34, 14, 0.4)
    sea(img, 128, (34, 24, 46), (12, 10, 24), 23, glint=(200, 120, 110))
    balangay_fleet(img, [(210, 112, 3, 0)])
    d = ImageDraw.Draw(img)
    d.rectangle([0, 146, 230, 180], fill=PAL["N"])
    for x in range(0, 230, 12):
        d.line([(x, 146), (x, 180)], fill=PAL["n"])
    glow_disc(img, 60, 112, 16, (255, 236, 170), ((26, 22), (14, 40), (6, 60)))
    sprite_at(img, rows_to_img(HALIYA), 36, 96, 3)
    for i, name in enumerate(HEROES):
        sprite_at(img, hero_frame(name, 0), 58 + i * 34, 102, 3)
    return img


def story_noise():
    """Ending I: the whole shore beats gongs and pots; the serpent lets the moon go."""
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (20, 10, 24), (80, 40, 60), 0, 110)
    stars(img, 50, 81, 80)
    moon(img, 230, 46, 22)
    sea(img, 108, (100, 30, 40), (30, 16, 30), 82, glint=(220, 140, 130))
    body = (34, 104, 104)
    hx, hy = serpent_arc(img, 220, 150, 40, 3.3, 4.9, 7, body, (190, 50, 40))
    d = ImageDraw.Draw(img)
    d.polygon([(hx - 6, hy - 4), (hx + 16, hy - 14), (hx + 12, hy + 2)], fill=body)
    d.rectangle([0, 146, 320, 180], fill=(52, 46, 48))
    agung_big(img, 70, 120, 16, cracked=False)
    sil = (20, 16, 18)
    for x, kind in ((30, "pot"), (104, "gong"), (124, "pot"), (150, "gong"), (176, "pot"), (14, "gong")):
        person(d, x, 170, sil, 18)
        d.line([(x + 2, 158), (x + 8, 150)], fill=sil, width=2)
        if kind == "pot":
            d.ellipse([x + 6, 148, x + 14, 156], fill=(90, 60, 40))
        else:
            d.ellipse([x + 6, 146, x + 16, 156], fill=PAL["y"])
    for i in range(6):  # sound rings
        r = 8 + i * 9
        d.arc([70 - r, 120 - r, 70 + r, 120 + r], -60, 30, fill=(255, 220, 160))
    return img


def story_dawn():
    """Ending II: dawn; the fleet sails home past Mayon."""
    img = dawn_bg()
    d = ImageDraw.Draw(img)
    d.polygon([(0, 166), (190, 160), (200, 180), (0, 180)], fill=(196, 168, 112))
    sprite_at(img, rows_to_img(HALIYA), 30, 136, 2)
    for i, name in enumerate(HEROES):
        sprite_at(img, hero_frame(name, 0), 62 + i * 22, 138, 2)
    return img
# ---------------------------------------------------------------- main
def main():
    import shutil
    for sub in ("sprites", "ui", "screens", "rooms", "story", "portraits", "brand"):
        shutil.rmtree(os.path.join(ASSETS, sub), ignore_errors=True)
    for name in HEROES:
        for pose, n in HERO_POSES.items():
            for f in range(n):
                save(hero_pose(name, pose, f), f"sprites/heroes/{name}_{pose}_{f}.png")
    for name, frames in ENEMIES.items():
        for f, rows in enumerate(frames):
            save(rows_to_img(rows), f"sprites/enemies/{name}_{f}.png")
    for name, rows in ENEMY_EXTRA.items():
        save(rows_to_img(rows), f"sprites/enemies/{name}.png")
    for f in range(2):
        save(bakunawa_frame(f), f"sprites/enemies/bakunawa_{f}.png")
    for name, rows in WEAPONS.items():
        save(rows_to_img(rows), f"sprites/weapons/{name}.png")
    for name, rows in PROJECTILES.items():
        save(rows_to_img(rows, 8, 8, outline=False), f"sprites/projectiles/{name}.png")
    for f in range(2):
        save(slash_fx(f), f"sprites/fx/slash_{f}.png", 4)
        save(hit_fx(f), f"sprites/fx/hit_{f}.png")
    for f in range(3):
        save(dust_fx(f), f"sprites/fx/dust_{f}.png")
        save(boom_fx(f), f"sprites/fx/boom_{f}.png")
        save(poof_fx(f), f"sprites/fx/poof_{f}.png")
    for f in range(2):
        save(sparkle_fx(f), f"sprites/fx/sparkle_{f}.png")
        save(heal_fx(f), f"sprites/fx/heal_{f}.png")
    save(ring_fx((236, 200, 120), 3), "sprites/fx/ring_shield.png", 4)
    save(ring_fx((130, 238, 214)), "sprites/fx/ring_wave.png", 4)
    save(rows_to_img(CHEST), "sprites/deco/chest_0.png")
    save(rows_to_img(CHEST_OPEN), "sprites/deco/chest_1.png")
    for name, rows in ITEMS.items():
        save(rows_to_img(rows), f"sprites/items/{name}.png")
    save(rows_to_img(DAMBANA), "sprites/deco/dambana.png")
    save(rows_to_img(AGUNG), "sprites/deco/agung.png")
    for f in range(2):
        save(balangay(f), f"sprites/deco/balangay_{f}.png")
        save(rows_to_img(shift_up(HALIYA, f)), f"sprites/npc/haliya_{f}.png")
    for theme in ISLANDS:
        save(tile_ground(theme, 3), f"sprites/tiles/ground_{theme}.png")
    save(tile_water(1), "sprites/tiles/water.png")
    save(tile_sand("pulo1", 2), "sprites/tiles/sand.png")
    save(tile_planks(), "sprites/tiles/planks.png")
    for name, rows in {**DECO, **BIG}.items():
        save(rows_to_img(rows), f"sprites/tiles/{name}.png")
    for name, (sz, rows) in UI_ICONS.items():
        save(rows_to_img(rows, sz, sz), f"ui/{name}.png")
    for name, rows in PIPS.items():
        save(rows_to_img(rows, 8, 8, outline=True), f"ui/{name}.png")
    for name, rows in BOONS.items():
        save(rows_to_img(rows), f"ui/boon_{name}.png")
    save(medallion(), "ui/medallion.png", 4)
    save(circle_img(48, (20, 16, 34), (150, 110, 70), alpha=140, ring_w=2), "ui/joystick_base.png", 4)
    save(diamond_img(22, (230, 214, 170), (120, 90, 50), alpha=235), "ui/joystick_knob.png", 4)
    save(button(BTN_ATTACK, (120, 40, 30), PAL["A"]), "ui/btn_attack.png", 4)
    save(button(BTN_DODGE, (24, 50, 60), (150, 200, 200), size=22), "ui/btn_dodge.png", 4)
    save(button(BTN_LIGHT, (60, 44, 16), PAL["Y"]), "ui/btn_skill.png", 4)
    save(button(BTN_PAUSE, (30, 26, 40), (160, 150, 170), size=22), "ui/btn_pause.png", 4)
    save(title_bg(), "screens/title_bg.png", SCREEN_SCALE)
    save(select_bg(), "screens/select_bg.png", SCREEN_SCALE)
    save(defeat_bg(), "screens/gameover_bg.png", SCREEN_SCALE)
    save(dawn_bg(), "screens/victory_bg.png", SCREEN_SCALE)
    save(loading_bg(), "screens/loading_bg.png", SCREEN_SCALE)
    save(text_img("MAHARLIKA", 4, (255, 232, 130), (210, 110, 40), depth=3), "screens/logo.png", 4)
    save(baybayin_img("ᜋᜑᜇ᜔ᜎᜒᜃ", 12, (240, 210, 130)), "screens/logo_baybayin.png", 4)
    save(text_img("NILAMON", 3, (255, 130, 110), (150, 24, 34)), "screens/gameover_text.png", 4)
    save(text_img("MALAYA!", 3, (255, 248, 200), (240, 150, 50)), "screens/victory_text.png", 4)
    save(brand_sheet(), "brand/brand_sheet.png", 4)
    save(animation_sheet(), "brand/animation_sheet.png", 4)
    save(portrait(PAL["F"], PAL["f"], PAL["D"], PAL["Q"], "short", ("putong", "vest")), "portraits/kidlat.png")
    save(portrait(PAL["F"], PAL["f"], PAL["D"], PAL["G"], "short", ("salakot", "leaf", "blush")), "portraits/liksi.png")
    save(portrait(PAL["F"], PAL["f"], PAL["D"], PAL["T"], "long", ("flower", "beads")), "portraits/mayumi.png")
    save(portrait(PAL["F"], PAL["f"], (58, 48, 50), PAL["w"], "bun", ("tapis", "wrinkles", "streak", "earrings")), "portraits/amihan.png")
    save(portrait(PAL["F"], PAL["f"], PAL["D"], PAL["H"], "long", ("mask", "beads")), "portraits/haliya.png")
    save(portrait((176, 112, 72), (134, 80, 52), PAL["D"], PAL["D"], "short", ("tangkulo", "redtrim")), "portraits/banog.png")
    save(portrait(PAL["F"], PAL["f"], PAL["D"], PAL["B"], "short", ("kumbong", "pearls")), "portraits/dalisay.png")
    save(bakunawa_portrait(), "portraits/bakunawa.png")
    for name, fn in (("01_mactan", story_mactan), ("02_maharlika", story_maharlika), ("03_legend", story_legend),
                     ("04_haliya", story_haliya), ("05_eclipse", story_eclipse), ("06_call", story_call),
                     ("07_noise", story_noise), ("08_dawn", story_dawn)):
        save(fn(), f"story/{name}.png", SCREEN_SCALE)

    layouts = {}
    plan = [("port", "port", "port", 100)]
    for i in range(1, 5):
        for v, sfx in enumerate("ab"):
            plan.append((f"pulo{i}_{sfx}", "combat", f"pulo{i}", 200 + i * 10 + v))
    for i, theme in enumerate(("sulu", "ifugao")):
        for v, sfx in enumerate("ab"):
            plan.append((f"{theme}_{sfx}", "combat", theme, 400 + i * 10 + v))
    plan.append(("shore", "shore", "shore", 300))
    for name, kind, theme, seed in plan:
        g = make_island(seed, kind)
        layouts[name] = {"kind": kind, "grid": g}
        save(render_island(g, seed, theme), f"rooms/{name}.png", ROOM_SCALE)
    with open(os.path.join(ROOT, "src", "game", "rooms.json"), "w") as fh:
        json.dump({"tile": 16, "width": ROOM_W, "height": ROOM_H, "rooms": layouts}, fh)

    icon = app_icon()
    up(icon, 32).save(os.path.join(ASSETS, "icon.png"))
    # adaptive icon: the art sits in the middle two-thirds, the launcher's safe zone
    art = app_icon_art()
    fg = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    fg.alpha_composite(art, (8, 8))
    up(fg, 21).save(os.path.join(ASSETS, "android-icon-foreground.png"))
    bgi = Image.new("RGBA", (48, 48), (24, 14, 34, 255))
    stars(bgi, 16, 7, 48)
    up(bgi, 21).save(os.path.join(ASSETS, "android-icon-background.png"))
    mono = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    ap = art.load()
    for y in range(32):
        for x in range(32):
            if ap[x, y][3]:
                mono.putpixel((x + 8, y + 8), (255, 255, 255, 255))
    up(mono, 21).save(os.path.join(ASSETS, "android-icon-monochrome.png"))
    up(icon, 8).save(os.path.join(ASSETS, "favicon.png"))
    splash = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    splash.alpha_composite(up(art, 2), (0, 0))
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
