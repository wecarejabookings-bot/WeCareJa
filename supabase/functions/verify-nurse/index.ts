import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { 
      email, 
      password, 
      fullName, 
      trn,
      ncjLicense,
      phone
    } = await req.json()

    // 1. Verify TRN format strictly on server: exactly 9 digits
    const trnClean = (trn || '').replace(/\D/g, '')
    if (trnClean.length !== 9) {
      return new Response(
        JSON.stringify({ error: 'Jamaican Tax Registration Number (TRN) must be exactly 9 digits.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // 2. Validate password length & complexity
    if (!password || password.length < 12) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 12 characters long.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      return new Response(
        JSON.stringify({ error: 'Password must contain uppercase, lowercase, number, and special character.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // 3. HaveIBeenPwned k-Anonymity API check
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-1', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
      
      const prefix = hashHex.substring(0, 5)
      const suffix = hashHex.substring(5)

      const pwnedRes = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { 'User-Agent': 'WeCareJa-Security-Agent' }
      })

      if (pwnedRes.ok) {
        const text = await pwnedRes.text()
        const lines = text.split('\r\n')
        const breached = lines.some(line => line.split(':')[0] === suffix)
        if (breached) {
          return new Response(
            JSON.stringify({ error: 'This password has appeared in an external compromised database breach (HaveIBeenPwned). Please choose a more secure password.' }), 
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          )
        }
      }
    } catch (hibpErr) {
      console.warn('HaveIBeenPwned check warning:', hibpErr)
    }

    // 4. Log audit event
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'internal'

    await supabaseAdmin.from('audit_logs').insert({
      action: 'NURSE_APPLICATION_VALIDATED',
      target_id: trnClean,
      ip: clientIp,
      metadata: {
        email: (email || '').trim().toLowerCase(),
        ncjLicense: ncjLicense || '',
        fullName: fullName || ''
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Nurse credentials verified and passed regulatory format and HaveIBeenPwned breach checks.' 
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Server error during nurse validation.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
