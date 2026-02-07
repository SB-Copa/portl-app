import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@portl.com';

/**
 * Send a team invitation email via SendGrid
 */
export async function sendInvitationEmail({
  to,
  inviterName,
  tenantName,
  role,
  inviteUrl,
}: {
  to: string;
  inviterName: string;
  tenantName: string;
  role: string;
  inviteUrl: string;
}) {
  if (!apiKey) {
    console.warn('[email] SENDGRID_API_KEY not set — skipping invitation email to', to);
    console.log('[email] Invite URL:', inviteUrl);
    return;
  }

  const roleName = role.charAt(0) + role.slice(1).toLowerCase();

  await sgMail.send({
    to,
    from: { email: fromEmail, name: 'Portl' },
    subject: `You've been invited to join ${tenantName} on Portl`,
    text: `${inviterName} has invited you to join ${tenantName} as a ${roleName} on Portl.\n\nAccept your invitation: ${inviteUrl}\n\nThis invitation expires in 7 days.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited!</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${tenantName}</strong> as a <strong>${roleName}</strong> on Portl.</p>
        <p style="margin: 24px 0;">
          <a href="${inviteUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
      </div>
    `,
  });
}

/**
 * Send a password reset email via SendGrid
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  if (!apiKey) {
    console.warn('[email] SENDGRID_API_KEY not set — skipping password reset email to', to);
    console.log('[email] Reset URL:', resetUrl);
    return;
  }

  await sgMail.send({
    to,
    from: { email: fromEmail, name: 'Portl' },
    subject: 'Reset your Portl password',
    text: `You requested a password reset for your Portl account.\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your Portl account.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

/**
 * Send an order confirmation email via SendGrid
 */
export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  eventName,
  eventDate,
  venueName,
  ticketCount,
  total,
  ticketsUrl,
}: {
  to: string;
  orderNumber: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  ticketCount: number;
  total: string;
  ticketsUrl: string;
}) {
  if (!apiKey) {
    console.warn('[email] SENDGRID_API_KEY not set — skipping order confirmation email to', to);
    console.log('[email] Order:', orderNumber, '| Tickets URL:', ticketsUrl);
    return;
  }

  await sgMail.send({
    to,
    from: { email: fromEmail, name: 'Portl' },
    subject: `Order confirmed - ${eventName}`,
    text: `Your order ${orderNumber} has been confirmed!\n\nEvent: ${eventName}\nDate: ${eventDate}\nVenue: ${venueName}\nTickets: ${ticketCount}\nTotal: ${total}\n\nView your tickets: ${ticketsUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmed!</h2>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Event:</strong> ${eventName}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${eventDate}</p>
          <p style="margin: 4px 0;"><strong>Venue:</strong> ${venueName}</p>
          <p style="margin: 4px 0;"><strong>Tickets:</strong> ${ticketCount}</p>
          <p style="margin: 4px 0;"><strong>Total:</strong> ${total}</p>
        </div>
        <p style="margin: 24px 0;">
          <a href="${ticketsUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Your Tickets
          </a>
        </p>
      </div>
    `,
  });
}
