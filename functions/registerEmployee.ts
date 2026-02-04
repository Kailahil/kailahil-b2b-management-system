import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!email.endsWith('@kailahil.com')) {
      return Response.json({ error: 'Must use @kailahil.com email' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Check if employee already exists
    const existing = await base44.asServiceRole.entities.Employee.filter({ email });
    if (existing.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password using Deno crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create employee
    const employee = await base44.asServiceRole.entities.Employee.create({
      email,
      password_hash,
      full_name,
      status: 'active'
    });

    return Response.json({ success: true, employee_id: employee.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});