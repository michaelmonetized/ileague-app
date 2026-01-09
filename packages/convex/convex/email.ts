"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "iLeague <noreply@ileague.app>";

// Send welcome email
export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    isInfluencer: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const subject = args.isInfluencer
      ? "Welcome to iLeague, Creator! 🎉"
      : "Welcome to iLeague! 🎉";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 40px 32px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
                <span style="font-size: 32px;">🏆</span>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to iLeague!</h1>
            </div>
            
            <div style="padding: 40px 32px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                Hey ${args.name},
              </p>
              
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                ${
                  args.isInfluencer
                    ? "Welcome to iLeague! We're thrilled to have you join as a creator. You're now part of a platform designed to help you connect with fans, create engaging leagues, and monetize your content."
                    : "Welcome to iLeague! You've just joined the ultimate platform for connecting with your favorite influencers, joining exciting leagues, and being part of amazing communities."
                }
              </p>
              
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                Here's what you can do next:
              </p>
              
              <ul style="font-size: 16px; color: #374151; margin: 0 0 32px; padding-left: 24px;">
                ${
                  args.isInfluencer
                    ? `
                  <li style="margin-bottom: 8px;">Complete your creator profile</li>
                  <li style="margin-bottom: 8px;">Create your first league</li>
                  <li style="margin-bottom: 8px;">Set up your subscription tiers</li>
                  <li style="margin-bottom: 8px;">Start posting content</li>
                `
                    : `
                  <li style="margin-bottom: 8px;">Explore and follow creators</li>
                  <li style="margin-bottom: 8px;">Join exciting leagues</li>
                  <li style="margin-bottom: 8px;">Engage with content you love</li>
                  <li style="margin-bottom: 8px;">Support your favorite creators</li>
                `
                }
              </ul>
              
              <div style="text-align: center;">
                <a href="https://ileague.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  Get Started
                </a>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 14px; color: #64748b; margin: 0;">
                Need help? <a href="mailto:support@ileague.app" style="color: #7c3aed; text-decoration: none;">Contact our support team</a>
              </p>
              <p style="font-size: 12px; color: #94a3b8; margin: 16px 0 0;">
                © ${new Date().getFullYear()} iLeague. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject,
      html,
    });

    return null;
  },
});

// Send subscription confirmation email
export const sendSubscriptionConfirmationEmail = internalAction({
  args: {
    email: v.string(),
    subscriberName: v.string(),
    influencerName: v.string(),
    tier: v.union(v.literal("monthly"), v.literal("yearly")),
    amount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const subject = `You're now subscribed to ${args.influencerName}! 🎉`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 40px 32px; text-align: center;">
              <span style="font-size: 48px; display: block; margin-bottom: 16px;">🎉</span>
              <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Subscription Confirmed!</h1>
            </div>
            
            <div style="padding: 40px 32px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                Hey ${args.subscriberName},
              </p>
              
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                You're now subscribed to <strong>${args.influencerName}</strong>! 
                You now have access to all their exclusive content and subscriber perks.
              </p>
              
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                <p style="font-size: 14px; color: #64748b; margin: 0 0 8px;">Subscription Details</p>
                <p style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">
                  $${(args.amount / 100).toFixed(2)}/${args.tier === "yearly" ? "year" : "month"}
                </p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://ileague.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  View Exclusive Content
                </a>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                © ${new Date().getFullYear()} iLeague. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject,
      html,
    });

    return null;
  },
});

// Send new subscriber notification to creator
export const sendNewSubscriberNotificationEmail = internalAction({
  args: {
    email: v.string(),
    creatorName: v.string(),
    subscriberName: v.string(),
    tier: v.union(v.literal("monthly"), v.literal("yearly")),
    amount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const subject = `New subscriber: ${args.subscriberName} 🎉`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #22c55e, #10b981); padding: 40px 32px; text-align: center;">
              <span style="font-size: 48px; display: block; margin-bottom: 16px;">💰</span>
              <h1 style="color: #ffffff; font-size: 24px; margin: 0;">You have a new subscriber!</h1>
            </div>
            
            <div style="padding: 40px 32px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                Hey ${args.creatorName},
              </p>
              
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                Great news! <strong>${args.subscriberName}</strong> just subscribed to your channel!
              </p>
              
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                <p style="font-size: 14px; color: #64748b; margin: 0 0 8px;">Subscription Revenue</p>
                <p style="font-size: 24px; font-weight: 700; color: #22c55e; margin: 0;">
                  +$${(args.amount / 100).toFixed(2)}/${args.tier === "yearly" ? "year" : "month"}
                </p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://ileague.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  View Your Dashboard
                </a>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                © ${new Date().getFullYear()} iLeague. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject,
      html,
    });

    return null;
  },
});

// Send tip notification
export const sendTipNotificationEmail = internalAction({
  args: {
    email: v.string(),
    creatorName: v.string(),
    senderName: v.string(),
    amount: v.number(),
    message: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const subject = `${args.senderName} sent you a $${(args.amount / 100).toFixed(2)} tip! 🎁`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b, #fbbf24); padding: 40px 32px; text-align: center;">
              <span style="font-size: 48px; display: block; margin-bottom: 16px;">🎁</span>
              <h1 style="color: #ffffff; font-size: 24px; margin: 0;">You received a tip!</h1>
            </div>
            
            <div style="padding: 40px 32px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                Hey ${args.creatorName},
              </p>
              
              <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                <strong>${args.senderName}</strong> just sent you a tip to show their appreciation!
              </p>
              
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                <p style="font-size: 14px; color: #64748b; margin: 0 0 8px;">Tip Amount</p>
                <p style="font-size: 32px; font-weight: 700; color: #f59e0b; margin: 0;">
                  $${(args.amount / 100).toFixed(2)}
                </p>
                ${
                  args.message
                    ? `<p style="font-size: 14px; color: #374151; margin: 16px 0 0; font-style: italic;">"${args.message}"</p>`
                    : ""
                }
              </div>
              
              <div style="text-align: center;">
                <a href="https://ileague.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  View Your Dashboard
                </a>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                © ${new Date().getFullYear()} iLeague. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject,
      html,
    });

    return null;
  },
});
