/* Genshin Auto Marker - сайт-визитка: тема, язык RU/EN, ссылки из config.js, история версий, проверка файла, появление блоков, просмотр снимков.
   Внешний запрос только один - к счётчику скачиваний, и только если задан COUNTER_URL. Всё, что пришло из файлов, вставляется как текст (textContent). */
(function () {
  "use strict";
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- плавное появление (только opacity/transform)
     Запускается первым, до остального кода: если ниже что-то сломается, блоки всё равно появятся.
     Кроме IntersectionObserver блоки проверяются и при прокрутке/переходе по якорю: элементы,
     которые «перепрыгнули» ссылкой из меню, иначе оставались бы невидимыми. */
  (function () {
    var pending = $$(".reveal");
    var done = function (t) {
      t.classList.add("in");
      // после появления - быстрые переходы для наведения, без задержки
      setTimeout(function () { t.style.transitionDelay = ""; t.classList.add("settled"); }, 900);
    };
    var sweep = function () {
      var h = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter(function (el) {
        if (el.classList.contains("in")) return false;
        if (el.offsetParent === null && !el.getClientRects().length) return true;   // скрыт (hidden) - ждём
        if (el.getBoundingClientRect().top < h * 0.94) { if (io) io.unobserve(el); done(el); return false; }
        return true;
      });
    };
    var io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); done(e.target); } });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    }
    pending.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + "ms"; if (io) io.observe(el); });
    var queued = false;
    var later = function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; sweep(); }); } };
    window.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later);
    window.addEventListener("hashchange", later);
    window.addEventListener("load", later);
    document.addEventListener("visibilitychange", later);
    if (!io) $$(".reveal").forEach(done);
    later();
    root.classList.add("rv");
  })();

  /* ---------- снимки: мерцающая заглушка, пока картинка грузится, затем мягкое проявление */
  $$(".shot .pic img, .hero-shot img").forEach(function (img) {
    var pic = img.parentNode;
    var ok = function () { img.classList.add("loaded"); pic.classList.remove("loading"); };
    if (img.complete && img.naturalWidth) return;          // уже в кэше - показываем сразу, без анимации
    img.classList.add("fade"); pic.classList.add("loading");
    img.addEventListener("load", ok);
    img.addEventListener("error", ok);                      // при ошибке хотя бы видна подпись alt
    if (img.complete) ok();
  });

  /* ---------- ссылки из config.js (пустая ссылка -> «скоро») */
  var LINKS = {
    download: typeof DOWNLOAD_URL === "string" ? DOWNLOAD_URL.trim() : "",
    zip: typeof ZIP_URL === "string" ? ZIP_URL.trim() : "",
    donate: typeof DONATE_URL === "string" ? DONATE_URL.trim() : "",
    donate_rub: typeof DONATE_RUB_URL === "string" ? DONATE_RUB_URL.trim() : "",
    telegram: typeof TELEGRAM_URL === "string" ? TELEGRAM_URL.trim() : "",
    discord: typeof DISCORD_URL === "string" ? DISCORD_URL.trim() : ""
  };
  LINKS.bug = (typeof BUG_URL === "string" ? BUG_URL.trim() : "") || LINKS.telegram;
  $$("[data-link]").forEach(function (a) {
    var url = LINKS[a.getAttribute("data-link")];
    if (!url && a.hasAttribute("data-hide-empty")) { a.hidden = true; return; }
    if (url) {
      a.href = url;
      if (/^https?:/i.test(url) && !/\.(exe|zip)$/i.test(url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    } else {
      a.classList.add("soon"); a.setAttribute("aria-disabled", "true");
      a.addEventListener("click", function (e) { e.preventDefault(); });
    }
  });

  /* ---------- тема */
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function effectiveTheme() { return root.getAttribute("data-theme") || (mq && mq.matches ? "dark" : "light"); }
  $("#theme-btn").addEventListener("click", function () {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next); store.set("gam-theme", next);
    var m = $('meta[name="theme-color"]'); if (m) m.content = next === "dark" ? "#100E1C" : "#6F5CF2";
  });

  /* ---------- язык: русский текст лежит в разметке, английский - в data-en */
  var meta = {
    ru: { title: "Genshin Auto Marker — автоотметки на карте Genshin Impact",
          desc: "Программа смотрит на экран Genshin Impact и сама ставит отметки найденных сундуков, окулусов и ресурсов на интерактивной карте appsample." },
    en: { title: "Genshin Auto Marker — auto-marks on the Genshin Impact map",
          desc: "The program watches your Genshin Impact screen and automatically marks the chests, oculi and resources you find on the interactive appsample map." }
  };
  var attrs = [["data-en-alt", "alt"], ["data-en-aria", "aria-label"], ["data-en-title", "title"]];
  $$("[data-en]").forEach(function (el) { el.setAttribute("data-ru", el.innerHTML); });
  attrs.forEach(function (p) {
    $$("[" + p[0] + "]").forEach(function (el) { el.setAttribute(p[0].replace("en", "ru"), el.getAttribute(p[1]) || ""); });
  });
  var langHooks = [];
  function setLang(lang) {
    var en = lang === "en";
    $$("[data-en]").forEach(function (el) { el.innerHTML = el.getAttribute(en ? "data-en" : "data-ru"); });
    attrs.forEach(function (p) {
      $$("[" + p[0] + "]").forEach(function (el) { el.setAttribute(p[1], el.getAttribute(en ? p[0] : p[0].replace("en", "ru"))); });
    });
    root.lang = en ? "en" : "ru";
    document.title = meta[lang].title;
    var d = $('meta[name="description"]'); if (d) d.content = meta[lang].desc;
    var b = $("#lang-btn"); if (b) { b.textContent = en ? "RU" : "EN"; b.setAttribute("aria-label", en ? "Язык: русский" : "Language: English"); }
    store.set("gam-lang", lang);
    langHooks.forEach(function (f) { f(en); });
  }
  /* английский пока выключен: сайт всегда на русском (кнопки EN нет) */
  setLang("ru");

  /* ---------- версия и VirusTotal из version.json (тот же файл читает программа) */
  function setVersion(v) {
    if (!/^[\w.+-]{1,32}$/.test(v)) return;
    $$("#ver2, .js-ver").forEach(function (e) { e.textContent = v; });
  }
  if (window.fetch) {
    fetch("version.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (j && typeof j.version === "string") setVersion(j.version.trim());
      if (j && typeof j.virustotal === "string" && /^https:\/\/(www\.)?virustotal\.com\//i.test(j.virustotal.trim())) { var vi = $("#vt-item"), vl = $("#vt-link"); if (vi && vl) { vl.href = j.virustotal.trim(); vi.hidden = false; } }
    }).catch(function () {});
  }

  /* ---------- «Что нового» и история версий из changelog.json */
  var releases = null;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function pick(l) { return Array.isArray(l) ? l.filter(function (s) { return typeof s === "string"; }) : []; }
  function lines(r, en) { var l = pick(en ? r.en : r.ru); return l.length || !en ? l : pick(r.ru); }   /* нет английского - русский */
  function renderLog(en) {
    if (!releases || !releases.length) return;
    var list = $("#news-list"), hist = $("#history"), hl = $("#history-list");
    if (list && lines(releases[0], en).length) {
      list.textContent = "";
      lines(releases[0], en).forEach(function (s) { list.appendChild(el("li", "", s)); });
    }
    if (hist && hl && releases.length > 1) {
      hl.textContent = "";
      releases.slice(1).forEach(function (r) {
        var title = (typeof r.version === "string" && r.version) || (en ? r.title_en : r.title_ru) || "";
        var box = el("div", "rel");
        box.appendChild(el("h4", "", String(title)));
        var ul = el("ul", "list");
        lines(r, en).forEach(function (s) { ul.appendChild(el("li", "", s)); });
        box.appendChild(ul);
        hl.appendChild(box);
      });
      hist.hidden = false;
    }
  }
  langHooks.push(renderLog);
  if (window.fetch) {
    fetch("changelog.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !Array.isArray(j.releases)) return;
      releases = j.releases.filter(function (r) { return r && typeof r === "object"; });
      if (releases[0] && typeof releases[0].version === "string" && releases[0].version) setVersion(releases[0].version.trim());
      renderLog(root.lang === "en");
    }).catch(function () {});
  }

  /* ---------- проверка файла: SHA256 из config.js и кнопки «Копировать» */
  var sha = (typeof SETUP_SHA256 === "string" ? SETUP_SHA256.trim() : "").toLowerCase();
  if (/^[0-9a-f]{64}$/.test(sha)) { $("#sha").textContent = sha; $("#verify").hidden = false; }

  /* проверка прямо в браузере: файл читается локально (crypto.subtle), никуда не отправляется */
  var chk = $("#check"), chkFile = $("#check-file"), chkRes = $("#check-res"), chkState = null;
  var CHK = {
    work: ["Считаю отпечаток…", "Computing the fingerprint…"],
    ok: ["Совпало — это тот самый файл. Можно устанавливать.", "It matches: this is the genuine file. You can install it."],
    bad: ["Не совпало. Не запускайте этот файл: удалите его и скачайте заново с этой страницы. Если снова не совпадёт — сообщите автору.",
          "It does not match. Do not run this file: delete it and download it again from this page. If it still does not match, let the author know."],
    err: ["Не удалось прочитать файл. Попробуйте ещё раз.", "Could not read the file. Please try again."]
  };
  function showCheck(en) {
    if (!chkState) return;
    chkRes.textContent = CHK[chkState][en ? 1 : 0];
    chkRes.className = "check-res is-" + chkState;
    chkRes.hidden = false;
  }
  langHooks.push(showCheck);
  if (chk && sha && window.crypto && crypto.subtle && window.FileReader && window.isSecureContext !== false) {
    chk.hidden = false;
    $$(".js-only").forEach(function (e) { e.hidden = false; });
    $("#check-btn").addEventListener("click", function () { chkFile.value = ""; chkFile.click(); });
    chkFile.addEventListener("change", function () {
      var f = chkFile.files && chkFile.files[0];
      if (!f) return;
      chkState = "work"; showCheck(root.lang === "en");
      var rd = new FileReader();
      rd.onerror = function () { chkState = "err"; showCheck(root.lang === "en"); };
      rd.onload = function () {
        crypto.subtle.digest("SHA-256", rd.result).then(function (buf) {
          var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join("");
          chkState = hex === sha ? "ok" : "bad"; showCheck(root.lang === "en");
        }, rd.onerror);
      };
      rd.readAsArrayBuffer(f);
    });
  }
  $$(".copy-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var src = document.getElementById(b.getAttribute("data-copy"));
      if (!src) return;
      var done = function () {
        var lbl = $("span", b);
        b.classList.add("done");
        lbl.textContent = root.lang === "en" ? "Copied" : "Скопировано";
        clearTimeout(b._t);
        b._t = setTimeout(function () {
          b.classList.remove("done");
          lbl.innerHTML = lbl.getAttribute(root.lang === "en" ? "data-en" : "data-ru");
        }, 1600);
      };
      // запасной путь: выделить текст и скопировать по-старому (если не вышло - текст остаётся выделенным для Ctrl+C)
      var fallback = function () {
        var r = document.createRange(); r.selectNodeContents(src);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        try { if (document.execCommand("copy")) done(); } catch (e) {}
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(src.textContent.trim()).then(done, fallback);
      else fallback();
    });
  });

  /* ---------- размер установщика из config.js */
  var bytes = typeof SETUP_BYTES === "number" ? SETUP_BYTES : 0;
  var appBytes = typeof APP_BYTES === "number" ? APP_BYTES : 0;   /* программа после установки */
  function showSize(en) {
    if (bytes > 0) {
      var mb = (bytes / 1048576).toFixed(1);
      $("#size").textContent = en ? mb + " MB" : mb.replace(".", ",") + " МБ";
      $("#size-li").hidden = false;
    }
    if (appBytes > 0 && $("#app-size")) {
      var amb = Math.round(appBytes / 1048576);
      $("#app-size").textContent = "≈ " + amb + (en ? " MB" : " МБ");
      $("#app-size-li").hidden = false;
    }
  }
  showSize(root.lang === "en");
  langHooks.push(showSize);

  /* ---------- счётчик скачиваний (свой Cloudflare Worker, без cookies и IP; см. counter-worker\README.txt) */
  var counter = (typeof COUNTER_URL === "string" ? COUNTER_URL.trim() : "").replace(/\/+$/, "");
  if (/^https:\/\/[^\s\/]+$/i.test(counter) && window.fetch) {
    fetch(counter + "/count", { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var n = j && j.count;
      if (typeof n === "number" && isFinite(n) && n >= 0) {
        $("#count").textContent = Math.floor(n).toLocaleString(root.lang === "en" ? "en-US" : "ru-RU");
        $("#count-li").hidden = false;
      }
    }).catch(function () {});
    $$('[data-link="download"]').forEach(function (a) {
      a.addEventListener("click", function () {
        if (a.classList.contains("soon")) return;
        try {
          if (navigator.sendBeacon) navigator.sendBeacon(counter + "/hit");
          else fetch(counter + "/hit", { method: "POST", keepalive: true, credentials: "omit" });
        } catch (e) {}
      });
    });
  }

  /* ---------- текущий раздел в меню */
  var navLinks = $$('.nav a[href^="#"]');
  if ("IntersectionObserver" in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) { var s = document.getElementById(a.getAttribute("href").slice(1)); if (s) spy.observe(s); });
  }

  /* ---------- схема «Как это работает»: на паузе вне экрана; при «уменьшить движение» - стоп-кадр с готовыми отметками */
  var demo = $("#demo-map");
  if (demo && demo.pauseAnimations) {
    var rm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var demoVisible = true;
    var syncDemo = function () {
      if (rm && rm.matches) { demo.pauseAnimations(); demo.setCurrentTime(8.6); return; }
      if (demoVisible) demo.unpauseAnimations(); else demo.pauseAnimations();
    };
    if (rm && rm.addEventListener) rm.addEventListener("change", syncDemo);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { demoVisible = en[0].isIntersecting; syncDemo(); }).observe(demo);
    }
    syncDemo();
  }
  // плашки «…отмечен» тянутся под длину текста (он разный в RU/EN)
  function fitToasts() {
    $$(".d-toast").forEach(function (g) {
      var t = $("text", g), r = $("rect", g), w = 0;
      try { w = t.getComputedTextLength(); } catch (e) {}
      if (w > 0) r.setAttribute("width", Math.min(484, Math.ceil(44 + w + 20)));
    });
  }
  fitToasts();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitToasts);
  langHooks.push(fitToasts);

  /* ---------- звук нажатия «пузырёк» (как в программе; Web Audio, без файлов); по умолчанию ВЫКЛ, выключатель в шапке, выбор запоминается */
  var sndBtn = $("#sound-btn"), actx = null;
  var soundOn = store.get("gam-sound") === "on";
  var AC = window.AudioContext || window.webkitAudioContext;
  function blip(t, f0, f1, dur, peak, att) {
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function tick() {
    if (!AC) return;
    try {
      actx = actx || new AC();
      if (actx.state === "suspended") actx.resume();
      var t = actx.currentTime;
      blip(t, 402, 1092, 0.09, 0.165, 0.01);
      blip(t + 0.012, 805, 2185, 0.06, 0.054, 0.01);
    } catch (e) {}
  }
  function syncSound() { if (sndBtn) sndBtn.setAttribute("aria-pressed", soundOn ? "true" : "false"); }
  syncSound();
  if (!AC && sndBtn) sndBtn.hidden = true;
  if (sndBtn) sndBtn.addEventListener("click", function () {
    soundOn = !soundOn; store.set("gam-sound", soundOn ? "on" : "off"); syncSound();
  });
  document.addEventListener("click", function (e) {
    if (!soundOn || !e.target.closest) return;
    var hit = e.target.closest("a[href], button, summary");
    if (hit && !hit.classList.contains("soon") && !hit.hasAttribute("aria-disabled")) tick();
  }, true);

  /* ---------- просмотр снимков */
  var dlg = $("#lightbox");
  if (dlg && dlg.showModal) {
    var shots = $$(".shot"), lbImg = $("#lb-img"), cur = 0;
    // dir: 1 — вперёд, -1 — назад, 0 — открытие
    var show = function (i, dir) {
      cur = (i + shots.length) % shots.length;
      var b = shots[cur], thumb = $("img", b), cap = $(".cap span", b);
      $("#lb-cap").textContent = cap ? cap.textContent : "";
      $("#lb-count").textContent = (cur + 1) + " / " + shots.length;
      var swap = function () {
        if (shots[cur] !== b) return;
        lbImg.src = b.getAttribute("data-full"); lbImg.alt = thumb ? thumb.alt : "";
        lbImg.classList.remove("from-next", "from-prev");
        if (dir) { void lbImg.offsetWidth; lbImg.classList.add(dir > 0 ? "from-next" : "from-prev"); }
      };
      if (!dir) { swap(); return; }
      // сначала загружаем снимок, потом показываем — без мигания пустой рамки
      var pre = new Image(); pre.src = b.getAttribute("data-full");
      (pre.decode ? pre.decode() : Promise.resolve()).then(swap, swap);
    };
    var step = function (dir) {
      var btn = $(dir > 0 ? "#lb-next" : "#lb-prev");
      btn.classList.remove("kick"); void btn.offsetWidth; btn.classList.add("kick");
      show(cur + dir, dir);
    };
    shots.forEach(function (b, i) {
      b.addEventListener("click", function () { show(i, 0); dlg.showModal(); });
    });
    $("#lb-prev").addEventListener("click", function () { step(-1); });
    $("#lb-next").addEventListener("click", function () { step(1); });
    $("#lb-close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });
    // свайп на телефоне
    var tx = null;
    $(".lb-stage").addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    $(".lb-stage").addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
    langHooks.push(function () { if (dlg.open) show(cur, 0); });
  } else {
    $$(".shot").forEach(function (b) { b.style.cursor = "default"; });
  }
})();
