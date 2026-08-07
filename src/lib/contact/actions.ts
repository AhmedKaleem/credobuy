"use server";

import { Resend } from "resend";
import {
  getContactFromEmail,
  getContactToEmail,
  isContactEmailConfigured,
} from "@/lib/config";

export type ContactFormState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | null;

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function sendContactEmailAction(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot — bots fill this; humans never see it
  if (asString(formData.get("company"))) {
    return { ok: true, message: "Thanks — we’ll get back to you soon." };
  }

  const name = asString(formData.get("name"));
  const email = asString(formData.get("email"));
  const subject = asString(formData.get("subject")) || "Contact form message";
  const body = asString(formData.get("body"));

  if (!name || name.length < 2) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!body || body.length < 10) {
    return { ok: false, error: "Please write a slightly longer message." };
  }

  if (!isContactEmailConfigured()) {
    return {
      ok: false,
      error:
        "Email is not configured yet. Add RESEND_API_KEY to .env.local and restart the server.",
    };
  }

  const to = getContactToEmail();
  const from = getContactFromEmail();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject: `[CredoBuy Contact] ${subject}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      body,
    ].join("\n"),
    html: `
      <h2>New CredoBuy contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(body)}</p>
    `,
  });

  if (error) {
    console.error("Contact email failed:", error);
    return {
      ok: false,
      error: "Could not send your message. Please try WhatsApp or email us directly.",
    };
  }

  return {
    ok: true,
    message: "Message sent — we’ll reply to your email soon.",
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
