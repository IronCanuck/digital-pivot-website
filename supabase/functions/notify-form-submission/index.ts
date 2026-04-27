import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { to, formData } = await req.json();

    if (!to || !formData) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      // No email provider configured — silently succeed so form submission still works
      return new Response(JSON.stringify({ success: true, note: "No email provider configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = Object.entries(formData as Record<string, string>)
      .map(([k, v]) => `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;">${k}</td><td style="padding:8px 12px;color:#111827;border:1px solid #e5e7eb;">${v || '—'}</td></tr>`)
      .join('');

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#2dd4bf;margin:0;font-size:20px;">New Form Submission</h1>
          <p style="color:#94a3b8;margin:4px 0 0;font-size:14px;">Someone filled out your Get Started form</p>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
          <p style="color:#9ca3af;font-size:12px;margin-top:20px;">Submitted at ${new Date().toLocaleString('en-CA')}</p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@digitalpivot.ca",
        to,
        subject: "New form submission — DigitalPivot",
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend error:", body);
      return new Response(JSON.stringify({ error: "Email send failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
