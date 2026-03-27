import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, ChevronDown } from "lucide-react";
import Anthropic from "@anthropic-ai/sdk";

// ─── Colour tokens (matches LandingPage) ──────────────────────
const C = {
  black:  "#0d0d0d",
  forest: "#1a2e1e",
  green:  "#2d5a34",
  lime:   "#7db87a",
  gold:   "#c9a84c",
  ivory:  "#f5f0e8",
  cream:  "#faf7f2",
  white:  "#ffffff",
  muted:  "#6b6b5e",
};

// ─── Studio knowledge base ────────────────────────────────────
const SYSTEM_PROMPT = `You are Vigour's friendly studio assistant chatbot on the Vigour Pilates website. Vigour Pilates is a boutique Pilates studio located in Pune, Maharashtra, India.

Your job is to help visitors learn about the studio, its classes, pricing, instructors, and how to get started. Be warm, encouraging, and concise. Never make things up — only speak to what's listed below.

───────────────────────────────────────────────
STUDIO OVERVIEW
───────────────────────────────────────────────
Name: Vigour Pilates
Location: Pune, Maharashtra, India
Philosophy: Small class sizes (max 12 students), expert instruction, genuine attention to every body.
Tagline: "Move with intention."
Rating: 4.9 ★  |  500+ active members

───────────────────────────────────────────────
CLASSES OFFERED
───────────────────────────────────────────────
1. Mat Pilates — Core strength & flexibility on the mat. All levels. 60 min.
2. Reformer — Full-body resistance training on Balanced Body reformers. Beginner+. 60 min.
3. Barre Fusion — Ballet-inspired sculpting & grace. All levels. 45 min.
4. Core & Restore — Deep core work + therapeutic stretching. All levels. 75 min.
5. Power Pilates — High-intensity challenge for those ready. Intermediate+. 60 min.
6. Prenatal Flow — Safe, nurturing movement every trimester. All trimesters welcome. 60 min.

All classes are capped at 12 students — non-negotiable for quality instruction.

───────────────────────────────────────────────
INSTRUCTORS
───────────────────────────────────────────────
• Diya Nambiar — Specialises in Reformer & Rehabilitation
• Manisha Kakde — Specialises in Mat Pilates & Barre
• Rohit Shinde — Specialises in Power Pilates & Strength
• Kavita — Specialises in Prenatal & Restorative work

───────────────────────────────────────────────
MEMBERSHIP PLANS
───────────────────────────────────────────────
Starter — ₹2,999/month — 4 classes/month
  Includes: Mat classes, app access, progress tracking, community

Flow — ₹5,499/month — 8 classes/month (Most Popular)
  Includes: Mat + reformer, priority booking, trainer notes, 1 guest pass

Elite — ₹8,999/month — Unlimited classes
  Includes: All equipment, private sessions, 2 guest passes, all workshops

All plans include access to the Vigour member app for booking, leaderboard, and attendance tracking.
Memberships can be frozen for up to 60 days per year with 3 days' notice.

───────────────────────────────────────────────
TRIAL SESSION
───────────────────────────────────────────────
₹1,000 paid at the studio (no online payment required).
Full 60-minute class with a senior instructor.
Book via the "Book Trial" button on the website or the form at the bottom of the page.
We'll confirm within 24 hours.

───────────────────────────────────────────────
FREQUENTLY ASKED QUESTIONS
───────────────────────────────────────────────
Q: Do I need prior Pilates experience?
A: Not at all. Instructors adapt every session to exactly where you are.

Q: What should I bring?
A: Just comfortable workout attire. Grip socks are available to borrow at the studio.

Q: How small are the classes?
A: Every class is capped at 12 students. This is what allows instructors to truly know your body.

Q: Can I freeze my membership?
A: Yes — up to 60 days per year with 3 days' notice.

Q: Is Pilates suitable for rehabilitation / injuries?
A: Yes. Several instructors have rehabilitation expertise. Mention any injuries when booking and we'll advise on the right class.

Q: Is Prenatal Flow safe throughout pregnancy?
A: Yes, it is designed for all trimesters. Always consult your doctor, and inform your instructor before class.

───────────────────────────────────────────────
TONE GUIDELINES
───────────────────────────────────────────────
- Be warm, confident, and encouraging — like a knowledgeable friend, not a salesperson
- Keep answers concise (2–4 sentences unless more detail is needed)
- If someone asks about booking, direct them to use the "Book Trial" button or the trial form on the page
- If you don't know something (e.g., exact studio address, phone number, specific class schedule times), say so honestly and suggest they reach out directly via the website
- Never invent prices, class names, or instructor details beyond what's listed above
- Use ₹ (Indian Rupee) for all prices`;

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
        className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={isUser
          ? { background: C.forest, color: C.white, borderRadius: "18px 18px 4px 18px" }
          : { background: C.white, color: C.black, border: `1px solid rgba(45,90,52,0.12)`, borderRadius: "18px 18px 18px 4px" }
        }
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

// ─── Main ChatBot Component ───────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([
    { role: "assistant", content: "Hi! I'm the Vigour assistant 👋 Ask me anything about our classes, pricing, instructors, or how to get started." }
  ]);
  const [input, setInput]         = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError]         = useState(null);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);
  const abortRef                  = useRef(null);

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
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === "your_anthropic_api_key_here") {
        throw new Error("Please add your VITE_ANTHROPIC_API_KEY to .env.local");
      }

      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

      // Build messages array for the API (only user/assistant turns, no system)
      const apiMessages = newHistory.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Cancel any previous stream
      if (abortRef.current) abortRef.current.abort();

      const stream = await client.messages.stream({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      });

      let accumulated = "";
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          accumulated += event.delta.text;
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
              border: `1px solid rgba(45,90,52,0.15)`,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: C.forest, borderBottom: `1px solid rgba(201,168,76,0.2)` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold"
                  style={{ background: C.gold, color: C.black, fontFamily: "Georgia,serif", fontSize: "14px" }}>V</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.white, fontFamily: "Georgia,serif" }}>Vigour Assistant</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Always here to help</span>
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
                  <div className="rounded-2xl border" style={{ background: C.white, border: `1px solid rgba(45,90,52,0.12)` }}>
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
                    style={{ borderColor: `rgba(45,90,52,0.25)`, color: C.green, background: "white",
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

                      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
                      if (!apiKey || apiKey === "your_anthropic_api_key_here") {
                        setError("Please add your VITE_ANTHROPIC_API_KEY to .env.local");
                        setMessages(prev => prev.slice(0, -1));
                        setIsStreaming(false);
                        return;
                      }
                      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
                      client.messages.stream({
                        model: "claude-haiku-4-5",
                        max_tokens: 512,
                        system: SYSTEM_PROMPT,
                        messages: newHistory.map(m => ({ role: m.role, content: m.content })),
                      }).then(async stream => {
                        let accumulated = "";
                        for await (const event of stream) {
                          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                            accumulated += event.delta.text;
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
              style={{ borderTop: `1px solid rgba(45,90,52,0.1)`, background: C.cream }}>
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
                    border: `1px solid rgba(45,90,52,0.2)`,
                    background: C.white,
                    color: C.black,
                    fontFamily: "DM Sans,sans-serif",
                    maxHeight: "100px",
                    lineHeight: "1.5",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e => e.target.style.borderColor = "rgba(45,90,52,0.2)"}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !isStreaming ? C.forest : "rgba(45,90,52,0.2)",
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

      {/* ── Floating trigger button ───────────────────── */}
      <motion.button
        onClick={() => setIsOpen(o => !o)}
        className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          bottom: "24px", right: "24px",
          background: isOpen ? C.muted : C.forest,
          boxShadow: isOpen ? "0 4px 20px rgba(0,0,0,0.2)" : `0 8px 30px rgba(26,46,30,0.5)`,
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
