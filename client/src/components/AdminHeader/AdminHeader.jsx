import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

useEffect(() => {
  if (isOpen) {
    // Блокируем скролл
    document.body.style.overflow = "hidden";
    // Предотвращаем горизонтальный скролл (на всякий случай)
    document.body.style.touchAction = "none"; 
  } else {
    // Возвращаем как было
    document.body.style.overflow = "unset";
    document.body.style.touchAction = "auto";
  }

  // Очистка при размонтировании компонента
  return () => {
    document.body.style.overflow = "unset";
    document.body.style.touchAction = "auto";
  };
}, [isOpen]);
  const navLinks = [
    { name: "Журнал", path: "/admin/" },
    { name: "Сотрудники", path: "/admin/employees" },
  ];

  return (
    <>
      {/* 1. OVERLAY (За пределами хедера) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[900] transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 2. MOBILE MENU (За пределами хедера, чтобы не наследовало прозрачность) */}
      <nav className={`fixed inset-y-0 right-0 w-[280px] z-[1000] bg-[#0b0b0d] border-l border-white/5 transform transition-transform duration-500 ease-in-out md:hidden shadow-[-10px_0_30px_rgba(0,0,0,0.9)] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex flex-col h-full p-6 pt-24 gap-4">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 ml-4">Управление</p>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center p-4 rounded-2xl transition-all ${
                  isActive ? "bg-white/[0.08] border border-white/10" : "active:bg-white/[0.05]"
                }`}
              >
                {isActive && <div className="absolute left-0 w-1 h-6 bg-[#d4af37] rounded-full" />}
                <span className={`text-xl font-black uppercase italic tracking-tight ${isActive ? "text-[#d4af37] ml-2" : "text-zinc-400"}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
          <div className="mt-auto pb-10 pt-8 border-t border-white/5">
            <button className="text-rose-500 font-black uppercase text-xs tracking-[0.2em] w-full text-left px-4">
              🚪 Выйти
            </button>
          </div>
        </div>
      </nav>

      {/* 3. HEADER (Только верхняя полоска) */}
      <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 z-[100] px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between">
          <Link to="/admin/" className="text-lg md:text-xl font-black italic tracking-tighter text-white uppercase">
            ΛUMINA<span className="text-[#d4af37]">.</span>ADMIN
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                  location.pathname === link.path ? "text-[#d4af37]" : "text-zinc-500 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button className="text-[11px] font-black uppercase tracking-widest text-rose-500/80 hover:text-rose-500 ml-4">Выйти</button>
          </nav>

          {/* Burger Button */}
          <button 
            className="relative z-[1100] w-12 h-12 flex flex-col items-center justify-center md:hidden rounded-2xl bg-white/[0.03] border border-white/5 active:scale-90 transition-all"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="relative w-6 h-4 flex flex-col justify-between">
              <span className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-left ${isOpen ? "rotate-[38deg] translate-x-1" : ""}`} />
              <span className={`w-6 h-0.5 bg-white rounded-full transition-opacity ${isOpen ? "opacity-0" : ""}`} />
              <span className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-left ${isOpen ? "-rotate-[38deg] translate-x-1" : ""}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Отступ под хедер */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}