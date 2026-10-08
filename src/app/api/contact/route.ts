import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const CONTACT_TO = process.env.CONTACT_TO ?? "ericdavid4u@gmail.com";

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    const options: SMTPTransport.Options = {
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 8_000,
      socketTimeout: 12_000,
      tls: { minVersion: "TLSv1.2" },
      logger: true,
      debug: true,
    };
    return {
      transport: nodemailer.createTransport(options),
      meta: { host, port, hasUser: Boolean(user), hasPass: Boolean(pass) },
    };
  }

  return {
    transport: null,
    meta: { host: host ?? null, port: port ?? null, hasUser: Boolean(user), hasPass: Boolean(pass) },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const projectType = String(body.projectType || "").trim();
    const details = String(body.details || "").trim();

    if (!name || !email || !projectType || !details) {
      return new Response(JSON.stringify({ ok: false, error: "Missing required fields." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { transport, meta } = buildTransport();
    const subject = `New contact form submission: ${projectType}`;
    const text = `Name: ${name}\nEmail: ${email}\nProject type: ${projectType}\n\nDetails:\n${details}`;

    if (transport) {
      console.log("[contact form] verifying SMTP transport", meta);
      await transport.verify();
      console.log("[contact form] verified, sending email");
      await transport.sendMail({
        from: `"Portfolio Contact" <${meta.hasUser ? process.env.SMTP_USER : CONTACT_TO}>`,
        replyTo: email,
        to: CONTACT_TO,
        subject,
        text,
      });
      console.log("[contact form] email sent");
    } else {
      console.warn("[contact form] SMTP missing, logging instead", { meta, name, email, projectType, details });
      return new Response(JSON.stringify({ ok: false, error: "SMTP not configured", meta }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact form failed", error);
    const debug =
      process.env.NODE_ENV !== "production"
        ? {
            message: (error as Error)?.message,
            stack: (error as Error)?.stack,
          }
        : undefined;

    return new Response(JSON.stringify({ ok: false, error: "Unable to send message.", debug }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
