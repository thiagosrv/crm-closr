import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationCode(email: string, code: string, name?: string) {
  const from = process.env.EMAIL_FROM ?? "CLOSR <onboarding@resend.dev>"

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `${code} — Seu código de verificação CLOSR`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border:2px solid #0F2044;padding:32px;">
        <div style="margin-bottom:24px;">
          <span style="font-size:28px;font-weight:900;color:#0F2044;letter-spacing:-2px;">CLOSR</span>
          <span style="display:inline-block;margin-left:8px;background:#84CC16;color:#0F2044;font-size:10px;font-weight:900;padding:2px 8px;text-transform:uppercase;">CRM</span>
        </div>
        <h1 style="font-size:20px;font-weight:900;color:#0F2044;margin-bottom:8px;">
          ${name ? `Olá, ${name}!` : "Olá!"} 👋
        </h1>
        <p style="color:#6B7280;font-size:14px;margin-bottom:24px;">
          Use o código abaixo para confirmar seu e-mail e criar sua conta no CLOSR.
        </p>
        <div style="background:#F4F4F4;border:2px solid #0F2044;box-shadow:4px 4px 0 #84CC16;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#0F2044;">${code}</span>
        </div>
        <p style="color:#6B7280;font-size:12px;">
          O código expira em <strong>10 minutos</strong>. Se você não solicitou isso, ignore este e-mail.
        </p>
        <hr style="border:1px solid #E5E7EB;margin:24px 0;" />
        <p style="color:#9CA3AF;font-size:11px;text-align:center;">
          CLOSR CRM — Feche mais negócios, com menos esforço.
        </p>
      </div>
    `,
  })

  if (error) throw new Error(`Falha ao enviar e-mail: ${error.message}`)
}
