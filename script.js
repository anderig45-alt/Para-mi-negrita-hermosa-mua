/* ---------------------------
   UTIL: ajustar canvas DPI
   --------------------------- */
function setupCanvasDPR(canvas, w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ===========================
   ESTRELLAS (fondo)
   =========================== */
(function starfield(){
  const c = document.getElementById("starsCanvas");
  function resize(){ c.width = window.innerWidth; c.height = window.innerHeight; }
  resize(); window.addEventListener("resize", resize);
  const ctx = c.getContext("2d");
  const stars = [];
  for(let i=0;i<180;i++){
    stars.push({
      x: Math.random()*c.width,
      y: Math.random()*c.height,
      r: Math.random()*1.3 + 0.4,
      vx: (Math.random()-0.5)*0.05,
      vy: (Math.random()-0.5)*0.02,
      alpha: 0.6+Math.random()*0.4
    });
  }
  function tick(){
    ctx.clearRect(0,0,c.width,c.height);
    // subtle gradient
    const g = ctx.createRadialGradient(c.width*0.8, c.height*0.12, 10, c.width*0.8, c.height*0.12, Math.max(c.width,c.height));
    g.addColorStop(0, 'rgba(10,20,60,0.12)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,c.width,c.height);

    for(let s of stars){
      s.x += s.vx; s.y += s.vy;
      if(s.x < -10) s.x = c.width+10;
      if(s.x > c.width+10) s.x = -10;
      if(s.y < -10) s.y = c.height+10;
      if(s.y > c.height+10) s.y = -10;
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,"+s.alpha+")";
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ===========================
   CORAZONES FLOTANTES
   =========================== */
(function spawnHearts(){
  const layer = document.getElementById("heartsLayer");
  function addHeart(){
    const el = document.createElement("div");
    el.className = "float-heart";
    el.style.position = "absolute";
    el.style.left = (5 + Math.random()*90) + "vw";
    el.style.bottom = "-6vh";
    el.style.fontSize = (14 + Math.random()*22) + "px";
    el.style.opacity = 0.85;
    el.style.pointerEvents = "none";
    el.textContent = Math.random() > 0.4 ? "💗" : "✨";
    layer.appendChild(el);
    const dur = 6000 + Math.random()*4000;
    const start = performance.now();
    function anim(t){
      const p = (t - start) / dur;
      if(p >= 1){ el.remove(); return; }
      el.style.transform = `translateY(-${p*120}vh) translateX(${Math.sin(p*3.14)*8}px)`;
      el.style.opacity = `${1 - p}`;
      requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }
  setInterval(addHeart, 700);
})();

/* ===========================
   AUDIO: autoplay con fallback
   =========================== */
(function audioTryPlay(){
  const audio = document.getElementById("bgAudio");
  audio.volume = 0.55;
  audio.loop = true; // que nunca pare

  // intento inmediato
  const p = audio.play();
  if(p !== undefined){
    p.then(()=> {
      console.log("🎶 Música de fondo reproduciéndose");
    }).catch(err => {
      console.log("⚠️ Autoplay bloqueado:", err);
      const onFirst = () => {
        audio.play().catch(()=>{});
        window.removeEventListener("touchstart", onFirst);
        window.removeEventListener("click", onFirst);
      };
      window.addEventListener("touchstart", onFirst, {passive:true});
      window.addEventListener("click", onFirst, {passive:true});
    });
  }
})();

/* ===========================
   JUEGO: Corazón a Corazón
   =========================== */
(function game(){
  const canvas = document.getElementById("gameCanvas");
  const ctx = setupCanvasDPR(canvas, 320, 480);

  const player = { x: 160, y: 420, size: 20 };
  const target = { x: 160, y: 60, size: 26 };

  const obstacles = [];
  for(let i=0;i<6;i++){
    obstacles.push({
      x: 20 + Math.random()*280,
      y: 80 + Math.random()*300,
      vy: 0.7 + Math.random()*1,
      size: 22
    });
  }

  let gameOver = false;

  // controles de teclado
  window.addEventListener("keydown", (e)=>{
    if(gameOver) return;
    if(e.key === "ArrowLeft") player.x -= 18;
    if(e.key === "ArrowRight") player.x += 18;
    if(e.key === "ArrowUp") player.y -= 18;
    if(e.key === "ArrowDown") player.y += 18;
    constrainPlayer();
  });

  // controles táctiles
  document.querySelectorAll(".ctl").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(gameOver) return;
      moveDir(btn.getAttribute("data-dir"));
    });
  });

  function moveDir(dir){
    if(dir === "left") player.x -= 18;
    if(dir === "right") player.x += 18;
    if(dir === "up") player.y -= 18;
    if(dir === "down") player.y += 18;
    constrainPlayer();
  }

  function constrainPlayer(){
    player.x = Math.max(18, Math.min(320-18, player.x));
    player.y = Math.max(18, Math.min(480-18, player.y));
  }

  // dibujar corazón
  function drawHeart(x,y,size,color){
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    const s = size/10;
    ctx.moveTo(0, -6*s);
    ctx.bezierCurveTo(14*s, -22*s, 36*s, -8*s, 0, 20*s);
    ctx.bezierCurveTo(-36*s, -8*s, -14*s, -22*s, 0, -6*s);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function draw(){
    ctx.clearRect(0,0,320,480);

    ctx.fillStyle = "rgba(0,0,30,0.2)";
    ctx.fillRect(0,0,320,480);

    drawHeart(target.x, target.y - 6, 24, "#ff6b8a"); // meta
    drawHeart(player.x, player.y - 6, 20, "#79d7ff"); // jugador

    ctx.font = "34px serif"; // estrellas un poco más grandes
    ctx.fillStyle = "#ffd700";
    obstacles.forEach(o=> ctx.fillText("✦", o.x, o.y));
  }

  function update(){
    if(gameOver) return;

    // mover estrellas
    for(let o of obstacles){
      o.y += o.vy;
      if(o.y > 520) { o.y = -20; o.x = 20 + Math.random()*280; }
    }

    // choque con estrella → reinicia al instante y muestra mensaje
    for(let o of obstacles){
      const dx = player.x - o.x;
      const dy = player.y - o.y;
      if(Math.abs(dx) < 20 && Math.abs(dy) < 20){
        player.x = 160; player.y = 420; // reinicia posición
        flashMessage("💔🌟 Una estrella te golpeó... inténtalo otra vez 💔", false);
        return;
      }
    }

    // llegó al corazón → gana inmediatamente
    if(Math.abs(player.x - target.x) < 20 && Math.abs(player.y - target.y) < 20){
      flashMessage("💖💞 ¡Nuestros corazones se juntaron! 💞💖", true);
      gameOver = true;
    }
  }

  function flashMessage(text, win){
    const msgBox = document.getElementById("gameMessage");

    // limpiar y mostrar
    msgBox.innerHTML = "";
    msgBox.style.display = "flex";

    const msg = document.createElement("p");
    msg.style.fontSize = "20px";
    msg.style.textAlign = "center";
    msg.textContent = text;
    msgBox.appendChild(msg);

    if(win){
      const btn = document.createElement("button");
      btn.textContent = "🔄 Volver a unir nuestros corazones 💞";
      btn.style.marginTop = "10px";
      btn.style.padding = "8px 14px";
      btn.style.border = "none";
      btn.style.borderRadius = "10px";
      btn.style.background = "#ff9bb3";
      btn.style.color = "white";
      btn.style.fontSize = "16px";
      btn.style.cursor = "pointer";
      msgBox.appendChild(btn);

      btn.onclick = ()=>{
        player.x = 160; player.y = 420;
        gameOver = false;
        msgBox.style.display="none"; // quitar mensaje al reiniciar
      };
    } else {
      // en caso de perder, quitar mensaje en 2s
      setTimeout(()=>{ msgBox.style.display="none"; }, 2000);
    }
  }

  function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ===========================
   MENSAJE SECRETO (clave josali)
   =========================== */
(function secret(){
  const verBtn = document.getElementById("verBtn");
  const input = document.getElementById("claveInput");
  const card = document.getElementById("loveCard");

  verBtn.addEventListener("click", ()=>{
    const val = (input.value||"").trim().toLowerCase();
    if(val === "josali"){
      card.style.display = "block";
      card.innerHTML = `
        <p style="font-family:'Poppins',sans-serif;font-size:18px;line-height:1.45">
          Negra, he estado haciendo esto antes de bañarme, quería que fuera bonito, ojalá que lo sea.
          Pero si no, me gustaría que sepas que te amo mucho aunque no seamos pareja.
        </p>
        <p style="font-size:16px;line-height:1.5">
          Te amo mucho, eres perfecta para mí y nada de mis errores tienen que ver contigo sino conmigo.
          Entiendo que no soy el mejor, que soy muy tonto, pero no me veo en el futuro con otra persona
          que no seas tú y a ti no te veo con otra persona que no sea yo.
        </p>
        <p style="font-size:16px;line-height:1.5">
          Tal vez no pueda cambiar mis errores pero sí puedo cambiar el futuro para nosotros.
          Adoro y amo nuestra química, te agradezco cada día por todo lo que haces, por todo tu apoyo.
        </p>
        <p style="font-size:16px;line-height:1.5">
          Empecemos bien nuestra semana porque esta semana tendrá muchas sorpresas. Cada día habrá un regalo,
          pequeño o grande, pero habrá. Te amo mucho — ya no estés triste, todo va a mejorar. Mua negrita
        </p>
      `;
    } else {
      card.style.display = "block";
      card.innerHTML = `<p>❌ Clave incorrecta. Prueba de nuevo ❤️</p>`;
    }
  });
})();
