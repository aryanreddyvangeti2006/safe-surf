'use client';

import React, { useState } from 'react';
import { ScanReport } from '@/lib/types';
import RiskGauge from './RiskGauge';
import AiChatbot from './AiChatbot';
import { api } from '@/lib/api';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, FileText, Download, Bookmark, Share2,
  Globe, Lock, Server, ArrowRight, Code2, LayoutList, MapPin, ExternalLink, Cpu
} from 'lucide-react';

interface ReportViewProps {
  report: ScanReport;
  onBookmarkToggle?: (isSaved: boolean) => void;
}

export default function ReportView({ report, onBookmarkToggle }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'headers' | 'threat' | 'chat'>('overview');
  const [isSaved, setIsSaved] = useState(report.is_saved);

  const modules = report.report_data?.modules;
  const execTime = report.report_data?.execution_time_seconds || 1.25;

  const handleToggleBookmark = async () => {
    try {
      const res = await api.toggleSaveReport(report.id);
      setIsSaved(res.is_saved);
      if (onBookmarkToggle) onBookmarkToggle(res.is_saved);
    } catch (err) {
      alert('Login required to save reports.');
    }
  };

  const pdfDownloadUrl = api.getExportPdfUrl(report.id);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-semibold">
                SCAN REPORT #{report.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(report.created_at).toLocaleString()}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2 break-all">
              <Globe className="w-7 h-7 text-cyan-400 shrink-0" />
              {report.url}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Domain: <strong className="text-slate-200">{report.domain}</strong></span>
              <span>•</span>
              <span>Scan Duration: <strong className="text-cyan-400">{execTime}s</strong></span>
              <span>•</span>
              <span>10 Modules Executed</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <RiskGauge score={report.risk_score} status={report.status} size={130} />
            
            <div className="flex flex-col gap-2">
              <a
                href={pdfDownloadUrl}
                download
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/20 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </a>
              <button
                onClick={handleToggleBookmark}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {isSaved ? 'Bookmarked' : 'Save Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Overview & AI Summary
        </button>

        <button
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'technical'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          DNS, WHOIS & SSL
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'headers'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          Security Headers & HTML
        </button>

        <button
          onClick={() => setActiveTab('threat')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'threat'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Threat Intelligence
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          Ask SafeSurf AI Chat
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Explanation */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Plain-English AI Risk Analysis
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {report.summary || 'Analyzing domain heuristics and risk factors...'}
            </div>

            {/* Deductions / Risk Factors */}
            {modules?.ai_risk_engine?.deductions && modules.ai_risk_engine.deductions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Identified Risk Factors (-{modules.ai_risk_engine.breakdown.total_deductions} pts)
                </h4>
                <div className="space-y-2">
                  {modules.ai_risk_engine.deductions.map((d, i) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-rose-300">{d.factor}: </span>
                        <span className="text-slate-300">{d.reason}</span>
                      </div>
                      <span className="font-mono font-bold text-rose-400 shrink-0 ml-2">-{d.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positive Trust Signals */}
            {modules?.ai_risk_engine?.bonuses && modules.ai_risk_engine.bonuses.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Positive Trust Signals (+{modules.ai_risk_engine.breakdown.total_bonuses} pts)
                </h4>
                <div className="space-y-2">
                  {modules.ai_risk_engine.bonuses.map((b, i) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-emerald-300">{b.factor}: </span>
                        <span className="text-slate-300">{b.reason}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">+{b.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics & Hosting */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Server & Hosting Info
              </h3>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">IP Address</span>
                  <span className="font-mono font-semibold text-cyan-300">{modules?.hosting?.ip_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Location</span>
                  <span className="font-semibold text-slate-200">{modules?.hosting?.city}, {modules?.hosting?.country}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">ISP</span>
                  <span className="font-semibold text-slate-200">{modules?.hosting?.isp || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">ASN</span>
                  <span className="font-mono text-slate-300">{modules?.hosting?.asn || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Redirect Flow */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-cyan-400" />
                Redirect Hops ({modules?.redirects?.hop_count || 1})
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {modules?.redirects?.redirect_chain?.map((hop, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-cyan-400 font-bold">Hop #{hop.hop}</span>
                    <span className="truncate text-slate-300 flex-1">{hop.url}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[10px]">
                      {hop.status_code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: DNS, WHOIS & SSL */}
      {activeTab === 'technical' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SSL Certificate */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              SSL/TLS Certificate Inspection
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Validity Status</span>
                <span className={`font-bold ${modules?.ssl?.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {modules?.ssl?.valid ? 'VALID CERTIFICATE' : 'INVALID / EXPIRED'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Issuer</span>
                <span className="font-semibold text-slate-200">{modules?.ssl?.issuer}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">TLS Protocol Version</span>
                <span className="font-mono text-cyan-300">{modules?.ssl?.tls_version}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Expiration Date</span>
                <span className="font-mono text-slate-200">{modules?.ssl?.expiry_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Self-Signed Check</span>
                <span className="font-semibold text-slate-200">{modules?.ssl?.is_self_signed ? 'Yes (Untrusted)' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* WHOIS Metadata */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              WHOIS Domain Metadata
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Domain Age</span>
                <span className="font-bold text-cyan-300">
                  {modules?.whois?.domain_age_days ? `${modules.whois.domain_age_days} Days (${(modules.whois.domain_age_days / 365).toFixed(1)} Yrs)` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Registrar</span>
                <span className="font-semibold text-slate-200">{modules?.whois?.registrar}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Registration Date</span>
                <span className="font-mono text-slate-200">{modules?.whois?.creation_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Expiry Date</span>
                <span className="font-mono text-slate-200">{modules?.whois?.expiration_date || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* DNS Records Table */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <LayoutList className="w-5 h-5 text-cyan-400" />
              DNS Resolution Records
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Resolved Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {modules?.dns?.records && Object.entries(modules.dns.records).map(([type, records]) => (
                    <tr key={type} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-cyan-400">{type}</td>
                      <td className="p-3 text-slate-300">
                        {records.length > 0 ? (
                          <div className="space-y-1">
                            {records.map((r, i) => (
                              <div key={i}>{r}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No records found</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security Headers & HTML */}
      {activeTab === 'headers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Headers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Security Headers Grade
              </h3>
              <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-extrabold text-base border border-cyan-500/30">
                Grade: {modules?.security_headers?.grade}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {modules?.security_headers?.header_grades && Object.entries(modules.security_headers.header_grades).map(([header, val]) => (
                <div key={header} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{header}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] ${val.includes('Present') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Static HTML Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              HTML DOM Heuristics & Script Findings
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Hidden Iframes</span>
                <span className="font-mono font-bold text-slate-200">{modules?.html_security?.findings?.hidden_iframes}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Obfuscated JavaScript</span>
                <span className={`font-mono font-bold ${modules?.html_security?.findings?.obfuscated_js ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {modules?.html_security?.findings?.obfuscated_js ? 'DETECTED' : 'Clean'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Browser Crypto Miner</span>
                <span className={`font-mono font-bold ${modules?.html_security?.findings?.crypto_miners ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {modules?.html_security?.findings?.crypto_miners ? 'DETECTED' : 'Clean'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">JavaScript Location Redirects</span>
                <span className="font-mono font-bold text-slate-200">
                  {modules?.html_security?.findings?.js_redirects ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Threat Intelligence */}
      {activeTab === 'threat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Multi-Provider Threat Intelligence Feeds
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Flagged Vendors: <strong className="text-rose-400">{modules?.threat_intelligence?.flagged_count || 0}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules?.threat_intelligence?.providers && Object.entries(modules.threat_intelligence.providers).map(([provider, res]) => {
              const isMal = res.includes('Malicious') || res.includes('Flagged') || res.includes('Phishing');
              return (
                <div key={provider} className={`p-4 rounded-xl border space-y-2 ${isMal ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="text-xs font-bold text-slate-200">{provider}</div>
                  <div className={`text-xs font-mono font-bold ${isMal ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {res}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Ask SafeSurf AI Chat */}
      {activeTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <AiChatbot reportData={report} />
        </div>
      )}
    </div>
  );
}
