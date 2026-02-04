import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ClientSignupApprovals() {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const loadSignups = async () => {
      try {
        const pendingSignups = await base44.entities.ClientSignup.filter({
          status: 'pending'
        }, '-created_date');
        setSignups(pendingSignups);
      } catch (error) {
        console.error('Failed to load signups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSignups();
  }, []);

  const handleApprove = async (signup) => {
    try {
      setProcessingId(signup.id);
      const currentUser = await base44.auth.me();

      // 1. Update ClientSignup status
      await base44.entities.ClientSignup.update(signup.id, {
        status: 'approved',
        approved_by_user_id: currentUser.id,
        approved_at: new Date().toISOString()
      });

      // 2. Create a new Business record
      const newBusiness = await base44.entities.Business.create({
        agency_id: currentUser.agency_id,
        name: signup.business_name,
        status: 'onboarding',
        primary_media_user_id: currentUser.id
      });

      // 3. Create ClientBusiness link
      await base44.entities.ClientBusiness.create({
        agency_id: currentUser.agency_id,
        user_id: signup.id,
        business_id: newBusiness.id
      });

      // 4. Create User record for the client
      await base44.users.inviteUser(signup.email, 'user');

      setSignups(prev => prev.filter(s => s.id !== signup.id));
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (signup) => {
    const reason = rejectionReasons[signup.id];
    if (!reason) return;

    try {
      setProcessingId(signup.id);
      await base44.entities.ClientSignup.update(signup.id, {
        status: 'rejected',
        rejected_reason: reason
      });
      setSignups(prev => prev.filter(s => s.id !== signup.id));
      setRejectionReasons(prev => ({ ...prev, [signup.id]: '' }));
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2d3319] mb-2">Client Signup Requests</h1>
          <p className="text-[#6b7055] text-lg">Review and approve pending client signups</p>
        </div>

        {signups.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-[#e8e6de]/50">
            <CardContent className="pt-12 pb-12 text-center">
              <Clock className="w-12 h-12 text-[#a8b88c] mx-auto mb-4 opacity-50" />
              <p className="text-[#6b7055] text-lg">No pending signup requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {signups.map(signup => (
              <Card key={signup.id} className="bg-white/80 backdrop-blur-sm border-[#e8e6de]/50 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-bold text-[#6b7055]">Business Name</label>
                      <p className="text-[#2d3319] font-medium mt-1">{signup.business_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#6b7055]">Contact Name</label>
                      <p className="text-[#2d3319] font-medium mt-1">{signup.contact_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#6b7055]">Email</label>
                      <p className="text-[#2d3319] font-medium mt-1">{signup.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#6b7055]">Status</label>
                      <p className="text-[#2d3319] font-medium mt-1 capitalize bg-yellow-100 text-yellow-800 px-3 py-1 rounded w-fit">Pending</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#e8e6de]">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(signup)}
                        disabled={processingId === signup.id}
                        className="flex-1 bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] hover:from-[#6d7d51] hover:to-[#5f6f43] text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {processingId === signup.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleReject(signup)}
                        disabled={processingId === signup.id || !rejectionReasons[signup.id]}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Rejection reason (if rejecting)..."
                      value={rejectionReasons[signup.id] || ''}
                      onChange={(e) => setRejectionReasons(prev => ({ ...prev, [signup.id]: e.target.value }))}
                      className="min-h-20 border-[#e8e6de]"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}