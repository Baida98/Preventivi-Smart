import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck,
  Zap,
  BarChart3,
  PieChart,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConfidenceDescription, getConfidenceRecommendation } from '../ai/confidence';

interface ResultsProps {
  analysis: any;
  verdict: any;
  confidence: number; // 0.0 - 1.0
  mode: "analizza" | "stima";
}

const Results: React.FC<ResultsProps> = ({ analysis, verdict, confidence, mode }) => {
  // Fix: standardizza confidenza per display (0-100)
  const displayConfidence = Math.round(confidence * 100);
  const confidenceDesc = getConfidenceDescription(confidence);
  const confidenceRec = getConfidenceRecommendation(confidence);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Confidence Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/40 p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <Zap className="w-3 h-3" /> Affidabilità Analisi
            </div>
            <h2 className="text-3xl font-black tracking-tighter">{confidenceDesc}</h2>
            <p className="text-sm text-muted-foreground font-medium max-w-md">{confidenceRec}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="stroke-white/5"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${displayConfidence}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "stroke-primary",
                    confidence < 0.4 && "stroke-rose-500",
                    confidence >= 0.7 && "stroke-emerald-500"
                  )}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black">{displayConfidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ... Resto della UI dei risultati ... */}
      </div>
    </div>
  );
};

export default Results;
