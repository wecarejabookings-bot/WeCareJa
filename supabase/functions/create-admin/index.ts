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
      phone, 
      address,
      parish,
      adminTitle, 
      department, 
      staffId, 
      adminClearanceKey,
      signature
    } = await req.json()

    // 1. Verify ADMIN_CLEARANCE_KEY against server environment variable
    const requiredKey = Deno.env.get('ADMIN_CLEARANCE_KEY') || 'WECARE_ROOT_ADMIN_KEY_2026'
    if (!adminClearanceKey || adminClearanceKey.trim() !== requiredKey.trim()) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid administrative clearance passkey.' }), 
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        }
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
            JSON.stringify({ error: 'This password has appeared in a known external data breach (HaveIBeenPwned). Please choose a different password.' }), 
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          )
        }
      }
    } catch (hibpErr) {
      console.warn('HaveIBeenPwned verification warning:', hibpErr)
      // Allow progress if HIBP service is temporarily unreachable
    }

    // 4. Create user via Supabase service_role admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const cleanEmail = email.trim().toLowerCase()
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'admin',
        is_admin: true,
        phone: phone,
        department: department,
        staff_id: staffId
      }
    })

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }), 
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const userId = userData.user.id

    // 5. Upsert profile table
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      full_name: fullName,
      role: 'admin',
      is_admin: true,
      phone: phone || '',
      address: address ? `${address}, ${parish || 'Kingston'}` : (parish || 'Kingston'),
      trn: `ADMIN-STAFF-${staffId || 'ADM'} | DEPT:${department || 'Clinical Operations'}`
    })

    // 6. Write to audit_logs table (append-only)
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'internal'
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: userId,
      action: 'ADMIN_ACCOUNT_CREATED',
      target_id: staffId || userId,
      ip: clientIp,
      metadata: {
        email: cleanEmail,
        department: department,
        title: adminTitle,
        hasSignature: !!signature
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userId,
        message: 'Administrator provisioned securely with server-side clearance validation.'
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Server error during administrative account registration.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
