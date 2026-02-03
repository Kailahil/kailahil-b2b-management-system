import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user already has an agency
        if (user.agency_id) {
            return Response.json({ 
                success: true, 
                message: 'Agency already initialized',
                agency_id: user.agency_id 
            });
        }

        // Create the agency
        const agency = await base44.asServiceRole.entities.Agency.create({
            name: 'AgencyFlow',
            timezone: 'America/Los_Angeles'
        });

        // Update current user with agency_id and role
        await base44.asServiceRole.entities.User.update(user.id, {
            agency_id: agency.id,
            user_role: 'admin',
            status: 'active'
        });

        return Response.json({
            success: true,
            message: 'Agency initialized successfully',
            agency_id: agency.id,
            agency_name: agency.name
        });
    } catch (error) {
        console.error('Initialization error:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});