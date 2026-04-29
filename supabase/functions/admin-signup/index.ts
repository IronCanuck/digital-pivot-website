import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type SignupBody = {
  email?: string;
  password?: string;
  invite_code?: string;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method === "GET") {
    const supabaseStatus = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { count, error } = await supabaseStatus
      .from("admin_profiles")
      .select("id", { count: "exact", head: true });
    if (error) return json(500, { error: error.message });
    return json(200, { has_admins: (count ?? 0) > 0 });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let body: SignupBody;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const inviteCode = (body.invite_code ?? "").trim();

  if (!email || !password) {
    return json(400, { error: "Email and password are required." });
  }
  if (password.length < 8) {
    return json(400, { error: "Password must be at least 8 characters." });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { count: adminCount, error: countError } = await supabase
    .from("admin_profiles")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return json(500, { error: `Could not check admin count: ${countError.message}` });
  }

  const isBootstrap = (adminCount ?? 0) === 0;
  let inviteId: string | null = null;

  if (!isBootstrap) {
    if (!inviteCode) {
      return json(400, {
        error: "Sign-up is closed. An invite code is required.",
      });
    }

    const { data: invite, error: inviteError } = await supabase
      .from("admin_invites")
      .select("id, used_by, expires_at")
      .eq("code", inviteCode)
      .maybeSingle();

    if (inviteError) {
      return json(500, { error: `Invite lookup failed: ${inviteError.message}` });
    }
    if (!invite) {
      return json(403, { error: "Invalid invite code." });
    }
    if (invite.used_by) {
      return json(403, { error: "This invite has already been used." });
    }
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      return json(403, { error: "This invite has expired." });
    }
    inviteId = invite.id;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return json(400, { error: createError?.message ?? "Could not create user." });
  }
  const userId = created.user.id;

  const { error: profileError } = await supabase.from("admin_profiles").insert({
    id: userId,
    role: isBootstrap ? "owner" : "admin",
  });
  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return json(500, { error: `Profile creation failed: ${profileError.message}` });
  }

  if (inviteId) {
    await supabase
      .from("admin_invites")
      .update({ used_by: userId, used_at: new Date().toISOString() })
      .eq("id", inviteId);
  }

  return json(200, {
    success: true,
    user_id: userId,
    role: isBootstrap ? "owner" : "admin",
    bootstrap: isBootstrap,
  });
});
