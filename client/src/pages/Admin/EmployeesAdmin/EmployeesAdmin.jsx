import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";

export default function EmployeesAdmin() {
  const [masters, setMasters] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", specialization: "" });

  useEffect(() => { fetchMasters(); }, []);

  const fetchMasters = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/masters");
      setMasters(res.data);
    } catch (err) { 
      console.error("Ошибка загрузки", err); 
    } finally {
      setIsLoading(false);
    }
  };

  const saveMaster = async () => {
    if (!form.name || !form.phone) return alert("Заполните основные поля");
    try {
      if (editing) {
        await axiosInstance.put(`/masters/${editing}`, form);
      } else {
        await axiosInstance.post("/masters", form);
      }
      closeModal();
      fetchMasters();
    } catch (err) { console.error("Ошибка сохранения", err); }
  };

  const deleteMaster = async (id) => {
    if (!window.confirm("Удалить мастера?")) return;
    try {
      await axiosInstance.delete(`/masters/${id}`);
      fetchMasters();
    } catch (err) { console.error("Ошибка удаления", err); }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm({ name: "", phone: "", specialization: "" });
  };

  const openEditModal = (master) => {
    setEditing(master.id);
    setForm({ name: master.name, phone: master.phone, specialization: master.specialization });
    setModalOpen(true);
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
        <main className="max-w-6xl mx-auto p-4 md:p-8">
          
          {/* Header с адаптивным расположением */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tighter">Сотрудники</h1>
              <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Команда Lumina Barbershop</p>
            </div>
            <button 
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto bg-[#d4af37] text-black font-black px-6 py-3.5 rounded-xl uppercase text-[11px] hover:brightness-110 transition-all active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
            >
              Добавить мастера
            </button>
          </div>

          {/* Контент: Лоадер или Список */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/[0.03] border border-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-[#111113] rounded-[2rem] md:rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              
              {/* Десктопная версия (Таблица) - скрыта на мобилках */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="p-5 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Мастер</th>
                      <th className="p-5 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Контакты</th>
                      <th className="p-5 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Специальность</th>
                      <th className="p-5 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Управление</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {masters.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37]/20 to-zinc-800 border border-white/10 flex items-center justify-center font-black text-[#d4af37] italic">
                              {m.name.charAt(0)}
                            </div>
                            <span className="font-bold text-white uppercase italic text-sm tracking-tight">{m.name}</span>
                          </div>
                        </td>
                        <td className="p-5 text-zinc-400 font-medium text-sm">{m.phone}</td>
                        <td className="p-5">
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-zinc-300 uppercase">
                            {m.specialization}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(m)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">✏️</button>
                            <button onClick={() => deleteMaster(m.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-rose-500 hover:border-rose-500/50 transition-all">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-white/5">
                {masters.map((m) => (
                  <div key={m.id} className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center font-black text-[#d4af37] text-xl italic">
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-white uppercase italic tracking-tight">{m.name}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{m.specialization}</span>
                        <span className="text-[11px] text-zinc-600 mt-1">{m.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => openEditModal(m)} className="p-3 rounded-xl bg-white/5 border border-white/10">✏️</button>
                       <button onClick={() => deleteMaster(m.id)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-rose-500">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>

              {masters.length === 0 && !isLoading && (
                <div className="p-20 text-center text-zinc-600 font-bold uppercase text-xs tracking-widest italic">
                  Команда еще не сформирована
                </div>
              )}
            </div>
          )}
        </main>

        {modalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={closeModal}></div>
            <div className="bg-[#111113] border-t sm:border border-white/10 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
              <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">
                  {editing ? "Профиль мастера" : "Новый сотрудник"}
                </h3>
              </div>
              
              <div className="p-6 md:p-8 space-y-5">
                <Field label="Имя мастера" placeholder="Напр. Арман" value={form.name} onChange={v => setForm({...form, name: v})} />
                <Field label="Телефон" placeholder="+7 (___)" value={form.phone} onChange={v => setForm({...form, phone: v})} />
                <Field label="Специализация" placeholder="Топ-барбер" value={form.specialization} onChange={v => setForm({...form, specialization: v})} />
              </div>

              <div className="p-6 md:p-8 pt-0 flex flex-col gap-3 mb-6 sm:mb-0">
                <button onClick={saveMaster} className="w-full bg-[#d4af37] text-black font-black py-4 rounded-2xl uppercase text-xs hover:brightness-110 active:scale-95 transition-all">
                  {editing ? "Сохранить" : "Принять в штат"}
                </button>
                <button onClick={closeModal} className="w-full text-zinc-600 font-bold py-2 uppercase text-[10px] tracking-widest">Отмена</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">{label}</label>
      <input
        type="text"
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-zinc-800"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}