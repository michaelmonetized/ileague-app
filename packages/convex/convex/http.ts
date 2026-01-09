"use node";

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import Stripe from "stripe";
import type { WebhookEvent } from "@clerk/backend";

const http = httpRouter();

// =====================
// Clerk Webhooks
// =====================

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error verifying webhook", { status: 400 });
    }

    const eventType = evt.type;

    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;
        
        const email = email_addresses[0]?.email_address;
        if (!email) {
          return new Response("No email address", { status: 400 });
        }

        // Generate username if not provided
        const finalUsername = username ?? email.split("@")[0] ?? `user_${id.slice(-8)}`;

        await ctx.runMutation(internal.users.createUser, {
          clerkId: id,
          email,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          username: finalUsername,
          imageUrl: image_url ?? undefined,
        });
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        
        const email = email_addresses[0]?.email_address;

        await ctx.runMutation(internal.users.updateUserByClerkId, {
          clerkId: id,
          email: email ?? undefined,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          imageUrl: image_url ?? undefined,
        });
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;
        if (id) {
          await ctx.runMutation(internal.users.deleteUserByClerkId, {
            clerkId: id,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response("OK", { status: 200 });
  }),
});

// =====================
// Stripe Webhooks
// =====================

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      return new Response("Missing Stripe configuration", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const body = await request.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Error verifying Stripe webhook:", err);
      return new Response("Error verifying webhook", { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const metadata = session.metadata;
          if (!metadata?.subscriberId || !metadata?.influencerId) {
            console.error("Missing metadata in checkout session");
            break;
          }

          await ctx.runMutation(internal.subscriptions.createSubscription, {
            subscriberId: metadata.subscriberId as any,
            influencerId: metadata.influencerId as any,
            tier: subscription.items.data[0]?.price.recurring?.interval === "year" ? "yearly" : "monthly",
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: subscription.current_period_start * 1000,
            currentPeriodEnd: subscription.current_period_end * 1000,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        let status: "active" | "canceled" | "expired" = "active";
        if (subscription.status === "canceled") {
          status = "canceled";
        } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
          status = "expired";
        }

        await ctx.runMutation(internal.subscriptions.updateSubscriptionStatus, {
          stripeSubscriptionId: subscription.id,
          status,
          currentPeriodEnd: subscription.current_period_end * 1000,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await ctx.runMutation(internal.subscriptions.updateSubscriptionStatus, {
          stripeSubscriptionId: subscription.id,
          status: "canceled",
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          await ctx.runMutation(internal.subscriptions.updateSubscriptionStatus, {
            stripeSubscriptionId: subscription.id,
            status: "active",
            currentPeriodEnd: subscription.current_period_end * 1000,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          await ctx.runMutation(internal.subscriptions.updateSubscriptionStatus, {
            stripeSubscriptionId: invoice.subscription as string,
            status: "expired",
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return new Response("OK", { status: 200 });
  }),
});

// =====================
// Health Check
// =====================

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
