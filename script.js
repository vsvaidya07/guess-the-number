// Difficulty settings: range and attempt limit
const LEVELS = {
  easy:   { label: "Easy",   min: 1, max: 50,  tries: 10 },
  medium: { label: "Medium", min: 1, max: 100, tries: 7 },
  hard:   { label: "Hard",   min: 1, max: 500, tries: 9 }
};

let shownAt = 0, introDone = false, level = "medium", secret, attempts, low, high, over, guesses;
const $ = id => document.getElementById(id);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildLevelButtons() {
  $("levels").innerHTML = "";
  for (const key in LEVELS) {               // loop over difficulty levels
    const L = LEVELS[key];
    const b = document.createElement("button");
    b.innerHTML = L.label + "<small>" + L.min + "–" + L.max + " · " + L.tries + " tries</small>";
    b.setAttribute("aria-pressed", key === level);
    b.onclick = () => { level = key; buildLevelButtons(); startGame(); };
    $("levels").appendChild(b);
  }
}

function startGame() {
  const L = LEVELS[level];
  secret = randomInt(L.min, L.max);
  attempts = 0; low = L.min; high = L.max; over = false; guesses = [];
  $("big").textContent = "?";
  setMsg("Type a number between " + L.min + " and " + L.max + ".", "");
  $("guess").value = ""; $("guess").disabled = false; $("go").disabled = false;
  $("again").classList.remove("show");
  $("cheer").classList.remove("show");
  render();
  if (introDone) $("guess").focus();
}

function setMsg(text, cls) {
  $("msg").textContent = text;
  $("msg").className = "msg " + cls;
}

function render() {
  const L = LEVELS[level], span = L.max - L.min + 1;
  $("bar").style.left = ((low - L.min) / span * 100) + "%";
  $("bar").style.width = ((high - low + 1) / span * 100) + "%";
  $("lo").textContent = L.min; $("hi").textContent = L.max;
  $("used").textContent = attempts; $("max").textContent = L.tries;
  $("left").textContent = low + "–" + high;
  $("hist").innerHTML = "";
  for (const g of guesses) {                // loop over past guesses
    const c = document.createElement("span");
    c.className = "chip " + (g.n === secret ? "ok" : g.n > secret ? "hi" : "lo");
    c.textContent = g.n + (g.n === secret ? " ✓" : g.n > secret ? " ↓" : " ↑");
    $("hist").appendChild(c);
  }
}

function congratulate() {
  const L = LEVELS[level];
  const best = Math.ceil(Math.log2(L.max - L.min + 1));   // perfect-play minimum
  let title, sub;
  if (attempts === 1) { title = "First try?! Are you psychic? 🔮"; sub = "That is legendary luck."; }
  else if (attempts <= best) { title = "Binary search master! 🧠"; sub = "You solved it in " + attempts + " tries, as fast as perfect play allows."; }
  else if (attempts < L.tries) { title = "Nailed it! 🎉"; sub = "Cracked the " + L.label + " level in " + attempts + " tries."; }
  else { title = "Clutch win on the last try! 😮‍💨"; sub = "Closest finish possible, and you still got it."; }
  setMsg(title + " " + sub, "win");              // also show the words in the main panel
  window.scrollTo(0, 0);
  $("cheerNum").textContent = secret;
  $("cheerTitle").textContent = title;
  $("cheerSub").textContent = sub;
  $("cheer").classList.add("show");
  shownAt = Date.now();
  $("cheerCard").focus({ preventScroll: true });   // focus the card, not a button, so a held Enter key cannot dismiss it
  confetti();
}

function confetti() {
  const bits = ["🎉","✨","🎊","⭐","💖"];
  for (let i = 0; i < 28; i++) {                         // loop to spawn confetti
    const el = document.createElement("span");
    el.className = "bit";
    el.textContent = bits[i % bits.length];
    el.style.left = Math.random() * 100 + "vw";
    el.style.animationDelay = Math.random() * 0.6 + "s";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
}

function endGame() {
  over = true;
  $("guess").disabled = true; $("go").disabled = true;
  $("again").classList.add("show");
}

function checkGuess() {
  if (over) return;
  const L = LEVELS[level];
  const n = parseInt($("guess").value, 10);

  if (isNaN(n) || n < L.min || n > L.max) {
    setMsg("Enter a whole number from " + L.min + " to " + L.max + ".", "");
    return;
  }
  if (guesses.some(g => g.n === n)) {
    setMsg("You already tried " + n + ". Pick a new one.", "");
    return;
  }

  attempts++;
  guesses.push({ n });
  $("guess").value = "";

  if (n === secret) {
    $("big").textContent = secret;
    setMsg("Got it! " + secret + " in " + attempts + (attempts === 1 ? " try." : " tries."), "win");
    render(); congratulate(); endGame();
  } else if (attempts >= L.tries) {
    $("big").textContent = secret;
    setMsg("Out of tries. The number was " + secret + ".", "lose");
    render(); endGame();
  } else {
    if (n > secret) { high = Math.min(high, n - 1); setMsg(n + " is too high. Go lower.", ""); }
    else            { low  = Math.max(low,  n + 1); setMsg(n + " is too low. Go higher.", ""); }
    render();
    $("guess").focus();
  }
}

$("go").onclick = checkGuess;
$("guess").addEventListener("keydown", e => { if (e.key === "Enter" && !e.repeat) checkGuess(); });
$("again").onclick = startGame;
$("cheerAgain").onclick = () => { if (Date.now() - shownAt > 800) startGame(); };
$("cheerClose").onclick = () => { $("cheer").classList.remove("show"); $("again").focus(); };

function playIntro() {
  for (let i = 0; i < 26; i++) {                         // loop to spawn floating numbers
    const n = document.createElement("span");
    n.textContent = randomInt(1, 100);
    n.style.left = Math.random() * 100 + "%";
    n.style.fontSize = (1.2 + Math.random() * 2.6) + "rem";
    n.style.animationDuration = (6 + Math.random() * 6) + "s";
    n.style.animationDelay = (-Math.random() * 8) + "s";
    $("nums").appendChild(n);
  }
  $("start").focus();
}

$("start").onclick = () => {
  introDone = true;
  $("intro").classList.add("out");
  setTimeout(() => $("intro").remove(), 600);
  $("guess").focus();
};

buildLevelButtons();
startGame();
playIntro();
