/* Ссылки сайта. Заполните нужные адреса (полностью, с https://) - пустая строка = кнопка показывает «скоро».
   Links of the site. Fill in full URLs (with https://) - an empty string makes the button show "soon". */
const DOWNLOAD_URL = "GenshinAutoMarker-Setup.exe";   // установщик / the installer
const ZIP_URL      = "";   // запасная ссылка на zip (пусто = скрыта) / fallback zip link (empty = hidden)
const DONATE_URL   = "https://boosty.to/serafimgensh";   // «Поддержать → Другое» (Boosty) / "Support -> Other ways"
const DONATE_RUB_URL = "https://pay.cloudtips.ru/p/00d7ab89";   // «Поддержать → Рублями» (CloudTips, Т-Банк) / "In roubles"
const TELEGRAM_URL = "https://t.me/+ggeemUSoi8JiNWNi";   // канал или чат в Telegram / Telegram channel or chat
const DISCORD_URL  = "";   // сервер в Discord (пусто = кнопка «скоро») / Discord server (empty = "soon")
const BUG_URL      = "";   // «Сообщить об ошибке» (пусто = ссылка на Telegram) / "Report a bug" (empty = Telegram link)

/* SHA256 и размер установщика (GenshinAutoMarker-Setup.exe). Менять при КАЖДОЙ новой сборке установщика -
   проще всего запустить update-installer.cmd, он впишет оба значения сам.
   Пустая сумма = блок «Проверка файла» скрыт, 0 = размер не показывается. */
const SETUP_SHA256 = "d015776f6cb36433ab931bd56e069f09a730e9b448031b3020ccf4de7bc94fa5";
const SETUP_BYTES  = 12136043;

/* Размер самой программы после установки (сумма size всех файлов в app/manifest.json) - показывается в шапке
   рядом с размером установщика. Менять при новой сборке программы. 0 = не показывать.
   Installed program size (sum of "size" of all files in app/manifest.json). 0 = hidden. */
const APP_BYTES    = 382710331;   // 0.9.82-beta-test: 4541 файлов, ≈ 365 МБ

/* Счётчик скачиваний (counter-worker/README.txt). Пусто = счётчик выключен и не показывается.
   Download counter (see counter-worker/README.txt). Empty = disabled and hidden. */
const COUNTER_URL  = "";
