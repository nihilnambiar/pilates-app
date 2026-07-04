// src/pages/TermsPage.jsx
import { Link } from 'react-router-dom';

const BODY  = "'Inter', 'DM Sans', sans-serif";
const SERIF = "'Playfair Display', serif";

const sections = [
  {
    title: "Membership & Class Packages",
    items: [
      "All memberships and class packages are non-transferable and intended for individual use only.",
      "Packages are valid for a fixed duration, as communicated at the time of purchase.",
      "Any unused sessions will expire after the validity period unless otherwise stated.",
    ],
  },
  {
    title: "Booking & Attendance",
    items: [
      "All sessions must be pre-booked via our booking system or WhatsApp.",
      "Clients are requested to arrive on time. Late arrivals may result in reduced session time or denial of entry.",
      "Instructors reserve the right to refuse participation if a client is unfit for the session due to health or safety concerns.",
    ],
  },
  {
    title: "Cancellation & Rescheduling",
    items: [
      "Sessions must be cancelled or rescheduled at least 12 hours in advance.",
      "Late cancellations or no-shows will result in the session being deducted from your package.",
      "Emergency exceptions may be considered at the discretion of management.",
    ],
  },
  {
    title: "Freezing Policy",
    items: [
      "Clients are allowed to freeze their membership up to 3 times per month.",
      "Each freeze request must be communicated in advance via WhatsApp or email.",
      "Freeze periods will extend the validity of the package accordingly.",
      "Freezing is not applicable for trial sessions or single-session bookings.",
      "Vigour Pilates reserves the right to approve or deny freeze requests based on misuse or policy violations.",
    ],
  },
  {
    title: "Payments & Refunds",
    items: [
      "All payments must be made in advance.",
      "Fees once paid are non-refundable and non-transferable.",
      "In exceptional cases, management may provide credit notes at its sole discretion.",
    ],
  },
  {
    title: "Health & Safety",
    items: [
      "Clients must disclose any medical conditions, injuries, or physical limitations prior to sessions.",
      "Vigour Pilates is not liable for any injuries sustained due to undisclosed health conditions or improper execution of exercises outside instructor guidance.",
      "Clients are responsible for listening to their bodies and informing instructors of discomfort.",
    ],
  },
  {
    title: "Code of Conduct",
    items: [
      "Clients are expected to maintain a respectful and positive environment.",
      "Any form of misconduct, harassment, or disruptive behaviour may result in termination of membership without refund.",
    ],
  },
  {
    title: "Studio Rules",
    items: [
      "Proper workout attire is required.",
      "Mobile phones should be kept on silent during sessions.",
      "Equipment must be handled with care.",
    ],
  },
  {
    title: "Changes to Schedule & Services",
    items: [
      "Vigour Pilates reserves the right to modify class schedules, change instructors, and adjust pricing or packages.",
      "Clients will be informed of significant changes in advance where possible.",
    ],
  },
  {
    title: "Liability Waiver",
    items: [
      "Pilates involves physical activity with inherent risks.",
      "You voluntarily participate at your own risk.",
      "Vigour Pilates and its instructors are not liable for injuries, damages, or losses incurred during sessions.",
    ],
  },
  {
    title: "Privacy Policy",
    items: [
      "Personal information collected will be used solely for booking, communication, and improving services.",
      "We do not share client data with third parties without consent.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh", fontFamily: BODY }}>

      {/* Nav — identical to ComparePage */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e3dc", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/">
            <img src="/logop.png" alt="Vigour Pilates Studio" style={{ height: "30px", objectFit: "contain" }} />
          </Link>
          <Link to="/" style={{ fontFamily: BODY, fontSize: "13px", fontWeight: 500, color: "#888", textDecoration: "none" }}>
            ← Back to home
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 24px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: "48px", paddingBottom: "32px", borderBottom: "2px solid #e8e3dc" }}>
          <p style={{ fontFamily: BODY, fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9DC230", marginBottom: "14px" }}>
            Legal Document
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 600, lineHeight: 1.15, color: "#1a1a1a", marginBottom: "12px" }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "14px", color: "#999", fontWeight: 400 }}>
            Vigour Pilates Studio &nbsp;·&nbsp; Last updated: April 2026
          </p>
        </div>

        {/* Intro */}
        <p style={{ fontFamily: BODY, fontSize: "15px", lineHeight: 1.85, color: "#444", marginBottom: "52px", padding: "20px 24px", background: "#fff", borderRadius: "12px", border: "1px solid #e8e3dc", borderLeft: "3px solid #9DC230" }}>
          Welcome to Vigour Pilates Studio. By enrolling in our classes, purchasing a package, or using our services, you agree to the following Terms &amp; Conditions. Please read them carefully.
        </p>

        {/* Sections */}
        <div>
          {sections.map((s, idx) => (
            <div key={s.title} style={{ padding: "36px 0", borderBottom: "1px solid #e8e3dc" }}>
              <h2 style={{
                fontFamily: BODY,
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: "#1a1a1a",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "#f0f5e8", color: "#6a9a10",
                  fontSize: "12px", fontWeight: 700, flexShrink: 0,
                }}>
                  {idx + 1}
                </span>
                {s.title}
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {s.items.map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#9DC230", flexShrink: 0, marginTop: "9px" }} />
                    <span style={{ fontFamily: BODY, fontSize: "15px", lineHeight: 1.75, color: "#555", fontWeight: 400 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ marginTop: "48px", padding: "32px", borderRadius: "16px", background: "#fff", border: "1px solid #e8e3dc" }}>
          <h2 style={{
            fontFamily: BODY, fontSize: "15px", fontWeight: 700, color: "#1a1a1a",
            marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "28px", height: "28px", borderRadius: "8px",
              background: "#e8f0fb", color: "#1E80C2",
              fontSize: "12px", fontWeight: 700, flexShrink: 0,
            }}>12</span>
            Contact Information
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "✉",  label: "Email",     href: "mailto:hello@vigourpilates.com", text: "hello@vigourpilates.com" },
              { icon: "💬", label: "WhatsApp",  href: "https://wa.me/917070211070",     text: "7070211070" },
              { icon: "🌐", label: "Website",   href: "https://vigourpilates.com",      text: "vigourpilates.com" },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>{c.icon}</span>
                <span style={{ fontFamily: BODY, fontSize: "14px", color: "#888", width: "80px" }}>{c.label}</span>
                <a href={c.href} style={{ fontFamily: BODY, fontSize: "14px", color: "#1E80C2", textDecoration: "none", fontWeight: 500 }}>{c.text}</a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: "48px", fontFamily: BODY, fontSize: "13px", color: "#aaa", lineHeight: 1.8, textAlign: "center", fontWeight: 400 }}>
          By enrolling in our services, you confirm that you have read, understood, and agreed to these Terms &amp; Conditions.
          <br /><strong style={{ color: "#888" }}>Vigour Pilates Studio</strong>
        </p>
      </div>
    </div>
  );
}
