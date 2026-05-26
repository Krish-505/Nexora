type EmailLayoutInput = {
  title: string;
  eyebrow?: string;
  body: string;
  preview?: string;
};

export const renderEmailLayout = ({
  title,
  eyebrow = 'Nexora',
  body,
  preview = '',
}: EmailLayoutInput) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;">${preview}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 20px;border-bottom:1px solid #e2e8f0;">
                <p style="margin:0 0 10px;color:#64748b;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">${eyebrow}</p>
                <h1 style="margin:0;color:#020617;font-size:24px;line-height:1.25;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.5;">
                This is an automated Nexora transactional email. Tenant branding and sender identity can be customized in a future phase.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
