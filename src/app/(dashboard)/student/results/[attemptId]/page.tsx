"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Trophy, Clock, Target, Download, CheckCircle, 
  XCircle, AlertCircle, ArrowLeft 
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const mockResult = {
  score: 142.5,
  totalMarks: 200,
  percentage: 71.25,
  correct: 75,
  incorrect: 15,
  skipped: 10,
  timeTaken: "52m 14s",
  rank: 124,
  totalCandidates: 1250,
  topicAnalysis: [
    { name: "Quantitative Aptitude", score: 45, max: 50 },
    { name: "General Intelligence", score: 40, max: 50 },
    { name: "English Language", score: 35, max: 50 },
    { name: "General Awareness", score: 22.5, max: 50 }
  ]
};

const COLORS = ['#10b981', '#ef4444', '#64748b']; // Correct, Incorrect, Skipped

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const pieData = [
    { name: 'Correct', value: mockResult.correct },
    { name: 'Incorrect', value: mockResult.incorrect },
    { name: 'Skipped', value: mockResult.skipped }
  ];

  const exportPDF = async () => {
    setDownloading(true);
    const input = document.getElementById("results-dashboard");
    if (input) {
      try {
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`TestNova_Result_${params.attemptId}.pdf`);
      } catch (err) {
        console.error(err);
      }
    }
    setDownloading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="results-dashboard">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/student/dashboard")} className="btn-ghost flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <button onClick={exportPDF} disabled={downloading} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> 
          {downloading ? "Exporting..." : "Download PDF"}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Performance Report</h1>
        <p className="text-muted-foreground">Detailed analysis of your recent mock test</p>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="card bg-gradient-to-br from-primary-500/10 to-primary-600/5 border-primary-500/20 text-center py-6">
          <Trophy className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Score</h3>
          <p className="font-display text-3xl font-bold mt-1 text-primary-500">
            {mockResult.score} <span className="text-lg text-muted-foreground">/ {mockResult.totalMarks}</span>
          </p>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="card text-center py-6">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Accuracy</h3>
          <p className="font-display text-3xl font-bold mt-1">
            {Math.round((mockResult.correct / (mockResult.correct + mockResult.incorrect)) * 100)}%
          </p>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className="card text-center py-6">
          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Time Taken</h3>
          <p className="font-display text-3xl font-bold mt-1">{mockResult.timeTaken}</p>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="card text-center py-6">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Est. Rank</h3>
          <p className="font-display text-3xl font-bold mt-1">
            #{mockResult.rank} <span className="text-lg text-muted-foreground">/ {mockResult.totalCandidates}</span>
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Distribution Pie Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="card lg:col-span-1">
          <h3 className="font-bold text-lg mb-4">Question Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> {mockResult.correct}</div>
            <div className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500" /> {mockResult.incorrect}</div>
            <div className="flex items-center gap-1"><AlertCircle className="w-4 h-4 text-slate-500" /> {mockResult.skipped}</div>
          </div>
        </motion.div>

        {/* Sectional Analysis Bar Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="card lg:col-span-2">
          <h3 className="font-bold text-lg mb-4">Sectional Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockResult.topicAnalysis} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      
      {/* AI Analysis Prompt (Teaser for next feature) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="card bg-gradient-to-r from-primary-500/10 to-transparent border-primary-500/30 flex items-center justify-between p-6">
        <div>
          <h3 className="font-display font-bold text-xl flex items-center gap-2">
            ✨ Generate AI Insights
          </h3>
          <p className="text-muted-foreground text-sm mt-1">Get personalized improvement tips based on your performance.</p>
        </div>
        <button onClick={() => router.push("/student/ai-planner")} className="btn-primary shrink-0">
          Analyze with AI
        </button>
      </motion.div>
    </div>
  );
}
