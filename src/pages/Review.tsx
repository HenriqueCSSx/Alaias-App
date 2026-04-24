import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Share, Quote } from 'lucide-react';
import { cn } from '../lib/utils';

export function Review() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-[#dde5da] pb-32">
      {/* TopAppBar Navigation */}
      <header className="flex justify-between items-center w-full px-6 h-16 bg-[#0a0a0a] border-b border-[#1a1a1a] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white hover:text-[#4ade80] transition-colors">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl tracking-[0.2em] font-light text-white font-serif italic">ALAIAS</h1>
        <div className="w-6 h-6" /> {/* Spacer */}
      </header>

      <main className="flex-1 px-6 pt-8 flex flex-col gap-12">
        {/* Header Section */}
        <section className="flex flex-col gap-2">
            <h2 className="font-serif text-[48px] text-white leading-[1.1] tracking-tight">Revisão da semana</h2>
            <p className="font-sans text-[12px] text-neutral-500 uppercase tracking-widest font-medium">gerada pela IA · 20–26 abr</p>
        </section>

        {/* Score Card */}
        <section className="flex flex-col items-center justify-center py-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="custom-ring w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="45" stroke="#1a1a1a" strokeWidth="2"></circle>
                    <circle cx="50" cy="50" fill="none" r="45" stroke="#4ade80" strokeDasharray="282.7" strokeDashoffset="62" strokeLinecap="round" strokeWidth="3"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-serif text-[56px] text-[#4ade80] leading-none">7.8</span>
                    <span className="font-sans text-[12px] text-neutral-500 font-medium">/10</span>
                </div>
            </div>
        </section>

        {/* Highlights "O que foi bem" */}
        <section className="flex flex-col gap-4">
            <h3 className="font-sans text-[12px] text-neutral-500 uppercase tracking-widest font-medium">O que foi bem</h3>
            <div className="flex flex-col gap-3">
                <div className="bg-[#111111] border-l-2 border-[#4ade80] p-4 flex items-center gap-4 rounded-r-lg">
                    <span className="material-symbols-outlined text-[#4ade80]" style={{ fontVariationSettings: "'FILL' 1" }}>bedtime</span>
                    <span className="font-sans text-base text-white">Consistência no sono</span>
                </div>
                <div className="bg-[#111111] border-l-2 border-[#4ade80] p-4 flex items-center gap-4 rounded-r-lg">
                    <span className="material-symbols-outlined text-[#4ade80]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                    <span className="font-sans text-base text-white">Metas financeiras atingidas</span>
                </div>
                <div className="bg-[#111111] border-l-2 border-[#4ade80] p-4 flex items-center gap-4 rounded-r-lg">
                    <span className="material-symbols-outlined text-[#4ade80]" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                    <span className="font-sans text-base text-white">Frequência de treinos alta</span>
                </div>
            </div>
        </section>

        {/* Improvement "O que melhorar" */}
        <section className="flex flex-col gap-4">
            <h3 className="font-sans text-[12px] text-neutral-500 uppercase tracking-widest font-medium">O que melhorar</h3>
            <div className="flex flex-col gap-3">
                <div className="bg-[#111111] border-l-2 border-[#f59e0b] p-4 flex items-center gap-4 rounded-r-lg">
                    <span className="material-symbols-outlined text-[#f59e0b]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                    <span className="font-sans text-base text-white">Hidratação abaixo da meta</span>
                </div>
                <div className="bg-[#111111] border-l-2 border-[#f59e0b] p-4 flex items-center gap-4 rounded-r-lg">
                    <span className="material-symbols-outlined text-[#f59e0b]" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                    <span className="font-sans text-base text-white">Tempo de tela excedido</span>
                </div>
            </div>
        </section>

        {/* Stats Recap Row */}
        <section className="grid grid-cols-4 gap-2">
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-[14px] p-3 flex flex-col items-center justify-center min-h-[80px]">
                <span className="font-serif text-[24px] text-white leading-none">85%</span>
                <span className="text-[10px] font-sans font-bold text-neutral-500 mt-1 uppercase tracking-widest">TASKS</span>
            </div>
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-[14px] p-3 flex flex-col items-center justify-center min-h-[80px]">
                <span className="font-serif text-[24px] text-white leading-none">5d</span>
                <span className="text-[10px] font-sans font-bold text-neutral-500 mt-1 uppercase tracking-widest">HABIT</span>
            </div>
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-[14px] p-3 flex flex-col items-center justify-center min-h-[80px]">
                <span className="font-serif text-[24px] text-white leading-none">7h20</span>
                <span className="text-[10px] font-sans font-bold text-neutral-500 mt-1 uppercase tracking-widest">SLEEP</span>
            </div>
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-[14px] p-3 flex flex-col items-center justify-center min-h-[80px]">
                <span className="font-serif text-[24px] text-white leading-none">12%</span>
                <span className="text-[10px] font-sans font-bold text-neutral-500 mt-1 uppercase tracking-widest">BUDGET</span>
            </div>
        </section>

        {/* IA Insight Paragraph */}
        <section className="bg-[#111111] border border-[#1a1a1a] p-8 rounded-[24px] relative">
            <Quote className="text-[#4ade80] w-8 h-8 absolute -top-4 left-6 bg-[#0a0a0a] px-1" />
            <p className="font-serif text-[24px] italic text-white leading-[1.3]">
                Sua semana demonstrou uma disciplina excepcional com as rotinas noturnas. Ao manter o foco na hidratação, você desbloqueará um nível superior de energia cognitiva para os desafios da próxima segunda-feira.
            </p>
        </section>

        {/* Next week intention */}
        <section className="flex flex-col gap-2">
            <label className="font-sans text-[12px] text-neutral-500 uppercase tracking-widest font-medium">Minha intenção para a próxima semana</label>
            <div className="border-b border-[#1a1a1a] pb-2 pt-2">
                <input 
                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-serif text-[20px] italic text-white placeholder:text-neutral-700 outline-none" 
                    placeholder="Manter o equilíbrio e foco no presente..." 
                    type="text"
                />
            </div>
        </section>

        {/* Share button */}
        <section className="pt-2 mb-12">
            <button className="w-full h-14 border border-[#4ade80] rounded-full flex items-center justify-center gap-3 hover:bg-[#4ade80]/10 active:scale-95 transition-all">
                <span className="font-sans text-[16px] font-medium text-[#4ade80]">Compartilhar revisão</span>
                <Share className="text-[#4ade80] w-5 h-5" />
            </button>
        </section>

      </main>
    </div>
  );
}
