"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Create a Stripe customer for a user
export const createCustomer = internalAction({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    userId: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const customer = await stripe.customers.create({
      email: args.email,
      name: args.name,
      metadata: {
        userId: args.userId,
      },
    });

    return customer.id;
  },
});

// Create a checkout session for subscription
export const createCheckoutSession = action({
  args: {
    influencerId: v.id("users"),
    tier: v.union(v.literal("monthly"), v.literal("yearly")),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get price IDs from environment
    const priceId =
      args.tier === "yearly"
        ? process.env.STRIPE_PRICE_SUBSCRIPTION_YEARLY
        : process.env.STRIPE_PRICE_SUBSCRIPTION_MONTHLY;

    if (!priceId) {
      throw new Error("Price not configured");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      metadata: {
        subscriberId: identity.subject,
        influencerId: args.influencerId,
        tier: args.tier,
      },
      subscription_data: {
        metadata: {
          subscriberId: identity.subject,
          influencerId: args.influencerId,
          tier: args.tier,
        },
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
  },
});

// Create a payment intent for a tip
export const createTipPaymentIntent = action({
  args: {
    influencerId: v.id("users"),
    amount: v.number(), // Amount in cents
    message: v.optional(v.string()),
  },
  returns: v.object({
    clientSecret: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    if (args.amount < 100) {
      throw new Error("Minimum tip is $1");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: args.amount,
      currency: "usd",
      metadata: {
        type: "tip",
        senderId: identity.subject,
        recipientId: args.influencerId,
        message: args.message ?? "",
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Failed to create payment intent");
    }

    return { clientSecret: paymentIntent.client_secret };
  },
});

// Create a Stripe Connect onboarding link
export const createConnectOnboardingLink = action({
  args: {
    refreshUrl: v.string(),
    returnUrl: v.string(),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Create or get the Connect account
    const account = await stripe.accounts.create({
      type: "express",
      metadata: {
        userId: identity.subject,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: args.refreshUrl,
      return_url: args.returnUrl,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  },
});

// Get Stripe Connect dashboard link
export const getConnectDashboardLink = action({
  args: {
    accountId: v.string(),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const loginLink = await stripe.accounts.createLoginLink(args.accountId);

    return { url: loginLink.url };
  },
});

// Cancel a subscription
export const cancelSubscription = action({
  args: {
    subscriptionId: v.string(),
    immediately: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    if (args.immediately) {
      await stripe.subscriptions.cancel(args.subscriptionId);
    } else {
      await stripe.subscriptions.update(args.subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    return null;
  },
});

// Get subscription details
export const getSubscription = action({
  args: {
    subscriptionId: v.string(),
  },
  returns: v.object({
    status: v.string(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const subscription = await stripe.subscriptions.retrieve(args.subscriptionId);

    return {
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end * 1000,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  },
});
