/* Тема ставится до отрисовки, чтобы не мигало (отдельный файл, а не встроенный скрипт - так работает строгий CSP). */
(function () {
  var d = document.documentElement, t = null;
  d.className += " js";
  // страховка: если app.js не запустился (ошибка, блокировщик, обрыв сети), через 4 с показываем все блоки как есть,
  // иначе они так и остались бы прозрачными (так «пропадали» снимки в разделе «Как это выглядит»)
  setTimeout(function () { if (!/(^|\s)rv(\s|$)/.test(d.className)) d.className = d.className.replace(/(^|\s)js(\s|$)/, " "); }, 4000);
  try { t = localStorage.getItem("gam-theme"); } catch (e) {}
  if (t === "light" || t === "dark") d.setAttribute("data-theme", t);
  var dark = t === "dark" || (t !== "light" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
  var m = document.querySelector('meta[name="theme-color"]');
  if (m && dark) m.content = "#100E1C";
})();
