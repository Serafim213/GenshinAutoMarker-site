/* Ссылки сайта. Заполните нужные адреса (полностью, с https://) - пустая строка = кнопка показывает «скоро».
   Links of the site. Fill in full URLs (with https://) - an empty string makes the button show "soon". */
const DOWNLOAD_URL = "GenshinAutoMarker-Setup.exe";   // установщик / the installer
const ZIP_URL      = "";   // запасная ссылка на zip (пусто = скрыта) / fallback zip link (empty = hidden)
const DONATE_URL   = "https://boosty.to/serafimgensh";   // «Поддержать → Boosty» / "Support -> Boosty"
const DONATEX_URL  = "https://donatex.gg/donate/Serafim213";   // «Поддержать → DonateX» (пусто = пункт скрыт) / "Support -> DonateX"
const DONATE_RUB_URL = "https://pay.cloudtips.ru/p/00d7ab89";   // «Поддержать → Рублями» (CloudTips, Т-Банк) / "In roubles"
const TELEGRAM_URL = "https://t.me/+ggeemUSoi8JiNWNi";   // канал или чат в Telegram / Telegram channel or chat
const DISCORD_URL  = "https://discord.gg/wqkTYRmCHr";   // сервер в Discord (пусто = кнопка «скоро») / Discord server (empty = "soon")
const BUG_URL      = "";   // «Сообщить об ошибке» (пусто = ссылка на Telegram) / "Report a bug" (empty = Telegram link)

/* SHA256 и размер установщика (GenshinAutoMarker-Setup.exe). Менять при КАЖДОЙ новой сборке установщика -
   проще всего запустить update-installer.cmd, он впишет оба значения сам.
   Пустая сумма = блок «Проверка файла» скрыт, 0 = размер не показывается. */
const SETUP_SHA256 = "05303bd0539ed245a863d6672d1201bb24b5dd0e7e02d1adae25cc5a345761a0";
const SETUP_BYTES  = 12138324;

/* Размер самой программы после установки (сумма size всех файлов в app/manifest.json) - показывается в шапке
   рядом с размером установщика. Менять при новой сборке программы. 0 = не показывать.
   Installed program size (sum of "size" of all files in app/manifest.json). 0 = hidden. */
const APP_BYTES    = 397425767;   // 0.107-beta-test: 4554 файлов, ≈ 379 МБ

/* Счётчик скачиваний (counter-worker/README.txt). Пусто = счётчик выключен и не показывается.
   Download counter (see counter-worker/README.txt). Empty = disabled and hidden. */
const COUNTER_URL  = "";

/* Отзывы (tools\reviews-worker\README.txt в репо программы). Пусто или Worker не отвечает = раздел «Отзывы» скрыт.
   Если меняете адрес - поменяйте его и в _headers (connect-src).
   Reviews worker. Empty or unreachable = the Reviews section is hidden. */
const REVIEWS_URL  = "https://gam-reviews.serafim-genshin.workers.dev";
const TURNSTILE_SITEKEY = "0x4AAAAAAF_lyT-TtieYf6qT";   // форма отзыва без Telegram (Cloudflare Turnstile, публичный ключ); пусто = формы нет
const REVIEW_BOT_URL ="https://t.me/Genshin_Auto_Marker_Bot?start=review";   // кнопка «Оставить отзыв» / "Leave a review" button
