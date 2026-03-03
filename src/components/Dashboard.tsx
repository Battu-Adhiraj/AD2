import React, { useRef } from 'react';
import { HealthResults, UserMetrics } from '@/utils/calculations';
import { GaugeChart } from './GaugeChart';
import { MetricCard } from './MetricCard';
import { AlertTriangle, Download, Activity, Zap, Scale, ArrowLeft, RefreshCw, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import jsPDF from 'jspdf';

interface DashboardProps {
  results: HealthResults;
  metrics: UserMetrics;
  onRecalculate: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Dashboard({ results, metrics, onRecalculate, darkMode, toggleDarkMode }: DashboardProps) {
  const handleDownload = () => {
    const doc = new jsPDF();
    const lineHeight = 7;
    let y = 20;

    // Helper for text
    const addText = (text: string, x: number, fontSize: number = 10, font: string = 'helvetica', style: string = 'normal') => {
      doc.setFont(font, style);
      doc.setFontSize(fontSize);
      doc.text(text, x, y);
      y += lineHeight;
    };

    // Header
    addText("Personal Health Analytics Report", 20, 18, 'helvetica', 'bold');
    y += 5;
    addText(`Date: ${new Date().toLocaleDateString()}`, 20, 10);
    y += 5;

    // Section 1: User Profile
    addText("Subject Profile", 20, 14, 'helvetica', 'bold');
    addText(`Age: ${metrics.age} years`, 20);
    addText(`Gender: ${metrics.gender}`, 20);
    addText(`Height: ${metrics.height} cm`, 20);
    addText(`Weight: ${metrics.weight} kg`, 20);
    addText(`Phenotype: ${metrics.phenotype}`, 20);
    addText(`Activity Level: ${metrics.activityLevel}`, 20);
    y += 5;

    // Section 2: Key Metrics
    addText("Metabolic Analysis", 20, 14, 'helvetica', 'bold');
    addText(`Metabolic Integrity Score (MIS): ${results.mis.toFixed(1)} / 10.0`, 20, 12, 'helvetica', 'bold');
    
    if (results.mis >= 7) doc.setTextColor(16, 185, 129); // Emerald
    else if (results.mis >= 4) doc.setTextColor(234, 179, 8); // Yellow
    else doc.setTextColor(239, 68, 68); // Red
    
    doc.setTextColor(0, 0, 0);

    addText(`Body Fat Percentage: ${results.bodyFatPercentage.toFixed(1)}%`, 20);
    addText(`Fat-Free Mass Index (FFMI): ${results.ffmi.toFixed(1)}`, 20);
    addText(`Waist-to-Height Ratio (WHtR): ${results.whtr.toFixed(2)}`, 20);
    y += 5;

    // Section 3: Body Composition
    addText("Body Composition", 20, 14, 'helvetica', 'bold');
    addText(`Lean Body Mass: ${results.leanBodyMass.toFixed(1)} kg`, 20);
    addText(`Fat Mass: ${results.fatMass.toFixed(1)} kg`, 20);
    y += 5;

    // Section 4: Energy & Nutrition
    addText("Energy & Nutrition", 20, 14, 'helvetica', 'bold');
    addText(`Basal Metabolic Rate (BMR): ${Math.round(results.bmr)} kcal/day`, 20);
    addText(`Total Daily Energy Expenditure (TDEE): ${Math.round(results.tdee)} kcal/day`, 20);
    addText(`Optimal Protein Target: ${Math.round(results.proteinTarget)} g/day`, 20);
    y += 5;

    // Section 5: Risk Diagnostics
    addText("Clinical Risk Diagnostics", 20, 14, 'helvetica', 'bold');
    if (results.riskFlags.length === 0) {
      doc.setTextColor(16, 185, 129); // Emerald
      addText("No specific metabolic flags detected.", 20);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setTextColor(239, 68, 68); // Red
      results.riskFlags.forEach(flag => {
        addText(`• ${flag}`, 20);
      });
      doc.setTextColor(0, 0, 0);
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Clinical Algorithm Engine v1.0 • Author: Adhiraj Battu", 105, pageHeight - 10, { align: 'center' });

    doc.save('health-analytics-report.pdf');
  };

  const energyData = [
    { name: 'BMR', value: Math.round(results.bmr), fill: '#3b82f6' },
    { name: 'TDEE', value: Math.round(results.tdee), fill: '#8b5cf6' },
  ];

  const bodyCompData = [
    { name: 'Lean Mass', value: results.leanBodyMass, fill: '#10b981' },
    { name: 'Fat Mass', value: results.fatMass, fill: '#f43f5e' },
  ];

  return (
    <div className="h-screen w-screen bg-black text-slate-200 overflow-hidden flex flex-col">
      {/* Header - Fixed Height */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={onRecalculate}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <RefreshCw size={16} />
            Recalculate
          </button>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-slate-100 hover:bg-white text-black px-3 py-1.5 rounded-md font-medium text-xs transition-colors shadow-lg shadow-slate-900/50"
        >
          <Download size={14} />
          Export PDF
        </button>
      </div>

      {/* Main Grid Content - Fills remaining height */}
      <div className="flex-1 p-4 grid grid-cols-12 grid-rows-6 gap-4 min-h-0">
        
        {/* 1. Gauge Chart (Top Left) - 3 cols, 3 rows */}
        <div className="col-span-3 row-span-3 bg-slate-900/50 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 to-slate-900/80 pointer-events-none" />
          <div className="p-4 z-10 text-center">
             <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider">Metabolic Integrity</h3>
          </div>
          <div className="flex-1 flex items-center justify-center -mt-4">
             <GaugeChart score={results.mis} color={results.misColor} />
          </div>
        </div>

        {/* 2. Golden Trio (Top Middle) - 6 cols, 1 row */}
        <div className="col-span-6 row-span-1 grid grid-cols-3 gap-4">
           <MetricCard
              title="WHtR"
              value={results.whtr.toFixed(2)}
              subtitle="Waist/Height"
              className={results.whtr > 0.5 ? "border-rose-900/50 bg-rose-950/10" : ""}
            />
            <MetricCard
              title="FFMI"
              value={results.ffmi.toFixed(1)}
              subtitle="Fat-Free Index"
            />
            <MetricCard
              title="Body Fat %"
              value={results.bodyFatPercentage.toFixed(1)}
              unit="%"
              subtitle="US Navy"
              className={results.bodyFatPercentage > 25 ? "border-amber-900/50 bg-amber-950/10" : ""}
            />
        </div>

        {/* 3. Risk Panel (Top Right) - 3 cols, 6 rows (Full Height Sidebar) */}
        <div className="col-span-3 row-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
           <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4 shrink-0">
              <Activity size={14} className="text-rose-500" />
              Diagnostics
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {results.riskFlags.length === 0 ? (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg">
                  <p className="text-xs font-medium text-emerald-300 mb-1">Optimal Profile</p>
                  <p className="text-[10px] text-emerald-500/70 leading-tight">No metabolic flags detected.</p>
                </div>
              ) : (
                results.riskFlags.map((flag, idx) => (
                  <div key={idx} className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={12} className="text-rose-400 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-rose-300 leading-tight">{flag}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Footer in Sidebar */}
            <div className="mt-4 pt-4 border-t border-slate-800 shrink-0">
               <p className="text-[10px] text-slate-600 font-mono text-center">
                 v1.0 • Adhiraj Battu
               </p>
            </div>
        </div>

        {/* 4. Energy Balance (Middle Left) - 3 cols, 3 rows */}
        <div className="col-span-3 row-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" />
                Energy
              </h3>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyData} layout="vertical" margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={30} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {energyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-center shrink-0">
              <div>
                <p className="text-[10px] text-slate-500">BMR</p>
                <p className="text-sm font-bold text-blue-400">{Math.round(results.bmr)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">TDEE</p>
                <p className="text-sm font-bold text-violet-400">{Math.round(results.tdee)}</p>
              </div>
            </div>
        </div>

        {/* 5. Protein (Middle Middle) - 3 cols, 2 rows */}
        <div className="col-span-3 row-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-20 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
             <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
                <Scale size={14} className="text-emerald-500" />
                Protein Target
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white tracking-tighter">{Math.round(results.proteinTarget)}</span>
                <span className="text-sm font-medium text-emerald-500">g/day</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Based on {results.leanBodyMass.toFixed(1)}kg LBM
              </p>
        </div>

        {/* 6. Body Comp (Middle Right-ish) - 3 cols, 3 rows */}
        <div className="col-span-3 row-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
             <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 shrink-0">Composition</h3>
             <div className="flex-1 min-h-0 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={bodyCompData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bodyCompData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }} />
                 </PieChart>
               </ResponsiveContainer>
               {/* Center Text Overlay */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-500">{results.bodyFatPercentage.toFixed(0)}%</span>
               </div>
             </div>
             <div className="flex justify-between mt-2 shrink-0 px-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-400">{results.leanBodyMass.toFixed(0)}kg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] text-slate-400">{results.fatMass.toFixed(0)}kg</span>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}
