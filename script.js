window.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");

  const cursor = document.getElementById("cursor");
  const btn = document.getElementById("enterBtn");
  const tw = document.getElementById("twScreen");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // ================= COLOR ENGINE =================
  let hueBase = 0;

  // ================= CURSOR =================
  let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  let cursorX = mouse.x;
  let cursorY = mouse.y;

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // ================= PARTICLES =================
  const particles = [];
  const COUNT = 150;

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4
    });
  }

  let running = false;

  function start() {
    if (running) return;
    running = true;
    animate();
  }

  btn?.addEventListener("click", () => {
    if (tw) tw.style.display = "none";
    start();
  });

  function animate() {
    if (!running) return;

    requestAnimationFrame(animate);

    hueBase += 0.5;
    const hue = hueBase % 360;

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ================= PARTICLES =================
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];

      // original motion only
      p.x += p.vx;
      p.y += p.vy;

      // wrap edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // ================= MAGNETIC DISTORTION (NO MOVEMENT) =================
      let dx = mouse.x - p.x;
      let dy = mouse.y - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      const radius = 160;

      // distortion factor (NOT velocity change)
      let offsetX = 0;
      let offsetY = 0;

      if (dist < radius) {
        let force = (1 - dist / radius);

        // perpendicular "bend" effect
        offsetX = -dy * force * 0.08;
        offsetY = dx * force * 0.08;
      }

      let px = p.x + offsetX;
      let py = p.y + offsetY;

      // ================= WIREFRAMES =================
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];

        let dx2 = px - p2.x;
        let dy2 = py - p2.y;
        let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (dist2 < 140) {
          let alpha = 1 - dist2 / 140;

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(p2.x, p2.y);

          ctx.strokeStyle = `hsla(${hue},100%,60%,${alpha})`;
          ctx.stroke();
        }
      }

      // ================= MOUSE LINES =================
      let mdx = px - mouse.x;
      let mdy = py - mouse.y;
      let mdist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mdist < 180) {
        let alpha = 1 - mdist / 180;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(mouse.x, mouse.y);

        ctx.strokeStyle = `hsla(${(hue + 180) % 360},100%,60%,${alpha})`;
        ctx.stroke();
      }
    }

    // ================= CURSOR =================
    cursorX += (mouse.x - cursorX) * 0.2;
    cursorY += (mouse.y - cursorY) * 0.2;

    cursor.style.left = cursorX + "px";
    cursor.style.top = cursorY + "px";

    cursor.style.background = `hsl(${hue},100%,60%)`;
    cursor.style.boxShadow = `0 0 14px hsl(${hue},100%,60%)`;

    // ================= TEXT SYNC =================
    document.querySelectorAll(".sync").forEach(el => {
      el.style.color = `hsl(${hue},100%,60%)`;
    });
  }

});
