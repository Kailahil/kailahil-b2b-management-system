import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientReports() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const clientBusinessList = await base44.entities.ClientBusiness.filter({ 
          user_id: currentUser.id 
        });

        if (clientBusinessList.length > 0) {
          const businessList = await base44.entities.Business.filter({ 
            id: clientBusinessList[0].business_id 
          });
          if (businessList.length > 0) {
            setBusiness(businessList[0]);

            const reportsData = await base44.entities.Report.filter({
              business_id: businessList[0].id,
              status: ['finalized', 'sent']
            }, '-report_month', 12);
            setReports(reportsData);
          }
        }
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-10">
          <div className="inline-block mb-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Reports</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
            Monthly Reports
          </h1>
          <p className="text-[#6b7055] text-lg">
            Official proof of work — shareable with stakeholders and partners
          </p>
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#e8e6de]/50 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#2d3319] text-lg">
                        {new Date(report.report_month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Report
                      </h3>
                      <p className="text-sm text-[#6b7055] mt-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Generated {new Date(report.created_date).toLocaleDateString()}
                      </p>
                      {report.executive_summary && (
                        <p className="text-sm text-[#6b7055] mt-2 line-clamp-2">{report.executive_summary}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] text-white">
                      {report.status === 'sent' ? 'Sent' : 'Ready'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#e8e6de] hover:bg-[#f5f3ed]"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-[#e8e6de]/50">
            <FileText className="w-16 h-16 mx-auto text-[#d4d2c8] mb-6" />
            <h3 className="text-2xl font-bold text-[#2d3319] mb-3">No Reports Yet</h3>
            <p className="text-[#6b7055] text-lg max-w-md mx-auto">
              Monthly reports will be generated automatically after your first 30 days of work with the team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}