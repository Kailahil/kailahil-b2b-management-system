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
    const { business_name, contact_name, email, password, confirm_password } = body;

    if (!business_name || !contact_name || !email || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password !== confirm_password) {
      return Response.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Check if email already exists
    const existing = await base44.asServiceRole.entities.ClientSignup.filter({ email });
    if (existing.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 400 });
    }

    const password_hash = await hashPassword(password);

    const signup = await base44.asServiceRole.entities.ClientSignup.create({
      business_name,
      contact_name,
      email,
      password_hash,
      status: 'pending'
    });

    return Response.json({
      success: true,
      message: 'Signup request created. Awaiting media specialist approval.',
      signup_id: signup.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});