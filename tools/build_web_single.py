#!/usr/bin/env python3
"""Pack `npx expo export --platform web` output into one self-contained HTML page.

    npx expo export --platform web --output-dir dist
    python3 tools/build_web_single.py dist bantay.html
"""
import base64, glob, os, re, sys
dist, out = sys.argv[1], sys.argv[2]
js_path = glob.glob(os.path.join(dist, '_expo/static/js/web/*.js'))[0]
js = open(js_path, encoding='utf-8').read()
MIME = {'.png': 'image/png', '.ttf': 'font/ttf'}
n = 0
def repl(m):
    global n
    rel = m.group(1)
    p = os.path.join(dist, rel.lstrip('/'))
    data = base64.b64encode(open(p, 'rb').read()).decode()
    n += 1
    return '"data:%s;base64,%s"' % (MIME[os.path.splitext(p)[1]], data)
js = re.sub(r'"(/assets/[^"]+\.(?:png|ttf))"', repl, js)
assert '"/assets/' not in js, 'unreplaced asset path'
js = js.replace('</script', '<\\/script')
html = '''<title>Bantay</title>
<meta name="description" content="Guardians of the Barrio: a pixel folklore roguelike">
<style>
/* Layout: the game fills the frame edge to edge; one controls hint floats bottom-center. Single dark arcade look by choice. */
:root {
  --void: #050c10;
  --ink: #fffcec;
  --gold: #ffba48;
  --violet: #36a4a0;
  --panel: rgba(10, 24, 30, 0.92);
  --hint-font: "Pixelify Sans", ui-monospace, "SFMono-Regular", Menlo, monospace;
  color-scheme: dark;
}
html, body { height: 100%; }
body { margin: 0; background: var(--void); color: var(--ink); overflow: hidden; }
#root { display: flex; height: 100%; flex: 1; }
.hint {
  position: fixed; left: 50%; bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  max-width: calc(100% - 32px);
  display: flex; flex-wrap: wrap; gap: 6px 14px; justify-content: center;
  padding: 8px 12px; background: var(--panel); border: 2px solid var(--violet);
  font: 13px/1.4 var(--hint-font); letter-spacing: 0.04em; color: var(--ink);
  pointer-events: none; z-index: 10; transition: opacity 0.6s;
}
.hint b { color: var(--gold); font-weight: 400; }
.hint.gone { opacity: 0; }
.rotate {
  position: fixed; inset: 0; z-index: 20; display: none;
  align-items: center; justify-content: center; flex-direction: column; gap: 14px;
  background: var(--void); color: var(--ink); text-align: center; padding: 0 16px;
  font: 15px/1.6 var(--hint-font);
}
.rotate b { color: var(--gold); font-weight: 700; font-size: 20px; }
.rotate button {
  font: 14px var(--hint-font); color: var(--ink); background: transparent;
  border: 2px solid var(--violet); padding: 10px 14px; cursor: pointer;
}
.rotate button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
@media (orientation: portrait) and (pointer: coarse) { body:not(.portrait-ok) .rotate { display: flex; } }
@media (pointer: coarse) { .hint.keys { display: none; } }
@media (prefers-reduced-motion: reduce) { .hint { transition: none; } }
</style>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&display=swap">
<div id="root"></div>
<div class="hint keys" id="hint"><span><b>WASD</b> move</span><span><b>SPACE</b> shoot</span><span><b>K</b> skill</span><span><b>Q</b> swap / pick up</span><span><b>ESC</b> pause</span></div>
<div class="rotate" role="dialog" aria-label="Rotate your phone">
  <b>ROTATE YOUR PHONE</b>
  <span>Bantay plays in landscape.</span>
  <button type="button" id="portrait-ok">PLAY ANYWAY</button>
</div>
<script>
(function () {
  var hint = document.getElementById('hint');
  setTimeout(function () { hint.classList.add('gone'); }, 9000);
  document.getElementById('portrait-ok').addEventListener('click', function () { document.body.classList.add('portrait-ok'); });
  window.addEventListener('pointerdown', function () { window.focus(); });
})();
</script>
<script>
''' + js + '''
</script>
'''
open(out, 'w', encoding='utf-8').write(html)
print('inlined', n, 'assets;', round(len(html) / 1e6, 2), 'MB')
