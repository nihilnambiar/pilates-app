import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { ArrowRight, Star, ChevronDown, Menu, X, MapPin, Clock, Users } from "lucide-react";
import ChatBot from "../components/shared/ChatBot";
import AnniversaryPopup from "../components/shared/AnniversaryPopup";
import CheckoutModal from "../components/shared/CheckoutModal";
import PilatesQuiz from "../components/shared/PilatesQuiz";
import Iridescence from "../components/shared/Iridescence";
import TextPressure from "../components/shared/TextPressure";
import BorderGlow from "../components/shared/BorderGlow";
import MagicBento from "../components/shared/MagicBento";
import GlassSurface from "../components/shared/GlassSurface";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";

// ─── COLOUR TOKENS ────────────────────────────────────────────
// Steel blue + yellow-green + near-black (matched to Vigour logo)
const C = {
  black:   "#0d0d0d",
  forest:  "#0a1e32",
  green:   "#1a3d6b",
  lime:    "#9DC230",
  gold:    "#1E80C2",
  ivory:   "#f0f5fa",
  cream:   "#f5f8fc",
  white:   "#ffffff",
  muted:   "#6b7a8d",
  border:  "rgba(26,61,107,0.15)",
};

// ─── Reformer SVG (fully animated) ───────────────────────────
function ReformerSVG({ progress }) {
  const carriageX  = useTransform(progress, [0,0.3,0.6,1], [0, 55, -38, 18]);
  const footbarR   = useTransform(progress, [0,0.4,1],     [0,-14, 4]);
  const springW    = useTransform(progress, [0,0.5,1],     [22,13,28]);
  const ropeEnd    = useTransform(progress, [0,1],         [360,435]);
  const platformY  = useTransform(progress, [0,0.5,1],     [0,-4,2]);

  return (
    <motion.svg viewBox="0 0 700 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-3xl mx-auto"
      style={{ filter:"drop-shadow(0 30px 60px rgba(29,90,52,0.3))" }}>

      {/* Ground glow */}
      <ellipse cx="350" cy="200" rx="290" ry="14" fill={C.green} opacity="0.13"/>

      {/* Frame base */}
      <rect x="20" y="168" width="660" height="16" rx="8" fill="#1c2820"/>
      <rect x="30" y="152" width="640" height="18" rx="4" fill="#253029"/>

      {/* Legs */}
      <rect x="24"  y="148" width="22" height="48" rx="5" fill="#1a2420"/>
      <rect x="654" y="148" width="22" height="48" rx="5" fill="#1a2420"/>
      <rect x="52"  y="155" width="14" height="32" rx="4" fill="#1a2420"/>
      <rect x="634" y="155" width="14" height="32" rx="4" fill="#1a2420"/>

      {/* Rails */}
      <rect x="38" y="138" width="624" height="11" rx="5" fill="#2d3d30"/>
      <rect x="38" y="149" width="624" height="6"  rx="3" fill="#253029"/>

      {/* Springs — animated gold */}
      {[0,1,2,3].map(i => (
        <motion.rect key={i} y={136} height={15} rx={3}
          style={{ x: useTransform(progress,[0,1],[60+i*26,80+i*26]), width: springW }}
          fill={i%2===0 ? C.gold : "#a8883e"} opacity={0.9}/>
      ))}

      {/* Carriage */}
      <motion.g style={{ x: carriageX, y: platformY }}>
        {/* Body */}
        <rect x="175" y="112" width="192" height="34" rx="10" fill="#f0ebe0" stroke="#d4c8a8" strokeWidth="1.5"/>
        {/* Cushion */}
        <rect x="183" y="100" width="176" height="25" rx="10" fill="#e8dfc8"/>
        <rect x="189" y="102" width="164" height="21" rx="8"  fill="#f2ead6"/>
        {/* Stitching */}
        <line x1="271" y1="102" x2="271" y2="123" stroke="#d4c8a8" strokeWidth="0.8" opacity="0.5"/>
        <line x1="240" y1="102" x2="240" y2="123" stroke="#d4c8a8" strokeWidth="0.8" opacity="0.4"/>
        <line x1="302" y1="102" x2="302" y2="123" stroke="#d4c8a8" strokeWidth="0.8" opacity="0.4"/>
        {/* Shoulder pads */}
        <rect x="183" y="98"  width="36" height="16" rx="6" fill="#d4c8a8"/>
        <rect x="323" y="98"  width="36" height="16" rx="6" fill="#d4c8a8"/>
        {/* Wheels */}
        <circle cx="200" cy="150" r="7" fill="#1a2420"/><circle cx="200" cy="150" r="3.5" fill="#2d3d30"/>
        <circle cx="222" cy="150" r="7" fill="#1a2420"/><circle cx="222" cy="150" r="3.5" fill="#2d3d30"/>
        <circle cx="318" cy="150" r="7" fill="#1a2420"/><circle cx="318" cy="150" r="3.5" fill="#2d3d30"/>
        <circle cx="340" cy="150" r="7" fill="#1a2420"/><circle cx="340" cy="150" r="3.5" fill="#2d3d30"/>
        {/* Brand plate */}
        <rect x="232" y="118" width="78" height="15" rx="4" fill="#1E80C2" opacity="0.18"/>
        <text x="271" y="128" textAnchor="middle" fontSize="7.5" fontFamily="Georgia,serif"
          fill="#1E80C2" fontWeight="600" letterSpacing="2.5">VIGOUR</text>
      </motion.g>

      {/* Footbar — gold */}
      <motion.g style={{ rotate:footbarR, originX:"86px", originY:"140px" }}
        transformOrigin="86px 140px">
        <rect x="60" y="106" width="52" height="14" rx="6" fill={C.gold}/>
        <rect x="70" y="96"  width="9"  height="46" rx="4" fill="#8a6e2e"/>
        <rect x="89" y="96"  width="9"  height="46" rx="4" fill="#8a6e2e"/>
        {[0,1,2,3,4].map(i=>(
          <line key={i} x1={62+i*8} y1="106" x2={62+i*8} y2="120"
            stroke="#a88a3a" strokeWidth="0.8" opacity="0.5"/>
        ))}
      </motion.g>

      {/* Pulley */}
      <circle cx="658" cy="120" r="15" fill="#253029" stroke="#2d3d30" strokeWidth="2"/>
      <circle cx="658" cy="120" r="8"  fill="#1a2420"/>
      <circle cx="658" cy="120" r="3"  fill={C.gold}/>

      {/* Rope */}
      <motion.line x1="658" y1="120" x2={ropeEnd} y2="120"
        stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4"/>
      <motion.g style={{ x: carriageX }}>
        <circle cx="365" cy="120" r="5.5" fill="none" stroke={C.gold} strokeWidth="2"/>
        <circle cx="365" cy="120" r="2.5" fill={C.gold}/>
      </motion.g>

      {/* Headrest tower */}
      <rect x="636" y="72"  width="28" height="80" rx="7" fill="#253029"/>
      <rect x="632" y="70"  width="36" height="22" rx="6" fill="#2d3d30"/>
      <rect x="638" y="74"  width="24" height="14" rx="4" fill="#e8dfc8"/>
    </motion.svg>
  );
}

// ─── Custom Date Picker ───────────────────────────────────────
function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [view, setView] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_,i) => i+1));
  while (cells.length % 7 !== 0) cells.push(null);

  const selectDate = (day) => {
    if (!day) return;
    const d = new Date(view.year, view.month, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    const iso = `${view.year}-${String(view.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    onChange(iso);
    setOpen(false);
  };

  const prevMonth = () => setView(v => v.month === 0 ? {month:11,year:v.year-1} : {month:v.month-1,year:v.year});
  const nextMonth = () => setView(v => v.month === 11 ? {month:0,year:v.year+1} : {month:v.month+1,year:v.year});

  const isSelected = (day) => {
    if (!day || !value) return false;
    const iso = `${view.year}-${String(view.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return iso === value;
  };
  const isPast = (day) => {
    if (!day) return false;
    return new Date(view.year, view.month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
  const isSunday = (day) => {
    if (!day) return false;
    return new Date(view.year, view.month, day).getDay() === 0;
  };
  const isToday = (day) => {
    return day === today.getDate() && view.month === today.getMonth() && view.year === today.getFullYear();
  };

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})
    : 'Select a date';

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{
          width:'100%', padding:'14px 18px', borderRadius:'12px', textAlign:'left',
          border:`1px solid ${open ? 'rgba(30,128,194,0.8)' : 'rgba(30,128,194,0.3)'}`,
          background:'rgba(255,255,255,0.05)', color: value ? '#ffffff' : 'rgba(255,255,255,0.35)',
          fontFamily:'DM Sans,sans-serif', fontSize:'14px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          transition:'border-color 0.2s',
        }}>
        <span>{displayValue}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(30,128,194,0.7)" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 8px)', left:0, right:0, zIndex:100,
          background:'#080f1a', border:'1px solid rgba(30,128,194,0.25)',
          borderRadius:'16px', padding:'16px', boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Month nav */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
            <button type="button" onClick={prevMonth}
              style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid rgba(30,128,194,0.2)',
                background:'rgba(30,128,194,0.06)',color:'rgba(30,128,194,0.8)',cursor:'pointer',fontSize:'16px',lineHeight:1}}>
              ‹
            </button>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'14px',fontWeight:600,color:'#ffffff',letterSpacing:'0.03em'}}>
              {MONTHS[view.month]} {view.year}
            </span>
            <button type="button" onClick={nextMonth}
              style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid rgba(30,128,194,0.2)',
                background:'rgba(30,128,194,0.06)',color:'rgba(30,128,194,0.8)',cursor:'pointer',fontSize:'16px',lineHeight:1}}>
              ›
            </button>
          </div>

          {/* Day headers */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',marginBottom:'6px'}}>
            {DAYS.map(d => (
              <div key={d} style={{textAlign:'center',fontFamily:'DM Sans,sans-serif',fontSize:'11px',
                fontWeight:600,color:'rgba(30,128,194,0.5)',padding:'4px 0',letterSpacing:'0.05em'}}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px'}}>
            {cells.map((day, i) => {
              const disabled = !day || isPast(day) || isSunday(day);
              return (
              <button key={i} type="button" onClick={() => selectDate(day)} disabled={disabled}
                title={day && isSunday(day) ? 'Closed on Sundays' : undefined}
                style={{
                  height:'36px', borderRadius:'8px', border:'none', cursor: disabled ? 'default' : 'pointer',
                  fontFamily:'DM Sans,sans-serif', fontSize:'13px', fontWeight: isSelected(day) ? 600 : 400,
                  background: isSelected(day) ? 'rgba(30,128,194,1)' : isToday(day) ? 'rgba(30,128,194,0.15)' : 'transparent',
                  color: isSelected(day) ? '#0d0d0d' : disabled ? 'rgba(255,255,255,0.15)' : isToday(day) ? 'rgba(30,128,194,1)' : 'rgba(255,255,255,0.8)',
                  outline: isToday(day) && !isSelected(day) ? '1px solid rgba(30,128,194,0.4)' : 'none',
                  transition:'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (day && !disabled && !isSelected(day)) e.target.style.background='rgba(30,128,194,0.12)'; }}
                onMouseLeave={e => { if (!isSelected(day)) e.target.style.background= isToday(day) ? 'rgba(30,128,194,0.15)' : 'transparent'; }}
              >
                {day || ''}
              </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Trial Form ───────────────────────────────────────────────
const TRIAL_SLOTS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM'];

function TrialForm() {
  const [form, setForm] = useState({ name:"",email:"",phone:"",date:"",time:"",message:"" });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots]         = useState({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookError, setBookError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Fetch live slot availability for the selected date, refreshed periodically
  useEffect(() => {
    if (!form.date) { setSlots({}); return; }
    let cancelled = false;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const res = await fetch(`/api/trial-slots?date=${form.date}`);
        const data = await res.json();
        if (!cancelled) setSlots(data.slots || {});
      } catch {
        if (!cancelled) setSlots({});
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };
    fetchSlots();
    const interval = setInterval(fetchSlots, 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [form.date]);

  // If the previously chosen slot fills up while waiting, clear the selection
  useEffect(() => {
    if (form.time && slots[form.time] === 0) set("time", "");
  }, [slots]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.date || !form.time) return;
    setLoading(true);
    setBookError("");
    try {
      const res = await fetch("/api/book-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          date: form.date, time: form.time, message: form.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookError(data.error || "Booking failed. Please try again.");
        // Refresh slot availability so the user can pick another time
        fetch(`/api/trial-slots?date=${form.date}`).then(r=>r.json()).then(d=>setSlots(d.slots || {})).catch(()=>{});
        return;
      }
      try {
        await fetch("/api/send-trial-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, date: form.date, time: form.time, message: form.message }),
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
      setSent(true);
    } catch (err) {
      console.error("Booking error:", err);
      setBookError("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calendarLinks = () => {
    const start = new Date(form.date);
    let hour = 10;
    if (form.time) {
      const [, h, period] = form.time.match(/(\d+):\d+\s*(AM|PM)/i) || [];
      if (h) { hour = Number(h) % 12; if (period.toUpperCase() === 'PM') hour += 12; }
    }
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const pad = n => String(n).padStart(2, "0");
    const fmtGoogle = d =>
      `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00Z`;
    const fmtIcs = d =>
      `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const title = encodeURIComponent("Trial Pilates Session — Vigour Pilates Studio");
    const details = encodeURIComponent("Your trial session at Vigour Pilates Studio. We'll confirm the exact time within 24 hours.");
    const location = encodeURIComponent("Vigour Pilates Studio");

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmtGoogle(start)}/${fmtGoogle(end)}&details=${details}&location=${location}`;

    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0",
      "PRODID:-//Vigour Pilates//Trial Session//EN",
      "BEGIN:VEVENT",
      `UID:trial-${Date.now()}@vigourpilates.com`,
      `DTSTAMP:${fmtIcs(new Date())}`,
      `DTSTART:${fmtIcs(start)}`,
      `DTEND:${fmtIcs(end)}`,
      "SUMMARY:Trial Pilates Session — Vigour Pilates Studio",
      "DESCRIPTION:Your trial session at Vigour Pilates Studio. We'll confirm the exact time within 24 hours.",
      "LOCATION:Vigour Pilates Studio",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");

    return { googleUrl, ics };
  };

  const openGoogleCalendar = () => {
    const { googleUrl } = calendarLinks();
    window.open(googleUrl, "_blank", "noopener,noreferrer");
  };

  const downloadIcs = () => {
    const { ics } = calendarLinks();
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vigour-pilates-trial.ics"; a.click();
    URL.revokeObjectURL(url);
  };

  if (sent) return (
    <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
      className="text-center py-16">
      <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
        style={{background:C.forest}}>✓</div>
      <h3 className="font-display text-3xl font-semibold mb-3" style={{color:C.white}}>You're in!</h3>
      <p className="font-body mb-8" style={{color:"rgba(255,255,255,0.6)"}}>
        {form.time
          ? <>Your trial session is booked for <strong style={{color:C.white}}>{form.time}</strong>. See you soon!</>
          : "We'll contact you within 24 hours to confirm your trial session."}
      </p>
      {form.date && (
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"10px"}}>
          <p style={{color:"rgba(255,255,255,0.4)", fontSize:"12px", marginBottom:"4px"}}>Save to your calendar</p>
          <div style={{display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center"}}>
            <button
              onClick={openGoogleCalendar}
              style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                padding:"11px 20px", borderRadius:"12px",
                background:"#1E80C2", border:"none",
                color:"#fff", fontFamily:"DM Sans,sans-serif", fontSize:"14px",
                fontWeight:500, cursor:"pointer", transition:"opacity 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              📅 Add to Google Calendar
            </button>
            <button
              onClick={downloadIcs}
              style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                padding:"11px 20px", borderRadius:"12px",
                background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
                color:C.white, fontFamily:"DM Sans,sans-serif", fontSize:"14px",
                fontWeight:500, cursor:"pointer", transition:"background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}
            >
              Apple / Outlook
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  const inputStyle = {
    width:"100%", padding:"14px 18px", borderRadius:"12px",
    border:`1px solid rgba(30,128,194,0.3)`,
    background:"rgba(255,255,255,0.05)", color:C.white,
    fontFamily:"DM Sans,sans-serif", fontSize:"14px", outline:"none",
    transition:"border-color 0.2s",
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Full Name *</label>
          <input style={inputStyle} placeholder="Your name"
            value={form.name} onChange={e=>set("name",e.target.value)} required
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor="rgba(30,128,194,0.3)"}/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Email *</label>
          <input type="email" style={inputStyle} placeholder="you@example.com"
            value={form.email} onChange={e=>set("email",e.target.value)} required
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor="rgba(30,128,194,0.3)"}/>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Phone</label>
          <input style={inputStyle} placeholder="+91 98765 43210"
            value={form.phone} onChange={e=>set("phone",e.target.value)}
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor="rgba(30,128,194,0.3)"}/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Preferred Date</label>
          <DatePicker value={form.date} onChange={v => { set("date", v); set("time", ""); }} />
        </div>
      </div>

      {form.date && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>
            Available Times {slotsLoading && <span style={{color:"rgba(255,255,255,0.3)", fontSize:"11px"}}>(refreshing…)</span>}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TRIAL_SLOTS.map(t => {
              const remaining = slots[t];
              const full = remaining === 0;
              const selected = form.time === t;
              return (
                <button key={t} type="button" disabled={full}
                  onClick={() => set("time", t)}
                  style={{
                    padding:"10px 6px", borderRadius:"10px", textAlign:"center", cursor: full ? "not-allowed" : "pointer",
                    border:`1px solid ${selected ? C.gold : full ? "rgba(255,255,255,0.08)" : "rgba(30,128,194,0.3)"}`,
                    background: selected ? "rgba(212,175,55,0.12)" : full ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                    color: selected ? C.gold : full ? "rgba(255,255,255,0.25)" : C.white,
                    fontFamily:"DM Sans,sans-serif", transition:"border-color 0.2s, background 0.2s",
                  }}>
                  <div style={{fontSize:"13px", fontWeight:600}}>{t}</div>
                  <div style={{fontSize:"10px", marginTop:"2px", color: full ? "rgba(255,255,255,0.25)" : selected ? "rgba(212,175,55,0.7)" : "rgba(255,255,255,0.4)"}}>
                    {remaining === undefined ? "…" : full ? "Full" : `${remaining} spot${remaining===1?"":"s"} left`}
                  </div>
                </button>
              );
            })}
          </div>
          {Object.keys(slots).length === 0 && !slotsLoading && (
            <p className="text-xs mt-2" style={{color:"rgba(255,255,255,0.4)"}}>Studio is closed on this date — please pick another day.</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Any notes?</label>
        <textarea style={{...inputStyle, resize:"none"}} rows={3}
          placeholder="Experience level, injuries, questions..."
          value={form.message} onChange={e=>set("message",e.target.value)}
          onFocus={e=>e.target.style.borderColor=C.gold}
          onBlur={e=>e.target.style.borderColor="rgba(30,128,194,0.3)"}/>
      </div>
      {bookError && (
        <p className="text-center text-sm" style={{color:"#f08080"}}>{bookError}</p>
      )}
      <button type="submit" disabled={loading || !form.date || !form.time}
        className="w-full flex items-center justify-center gap-2 font-body font-semibold py-4 rounded-2xl transition-all duration-300"
        style={{background:C.gold, color:C.black, fontSize:"15px",
          opacity: (!form.date || !form.time) ? 0.5 : 1,
          boxShadow: loading ? "none" : "0 8px 30px rgba(30,128,194,0.4)"}}>
        {loading ? (
          <span className="flex gap-2">
            {[0,1,2].map(i=>(
              <motion.span key={i} className="w-2 h-2 rounded-full" style={{background:C.black}}
                animate={{opacity:[0.3,1,0.3]}} transition={{duration:0.8,repeat:Infinity,delay:i*0.2}}/>
            ))}
          </span>
        ) : (<>Book Trial Session — ₹1,000 <ArrowRight size={18}/></>)}
      </button>
      <p className="text-center text-xs" style={{color:"rgba(255,255,255,0.4)"}}>
        {!form.date ? "Select a date and time to continue. " : !form.time ? "Select a time slot to continue. " : ""}
        ₹1,000 paid at the studio. No online payment required.
      </p>
    </form>
  );
}

// ─── DATA ─────────────────────────────────────────────────────
const allTestimonials = [
  { name:"Anum Nawab",          role:"Local Guide · Google Review",  stars:5,
    text:"Great experience. Love this place. Been going since a month now and really loving the experience. The instructor is super friendly and nice." },
  { name:"Vandana Jain",        role:"Google Review",                stars:5,
    text:"Absolutely love this Pilates class! The sessions are well-structured and suitable for all levels. The instructor is very attentive, motivating, and ensures correct form throughout. I've noticed great improvement in my strength and flexibility. Highly recommend to anyone looking for a positive and effective workout experience." },
  { name:"Alefiya Lohawala",    role:"Local Guide · Google Review",  stars:5,
    text:"I absolutely love this Pilates class! The instructor is knowledgeable, encouraging, and ensures we maintain proper form. The sessions are a perfect balance of challenging and relaxing, leaving me feeling stronger, more flexible, and energized. Special mention for Ms Diya — my instructor." },
  { name:"Vijay Pal",           role:"Google Review",                stars:5,
    text:"Living in the NIBM/Salunke Vihar area, I had no idea such a gem was so close by. The studio is beautifully maintained, the ambiance is calm and inviting, and the instructors are top-notch. It's now my happy place." },
  { name:"Sakshi Bora",         role:"Google Review",                stars:5,
    text:"Had a wonderful experience at Vigour Pilates studio! The classes are very well guided & the instructor is very supportive and motivating. Looking forward to continuing more classes here!" },
  { name:"Sarah Nawab",         role:"Google Review",                stars:5,
    text:"I've been doing Pilates here and the experience has been amazing! The sessions are well-structured, the environment is welcoming, and the instructor is extremely supportive and knowledgeable. I've noticed great improvements in my strength, flexibility, and overall fitness in a short time." },
  { name:"Khadija Mohammed",    role:"Google Review",                stars:5,
    text:"I've had an excellent experience at this Pilates studio, and I'm especially grateful for the training and guidance provided by Ms. Diya. She is highly knowledgeable, attentive, and ensures that every movement is done with the correct form. I've noticed significant improvements in my strength, posture, and overall body conditioning." },
  { name:"Medha Mehrotra",      role:"Local Guide · Google Review",  stars:5,
    text:"I have had 5 sessions here till now and felt so amazing after all 5 of them. Trainers are welcoming and provide proper guidance — workouts are challenging yet rewarding!" },
  { name:"Tehreem Tamboli",     role:"Google Review",                stars:5,
    text:"Amazing experience. Trainees are wonderful." },
  { name:"Muskan Shaikh",       role:"Google Review",                stars:5,
    text:"It was a positive experience for me. I felt good both during and after the session. I could actually feel my core and other muscles working, especially in exercises where form really matters, and that made the workout feel effective without being too exhausting. I'm definitely looking forward to attending more sessions!" },
  { name:"Snehal Mendhe",       role:"Local Guide · Google Review",  stars:5,
    text:"I have been doing Pilates here since 2 months and my experience has been amazing. All the trainers are knowledgeable and I have seen significant improvement in my physique." },
  { name:"Try Peace",           role:"Google Review",                stars:5,
    text:"The website has a clean and polished look that immediately feels trustworthy and welcoming. The conversational design makes the messaging feel natural and easy to follow, helping visitors quickly understand what the studio offers." },
  { name:"Tanishka Murthy",     role:"Local Guide · Google Review",  stars:5,
    text:"I loved the studio. A really clean space with enough room to move around without being in people's way." },
  { name:"Vinaykumar Poduval",  role:"Google Review",                stars:5,
    text:"It has a good ambience with the latest trend in physical & mental fitness & proper guidance from a professional trainer." },
  { name:"Bindu Poduval",       role:"Google Review",                stars:5,
    text:"It's a place full of positive vibes and great interiors with modern equipments. The trainers are super enthusiastic and professional. Great place with great people. Keep up the good work!" },
  { name:"Jyoti Murthy",        role:"Google Review",                stars:5,
    text:"This Pilates studio has instructors who are knowledgeable, patient, and really focus on proper form. The atmosphere is calm and welcoming, making every session enjoyable. I highly recommend for anyone looking to improve their strength and overall well-being." },
  { name:"Shomit Ganguly",      role:"Local Guide · Google Review",  stars:5,
    text:"Excellent Pilates Studio in NIBM. The space is clean, modern, and welcoming — I've seen both beginners and advanced practitioners. The instructors are highly qualified and focus on proper form, strength, and flexibility. Highly recommend." },
  { name:"Aishwarya Poduval",   role:"Google Review",                stars:5,
    text:"Absolutely love my experience at Vigour Pilates Studio! From day one, the level of personal attention has been amazing — every session feels tailored and intentional. Pilates has completely changed my perspective on fitness; it's incredible." },
  { name:"Sarika Babar",        role:"Google Review",                stars:5,
    text:"It was my first experience of Pilates at Vigour Studio. I have sciatica and I was hesitant initially, but the trainer Diya made me comfortable and informed that Pilates will only improve my condition. And indeed Pilates is the fastest and easiest way to build core strength." },
];

function TestimonialCard({ t, C }) {
  return (
    <div className="flex-shrink-0 w-80 p-7 rounded-3xl border"
      style={{background:"rgba(255,255,255,0.04)", borderColor:"rgba(30,128,194,0.15)"}}>
      <div className="flex gap-1 mb-4">
        {Array(t.stars).fill(0).map((_,j)=>(
          <Star key={j} size={13} style={{fill:C.gold, color:C.gold}}/>
        ))}
      </div>
      <p className="font-accent italic text-base leading-relaxed mb-6"
        style={{color:"rgba(255,255,255,0.78)"}}>"{t.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t" style={{borderColor:"rgba(30,128,194,0.12)"}}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-xs flex-shrink-0"
          style={{background:C.gold, color:C.black}}>{t.name[0]}</div>
        <div>
          <p className="font-body font-semibold text-sm" style={{color:"rgba(255,255,255,0.9)"}}>{t.name}</p>
          <p className="font-body text-xs" style={{color:"rgba(255,255,255,0.35)"}}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}


const plans = [
  { name:"Experience",
    price:"₹1,999",  sub:"3 sessions",  perClass:"₹666 per session",  amount:1999,
    features:["All apparatus","Guided by trainer","Beginner friendly","Try before you commit"],
    highlight:false, badge:"Try First" },
  { name:"Starter",
    price:"₹7,000",  sub:"8 sessions",  perClass:"₹875 per session",  amount:7000,
    features:["All apparatus","Guided by trainer","Flexible scheduling","Valid for 30 days"],
    highlight:false },
  { name:"Standard",
    price:"₹10,000", sub:"12 sessions", perClass:"₹833 per session",  amount:10000,
    features:["All apparatus","Guided by trainer","Flexible scheduling","Valid for 30 days"],
    highlight:false },
  { name:"Best Value",
    price:"₹16,000", sub:"22 sessions", perClass:"₹727 per session",  amount:16000,
    features:["All apparatus","Guided by trainer","Flexible scheduling","Valid for 45 days"],
    highlight:true,
    badge:"Most Popular", social:"Most chosen by our members" },
  { name:"Elite",
    price:"₹22,000", sub:"32 sessions", perClass:"₹688 per session",  amount:22000,
    features:[
      "Personalised progress tracking",
      "Nutrition guidance & support",
      "Priority booking & flexibility",
      "Direct trainer access",
      "Bonus session benefits",
    ],
    highlight:false, isElite:true },
  { name:"Family Takeover",
    price:"₹599",    sub:"per person · max 8", perClass:"Weekend group session", amount:599,
    features:["Exclusive studio access","Up to 8 people","Dedicated instructor","Perfect for families & friends","Weekend slots only"],
    highlight:false, badge:"Weekend Special", isGroup:true },
];

const faqs = [
  { q:"Do I need prior Pilates experience?",
    a:"Not at all — 70% of our members joined with zero experience. Every session is personally guided. Our instructors adapt the workout to exactly where you are, and you'll feel the difference from class one." },
  { q:"What should I bring to a session?",
    a:"Just yourself and comfortable workout attire. Grip socks are available to borrow. That's genuinely it — 200+ members started exactly the same way." },
  { q:"How does the trial session work?",
    a:"Book below, pay ₹1,000 at the studio. You'll experience a full 60-minute class with a senior instructor, plus a personalised feedback note after. Over 80% of trial students convert to memberships — we think you'll understand why." },
  { q:"Can I freeze my membership?",
    a:"Yes — up to 60 days per year with 3 days' notice. We believe life happens and your membership should flex with you. Our members consistently rate our flexibility as their #1 reason for staying." },
  { q:"How small are the classes?",
    a:"We keep our classes intentionally small — recommended by physiotherapy clinics across Pune specifically because of this. Instructors know your name, your history, and your form." },
];

const instructors = [
  { name:"Diya Nambiar",  spec:"Reformer & Rehabilitation", photo:"/gallery/diya.jpeg",  years:"8 yrs experience", cert:"STOTT Pilates Certified" },
  { name:"Manisha Kakde", spec:"Mat Pilates & Barre",       photo:"/gallery/manisha.jpeg", years:"6 yrs experience", cert:"Peak Pilates Certified" },
  { name:"Rohit Shinde",  spec:"Power Pilates & Strength",  photo:"/gallery/rohit.jpeg",  years:"5 yrs experience", cert:"BASI Certified" },
];

// ─── Gallery items ────────────────────────────────────────────
// Add your own photos/videos to /public/gallery/
// Supported: .jpg .png .webp .mp4 .mov
// type: "image" or "video"
const galleryItems = [
  { type:"image", src:"/gallery/1.jpeg", caption:"200+ Pune members transformed here",          tag:"Vigour Pilates Studio",  body:"Real people, real results. Every member who walks through our doors leaves a little stronger, a little taller, and a lot more confident." },
  { type:"video", src:"/gallery/1.mp4",  caption:"This could be your session next week",        tag:"Reformer · Vigour Pilates", body:"Your first session is just one click away. Book a trial for ₹1,000 and experience what intentional movement feels like." },
  { type:"image", src:"/gallery/2.jpeg", caption:"The body you want is closer than you think",  tag:"Vigour Pilates, Pune",   body:"Consistency is the only secret. Show up, move well, and your body will follow. Our instructors make sure every session counts." },
  { type:"video", src:"/gallery/2.mp4",  caption:"What our members feel every morning",         tag:"At Vigour, Pune",        body:"Energy, clarity, and a body that moves without pain. That's what Vigour members wake up to — and it starts from session one." },
  { type:"image", src:"/gallery/3.jpeg", caption:"Posture that changes how the world sees you", tag:"Mobility & Posture",     body:"The way you carry yourself speaks before you do. Pilates rebuilds the foundations — spine, core, alignment — so you stand differently." },
  { type:"image", src:"/gallery/4.jpeg", caption:"Your transformation begins with one session", tag:"Book a Trial — ₹1,000",  body:"One hour. One decision. That's all it takes to start. Book your trial session today and see exactly what Vigour can do for your body." },
];

// ─── Gallery Section ──────────────────────────────────────────
// ─── Individual 3D tilt card ─────────────────────────────────
// ─── GSAP Gallery Section ─────────────────────────────────────
// ─── GSAP Gallery — pin: true handles scroll space ───────────
function GallerySection({ galleryItems, C }) {
  const containerRef = useRef(null);
  const textRefs     = useRef([]);
  const cardRefs     = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const n = galleryItems.length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state: only slide 0 visible
      gsap.set(textRefs.current.slice(1), { opacity: 0, y: 60 });
      gsap.set(cardRefs.current.slice(1), {
        opacity: 0, rotationY: 24, scale: 0.86, transformPerspective: 1100,
      });
      gsap.set(cardRefs.current[0], {
        opacity: 1, rotationY: 0, scale: 1, transformPerspective: 1100,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${(n - 1) * window.innerHeight}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate(self) {
            setActiveIdx(Math.min(Math.floor(self.progress * n), n - 1));
          },
        },
      });

      for (let i = 0; i < n - 1; i++) {
        const step = i * 2;
        tl
          .to(textRefs.current[i],     { opacity: 0, y: -60, duration: 1, ease: "power2.in" },  step)
          .to(cardRefs.current[i],     { opacity: 0, rotationY: -24, scale: 0.86, duration: 1, ease: "power2.in" }, step)
          .to(textRefs.current[i + 1], { opacity: 1, y: 0,   duration: 1, ease: "power2.out" }, step + 1)
          .to(cardRefs.current[i + 1], { opacity: 1, rotationY: 0, scale: 1, duration: 1, ease: "power2.out" }, step + 0.7);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [n]);

  return (
    <section ref={containerRef} style={{ background: "#0d0d0d" }}>
      {/* 100vh inner — GSAP pins this whole section, no CSS sticky needed */}
      <div style={{
        height: "100vh", display: "flex", alignItems: "stretch", overflow: "hidden",
      }}>

        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 68% 50%, rgba(30,128,194,0.055) 0%, transparent 58%)",
        }}/>

        {/* ── LEFT: text ──────────────────────────────── */}
        <div style={{
          width: "42%", position: "relative", overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}>
          {/* Ghost number */}
          <div style={{
            position: "absolute", top: "50%", left: "clamp(16px,3vw,48px)",
            transform: "translateY(-55%)", pointerEvents: "none", userSelect: "none",
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: "clamp(90px,14vw,160px)", fontWeight: 700,
            color: "rgba(255,255,255,0.022)", lineHeight: 1,
          }}>
            {String(activeIdx + 1).padStart(2, "0")}
          </div>

          {/* Counter + progress bar */}
          <div style={{
            position: "absolute", top: "clamp(24px,4vh,48px)",
            left: "clamp(24px,5vw,72px)",
            display: "flex", alignItems: "center", gap: 10, zIndex: 2,
          }}>
            <span style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: 11,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
            }}>
              {String(activeIdx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <div style={{ width: 52, height: 1, background: "rgba(255,255,255,0.08)", borderRadius: 1, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 1, background: C.gold,
                width: `${((activeIdx + 1) / n) * 100}%`,
                transition: "width 0.5s ease",
              }}/>
            </div>
          </div>

          {/* GSAP-animated text panels — all stacked absolutely */}
          {galleryItems.map((item, i) => (
            <div
              key={i}
              ref={el => { textRefs.current[i] = el; }}
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "0 clamp(24px,5vw,72px)",
              }}
            >
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(9px,1vw,11px)",
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: C.gold, marginBottom: 14,
              }}>{item.tag}</p>
              <h2 style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 600,
                fontSize: "clamp(1.5rem,3vw,2.8rem)", color: "#fff",
                lineHeight: 1.18, marginBottom: 20,
              }}>{item.caption}</h2>
              <div style={{ width: 36, height: 2, background: C.gold, borderRadius: 2, marginBottom: 18 }}/>
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(13px,1.1vw,15px)",
                color: "rgba(255,255,255,0.35)", lineHeight: 1.72, maxWidth: 300,
              }}>
                {item.body}
              </p>
            </div>
          ))}

          {/* Progress pills */}
          <div style={{
            position: "absolute", bottom: "clamp(24px,4vh,48px)",
            left: "clamp(24px,5vw,72px)",
            display: "flex", gap: 6, zIndex: 2,
          }}>
            {galleryItems.map((_, di) => (
              <div key={di} style={{
                height: 3, borderRadius: 9999,
                width: di === activeIdx ? 28 : 10,
                background: di === activeIdx ? C.gold : "rgba(255,255,255,0.13)",
                transition: "all 0.4s ease",
              }}/>
            ))}
          </div>
        </div>

        {/* ── RIGHT: card panels ──────────────────────── */}
        <div style={{ flex: 1, position: "relative" }}>
          {galleryItems.map((item, i) => (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el; }}
              style={{
                position: "absolute",
                inset: "clamp(16px,2.5vw,40px)",
                borderRadius: 18, overflow: "hidden",
                boxShadow: "0 28px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {item.type === "video" ? (
                <video src={item.src} autoPlay muted loop playsInline style={{
                  position:"absolute", inset:"-10%", width:"120%", height:"120%",
                  objectFit:"cover", filter:"blur(22px) brightness(0.32) saturate(1.3)",
                  transform:"scale(1.05)", pointerEvents:"none",
                }}/>
              ) : (
                <img src={item.src} alt="" style={{
                  position:"absolute", inset:"-10%", width:"120%", height:"120%",
                  objectFit:"cover", filter:"blur(22px) brightness(0.32) saturate(1.3)",
                  transform:"scale(1.05)", pointerEvents:"none",
                }}/>
              )}
              {item.type === "video" ? (
                <video src={item.src} autoPlay muted loop playsInline style={{
                  position:"absolute", inset:0, width:"100%", height:"100%",
                  objectFit:"contain", objectPosition:"center",
                }}/>
              ) : (
                <img src={item.src} alt={item.caption} style={{
                  position:"absolute", inset:0, width:"100%", height:"100%",
                  objectFit:"contain", objectPosition:"center",
                }}/>
              )}
              <div style={{
                position:"absolute", inset:0, pointerEvents:"none",
                background:"radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.28) 100%)",
              }}/>
              <div style={{
                position:"absolute", top:0, left:0, right:0, height:1,
                background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)",
              }}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef(null);
  const machineRef   = useRef(null);
  const [navOpen, setNavOpen]         = useState(false);
  const [openFaq, setOpenFaq]         = useState(null);
  const [liveTestimonials, setLiveTestimonials] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  // Realistic random social proof numbers — stable per session, random per visit
  const socialProof = useState(() => ({
    trialsThisMonth: Math.floor(Math.random() * 40) + 90,   // 90–130
    spotsLeft:       Math.floor(Math.random() * 5)  + 4,    // 4–8
  }))[0];

  // Real-time testimonials from Firestore (published only)
  useEffect(() => {
    const q = query(
      collection(db, "testimonials"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({
        name:  d.data().userName || "Member",
        role:  d.data().className || "Vigour Member",
        stars: d.data().rating   || 5,
        text:  d.data().reviewText,
      }));
      setLiveTestimonials(docs.length > 0 ? docs : null);
    }, () => setLiveTestimonials(null)); // fallback on error
    return () => unsub();
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const { scrollY }         = useScroll();
  const { scrollYProgress: machineScroll } = useScroll({
    target: machineRef,
    offset: ["start end","end start"],
  });

  const smoothMachine = useSpring(machineScroll, { stiffness:40, damping:18 });

  const heroY       = useTransform(scrollYProgress, [0,0.15], [0,-60]);
  const heroOpacity = useTransform(scrollYProgress, [0,0.18], [1,0]);

  // ── Nav scroll-morph ──────────────────────────────────────────
  // Softer, wider-travel spring so the shrink reads as smooth, not a snap.
  const NAV_SP = { stiffness: 170, damping: 32, mass: 0.9 };

  // Always a full capsule — SVG/CSS radius auto-clamps to half the bar's
  // height, so a large constant stays pill-shaped at any width.
  const NAV_RADIUS = 999;

  const _navMaxW = useTransform(scrollY, [0, 200], [1600, 1040]);
  const _navMT   = useTransform(scrollY, [0, 200], [0, 14]);
  const _navPX   = useTransform(scrollY, [0, 200], [24, 20]);

  const navMaxW = useSpring(_navMaxW, NAV_SP);
  const navMT   = useSpring(_navMT,   NAV_SP);
  const navPX   = useSpring(_navPX,   NAV_SP);

  // ── Nav light-section tint ──────────────────────────────────────
  // The pill picks up a light wash (and darkens its text) whenever a
  // cream/white section is scrolling underneath it, so it stays readable
  // instead of turning into near-invisible white-on-white glass.
  const classesRef  = useRef(null);
  const locationRef = useRef(null);
  const NAV_BAND = 90; // px from viewport top counted as "under the pill"

  const [onLight, setOnLight] = useState(false);
  const tintTarget = useMotionValue(0);
  const navTint    = useSpring(tintTarget, { stiffness: 120, damping: 24, mass: 1 });

  useMotionValueEvent(scrollY, "change", () => {
    const hits = [classesRef, locationRef].some(ref => {
      const r = ref.current?.getBoundingClientRect();
      return r && r.top < NAV_BAND && r.bottom > 0;
    });
    tintTarget.set(hits ? 1 : 0);
    setOnLight(prev => (prev === hits ? prev : hits));
  });

  const navOverlay    = useTransform(navTint, [0, 1], ["rgba(255,255,255,0)", "rgba(255,255,255,0.82)"]);
  const navFg         = useTransform(navTint, [0, 1], ["rgba(255,255,255,0.92)", "rgba(13,30,48,0.9)"]);
  const navLink       = useTransform(navTint, [0, 1], ["rgba(255,255,255,0.6)", "rgba(13,30,48,0.55)"]);
  const navLinkHover  = useTransform(navTint, [0, 1], ["rgba(255,255,255,1)", "rgba(13,30,48,0.92)"]);
  const navQuiz       = useTransform(navTint, [0, 1], ["rgba(255,255,255,0.9)", "rgba(13,30,48,0.85)"]);
  const navDivider    = useTransform(navTint, [0, 1], ["rgba(255,255,255,0.2)", "rgba(13,30,48,0.15)"]);
  const navCtaBg      = useTransform(navTint, [0, 1], ["rgba(255,255,255,0.15)", "rgba(13,30,48,0.08)"]);
  const navCtaBorder  = useTransform(navTint, [0, 1], ["rgba(255,255,255,0.3)", "rgba(13,30,48,0.18)"]);
  const navCtaText    = useTransform(navTint, [0, 1], ["#ffffff", "#0d1e30"]);
  const navIcon       = useTransform(navTint, [0, 1], ["rgba(255,255,255,0.85)", "rgba(13,30,48,0.8)"]);

  return (
    <div ref={containerRef} className="font-body"
      style={{ background:C.cream, color:C.black, overflowX:"clip" }}>

      {/* ── NAV ─────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none px-3 sm:px-4">
        <motion.div
          className="pointer-events-auto w-full"
          style={{
            maxWidth: navMaxW, marginTop: navMT, borderRadius: NAV_RADIUS, overflow: "hidden",
            "--nav-fg": navFg, "--nav-link": navLink, "--nav-link-hover": navLinkHover,
            "--nav-quiz": navQuiz, "--nav-divider": navDivider,
            "--nav-cta-bg": navCtaBg, "--nav-cta-border": navCtaBorder, "--nav-cta-text": navCtaText,
            "--nav-icon": navIcon,
          }}
        >
          <style>{`
            .vg-nav-link { color: var(--nav-link); transition: color 160ms ease; }
            .vg-nav-link:hover { color: var(--nav-link-hover); }
            .vg-nav-quiz:hover { opacity: 0.65; }
          `}</style>
          <GlassSurface
            width="100%" height="100%"
            borderRadius={NAV_RADIUS}
            backgroundOpacity={0.12}
            saturation={1.6}
            brightness={55}
            opacity={0.88}
            blur={onLight ? 10 : 14}
            distortionScale={onLight ? -70 : -160}
          >
            <motion.div className="absolute inset-0 pointer-events-none rounded-[inherit]" style={{ background: navOverlay }} />

            <motion.div
              className="relative z-10 w-full flex items-center justify-between"
              style={{ paddingTop: "10px", paddingBottom: "10px", paddingLeft: navPX, paddingRight: navPX }}
            >
              {/* Logo */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <img src="/logop.png" alt="Vigour Pilates Studio" style={{ height:"34px", width:"auto", objectFit:"contain" }}/>
                <motion.span style={{ pointerEvents: "none" }}
                  className="hidden sm:block"
                  transition={{ duration: 0 }}>
                  <motion.span style={{ fontFamily:"'Playfair Display', serif", fontSize:"14px", fontWeight:600, letterSpacing:"0.02em", color:"var(--nav-fg)", whiteSpace:"nowrap" }}>
                    Vigour Pilates Studio
                  </motion.span>
                </motion.span>
              </div>

              {/* Desktop links */}
              <motion.div
                className="hidden md:flex items-center gap-5"
              >
                {["classes","pricing","testimonials","faq"].map(l=>(
                  <a key={l} href={`#${l}`}
                    className="vg-nav-link font-body text-sm capitalize">{l}</a>
                ))}
                <motion.div style={{ width:"1px", height:"14px", background:"var(--nav-divider)" }}/>
                <a href="#quiz" className="vg-nav-quiz font-body text-sm transition-opacity" style={{ color:"var(--nav-quiz)", fontWeight:600 }}>Quiz</a>
                <a href="/compare" className="vg-nav-link font-body text-sm">Compare</a>
                <a href="/terms" className="vg-nav-link font-body text-sm">Terms</a>
              </motion.div>

              {/* Right side: CTA + mobile hamburger */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.a href="#trial"
                  className="font-body font-semibold rounded-full transition-all flex-shrink-0"
                  style={{ background:"var(--nav-cta-bg)", color:"var(--nav-cta-text)",
                    border:"1px solid var(--nav-cta-border)",
                    backdropFilter:"blur(8px)",
                    padding:"8px 16px", fontSize:"12.5px", lineHeight:1, whiteSpace:"nowrap" }}>
                  <span className="hidden sm:inline">Book Your Trial</span>
                  <span className="sm:hidden">Book Trial</span>
                </motion.a>

                <motion.button
                  onClick={()=>setNavOpen(!navOpen)}
                  className="md:hidden p-2 rounded-xl"
                  style={{ color:"var(--nav-icon)" }}>
                  {navOpen ? <X size={19}/> : <Menu size={19}/>}
                </motion.button>
              </div>
            </motion.div>
          </GlassSurface>
        </motion.div>
      </div>

      {/* Mobile drawer */}
      {navOpen && (
        <motion.div
          initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
          transition={{ duration:0.22, ease:"easeOut" }}
          className="fixed inset-x-3 z-40 rounded-2xl overflow-hidden"
          style={{ top:"72px", background:"rgba(10,30,50,0.96)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.1)" }}>
          <div className="px-5 py-4 space-y-1">
            {["classes","pricing","testimonials","faq"].map(l=>(
              <a key={l} href={`#${l}`} onClick={()=>setNavOpen(false)}
                className="block font-body py-3 capitalize border-b text-sm"
                style={{ color:"rgba(255,255,255,0.75)", borderColor:"rgba(255,255,255,0.07)" }}>{l}</a>
            ))}
            <a href="/compare" onClick={()=>setNavOpen(false)}
              className="block font-body py-3 border-b text-sm"
              style={{ color:"rgba(255,255,255,0.75)", borderColor:"rgba(255,255,255,0.07)" }}>Compare</a>
            <a href="/terms" onClick={()=>setNavOpen(false)}
              className="block font-body py-3 border-b text-sm"
              style={{ color:"rgba(255,255,255,0.75)", borderColor:"rgba(255,255,255,0.07)" }}>Terms</a>
            <a href="#quiz" onClick={()=>setNavOpen(false)}
              className="block font-body py-3 text-center rounded-xl text-sm font-medium mt-1"
              style={{ color:"#fff", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)" }}>Take the Quiz</a>
            <a href="#trial" onClick={()=>setNavOpen(false)}
              className="block font-body py-3 text-center rounded-xl text-sm font-semibold"
              style={{ background:C.forest, color:C.ivory }}>Book Trial — ₹1,000</a>
          </div>
        </motion.div>
      )}

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20"
        style={{ background: C.black, overflow:"clip" }}>

        {/* Iridescence background */}
        <div className="absolute inset-0" style={{ pointerEvents:"none" }}>
          <Iridescence color={[0.12, 0.32, 0.56]} mouseReact amplitude={0.12} speed={0.8} />
        </div>

        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"rgba(0,0,0,0.45)" }}/>

        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg, transparent, ${C.gold}, transparent)`}}/>

        {/* Scattered dots */}
        {[[10,20],[85,15],[15,70],[88,65],[50,88]].map(([x,y],i)=>(
          <div key={i} className="absolute w-1 h-1 rounded-full opacity-40"
            style={{left:`${x}%`, top:`${y}%`, background:C.gold}}/>
        ))}

        <motion.div style={{y:heroY, opacity:heroOpacity}}
          className="relative z-10 w-full flex flex-col items-center text-center">

          {/* Badge */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8}}
            className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full mb-6 border"
            style={{borderColor:`rgba(30,128,194,0.4)`, background:`rgba(30,128,194,0.08)`}}>
            <span className="font-body text-sm" style={{color:C.gold}}>⭐ 4.9/5</span>
            <span className="hidden sm:inline" style={{width:"1px", height:"14px", background:"rgba(30,128,194,0.3)"}}/>
            <span className="hidden sm:inline font-body text-sm" style={{color:C.gold}}>Pune's most-loved Pilates studio</span>
            <span style={{width:"1px", height:"14px", background:"rgba(30,128,194,0.3)", display:"inline-block"}}/>
            <span className="font-body text-sm" style={{color:"rgba(30,128,194,0.7)"}}>200+ members</span>
          </motion.div>

          {/* TextPressure — full viewport width */}
          <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:1, delay:0.1}}
            style={{position:"relative", height:"clamp(100px,16vw,220px)", width:"100%", padding:"0 2vw 20px", marginBottom:"1rem"}}>
            <TextPressure
              text="Move with intention."
              flex
              alpha={false}
              stroke={false}
              width
              weight
              italic
              textColor="#ffffff"
              strokeColor={C.gold}
              minFontSize={28}
            />
          </motion.div>

          {/* Quote */}
          <motion.p initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.9, delay:0.25}}
            className="font-accent italic text-xl md:text-2xl mb-10 max-w-2xl leading-relaxed px-6"
            style={{color:"rgba(255,255,255,0.55)"}}>
            "Your body can stand almost anything.<br className="hidden sm:block"/>
            It's your mind you have to convince."
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8, delay:0.4}}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
            <a href="#trial"
              className="flex items-center gap-2 font-body font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
              style={{background:C.gold, color:C.black, boxShadow:`0 12px 40px rgba(30,128,194,0.4)`, fontSize:"15px"}}>
              Book Trial Session <ArrowRight size={18}/>
            </a>
            <a href="#quiz"
              className="flex items-center gap-2 font-body px-8 py-4 rounded-2xl border transition-all duration-300"
              style={{borderColor:"rgba(255,255,255,0.2)", color:C.white, fontSize:"15px"}}>
              Find My Class
            </a>
          </motion.div>

          {/* Social proof pills */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-5 px-6">
            <span className="font-body text-xs flex items-center gap-1.5" style={{color:"rgba(255,255,255,0.35)"}}>
              <span style={{color:C.lime, fontSize:"10px"}}>●</span> {socialProof.trialsThisMonth} trials booked this month
            </span>
            <span className="hidden sm:inline" style={{color:"rgba(255,255,255,0.15)"}}>·</span>
            <span className="font-body text-xs flex items-center gap-1.5" style={{color:"rgba(255,255,255,0.35)"}}>
              <span style={{color:"#e87a4a", fontSize:"10px"}}>●</span> Only {socialProof.spotsLeft} trial spots left this week
            </span>
            <span className="hidden sm:inline" style={{color:"rgba(255,255,255,0.15)"}}>·</span>
            <span className="font-body text-xs" style={{color:"rgba(255,255,255,0.35)"}}>No commitment required</span>
          </motion.div>

          {/* Stats bar */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.65}}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-10 pt-8 border-t w-full px-6 max-w-2xl"
            style={{borderColor:"rgba(255,255,255,0.1)"}}>
            {[["200+","Members"],["4","Expert trainers"],["4.9★","Rating"]].map(([v,l])=>(
              <div key={l} className="text-center">
                <p className="font-display text-3xl font-semibold" style={{color:C.gold}}>{v}</p>
                <p className="font-body text-xs mt-1 tracking-wider uppercase" style={{color:"rgba(255,255,255,0.4)"}}>{l}</p>
              </div>
            ))}
          </motion.div>

          <motion.div className="mt-8" animate={{y:[0,8,0]}} transition={{duration:2,repeat:Infinity}}>
            <ChevronDown size={28} className="mx-auto" style={{color:"rgba(30,128,194,0.5)"}}/>
          </motion.div>
        </motion.div>
      </section>

      {/* ── GALLERY SCROLL ───────────────────────── */}
      <GallerySection galleryItems={galleryItems} C={C} />

      {/* ── PHILOSOPHY ───────────────────────── */}
      <section style={{background:C.black, padding:"100px 24px", position:"relative", overflow:"hidden"}}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background:"radial-gradient(ellipse 60% 60% at 50% 50%, rgba(26,61,107,0.15) 0%, transparent 70%)"
        }}/>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} transition={{duration:1}}
          style={{maxWidth:"860px", margin:"0 auto", textAlign:"center", position:"relative", zIndex:1}}>
          <div style={{
            width:"40px", height:"1px", background:C.gold, margin:"0 auto 40px",
            opacity:0.7
          }}/>
          <p style={{
            fontFamily:"'Cormorant Garamond', Georgia, serif",
            fontSize:"clamp(1.6rem,4.5vw,3.8rem)",
            fontStyle:"italic", fontWeight:400,
            color:C.white, lineHeight:1.35,
            letterSpacing:"-0.01em", marginBottom:"40px"
          }}>
            "Your body can stand almost anything. It's your mind you have to convince."
          </p>
        </motion.div>
      </section>

            {/* ── GOALS ──────────────────────────────── */}
      <section id="classes" ref={classesRef} className="py-28 px-6" style={{background:C.cream}}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="font-body text-xs tracking-widest uppercase mb-3" style={{color:C.green, letterSpacing:"0.2em"}}>We meet you where you are</p>
              <h2 className="font-display font-semibold leading-none" style={{color:C.forest, fontSize:"clamp(3rem,7vw,5.5rem)"}}>
                What's your<br/><em style={{fontStyle:"italic", color:C.gold}}>goal?</em>
              </h2>
            </div>
            <p className="font-accent italic text-lg max-w-xs" style={{color:C.muted, paddingBottom:"8px"}}>
              Every body is different.<br/>Every session is built around yours.
            </p>
          </motion.div>

          <motion.p initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="font-body text-sm mb-12 -mt-10"
            style={{color:C.muted}}>
            Trusted by physiotherapy clinics across Pune · Recommended for post-injury recovery
          </motion.p>

          <MagicBento
            enableStars
            enableSpotlight
            enableBorderGlow
            clickEffect
            spotlightRadius={400}
            particleCount={12}
            glowColor="30, 128, 194"
            disableAnimations={false}
          />

          {/* CTA below grid */}
          <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mt-14 text-center">
            <p className="font-accent italic text-base mb-5" style={{color:C.muted}}>
              Not sure which goal fits you? Take our 2-minute quiz.
            </p>
            <a href="#quiz" className="inline-block font-body font-semibold text-sm px-8 py-3.5 rounded-2xl transition-all"
              style={{background:C.forest, color:C.ivory, border:`1px solid ${C.gold}40`,
                boxShadow:`0 4px 20px rgba(10,30,50,0.2)`}}>
              Find my perfect class →
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── INSTRUCTORS ──────────────────────────── */}
      <section style={{background:C.black, padding:"100px 24px", position:"relative", overflow:"hidden"}}>
        <div className="absolute inset-0" style={{pointerEvents:"none"}}>
          <Iridescence color={[0.12, 0.32, 0.56]} mouseReact amplitude={0.12} speed={0.8} />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{background:"rgba(0,0,0,0.55)"}}/>
        <div className="max-w-7xl mx-auto" style={{position:"relative"}}>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-14">
            <p className="font-body text-xs tracking-widest uppercase mb-3" style={{color:C.gold, letterSpacing:"0.2em"}}>The visionaries</p>
            <h2 className="font-display font-semibold leading-none mb-6" style={{color:C.white, fontSize:"clamp(3rem,7vw,5.5rem)"}}>
              Meet the<br/><em style={{fontStyle:"italic", color:C.lime}}>architects</em>
            </h2>
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border"
              style={{borderColor:"rgba(157,194,48,0.3)", background:"rgba(157,194,48,0.06)", maxWidth:"100%"}}>
              <span style={{color:C.lime, fontSize:"12px", flexShrink:0}}>✓</span>
              <span className="font-body text-xs md:text-sm" style={{color:"rgba(255,255,255,0.6)"}}>Internationally certified · Recommended by physio clinics in Pune</span>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {instructors.map((inst,i)=>(
              <motion.div key={inst.name} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.1}}
                className="group"
                style={{cursor:"default"}}>
                {/* Photo circle / placeholder */}
                <div className="relative mb-5 overflow-hidden rounded-3xl"
                  style={{aspectRatio:"3/4", background:`linear-gradient(160deg, #181818 0%, #0a0a0a 100%)`,
                    border:`1px solid rgba(30,128,194,0.1)`}}>
                  <img src={inst.photo} alt={inst.name}
                    style={{width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top",
                      opacity:0.85, transition:"transform 0.5s ease, opacity 0.3s"}}
                    onMouseEnter={e=>{e.target.style.transform="scale(1.04)"; e.target.style.opacity="1";}}
                    onMouseLeave={e=>{e.target.style.transform=""; e.target.style.opacity="0.85";}}
                    onError={e=>{
                      e.target.style.display="none";
                      e.target.parentNode.style.display="flex";
                      e.target.parentNode.style.alignItems="center";
                      e.target.parentNode.style.justifyContent="center";
                    }}
                  />
                  {/* Gold gradient bottom */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40%",
                    background:"linear-gradient(180deg,transparent,rgba(13,13,13,0.7))"}}/>
                </div>
                <h3 className="font-display font-semibold text-lg mb-1" style={{color:C.white}}>{inst.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — dual infinite marquee ── */}
      <section id="testimonials" className="py-28 overflow-hidden"
        style={{background:"#0d0d0d"}}>

        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} className="px-6 max-w-7xl mx-auto mb-14">
          <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.gold}}>Testimonials</p>
          <h2 className="font-display font-semibold leading-none mb-6" style={{color:C.white, fontSize:"clamp(3rem,7vw,5.5rem)"}}>
            Member <em style={{fontStyle:"italic", color:C.gold}}>stories</em>
          </h2>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-2">
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(i=>(
                <Star key={i} size={15} style={{fill:C.gold, color:C.gold}}/>
              ))}
              <span className="font-body text-sm ml-2" style={{color:"rgba(255,255,255,0.5)"}}>4.9 · 200+ reviews</span>
            </div>
            <span className="font-body text-xs px-3 py-1.5 rounded-full border" style={{borderColor:"rgba(157,194,48,0.3)", color:C.lime, whiteSpace:"nowrap"}}>
              ✓ Join 200+ Pune members
            </span>
          </div>
        </motion.div>

        <style>{`
          @keyframes scrollLeft  { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          @keyframes scrollRight { from { transform: translateX(-50%) } to { transform: translateX(0) } }
          .scroll-left  { animation: scrollLeft  70s linear infinite; }
          .scroll-right { animation: scrollRight 55s linear infinite; }
          @media (hover: hover) {
            .scroll-track:hover .scroll-left,
            .scroll-track:hover .scroll-right { animation-play-state: paused; }
          }
        `}</style>

        {/* Row 1 — scrolls left */}
        <div className="scroll-track relative mb-5 overflow-hidden"
          style={{WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)",
            maskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)"}}>
          <div className="scroll-left flex gap-5 w-max">
            {[...(liveTestimonials || allTestimonials), ...(liveTestimonials || allTestimonials)].map((t,i) => (
              <TestimonialCard key={`r1-${i}`} t={t} C={C}/>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="scroll-track relative overflow-hidden"
          style={{WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)",
            maskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)"}}>
          <div className="scroll-right flex gap-5 w-max">
            {[...(liveTestimonials || allTestimonials), ...(liveTestimonials || allTestimonials)].map((t,i) => (
              <TestimonialCard key={`r2-${i}`} t={t} C={C}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSFORMATION VIDEOS ────────────────── */}
      <section style={{background:"#0a0a0a", padding:"100px 24px 80px", overflow:"hidden"}}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="text-center mb-16">
            <p className="font-body text-xs tracking-widest uppercase mb-3"
              style={{color:C.green, letterSpacing:"0.2em"}}>Real sessions. Real people.</p>
            <h2 className="font-display font-semibold leading-none"
              style={{color:C.white, fontSize:"clamp(2.5rem,6vw,4.5rem)"}}>
              See it in <em style={{fontStyle:"italic", color:C.gold}}>motion</em>
            </h2>
          </motion.div>

          {/* Video grid */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", alignItems:"end"}}>
            {[
              { src:"/gallery/t1.mp4", tall:true,  label:"Reformer Flow" },
              { src:"/gallery/t2.mp4", tall:false, label:"Core & Restore" },
              { src:"/gallery/t3.mp4", tall:false, label:"Barrel Ladder" },
              { src:"/gallery/t4.mp4", tall:true,  label:"Cadillac Session" },
            ].map((v,i)=>(
              <motion.div key={i}
                initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}}
                viewport={{once:true}} transition={{delay:i*0.1, duration:0.6}}
                className="group"
                style={{
                  borderRadius:"20px", overflow:"hidden", position:"relative",
                  aspectRatio: v.tall ? "9/16" : "9/13",
                  cursor:"pointer",
                  boxShadow:"0 8px 40px rgba(0,0,0,0.5)",
                  transform: i===1 ? "translateY(32px)" : i===2 ? "translateY(20px)" : "none",
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.transform = (i===1?"translateY(32px) ":i===2?"translateY(20px) ":"") + "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.7)";
                  const vid = e.currentTarget.querySelector("video");
                  vid.muted = false;
                  vid.play();
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform = i===1?"translateY(32px)":i===2?"translateY(20px)":"";
                  e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.5)";
                  const vid = e.currentTarget.querySelector("video");
                  vid.muted = true;
                  vid.pause(); vid.currentTime = 0;
                }}>

                {/* Video */}
                <video src={v.src} muted loop playsInline
                  style={{width:"100%",height:"100%",objectFit:"cover",display:"block",
                    transition:"opacity 0.4s ease"}}/>

                {/* Gradient overlay */}
                <div style={{
                  position:"absolute", inset:0,
                  background:"linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)",
                  transition:"opacity 0.3s ease",
                }}/>

                {/* Play ring — shows on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                  style={{transition:"opacity 0.3s ease"}}>
                  <div style={{
                    width:"52px", height:"52px", borderRadius:"50%",
                    background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
                    border:"1.5px solid rgba(255,255,255,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>

          {/* Bottom caption */}
          <motion.p initial={{opacity:0}} whileInView={{opacity:1}}
            viewport={{once:true}} transition={{delay:0.5}}
            className="text-center font-accent italic text-base mt-14"
            style={{color:"rgba(255,255,255,0.3)"}}>
            Hover to play · Filmed at Vigour Pilates Studio, Pune
          </motion.p>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────── */}
      <section id="pricing" className="py-28 px-6" style={{background:"#0d0d0d", position:"relative", overflow:"hidden"}}>
        <div className="max-w-7xl mx-auto">
          <div className="absolute inset-0 pointer-events-none" style={{
            background:"radial-gradient(ellipse 60% 60% at 70% 40%, rgba(26,61,107,0.12) 0%, transparent 70%)"
          }}/>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-16">
            <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.gold}}>Membership</p>
            <h2 className="font-display text-5xl md:text-6xl font-semibold mb-4" style={{color:C.white}}>
              Invest in your body
            </h2>
            <p className="font-body text-sm" style={{color:"rgba(255,255,255,0.35)"}}>
              Start with a ₹1,000 trial — upgrade to membership when you're ready. No pressure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((p,i)=>(
              <motion.div key={p.name} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.1}} className="relative flex flex-col">

                {/* Badge above card */}
                {p.badge && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-10">
                    <span className="text-xs font-body font-semibold px-4 py-1.5 rounded-full"
                      style={
                        p.name === "Studio Takeover" ? {background:"rgba(30,128,194,0.2)", color:C.gold, border:`1px solid ${C.gold}40`} :
                        p.name === "Experience"       ? {background:"rgba(157,194,48,0.15)", color:C.lime, border:"1px solid rgba(157,194,48,0.3)"} :
                        {background:C.gold, color:C.black}
                      }>{p.badge}</span>
                  </div>
                )}
                {p.name === "Elite" && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-10">
                    <span className="font-body text-[11px] tracking-widest uppercase px-4 py-1.5 rounded-full"
                      style={{color:"#c9a46a", border:"1px solid rgba(201,164,106,0.3)", background:"rgba(14,12,8,0.9)", letterSpacing:"0.15em"}}>
                      Elite
                    </span>
                  </div>
                )}

                <BorderGlow
                  backgroundColor={p.isElite ? "#0e0c08" : p.highlight ? "#0a1828" : "#111111"}
                  borderRadius={24}
                  glowColor={p.isElite ? "190 155 90" : p.highlight ? "30 128 194" : "0 0 70"}
                  colors={p.isElite ? ['#c9a46a','#e8c98a','#a07840'] : p.highlight ? ['#1E80C2','#60b8e8','#9DC230'] : ['#444444','#1E80C2','#9DC230']}
                  glowRadius={p.isElite ? 50 : 45}
                  glowIntensity={p.isElite ? 1.1 : p.highlight ? 1.4 : 0.7}
                  edgeSensitivity={25}
                  coneSpread={30}
                  fillOpacity={p.isElite ? 0.35 : 0.4}
                  className="w-full flex-1">
                <div className="p-7 flex flex-col h-full">

                  <h3 className="font-display text-xl font-semibold mb-1"
                    style={{color: p.highlight ? C.white : "rgba(255,255,255,0.92)"}}>{p.name}</h3>
                  <p className="font-body text-sm mb-4" style={{color: p.isElite ? "rgba(201,164,106,0.5)" : p.highlight ? C.lime : "rgba(255,255,255,0.35)"}}>{p.sub}</p>

                  <div className="flex items-baseline gap-1 mb-2 pb-5 border-b"
                    style={{borderColor: p.isElite ? "rgba(201,164,106,0.12)" : p.highlight ? "rgba(30,128,194,0.2)" : C.border}}>
                    <span className="font-display text-3xl font-semibold"
                      style={{color: p.highlight ? C.gold : "rgba(255,255,255,0.88)"}}>{p.price}</span>
                  </div>

                  <p className="font-body text-xs mt-3 mb-1" style={{
                    color: p.isElite ? "rgba(201,164,106,0.38)" : p.name === "Standard" ? "rgba(255,120,80,0.7)" : p.highlight ? C.lime : "rgba(255,255,255,0.25)",
                    fontWeight: p.name === "Standard" ? 600 : 400,
                  }}>{p.perClass}</p>

                  <ul className="space-y-3 mb-6 flex-1 mt-1">
                    {p.features.map(f=>(
                      <li key={f} className="flex items-center gap-3 font-body text-sm"
                        style={{color: p.isElite ? "rgba(255,255,255,0.7)" : p.highlight ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.65)"}}>
                        <span style={{color: p.isElite ? "#c9a46a" : C.lime, flexShrink:0, fontSize:"10px", opacity: p.isElite ? 0.7 : 1}}>—</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {p.social && (
                    <p className="font-body text-xs mb-3 text-center" style={{color:C.lime}}>✓ {p.social}</p>
                  )}

                  <button
                    onClick={() => setCheckoutPlan(p)}
                    className="block w-full text-center py-3.5 rounded-2xl font-body font-semibold text-sm transition-all duration-300 mt-auto cursor-pointer"
                    style={p.isElite
                      ? {background:"transparent", color:"rgba(201,164,106,0.85)", border:"1px solid rgba(201,164,106,0.3)"}
                      : p.highlight
                      ? {background:C.gold, color:C.black, boxShadow:`0 8px 25px rgba(30,128,194,0.3)`}
                      : {background:"transparent", color:"rgba(255,255,255,0.8)", border:"1.5px solid rgba(255,255,255,0.2)"}}>
                    Get Started
                  </button>
                </div>
                </BorderGlow>
              </motion.div>
            ))}
          </div>

          {/* Decoy explanation nudge */}
          <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
            className="text-center font-body text-xs mt-8"
            style={{color:"rgba(255,255,255,0.2)"}}>
            All plans include access to all Pilates apparatus · No hidden fees · Validity: 3 months
          </motion.p>
        </div>
      </section>

      {/* ── QUIZ ─────────────────────────────────── */}
      <PilatesQuiz />

      {/* ── FAQ ──────────────────────────────────── */}
      <section id="faq" className="py-28 px-6" style={{background:"#0d0d0d"}}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-16">
            <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.gold}}>FAQ</p>
            <h2 className="font-display text-5xl md:text-6xl font-semibold" style={{color:C.white}}>
              Good questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((f,i)=>(
              <motion.div key={i} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.07}}
                className="border rounded-2xl overflow-hidden cursor-pointer transition-all"
                style={{borderColor: openFaq===i ? `rgba(30,128,194,0.4)` : "rgba(255,255,255,0.08)",
                  background: openFaq===i ? "rgba(30,128,194,0.05)" : "rgba(255,255,255,0.03)"}}
                onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                <div className="flex items-center justify-between gap-4 p-6">
                  <h3 className="font-body font-semibold text-sm md:text-base" style={{color:"rgba(255,255,255,0.9)"}}>{f.q}</h3>
                  <motion.div animate={{rotate:openFaq===i?45:0}} transition={{duration:0.2}}
                    className="text-xl flex-shrink-0 font-light" style={{color:C.gold}}>+</motion.div>
                </div>
                {openFaq===i && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="px-6 pb-6">
                    <p className="font-body text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.65)"}}>{f.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRIAL BOOKING ────────────────────────── */}
      <section id="trial" className="py-28 px-6"
        style={{background:"#0d0d0d", position:"relative", overflow:"hidden"}}>
        <div className="absolute inset-0" style={{pointerEvents:"none"}}>
          <Iridescence color={[0.12, 0.32, 0.56]} mouseReact amplitude={0.12} speed={0.8} />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{background:"rgba(0,0,0,0.6)"}}/>
        <div className="max-w-2xl mx-auto" style={{position:"relative"}}>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="text-center mb-12">
            <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.gold}}>First session</p>
            <h2 className="font-display font-semibold mb-4 leading-none" style={{color:C.white, fontSize:"clamp(3rem,7vw,5rem)"}}>
              Book your<br/><em style={{fontStyle:"italic", color:C.gold}}>trial</em>
            </h2>
            <p className="font-accent italic text-xl" style={{color:"rgba(255,255,255,0.5)"}}>
              One session. ₹1,000. Zero commitment.
            </p>
            <p className="font-body text-sm mt-2" style={{color:"rgba(255,255,255,0.3)"}}>
              Recommended by physiotherapists · 80% of trial students become members
            </p>

            {/* Info pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {[
                [Clock, "60 minutes"],
                [Users, "Small group sessions"],
                [MapPin, "Pune studio"],
              ].map(([Icon,text])=>(
                <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-body"
                  style={{borderColor:"rgba(30,128,194,0.25)", color:"rgba(255,255,255,0.6)"}}>
                  <Icon size={13} style={{color:C.gold}}/>{text}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-5">
              <span className="font-body text-xs flex items-center gap-1.5" style={{color:"rgba(255,255,255,0.4)"}}>
                <span style={{color:"#e87a4a", fontSize:"10px"}}>●</span> Only {socialProof.spotsLeft} trial spots left this week
              </span>
              <span className="hidden sm:inline" style={{color:"rgba(255,255,255,0.15)"}}>·</span>
              <span className="font-body text-xs flex items-center gap-1.5" style={{color:"rgba(255,255,255,0.4)"}}>
                <span style={{color:C.lime, fontSize:"10px"}}>●</span> {socialProof.trialsThisMonth} people booked this month
              </span>
              <span className="hidden sm:inline" style={{color:"rgba(255,255,255,0.15)"}}>·</span>
              <span className="font-body text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Free welcome kit included</span>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}}
            className="p-8 md:p-10 rounded-4xl border"
            style={{background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)",
              borderColor:"rgba(30,128,194,0.2)"}}>
            <TrialForm/>
          </motion.div>
        </div>
      </section>

      {/* ── LOCATION ─────────────────────────────── */}
      <section ref={locationRef} className="py-24 px-6" style={{background:C.cream}}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-12">
            <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.green}}>Find us</p>
            <h2 className="font-display font-semibold leading-none" style={{color:C.forest, fontSize:"clamp(2.5rem,6vw,4.5rem)"}}>
              We're in <em style={{fontStyle:"italic", color:C.green}}>Pune</em>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Map embed */}
            <motion.div className="lg:col-span-3 rounded-3xl overflow-hidden border"
              initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}}
              viewport={{once:true}} transition={{duration:0.8}}
              style={{borderColor:C.border, height:"400px", boxShadow:"0 20px 60px rgba(10,30,50,0.12)"}}>
              {/* ─────────────────────────────────────────────────────
                  TO PIN YOUR EXACT LOCATION:
                  1. Open maps.google.com and search your studio address
                  2. Click Share → Embed a map → Copy the src URL
                  3. Replace the src below with your copied URL
                  ───────────────────────────────────────────────────── */}
              <iframe
                src="https://maps.google.com/maps?q=Vigour+Pilates+Studio+Pune+Maharashtra&output=embed&z=15"
                width="100%" height="100%" style={{border:0, display:"block"}}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="Vigour Pilates Studio Location"/>
            </motion.div>

            {/* Info cards */}
            <motion.div className="lg:col-span-2 space-y-4"
              initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}}
              viewport={{once:true}} transition={{duration:0.8, delay:0.1}}>

              {/* Address */}
              <div className="p-6 rounded-2xl border" style={{background:C.white, borderColor:C.border}}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:`rgba(10,30,50,0.08)`}}>
                    <MapPin size={18} style={{color:C.green}}/>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm mb-1" style={{color:C.forest}}>Studio Address</p>
                    <p className="font-body text-sm leading-relaxed" style={{color:C.muted}}>
                      Pune, Maharashtra<br/>
                      <span className="text-xs">📍 Exact address shared on booking confirmation</span>
                    </p>
                    <a href="https://share.google/nFWKDIzAMm9hc5J24"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-body font-semibold px-4 py-2 rounded-xl transition-all"
                      style={{background:C.forest, color:C.ivory, boxShadow:"0 4px 15px rgba(10,30,50,0.3)"}}>
                      <MapPin size={12}/> Get Directions
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="p-6 rounded-2xl border" style={{background:C.white, borderColor:C.border}}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:`rgba(10,30,50,0.08)`}}>
                    <Clock size={18} style={{color:C.green}}/>
                  </div>
                  <div className="w-full">
                    <p className="font-body font-semibold text-sm mb-3" style={{color:C.forest}}>Studio Hours</p>
                    <div className="space-y-1.5">
                      {[
                        ["Mon – Sat", "8:00 AM – 1:00 PM"],
                        ["Mon – Sat", "5:00 PM – 8:00 PM"],
                        ["Sunday",    "Closed"],
                      ].map(([day,hrs],i)=>(
                        <div key={i} className="flex justify-between font-body text-sm">
                          <span style={{color:C.muted}}>{day}</span>
                          <span style={{color: day==="Sunday" ? "#e24b4a" : C.forest, fontWeight:"500"}}>{hrs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-2xl border" style={{background:C.forest, borderColor:C.forest}}>
                <p className="font-body font-semibold text-sm mb-1" style={{color:C.gold}}>Questions?</p>
                <p className="font-body text-sm mb-4" style={{color:"rgba(255,255,255,0.6)"}}>
                  Reach us on WhatsApp or give us a call before your trial.
                </p>
                <a href="tel:+917070211070"
                  className="flex items-center justify-center gap-2 font-body font-semibold text-sm py-3 rounded-xl mb-3 transition-all"
                  style={{background:"rgba(255,255,255,0.1)", color:C.ivory, border:"1px solid rgba(255,255,255,0.15)"}}>
                  📞 +91 70702 11070
                </a>
                <a href="https://wa.me/917070211070" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 font-body font-semibold text-sm py-3 rounded-xl mb-3 transition-all"
                  style={{background:"rgba(37,211,102,0.15)", color:"#25d366", border:"1px solid rgba(37,211,102,0.25)"}}>
                  💬 WhatsApp us
                </a>
                <a href="#trial"
                  className="block text-center font-body font-semibold text-sm py-3 rounded-xl transition-all"
                  style={{background:C.gold, color:C.black}}>
                  Book Trial — ₹1,000
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer style={{background:C.black, borderTop:`1px solid rgba(255,255,255,0.06)`}}>
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center mb-4">
              <img src="/logop.png" alt="Vigour Fitness Studio" style={{ height:"48px", width:"auto", objectFit:"contain", filter:"brightness(0) invert(1)" }}/>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.35)"}}>
              Pune's most intimate premium Pilates studio. Precision, intention, transformation.
            </p>
            <p className="font-body text-xs mt-4" style={{color:"rgba(30,128,194,0.5)"}}>
              📍 Pune, Maharashtra
            </p>
            <a href="tel:+917070211070" className="font-body text-xs mt-1 block transition-colors"
              style={{color:"rgba(255,255,255,0.35)"}}
              onMouseEnter={e=>e.target.style.color=C.gold}
              onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>
              📞 +91 70702 11070
            </a>
            <a href="https://wa.me/917070211070" target="_blank" rel="noopener noreferrer"
              className="font-body text-xs mt-1 block transition-colors"
              style={{color:"rgba(255,255,255,0.35)"}}
              onMouseEnter={e=>e.target.style.color="#25d366"}
              onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>
              💬 WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="font-body font-semibold text-sm mb-4" style={{color:C.white}}>Studio</p>
              {["classes","pricing","faq"].map(l=>(
                <a key={l} href={`#${l}`}
                  className="block font-body text-sm mb-2.5 capitalize transition-colors"
                  style={{color:"rgba(255,255,255,0.4)"}}
                  onMouseEnter={e=>e.target.style.color=C.gold}
                  onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>{l}</a>
              ))}
            </div>
            <div>
              <p className="font-body font-semibold text-sm mb-4" style={{color:C.white}}>Studio</p>
              <a href="#quiz" className="block font-body text-sm mb-2.5 transition-colors"
                style={{color:"rgba(255,255,255,0.4)"}}
                onMouseEnter={e=>e.target.style.color=C.gold}
                onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>Find My Class</a>
              <a href="#trial" className="block font-body text-sm mb-2.5 transition-colors"
                style={{color:"rgba(255,255,255,0.4)"}}
                onMouseEnter={e=>e.target.style.color=C.gold}
                onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>Book trial</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-8 flex flex-col sm:flex-row justify-between gap-2 border-t"
          style={{borderColor:"rgba(255,255,255,0.06)"}}>
          <p className="font-body text-xs pt-6" style={{color:"rgba(255,255,255,0.2)"}}>
            © 2026 Vigour Pilates Studio, Pune. All rights reserved.
          </p>
          <p className="font-body text-xs pt-6" style={{color:"rgba(30,128,194,0.3)"}}>
            Made with intention in Pune 🌿
          </p>
        </div>
      </footer>

      {/* ── Chatbot ──────────────────────────────────── */}
      <ChatBot />

      {/* ── Anniversary Popup ────────────────────────── */}
      <AnniversaryPopup />

      {/* ── Checkout Modal ───────────────────────────── */}
      {checkoutPlan && (
        <CheckoutModal plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
      )}
    </div>
  );
}
