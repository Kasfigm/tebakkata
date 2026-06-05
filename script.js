let soundBenar = new Audio("benar.mp3");
let soundSalah = new Audio("salah.mp3");
let bgm = new Audio("bgm.mp3");

// 🔥 setting BGM
bgm.loop = true;
bgm.volume = 1.0;
bgm.preload = "auto";

// 🔥 preload sound effect
soundBenar.preload = "auto";
soundSalah.preload = "auto";

// 🔥 BGM CONTROL (HP + PC)
let sudahStartBGM = false;

function startBGM() {
  if (sudahStartBGM) return;

  bgm.play().then(() => {
    sudahStartBGM = true;
  }).catch(() => {});
}

// support semua device
document.addEventListener("touchstart", startBGM, { passive: true });
document.addEventListener("click", startBGM);

// pause kalau keluar
document.addEventListener("visibilitychange", () => {
  if (!sudahStartBGM) return;

  if (document.hidden) {
    bgm.pause();
  } else {
    bgm.play().catch(() => {});
  }
});

// ================= GAME =================

let levels = [];
let currentLevel = 0;
let jawaban = "";
let jawabanUser = [];
let jumlahClue = 3;

// LOAD JSON
fetch("./levels.json")
.then(res => {
  if (!res.ok) throw new Error("JSON gagal load");
  return res.json();
})
.then(data => {
  levels = data;
  loadLevel();
})
.catch(err => {
  document.getElementById("question").innerText = "❌ Gagal load level";
  console.error(err);
});

function loadLevel() {
  let data = levels[currentLevel];
  jawaban = data.jawaban;
  jawabanUser = [];

  // 🔥 reset clue
  jumlahClue = 3;
  document.getElementById("clueCount").innerText = jumlahClue;

  document.getElementById("question").innerText = data.pertanyaan;
  document.getElementById("level").innerText = "Level " + (currentLevel + 1);

  renderKotak();
  renderHuruf();

  document.getElementById("result").innerText = "";
}

function renderKotak() {
  let container = document.getElementById("answer-box");
  container.innerHTML = "";

  for (let i = 0; i < jawaban.length; i++) {
    let box = document.createElement("div");
    box.className = "otp-box";

    if (i === 0) {
      box.innerText = jawaban[0];
    } else if (jawabanUser[i - 1]) {
      box.innerText = jawabanUser[i - 1];
    }

    container.appendChild(box);
  }
}

function renderHuruf() {
  let container = document.getElementById("letters");
  container.innerHTML = "";

  let huruf = jawaban.slice(1).split("");

  let random = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (huruf.length < 12) {
    huruf.push(random[Math.floor(Math.random() * random.length)]);
  }

  huruf.sort(() => Math.random() - 0.5);

  huruf.forEach(h => {
    let btn = document.createElement("div");
    btn.className = "letter";
    btn.innerText = h;

    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      pilihHuruf(h);
    }, { passive: false });

    container.appendChild(btn);
  });
}

function pilihHuruf(h) {
  if (jawabanUser.length < jawaban.length - 1) {
    jawabanUser.push(h);
    renderKotak();
    cekJawaban();
  }
}

function hapus() {
  jawabanUser.pop();
  renderKotak();
}

function clearAll() {
  jawabanUser = [];
  renderKotak();
}

function kasihClue() {
  if (jumlahClue <= 0) {
    alert("Clue habis!");
    return;
  }

  jumlahClue--;
  document.getElementById("clueCount").innerText = jumlahClue;

  for (let i = 1; i < jawaban.length; i++) {
    if (!jawabanUser[i - 1]) {
      jawabanUser[i - 1] = jawaban[i];
      break;
    }
  }

  renderKotak();
  cekJawaban();
}

function cekJawaban() {
  let fullJawaban = jawaban[0] + jawabanUser.join("");
  let result = document.getElementById("result");

  if (jawabanUser.length === jawaban.length - 1) {

    if (fullJawaban === jawaban) {
      // ✅ BENAR
      result.innerText = "BENAR!";

      soundBenar.currentTime = 3;
      soundBenar.play().catch(() => {});

      result.style.fontSize = "120px";
      result.style.fontWeight = "bold";
      result.style.color = "lime";

      currentLevel++;

      if (currentLevel < levels.length) {
        setTimeout(loadLevel, 2000);
      } else {
        document.getElementById("question").innerText = "TAMAT";
      }

    } else {
      // ❌ SALAH
      result.innerText = "SALAH!";

      soundSalah.currentTime = 0;
      soundSalah.play().catch(() => {});

      result.style.fontSize = "120px";
      result.style.fontWeight = "bold";
      result.style.color = "red";

      setTimeout(() => {
        jawabanUser = [];
        renderKotak();
      }, 1200);
    }
  }
}

/* 🔥 ANTI DOUBLE TAP ZOOM */
let lastTouchEnd = 0;

document.addEventListener('touchend', function (event) {
  let now = new Date().getTime();

  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }

  lastTouchEnd = now;
}, false);