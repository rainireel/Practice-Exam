import React from 'react';
import {
  Code2,
  Binary,
  Radio,
  Cpu,
  Database,
  Network,
  BookOpen,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Binary,
  Radio,
  Cpu,
  Database,
  Network,
  BookOpen,
  Terminal,
  Shield,
  Layers,
  Sparkles,
};

interface SubjectIconProps {
  name: string;
  className?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[name] || BookOpen;
  return <IconComponent className={className} />;
};

export const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; badge: string; glow: string }> = {
  indigo: {
    bg: 'bg-indigo-50 hover:bg-indigo-100/70',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    glow: 'from-indigo-600 to-indigo-700',
  },
  emerald: {
    bg: 'bg-emerald-50 hover:bg-emerald-100/70',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    glow: 'from-emerald-600 to-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50 hover:bg-amber-100/70',
    text: 'text-amber-600',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    glow: 'from-amber-600 to-amber-700',
  },
  violet: {
    bg: 'bg-violet-50 hover:bg-violet-100/70',
    text: 'text-violet-600',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    glow: 'from-violet-600 to-violet-700',
  },
  cyan: {
    bg: 'bg-cyan-50 hover:bg-cyan-100/70',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-800',
    glow: 'from-cyan-600 to-cyan-700',
  },
  rose: {
    bg: 'bg-rose-50 hover:bg-rose-100/70',
    text: 'text-rose-600',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    glow: 'from-rose-600 to-rose-700',
  },
};
