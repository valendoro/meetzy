import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Meetzy <notificaciones@meetzy.ai>";

/* ─── Hot Lead Alert ─────────────────────────────────────────── */

export interface HotLeadPayload {
  ownerEmail: string;
  ownerName?: string | null;
  agentName: string;
  siteName: string;
  siteId: string;         // public siteId for dashboard URL
  conversationId: string;
  visitorName?: string | null;
  visitorEmail?: string | null;
  visitorCompany?: string | null;
  intentScore: number;
  source?: string | null;
  country?: string | null;
  messageCount: number;
  sessionDuration?: number | null;
  topMessages: string[];  // last 3 user messages
}

function badge(score: number) {
  if (score >= 80) return { label: "🔥 Hot lead", color: "#ef4444", bg: "#fef2f2" };
  if (score >= 60) return { label: "⚡ Listo para comprar", color: "#f97316", bg: "#fff7ed" };
  return { label: "👀 Evaluando", color: "#eab308", bg: "#fefce8" };
}

function formatDuration(s?: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function sourceLabel(src?: string | null) {
  const map: Record<string, string> = {
    google: "Google",
    facebook: "Facebook",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    twitter: "Twitter / X",
    referral: "Referral",
    direct: "Directo",
  };
  return src ? (map[src] ?? src) : "—";
}

export async function sendHotLeadAlert(payload: HotLeadPayload) {
  if (!process.env.RESEND_API_KEY) return;

  const { label, color, bg } = badge(payload.intentScore);
  const dashUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai"}/dashboard/${payload.siteId}/conversations/${payload.conversationId}`;

  const visitorLine = [payload.visitorName, payload.visitorEmail, payload.visitorCompany]
    .filter(Boolean)
    .join(" · ") || "Visitante anónimo";

  const messagesHtml = payload.topMessages
    .slice(-3)
    .map(
      (m) =>
        `<div style="border-left:3px solid ${color};padding:8px 12px;margin-bottom:8px;background:#fafafa;border-radius:0 6px 6px 0;font-size:14px;color:#374151;">${m}</div>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#09090b;border-radius:12px 12px 0 0;padding:28px 32px;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:20px;font-weight:800;color:#6366f1;letter-spacing:-0.5px;">MEETZY</p>
          <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">Alerta de lead · ${payload.agentName}</p>
        </td></tr>

        <!-- Intent badge -->
        <tr><td style="background:#fff;padding:28px 32px 0;">
          <div style="display:inline-block;background:${bg};border:1px solid ${color}33;border-radius:8px;padding:10px 18px;margin-bottom:20px;">
            <span style="font-size:16px;font-weight:700;color:${color};">${label}</span>
            <span style="font-size:13px;color:${color}99;margin-left:8px;">Score ${payload.intentScore}/100</span>
          </div>
          <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">
            Nuevo lead en <span style="color:#6366f1;">${payload.siteName}</span>
          </h1>
          <p style="margin:0;font-size:14px;color:#6b7280;">El agente <strong>${payload.agentName}</strong> detectó un visitante con alta intención de compra.</p>
        </td></tr>

        <!-- Visitor info -->
        <tr><td style="background:#fff;padding:24px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr style="background:#f9fafb;">
              <td colspan="2" style="padding:12px 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">
                Visitante
              </td>
            </tr>
            <tr>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;color:#6b7280;width:40%;">Identidad</td>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:#111827;">${visitorLine}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Fuente</td>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:#111827;">${sourceLabel(payload.source)}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;color:#6b7280;">País</td>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:#111827;">${payload.country ?? "—"}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Mensajes</td>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:#111827;">${payload.messageCount}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Tiempo en sitio</td>
              <td style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:#111827;">${formatDuration(payload.sessionDuration)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Messages -->
        <tr><td style="background:#fff;padding:24px 32px 0;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Últimos mensajes</p>
          ${messagesHtml || '<p style="color:#9ca3af;font-size:13px;">Sin mensajes registrados.</p>'}
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#fff;padding:28px 32px 32px;">
          <a href="${dashUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;letter-spacing:-0.2px;">
            Ver conversación completa →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            Recibís este email porque tenés alertas activadas en <a href="https://meetzy.ai" style="color:#6366f1;text-decoration:none;">Meetzy</a>.
            Agente: ${payload.agentName} · ${payload.siteName}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: payload.ownerEmail,
    subject: `${label}: ${payload.visitorName ?? "visitante"} en ${payload.agentName}`,
    html,
  });
}
