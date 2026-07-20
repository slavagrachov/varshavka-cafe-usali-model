import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => new Response(
  JSON.stringify({ ok: false, message: "Import endpoint is disabled after successful transfer." }),
  { status: 403, headers: { "content-type": "application/json" } }
));
