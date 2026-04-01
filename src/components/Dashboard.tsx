import React, { useState } from 'react';
import { HealthResults, UserMetrics } from '@/utils/calculations';
import { GaugeChart } from './GaugeChart';
import { AlertTriangle, Download, RefreshCw, Activity, Zap, Scale, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { jsPDF } from 'jspdf';
import { generateAIReport, AIReport } from '@/services/aiService';

interface DashboardProps {
  results: HealthResults;
  metrics: UserMetrics;
  onRecalculate: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Dashboard({ results, metrics, onRecalculate, darkMode, toggleDarkMode }: DashboardProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReportData, setAiReportData] = useState<AIReport | null>(null);

  const handleDownload = (aiData: AIReport | null = aiReportData) => {
    const doc = new jsPDF();
    const lineHeight = 7;
    let y = 20;
    const margin = 20;
    const maxWidth = 170;

    const addText = (text: string, fontSize: number = 10, font: string = 'helvetica', style: string = 'normal', color: number[] = [0,0,0]) => {
      doc.setFont(font, style);
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }
    };

    addText("Personal Health Analytics Report", 18, 'helvetica', 'bold');
    y += 2;
    addText(`Date: ${new Date().toLocaleDateString()}`, 10);
    y += 5;

    addText("Subject Profile", 14, 'helvetica', 'bold');
    addText(`Age: ${metrics.age} years`);
    addText(`Gender: ${metrics.gender}`);
    addText(`Height: ${metrics.height} cm`);
    addText(`Weight: ${metrics.weight} kg`);
    addText(`Phenotype: ${metrics.phenotype}`);
    addText(`Activity Level: ${metrics.activityLevel}`);
    y += 5;

    addText("Metabolic Analysis", 14, 'helvetica', 'bold');
    
    let misColor = [0,0,0];
    if (results.mis >= 7) misColor = [16, 185, 129];
    else if (results.mis >= 4) misColor = [234, 179, 8];
    else misColor = [239, 68, 68];
    
    addText(`Metabolic Integrity Score (MIS): ${results.mis.toFixed(1)} / 10.0`, 12, 'helvetica', 'bold', misColor);
    addText(`Body Fat Percentage: ${results.bodyFatPercentage.toFixed(1)}%`);
    addText(`Fat-Free Mass Index (FFMI): ${results.ffmi.toFixed(1)}`);
    addText(`Waist-to-Height Ratio (WHtR): ${results.whtr.toFixed(2)}`);
    y += 5;

    addText("Body Composition", 14, 'helvetica', 'bold');
    addText(`Lean Body Mass: ${results.leanBodyMass.toFixed(1)} kg`);
    addText(`Fat Mass: ${results.fatMass.toFixed(1)} kg`);
    y += 5;

    addText("Energy & Nutrition", 14, 'helvetica', 'bold');
    addText(`Basal Metabolic Rate (BMR): ${Math.round(results.bmr)} kcal/day`);
    addText(`Total Daily Energy Expenditure (TDEE): ${Math.round(results.tdee)} kcal/day`);
    addText(`Optimal Protein Target: ${Math.round(results.proteinTarget)} g/day`);
    y += 5;

    addText("Clinical Risk Diagnostics", 14, 'helvetica', 'bold');
    if (results.riskFlags.length === 0) {
      addText("No specific metabolic flags detected.", 10, 'helvetica', 'normal', [16, 185, 129]);
    } else {
      results.riskFlags.forEach(flag => {
        addText(`• ${flag}`, 10, 'helvetica', 'normal', [239, 68, 68]);
      });
    }
    y += 10;

    if (aiData) {
      doc.addPage();
      y = 20;
      addText("AI Clinical Analysis & Coaching", 18, 'helvetica', 'bold', [16, 185, 129]);
      y += 5;
      
      addText("Motivation & Status", 14, 'helvetica', 'bold');
      addText(aiData.motivation, 10, 'helvetica', 'normal');
      y += 5;

      addText("Health Coaching", 14, 'helvetica', 'bold');
      addText(aiData.coaching, 10, 'helvetica', 'normal');
      y += 5;

      addText("Risk Assessment & Predictions", 14, 'helvetica', 'bold');
      aiData.predictions.forEach(item => addText(`• ${item}`, 10, 'helvetica', 'normal'));
      y += 5;

      addText("Precautionary Guidelines", 14, 'helvetica', 'bold');
      aiData.guidelines.forEach(item => addText(`• ${item}`, 10, 'helvetica', 'normal'));
      y += 5;

      addText("Doctor Consultation Advice", 14, 'helvetica', 'bold');
      aiData.consultationAdvice.forEach(item => addText(`• ${item}`, 10, 'helvetica', 'normal'));
      y += 5;
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Clinical Algorithm Engine v3.0 • Author: Adhiraj Battu", 105, pageHeight - 10, { align: 'center' });

    doc.save(aiData ? 'health-analytics-ai-report.pdf' : 'health-analytics-report.pdf');
  };

  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true);
    try {
      const aiData = await generateAIReport(metrics, results);
      setAiReportData(aiData);
      handleDownload(aiData);
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI insights. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const energyData = [
    { name: 'BMR', value: Math.round(results.bmr), fill: '#3b82f6' },
    { name: 'TDEE', value: Math.round(results.tdee), fill: '#8b5cf6' },
  ];

  const bodyCompData = [
    { name: 'Lean Mass', value: results.leanBodyMass, fill: '#10b981' },
    { name: 'Fat Mass', value: results.fatMass, fill: '#f43f5e' },
  ];

  const cardClass = `rounded-2xl flex flex-col relative overflow-hidden ${darkMode ? 'bg-[#111] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`;
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const textNormal = darkMode ? 'text-slate-300' : 'text-slate-600';
  const textStrong = darkMode ? 'text-white' : 'text-slate-900';

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-y-auto md:overflow-hidden custom-scrollbar">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4 sm:gap-0">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${textStrong}`}>Metabolic Dashboard</h2>
          <p className={`text-xs font-mono uppercase tracking-widest mt-1 ${textMuted}`}>Subject ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={onRecalculate} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'bg-[#1a1a1a] hover:bg-[#222] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
            <RefreshCw size={14} /> Recalculate
          </button>
          <button onClick={() => handleDownload()} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}>
            <Download size={14} /> Basic PDF
          </button>
          <button 
            onClick={handleGenerateAIReport} 
            disabled={isGeneratingAI}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] ${isGeneratingAI ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isGeneratingAI ? 'Analyzing...' : 'AI Report (PDF)'}
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 md:grid-rows-6 gap-4">
        
        {/* MIS Gauge - 3x4 */}
        <div className={`md:col-span-3 md:row-span-4 p-6 min-h-[250px] md:min-h-0 ${cardClass}`}>
          <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${textMuted}`}>Metabolic Integrity</h3>
          <div className="flex-1 flex items-center justify-center">
            <GaugeChart score={results.mis} color={results.misColor} darkMode={darkMode} />
          </div>
        </div>

        {/* Golden Trio - 6x2 */}
        <div className="md:col-span-6 md:row-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-5 justify-center ${cardClass} ${results.whtr > 0.5 ? (darkMode ? 'border-rose-500/30 bg-rose-500/5' : 'border-rose-200 bg-rose-50') : ''}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${textMuted}`}>WHtR</h3>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-mono font-bold ${textStrong}`}>{results.whtr.toFixed(2)}</span>
            </div>
            <p className={`text-[10px] mt-1 ${textMuted}`}>Waist/Height Ratio</p>
          </div>
          <div className={`p-5 justify-center ${cardClass}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${textMuted}`}>FFMI</h3>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-mono font-bold ${textStrong}`}>{results.ffmi.toFixed(1)}</span>
            </div>
            <p className={`text-[10px] mt-1 ${textMuted}`}>Fat-Free Mass Index</p>
          </div>
          <div className={`p-5 justify-center ${cardClass} ${results.bodyFatPercentage > 25 ? (darkMode ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50') : ''}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${textMuted}`}>Body Fat</h3>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-mono font-bold ${textStrong}`}>{results.bodyFatPercentage.toFixed(1)}</span>
              <span className={`text-sm font-bold ${textMuted}`}>%</span>
            </div>
            <p className={`text-[10px] mt-1 ${textMuted}`}>US Navy Method</p>
          </div>
        </div>

        {/* Diagnostics - 3x6 (Full right column) */}
        <div className={`md:col-span-3 md:row-span-6 p-6 min-h-[300px] md:min-h-0 ${cardClass}`}>
          <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-6 shrink-0 ${textMuted}`}>
            <Activity size={14} className="text-emerald-500" /> Clinical Diagnostics
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {results.riskFlags.length === 0 ? (
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Optimal Profile</p>
                    <p className={`text-[10px] leading-relaxed ${darkMode ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>No metabolic flags detected. All markers within clinical ranges.</p>
                  </div>
                </div>
              </div>
            ) : (
              results.riskFlags.map((flag, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                    <p className={`text-xs font-bold leading-relaxed ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>{flag}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Energy Balance - 3x4 */}
        <div className={`md:col-span-3 md:row-span-4 p-6 min-h-[250px] md:min-h-0 ${cardClass}`}>
          <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0 ${textMuted}`}>
            <Zap size={14} className="text-blue-500" /> Energy Expenditure
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} axisLine={false} width={35} fontWeight={700} />
                <Tooltip cursor={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }} contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '12px', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {energyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4 shrink-0">
            <div>
              <p className={`text-[9px] font-bold uppercase ${textMuted}`}>BMR</p>
              <p className={`text-sm font-mono font-bold text-blue-500`}>{Math.round(results.bmr)} <span className="text-[10px] text-blue-500/50">kcal</span></p>
            </div>
            <div className="text-right">
              <p className={`text-[9px] font-bold uppercase ${textMuted}`}>TDEE</p>
              <p className={`text-sm font-mono font-bold text-violet-500`}>{Math.round(results.tdee)} <span className="text-[10px] text-violet-500/50">kcal</span></p>
            </div>
          </div>
        </div>

        {/* Body Composition - 3x4 */}
        <div className={`md:col-span-3 md:row-span-4 p-6 min-h-[250px] md:min-h-0 ${cardClass}`}>
          <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 shrink-0 ${textMuted}`}>Body Composition</h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bodyCompData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none">
                  {bodyCompData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '12px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-2xl font-mono font-bold ${textStrong}`}>{metrics.weight.toFixed(1)}</span>
              <span className={`text-[9px] font-bold uppercase ${textMuted}`}>Total KG</span>
            </div>
          </div>
          <div className="flex justify-between mt-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className={`text-[10px] font-mono ${textNormal}`}>{results.leanBodyMass.toFixed(1)}kg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className={`text-[10px] font-mono ${textNormal}`}>{results.fatMass.toFixed(1)}kg</span>
            </div>
          </div>
        </div>

        {/* Protein Target - 3x2 */}
        <div className={`md:col-span-3 md:row-span-2 p-6 justify-center relative ${cardClass}`}>
          <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-2 ${textMuted}`}>
            <Scale size={14} className="text-emerald-500" /> Protein Target
          </h3>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-mono font-bold ${textStrong}`}>{Math.round(results.proteinTarget)}</span>
            <span className="text-xs font-bold text-emerald-500">g/day</span>
          </div>
          <p className={`text-[9px] mt-1 ${textMuted}`}>Based on {results.leanBodyMass.toFixed(1)}kg LBM</p>
        </div>

      </div>
    </div>
  );
}
