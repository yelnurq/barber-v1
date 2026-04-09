import { useState, useEffect, useMemo, useCallback, memo } from "react";
import axiosInstance from "../../../api/axios";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import * as XLSX from "xlsx";

const MASTER_PERCENT = 0.2;
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9);

const STATUS_CONFIG = {
  pending: { label: "ОЖИДАНИЕ", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  confirmed: { label: "ГОТОВО", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  cancelled: { label: "ОТМЕНА", border: "border-rose-500/20", bg: "bg-rose-500/10" },
};

const TimeSlot = memo(({ hour, master, appointment, onSlotClick, onEditStatus, isEditing, updateStatus, onDelete }) => {
  const s = appointment ? (STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending) : null;

  return (
    <td 
      className="p-1 border-r border-white/5 min-w-[140px] md:min-w-[180px] relative transition-colors hover:bg-white/[0.02]"
      onClick={() => !appointment && onSlotClick(master, hour)}
    >
      {appointment ? (
        <div className={`p-2 rounded-lg border ${s.border} ${s.bg} group relative transition-all`}>
          <button 
            onClick={(e) => onDelete(e, appointment.id)}
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 shadow-lg"
          >
            <span className="text-[16px] leading-none">×</span>
          </button>

          <div className="flex justify-between items-start mb-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEditStatus(appointment.id); }} 
              className="text-[9px] md:text-[10px] font-black px-1 py-0.5 rounded bg-black/40 text-white"
            >
              {s.label}
            </button>
            <span className="text-[11px] md:text-[13px] font-bold text-[#d4af37]">
              {appointment.service?.price.toLocaleString()}
            </span>
          </div>
          
          <div className="text-[12px] md:text-[14px] font-bold text-white uppercase truncate">
            {appointment.client_name}
          </div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase truncate">
            {appointment.service?.name}
          </div>
          
          {isEditing && (
            <div className="absolute inset-0 z-20 bg-[#1c1c1f] rounded-lg p-1 flex flex-col gap-1 shadow-2xl ring-1 ring-[#d4af37]">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button 
                  key={key} 
                  onClick={(e) => { e.stopPropagation(); updateStatus(appointment, key); }} 
                  className="flex-1 text-[11px] md:text-[13px] font-black rounded hover:bg-[#d4af37] hover:text-black transition-colors uppercase"
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-16 md:h-20 flex items-center justify-center opacity-20 md:opacity-0 md:hover:opacity-100 cursor-pointer">
          <span className="text-2xl text-zinc-800">+</span>
        </div>
      )}
    </td>
  );
});

const AppointmentModal = memo(({ slot, services, onClose, onSubmit }) => {
  const [form, setForm] = useState({ client_name: "", client_phone: "", service_id: "" });

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-[#111113] border-t md:border border-white/10 w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="p-6 md:p-8 bg-white/[0.02] border-b border-white/5">
          <h3 className="text-xl md:text-2xl font-black text-white uppercase italic">Новый визит</h3>
          <p className="text-[#d4af37] font-bold text-xs mt-1 uppercase tracking-widest">{slot.time} • {slot.master_name}</p>
        </div>
        <div className="p-6 md:p-8 space-y-4 md:space-y-5">
          <Input label="Клиент" value={form.client_name} onChange={v => setForm(f => ({...f, client_name: v}))} placeholder="Имя" />
          <Input label="Телефон" value={form.client_phone} onChange={v => setForm(f => ({...f, client_phone: v}))} placeholder="+7 (___) ___" />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Услуга</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#d4af37] outline-none" 
              value={form.service_id} onChange={e => setForm(f => ({...f, service_id: e.target.value}))}>
              <option value="" className="bg-[#111113]">Выбрать из прайса...</option>
              {services.map(s => <option key={s.id} value={s.id} className="bg-[#111113]">{s.name} — {s.price}₸</option>)}
            </select>
          </div>
        </div>
        <div className="p-6 md:p-8 pt-0 flex flex-col gap-3">
          <button onClick={() => onSubmit(form)} className="w-full bg-[#d4af37] text-black font-black py-4 rounded-xl uppercase text-xs hover:brightness-110 active:scale-95 transition-all">Записать клиента</button>
          <button onClick={onClose} className="w-full text-zinc-500 font-bold py-2 uppercase text-[10px] tracking-widest">Отмена</button>
        </div>
      </div>
    </div>
  );
});

export default function AppointmentsAdmin() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [masters, setMasters] = useState([]);
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const appointmentsMap = useMemo(() => {
    const map = {};
    appointments.forEach(app => {
      const h = new Date(app.date_time).getHours();
      map[`${app.master_id}-${h}`] = app;
    });
    return map;
  }, [appointments]);

  const exportToExcel = () => {
    const dataToExport = appointments.map(app => ({
      "Дата": new Date(app.date_time).toLocaleDateString(),
      "Время": `${new Date(app.date_time).getHours()}:00`,
      "Мастер": masters.find(m => m.id === app.master_id)?.name || "Неизвестен",
      "Клиент": app.client_name,
      "Телефон": app.client_phone,
      "Услуга": app.service?.name || "—",
      "Цена (₸)": app.service?.price || 0,
      "Статус": STATUS_CONFIG[app.status]?.label || app.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Отчет");
    XLSX.writeFile(workbook, `Отчет_за_${currentDate}.xlsx`);
  };

  const stats = useMemo(() => {
    const confirmed = appointments.filter(a => a.status === "confirmed");
    const totalRev = confirmed.reduce((s, a) => s + (a.service?.price || 0), 0);
    const capacity = masters.length * HOURS.length;
    const occupancy = capacity > 0 ? Math.round((appointments.filter(a => a.status !== "cancelled").length / capacity) * 100) : 0;
    return { revenue: totalRev, profit: totalRev * (1 - MASTER_PERCENT), occupancy };
  }, [appointments, masters]);

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/schedule/${currentDate}`);
      setAppointments(res.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [currentDate]);

  useEffect(() => {
    const init = async () => {
      const [m, s] = await Promise.all([axiosInstance.get("/masters"), axiosInstance.get("/services")]);
      setMasters(m.data);
      setServices(s.data);
    };
    init();
  }, []);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const handleUpdateStatus = async (app, newStatus) => {
    try {
      await axiosInstance.put(`/appointments/${app.id}`, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (e, appointmentId) => {
    e.stopPropagation();
    if (!window.confirm("Удалить эту запись?")) return;
    try {
      await axiosInstance.delete(`/appointments/${appointmentId}`);
      setAppointments(prev => prev.filter(a => a.id !== appointmentId));
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (formData) => {
    try {
      await axiosInstance.post("/admin/appointments", { 
        ...formData, 
        master_id: activeSlot.master_id, 
        date: currentDate, 
        time: activeSlot.time, 
        status: "pending" 
      });
      setActiveSlot(null);
      fetchSchedule();
    } catch (err) { alert("Ошибка сохранения"); }
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-10 md:pb-20">
        <main className="max-w-[1600px] mx-auto p-2 md:p-6">
          
          {/* Header Section: Журнал + Календарь + Excel */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
            <div className="space-y-4 w-full md:w-auto">
              <h1 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tighter">Журнал</h1>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative group h-[42px] flex-grow md:flex-none min-w-[140px]">
                  <input 
                    type="date" 
                    value={currentDate} 
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="bg-[#111113] border border-white/10 rounded-lg px-4 h-full text-[11px] text-[#d4af37] font-black outline-none focus:border-[#d4af37] transition-all w-full cursor-pointer uppercase tracking-wider [color-scheme:dark]"
                  />
                </div>
                <button 
                  onClick={exportToExcel}
                  className="flex items-center justify-center gap-2 h-[42px] bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 px-4 rounded-lg text-[11px] font-black uppercase flex-grow md:flex-none active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Top Stats: Выручка / Прибыль */}
            <div className="flex gap-2 w-full md:w-auto">
              <StatCardSmall title="Выручка" value={`${stats.revenue.toLocaleString()} ₸`} />
              <StatCardSmall title="Прибыль" value={`${stats.profit.toLocaleString()} ₸`} color="text-[#d4af37]" />
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6">
            {/* Table Container */}
            <div className="flex-grow order-1 xl:order-2 bg-[#111113] rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center font-black text-[#d4af37] text-xs tracking-widest uppercase">
                  Синхронизация...
                </div>
              )}
              
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
                <table className="w-full border-collapse table-fixed min-w-[700px]">
                  <thead>
                    <tr className="bg-[#18181b]">
                      <th className="p-4 text-center text-[9px] font-black text-zinc-500 uppercase border-r border-white/5 w-20">Время</th>
                      {masters.map(m => (
                        <th key={m.id} className="p-4 text-[11px] font-black uppercase text-white border-r border-white/5">
                          {m.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.map(hour => (
                      <tr key={hour} className="border-t border-white/5">
                        <td className="p-4 text-sm md:text-lg font-light text-zinc-600 bg-white/[0.01] border-r border-white/5 text-center italic">
                          {hour}:00
                        </td>
                        {masters.map(m => (
                          <TimeSlot 
                            key={`${m.id}-${hour}`}
                            hour={hour}
                            master={m}
                            appointment={appointmentsMap[`${m.id}-${hour}`]}
                            onSlotClick={(master, h) => setActiveSlot({ master_id: master.id, master_name: master.name, time: `${h.toString().padStart(2, "0")}:00` })}
                            onEditStatus={setEditingId}
                            isEditing={editingId === appointmentsMap[`${m.id}-${hour}`]?.id}
                            updateStatus={handleUpdateStatus}
                            onDelete={handleDelete}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile hint */}
              <div className="md:hidden p-3 text-center border-t border-white/5 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                ← Листайте таблицу вправо →
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="xl:w-80 w-full order-2 xl:order-1 flex-shrink-0">
              <EfficiencyCard stats={stats} masters={masters} appointments={appointments} />
            </div>
          </div>
        </main>

        {activeSlot && (
          <AppointmentModal 
            slot={activeSlot} 
            services={services} 
            onClose={() => setActiveSlot(null)} 
            onSubmit={handleCreate} 
          />
        )}
      </div>
    </>
  );
}

function EfficiencyCard({ stats, masters, appointments }) {
  return (
    <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden shadow-xl sticky top-24">
      {/* Шапка карточки */}
      <div className="p-4 bg-white/5 border-b border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Итоги смены</h3>
      </div>
      
      <div className="p-5 space-y-6">
        {/* Индикатор общей загрузки */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-zinc-500 text-[10px] font-bold uppercase">Загрузка салона</span>
            <span className="font-black text-white text-lg">{stats.occupancy}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#d4af37] transition-all duration-1000" 
              style={{ width: `${stats.occupancy}%` }}
            ></div>
          </div>
        </div>

        {/* Блок мастеров */}
        <div className="space-y-4">
          <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Статистика мастеров</p>
          <div className="space-y-3">
            {masters.map(m => {
              const masterApps = appointments.filter(a => a.master_id === m.id && a.status === "confirmed");
              const masterRev = masterApps.reduce((s, a) => s + (a.service?.price || 0), 0);
              const masterSalary = masterRev * MASTER_PERCENT;
              const sharePercent = stats.revenue > 0 ? Math.round((masterRev / stats.revenue) * 100) : 0;
              
              return (
                <div key={m.id} className="bg-white/[0.02] p-3 rounded-xl border border-white/5 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase italic">
                        {m.name}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">
                        {masterApps.length} подтвержденных визитов
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-white font-black italic">
                        {masterRev.toLocaleString()} ₸
                      </div>
                      <div className="text-[9px] text-emerald-500 font-bold uppercase">
                        Мастеру: {masterSalary.toLocaleString()} ₸
                      </div>
                    </div>
                  </div>
                  
                  {/* Прогресс вклада мастера */}
                  <div className="flex items-center gap-2">
                    <div className="flex-grow bg-white/5 h-[3px] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#d4af37] transition-all duration-500" 
                        style={{ width: `${sharePercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] text-zinc-600 font-black">{sharePercent}% доли</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Итоговый финансовый блок */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
            <span className="text-zinc-500">Выплаты мастерам (20%):</span>
            <span className="text-white">
              { (stats.revenue * MASTER_PERCENT).toLocaleString() } ₸
            </span>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
            <span className="text-zinc-500">Чистая прибыль салона (80%):</span>
            <span className="text-emerald-500 font-black">
              { (stats.revenue * (1 - MASTER_PERCENT)).toLocaleString() } ₸
            </span>
          </div>

          <div className="flex justify-between items-end pt-2 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Общая выручка</span>
              <span className="text-[#d4af37] text-2xl font-black italic tracking-tighter leading-none">
                { stats.revenue.toLocaleString() } ₸
              </span>
            </div>
            <div className="bg-[#d4af37]/10 px-2 py-1 rounded text-[#d4af37] text-[10px] font-black uppercase">
              Готово
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardSmall({ title, value, color = "text-white" }) {
  return (
    <div className="bg-[#111113] border border-white/5 p-3 md:px-6 md:py-3 rounded-xl flex-grow md:min-w-[160px]">
      <p className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
      <p className={`text-sm md:text-xl font-black ${color} truncate`}>{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, disabled }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">{label}</label>
      <input 
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-zinc-700" 
        placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
      />
    </div>
  );
}