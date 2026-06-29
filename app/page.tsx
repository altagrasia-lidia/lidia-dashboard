'use client';
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Weekly rotating quotes ───────────────────────────────────────────────────
const QUOTES = [
  { text: "She remembered who she was and the game changed.", author: "Lalah Delia" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Abundance is not something we acquire. It is something we tune into.", author: "Wayne Dyer" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "You are worthy of everything beautiful you are calling in.", author: "Unknown" },
  { text: "She is clothed in strength and dignity, and she laughs without fear of the future.", author: "Proverbs 31:25" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "The universe is conspiring in your favor — always.", author: "Unknown" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "You have been assigned this mountain to show others it can be moved.", author: "Unknown" },
  { text: "One small positive thought in the morning can change your whole day.", author: "Dalai Lama" },
];

function getWeeklyQuote() {
  const start = new Date(2024, 0, 1);
  const now = new Date();
  const weeks = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
  return QUOTES[weeks % QUOTES.length];
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:       "#1A0A10",
  surface:  "#2A0F18",
  card:     "#331220",
  border:   "#5C1F35",
  text:     "#F5DDD8",
  muted:    "#A07080",
  subtle:   "#6B3045",
  magenta:  "#C2185B",
  gold:     "#C9960A",
  orange:   "#C96A1A",
  rose:     "#D4789C",
  olive:    "#8B7D2A",
  crimson:  "#8B1A2F",
};

// ─── Confetti + pop sound ─────────────────────────────────────────────────────
function fireConfetti(x, y) {
  const colors = [P.magenta, P.gold, P.orange, P.rose, "#fff", P.olive];
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999`;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const particles = Array.from({ length: 60 }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 14,
    vy: Math.random() * -12 - 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 7 + 3,
    rotation: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 10,
    alpha: 1,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));
  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.4;
      p.vx *= 0.98; p.rotation += p.rotV; p.alpha -= 0.018;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
    });
    if (alive) frame = requestAnimationFrame(draw);
    else { cancelAnimationFrame(frame); canvas.remove(); }
  }
  draw();
}

function playPop() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
  } catch {}
}

// ─── Shared primitives ────────────────────────────────────────────────────────
const s = {
  card: { background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 20 },
  input: {
    background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8,
    padding: "8px 12px", color: P.text, fontSize: 13, outline: "none", width: "100%",
  },
  btn: {
    background: P.magenta, color: "#fff", border: "none", borderRadius: 8,
    padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  ghost: {
    background: "transparent", color: P.muted, border: `1px solid ${P.border}`,
    borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer",
  },
  label: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: P.muted },
};

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "home",      icon: "✦",  label: "Dashboard" },
  { id: "tasks",     icon: "✅", label: "Tasks" },
  { id: "morning",   icon: "🌅", label: "Morning Routine" },
  { id: "night",     icon: "🌙", label: "Night Routine" },
  { id: "gym",       icon: "💪", label: "Gym Tracker" },
  { id: "habits",    icon: "🟩", label: "Habits" },
  { id: "grocery",   icon: "🛒", label: "Grocery List" },
  { id: "recipes",   icon: "🍽️", label: "Recipes" },
  { id: "learning",  icon: "📚", label: "Learning" },
  { id: "finance",   icon: "💰", label: "Finance Goals" },
  { id: "lucky",     icon: "🍀", label: "Lucky Tracker" },
  { id: "bucket",    icon: "🌟", label: "Bucket List" },
  { id: "yearly",    icon: "🎯", label: "Yearly Goals" },
];

// ─── Checkbox with confetti ───────────────────────────────────────────────────
function ConfettiCheck({ checked, onChange, size = 18 }) {
  const ref = useRef();
  function handle() {
    if (!checked) {
      const r = ref.current.getBoundingClientRect();
      fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
      playPop();
    }
    onChange(!checked);
  }
  return (
    <button ref={ref} onClick={handle} style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
      border: `2px solid ${checked ? P.magenta : P.border}`,
      background: checked ? P.magenta : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
    }}>
      {checked && <span style={{ color: "#fff", fontSize: size * 0.6, lineHeight: 1 }}>✓</span>}
    </button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = P.magenta }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ background: P.surface, borderRadius: 99, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: HOME
// ═══════════════════════════════════════════════════════════════════════════════
function HomeSection() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(t); }, []);
  const h = time.getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const quote = getWeeklyQuote();
  const progress = Math.max(0, Math.min(1, (h * 60 + time.getMinutes() - 360) / (17 * 60)));
  const C = 2 * Math.PI * 54;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero greeting */}
      <div style={{ ...s.card, background: `linear-gradient(135deg, #3D1025 0%, #1A0A10 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.05 }}>✦</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Arc clock */}
          <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
            <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke={P.border} strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={P.gold} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${C * progress} ${C}`} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: P.gold, fontFamily: "monospace" }}>
                {time.getHours().toString().padStart(2,"0")}:{time.getMinutes().toString().padStart(2,"0")}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: P.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: P.text, margin: 0 }}>
              {greeting}, Lidia ✦
            </h1>
            <p style={{ color: P.rose, fontSize: 13, margin: "4px 0 0", fontStyle: "italic" }}>
              "{quote.text}"
            </p>
            <p style={{ color: P.subtle, fontSize: 11, margin: "2px 0 0" }}>— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* Quick stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { icon: "💰", label: "Savings goal", value: "$800/mo", color: P.gold },
          { icon: "📈", label: "Invest goal", value: "$200/mo", color: P.olive },
          { icon: "🌅", label: "Routine starts", value: "10:30am", color: P.rose },
        ].map(s2 => (
          <div key={s2.label} style={{ ...s.card, textAlign: "center" }}>
            <div style={{ fontSize: 24 }}>{s2.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s2.color }}>{s2.value}</div>
            <div style={{ fontSize: 11, color: P.muted }}>{s2.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: TASKS
// ═══════════════════════════════════════════════════════════════════════════════
function TasksSection() {
  const [items, setItems] = useState([
    { id: 1, text: "Drink 8 glasses of water", done: false, priority: "high" },
    { id: 2, text: "Reply to emails", done: false, priority: "medium" },
    { id: 3, text: "30 min walk", done: false, priority: "low" },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [showDone, setShowDone] = useState(false);

  function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setItems(p => [{ id: Date.now(), text, done: false, priority }, ...p]);
    setText("");
  }

  const pColor = { high: P.magenta, medium: P.gold, low: P.subtle };
  const active = items.filter(i => !i.done);
  const done = items.filter(i => i.done);

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={s.label}>Tasks</span>
        <span style={{ fontSize: 11, color: P.muted, background: P.surface, padding: "2px 8px", borderRadius: 99 }}>{active.length} remaining</span>
      </div>
      <form onSubmit={add} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a task…" style={{ ...s.input, flex: 1 }} />
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...s.input, width: 80 }}>
          <option value="high">High</option>
          <option value="medium">Med</option>
          <option value="low">Low</option>
        </select>
        <button type="submit" style={s.btn}>+</button>
      </form>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {active.map(item => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(90,20,45,0.3)", borderRadius: 10 }}>
            <ConfettiCheck checked={item.done} onChange={v => setItems(p => p.map(i => i.id === item.id ? { ...i, done: v } : i))} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: pColor[item.priority], flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: P.text }}>{item.text}</span>
            <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
        ))}
        {done.length > 0 && (
          <>
            <button onClick={() => setShowDone(v => !v)} style={{ background: "none", border: "none", color: P.subtle, fontSize: 12, cursor: "pointer", textAlign: "left", padding: "4px 0" }}>
              {showDone ? "▲" : "▼"} {done.length} completed
            </button>
            {showDone && done.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(90,20,45,0.15)", borderRadius: 10, opacity: 0.5 }}>
                <ConfettiCheck checked={item.done} onChange={v => setItems(p => p.map(i => i.id === item.id ? { ...i, done: v } : i))} />
                <span style={{ flex: 1, fontSize: 13, color: P.muted, textDecoration: "line-through" }}>{item.text}</span>
                <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer" }}>×</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: ROUTINE (shared for morning/night)
// ═══════════════════════════════════════════════════════════════════════════════
function RoutineSection({ type }) {
  const defaults = type === "morning"
    ? ["Wake up & stretch", "Drink a glass of water", "Skincare routine", "Healthy breakfast", "Journal / intentions", "Quick meditation"]
    : ["No screens 30 min before bed", "Skincare routine", "Gratitude journal", "Read for 20 minutes", "Dim lights", "Set tomorrow's intentions"];

  const [items, setItems] = useState(defaults.map((t, i) => ({ id: i, text: t, done: false })));
  const [newText, setNewText] = useState("");

  function add(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    setItems(p => [...p, { id: Date.now(), text: newText, done: false }]);
    setNewText("");
  }

  const pct = items.length ? Math.round(items.filter(i => i.done).length / items.length * 100) : 0;
  const icon = type === "morning" ? "🌅" : "🌙";
  const color = type === "morning" ? P.gold : P.rose;

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={s.label}>{icon} {type === "morning" ? "Morning" : "Night"} Routine</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ marginBottom: 14 }}>
        <ProgressBar value={pct} max={100} color={color} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "rgba(90,20,45,0.25)", borderRadius: 8 }}>
            <ConfettiCheck checked={item.done} onChange={v => setItems(p => p.map(i => i.id === item.id ? { ...i, done: v } : i))} />
            <span style={{ flex: 1, fontSize: 13, color: item.done ? P.subtle : P.text, textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
            <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer" }}>×</button>
          </div>
        ))}
      </div>
      <form onSubmit={add} style={{ display: "flex", gap: 8 }}>
        <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="Add step…" style={{ ...s.input, flex: 1 }} />
        <button type="submit" style={{ ...s.btn, background: color }}>+</button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: GYM TRACKER
// ═══════════════════════════════════════════════════════════════════════════════
const GYM_TYPES = ["Run 🏃‍♀️", "Walk 🚶‍♀️", "Hike 🥾", "Pilates 🧘‍♀️", "Yoga 🧘", "Weight Lifting 💪", "Stretching 🤸‍♀️", "Other"];

function GymSection() {
  const [sessions, setSessions] = useState([
    { id: 1, type: "Pilates 🧘‍♀️", duration: 45, notes: "Core focus", date: new Date().toLocaleDateString() },
  ]);
  const [type, setType] = useState("Run 🏃‍♀️");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  function add(e) {
    e.preventDefault();
    if (!duration) return;
    setSessions(p => [{ id: Date.now(), type, duration: Number(duration), notes, date: new Date().toLocaleDateString() }, ...p]);
    setDuration(""); setNotes("");
  }

  const totalMins = sessions.reduce((a, s) => a + s.duration, 0);
  const weekSessions = sessions.length;

  return (
    <div style={s.card}>
      <span style={s.label}>💪 Gym Tracker</span>
      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <div style={{ flex: 1, background: P.surface, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: P.magenta }}>{weekSessions}</div>
          <div style={{ fontSize: 11, color: P.muted }}>sessions logged</div>
        </div>
        <div style={{ flex: 1, background: P.surface, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: P.gold }}>{totalMins}</div>
          <div style={{ fontSize: 11, color: P.muted }}>total minutes</div>
        </div>
      </div>
      <form onSubmit={add} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <select value={type} onChange={e => setType(e.target.value)} style={s.input}>
          {GYM_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (min)" style={{ ...s.input, flex: 1 }} />
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" style={{ ...s.input, flex: 2 }} />
        </div>
        <button type="submit" style={s.btn}>Log Session</button>
      </form>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sessions.map(ses => (
          <div key={ses.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(90,20,45,0.3)", borderRadius: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: P.text, fontWeight: 600 }}>{ses.type}</div>
              {ses.notes && <div style={{ fontSize: 11, color: P.muted }}>{ses.notes}</div>}
            </div>
            <span style={{ fontSize: 12, color: P.gold, fontWeight: 700 }}>{ses.duration}m</span>
            <span style={{ fontSize: 11, color: P.subtle }}>{ses.date}</span>
            <button onClick={() => setSessions(p => p.filter(i => i.id !== ses.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: HABITS
// ═══════════════════════════════════════════════════════════════════════════════
function HabitsSection() {
  const [habits, setHabits] = useState([
    { id: 1, name: "Drink water 💧", color: P.rose, completions: {} },
    { id: 2, name: "Read 📖", color: P.gold, completions: {} },
    { id: 3, name: "Move my body 🏃‍♀️", color: P.magenta, completions: {} },
  ]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(P.magenta);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1) + "|" + d.toLocaleDateString();
  });

  function toggle(hid, day) {
    const key = day.split("|")[1];
    setHabits(p => p.map(h => {
      if (h.id !== hid) return h;
      const c = { ...h.completions };
      if (c[key]) { delete c[key]; }
      else {
        const el = document.getElementById(`hab-${hid}-${key}`);
        if (el) { const r = el.getBoundingClientRect(); fireConfetti(r.left + 12, r.top + 12); playPop(); }
        c[key] = true;
      }
      return { ...h, completions: c };
    }));
  }

  function add(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setHabits(p => [...p, { id: Date.now(), name: newName, color: newColor, completions: {} }]);
    setNewName("");
  }

  const COLORS = [P.magenta, P.gold, P.orange, P.rose, P.olive, P.crimson];

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={s.label}>🟩 Habit Tracker</span>
      </div>
      {/* Day headers */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={{ flex: 1 }} />
        {days.map(d => (
          <div key={d} style={{ width: 28, textAlign: "center", fontSize: 10, color: P.subtle }}>{d.split("|")[0]}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {habits.map(h => {
          const streak = (() => {
            let s = 0, d = new Date();
            while (true) {
              if (h.completions[d.toLocaleDateString()]) { s++; d.setDate(d.getDate() - 1); } else break;
            }
            return s;
          })();
          return (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ flex: 1, fontSize: 13, color: P.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
              {streak > 0 && <span style={{ fontSize: 11, color: P.gold }}>🔥{streak}</span>}
              {days.map(d => {
                const key = d.split("|")[1];
                const done = !!h.completions[key];
                return (
                  <button id={`hab-${h.id}-${key}`} key={d} onClick={() => toggle(h.id, d)}
                    style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, cursor: "pointer", border: "none",
                      background: done ? h.color : P.surface, transition: "all 0.15s" }} />
                );
              })}
              <button onClick={() => setHabits(p => p.filter(i => i.id !== h.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          );
        })}
      </div>
      <form onSubmit={add} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New habit…" style={{ ...s.input, flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setNewColor(c)}
              style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: `2px solid ${newColor === c ? "#fff" : "transparent"}`, cursor: "pointer" }} />
          ))}
        </div>
        <button type="submit" style={s.btn}>+</button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: GROCERY
// ═══════════════════════════════════════════════════════════════════════════════
const GROCERY_CATS = ["🥩 Protein", "🥦 Produce", "🥛 Dairy", "🍞 Bakery", "🥫 Pantry", "🧴 Household", "Other"];

function GrocerySection() {
  const [items, setItems] = useState([
    { id: 1, name: "Chicken breast", cat: "🥩 Protein", done: false },
    { id: 2, name: "Spinach", cat: "🥦 Produce", done: false },
    { id: 3, name: "Greek yogurt", cat: "🥛 Dairy", done: false },
  ]);
  const [name, setName] = useState(""); const [cat, setCat] = useState("🥦 Produce");

  function add(e) { e.preventDefault(); if (!name.trim()) return; setItems(p => [...p, { id: Date.now(), name, cat, done: false }]); setName(""); }

  const grouped = GROCERY_CATS.reduce((acc, c) => {
    const g = items.filter(i => i.cat === c);
    if (g.length) acc[c] = g;
    return acc;
  }, {});

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={s.label}>🛒 Grocery List</span>
        <button onClick={() => setItems(p => p.filter(i => !i.done))} style={{ ...s.ghost, fontSize: 11 }}>Clear checked</button>
      </div>
      <form onSubmit={add} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Item…" style={{ ...s.input, flex: 1 }} />
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...s.input, width: 130 }}>
          {GROCERY_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" style={s.btn}>+</button>
      </form>
      {Object.entries(grouped).map(([cat, its]) => (
        <div key={cat} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: P.muted, marginBottom: 6 }}>{cat}</div>
          {its.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", marginBottom: 4, background: "rgba(90,20,45,0.2)", borderRadius: 8 }}>
              <ConfettiCheck checked={item.done} onChange={v => setItems(p => p.map(i => i.id === item.id ? { ...i, done: v } : i))} />
              <span style={{ flex: 1, fontSize: 13, color: item.done ? P.subtle : P.text, textDecoration: item.done ? "line-through" : "none" }}>{item.name}</span>
              <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer" }}>×</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: RECIPES
// ═══════════════════════════════════════════════════════════════════════════════
function RecipesSection() {
  const [recipes, setRecipes] = useState([
    { id: 1, name: "Salmon & Roasted Veggies", category: "Dinner", ingredients: "Salmon, asparagus, lemon, olive oil", steps: "Season salmon. Roast veggies at 400°F for 20 min. Cook salmon 4 min each side.", link: "" },
  ]);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Dinner", ingredients: "", steps: "", link: "" });

  function save(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setRecipes(p => [...p, { id: Date.now(), ...form }]);
    setForm({ name: "", category: "Dinner", ingredients: "", steps: "", link: "" });
    setAdding(false);
  }

  if (selected) {
    const r = recipes.find(x => x.id === selected);
    return (
      <div style={s.card}>
        <button onClick={() => setSelected(null)} style={{ ...s.ghost, marginBottom: 12 }}>← Back</button>
        <h2 style={{ color: P.text, fontSize: 18, margin: "0 0 4px" }}>{r.name}</h2>
        <span style={{ fontSize: 11, color: P.muted, background: P.surface, padding: "2px 8px", borderRadius: 99 }}>{r.category}</span>
        {r.link && <div style={{ marginTop: 8 }}><a href={r.link} target="_blank" rel="noreferrer" style={{ color: P.rose, fontSize: 12 }}>🔗 View original recipe</a></div>}
        {r.ingredients && <>
          <div style={{ ...s.label, margin: "16px 0 8px" }}>Ingredients</div>
          <div style={{ fontSize: 13, color: P.text, background: P.surface, borderRadius: 8, padding: 12, whiteSpace: "pre-wrap" }}>{r.ingredients}</div>
        </>}
        {r.steps && <>
          <div style={{ ...s.label, margin: "16px 0 8px" }}>Steps</div>
          <div style={{ fontSize: 13, color: P.text, background: P.surface, borderRadius: 8, padding: 12, whiteSpace: "pre-wrap" }}>{r.steps}</div>
        </>}
      </div>
    );
  }

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={s.label}>🍽️ Recipes</span>
        <button onClick={() => setAdding(v => !v)} style={s.btn}>+ Add Recipe</button>
      </div>
      {adding && (
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, padding: 12, background: P.surface, borderRadius: 10 }}>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Recipe name" style={s.input} />
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={s.input}>
            {["Breakfast","Lunch","Dinner","Snack","Drink","Dessert"].map(c => <option key={c}>{c}</option>)}
          </select>
          <textarea value={form.ingredients} onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))} placeholder="Ingredients (one per line)" rows={3} style={{ ...s.input, resize: "vertical" }} />
          <textarea value={form.steps} onChange={e => setForm(p => ({ ...p, steps: e.target.value }))} placeholder="Steps / instructions" rows={3} style={{ ...s.input, resize: "vertical" }} />
          <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="Link to recipe (optional)" style={s.input} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" style={{ ...s.btn, flex: 1 }}>Save</button>
            <button type="button" onClick={() => setAdding(false)} style={{ ...s.ghost, flex: 1 }}>Cancel</button>
          </div>
        </form>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {recipes.map(r => (
          <div key={r.id} onClick={() => setSelected(r.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(90,20,45,0.3)", borderRadius: 10, cursor: "pointer" }}>
            <span style={{ fontSize: 20 }}>🍽️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: P.text, fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: P.muted }}>{r.category}</div>
            </div>
            <span style={{ color: P.muted, fontSize: 16 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: LEARNING
// ═══════════════════════════════════════════════════════════════════════════════
function LearningSection() {
  const [tab, setTab] = useState("books");
  const [books, setBooks] = useState([{ id: 1, title: "Atomic Habits", author: "James Clear", status: "reading", progress: 60, notes: "Life-changing." }]);
  const [courses, setCourses] = useState([{ id: 1, title: "Pilates Instructor Course", platform: "Udemy", status: "in progress", progress: 30, notes: "" }]);
  const [notes, setNotes] = useState([{ id: 1, content: "Habits stack: pair a new habit with an existing one", date: new Date().toLocaleDateString() }]);
  const [form, setForm] = useState({});
  const [noteText, setNoteText] = useState("");
  const [adding, setAdding] = useState(false);

  function addBook(e) {
    e.preventDefault();
    if (!form.title) return;
    setBooks(p => [...p, { id: Date.now(), title: form.title, author: form.author || "", status: "want to read", progress: 0, notes: "" }]);
    setForm({}); setAdding(false);
  }
  function addCourse(e) {
    e.preventDefault();
    if (!form.title) return;
    setCourses(p => [...p, { id: Date.now(), title: form.title, platform: form.platform || "", status: "not started", progress: 0, notes: "" }]);
    setForm({}); setAdding(false);
  }
  function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotes(p => [{ id: Date.now(), content: noteText, date: new Date().toLocaleDateString() }, ...p]);
    setNoteText("");
  }

  const statusColor = { "reading": P.gold, "completed": P.olive, "want to read": P.subtle, "in progress": P.orange, "not started": P.subtle, "finished": P.olive };

  return (
    <div style={s.card}>
      <span style={{ ...s.label, display: "block", marginBottom: 12 }}>📚 Learning</span>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["books", "courses", "notes"].map(t => (
          <button key={t} onClick={() => { setTab(t); setAdding(false); }} style={{ ...s.ghost, background: tab === t ? P.surface : "transparent", color: tab === t ? P.text : P.muted, border: `1px solid ${tab === t ? P.border : "transparent"}` }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {tab === "books" && (
        <>
          {!adding ? <button onClick={() => setAdding(true)} style={{ ...s.btn, marginBottom: 12, width: "100%" }}>+ Add Book</button>
          : <form onSubmit={addBook} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12, padding: 12, background: P.surface, borderRadius: 10 }}>
              <input value={form.title || ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Book title" style={s.input} />
              <input value={form.author || ""} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} placeholder="Author" style={s.input} />
              <div style={{ display: "flex", gap: 8 }}><button type="submit" style={{ ...s.btn, flex: 1 }}>Save</button><button type="button" onClick={() => setAdding(false)} style={{ ...s.ghost, flex: 1 }}>Cancel</button></div>
            </form>}
          {books.map(b => (
            <div key={b.id} style={{ padding: "12px 14px", background: "rgba(90,20,45,0.3)", borderRadius: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 13, color: P.text, fontWeight: 600 }}>{b.title}</div>
                <span style={{ fontSize: 10, color: statusColor[b.status] || P.muted, background: P.surface, padding: "2px 6px", borderRadius: 99 }}>{b.status}</span>
              </div>
              {b.author && <div style={{ fontSize: 11, color: P.muted, marginBottom: 6 }}>{b.author}</div>}
              <ProgressBar value={b.progress} max={100} color={P.gold} />
              <input type="range" min={0} max={100} value={b.progress} onChange={e => setBooks(p => p.map(x => x.id === b.id ? { ...x, progress: Number(e.target.value) } : x))}
                style={{ width: "100%", marginTop: 4, accentColor: P.gold }} />
              <button onClick={() => setBooks(p => p.filter(i => i.id !== b.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer", fontSize: 11 }}>Remove</button>
            </div>
          ))}
        </>
      )}

      {tab === "courses" && (
        <>
          {!adding ? <button onClick={() => setAdding(true)} style={{ ...s.btn, marginBottom: 12, width: "100%" }}>+ Add Course</button>
          : <form onSubmit={addCourse} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12, padding: 12, background: P.surface, borderRadius: 10 }}>
              <input value={form.title || ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Course name" style={s.input} />
              <input value={form.platform || ""} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} placeholder="Platform (Udemy, YouTube…)" style={s.input} />
              <div style={{ display: "flex", gap: 8 }}><button type="submit" style={{ ...s.btn, flex: 1 }}>Save</button><button type="button" onClick={() => setAdding(false)} style={{ ...s.ghost, flex: 1 }}>Cancel</button></div>
            </form>}
          {courses.map(c => (
            <div key={c.id} style={{ padding: "12px 14px", background: "rgba(90,20,45,0.3)", borderRadius: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 13, color: P.text, fontWeight: 600 }}>{c.title}</div>
                <span style={{ fontSize: 10, color: statusColor[c.status] || P.muted, background: P.surface, padding: "2px 6px", borderRadius: 99 }}>{c.status}</span>
              </div>
              {c.platform && <div style={{ fontSize: 11, color: P.muted, marginBottom: 6 }}>{c.platform}</div>}
              <ProgressBar value={c.progress} max={100} color={P.orange} />
              <input type="range" min={0} max={100} value={c.progress} onChange={e => setCourses(p => p.map(x => x.id === c.id ? { ...x, progress: Number(e.target.value) } : x))}
                style={{ width: "100%", marginTop: 4, accentColor: P.orange }} />
              <button onClick={() => setCourses(p => p.filter(i => i.id !== c.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer", fontSize: 11 }}>Remove</button>
            </div>
          ))}
        </>
      )}

      {tab === "notes" && (
        <>
          <form onSubmit={addNote} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="What did you learn today?" style={{ ...s.input, flex: 1 }} />
            <button type="submit" style={s.btn}>+</button>
          </form>
          {notes.map(n => (
            <div key={n.id} style={{ padding: "10px 12px", background: "rgba(90,20,45,0.3)", borderRadius: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 13, color: P.text }}>{n.content}</div>
              <div style={{ fontSize: 11, color: P.subtle, marginTop: 4 }}>{n.date}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: FINANCE
// ═══════════════════════════════════════════════════════════════════════════════
function FinanceSection() {
  const [savingsLog, setSavingsLog] = useState([]);
  const [investLog, setInvestLog] = useState([]);
  const [savingsAmt, setSavingsAmt] = useState("");
  const [investAmt, setInvestAmt] = useState("");
  const [note, setNote] = useState("");

  const SAVINGS_GOAL = 800;
  const INVEST_GOAL = 200;

  const totalSaved = savingsLog.reduce((a, e) => a + e.amount, 0);
  const totalInvested = investLog.reduce((a, e) => a + e.amount, 0);

  function logSavings(e) {
    e.preventDefault();
    if (!savingsAmt) return;
    setSavingsLog(p => [{ id: Date.now(), amount: Number(savingsAmt), note, date: new Date().toLocaleDateString() }, ...p]);
    setSavingsAmt(""); setNote("");
  }
  function logInvest(e) {
    e.preventDefault();
    if (!investAmt) return;
    setInvestLog(p => [{ id: Date.now(), amount: Number(investAmt), note, date: new Date().toLocaleDateString() }, ...p]);
    setInvestAmt(""); setNote("");
  }

  return (
    <div style={s.card}>
      <span style={{ ...s.label, display: "block", marginBottom: 16 }}>💰 Finance Goals</span>

      {/* Savings */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: P.text, fontWeight: 600 }}>💵 Monthly Savings</span>
          <span style={{ fontSize: 13, color: P.gold, fontWeight: 700 }}>${totalSaved} <span style={{ color: P.muted, fontWeight: 400 }}>/ ${SAVINGS_GOAL}</span></span>
        </div>
        <ProgressBar value={totalSaved} max={SAVINGS_GOAL} color={P.gold} />
        <form onSubmit={logSavings} style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input value={savingsAmt} onChange={e => setSavingsAmt(e.target.value)} type="number" placeholder="Amount saved ($)" style={{ ...s.input, flex: 1 }} />
          <button type="submit" style={{ ...s.btn, background: P.gold }}>Log</button>
        </form>
        {savingsLog.slice(0, 3).map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: P.muted, padding: "4px 0" }}>
            <span>{e.note || "Savings deposit"}</span>
            <span style={{ color: P.gold }}>+${e.amount}</span>
          </div>
        ))}
      </div>

      {/* Investing */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: P.text, fontWeight: 600 }}>📈 Monthly Investing</span>
          <span style={{ fontSize: 13, color: P.olive, fontWeight: 700 }}>${totalInvested} <span style={{ color: P.muted, fontWeight: 400 }}>/ ${INVEST_GOAL}</span></span>
        </div>
        <ProgressBar value={totalInvested} max={INVEST_GOAL} color={P.olive} />
        <form onSubmit={logInvest} style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input value={investAmt} onChange={e => setInvestAmt(e.target.value)} type="number" placeholder="Amount invested ($)" style={{ ...s.input, flex: 1 }} />
          <button type="submit" style={{ ...s.btn, background: P.olive }}>Log</button>
        </form>
        {investLog.slice(0, 3).map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: P.muted, padding: "4px 0" }}>
            <span>{e.note || "Investment"}</span>
            <span style={{ color: P.olive }}>+${e.amount}</span>
          </div>
        ))}
      </div>

      {/* Milestone */}
      {totalSaved >= SAVINGS_GOAL && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: `${P.gold}20`, border: `1px solid ${P.gold}50`, borderRadius: 10, textAlign: "center" }}>
          <span style={{ fontSize: 16 }}>🎉</span>
          <span style={{ fontSize: 13, color: P.gold, fontWeight: 600 }}> Savings goal reached this month, Lidia!</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: LUCKY TRACKER
// ═══════════════════════════════════════════════════════════════════════════════
const LUCKY_TYPES = [
  { key: "gratitude", label: "Gratitude ✨", color: P.rose },
  { key: "manifest", label: "Manifestation 🌙", color: P.gold },
  { key: "win", label: "Lucky Moment 🍀", color: P.olive },
];

function LuckySection() {
  const [tab, setTab] = useState("gratitude");
  const [entries, setEntries] = useState({
    gratitude: [{ id: 1, text: "Woke up healthy and grateful", date: new Date().toLocaleDateString() }],
    manifest: [{ id: 1, text: "I am attracting abundance in all areas of my life", date: new Date().toLocaleDateString() }],
    win: [{ id: 1, text: "Found a parking spot right away 🍀", date: new Date().toLocaleDateString() }],
  });
  const [text, setText] = useState("");

  function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setEntries(p => ({ ...p, [tab]: [{ id: Date.now(), text, date: new Date().toLocaleDateString() }, ...p[tab]] }));
    setText("");
  }

  const cfg = LUCKY_TYPES.find(t => t.key === tab);

  return (
    <div style={s.card}>
      <span style={{ ...s.label, display: "block", marginBottom: 12 }}>🍀 Lucky Tracker</span>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {LUCKY_TYPES.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ ...s.ghost, flex: 1, fontSize: 11, background: tab === t.key ? t.color + "30" : "transparent", color: tab === t.key ? t.color : P.muted, border: `1px solid ${tab === t.key ? t.color + "60" : "transparent"}` }}>{t.label}</button>
        ))}
      </div>
      <form onSubmit={add} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder={`Add ${cfg.label}…`} style={{ ...s.input, flex: 1 }} />
        <button type="submit" style={{ ...s.btn, background: cfg.color }}>+</button>
      </form>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries[tab].map(e => (
          <div key={e.id} style={{ padding: "12px 14px", background: cfg.color + "15", border: `1px solid ${cfg.color}30`, borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: P.text, fontStyle: "italic" }}>"{e.text}"</div>
            <div style={{ fontSize: 11, color: P.subtle, marginTop: 4 }}>{e.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: BUCKET LIST
// ═══════════════════════════════════════════════════════════════════════════════
const BUCKET_CATS = ["🌍 Travel", "💪 Personal Growth", "🎉 Experiences", "💼 Career", "💛 Relationships", "Other"];

function BucketSection() {
  const [items, setItems] = useState([
    { id: 1, text: "See the Northern Lights", cat: "🌍 Travel", done: false },
    { id: 2, text: "Run a 5K", cat: "💪 Personal Growth", done: false },
    { id: 3, text: "Learn to cook a 3-course meal", cat: "🎉 Experiences", done: false },
  ]);
  const [text, setText] = useState("");
  const [cat, setCat] = useState("🌍 Travel");

  function add(e) { e.preventDefault(); if (!text.trim()) return; setItems(p => [...p, { id: Date.now(), text, cat, done: false }]); setText(""); }

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={s.label}>🌟 Bucket List</span>
        <span style={{ fontSize: 11, color: P.muted }}>{items.filter(i => i.done).length}/{items.length} done</span>
      </div>
      <form onSubmit={add} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Dream big…" style={{ ...s.input, flex: 1 }} />
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...s.input, width: 140 }}>
          {BUCKET_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" style={s.btn}>+</button>
      </form>
      {BUCKET_CATS.map(c => {
        const its = items.filter(i => i.cat === c);
        if (!its.length) return null;
        return (
          <div key={c} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: P.muted, marginBottom: 6 }}>{c}</div>
            {its.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 4, background: item.done ? "rgba(90,20,45,0.1)" : "rgba(90,20,45,0.3)", borderRadius: 8 }}>
                <ConfettiCheck checked={item.done} onChange={v => setItems(p => p.map(i => i.id === item.id ? { ...i, done: v } : i))} />
                <span style={{ flex: 1, fontSize: 13, color: item.done ? P.subtle : P.text, textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
                {item.done && <span style={{ fontSize: 14 }}>🌟</span>}
                <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", color: P.subtle, cursor: "pointer" }}>×</button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: YEARLY GOALS
// ═══════════════════════════════════════════════════════════════════════════════
function YearlySection() {
  const year = new Date().getFullYear();
  const dayOfYear = Math.floor((new Date() - new Date(year, 0, 0)) / 86400000);
  const yearProgress = Math.round(dayOfYear / 365 * 100);

  const [goals, setGoals] = useState([
    { id: 1, text: "Save $9,600 this year", progress: 0, target: 9600, unit: "$", color: P.gold },
    { id: 2, text: "Read 12 books", progress: 0, target: 12, unit: "books", color: P.rose },
    { id: 3, text: "Work out 3x a week consistently", progress: 0, target: 52, unit: "weeks", color: P.magenta },
    { id: 4, text: "Invest $2,400 this year", progress: 0, target: 2400, unit: "$", color: P.olive },
  ]);
  const [text, setText] = useState("");
  const [target, setTarget] = useState("");

  function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setGoals(p => [...p, { id: Date.now(), text, progress: 0, target: Number(target) || 100, unit: "", color: P.orange }]);
    setText(""); setTarget("");
  }

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={s.label}>🎯 {year} Yearly Goals</span>
        <span style={{ fontSize: 11, color: P.muted }}>{yearProgress}% through the year</span>
      </div>

      {/* Year progress */}
      <div style={{ marginBottom: 20 }}>
        <ProgressBar value={yearProgress} max={100} color={P.border} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
        {goals.map(g => (
          <div key={g.id} style={{ padding: "12px 14px", background: "rgba(90,20,45,0.3)", borderRadius: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: P.text, fontWeight: 600 }}>{g.text}</span>
              <span style={{ fontSize: 12, color: g.color, fontWeight: 700 }}>{g.progress}/{g.target} {g.unit}</span>
            </div>
            <ProgressBar value={g.progress} max={g.target} color={g.color} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input type="number" placeholder="Update progress" style={{ ...s.input, flex: 1, fontSize: 12 }}
                onKeyDown={e => { if (e.key === "Enter") { setGoals(p => p.map(x => x.id === g.id ? { ...x, progress: Math.min(g.target, Number(e.target.value)) } : x)); e.target.value = ""; } }} />
              <button onClick={() => setGoals(p => p.filter(i => i.id !== g.id))} style={{ ...s.ghost, fontSize: 12 }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={add} style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="New yearly goal…" style={{ ...s.input, flex: 2 }} />
        <input value={target} onChange={e => setTarget(e.target.value)} type="number" placeholder="Target #" style={{ ...s.input, flex: 1 }} />
        <button type="submit" style={s.btn}>+</button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: DREAM BOARD
// ═══════════════════════════════════════════════════════════════════════════════
const DREAM_CATS = ["✨ All", "💕 Love & relationships", "🌍 Travel", "💰 Wealth & abundance", "🏠 Dream home", "👗 Style & beauty", "💪 Health & body", "🎯 Career & purpose", "🌿 Lifestyle", "🙏 Spiritual growth"];

const SCATTER_CONFIGS = [
  { rotate: -4,  scale: 1.05, zIndex: 3  },
  { rotate:  3,  scale: 0.97, zIndex: 2  },
  { rotate: -2,  scale: 1.02, zIndex: 4  },
  { rotate:  5,  scale: 0.95, zIndex: 1  },
  { rotate: -6,  scale: 1.03, zIndex: 5  },
  { rotate:  2,  scale: 1.0,  zIndex: 2  },
  { rotate: -3,  scale: 0.98, zIndex: 3  },
  { rotate:  4,  scale: 1.04, zIndex: 4  },
  { rotate: -1,  scale: 0.96, zIndex: 1  },
  { rotate:  6,  scale: 1.01, zIndex: 5  },
  { rotate: -5,  scale: 1.0,  zIndex: 2  },
  { rotate:  1,  scale: 0.99, zIndex: 3  },
];

function DreamBoardSection() {
  const [images, setImages] = useState([
    {
      id: 1, src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      caption: "My dream travels ✈️", category: "🌍 Travel", pinColor: P.rose,
    },
    {
      id: 2, src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
      caption: "Abundance & luxury 💰", category: "💰 Wealth & abundance", pinColor: P.gold,
    },
    {
      id: 3, src: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80",
      caption: "My dream home 🏠", category: "🏠 Dream home", pinColor: P.magenta,
    },
    {
      id: 4, src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
      caption: "Strong & glowing 💪", category: "💪 Health & body", pinColor: P.orange,
    },
    {
      id: 5, src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
      caption: "My style era 👗", category: "👗 Style & beauty", pinColor: P.crimson,
    },
    {
      id: 6, src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
      caption: "Deep love & connection 💕", category: "💕 Love & relationships", pinColor: P.rose,
    },
  ]);

  const [activeFilter, setActiveFilter] = useState("✨ All");
  const [showAdd, setShowAdd] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("🌍 Travel");
  const [pinColor, setPinColor] = useState(P.rose);
  const [hoveredId, setHoveredId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef();

  const PIN_COLORS = [P.rose, P.gold, P.magenta, P.orange, P.olive, "#fff"];

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUrlInput(ev.target.result);
    reader.readAsDataURL(file);
  }

  function addImage(e) {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setImages(prev => [{
      id: Date.now(),
      src: urlInput.trim(),
      caption,
      category,
      pinColor,
    }, ...prev]);
    setUrlInput(""); setCaption(""); setShowAdd(false);
  }

  function removeImage(id) {
    setImages(prev => prev.filter(img => img.id !== id));
    if (lightbox === id) setLightbox(null);
  }

  const filtered = activeFilter === "✨ All"
    ? images
    : images.filter(img => img.category === activeFilter);

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: P.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              ✦ Dream Board
            </h2>
            <p style={{ fontSize: 13, color: P.muted, margin: 0, fontStyle: "italic" }}>
              Every image is a prayer. Every vision is already yours.
            </p>
          </div>
          <button onClick={() => setShowAdd(v => !v)} style={{
            ...s.btn,
            background: showAdd ? P.subtle : P.magenta,
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}>
            {showAdd ? "✕ Cancel" : "+ Add Image"}
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{
            background: P.card, border: `1px solid ${P.border}`, borderRadius: 16,
            padding: 20, marginBottom: 20,
            animation: "fadeSlide 0.2s ease-out",
          }}>
            <style>{`@keyframes fadeSlide { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {/* Upload */}
              <div>
                <div style={{ ...s.label, marginBottom: 6 }}>Upload from device</div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
                <button type="button" onClick={() => fileRef.current.click()} style={{
                  width: "100%", padding: "32px 16px", background: P.surface, border: `2px dashed ${P.border}`,
                  borderRadius: 10, color: P.muted, cursor: "pointer", fontSize: 13, textAlign: "center",
                }}>
                  {urlInput && urlInput.startsWith("data:")
                    ? <img src={urlInput} alt="" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6 }} />
                    : <span>📷 Tap to upload<br /><span style={{ fontSize: 11, color: P.subtle }}>JPG, PNG, WEBP</span></span>
                  }
                </button>
              </div>
              {/* URL */}
              <div>
                <div style={{ ...s.label, marginBottom: 6 }}>Or paste image URL</div>
                <textarea
                  value={urlInput.startsWith("data:") ? "" : urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://…"
                  rows={4}
                  style={{ ...s.input, resize: "none", fontSize: 12 }}
                />
                {urlInput && !urlInput.startsWith("data:") && (
                  <img src={urlInput} alt="" style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 6, marginTop: 6 }}
                    onError={e => e.target.style.display = "none"} />
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ ...s.label, marginBottom: 6 }}>Affirmation / caption</div>
                <input value={caption} onChange={e => setCaption(e.target.value)}
                  placeholder="This is already mine ✨" style={s.input} />
              </div>
              <div>
                <div style={{ ...s.label, marginBottom: 6 }}>Category</div>
                <select value={category} onChange={e => setCategory(e.target.value)} style={s.input}>
                  {DREAM_CATS.filter(c => c !== "✨ All").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ ...s.label }}>Pin color</span>
                {PIN_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setPinColor(c)} style={{
                    width: 22, height: 22, borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                    outline: pinColor === c ? `3px solid ${P.text}` : "none", outlineOffset: 2,
                  }} />
                ))}
              </div>
              <button onClick={addImage} style={s.btn}>Pin to Board ✦</button>
            </div>
          </div>
        )}

        {/* Category filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DREAM_CATS.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)} style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 11, cursor: "pointer", border: "none",
              background: activeFilter === cat ? P.magenta : P.surface,
              color: activeFilter === cat ? "#fff" : P.muted,
              transition: "all 0.15s",
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Collage board */}
      {filtered.length === 0 ? (
        <div style={{
          ...s.card, textAlign: "center", padding: "60px 20px",
          border: `2px dashed ${P.border}`,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌙</div>
          <div style={{ fontSize: 15, color: P.muted, marginBottom: 6 }}>Your dream board is waiting</div>
          <div style={{ fontSize: 12, color: P.subtle }}>Add your first image to begin manifesting</div>
        </div>
      ) : (
        <div style={{
          position: "relative",
          background: `linear-gradient(135deg, #1a0a10 0%, #2a0f18 50%, #1a0a10 100%)`,
          borderRadius: 20,
          border: `1px solid ${P.border}`,
          padding: 40,
          minHeight: 600,
          overflow: "hidden",
        }}>
          {/* Subtle texture overlay */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none", opacity: 0.03,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          {/* Board title */}
          <div style={{
            position: "absolute", top: 16, left: 24,
            fontSize: 11, color: P.subtle, letterSpacing: "0.15em", textTransform: "uppercase",
          }}>Lidia's Vision Board ✦</div>

          {/* Scattered images */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 28,
            justifyContent: "center", alignItems: "flex-start",
            paddingTop: 24,
          }}>
            {filtered.map((img, idx) => {
              const cfg = SCATTER_CONFIGS[idx % SCATTER_CONFIGS.length];
              const isHovered = hoveredId === img.id;
              return (
                <div
                  key={img.id}
                  onMouseEnter={() => setHoveredId(img.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position: "relative",
                    transform: `rotate(${isHovered ? 0 : cfg.rotate}deg) scale(${isHovered ? 1.06 : cfg.scale})`,
                    zIndex: isHovered ? 20 : cfg.zIndex,
                    transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), z-index 0s",
                    cursor: "pointer",
                    filter: isHovered ? `drop-shadow(0 12px 32px rgba(194,24,91,0.35))` : `drop-shadow(0 4px 12px rgba(0,0,0,0.5))`,
                  }}
                  onClick={() => setLightbox(img.id)}
                >
                  {/* Pin */}
                  <div style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    width: 16, height: 16, borderRadius: "50% 50% 50% 0",
                    background: img.pinColor, zIndex: 10,
                    boxShadow: `0 2px 8px ${img.pinColor}80`,
                    transformOrigin: "50% 100%",
                    transform: "translateX(-50%) rotate(-45deg)",
                  }} />

                  {/* Polaroid frame */}
                  <div style={{
                    background: "#fff",
                    padding: "10px 10px 28px",
                    borderRadius: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    maxWidth: 200,
                    minWidth: 150,
                  }}>
                    <img
                      src={img.src}
                      alt={img.caption}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 2,
                      }}
                      onError={e => {
                        e.target.style.background = P.card;
                        e.target.style.height = "160px";
                        e.target.src = "";
                      }}
                    />
                    {/* Caption on polaroid */}
                    {img.caption && (
                      <div style={{
                        marginTop: 8, fontSize: 11, color: "#3a1020",
                        textAlign: "center", fontFamily: "Georgia, serif",
                        fontStyle: "italic", lineHeight: 1.3,
                        padding: "0 4px",
                      }}>
                        {img.caption}
                      </div>
                    )}
                  </div>

                  {/* Category tag */}
                  <div style={{
                    position: "absolute", bottom: -10, right: -6,
                    background: img.pinColor, color: "#fff",
                    fontSize: 9, padding: "2px 7px", borderRadius: 99,
                    fontWeight: 700, letterSpacing: "0.05em",
                    boxShadow: `0 2px 6px ${img.pinColor}60`,
                  }}>
                    {img.category.split(" ").slice(1).join(" ")}
                  </div>

                  {/* Delete on hover */}
                  {isHovered && (
                    <button
                      onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                      style={{
                        position: "absolute", top: -6, right: -6,
                        width: 20, height: 20, borderRadius: "50%",
                        background: "#1a0a10", border: `1px solid ${P.border}`,
                        color: P.muted, fontSize: 12, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 30,
                      }}
                    >×</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (() => {
        const img = images.find(i => i.id === lightbox);
        if (!img) return null;
        return (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(10,3,7,0.92)",
              zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
              padding: 40, backdropFilter: "blur(8px)",
            }}
          >
            <div onClick={e => e.stopPropagation()} style={{
              background: "#fff", borderRadius: 4, padding: "16px 16px 36px",
              maxWidth: 480, width: "100%",
              boxShadow: `0 24px 80px rgba(194,24,91,0.3)`,
              transform: `rotate(${SCATTER_CONFIGS[images.indexOf(img) % SCATTER_CONFIGS.length].rotate * 0.3}deg)`,
            }}>
              <img src={img.src} alt={img.caption} style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 2 }} />
              {img.caption && (
                <div style={{ marginTop: 14, fontSize: 15, color: "#3a1020", textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                  {img.caption}
                </div>
              )}
              <div style={{ textAlign: "center", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: img.pinColor, fontWeight: 700 }}>{img.category}</span>
              </div>
            </div>
            <button onClick={() => setLightbox(null)} style={{
              position: "absolute", top: 24, right: 24,
              background: "none", border: `1px solid ${P.border}`, color: P.muted,
              width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer",
            }}>×</button>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [active, setActive] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  const SECTIONS = {
    home:     <HomeSection />,
    tasks:    <TasksSection />,
    morning:  <RoutineSection type="morning" />,
    night:    <RoutineSection type="night" />,
    gym:      <GymSection />,
    habits:   <HabitsSection />,
    grocery:  <GrocerySection />,
    recipes:  <RecipesSection />,
    learning: <LearningSection />,
    finance:  <FinanceSection />,
    lucky:    <LuckySection />,
    bucket:   <BucketSection />,
    yearly:   <YearlySection />,
    dream:    <DreamBoardSection />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: P.bg, color: P.text, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0, background: P.surface, borderRight: `1px solid ${P.border}`,
        display: "flex", flexDirection: "column", overflowY: "auto", padding: "16px 0",
      }}>
        <div style={{ padding: "0 16px 16px", borderBottom: `1px solid ${P.border}`, marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: P.rose, letterSpacing: "-0.02em" }}>✦ Lidia</div>
          <div style={{ fontSize: 10, color: P.subtle, marginTop: 2 }}>Your personal dashboard</div>
        </div>
        {[...NAV, { id: "dream", icon: "🌙", label: "Dream Board" }].map(n => (
          <button key={n.id} onClick={() => setActive(n.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
            background: active === n.id ? `${P.magenta}20` : "transparent",
            borderLeft: `2px solid ${active === n.id ? P.magenta : "transparent"}`,
            border: "none", color: active === n.id ? P.text : P.muted,
            fontSize: 13, cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.12s",
          }}>
            <span style={{ fontSize: 15 }}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        <div style={{ maxWidth: active === "dream" ? 900 : 680, margin: "0 auto" }}>
          {SECTIONS[active]}
        </div>
      </div>
    </div>
  );
}
