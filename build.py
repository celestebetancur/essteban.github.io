import sys, html
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
E = html.escape

NAV = [("music.html", "Music"), ("works.html", "Works"), ("code.html", "Code"),
       ("teaching.html", "Teaching"), ("instruments.html", "Instruments"), ("press.html", "Press")]

def page(fname, title, desc, body, extra_js=""):
    cur = ' aria-current="page"'
    nav = "".join(f'<li><a href="{h}"{cur if h == fname else ""}>{l}</a></li>' for h, l in NAV)
    full_title = "Celeste Betancur" if fname == "index.html" else f"{title} — Celeste Betancur"
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{E(desc)}">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:image" content="https://www.celestebetancur.com/img/portrait.jpg">
<meta name="theme-color" content="#f3f0e8">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="site.css">
</head>
<body{' class="home"' if fname == 'index.html' else ''}>
<canvas id="attractor" aria-hidden="true"></canvas>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="name" href="index.html">Celeste Betancur</a>
    <nav class="site-nav" aria-label="Main"><ul>{nav}</ul></nav>
  </div>
</header>
<main id="main">
{body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <ul>
      <li><a href="https://www.instagram.com/essteb/">Instagram</a></li>
      <li><a href="https://www.youtube.com/@essteb">YouTube</a></li>
      <li><a href="https://celestebetancur.bandcamp.com/">Bandcamp</a></li>
      <li><a href="https://github.com/celestebetancur">GitHub</a></li>
      <li><a href="https://www.facebook.com/celestebmusic">Facebook</a></li>
      <li><a href="https://twitter.com/essteb">X / Twitter</a></li>
    </ul>
    <p class="meta">© 2026 Celeste Betancur</p>
  </div>
</footer>
<script src="site.js" defer></script>
<script src="threejs/three.min.js" defer></script>
<script src="attractor.js" defer></script>{extra_js}
</body>
</html>
"""
    open(f"{OUT}/{fname}", "w").write(doc)

def yt_link(vid, cap="", start=None):
    s = f' data-start="{start}"' if start else ""
    t = f"&t={start}s" if start else ""
    label = E(cap) if cap else "video"
    return (f'<a class="yt" href="https://www.youtube.com/watch?v={vid}{t}" data-id="{vid}"{s} aria-label="Play {label}">'
            f'<img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"></a>')

def yt(vid, cap="", start=None, capdesc=None):
    fc = capdesc if capdesc else (f"<figcaption>{E(cap)}</figcaption>" if cap else "")
    return f"<figure>{yt_link(vid, cap, start)}{fc}</figure>"

def head(title, lede, jumps=()):
    j = ""
    if jumps:
        j = '<p class="jump">' + "".join(f'<a href="#{a}">{l}</a>' for a, l in jumps) + "</p>"
    return f'<div class="wrap"><header class="page-head"><h1>{title}</h1><p class="lede">{lede}</p>{j}</header></div>'

def section(id_, label, title, inner, intro=""):
    p = f"<p>{intro}</p>" if intro else ""
    return (f'<section class="section" id="{id_}"><div class="wrap">'
            f'<div class="section-head"><span class="label">{label}</span><h2>{title}</h2>{p}</div>{inner}</div></section>')

# ------------------------------------------------------------------ data
EVENTS = {
 "2026": [
  ("Oct 9", "Low Frequency Trio", "CCRMA, Stanford CA", "Verso V"),
  ("Oct 3", "Transitions: Primrose Ohling and Celeste", "CCRMA, Stanford CA", "From Within You"),
  ("Sep 29", "Morton Feldman Centenary: Blackbox Ensemble", "CCRMA, Stanford CA", "Stranded"),
  ("Jun 13", "Inorganic Organ Transmutations", "Fountain Street Church, Grand Rapids MI", "Aeon Sophia I"),
  ("Jan", "The Return of the Amps", "Bing Studio, Stanford CA", "Verso III"),
  ("Jan", "Ensemble Mosaik", "CCRMA, Stanford CA", "Verso II")],
 "2025": [
  ("Oct", "Transitions 2025", "CCRMA, Stanford CA", "Verso I"),
  ("Oct", "Decipher SF × Concrete Cut", "San Francisco CA", "Algorave live set"),
  ("Oct", "SLORK: The House of the Champions", "Stanford CA", ""),
  ("Oct", "Frontiers of Creation", "San Francisco CA", "Algorave live set"),
  ("Jun", "Future Phases", "MIT, Cambridge MA", "A Blank Page III"),
  ("May", "Zac Dulkin", "CCRMA, Stanford CA", ""),
  ("Apr", "The Big Spring Installation Showcase", "CCRMA, Stanford CA", ""),
  ("Apr", "Departure Duo", "CCRMA, Stanford CA", "Mi compañera invisible"),
  ("Feb", "Juana Monsalve", "Bogotá, Colombia", "Mi compañera invisible"),
  ("Feb", "Niloufar Shiri", "CCRMA, Stanford CA", "A Blank Page II")],
 "2024": [
  ("Nov", "Post Transferencias Aurales", "Mexico City", "Algorave live set"),
  ("Nov", "Venas Rotas", "Mexico City", "Algorave live set"),
  ("Nov", "Gray Area Algorave", "San Francisco CA", "Algorave live set"),
  ("Nov", "Distractfold", "CCRMA, Stanford CA", ""),
  ("Oct", "Resonancias Cinéticas", "Bogotá, Colombia", ""),
  ("", "Hexcode 2024", "San Francisco CA", "Algorave live set"),
  ("Sep", "Fake and Gay × AV Club SF", "San Francisco CA", "Algorave live set"),
  ("Sep", "Live at The Tank", "Rangely CO", ""),
  ("Aug", "Live at Grote Saint Marcel", "France", ""),
  ("Jun", "Ge Wang and Celeste", "Stanford CA", ""),
  ("May", "Linea Ensemble", "CCRMA, Stanford CA", "Semidanza para una máquina"),
  ("May", "Sounds from The Tank", "Rangely CO", ""),
  ("May", "Override", "San Francisco CA", "Algorave live set"),
  ("Apr", "CCRMA 50th Anniversary", "Bing Studio, Stanford CA", ""),
  ("Mar", "Adapter Ensemble", "CCRMA, Stanford CA", "Lo que hay detrás de los ojos de un ángel caído"),
  ("Feb", "CCRMA 50th Anniversary", "Bing Concert Hall, Stanford CA", ""),
  ("Jan", "Audiovisual Sessions", "Stanford CA", ""),
  ("Jan", "Code Punk Alchemy", "CCRMA, Stanford CA", "Algorave live set")],
 "2023": [
  ("Nov", "Algorithmic Dance Ritual", "CCRMA, Stanford CA", "Algorave live set"),
  ("Aug", "Distractfold at IKLEKTIK", "London, UK", ""),
  ("Aug", "AI & Musical Creativity", "Brighton, UK", ""),
  ("Aug", "Menningarnótt", "Reykjavík, Iceland", "Algorave live set"),
  ("Jun", "Elephantora, SMC 2023", "Stockholm, Sweden", ""),
  ("Jun", "SLORK at Bing Concert Hall", "Stanford CA", "Invisible Powers; In Pandora’s Hands"),
  ("Jun", "Club Code at Gray Area", "San Francisco CA", "Algorave live set"),
  ("Jun", "Algorave post-NIME", "Mexico City", "Algorave live set"),
  ("May", "NIME 2023", "Mexico City", "Pandora’s Mycophony"),
  ("Apr", "CCRMA Live at Bing", "Stanford CA", ""),
  ("", "Distractfold", "CCRMA, Stanford CA", "Madremonte"),
  ("Feb", "Algokickback", "San Francisco CA", "Algorave live set"),
  ("Jan", "JSConf Halfstack", "Phoenix AZ", "")],
 "2021": [
  ("", "Oscillation Festival", "Brussels, Belgium", "Workshop; concert with Olivia Jack"),
  ("", "NIME 2021", "Shanghai, China", "with SuperContinent")],
 "2020": [
  ("Dec 4", "Festival Santo Noise", "Córdoba, Argentina", ""),
  ("Dec 3", "Bug Festival", "Medellín, Colombia", ""),
  ("Nov 30", "Festival Real Mix", "Bogotá, Colombia", ""),
  ("Nov 23", "Culturele Zondag", "Utrecht, Netherlands", ""),
  ("Nov 9", "Boiler Room live sessions", "Amsterdam, Netherlands", ""),
  ("Jun 3", "Live at Concordia", "Montréal, Canada", ""),
  ("", "FDM Exploraciones Narrativas", "Santiago, Chile", ""),
  ("", "REUDO ’20", "Cusco, Peru", ""),
  ("", "Festival Bogotrax", "Bogotá, Colombia", "")],
 "2019": [
  ("", "Ecologías Digitales", "Medellín, Colombia", ""),
  ("", "Festival Estéticas Expandidas", "Pasto, Colombia", "")],
}

def log(groups):
    out = []
    for y, rows in groups.items():
        out.append(f'<h3 class="year">{y}</h3><ol class="log">')
        for d, t, w, p in rows:
            out.append(f'<li><span class="d">{d}</span><span class="t">{t}</span><span class="w">{w}</span><span class="p">{p}</span></li>')
        out.append("</ol>")
    return "".join(out)

YT = lambda i: f"https://www.youtube.com/watch?v={i}"
SP = lambda i: f"https://open.spotify.com/track/{i}"

WORKS = [
 ("2026", "Verso V", "Low Frequency Trio, CCRMA, Stanford", []),
 ("2026", "From Within You", "Primrose Ohling and Celeste, Transitions, CCRMA, Stanford", [("Video", YT("BzpIwX9c03g") + "&t=8s")]),
 ("2026", "Stranded", "Blackbox Ensemble, Morton Feldman Centenary, CCRMA, Stanford", [("Video", YT("rVGbD6Kp4_I"))]),
 ("2026", "Aeon Sophia I", "Fountain Street Church, Grand Rapids MI", []),
 ("", "El último verso", "Premiere, Bing Studio, Stanford", [("Video", YT("FjvB25ua3_0"))]),
 ("2026", "Verso III", "Premiere, Bing Studio, Stanford", [("Video", YT("ks5Eywk4Elw"))]),
 ("2026", "Verso II", "Ensemble Mosaik", []),
 ("2025", "Verso I", "Premiere, CCRMA, Stanford", []),
 ("2025", "Mi compañera invisible II", "Departure Duo", []),
 ("2025", "A Blank Page III", "A Far Cry, Thomas Tull Concert Hall, MIT", [("Video", YT("38-xItd2XCQ"))]),
 ("2025", "Mi compañera invisible", "Juana Monsalve, Bogotá", []),
 ("2025", "A Blank Page II", "Niloufar Shiri", [("Video", YT("ANpNSRNXevk"))]),
 ("", "A Blank Page I", "Premiere, Bing Concert Hall, Stanford", []),
 ("2024", "Resonancias cinéticas", "Leimay, Bogotá", []),
 ("2024", "Semidanza para una máquina", "Linea Ensemble", []),
 ("2024", "Beyond the Shadows Your Voice Lies", "The Tank, Rangely CO", []),
 ("2024", "Pandora (Audiovisual Sessions)", "Leimay", []),
 ("2024", "Lo que hay detrás de los ojos de un ángel caído", "Adapter Ensemble", []),
 ("2023", "Ánimas", "Distractfold Ensemble, IKLEKTIK, London", [("Video", YT("TYxYuy_d9eU"))]),
 ("2023", "Invisible Powers", "Premiere, Bing Concert Hall, Stanford", []),
 ("2023", "Pandora’s Mycophony", "Jack Armitage, Centro de Cultura Digital, Mexico City", []),
 ("2023", "In Pandora’s Hands", "Premiere, Bing Concert Hall, Stanford", []),
 ("2023", "Madremonte", "Distractfold Ensemble", [("Video", YT("AnHR8NRnFwY"))]),
]

TRACKS = [
 ("Agua — Parte I", "17:09", [("Spotify", SP("3n5jAMum3Z9cX79Hla6bfd")), ("Bandcamp", "https://celestebetancur.bandcamp.com/album/agua"), ("Score", "assets/images/gotas.jpeg")]),
 ("Agua — Parte II", "14:34", [("Spotify", SP("0M2pM9PCoxDZNZMH4iu7dB")), ("Bandcamp", "https://celestebetancur.bandcamp.com/album/agua"), ("Score", "assets/images/agua1.jpeg")]),
 ("Secretos del viento", "23:46", [("Spotify", SP("0q9H6ckC4SUVss6i4HMVV8"))]),
 ("Semillas", "1:48", [("Spotify", SP("23Ct5YPsxSle21V4CNm6fN"))]),
 ("Sortilegio I", "2:54", [("Spotify", SP("422WwEDlDzOgz6LtkbIZiY"))]),
 ("Sortilegio II", "3:14", [("Spotify", SP("29r86s5SLbuXNgzYbGDiMl"))]),
 ("Sortilegio III", "4:12", [("Spotify", SP("5dpzdhK2rfcHbm3zkSofsH"))]),
 ("Salamandras", "5:16", [("Spotify", SP("2WXBcKKTdpqC5ytGllJWpl"))]),
 ("Árboles", "3:47", [("Spotify", SP("5GUXuRvKzrIYtqUc4BRGUH"))]),
 ("Marea · En tus pies", "4:38", [("Spotify", SP("2OVdDdGT2wXmlfZR6E2jb7"))]),
 ("Ondulaciones · De viaje por tu cabello", "4:43", [("Spotify", SP("4OcEpMEOVLwYB4ZwYvYut3"))]),
 ("Vega · La luz de tus ojos", "6:11", [("Spotify", SP("1i9dYkk5rgRni6e8FCkPVh"))]),
 ("Horizonte · Una última vez", "4:24", [("Spotify", SP("4euZLpaFOlf55RSIDOozCw"))]),
 ("Órbitas · Alrededor de tu cintura", "4:26", [("Spotify", SP("6uKtqToTx8ruejKF0JXsKF"))]),
]

CINEMA = [
 ("2017", "Corpus Random Binary", "Live cinema", [("Trailer", YT("axYc-NR0ipc")), ("Full", YT("9nA_xomnhf4"))]),
 ("2018", "Imago Corpus", "Live cinema", [("Trailer", YT("Y1x84fwCjwo")), ("Full", YT("yZTCoELJNlY"))]),
 ("2019", "Sucesiones", "Live cinema", [("Trailer", YT("P80wxY1uJHc")), ("Full", YT("IWsJZfh-kYo"))]),
 ("2019", "Binary Corpus", "Live cinema", [("Full", YT("-bRijYfGmCs"))]),
 ("2021", "A/cercamientos", "Live cinema", [("Full", YT("udyOOzJ61jk"))]),
]

COLLABS = [
 ("", "Decir adiós", "feat. Luis Castro", [("Spotify", SP("2eCt1uDU7dyoTCGCNjdZze"))]),
 ("", "Beso de sal", "Remix for Agatha I", [("Spotify", SP("3Npqml1dTnhNpEPUehhwUb"))]),
 ("", "Sabalan", "Remix for Ethernet Orchestra, Oceans Reimagined", [("Pueblo Nuevo", "https://pueblonuevo.cl/catalogo/oceans-reimagined/")]),
 ("", "Hyperion", "Industrial Girls (various artists)", [("Spotify", SP("31QWYY2QIyDk0ePMTCkrZl"))]),
]

SC = lambda s: f"https://soundcloud.com/esteban-betancur/{s}"
MACHINA = [
 ("", "Reflection I", "", [("SoundCloud", SC("reflection-i"))]),
 ("", "Reflection II", "", [("SoundCloud", SC("reflectionii"))]),
 ("", "Reflection III", "", [("SoundCloud", SC("reflection-iii"))]),
 ("", "Interlude", "", [("SoundCloud", SC("interlude"))]),
 ("", "Reflection IV", "", [("SoundCloud", SC("reflection-iv")), ("Score", "assets/images/Susurros.jpeg")]),
 ("", "Reflection V", "", [("SoundCloud", SC("reflection-v-a-message"))]),
 ("", "Nubes", "", [("SoundCloud", SC("nubes-clouds"))]),
 ("", "Premoniciones", "", [("SoundCloud", SC("premoniciones"))]),
 ("", "Pieces of Synthesized Wood 1: Fractal", "", [("SoundCloud", SC("pieces-of-synthesized-wood-1-fractal")), ("Score", "assets/images/fractal.jpeg")]),
 ("", "Pieces of Synthesized Wood 2: Constant Motion", "", [("SoundCloud", SC("pieces-of-synthesized-wood-2-constant-motion")), ("Score", "assets/images/constantmotion.jpeg")]),
 ("", "A Lonely Song", "", [("SoundCloud", SC("a-lonely-song"))]),
]

def links(ls):
    return "".join(f'<a href="{u}">{l}</a>' for l, u in ls)

def worklog(rows):
    out = ['<ol class="log works">']
    for y, t, w, ls in rows:
        out.append(f'<li><span class="d">{y}</span><span class="t">{t}</span><span class="w">{w}</span><span class="links">{links(ls)}</span></li>')
    return "".join(out) + "</ol>"

# ------------------------------------------------------------------ index
recent = [(r, y) for y in ("2026", "2025") for r in EVENTS[y]][:5]
recent_html = '<ol class="log">' + "".join(
    f'<li><span class="d">{d} {y}</span><span class="t">{t}</span><span class="w">{w}</span><span class="p">{p}</span></li>'
    for (d, t, w, p), y in recent) + "</ol>"

AREAS = [
 ("music.html", "01", "Music", "Albums, concert works for ensembles, algorave sets and live-coded audiovisual performance.", "Releases, videos, 60+ concerts"),
 ("works.html", "02", "Works", "Catalogue of compositions: concert pieces, recorded works, live cinema and collaborations.", "Full list"),
 ("code.html", "03", "Code", "Software instruments: Chrysalis, CQenze, CHmUsiCK and CineVivo, plus demos you can open in a browser.", "4 projects, 3 demos"),
 ("teaching.html", "04", "Teaching", "Workshops and talks on live coding, AI and sound; Semillero CineVivo; Festival ART in Medellín.", "Talks, workshops"),
 ("instruments.html", "05", "Instruments", "Hand-built instruments, from a 24-fret guitar to Umbilical, presented at NIME 2026.", "5 instruments, 2 papers"),
 ("press.html", "06", "Press", "Interviews, and television appearances on gender identity and rights.", "Interviews, TV"),
]
areas_html = '<ol class="rows">' + "".join(
    f'<li><span class="label">{n}</span><div><h3><a href="{h}">{t}</a></h3><p>{d}</p></div><a class="go" href="{h}" aria-hidden="true" tabindex="-1">{m} →</a></li>'
    for h, n, t, d, m in AREAS) + "</ol>"

DEMOS = [
 ("https://ccrma.stanford.edu/~celeste/AetherMapper/", "AetherMapper", "Opens in the browser."),
 ("https://ccrma.stanford.edu/~celeste/CQenze/cqenze.html", "CQenze", "Write patterns and hear them, no install."),
 ("https://algorithmic-scape.art/", "Algorithmic Scape", "Opens in the browser."),
]
demos_html = '<ol class="rows">' + "".join(
    f'<li><span class="label">Demo</span><div><h3><a href="{u}">{t}</a></h3><p>{d}</p></div><a class="go" href="{u}" aria-hidden="true" tabindex="-1">Open ↗</a></li>'
    for u, t, d in DEMOS) + "</ol>"

hero = """<section class="hero" aria-label="Introduction">
  <div class="wrap">
    <div>
      <h1>Celeste Betancur</h1>
      <p class="roles">composer · live coder · instrument builder · educator</p>
      <p class="bio">Colombian artist working between notated music, code and hand-built instruments. Based at CCRMA, Stanford University.</p>
      <button class="next-shape" id="next-shape" type="button">next attractor ↻</button>
    </div>
    <figure>
      <img class="portrait" src="img/portrait.jpg" alt="Celeste Betancur in a workshop, wearing safety glasses and a respirator" width="900" height="900">
      <figcaption class="meta portrait-caption">Background: Lorenz, Chen, Chua and Rössler attractors. Drag empty space to rotate.</figcaption>
    </figure>
  </div>
</section>"""

listen = """<div class="indent"><iframe title="Secretos del viento on Spotify" style="border:0;width:100%;max-width:var(--measure);display:block" height="152" loading="lazy"
  src="https://open.spotify.com/embed/album/5Scb1zMFTqI7BHgnRYyOa9?utm_source=generator&amp;theme=0"
  allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>"""

body = hero + section("recent", "Recent", "Performances", recent_html + '<p style="margin-top:1rem"><a href="music.html#performances">All performances since 2019 →</a></p>') \
     + section("areas", "Index", "The work", areas_html) \
     + section("demos", "Try it", "In the browser", demos_html) \
     + section("listen", "Listen", "Secretos del viento", listen, "Digital album, Pueblo Nuevo Records (Chile).")
page("index.html", "Home", "Celeste Betancur: composer, live coder, instrument builder and educator based at CCRMA, Stanford.", body,
)

# ------------------------------------------------------------------ music
rel = [("img/agua.jpg", "Agua", "12″ vinyl · Poderes Inútiles (Colombia)", [("Bandcamp", "https://celestebetancur.bandcamp.com/album/agua")]),
       ("img/secretos.jpg", "Secretos del viento", "Digital album · Pueblo Nuevo Records (Chile)", [("Spotify", "https://open.spotify.com/album/5Scb1zMFTqI7BHgnRYyOa9"), ("Apple Music", "https://music.apple.com/co/album/secretos-del-viento/1571581431")]),
       ("img/texturas.jpg", "Texturas inesperadas", "Digital EP · Fragment A (Argentina)", [("Spotify", "https://open.spotify.com/album/75jQhCORlX3driTWjOtYhF"), ("Apple Music", "https://music.apple.com/co/album/texturas-inesperadas-ep/1592415845")])]
def rlinks(ls):
    return " · ".join(f'<a href="{u}">{l}</a>' for l, u in ls)
rel_html = '<div class="releases">' + "".join(
    f'<article class="release"><img src="{i}" alt="Cover of {t}" loading="lazy" width="800" height="800"><h3>{t}</h3><p class="meta">{m}</p>'
    f'<p class="links">{rlinks(ls)}</p></article>' for i, t, m, ls in rel) + "</div>"

ens = '<div class="media">' + yt("rVGbD6Kp4_I", "Stranded — Blackbox Ensemble, 2026") + yt("BzpIwX9c03g", "From Within You — Primrose Ohling and Celeste, 2026", 8) + yt("38-xItd2XCQ", "A Blank Page III — A Far Cry, MIT, 2025") + yt("ks5Eywk4Elw", "Verso III — Bing Studio, 2026") \
    + yt("FjvB25ua3_0", "El último verso — Bing Studio") + yt("AnHR8NRnFwY", "Madremonte — Distractfold Ensemble") + yt("OgAglaP5lkk", "Performance") + yt("ANpNSRNXevk", "A Blank Page II — Niloufar Shiri, 2025") + "</div>"
av = '<div class="media">' + yt("pVFir_Wxabk", "Agua — Poderes Inútiles, 2020") + yt("ZhwnpkM-piE", "Sortilegio II — Secretos del viento") + yt("LbxeCSncFxs", "Marea · En tus pies — Texturas inesperadas") + "</div>"
sets = '<div class="media">' + yt("yJCTKzVsAtA", "Live set", 356) + yt("r23RtU6RUjo", "One-hour live set, dance") + yt("wqO2b5_fR_Y", "Deshumanización (Peru) — CHmUsiCK") + "</div>"
groups = '<div class="media two">' \
    + yt("-Wld0_vez20", "Algo0ritmos at JSConf 2019", capdesc='<figcaption><strong>Algo0ritmos</strong> — Medellín live coding group. Founder, performer, visuals. JSConf 2019.</figcaption>') \
    + yt("e6_wrtPt0Ak", "SuperContinent", capdesc='<figcaption><strong>SuperContinent</strong> — live coding orchestra with members worldwide. Performer for South America.</figcaption>') + "</div>"

body = head("Music", "Concert works for ensembles, records, and live-coded sets for dancefloors and concert halls. The complete catalogue is under <a href=\"works.html\">Works</a>.",
            [("releases", "Releases"), ("ensembles", "Ensembles"), ("audiovisual", "Audiovisual"), ("sets", "Live sets"), ("groups", "Groups"), ("performances", "Performances")]) \
     + section("releases", "Records", "Releases", rel_html) \
     + section("ensembles", "Video", "Ensembles and new music", ens) \
     + section("audiovisual", "Video", "Audiovisual", av) \
     + section("sets", "Video", "Live sets", sets) \
     + section("groups", "Collectives", "Groups", groups) \
     + section("performances", "Since 2019", "Performances", log(EVENTS), "Newest first. The piece performed is in italics.")
page("music.html", "Music", "Releases, performance videos and a full list of concerts by Celeste Betancur.", body)

# ------------------------------------------------------------------ works
tracks_html = '<ol class="log tracks">' + "".join(
    f'<li><span class="t">{t}</span><span class="d">{d}</span><span class="links">{links(ls)}</span></li>' for t, d, ls in TRACKS) + "</ol>"
body = head("Works", "Catalogue of compositions, newest first.", [("concert", "Concert works"), ("recorded", "Recorded"), ("cinema", "Live cinema"), ("collabs", "Collaborations"), ("machina", "Essteb Machina")]) \
     + section("concert", "Catalogue", "Concert works", worklog(WORKS)) \
     + section("recorded", "Albums", "Recorded works", tracks_html, "From <em>Agua</em>, <em>Secretos del viento</em> and <em>Texturas inesperadas</em>.") \
     + section("cinema", "CineVivo", "Live cinema", worklog(CINEMA), "Music director and composer.") \
     + section("collabs", "With others", "Collaborations and remixes", worklog(COLLABS)) \
     + section("machina", "Earlier", "Essteb Machina", worklog(MACHINA))
page("works.html", "Works", "Complete list of compositions by Celeste Betancur.", body)

# ------------------------------------------------------------------ code
OLD_IDS = {"cinevivo": "video3-4", "cqenze": "video3-5", "chmusick": "video3-6",
           "machina": "video3-a", "semillero": "video3-8", "festival": "video3-9"}
def project(id_, name, label, desc, ls, media=""):
    l = f'<p class="links">{links(ls)}</p>' if ls else ""
    alias = f'<span id="{OLD_IDS[id_]}"></span>' if id_ in OLD_IDS else ""
    return (f'<article class="project" id="{id_}">{alias}<header><h2>{name}</h2><span class="label">{label}</span></header>'
            f'<div class="body"><p>{desc}</p>{l}{media}</div></article>')

body = head("Code", "Software for performing music and image live: languages, libraries and modules.", [("chrysalis", "Chrysalis"), ("cqenze", "CQenze"), ("chmusick", "CHmUsiCK"), ("cinevivo", "CineVivo"), ("demos", "Demos")]) \
     + '<section class="section"><div class="wrap">' \
     + project("chrysalis", "Chrysalis", "VCV Rack · ChucK", "A VCV Rack plugin that embeds the ChucK language as a module, bringing strongly-timed audio programming into a modular synthesis patch.",
               [("VCV Library ↗", "https://library.vcvrack.com/Chrysalis"), ("Source ↗", "https://github.com/celestebetancur/Chrysalis")]) \
     + project("cqenze", "CQenze", "Mini-language", "A mini-language for musical (or colour) patterns with implicit cyclic timing.",
               [("Try it ↗", "https://ccrma.stanford.edu/~celeste/CQenze/cqenze.html"), ("Source ↗", "https://github.com/essteban/CQenze"), ("Design discussion (PDF) ↗", "http://festivaldelaimagen.com/wp-content/uploads/2017/07/Esteban_Betancur.pdf")],
               '<div class="media">' + yt("ED7pLW2GA5g", "A nine-year-old live coding with CQenze") + yt("BUphefPNlVA", "Live coding with CQenze and openFrameworks") + "</div>") \
     + project("chmusick", "CHmUsiCK", "ChucK library", "ChucK + music: a library that turns ChucK into an algorave language.",
               [("Source ↗", "https://github.com/essteban/CHmUsiCK")],
               '<div class="media">' + yt("776ASlahgLk", "CHmUsiCK at ICMC 2018") + yt("afttcjZFeug", "CHmUsiCK performance") + "</div>") \
     + project("cinevivo", "CineVivo", "openFrameworks", "A concept-tool for live visual performance where code text becomes a second layer of communication and image.",
               [("Source ↗", "https://github.com/essteban/CineVivo")],
               '<div class="media">' + yt("9xkvvo16Hvg", "Workshop on CineVivo / Orbits") + yt("_yiD31xkyEg", "NIME ’18 performance, Jack Armitage & Celeste Betancur") + "</div>") \
     + "</div></section>" \
     + section("demos", "Try it", "Demos in the browser", demos_html)
page("code.html", "Code", "Chrysalis, CQenze, CHmUsiCK and CineVivo: live coding software by Celeste Betancur.", body)

# ------------------------------------------------------------------ teaching
talks = '<div class="media">' + "".join(yt(i, c) for i, c in [
    ("7CXXklAhr4w", "Interactive AI Systems for Live Audiovisual Performance"),
    ("HpRGy275U-c", "(X)AI in Live Coding Environments: Pandora’s Dream"),
    ("xmRRu5yfCF8", "AI in Live Coding Environments: Pandora’s Dream"),
    ("dYWQU4-jqCg", "ChucK and AI workshop"),
    ("g2FwGqcsnY4", "Hocus Pocus: Coding Rhythms"),
    ("776ASlahgLk", "CHmUsiCK, ICMC 2018"),
    ("zB0ZudzjnM0", "Workshop: Coding Isn’t What They Said")]) + "</div>"
body = head("Teaching", "Workshops, talks and learning communities around art, algorithms and sound.", [("talks", "Talks"), ("machina", "Machina"), ("semillero", "Semillero CineVivo"), ("festival", "Festival ART")]) \
     + section("talks", "Video", "Talks and workshops", '<span id="video3-b"></span>' + talks) \
     + '<section class="section"><div class="wrap">' \
     + project("machina", "Machina", "Research project", "Rethinking human–machine interaction through natural language, AI and disruptive design.", [],
               '<div class="media">' + yt("oEqBZEeP58E", "Dancing interface") + yt("EEWklpQ8C1M", "Light interaction") + "</div>") \
     + project("semillero", "Semillero CineVivo", "Collective", "Artistic collective and research group.", [("Website ↗", "https://scinevivo.github.io/")],
               '<div class="media">' + yt("IWsJZfh-kYo", "Sucesiones (2019)") + yt("-bRijYfGmCs", "Binary Corpus (2019)") + "</div>") \
     + project("festival", "Festival ART", "Medellín, Colombia", "A festival of art and technology in Medellín.", [("Festival website ↗", "https://scinevivo.github.io/festivalART.html")],
               '<div class="media">' + yt("KY1kferUuKk", "Festival ART overview") + yt("W9zTw-vTu4E", "Festival ART") + "</div>") \
     + "</div></section>"
page("teaching.html", "Teaching", "Talks, workshops and education projects by Celeste Betancur.", body)

# ------------------------------------------------------------------ instruments
def figs(items, cls="media two ph-43"):
    out = []
    for f, a, c in items:
        if f.startswith("<"):
            out.append(f)
        else:
            out.append(f'<figure><img src="img/{f}" alt="{E(a)}" loading="lazy"><figcaption>{E(c)}</figcaption></figure>')
    return f'<div class="{cls}">' + "".join(out) + "</div>"

body = head("Instruments", "Instruments built by hand, acoustic and electronic, including two presented in peer-reviewed papers.",
            [("umbilical", "Umbilical"), ("lute", "Electric lute"), ("guitar", "Electric guitar"), ("bass", "Electric bass"), ("bubbloe", "Bubbloe")]) \
     + '<section class="section"><div class="wrap">' \
     + project("umbilical", "Umbilical", "NIME 2026", "An experimental interface for musical expression exploring the relationship between performer and instrument through a cord-based haptic connection.",
               [("Read the NIME 2026 paper (PDF) ↗", "https://nime.org/proceedings/2026/nime2026_119.pdf")],
               figs([("umbilical-1.jpg", "Umbilical, front", "Front"), ("umbilical-2.jpg", "Umbilical, detail", "Detail"),
                     ("umbilical-3.jpg", "Umbilical, back", "Back"), ("umbilical-4.jpg", "Umbilical being played", "In performance")])) \
     + project("lute", "Electric lute", "Forum Acusticum 2025", "A hand-made expanded lute with an electronic brain.",
               [("Read the FA 2025 paper (PDF) ↗", "https://dael.euracoustics.org/confs/fa2025/data/articles/000114.pdf")],
               figs([("lute-1.jpg", "Electric lute, electronics detail", "Detail of the electronics"), ("lute-2.jpg", "Electric lute", "The lute")])) \
     + project("guitar", "Electric guitar", "24 frets", "Semi-hollow 24-fret jazz/metal guitar, carved, fitted and painted by hand using experimental building techniques.", [],
               figs([("guitar-1.jpg", "Semi-hollow electric guitar", "Body"), ("guitar-2.jpg", "Electric guitar detail", "Detail")])) \
     + project("bass", "Electric bass", "5 strings", "Hand-made five-string bass.", [],
               figs([("bass-1.jpg", "Five-string electric bass", "Front"), ("bass-2.jpg", "Five-string electric bass, second view", "Second view")], "media two")) \
     + project("bubbloe", "Bubbloe", "Hybrid instrument", "Experimental instrument and MIDI/OSC controller: a plastic body filled with water whose bubbles are vocoded with a digital synthesizer.", [],
               figs([(yt("zPL5JmqUb2Y", "Bubbloe in use"), "", ""), ("bubbloe.jpg", "Bubbloe controller", "MIDI/OSC controller")], "media two")) \
     + "</div></section>"
page("instruments.html", "Instruments", "Hand-built acoustic and electronic instruments by Celeste Betancur, including Umbilical (NIME 2026).", body)

# ------------------------------------------------------------------ press
interviews = '<div class="media two">' + yt("KzauajCJ2eQ", "Transferencias Aurales: tecnofonías decoloniales — opening talk", 12) \
    + yt("WyJ6ZfC9dtY", "Plataforma Musexplat — Música Experimental Latinoamericana", 765) \
    + yt("0zm-AlIgvuA", "GRANDPODCAST — GRANDPASTUDIO", 4460) + "</div>"
tv = '<div class="media two">' + yt("MDXQYjogSjI", "Sobre el derecho a amar — Diálogos por la vida, Teleantioquia") \
    + yt("biYXRaO-cew", "De leones y mariposas — Agua, Teleantioquia") \
    + '<figure><a class="ext-video" href="https://www.facebook.com/reel/1703956186612220"><span>Watch on Facebook ↗</span></a><figcaption>Madres excepcionales — Teleantioquia</figcaption></figure></div>'
body = head("Press", "Interviews, and television appearances on gender identity and the right to love.", [("interviews", "Interviews"), ("activism", "Activism")]) \
     + section("interviews", "Video", "Interviews", interviews) \
     + section("activism", "Television", "Activism", tv)
page("press.html", "Press", "Interviews and television appearances with Celeste Betancur.", body)
print("ok")
