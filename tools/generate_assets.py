#!/usr/bin/env python3
"""Soul Night asset generator.

Every piece of art in the game is defined here as a hand-drawn pixel map
(or a small procedural routine) and rendered to PNG with nearest-neighbour
upscaling so it stays crisp on high-density Android screens.

    python3 tools/generate_assets.py

Outputs:
    assets/sprites/**    characters, enemies, weapons, projectiles, items, tiles
    assets/ui/**         HUD icons and touch controls
    assets/screens/**    title / select / game over / victory backgrounds, logo
    assets/rooms/**      pre-rendered dungeon rooms
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
PAL = {
    "K": (20, 16, 32),       # outline
    "k": (52, 40, 70),       # deep shade
    "W": (255, 255, 255),
    "w": (196, 206, 228),
    "S": (178, 188, 208),    # steel
    "s": (108, 116, 140),    # steel shade
    "R": (220, 52, 64),
    "r": (132, 28, 46),
    "O": (244, 142, 40),
    "Y": (252, 216, 84),
    "y": (192, 140, 40),
    "G": (98, 204, 92),
    "g": (40, 122, 62),
    "B": (72, 122, 232),
    "b": (40, 60, 142),
    "C": (96, 224, 244),
    "c": (40, 140, 172),
    "P": (156, 84, 214),
    "p": (90, 42, 142),
    "N": (146, 94, 52),
    "n": (92, 58, 34),
    "F": (252, 204, 164),
    "f": (222, 150, 120),
    "E": (28, 20, 40),
    "M": (244, 112, 184),
    "H": (238, 232, 212),
    "h": (176, 168, 148),
    "V": (120, 244, 255),
    "X": (255, 72, 72),
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


def save(img, rel, scale=SPRITE_SCALE):
    path = os.path.join(ASSETS, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out = up(img, scale) if scale > 1 else img
    out.save(path, optimize=True)
    MANIFEST.append((rel, img))
    return img


MANIFEST = []

# ---------------------------------------------------------------- heroes
# Each hero: body rows 0..13, plus two leg rows for a 2-frame walk cycle.
HEROES = {
    "knight": {
        "body": [
            "................",
            "......RR........",
            ".....RRSSSS.....",
            "....SSSSSSSS....",
            "...SSWSSSSSSs...",
            "...SSSSSSSSSs...",
            "...SSKKKKKKSs...",
            "...SSKVVKVVSs...",
            "...sSSSSSSSSs...",
            "....ssssssss....",
            "...BBbSSSSbBB...",
            "..FBBbSYYSbBBF..",
            "...BbsSSSSsbB...",
            "....ssSSSSss....",
        ],
        "legs": ["....nn....nn....", ".....nn..nn....."],
    },
    "rogue": {
        "body": [
            "................",
            "................",
            ".....gggggg.....",
            "....gGGGGGGg....",
            "...gGGGGGGGGg...",
            "...gGFFFFFFGg...",
            "...gGFEFFEFGg...",
            "...gGkkkkkkGg...",
            "....gkkkkkkg....",
            "....nggggggn....",
            "...ngGGNNGGgn...",
            "..FngGGyyGGgnF..",
            "...nggGGGGggn...",
            "....ggggggggg...",
        ],
        "legs": ["....kk....kk....", ".....kk..kk....."],
    },
    "wizard": {
        "body": [
            ".......P........",
            "......PPp.......",
            ".....PPPPp......",
            "....PPYPPPp.....",
            "..pPPPPPPPPPp...",
            "...FFFFFFFFf....",
            "...FEFFFFEFf....",
            "...wWWWWWWWw....",
            "....wWWWWWw.....",
            "...PPwWWWwPP....",
            "..PPPPwWwPPPP...",
            "..FPPPPYPPPPF...",
            "...pPPPPPPPp....",
            "...ppppppppp....",
        ],
        "legs": ["....nn...nn.....", ".....nn.nn......"],
    },
    "priestess": {
        "body": [
            "................",
            ".....YYYYYY.....",
            "....YYYYYYYY....",
            "...YYYWYYYYYy...",
            "...YYFFFFFFYy...",
            "...YFFFFFFFFy...",
            "...YFEFFFFEFy...",
            "...YFMFFFFMFy...",
            "...yYFFFFFFYy...",
            "...yyWWWWWWyy...",
            "...WWWWYYWWWW...",
            "..FWWWWYYWWWWF..",
            "...wWWWWWWWWw...",
            "...wwwwwwwwww...",
        ],
        "legs": ["....FF....FF....", ".....FF..FF....."],
    },
}

# ---------------------------------------------------------------- enemies
ENEMIES = {
    "slime": [
        [
            "", "", "", "", "", "",
            "......GGGG......",
            "....GGGGGGGG....",
            "...GGWWGGGGGG...",
            "..GGGWGGGGGGGG..",
            "..GGGEGGGGEGGG..",
            "..GGGEGGGGEGGG..",
            "..GGGGGGGGGGGG..",
            "..gGGGGGGGGGGg..",
            "...gggggggggg...",
        ],
        [
            "", "", "", "", "", "", "", "",
            ".....GGGGGG.....",
            "...GGGWWGGGGG...",
            "..GGGWGGGGGGGG..",
            ".GGGGEGGGGEGGGG.",
            ".GGGGEGGGGEGGGG.",
            ".gGGGGGGGGGGGGg.",
            "..gggggggggggg..",
        ],
    ],
    "bat": [
        [
            "", "", "",
            ".P............P.",
            ".PP..p....p..PP.",
            ".PPP.pppppp.PPP.",
            ".PPPPpXppXpPPPP.",
            "..PPPppppppPPP..",
            "...PPpHppHpPP...",
            "....P.pppp.P....",
        ],
        [
            "", "", "", "",
            ".....p....p.....",
            ".....pppppp.....",
            "....ppXppXpp....",
            "..PPPppppppPPP..",
            ".PPPPpHppHpPPPP.",
            ".PPP..pppp..PPP.",
            ".PP..........PP.",
            ".P............P.",
        ],
    ],
    "goblin": [
        [
            "", "", "",
            ".....GGGGGG.....",
            ".G..GGGGGGGG..G.",
            ".GGGGGGGGGGGGGG.",
            "..GGGWEGGWEGGG..",
            "...GGGGGGGGGG...",
            "...GgGHGGHGgG...",
            "....GGGGGGGG....",
            "...NNnNNNNnNN...",
            "..GNNNNyyNNNNG..",
            "...nNNNNNNNNn...",
            "....nnnnnnnn....",
            "....gg....gg....",
        ],
        None,  # derived: alternate legs
    ],
    "skeleton": [
        [
            "", "",
            ".....HHHHHH.....",
            "....HHHHHHHH....",
            "...HHHHHHHHHH...",
            "...HHEEHHEEHh...",
            "...HHEXHHEXHh...",
            "...hHHHHHHHHh...",
            "....hHEHEHHh....",
            ".....hhhhhh.....",
            "...HHhHHHHhHH...",
            "..Hh.HhhhhH.hH..",
            ".....hHHHHh.....",
            ".....H....H.....",
            ".....H....H.....",
        ],
        None,
    ],
}


def derive_walk(rows, legs_alt):
    r = list(rows)
    while len(r) < 15:
        r.append("")
    r[14] = legs_alt
    return r


ENEMIES["goblin"][1] = derive_walk(ENEMIES["goblin"][0], ".....gg..gg.....")
ENEMIES["skeleton"][1] = derive_walk(ENEMIES["skeleton"][0], "......H..H......")


def boss_frame(f):
    """Shadow Lord, 32x32, drawn procedurally then outlined."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    sway = 1 if f else 0
    # cape
    d.polygon([(8, 12), (23, 12), (27 + sway, 30), (4 - sway, 30)], fill=PAL["p"])
    d.polygon([(10, 13), (21, 13), (24 + sway, 29), (7 - sway, 29)], fill=PAL["k"])
    # armour body
    d.rectangle([11, 14, 20, 26], fill=PAL["s"])
    d.rectangle([12, 15, 19, 25], fill=PAL["k"])
    d.rectangle([13, 16, 18, 18], fill=PAL["s"])
    # pauldrons
    d.ellipse([6, 12, 12, 17], fill=PAL["s"])
    d.ellipse([19, 12, 25, 17], fill=PAL["s"])
    d.point([(8, 13), (21, 13)], fill=PAL["w"])
    # chest gem
    gem = PAL["X"] if f else PAL["R"]
    d.rectangle([15, 20, 16, 21], fill=gem)
    # belt
    d.rectangle([12, 23, 19, 23], fill=PAL["y"])
    # legs
    d.rectangle([12, 27, 14, 30], fill=PAL["k"])
    d.rectangle([17, 27, 19, 30], fill=PAL["k"])
    # helmet
    d.rectangle([11, 4, 20, 12], fill=PAL["s"])
    d.rectangle([12, 5, 19, 11], fill=PAL["k"])
    d.rectangle([12, 4, 19, 5], fill=PAL["S"])
    # horns
    d.polygon([(11, 6), (7, 1 - sway), (9, 6)], fill=PAL["H"])
    d.polygon([(20, 6), (24, 1 - sway), (22, 6)], fill=PAL["H"])
    # eyes
    eye = PAL["X"] if f else PAL["R"]
    d.rectangle([13, 8, 14, 8], fill=eye)
    d.rectangle([17, 8, 18, 8], fill=eye)
    # sword
    d.rectangle([26, 10, 26, 24], fill=PAL["S"])
    d.rectangle([27, 10, 27, 24], fill=PAL["w"])
    d.rectangle([24, 22, 29, 22], fill=PAL["y"])
    d.rectangle([26, 23, 27, 27], fill=PAL["n"])
    d.ellipse([22, 23, 26, 27], fill=PAL["s"])  # gauntlet
    add_outline(img)
    return img


# ---------------------------------------------------------------- weapons
WEAPONS = {
    "pistol": [
        "", "", "", "", "",
        "................",
        "...sSSSSSSSSS...",
        "...sSWWWWWWSS...",
        "...sSSSSSSSSs...",
        "...snnn.........",
        "....nnn.........",
        "....nn..........",
    ],
    "shotgun": [
        "", "", "", "", "",
        "................",
        "..nNNNsSSSSSSSS.",
        ".nNNNNssssssss..",
        ".nn..NN.........",
        ".n...N..........",
    ],
    "rifle": [
        "", "", "", "",
        "......ss........",
        ".nnNNsSSSSSSSSs.",
        ".nNNNsSSSWSSSs..",
        ".n...ss.ss......",
        ".....s..s.......",
    ],
    "staff": [
        "", "", "", "", "",
        "............CC..",
        "..nnnnNNNNNNCWC.",
        "..nNNNNNNNNNCCC.",
        "............CC..",
    ],
}

# ---------------------------------------------------------------- projectiles (8x8)
PROJECTILES = {
    "bullet_player": [
        "........",
        "..YYYY..",
        ".YWWWWY.",
        ".YWWWWY.",
        "..YYYY..",
    ],
    "bullet_enemy": [
        "........",
        "..RRR...",
        ".RMMMR..",
        ".RMWMR..",
        ".RMMMR..",
        "..RRR...",
    ],
    "bullet_magic": [
        "........",
        "..CCC...",
        ".CVVVC..",
        ".CVWVC..",
        ".CVVVC..",
        "..CCC...",
    ],
    "bullet_pellet": [
        "........",
        "........",
        "...OO...",
        "..OYYO..",
        "...OO...",
    ],
}

# ---------------------------------------------------------------- items
ITEMS = {
    "coin": [
        "", "", "", "",
        "......YYYY......",
        ".....YWYYYy.....",
        ".....YWYyYy.....",
        ".....YYYyYy.....",
        ".....YYYyYy.....",
        ".....yYYYYy.....",
        "......yyyy......",
    ],
    "energy_orb": [
        "", "", "", "",
        ".......C........",
        "......CVC.......",
        ".....CVWVC......",
        "......CVC.......",
        ".......C........",
    ],
    "potion_health": [
        "", "", "",
        "......nnn.......",
        "......www.......",
        ".......w........",
        "......wRw.......",
        ".....wRWRw......",
        ".....wRRRw......",
        ".....wrRRw......",
        "......www.......",
    ],
    "potion_energy": [
        "", "", "",
        "......nnn.......",
        "......www.......",
        ".......w........",
        "......wBw.......",
        ".....wBWBw......",
        ".....wBBBw......",
        ".....wbBBw......",
        "......www.......",
    ],
    "chest_closed": [
        "", "", "", "",
        "...NNNNNNNNNN...",
        "..NyyyyyyyyyyN..",
        "..NNNNNNNNNNNN..",
        "..nnnnnYYnnnnn..",
        "..NNNNNYyNNNNN..",
        "..NyNNNNNNNNyN..",
        "..NyNNNNNNNNyN..",
        "..nnnnnnnnnnnn..",
    ],
    "chest_open": [
        "", "",
        "...NNNNNNNNNN...",
        "..NyyyyyyyyyyN..",
        "..nnnnnnnnnnnn..",
        "..kkkkkkkkkkkk..",
        "..kYWYkYYkYWYk..",
        "..NNNNNNNNNNNN..",
        "..NNNNNYyNNNNN..",
        "..NyNNNNNNNNyN..",
        "..NyNNNNNNNNyN..",
        "..nnnnnnnnnnnn..",
    ],
}


def portal_frame(f):
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    px = img.load()
    cx, cy = 7.5, 7.5
    for y in range(16):
        for x in range(16):
            dx, dy = x - cx, (y - cy) * 1.15
            r = math.hypot(dx, dy)
            if r > 7.2:
                continue
            a = math.atan2(dy, dx)
            swirl = math.sin(a * 3 + r * 0.9 + f * math.pi / 2)
            if r < 2:
                c = PAL["W"]
            elif swirl > 0.3:
                c = PAL["M"] if r < 4.5 else PAL["P"]
            elif swirl > -0.4:
                c = PAL["P"]
            else:
                c = PAL["p"]
            px[x, y] = c + (255,)
    add_outline(img, PAL["k"])
    return img


# ---------------------------------------------------------------- tiles
def tile_floor(seed):
    rnd = random.Random(seed)
    img = Image.new("RGBA", (16, 16), (58, 52, 80, 255))
    d = ImageDraw.Draw(img)
    base = (62, 56, 86)
    hi = (74, 68, 100)
    lo = (46, 40, 66)
    d.rectangle([0, 0, 15, 15], fill=base)
    # slab seams
    d.line([(0, 15), (15, 15)], fill=lo)
    d.line([(15, 0), (15, 15)], fill=lo)
    d.line([(0, 0), (14, 0)], fill=hi)
    d.line([(0, 0), (0, 14)], fill=hi)
    for _ in range(6):
        x, y = rnd.randrange(1, 15), rnd.randrange(1, 15)
        img.putpixel((x, y), rnd.choice([hi, lo]) + (255,))
    if seed % 5 == 1:  # crack
        x, y = rnd.randrange(3, 10), rnd.randrange(3, 10)
        for i in range(4):
            img.putpixel((x + i, y + (i % 2)), lo + (255,))
    if seed % 7 == 3:  # moss
        for _ in range(5):
            img.putpixel((rnd.randrange(1, 15), rnd.randrange(10, 15)),
                         (60, 110, 70, 255))
    return img


def tile_wall_face():
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    mortar = (36, 30, 52)
    brick = (96, 84, 124)
    brick_hi = (118, 106, 148)
    d.rectangle([0, 0, 15, 15], fill=mortar)
    for row in range(4):
        y0 = row * 4
        off = 0 if row % 2 == 0 else 4
        for bx in range(-1, 3):
            x0 = bx * 8 + off
            d.rectangle([x0, y0, x0 + 6, y0 + 2], fill=brick)
            d.line([(x0, y0), (x0 + 6, y0)], fill=brick_hi)
    d.rectangle([0, 14, 15, 15], fill=(28, 22, 40))
    return img


def tile_wall_top():
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 15, 15], fill=(34, 28, 50))
    d.rectangle([1, 1, 14, 14], fill=(44, 38, 64))
    d.point([(4, 4), (11, 9), (7, 12)], fill=(56, 50, 78))
    return img


def tile_crate():
    return rows_to_img([
        "",
        ".NNNNNNNNNNNNNN.",
        ".NyyyyyyyyyyyyN.",
        ".NynNNNNNNNNnyN.",
        ".NyNnNNNNNNnNyN.",
        ".NyNNnNNNNnNNyN.",
        ".NyNNNnNNnNNNyN.",
        ".NyNNNNnnNNNNyN.",
        ".NyNNNNnnNNNNyN.",
        ".NyNNNnNNnNNNyN.",
        ".NyNNnNNNNnNNyN.",
        ".NyNnNNNNNNnNyN.",
        ".NynNNNNNNNNnyN.",
        ".NyyyyyyyyyyyyN.",
        ".nnnnnnnnnnnnnn.",
    ])


def tile_pillar():
    return rows_to_img([
        "",
        "...SSSSSSSSSS...",
        "...wwwwwwwwww...",
        "....SsSSSSsS....",
        "....SsSSSSsS....",
        "....SsSSSSsS....",
        "....SsSSSSsS....",
        "....SsSSSSsS....",
        "....SsSSSSsS....",
        "....SsSSSSsS....",
        "....SsSSSSsS....",
        "....SsSSSSsS....",
        "...SSSSSSSSSS...",
        "...ssssssssss...",
        "..kkkkkkkkkkkk..",
    ])


def tile_torch(f):
    flame = ["Y", "O"] if f == 0 else ["O", "Y"]
    return rows_to_img([
        "",
        "",
        f".......{flame[0]}........",
        f"......{flame[0]}{flame[1]}........",
        f"......{flame[1]}W{flame[0]}.......",
        f"......{flame[0]}{flame[1]}{flame[0]}.......",
        ".......n........",
        "......NNN.......",
        ".......n........",
        ".......n........",
        ".......n........",
    ])


# ---------------------------------------------------------------- UI icons (8x8 / 16x16)
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
    "shield": (8, [
        "SSSSSSS.",
        "SwSSSsS.",
        "SwSSSsS.",
        "SSSSSsS.",
        ".SSSsS..",
        "..SsS...",
        "...S....",
    ]),
    "energy": (8, [
        "....YY..",
        "...YY...",
        "..YYY...",
        ".YYYYYY.",
        "...YYY..",
        "...YY...",
        "..YY....",
        "..Y.....",
    ]),
    "gem": (8, [
        "..CCCC..",
        ".CWVVCC.",
        "CCVVVCCc",
        ".cCVCCc.",
        "..cCCc..",
        "...cc...",
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
        "...Y....",
        "...Y....",
        "YYYWYYY.",
        ".YYYYY..",
        "..YYY...",
        ".YY.YY..",
        ".Y...Y..",
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


def button(icon_rows, bg, ring, size=24):
    img = circle_img(size, bg, ring, alpha=200)
    icon = rows_to_img(icon_rows, 16, 16)
    img.alpha_composite(icon, ((size - 16) // 2, (size - 16) // 2))
    return img


BTN_FIRE = [
    "",
    ".......YY.......",
    ".......YY.......",
    ".....YYYYYY.....",
    "....YY.YY.YY....",
    "...YY......YY...",
    "..YY........YY..",
    "YYYYY..WW..YYYYY",
    "YYYYY..WW..YYYYY",
    "..YY........YY..",
    "...YY......YY...",
    "....YY.YY.YY....",
    ".....YYYYYY.....",
    ".......YY.......",
    ".......YY.......",
]
BTN_SKILL = [
    "",
    ".......Y........",
    "......YYY.......",
    "......YWY.......",
    ".YYYYYYWYYYYYY..",
    "..YYYYWWWYYYY...",
    "...YYYYWYYYY....",
    "....YYYYYYY.....",
    "....YYYYYYY.....",
    "...YYYY.YYYY....",
    "...YYY...YYY....",
    "..YYY.....YYY...",
    "..Y.........Y...",
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
    "....WWW..WWW....",
    "....WWW..WWW....",
    "....WWW..WWW....",
    "....WWW..WWW....",
    "....WWW..WWW....",
    "....WWW..WWW....",
    "....WWW..WWW....",
    "....WWW..WWW....",
]

# ---------------------------------------------------------------- pixel font (5x7)
FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    " ": ["00000"] * 7,
}


def text_img(text, scale, top, bottom, shadow=PAL["K"]):
    w = len(text) * 6 * scale + 2
    h = 7 * scale + 3
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    for i, ch in enumerate(text):
        glyph = FONT[ch]
        for gy, row in enumerate(glyph):
            for gx, bit in enumerate(row):
                if bit != "1":
                    continue
                for sy in range(scale):
                    for sx in range(scale):
                        x = 1 + i * 6 * scale + gx * scale + sx
                        y = 1 + gy * scale + sy
                        t = y / (7 * scale)
                        c = tuple(int(top[k] + (bottom[k] - top[k]) * t) for k in range(3))
                        px[x, y] = c + (255,)
    # drop shadow + outline
    base = img.copy()
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    for y in range(h):
        for x in range(w):
            if base.getpixel((x, y))[3] and y + 1 < h:
                sh.putpixel((x, y + 1), shadow + (255,))
    sh.alpha_composite(base)
    add_outline(sh, shadow)
    return sh


# ---------------------------------------------------------------- screens (320x180)
def dither_gradient(img, top, bottom, y0, y1, seed=0):
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
        c = rnd.choice([(255, 255, 255), (200, 210, 255), (255, 230, 180)])
        px[x, y] = c + (255,)
        if rnd.random() < 0.12 and 0 < x < img.width - 1 and 0 < y < y_max - 1:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                px[x + dx, y + dy] = (140, 150, 220, 255)


def moon(img, cx, cy, r, color=(246, 238, 210), shade=(214, 200, 170)):
    d = ImageDraw.Draw(img)
    # glow
    for gr, a in ((r + 10, 30), (r + 6, 50), (r + 3, 80)):
        glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([cx - gr, cy - gr, cx + gr, cy + gr],
                                     fill=color + (a,))
        img.alpha_composite(glow)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    for (ox, oy, cr) in ((-6, -4, 4), (5, 3, 3), (-2, 8, 2), (8, -7, 2)):
        d.ellipse([cx + ox - cr, cy + oy - cr, cx + ox + cr, cy + oy + cr], fill=shade)


def mountains(img, y_base, color, seed, amp, freq):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(img)
    phase = rnd.random() * 10
    for x in range(img.width):
        h = (math.sin(x * freq + phase) + math.sin(x * freq * 2.3 + phase * 2) * 0.5) * amp
        d.line([(x, int(y_base - h)), (x, img.height)], fill=color)


def castle(img, x0, y_base, color, window):
    d = ImageDraw.Draw(img)
    # main keep
    d.rectangle([x0, y_base - 50, x0 + 60, y_base], fill=color)
    for bx in range(x0, x0 + 61, 8):
        d.rectangle([bx, y_base - 54, bx + 4, y_base - 50], fill=color)
    # towers
    for tx, th in ((x0 - 14, 70), (x0 + 66, 64), (x0 + 24, 86)):
        d.rectangle([tx, y_base - th, tx + 12, y_base], fill=color)
        d.polygon([(tx - 3, y_base - th), (tx + 6, y_base - th - 16), (tx + 15, y_base - th)],
                  fill=color)
        d.rectangle([tx + 5, y_base - th + 10, tx + 7, y_base - th + 14], fill=window)
    # flag
    d.line([(x0 + 30, y_base - 102), (x0 + 30, y_base - 110)], fill=color)
    d.polygon([(x0 + 31, y_base - 110), (x0 + 38, y_base - 108), (x0 + 31, y_base - 106)],
              fill=PAL["R"])
    for wx, wy in ((x0 + 10, 36), (x0 + 46, 36), (x0 + 10, 22), (x0 + 46, 22)):
        d.rectangle([wx, y_base - wy, wx + 3, y_base - wy + 5], fill=window)
    # gate
    d.rectangle([x0 + 24, y_base - 18, x0 + 36, y_base], fill=(10, 8, 18))
    d.ellipse([x0 + 24, y_base - 24, x0 + 36, y_base - 12], fill=(10, 8, 18))


def ground(img, y, top, body, seed):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(img)
    d.rectangle([0, y, img.width, img.height], fill=body)
    for x in range(img.width):
        gh = rnd.choice([0, 1, 1, 2, 3])
        d.line([(x, y - gh), (x, y + 1)], fill=top)


def title_bg():
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (12, 8, 32), (70, 34, 96), 0, 180)
    stars(img, 140, 1, 110)
    moon(img, 252, 40, 20)
    mountains(img, 132, (40, 26, 66), 3, 10, 0.03)
    mountains(img, 146, (28, 18, 48), 4, 8, 0.05)
    castle(img, 128, 152, (30, 18, 50), (252, 200, 90))
    ground(img, 152, (30, 66, 52), (14, 18, 28), 5)
    # fireflies / souls
    rnd = random.Random(9)
    for _ in range(18):
        x, y = rnd.randrange(320), rnd.randrange(120, 175)
        img.putpixel((x, y), (140, 255, 240, 255))
    return img


def select_bg():
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    wall = tile_wall_face()
    top = tile_wall_top()
    for ty in range(0, 7):
        for tx in range(0, 20):
            img.alpha_composite(top if ty == 0 else wall, (tx * 16, ty * 16))
    for tx in range(0, 20):
        for ty in range(7, 12):
            img.alpha_composite(tile_floor(tx * 31 + ty * 7), (tx * 16, ty * 16))
    d = ImageDraw.Draw(img)
    # banners
    for bx, col, dark in ((40, PAL["R"], PAL["r"]), (264, PAL["B"], PAL["b"])):
        d.rectangle([bx, 18, bx + 16, 70], fill=col)
        d.rectangle([bx + 2, 18, bx + 3, 70], fill=dark)
        d.polygon([(bx, 70), (bx + 8, 62), (bx + 16, 70), (bx + 16, 78), (bx + 8, 70), (bx, 78)],
                  fill=col)
        d.rectangle([bx - 2, 16, bx + 18, 18], fill=PAL["y"])
        d.rectangle([bx + 6, 34, bx + 10, 44], fill=PAL["Y"])
    # torches
    for tx in (96, 208):
        torch = tile_torch(0)
        img.alpha_composite(up(torch, 1), (tx, 40))
        glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([tx - 18, 22, tx + 34, 74], fill=(255, 170, 60, 40))
        img.alpha_composite(glow)
    # pedestal row shadow
    d.rectangle([0, 112, 320, 114], fill=(24, 20, 36))
    # vignette
    vign = Image.new("RGBA", img.size, (0, 0, 0, 0))
    vp = vign.load()
    for y in range(180):
        for x in range(320):
            dx, dy = (x - 160) / 160, (y - 90) / 90
            a = max(0, min(170, int((dx * dx + dy * dy - 0.45) * 220)))
            vp[x, y] = (8, 4, 16, a)
    img.alpha_composite(vign)
    return img


def gameover_bg():
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (10, 4, 10), (72, 14, 24), 0, 180)
    stars(img, 40, 11, 90)
    moon(img, 160, 46, 22, color=(214, 60, 60), shade=(160, 36, 44))
    mountains(img, 140, (30, 8, 16), 12, 7, 0.04)
    ground(img, 150, (40, 20, 26), (14, 6, 10), 13)
    d = ImageDraw.Draw(img)
    # graves
    for gx, gh in ((70, 22), (120, 16), (196, 18), (246, 24)):
        d.rectangle([gx, 150 - gh, gx + 12, 152], fill=(60, 56, 72))
        d.ellipse([gx, 150 - gh - 6, gx + 12, 150 - gh + 6], fill=(60, 56, 72))
        d.rectangle([gx + 5, 150 - gh + 2, gx + 6, 150 - gh + 9], fill=(30, 26, 40))
        d.rectangle([gx + 3, 150 - gh + 4, gx + 8, 150 - gh + 5], fill=(30, 26, 40))
    # fallen sword in the ground
    d.line([(160, 128), (160, 152)], fill=PAL["S"])
    d.line([(161, 128), (161, 152)], fill=PAL["s"])
    d.rectangle([156, 132, 165, 133], fill=PAL["y"])
    return img


def victory_bg():
    img = Image.new("RGBA", (320, 180), (0, 0, 0, 255))
    dither_gradient(img, (60, 40, 110), (252, 176, 96), 0, 150)
    moon(img, 160, 120, 26, color=(255, 236, 160), shade=(255, 214, 120))
    mountains(img, 138, (120, 64, 92), 21, 9, 0.035)
    castle(img, 128, 152, (60, 30, 60), (255, 240, 170))
    ground(img, 152, (80, 160, 90), (40, 66, 50), 22)
    rnd = random.Random(23)
    for _ in range(40):  # confetti sparkles
        x, y = rnd.randrange(320), rnd.randrange(100)
        img.putpixel((x, y), rnd.choice([PAL["Y"], PAL["W"], PAL["M"], PAL["C"]]) + (255,))
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
        # keep spawn lane (left) and the portal + reward chest area clear
        if x <= 3 or (cx - 1 <= x <= cx + 4 and abs(y - cy) <= 1):
            return False
        return 2 < y < ROOM_H - 2 and 1 < x < ROOM_W - 2

    if kind == "boss":
        for (x, y) in ((4, 4), (17, 4), (4, 9), (17, 9)):
            g[y][x] = PILLAR
    elif kind == "start":
        for (x, y) in ((7, 4), (14, 4), (7, 9), (14, 9)):
            g[y][x] = PILLAR
    else:
        clusters = rnd.randint(3, 5)
        for _ in range(clusters):
            x, y = rnd.randrange(4, ROOM_W - 3), rnd.randrange(3, ROOM_H - 2)
            t = rnd.choice([CRATE, CRATE, PILLAR])
            shape = rnd.choice([[(0, 0), (1, 0)], [(0, 0), (0, 1)], [(0, 0), (1, 0), (0, 1), (1, 1)],
                                [(0, 0)], [(0, 0), (1, 0), (2, 0)]])
            for dx, dy in shape:
                if free(x + dx, y + dy):
                    g[y + dy][x + dx] = t
    return g


def render_room(g, seed):
    rnd = random.Random(seed)
    img = Image.new("RGBA", (ROOM_W * 16, ROOM_H * 16), (0, 0, 0, 255))
    face, top = tile_wall_face(), tile_wall_top()
    crate, pillar = tile_crate(), tile_pillar()
    for y in range(ROOM_H):
        for x in range(ROOM_W):
            t = g[y][x]
            pos = (x * 16, y * 16)
            if t == WALL:
                below_floor = y + 1 < ROOM_H and g[y + 1][x] != WALL
                img.alpha_composite(face if below_floor else top, pos)
            else:
                img.alpha_composite(tile_floor(rnd.randrange(1000)), pos)
                if t == CRATE:
                    img.alpha_composite(crate, pos)
                elif t == PILLAR:
                    img.alpha_composite(pillar, pos)
    # wall torches on the back wall
    for x in (5, ROOM_W // 2, ROOM_W - 6):
        img.alpha_composite(tile_torch(0), (x * 16, 16 - 2))
    # soft shadow under top wall
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([16, 32, ROOM_W * 16 - 17, 34], fill=(0, 0, 0, 70))
    return img


# ---------------------------------------------------------------- app icon / splash
def app_icon(size_art=32):
    img = Image.new("RGBA", (size_art, size_art), (0, 0, 0, 0))
    bg = circle_img(size_art, (40, 24, 70), (156, 84, 214), ring_w=2)
    img.alpha_composite(bg)
    # tiny moon
    d = ImageDraw.Draw(img)
    d.ellipse([20, 5, 26, 11], fill=(246, 238, 210))
    knight = hero_frame("knight", 0)
    img.alpha_composite(knight, (8, 10))
    return img


def hero_frame(name, f):
    h = HEROES[name]
    return rows_to_img(h["body"] + [h["legs"][f]])


# ---------------------------------------------------------------- main
def main():
    # heroes
    for name in HEROES:
        for f in range(2):
            save(hero_frame(name, f), f"sprites/heroes/{name}_{f}.png")
    # enemies
    for name, frames in ENEMIES.items():
        for f, rows in enumerate(frames):
            save(rows_to_img(rows), f"sprites/enemies/{name}_{f}.png")
    for f in range(2):
        save(boss_frame(f), f"sprites/enemies/boss_{f}.png")
    # weapons
    for name, rows in WEAPONS.items():
        save(rows_to_img(rows), f"sprites/weapons/{name}.png")
    # projectiles
    for name, rows in PROJECTILES.items():
        save(rows_to_img(rows, 8, 8, outline=False), f"sprites/projectiles/{name}.png")
    # items
    for name, rows in ITEMS.items():
        save(rows_to_img(rows), f"sprites/items/{name}.png")
    for f in range(4):
        save(portal_frame(f), f"sprites/items/portal_{f}.png")
    # tiles
    save(tile_floor(0), "sprites/tiles/floor_0.png")
    save(tile_floor(1), "sprites/tiles/floor_1.png")
    save(tile_floor(3), "sprites/tiles/floor_2.png")
    save(tile_wall_face(), "sprites/tiles/wall_face.png")
    save(tile_wall_top(), "sprites/tiles/wall_top.png")
    save(tile_crate(), "sprites/tiles/crate.png")
    save(tile_pillar(), "sprites/tiles/pillar.png")
    for f in range(2):
        save(tile_torch(f), f"sprites/tiles/torch_{f}.png")
    # ui
    for name, (sz, rows) in UI_ICONS.items():
        save(rows_to_img(rows, sz, sz, outline=True), f"ui/{name}.png")
    save(circle_img(48, (30, 24, 50), (120, 110, 160), alpha=140, ring_w=2), "ui/joystick_base.png", 4)
    save(circle_img(20, (200, 196, 230), (90, 80, 130), alpha=230, ring_w=2), "ui/joystick_knob.png", 4)
    save(button(BTN_FIRE, (120, 30, 40), (240, 90, 90)), "ui/btn_fire.png", 4)
    save(button(BTN_SKILL, (40, 60, 140), (110, 160, 255)), "ui/btn_skill.png", 4)
    save(button(BTN_SWAP, (50, 50, 70), (150, 150, 180)), "ui/btn_swap.png", 4)
    save(button(BTN_PAUSE, (50, 50, 70), (150, 150, 180)), "ui/btn_pause.png", 4)
    # screens
    save(title_bg(), "screens/title_bg.png", SCREEN_SCALE)
    save(select_bg(), "screens/select_bg.png", SCREEN_SCALE)
    save(gameover_bg(), "screens/gameover_bg.png", SCREEN_SCALE)
    save(victory_bg(), "screens/victory_bg.png", SCREEN_SCALE)
    save(text_img("SOUL NIGHT", 3, (252, 236, 150), (236, 110, 60)), "screens/logo.png", 4)
    save(text_img("GAME OVER", 3, (255, 120, 120), (150, 20, 40)), "screens/gameover_text.png", 4)
    save(text_img("VICTORY!", 3, (255, 250, 190), (240, 170, 40)), "screens/victory_text.png", 4)
    # rooms
    layouts = {}
    plan = [("start", "start", 100), ("room_a", "combat", 201), ("room_b", "combat", 202),
            ("room_c", "combat", 203), ("room_d", "combat", 204), ("room_e", "combat", 205),
            ("boss", "boss", 300)]
    for name, kind, seed in plan:
        g = make_layout(seed, kind)
        layouts[name] = {"kind": kind, "grid": g}
        save(render_room(g, seed), f"rooms/{name}.png", ROOM_SCALE)
    with open(os.path.join(ROOT, "src", "game", "rooms.json"), "w") as fh:
        json.dump({"tile": 16, "width": ROOM_W, "height": ROOM_H, "rooms": layouts}, fh)
    # app icon & splash
    icon = app_icon()
    up(icon, 32).save(os.path.join(ASSETS, "icon.png"))
    fg = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    fg.alpha_composite(hero_frame("knight", 0), (8, 8))
    up(fg, 32).save(os.path.join(ASSETS, "android-icon-foreground.png"))
    bgi = Image.new("RGBA", (32, 32), (40, 24, 70, 255))
    stars(bgi, 10, 7, 32)
    up(bgi, 32).save(os.path.join(ASSETS, "android-icon-background.png"))
    mono = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    k = hero_frame("knight", 0)
    kp = k.load()
    for y in range(16):
        for x in range(16):
            if kp[x, y][3]:
                mono.putpixel((x + 8, y + 8), (255, 255, 255, 255))
    up(mono, 32).save(os.path.join(ASSETS, "android-icon-monochrome.png"))
    up(icon, 8).save(os.path.join(ASSETS, "favicon.png"))
    splash = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    splash.alpha_composite(up(hero_frame("knight", 0), 2), (16, 12))
    up(splash, 16).save(os.path.join(ASSETS, "splash-icon.png"))

    contact_sheet()
    write_registry()
    print(f"generated {len(MANIFEST)} assets")


def contact_sheet():
    cell = 72
    cols = 12
    small = [(r, i) for r, i in MANIFEST if i.width <= 32]
    big = [(r, i) for r, i in MANIFEST if i.width > 32]
    rows = math.ceil(len(small) / cols)
    big_h = 0
    big_imgs = []
    for _, im in big:
        s = 1 if im.width >= 300 else 4
        big_imgs.append(up(im, s) if s > 1 else im)
    W = cols * cell
    layout = []
    x = y = 0
    rowh = 0
    for im in big_imgs:
        im = im.resize((im.width * 2, im.height * 2), Image.NEAREST) if im.width < 400 else im
        if im.width > W:
            ratio = W / im.width
            im = im.resize((W, int(im.height * ratio)), Image.NEAREST)
        if x + im.width > W:
            x, y = 0, y + rowh + 6
            rowh = 0
        layout.append((im, x, y))
        x += im.width + 6
        rowh = max(rowh, im.height)
    big_h = y + rowh + 6
    sheet = Image.new("RGBA", (W, rows * cell + big_h + 8), (24, 20, 36, 255))
    for i, (_, im) in enumerate(small):
        s = 4 if im.width <= 16 else 2
        if im.width <= 8:
            s = 6
        t = up(im, s)
        cx = (i % cols) * cell + (cell - t.width) // 2
        cy = (i // cols) * cell + (cell - t.height) // 2
        sheet.alpha_composite(t, (cx, cy))
    for im, bx, by in layout:
        sheet.alpha_composite(im, (bx, rows * cell + 8 + by))
    sheet.save(os.path.join(ASSETS, "preview.png"))


def write_registry():
    """Emit src/assets.ts with static requires (Metro needs literal paths)."""
    groups = {}
    for root, _, files in os.walk(ASSETS):
        for f in sorted(files):
            rel = os.path.relpath(os.path.join(root, f), ASSETS).split(os.sep)
            if f.endswith(".png") and len(rel) >= 2:
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
