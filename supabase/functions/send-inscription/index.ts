import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Email HTML template ──────────────────────────────────────────────────────

function buildEmailHtml(d: Record<string, string>): string {
  const levelLabel: Record<string, string> = {
    PS: "Petite section", MS: "Moyenne section", GS: "Grande section",
    CP: "CP", CE1: "CE1", CE2: "CE2", CM1: "CM1", CM2: "CM2",
  };
  const cycleLabel = d.cycle === "maternelle" ? "🌱 Maternelle" : "🚀 Primaire";
  const genderLabel = d.gender === "M" ? "Masculin" : "Féminin";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin:0; padding:0; }
  .wrap { max-width:600px; margin:32px auto; background:#fff; border-radius:10px; overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,.10); }
  .header { background:#fa394a; padding:28px 32px; text-align:center; }
  .header img { width:60px; height:60px; border-radius:8px; object-fit:contain; }
  .header h1 { color:#fff; margin:12px 0 0; font-size:1.3rem; }
  .header p  { color:rgba(255,255,255,.8); font-size:.85rem; margin:4px 0 0; }
  .badge { display:inline-block; background:#ffb606; color:#242424;
           font-size:.78rem; font-weight:700; padding:4px 12px; border-radius:20px;
           margin-top:10px; letter-spacing:.06em; text-transform:uppercase; }
  .body  { padding:28px 32px; }
  .section-title { font-size:.7rem; font-weight:700; letter-spacing:.12em;
                   text-transform:uppercase; color:#888; border-bottom:1px solid #eee;
                   padding-bottom:8px; margin:24px 0 14px; }
  .section-title:first-child { margin-top:0; }
  table { width:100%; border-collapse:collapse; }
  td { padding:7px 0; font-size:.9rem; vertical-align:top; }
  td:first-child { color:#666; width:42%; font-weight:600; }
  td:last-child  { color:#222; }
  .footer { background:#f8f8f8; padding:18px 32px; text-align:center;
            font-size:.78rem; color:#aaa; border-top:1px solid #eee; }
  .footer strong { color:#fa394a; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Nouvelle préinscription reçue</h1>
    <p>École Candide · Mohammedia</p>
    <span class="badge">${cycleLabel}</span>
  </div>
  <div class="body">
    <div class="section-title">Informations de l'élève</div>
    <table>
      <tr><td>Prénom / Nom</td>   <td><strong>${d.student_first} ${d.student_last}</strong></td></tr>
      <tr><td>Date de naissance</td><td>${d.birth_date}</td></tr>
      <tr><td>Genre</td>          <td>${genderLabel}</td></tr>
      <tr><td>Nationalité</td>    <td>${d.nationality || "—"}</td></tr>
      <tr><td>Niveau demandé</td> <td><strong>${levelLabel[d.level] ?? d.level}</strong></td></tr>
    </table>

    <div class="section-title">Informations du parent / tuteur</div>
    <table>
      <tr><td>Prénom / Nom</td><td><strong>${d.parent_first} ${d.parent_last}</strong></td></tr>
      <tr><td>E-mail</td>      <td><a href="mailto:${d.email}" style="color:#fa394a;">${d.email}</a></td></tr>
      <tr><td>Téléphone</td>   <td>${d.phone}</td></tr>
      <tr><td>Adresse</td>     <td>${d.address || "—"}</td></tr>
    </table>

    ${d.message ? `
    <div class="section-title">Message</div>
    <p style="font-size:.92rem;color:#444;line-height:1.65;">${d.message}</p>
    ` : ""}
  </div>
  <div class="footer">
    Reçu le ${new Date().toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })} · <strong>École Candide</strong> · candide286@yahoo.fr
  </div>
</div>
</body>
</html>`;
}

// ── Confirmation email to parent ─────────────────────────────────────────────

function buildConfirmHtml(d: Record<string, string>): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:0; }
  .wrap { max-width:600px; margin:32px auto; background:#fff; border-radius:10px; overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,.10); }
  .header { background:#442e66; padding:28px 32px; text-align:center; }
  .header h1 { color:#fff; margin:8px 0 0; font-size:1.25rem; }
  .header p  { color:rgba(255,255,255,.75); font-size:.85rem; margin:6px 0 0; }
  .body   { padding:32px; }
  .body p { font-size:.95rem; color:#444; line-height:1.75; margin-bottom:14px; }
  .highlight { background:#fff8f8; border-left:4px solid #fa394a;
               padding:14px 18px; border-radius:0 8px 8px 0; margin:20px 0; }
  .highlight strong { color:#fa394a; }
  .footer { background:#f8f8f8; padding:18px 32px; text-align:center;
            font-size:.78rem; color:#aaa; border-top:1px solid #eee; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Votre demande a bien été reçue ✓</h1>
    <p>École Candide · Mohammedia</p>
  </div>
  <div class="body">
    <p>Bonjour <strong>${d.parent_first} ${d.parent_last}</strong>,</p>
    <p>
      Nous avons bien reçu votre demande de préinscription pour
      <strong>${d.student_first} ${d.student_last}</strong>
      (${d.cycle === "maternelle" ? "Maternelle" : "Primaire"} — ${d.level}).
    </p>
    <div class="highlight">
      Notre équipe d'admission vous contactera dans un délai de
      <strong>48 heures</strong> au <strong>${d.phone}</strong>
      ou à l'adresse <strong>${d.email}</strong> pour finaliser le dossier.
    </div>
    <p>Merci de votre confiance et à bientôt à l'École Candide !</p>
  </div>
  <div class="footer">
    Rue Brahim Roudani et Doukkala, 28800 Mohammedia · 0808-563951 · candide286@yahoo.fr
  </div>
</div>
</body>
</html>`;
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const data: Record<string, string> = await req.json();

    // 1. Save to Supabase DB using service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("inscriptions").insert([{
      cycle:         data.cycle,
      student_first: data.student_first,
      student_last:  data.student_last,
      birth_date:    data.birth_date,
      gender:        data.gender,
      nationality:   data.nationality || null,
      level:         data.level,
      parent_first:  data.parent_first,
      parent_last:   data.parent_last,
      email:         data.email,
      phone:         data.phone,
      address:       data.address || null,
      message:       data.message || null,
    }]);

    if (dbError) throw new Error(`DB: ${dbError.message}`);

    // 2. Send notification email to school
    const schoolEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    "Inscriptions Candide <inscriptions@candide.ma>",
        to:      ["candide286@yahoo.fr"],
        subject: `📋 Nouvelle préinscription — ${data.student_first} ${data.student_last} (${data.level})`,
        html:    buildEmailHtml(data),
      }),
    });

    if (!schoolEmail.ok) {
      const err = await schoolEmail.text();
      console.error("Resend school email error:", err);
    }

    // 3. Send confirmation email to parent
    const parentEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    "École Candide <inscriptions@candide.ma>",
        to:      [data.email],
        subject: `Confirmation de votre préinscription — ${data.student_first} ${data.student_last}`,
        html:    buildConfirmHtml(data),
      }),
    });

    if (!parentEmail.ok) {
      const err = await parentEmail.text();
      console.error("Resend parent email error:", err);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});
