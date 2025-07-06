import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Get line items
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    const paymentData = {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      paymentIntentId: session.payment_intent,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      items: lineItems.data.map(item => ({
        description: item.description,
        quantity: item.quantity,
        amountTotal: item.amount_total,
      })),
      created: session.created,
      status: session.status,
    };

    return new Response(
      JSON.stringify(paymentData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});