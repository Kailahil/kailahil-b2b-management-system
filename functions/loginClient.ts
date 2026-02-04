import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const signups = await base44.asServiceRole.entities.ClientSignup.filter({ email });
    
    if (signups.length === 0) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const signup = signups[0];

    if (signup.status !== 'approved') {
      return Response.json({ 
        error: signup.status === 'pending' 
          ? 'Your signup is pending approval from the media specialist team'
          : 'Your signup was rejected. Please contact support.'
      }, { status: 403 });
    }

    const password_hash = await hashPassword(password);

    if (password_hash !== signup.password_hash) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return Response.json({
      success: true,
      client: {
        id: signup.id,
        email: signup.email,
        full_name: signup.contact_name,
        business_name: signup.business_name
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});