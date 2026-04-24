import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { ArrowLeft, User, Mail, Lock, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'register_step1' | 'register_step2' | 'register_step3' | 'forgot_password' | 'forgot_password_verify' | 'forgot_password_reset';

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { setAuthenticated, setUserName, isAuthenticated } = useAppStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setErrorMsg('');
    setLoading(true);

    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUserName(data.user.user_metadata?.nickname || email.split('@')[0]);
          setAuthenticated(true);
          navigate('/');
        }
      } else {
        // Fallback local login if no Supabase keys are provided
        setUserName(email.split('@')[0]);
        setAuthenticated(true);
        navigate('/');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nickname) return;
    
    setErrorMsg('');
    setLoading(true);

    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              nickname: nickname,
            }
          }
        });
        
        if (error) throw error;
      }
      setMode('register_step3');
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao fazer login com o Google');
      setLoading(false);
    }
  };

  const goBack = () => {
    if (mode === 'register_step2') {
        setMode('register_step1');
    } else if (mode === 'forgot_password_verify') {
        setMode('forgot_password');
    } else if (mode === 'forgot_password_reset') {
        setMode('forgot_password_verify');
    } else {
        setMode('login');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0a0a0a]">
        <div className="w-full max-w-lg min-h-screen sm:min-h-[844px] bg-[#0a0a0a] flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Top Area (approx 20%) */}
            <header className="h-[20vh] sm:h-[180px] w-full flex flex-col items-center justify-center px-6 relative">
                {mode !== 'login' && (
                    <button 
                        onClick={goBack}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#111111] border border-[#1a1a1a] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#dde5da]" />
                    </button>
                )}
                
                {mode === 'forgot_password_verify' ? (
                     <div className="flex flex-col items-center">
                        <div className="mb-4">
                            <svg fill="none" height="48" stroke="#4ade80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="48">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <h1 className="font-serif italic text-xl tracking-tight text-white uppercase">ALAIAS</h1>
                     </div>
                ) : mode === 'forgot_password_reset' ? (
                    <div className="flex flex-col items-center">
                        <div className="mb-4">
                            <span className="material-symbols-outlined text-[48px] text-[#4ade80]" style={{ fontVariationSettings: "'wght' 200" }}>
                                verified_user
                            </span>
                        </div>
                        <h1 className="font-serif italic text-xl tracking-tight text-white uppercase">ALAIAS</h1>
                     </div>
                ) : mode === 'forgot_password' ? (
                    <div className="flex flex-col items-center">
                        <div className="mb-4">
                            <span className="material-symbols-outlined text-[48px] text-[#4ade80]">lock</span>
                        </div>
                        <h1 className="font-serif italic text-xl tracking-tight text-white flex items-center">
                            <span>ALAI</span><span className="text-[#4ade80]">AS</span>
                        </h1>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 flex relative mb-2">
                            {/* Geometric Green Symbol Mark */}
                            <div className="absolute w-8 h-8 border border-[#4ade80] transform rotate-45 top-1/2 left-1/2 -mt-4 -ml-5"></div>
                            <div className="absolute w-8 h-8 border border-[#4ade80] transform rotate-45 top-1/2 left-1/2 -mt-4 -ml-3"></div>
                        </div>
                        <h1 className="font-serif text-[36px] tracking-tight text-[#dde5da]">Alai<span className="text-[#4ade80]">as</span></h1>
                        <p className="font-sans text-[11px] text-[#555] uppercase tracking-[0.2em] mt-1">seu assistente pessoal</p>
                    </div>
                )}
            </header>

            {/* Main Card */}
            <main className="flex-1 bg-[#111111] border-t border-[#1a1a1a] rounded-t-[28px] px-6 pt-4 flex flex-col">
                {/* Handle Pill */}
                <div className="w-10 h-1 bg-[#4ade80]/30 rounded-full mx-auto mb-8"></div>
                
                {/* Heading */}
                {mode !== 'register_step3' && mode !== 'forgot_password' && mode !== 'forgot_password_verify' && mode !== 'forgot_password_reset' && (
                    <div className="mb-8">
                        <h2 className="font-serif text-[28px] text-white mb-2">
                            {mode === 'login' ? 'entrar' : 'criar conta'}
                        </h2>
                        <p className="font-sans text-[13px] text-[#555]">
                            {mode === 'login' ? 'bem-vindo de volta' : 'comece a organizar sua vida'}
                        </p>
                    </div>
                )}

                {/* Step Indicator for Registration */}
                {(mode === 'register_step1' || mode === 'register_step2') && (
                    <div className="flex flex-col mb-12">
                        <div className="flex items-center space-x-0">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center relative">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors",
                                    mode === 'register_step1' || mode === 'register_step2' ? "bg-[#4ade80] text-[#005e2d] font-bold" : "bg-[#1a211b] border border-[#3d4a3e] text-[#869486]"
                                )}>1</div>
                                <span className={cn(
                                    "absolute -bottom-6 font-sans text-[10px] tracking-[0.1em] uppercase font-medium",
                                    mode === 'register_step1' || mode === 'register_step2' ? "text-[#4ade80]" : "text-[#869486] opacity-60"
                                )}>perfil</span>
                            </div>
                            
                            {/* Connector 1 */}
                            <div className={cn(
                                "flex-1 h-[2px] mx-2 mt-[-10px] transition-colors",
                                mode === 'register_step2' ? "bg-[#4ade80]" : "bg-[#1a211b]"
                            )}></div>
                            
                            {/* Step 2 */}
                            <div className="flex flex-col items-center relative">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors",
                                    mode === 'register_step2' ? "bg-[#4ade80] text-[#005e2d] font-bold" : "bg-[#1a211b] border border-[#3d4a3e] text-[#869486]"
                                )}>2</div>
                                <span className={cn(
                                    "absolute -bottom-6 font-sans text-[10px] tracking-[0.1em] uppercase font-medium",
                                    mode === 'register_step2' ? "text-[#4ade80]" : "text-[#869486] opacity-60"
                                )}>acesso</span>
                            </div>
                            
                            {/* Connector 2 */}
                            <div className="flex-1 h-[2px] bg-[#1a211b] mx-2 mt-[-10px]"></div>
                            
                            {/* Step 3 */}
                            <div className="flex flex-col items-center relative">
                                <div className="w-8 h-8 rounded-full bg-[#1a211b] border border-[#3d4a3e] flex items-center justify-center text-[#869486] text-sm">3</div>
                                <span className="absolute -bottom-6 font-sans text-[10px] text-[#869486] tracking-[0.1em] uppercase font-medium opacity-60">pronto</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Forms */}
                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-6 flex-1 flex flex-col">
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block font-sans text-[10px] text-[#555] tracking-widest uppercase mb-1">e-mail</label>
                                <div className="flex items-center border-b border-[#1a1a1a] pb-2 focus-within:border-[#4ade80] transition-colors group">
                                    <Mail className="w-5 h-5 text-[#555] group-focus-within:text-[#4ade80] mr-3 transition-colors" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-[#dde5da] font-sans text-[15px] focus:ring-0 placeholder:text-[#333]" 
                                        placeholder="seu@email.com" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <label className="block font-sans text-[10px] text-[#555] tracking-widest uppercase mb-1">senha</label>
                                <div className="flex items-center border-b border-[#1a1a1a] pb-2 focus-within:border-[#4ade80] transition-colors group">
                                    <Lock className="w-5 h-5 text-[#555] group-focus-within:text-[#4ade80] mr-3 transition-colors" />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-[#dde5da] font-sans text-[15px] focus:ring-0 placeholder:text-[#333]" 
                                        placeholder="••••••••" 
                                        required
                                    />
                                </div>
                                <div className="flex justify-end pt-1">
                                    <button type="button" onClick={() => setMode('forgot_password')} className="font-sans text-[11px] font-medium text-[#4ade80] hover:opacity-80 transition-opacity">Esqueci minha senha</button>
                                </div>
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1"></div>

                        {/* CTA & Footer */}
                        <div className="pb-10">
                            {errorMsg && (
                                <div className="text-red-400 text-sm text-center mb-4">{errorMsg}</div>
                            )}
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-[#4ade80] rounded-[14px] flex items-center justify-center text-[#0a0a0a] font-bold font-sans text-[14px] uppercase tracking-wider mb-6 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'ENTRANDO...' : 'entrar'}
                            </button>
                            
                            {/* Social Divider */}
                            <div className="flex items-center space-x-3 pt-2 mb-6">
                                <div className="h-[1px] flex-grow bg-[#1a1a1a]"></div>
                                <span className="font-sans text-[11px] text-[#333] uppercase">ou</span>
                                <div className="h-[1px] flex-grow bg-[#1a1a1a]"></div>
                            </div>
                            
                            {/* Social Buttons */}
                            <div className="grid grid-cols-1 gap-3 mb-6">
                                <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center space-x-2 bg-[#0a0a0a] border border-[#1a1a1a] py-3 rounded-[12px] hover:border-[#4ade80]/30 transition-colors">
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                                    <span className="font-sans text-[11px] font-medium text-white uppercase tracking-tighter">Google</span>
                                </button>
                            </div>

                            <p className="text-center font-sans text-[12px] text-[#555]">
                                não tem conta? <button type="button" onClick={() => setMode('register_step1')} className="text-[#4ade80] hover:underline font-medium">criar conta</button>
                            </p>
                        </div>
                    </form>
                )}

                {mode === 'register_step1' && (
                    <form onSubmit={(e) => { e.preventDefault(); if(fullName || nickname) setMode('register_step2'); }} className="space-y-6 flex-1 flex flex-col">
                        <div className="space-y-6 mt-4">
                            {/* Nome Completo */}
                            <div className="flex items-center py-2 border-b border-[#1a1a1a] focus-within:border-[#4ade80] transition-colors">
                                <User className="w-5 h-5 text-[#869486] mr-3" />
                                <div className="flex-1">
                                    <label className="block font-sans text-[12px] font-medium text-[#869486] tracking-[0.1em] uppercase mb-1">nome completo</label>
                                    <input 
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-[#dde5da] font-sans text-[16px] focus:ring-0 placeholder:text-[#869486]/50" 
                                        placeholder="Insira seu nome" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Apelido */}
                            <div className="flex items-center py-2 border-b border-[#1a1a1a] focus-within:border-[#4ade80] transition-colors">
                                <div className="w-5 h-5 mr-3"></div> {/* Spacer for alignment */}
                                <div className="flex-1">
                                    <label className="block font-sans text-[12px] font-medium text-[#869486] tracking-[0.1em] uppercase mb-1">como prefere ser chamado?</label>
                                    <input 
                                        type="text" 
                                        value={nickname}
                                        onChange={e => setNickname(e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-[#dde5da] font-sans text-[16px] focus:ring-0 placeholder:text-[#869486]/50" 
                                        placeholder="apelido ou primeiro nome" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Profile Photo Row */}
                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center">
                                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#3d4a3e] flex items-center justify-center bg-[#161d17] mr-4 overflow-hidden text-[#3d4a3e]">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <span className="font-sans text-[16px] text-[#dde5da]">foto de perfil</span>
                                </div>
                                <button type="button" className="text-[#4ade80] font-sans text-[14px] font-medium tracking-wide">escolher</button>
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1"></div>

                        {/* CTA & Footer */}
                        <div className="pb-10">
                            <button 
                                type="submit"
                                className="w-full h-14 bg-white rounded-full flex items-center justify-center text-[#09100a] font-medium font-sans text-[16px] mb-6 hover:opacity-90 transition-opacity active:scale-[0.98]"
                            >
                                continuar <span className="ml-2">→</span>
                            </button>
                            <p className="text-center font-sans text-[11px] text-[#869486]">
                                ao criar conta você concorda com os <a className="text-[#4ade80]" href="#">termos de uso</a>
                            </p>
                        </div>
                    </form>
                )}

                {mode === 'register_step2' && (
                    <form onSubmit={handleRegister} className="space-y-6 flex-1 flex flex-col">
                        <div className="space-y-6 mt-4">
                            {/* Email */}
                            <div className="flex items-center py-2 border-b border-[#1a1a1a] focus-within:border-[#4ade80] transition-colors group">
                                <Mail className="w-5 h-5 text-[#869486] group-focus-within:text-[#4ade80] mr-3 transition-colors" />
                                <div className="flex-1">
                                    <label className="block font-sans text-[12px] font-medium text-[#869486] tracking-[0.1em] uppercase mb-1">e-mail</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-[#dde5da] font-sans text-[16px] focus:ring-0 placeholder:text-[#869486]/50" 
                                        placeholder="seu@email.com" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div className="flex items-center py-2 border-b border-[#1a1a1a] focus-within:border-[#4ade80] transition-colors group">
                                <Lock className="w-5 h-5 text-[#869486] group-focus-within:text-[#4ade80] mr-3 transition-colors" />
                                <div className="flex-1">
                                    <label className="block font-sans text-[12px] font-medium text-[#869486] tracking-[0.1em] uppercase mb-1">senha</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-[#dde5da] font-sans text-[16px] focus:ring-0 placeholder:text-[#869486]/50" 
                                        placeholder="••••••••••••" 
                                        required
                                    />
                                </div>
                                <span className="material-symbols-outlined text-[#869486] cursor-pointer hover:text-[#dde5da] transition-colors">visibility</span>
                            </div>

                            {/* Confirmar Senha */}
                            <div className="flex items-center py-2 border-b border-[#1a1a1a] focus-within:border-[#4ade80] transition-colors group">
                                <Lock className="w-5 h-5 text-[#869486] group-focus-within:text-[#4ade80] mr-3 transition-colors" />
                                <div className="flex-1">
                                    <label className="block font-sans text-[12px] font-medium text-[#869486] tracking-[0.1em] uppercase mb-1">confirmar senha</label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-transparent border-none p-0 text-[#dde5da] font-sans text-[16px] focus:ring-0 placeholder:text-[#869486]/50" 
                                        placeholder="••••••••••••" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Strength */}
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-sans text-[10px] font-medium text-[#869486] uppercase tracking-widest">FORÇA DA SENHA</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></div>
                                        <span className="font-sans text-[10px] font-medium text-[#4ade80] uppercase">FORTE</span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="h-1 flex-grow bg-[#4ade80] rounded-full"></div>
                                    <div className="h-1 flex-grow bg-[#4ade80] rounded-full"></div>
                                    <div className="h-1 flex-grow bg-[#4ade80] rounded-full"></div>
                                    <div className="h-1 flex-grow bg-[#4ade80] rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1"></div>

                        {/* CTA & Footer */}
                        <div className="pb-10 pt-4">
                            {errorMsg && (
                                <div className="text-red-400 text-sm text-center mb-4">{errorMsg}</div>
                            )}
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-white rounded-full flex items-center justify-center text-[#09100a] font-medium font-sans text-[16px] mb-6 hover:bg-[#6bfb9a] transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'CRIANDO CONTA...' : <>CRIAR MINHA CONTA <span className="ml-2 font-serif text-[18px]">→</span></>}
                            </button>
                            <p className="text-center font-sans text-[12px] text-[#869486] opacity-60">
                                Ao continuar, você concorda com nossos <br/> <a href="#" className="underline hover:text-[#4ade80] transition-colors">Termos de Serviço</a> e <a href="#" className="underline hover:text-[#4ade80] transition-colors">Privacidade</a>.
                            </p>
                        </div>
                    </form>
                )}

                {mode === 'register_step3' && (
                    <div className="flex-1 flex flex-col pt-8">
                        {/* Success Card */}
                        <div className="bg-[#111111] border border-[#1a1a1a] rounded-[40px] p-8 flex flex-col items-center text-center mb-8">
                            <div className="w-20 h-20 rounded-full border-2 border-[#4ade80] flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-[#4ade80] text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            </div>
                            <h3 className="font-serif text-[32px] text-[#dde5da] mb-2 italic">tudo pronto!</h3>
                            <p className="font-sans text-[16px] text-[#869486]">sua conta foi criada com sucesso</p>
                        </div>

                        {/* Personalization Question Card */}
                        <div className="bg-[#111111] border-l-4 border-l-[#4ade80] border border-[#1a1a1a] rounded-xl p-6 mb-8 mt-2">
                            <p className="font-sans text-[12px] font-medium text-[#dde5da] mb-4 uppercase tracking-widest">PERGUNTA DE CONFIGURAÇÃO</p>
                            <h4 className="font-sans text-[18px] text-[#dde5da] mb-6">como você quer usar o Alaias?</h4>
                            
                            <div className="flex flex-wrap gap-2">
                                <button className="bg-[#111111] border border-[#1a1a1a] rounded-full px-5 py-2 text-[#dde5da] font-sans text-[14px] hover:border-[#4ade80] transition-colors">
                                    organizar tarefas
                                </button>
                                <button className="bg-[#4ade80] text-[#005e2d] border border-[#4ade80] rounded-full px-5 py-2 font-sans text-[14px] font-medium">
                                    controlar finanças
                                </button>
                                <button className="bg-[#111111] border border-[#1a1a1a] rounded-full px-5 py-2 text-[#dde5da] font-sans text-[14px] hover:border-[#4ade80] transition-colors">
                                    tudo acima
                                </button>
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1"></div>

                        {/* Primary CTA Area */}
                        <div className="pb-10 pt-4">
                            <button 
                                onClick={() => {
                                    setUserName(nickname);
                                    setAuthenticated(true);
                                    navigate('/');
                                }}
                                className="w-full h-14 bg-white rounded-full flex items-center justify-center text-[#09100a] font-medium font-sans text-[16px] mb-6 hover:bg-[#6bfb9a] transition-all active:scale-[0.98]"
                            >
                                ir para o Alaias <span className="ml-2 font-serif text-[18px]">→</span>
                            </button>
                            <p className="text-center font-serif text-[18px] italic text-[#4ade80] mt-4">
                                Sua excelência digital aguarda.
                            </p>
                        </div>
                    </div>
                )}

                {mode === 'forgot_password' && (
                    <div className="flex-1 flex flex-col items-center pt-4">
                        <div className="w-full text-left">
                            <h1 className="font-serif text-[32px] text-white mb-2 leading-tight">recuperar acesso</h1>
                            <p className="font-sans text-[14px] text-[#555] mb-12">enviaremos um código para o seu e-mail</p>

                            <form className="space-y-10 w-full" onSubmit={(e) => { e.preventDefault(); setMode('forgot_password_verify'); }}>
                                <div className="flex flex-col space-y-3">
                                    <label className="font-sans text-[10px] text-[#555] tracking-[0.1em] uppercase font-bold">seu e-mail</label>
                                    <div className="flex items-center space-x-3 border-b border-[#1a1a1a] pb-3 focus-within:border-[#4ade80] transition-colors group">
                                        <Mail className="w-5 h-5 text-[#555] group-focus-within:text-[#4ade80] transition-colors" />
                                        <input 
                                            className="bg-transparent border-none p-0 text-[15px] text-white placeholder-[#333] focus:ring-0 w-full font-sans" 
                                            placeholder="nome@exemplo.com" 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                        />
                                    </div>
                                </div>
                                <button className="w-full h-[52px] bg-[#4ade80] text-[#0a0a0a] rounded-[14px] font-sans text-sm font-bold tracking-tight active:scale-[0.98] transition-all uppercase">
                                    enviar código
                                </button>
                                <div className="pt-2 text-center">
                                    <button type="button" onClick={() => setMode('login')} className="text-[#4ade80] text-[11px] font-medium tracking-wide hover:opacity-80 transition-opacity">
                                        lembrei minha senha
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {mode === 'forgot_password_verify' && (
                    <div className="flex-1 flex flex-col pt-4">
                        <header className="mb-8">
                            <h1 className="font-serif text-[28px] text-white leading-tight mb-2">verifique seu e-mail</h1>
                            <p className="font-sans text-[16px] text-[#555] leading-snug">
                                enviamos um código de 6 dígitos para <br/><span className="font-bold text-white">{email || "seuemail@exemplo.com"}</span>
                            </p>
                        </header>
                        
                        <form className="space-y-8 flex-grow flex flex-col" onSubmit={(e) => { e.preventDefault(); setMode('forgot_password_reset'); }}>
                            <div className="flex justify-between mt-8 mb-8" style={{fontFamily: "'DM Serif Display', serif"}}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div 
                                        key={i}
                                        className={cn(
                                            "w-11 h-14 bg-[#0a0a0a] border rounded-[10px] flex items-center justify-center text-white text-[20px] transition-colors cursor-text hover:border-[#4ade80]/50",
                                            i === 1 ? "border-[#4ade80]" : "border-[#1a1a1a]"
                                        )}
                                    >
                                        {i === 1 ? "7" : ""}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-center gap-1 font-sans text-[13px] mb-8">
                                <span className="text-[#555]">não recebeu?</span>
                                <button type="button" className="text-[#4ade80] font-medium hover:opacity-80 transition-opacity">reenviar</button>
                                <span className="text-[#555]">(59s)</span>
                            </div>

                            <div className="flex-grow"></div>
                            
                            <div className="pb-10 pt-4">
                                <button className="w-full h-14 bg-[#4ade80] text-[#0a0a0a] rounded-full font-sans text-[14px] font-bold tracking-widest hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center uppercase">
                                    VERIFICAR CÓDIGO
                                </button>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                                <p className="font-serif italic text-white/40 text-center text-sm">
                                    Segurança é a fundação da exclusividade Alaias.
                                </p>
                            </div>
                        </form>
                    </div>
                )}

                {mode === 'forgot_password_reset' && (
                    <div className="flex-1 flex flex-col pt-4">
                        <header className="mb-12">
                            <h1 className="font-serif text-[28px] text-white leading-tight mb-2">nova senha</h1>
                            <p className="font-sans text-[13px] text-[#555]">escolha uma senha segura</p>
                        </header>
                        
                        <form className="space-y-8 flex-grow flex flex-col" onSubmit={(e) => { e.preventDefault(); setMode('login'); }}>
                            <div className="space-y-2 group">
                                <label className="block font-sans text-[10px] text-[#555] tracking-widest uppercase mb-1">nova senha</label>
                                <div className="flex items-center gap-3 relative border-b border-[#1a1a1a] pb-2 focus-within:border-[#4ade80] transition-colors">
                                    <Lock className="w-5 h-5 text-[#555] group-focus-within:text-[#4ade80] transition-colors" />
                                    <input 
                                        className="w-full bg-transparent border-none p-0 text-[15px] text-white focus:ring-0 placeholder-[#333]" 
                                        placeholder="••••••••" 
                                        type="password" 
                                        required
                                    />
                                </div>
                                <div className="pt-2">
                                    <div className="flex gap-1.5 h-[2px] w-full mb-2">
                                        <div className="flex-1 bg-[#4ade80] rounded-full"></div>
                                        <div className="flex-1 bg-[#4ade80] rounded-full"></div>
                                        <div className="flex-1 bg-[#4ade80] rounded-full"></div>
                                        <div className="flex-1 bg-[#1a1a1a] rounded-full"></div>
                                    </div>
                                    <p className="font-sans text-[10px] text-[#4ade80] uppercase tracking-widest flex items-center gap-1 font-bold">
                                        força da senha: forte
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-2 group">
                                <label className="block font-sans text-[10px] text-[#555] tracking-widest uppercase mb-1">confirmar nova senha</label>
                                <div className="flex items-center gap-3 relative border-b border-[#1a1a1a] pb-2 focus-within:border-[#4ade80] transition-colors">
                                    <Lock className="w-5 h-5 text-[#555] group-focus-within:text-[#4ade80] transition-colors" />
                                    <input 
                                        className="w-full bg-transparent border-none p-0 text-[15px] text-white focus:ring-0 placeholder-[#333]" 
                                        placeholder="••••••••" 
                                        type="password" 
                                        required
                                    />
                                    <div className="absolute right-0 flex items-center gap-1 text-[#4ade80]">
                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="font-sans text-[10px] uppercase font-bold tracking-widest">senhas coincidem</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-grow"></div>
                            
                            {errorMsg && (
                                <div className="text-red-400 text-sm text-center mb-4">{errorMsg}</div>
                            )}

                            <div className="pb-10 pt-4">
                                <button disabled={loading} className="w-full h-[56px] bg-[#4ade80] text-[#0a0a0a] rounded-full font-sans text-[14px] font-bold tracking-widest hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center uppercase disabled:opacity-50">
                                    {loading ? 'CARREGANDO...' : 'SALVAR NOVA SENHA'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
            
            {/* Aesthetic Decoration */}
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4ade80]/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#4ade80]/5 blur-[120px] rounded-full pointer-events-none"></div>
        </div>
    </div>
  );
}

