import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await base44.users.inviteUser('djnickbali2004@gmail.com', 'admin');
    return Response.json({ success: true, message: 'Admin invitation sent to djnickbali2004@gmail.com' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});