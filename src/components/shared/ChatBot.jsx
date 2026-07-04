import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, ChevronDown } from "lucide-react";
import Groq from "groq-sdk";

// ─── Colour tokens (matches LandingPage) ──────────────────────
const C = {
  black:  "#0d0d0d",
  forest: "#0a1e32",
  green:  "#1a3d6b",
  lime:   "#9DC230",
  gold:   "#1E80C2",
  ivory:  "#f0f5fa",
  cream:  "#f5f8fc",
  white:  "#ffffff",
  muted:  "#6b7a8d",
};

// ─── Studio knowledge base ────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are Vigo, the studio assistant for Vigour Pilates — a boutique Pilates studio in Pune, India. Be warm, knowledgeable, and encouraging. Never invent details beyond what's listed here.

STUDIO
Name: Vigour Pilates | Location: Pune, Maharashtra, India
Phone/WhatsApp: +91 70702 11070 | Website: vigourpilates.com
Rating: 4.9★ | 200+ active members
Philosophy: Small intentional classes, expert instruction, genuine attention to every body. Tagline: "Move with intention."

CLASSES
- Reformer Pilates — Full-body resistance training on Balanced Body reformers. Builds strength, improves posture, burns calories. 60 min. Beginner+.
- Barrel Ladder — Spinal articulation, deep flexibility, and full-body control. Great for back issues. 45 min. All levels.
- Core & Restore — Deep core strengthening combined with therapeutic stretching. Perfect for recovery and rehabilitation. 75 min. All levels.
- Chair Pilates — High-intensity challenge on the Pilates chair. Builds serious strength. 60 min. Intermediate+.
- Cadillac Machine Pilates — Full-body conditioning on the Cadillac apparatus. Versatile and highly effective. 60 min. All levels.
All sessions are kept intentionally small so instructors can give each person genuine attention.

INSTRUCTORS: Diya Nambiar, Manisha Kakde, Rohit Shinde

PACKAGES (all include: all apparatus, trainer-guided, priority booking)
- Experience: ₹1,999 / 3 sessions — perfect to explore before committing
- Starter: ₹7,000 / 8 sessions
- Standard: ₹10,000 / 12 sessions
- Best Value: ₹16,000 / 22 sessions — most popular choice
- Elite: ₹22,000 / 32 sessions — our most premium plan. Includes: personalised progress tracking, nutrition guidance & support, priority booking & flexibility, direct trainer access, and bonus session benefits
- Family Takeover: ₹499/person (max 8 people) — weekend only, exclusive studio access with dedicated instructor. Perfect for families and friend groups.

TRIAL SESSION
₹1,000 paid at the studio (no online payment). Full 60-min session with a senior instructor. Book via the "Book Trial" button or the form at the bottom of the page. We'll confirm within 24 hours.

FAQs
- No prior experience needed — instructors fully adapt to where you are
- Wear comfortable workout clothes; grip socks available at the studio
- Classes are intentionally small — this is what makes the difference
- Great for rehab and injuries — mention your condition when booking and we'll guide you to the right session
- For schedule times or the exact address, direct visitors to call/WhatsApp +91 70702 11070

TONE & FORMATTING RULES (follow strictly)
- Be warm, confident, encouraging — like a knowledgeable friend
- For lists, put each item on its own line starting with "- "
- Never write "* item * item" all on one line
- Use plain text only — no markdown bold (**), no headers (#)
- Keep answers focused; give detail when the question calls for it

PERSUASION
If someone delays (next month / later / not now): gently push back. "The trial is just ₹1,000 and takes one hour — most people tell us they wish they'd started sooner." Always end with a clear next step (Book Trial button or WhatsApp +91 70702 11070).`;

// ─── Typing indicator ─────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: C.muted }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

// ─── Render assistant text with bullet-point support ─────────
function renderContent(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let bulletBuffer = [];

  const flushBullets = () => {
    if (bulletBuffer.length) {
      elements.push(
        <ul key={elements.length} style={{ paddingLeft: "16px", margin: "6px 0", listStyleType: "disc" }}>
          {bulletBuffer.map((b, i) => (
            <li key={i} style={{ marginBottom: "4px", lineHeight: "1.55" }}>{b}</li>
          ))}
        </ul>
      );
      bulletBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    const bullet = line.match(/^[-•*]\s+(.+)/);
    if (bullet) {
      bulletBuffer.push(bullet[1]);
    } else {
      flushBullets();
      const trimmed = line.trim();
      if (trimmed) {
        elements.push(<p key={i} style={{ margin: "4px 0", lineHeight: "1.6" }}>{trimmed}</p>);
      }
    }
  });
  flushBullets();
  return elements;
}

// ─── Single message bubble ────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5"
          style={{ background: C.forest, color: C.gold, fontFamily: "Georgia,serif" }}
        >V</div>
      )}
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl text-sm"
        style={isUser
          ? { background: C.forest, color: C.white, borderRadius: "18px 18px 4px 18px" }
          : { background: C.white, color: C.black, border: `1px solid rgba(26,61,107,0.12)`, borderRadius: "18px 18px 18px 4px" }
        }
      >
        {isUser ? msg.content : renderContent(msg.content)}
      </div>
    </motion.div>
  );
}

// ─── Build system prompt, injecting quiz result if available ──
function buildSystemPrompt() {
  let prompt = BASE_SYSTEM_PROMPT;
  try {
    const saved = localStorage.getItem("vigour_quiz_result");
    if (saved) {
      const { topClass, analysis, radarData } = JSON.parse(saved);
      const classNames = {
        reformer: "Reformer", barrel: "Barrel Ladder",
        restore: "Core & Restore", chair: "Chair Pilates", cadillac: "Cadillac Machine Pilates",
      };
      const scores = (radarData || []).map(r => `  ${r.subject}: ${r.value}%`).join("\n");
      prompt += `

───────────────────────────────────────────────
THIS VISITOR'S QUIZ RESULT (use this to personalise your answers)
───────────────────────────────────────────────
This visitor has already taken the Vigour class quiz. Their result:
- Recommended class: ${classNames[topClass] || topClass}
- AI analysis given to them:
${analysis || "(not available)"}
${scores ? `- Their fitness profile scores:\n${scores}` : ""}

When they ask questions like "based on my answers, what do you think?" or "which class is right for me?", refer directly to their quiz result above. Be specific — mention their recommended class by name and reference the analysis if relevant. If they seem hesitant, remind them their quiz already pointed to the perfect starting point and the trial is just ₹1,000.`;
    }
  } catch (_) {}
  return prompt;
}

// ─── Main ChatBot Component ───────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [messages, setMessages]   = useState([
    { role: "assistant", content: "Hi! I'm Vigo 👋 Ask me anything about our classes, pricing, instructors, or how to get started." }
  ]);
  const [input, setInput]         = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError]         = useState(null);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);
  const abortRef                  = useRef(null);

  // Show popup after 3s, auto-hide after 7s
  useEffect(() => {
    const show = setTimeout(() => setShowPopup(true), 3000);
    const hide = setTimeout(() => setShowPopup(false), 10000); // 3s delay + 7s visible
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  const handleOpen = () => {
    setIsOpen(o => !o);
    setShowPopup(false);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    const userMsg = { role: "user", content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsStreaming(true);

    // Placeholder for the streaming assistant reply
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Please add your VITE_GROQ_API_KEY to .env.local");

      const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      // Keep only last 6 messages to minimise token usage
      const trimmedHistory = newHistory.slice(-6);
      const apiMessages = [
        { role: "system", content: buildSystemPrompt() },
        ...trimmedHistory.map(m => ({ role: m.role, content: m.content })),
      ];

      const stream = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        max_tokens: 450,
        messages: apiMessages,
        stream: true,
      });

      let accumulated = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          accumulated += delta;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: accumulated };
            return updated;
          });
        }
      }
    } catch (err) {
      const errMsg = err.message || "Something went wrong. Please try again.";
      setError(errMsg);
      // Remove the empty placeholder
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat Window ──────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-50 flex flex-col"
            style={{
              bottom: "88px", right: "24px",
              width: "min(380px, calc(100vw - 32px))",
              height: "min(520px, calc(100vh - 120px))",
              background: C.cream,
              borderRadius: "20px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08)",
              border: `1px solid rgba(26,61,107,0.15)`,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: C.forest, borderBottom: `1px solid rgba(30,128,194,0.2)` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold"
                  style={{ background: C.gold, color: C.black, fontFamily: "Georgia,serif", fontSize: "14px" }}>V</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.white, fontFamily: "Georgia,serif" }}>Vigo</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Vigour's studio assistant</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.6)" }}>
                <ChevronDown size={18}/>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: `${C.muted} transparent` }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg}/>
              ))}
              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start mb-3">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5"
                    style={{ background: C.forest, color: C.gold, fontFamily: "Georgia,serif" }}>V</div>
                  <div className="rounded-2xl border" style={{ background: C.white, border: `1px solid rgba(26,61,107,0.12)` }}>
                    <TypingDots/>
                  </div>
                </div>
              )}
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-center mt-2 px-4 py-2 rounded-xl"
                  style={{ color: "#c0392b", background: "rgba(192,57,43,0.08)" }}>
                  {error}
                </motion.p>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Suggested questions (only on first open) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {["What classes do you offer?", "How much does it cost?", "How do I book a trial?"].map(q => (
                  <button key={q}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all"
                    style={{ borderColor: `rgba(26,61,107,0.25)`, color: C.green, background: "white",
                      fontFamily: "DM Sans,sans-serif" }}
                    onMouseEnter={e => { e.target.style.background = C.forest; e.target.style.color = C.ivory; }}
                    onMouseLeave={e => { e.target.style.background = "white"; e.target.style.color = C.green; }}
                    onClick={() => {
                      setInput("");
                      const userMsg = { role: "user", content: q };
                      const newHistory = [...messages, userMsg];
                      setMessages(newHistory);
                      setIsStreaming(true);
                      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

                      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
                      if (!apiKey) {
                        setError("Please add your VITE_GROQ_API_KEY to .env.local");
                        setMessages(prev => prev.slice(0, -1));
                        setIsStreaming(false);
                        return;
                      }
                      const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
                      client.chat.completions.create({
                        model: "llama-3.1-8b-instant",
                        max_tokens: 300,
                        messages: [
                          { role: "system", content: buildSystemPrompt() },
                          ...newHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
                        ],
                        stream: true,
                      }).then(async stream => {
                        let accumulated = "";
                        for await (const chunk of stream) {
                          const delta = chunk.choices[0]?.delta?.content || "";
                          if (delta) {
                            accumulated += delta;
                            setMessages(prev => {
                              const updated = [...prev];
                              updated[updated.length - 1] = { role: "assistant", content: accumulated };
                              return updated;
                            });
                          }
                        }
                      }).catch(err => {
                        setError(err.message);
                        setMessages(prev => prev.slice(0, -1));
                      }).finally(() => setIsStreaming(false));
                    }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 flex-shrink-0"
              style={{ borderTop: `1px solid rgba(26,61,107,0.1)`, background: C.cream }}>
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about classes, pricing, booking…"
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 resize-none outline-none text-sm px-4 py-3 rounded-2xl"
                  style={{
                    border: `1px solid rgba(26,61,107,0.2)`,
                    background: C.white,
                    color: C.black,
                    fontFamily: "DM Sans,sans-serif",
                    maxHeight: "100px",
                    lineHeight: "1.5",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e => e.target.style.borderColor = "rgba(26,61,107,0.2)"}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !isStreaming ? C.forest : "rgba(26,61,107,0.2)",
                    color: input.trim() && !isStreaming ? C.gold : C.muted,
                  }}
                >
                  <Send size={16}/>
                </button>
              </div>
              <p className="text-center text-xs mt-2" style={{ color: "rgba(107,107,94,0.5)" }}>
                Powered by AI · For exact schedules, contact the studio
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Popup bubble ───────────────────────────────── */}
      <AnimatePresence>
        {showPopup && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-50 flex items-end gap-2"
            style={{ bottom: "92px", right: "16px" }}
          >
            <div
              className="relative px-4 py-3 rounded-2xl cursor-pointer"
              style={{
                background: C.forest,
                boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
                border: "1px solid rgba(30,128,194,0.25)",
                maxWidth: "220px",
              }}
              onClick={handleOpen}
            >
              {/* Tail */}
              <div style={{
                position: "absolute", bottom: "-7px", right: "22px",
                width: 0, height: 0,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop: `7px solid ${C.forest}`,
              }}/>
              <p style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: C.white, margin: "0 0 2px", fontWeight: 600 }}>
                Hi, I'm Vigo 👋
              </p>
              <p style={{ fontFamily: "DM Sans,sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
                Ask me anything about classes or pricing
              </p>
              {/* Dismiss */}
              <button
                onClick={e => { e.stopPropagation(); setShowPopup(false); }}
                style={{
                  position: "absolute", top: "6px", right: "8px",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.3)", fontSize: "14px", lineHeight: 1, padding: "2px",
                }}
              >×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating trigger button ───────────────────── */}
      <motion.button
        onClick={handleOpen}
        className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          bottom: "24px", right: "24px",
          background: isOpen ? C.muted : C.forest,
          boxShadow: isOpen ? "0 4px 20px rgba(0,0,0,0.2)" : `0 8px 30px rgba(10,30,50,0.5)`,
          transition: "background 0.2s, box-shadow 0.2s",
        }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={22} color={C.ivory}/>
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageCircle size={22} color={C.gold}/>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread pulse dot */}
        {!isOpen && (
          <motion.span
            className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2"
            style={{ background: C.gold, borderColor: C.forest }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        )}
      </motion.button>
    </>
  );
}
