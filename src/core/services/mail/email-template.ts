export function buildEmailSubject(type: string): string {
  return type === 'otp' ? 'Registration OTP' : type === 'link' ? 'Verification Link' : `${type}`;
}

export function buildEmailHtml(type: string, item: string): string {
  return `
            <p>You may verify your account using the ${type} below: 
                <span style="${type === 'link' ? 'font-size: 16px; font-weight: 700;' : 'font-size:24px; font-weight: 700;'}">
                ${type === 'link' ? process.env.VERIFICATION_LINK + '?verification_token=' + item : item}
                </span>
            </p>  <br>    
            <p>Regards, <br> HomeServe</p>
            `;
}
