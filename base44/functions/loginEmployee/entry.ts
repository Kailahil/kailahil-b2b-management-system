import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Find employee by email
    const employees = await base44.asServiceRole.entities.Employee.filter({ email });
    if (employees.length === 0) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const employee = employees[0];

    // Verify password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (password_hash !== employee.password_hash) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (employee.status !== 'active') {
      return Response.json({ error: 'Account is inactive' }, { status: 403 });
    }

    return Response.json({ 
      success: true, 
      employee: {
        id: employee.id,
        email: employee.email,
        full_name: employee.full_name
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});