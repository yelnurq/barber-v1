import { useState, useEffect, useMemo, useCallback, memo } from "react";
import axiosInstance from "../../../api/axios";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";

// Константы вынесены за пределы компонента
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
      className="p-1 border-r border-white/5 min-w-[140px] relative transition-colors hover:bg-white/[0.02]" // Уменьшил p и min-w
      onClick={() => !appointment && onSlotClick(master, hour)}
    >
      {appointment ? (
        <div className={`p-2 rounded-lg border ${s.border} ${s.bg} group relative transition-all`}> {/* p-3 -> p-2 */}
          
          <button 
            onClick={(e) => onDelete(e, appointment.id)}
            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 shadow-lg hover:bg-rose-500"
          >
            <span className="text-[10px]">×</span>
          </button>

          <div className="flex justify-between items-start mb-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEditStatus(appointment.id); }} 
              className="text-[7px] font-black px-1 py-0.5 rounded bg-black/40 text-white hover:bg-[#d4af37]"
            >
              {s.label}
            </button>
            <span className="text-[9px] font-bold text-[#d4af37] leading-none">
              {appointment.service?.price.toLocaleString()}
            </span>
          </div>
          
          <div className="text-[10px] font-bold text-white uppercase truncate leading-tight">
            {appointment.client_name}
          </div>
          <div className="text-[8px] text-zinc-500 font-bold uppercase truncate">
            {appointment.service?.name}
          </div>
          
          {/* Меню статусов — тоже чуть меньше */}
          {isEditing && (
            <div className="absolute inset-0 z-20 bg-[#1c1c1f] rounded-lg p-1 flex flex-col gap-0.5 shadow-2xl ring-1 ring-[#d4af37]">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button 
                  key={key} 
                  onClick={(e) => { e.stopPropagation(); updateStatus(appointment, key); }} 
                  className="flex-1 text-[8px] font-black rounded hover:bg-[#d4af37] hover:text-black transition-colors uppercase"
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-8 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer">
          <span className="text-[9px] text-zinc-800">+</span>
        </div>
      )}
    </td>
  );
});

// --- Мемоизированное модальное окно ---
const AppointmentModal = memo(({ slot, date, services, onClose, onSubmit }) => {
  const [form, setForm] = useState({ client_name: "", client_phone: "", service_id: "" });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#111113] border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-8 bg-white/[0.02] border-b border-white/5">
          <h3 className="text-2xl font-black text-white uppercase italic">Новый визит</h3>
          <p className="text-[#d4af37] font-bold text-xs mt-1 uppercase tracking-widest">{slot.time} • {slot.master_name}</p>
        </div>
        <div className="p-8 space-y-5">
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
        <div className="p-8 pt-0 flex flex-col gap-3">
          <button onClick={() => onSubmit(form)} className="w-full bg-[#d4af37] text-black font-black py-4 rounded-xl uppercase text-xs hover:brightness-110 active:scale-95 transition-all">Записать клиента</button>
          <button onClick={onClose} className="w-full text-zinc-500 font-bold py-2 uppercase text-[10px] tracking-widest">Отмена</button>
        </div>
      </div>
    </div>
  );
});

// --- Основной компонент ---
export default function AppointmentsAdmin() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [masters, setMasters] = useState([]);
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Оптимизированная мапа записей
  const appointmentsMap = useMemo(() => {
    const map = {};
    appointments.forEach(app => {
      const h = new Date(app.date_time).getHours();
      map[`${app.master_id}-${h}`] = app;
    });
    return map;
  }, [appointments]);

  // Статистика
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
  e.stopPropagation(); // Чтобы не открылось окно редактирования/создания
  if (!window.confirm("Удалить эту запись?")) return;

  try {
    await axiosInstance.delete(`/appointments/${appointmentId}`);
    setAppointments(prev => prev.filter(a => a.id !== appointmentId));
  } catch (err) {
    console.error("Ошибка при удалении:", err);
    alert("Не удалось удалить запись");
  }
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
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-100 pb-20">
      <AdminHeader />
  <main className="max-w-[1600px] mx-auto p-4 lg:p-6"> {/* Уменьшил padding контейнера */}
  
  <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4"> {/* Уменьшил отступы */}
    <div className="space-y-2">
      <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Журнал</h1>
      <input 
        type="date" 
        value={currentDate} 
        onChange={(e) => setCurrentDate(e.target.value)}
        className="bg-[#111113] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#d4af37] font-bold outline-none focus:border-[#d4af37] transition-all"
      />
    </div>
    <div className="flex gap-3">
      <StatCardSmall title="Выручка" value={`${stats.revenue.toLocaleString()} ₸`} />
      <StatCardSmall title="Прибыль" value={`${stats.profit.toLocaleString()} ₸`} color="text-[#d4af37]" />
    </div>
  </div>

  <div className="flex flex-col xl:flex-row gap-4">
    <div className="xl:w-64 flex-shrink-0 space-y-4"> {/* Сузил боковую панель */}
      <EfficiencyCard stats={stats} masters={masters} appointments={appointments} />
    </div>

    <div className="flex-grow bg-[#111113] rounded-xl border border-white/5 shadow-2xl overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center font-black text-[#d4af37] text-xs tracking-widest">
          СИНХРОНИЗАЦИЯ...
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-[#18181b]">
              {/* Уменьшил ширину колонки времени с w-24 до w-16 и padding */}
              <th className="p-3 text-left text-[9px] font-black text-zinc-500 uppercase border-r border-white/5 w-16">
                Время
              </th>
              {masters.map(m => (
                <th key={m.id} className="p-3 text-xs font-black uppercase text-white border-r border-white/5 min-w-[180px]">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour} className="border-t border-white/5">
                {/* Уменьшил шрифт времени с xl до base и padding */}
                <td className="p-3 text-base font-light text-zinc-600 bg-white/[0.01] border-r border-white/5 text-center">
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
                      onDelete={handleDelete} // <-- Добавь это
                    />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</main>

      {activeSlot && (
        <AppointmentModal 
          slot={activeSlot} 
          date={currentDate} 
          services={services} 
          onClose={() => setActiveSlot(null)} 
          onSubmit={handleCreate} 
        />
      )}
    </div>
  );
}

// --- Вспомогательные компоненты (Финальная карточка эффективности) ---
function EfficiencyCard({ stats, masters, appointments }) {
  return (
    <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      <div className="p-4 bg-white/5 border-b border-white/5">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Эффективность смены</h3>
      </div>
      
      <div className="p-5 space-y-6">
        {/* Общий индикатор загрузки */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">Загрузка салона</span>
            <span className="font-black text-white text-lg">{stats.occupancy}%</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#c5a059] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(197,160,89,0.3)]" 
              style={{ width: `${stats.occupancy}%` }}
            ></div>
          </div>
        </div>

        {/* Детализация по мастерам */}
        <div className="pt-2">
          {/* Шапка таблицы — 4 колонки: Имя, Кол-во, Принес (Грязными), ЗП (20%) */}
          <div className="grid grid-cols-[1fr_40px_70px_70px] gap-2 mb-4 px-1">
            <p className="text-[8px] text-zinc-500 uppercase font-black">Мастер</p>
            <p className="text-[8px] text-zinc-500 uppercase font-black text-center">Визиты</p>
            <p className="text-[8px] text-zinc-500 uppercase font-black text-right">Валовый</p>
            <p className="text-[8px] text-zinc-500 uppercase font-black text-right">ЗП (20%)</p>
          </div>
          
          <div className="space-y-5">
            {masters.map(m => {
              const masterApps = appointments.filter(a => a.master_id === m.id && a.status === "confirmed");
              const masterRevenue = masterApps.reduce((s, a) => s + (a.service?.price || 0), 0);
              const masterSalary = masterRevenue * MASTER_PERCENT;

              return (
                <div key={m.id} className="group">
                  <div className="grid grid-cols-[1fr_40px_70px_70px] gap-2 items-center text-[13px] mb-2 px-1">
                    {/* Имя */}
                    <span className="text-zinc-300 font-bold group-hover:text-white transition-colors truncate uppercase">
                      {m.name}
                    </span>
                    {/* Количество услуг */}
                    <span className="font-bold text-zinc-500 text-center">
                      {masterApps.length}
                    </span>
                    {/* Общий доход от мастера */}
                    <span className="font-bold text-zinc-100 text-right">
                      {masterRevenue.toLocaleString()}
                    </span>
                    {/* Зарплата (20%) */}
                    <span className="font-black text-[#c5a059] text-right">
                      {masterSalary.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Прогресс-бар визуализирует долю в общем доходе */}
                  <div className="w-full bg-white/[0.03] h-[2px] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#c5a059] opacity-60 transition-all duration-700" 
                      style={{ width: stats.revenue > 0 ? `${(masterRevenue / stats.revenue) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Итоговый финансовый отчет */}
        <div className="pt-5 border-t border-white/10 space-y-3">
          <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg">
            <span className="text-zinc-500 text-[9px] uppercase font-black tracking-tighter">На выплату (20%):</span>
            <span className="text-rose-400 font-black text-sm">-{ (stats.revenue * MASTER_PERCENT).toLocaleString() } ₸</span>
          </div>
          
          <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg">
            <span className="text-zinc-500 text-[9px] uppercase font-black tracking-tighter">В кассу заведения (80%):</span>
            <span className="text-emerald-400 font-black text-sm">+{ (stats.revenue * (1 - MASTER_PERCENT)).toLocaleString() } ₸</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 px-2">
            <span className="text-white text-[10px] uppercase font-black">Общий оборот:</span>
            <span className="text-[#c5a059] text-xl font-black italic">{ stats.revenue.toLocaleString() } ₸</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardSmall({ title, value, color = "text-white" }) {
  return (
    <div className="bg-[#111113] border border-white/5 px-6 py-3 rounded-xl min-w-[160px]">
      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{title}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, disabled }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">{label}</label>
      <input 
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-zinc-700" 
        placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
      />
    </div>
  );
}