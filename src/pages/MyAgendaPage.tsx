// import { useEffect, useMemo, useState } from 'react';
// import { getEngineerAgendaTasks } from '../api/agendaApi';
// import { getEngineers } from '../api/engineerApi';
// import type { MaintenanceTask } from '../types/task';
// import type { Engineer } from '../types/engineers';
// import './MyAgendaPage.css';

// const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// function toDateKey(date: Date): string {
//   const year = date.getFullYear();
//   const month = `${date.getMonth() + 1}`.padStart(2, '0');
//   const day = `${date.getDate()}`.padStart(2, '0');

//   return `${year}-${month}-${day}`;
// }

// function formatMonthTitle(date: Date): string {
//   return date.toLocaleDateString('en-US', {
//     month: 'long',
//     year: 'numeric'
//   });
// }

// function getMonthRange(date: Date) {
//   const year = date.getFullYear();
//   const month = date.getMonth();

//   return {
//     startDate: toDateKey(new Date(year, month, 1)),
//     endDate: toDateKey(new Date(year, month + 1, 0))
//   };
// }

// function getCalendarDays(currentMonth: Date): Date[] {
//   const year = currentMonth.getFullYear();
//   const month = currentMonth.getMonth();

//   const firstDayOfMonth = new Date(year, month, 1);
//   const lastDayOfMonth = new Date(year, month + 1, 0);

//   const firstWeekDay = (firstDayOfMonth.getDay() + 6) % 7;
//   const lastWeekDay = (lastDayOfMonth.getDay() + 6) % 7;

//   const calendarStart = new Date(firstDayOfMonth);
//   calendarStart.setDate(firstDayOfMonth.getDate() - firstWeekDay);

//   const calendarEnd = new Date(lastDayOfMonth);
//   calendarEnd.setDate(lastDayOfMonth.getDate() + (6 - lastWeekDay));

//   const days: Date[] = [];
//   const cursor = new Date(calendarStart);

//   while (cursor <= calendarEnd) {
//     days.push(new Date(cursor));
//     cursor.setDate(cursor.getDate() + 1);
//   }

//   return days;
// }

// function getEngineerDisplayName(engineer: Engineer): string {
//   return engineer.fullName ?? engineer.fullName ?? 'Unnamed engineer';
// }

// export function MyAgendaPage() {
//   const [currentMonth, setCurrentMonth] = useState(() => new Date());
//   const [engineers, setEngineers] = useState<Engineer[]>([]);
//   const [selectedEngineerId, setSelectedEngineerId] = useState('');
//   const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [engineersLoading, setEngineersLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const monthRange = useMemo(() => getMonthRange(currentMonth), [currentMonth]);
//   const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

//   const selectedEngineer = useMemo(
//     () => engineers.find(engineer => engineer.id === selectedEngineerId),
//     [engineers, selectedEngineerId]
//   );

//   const tasksByDate = useMemo(() => {
//     return tasks.reduce<Record<string, MaintenanceTask[]>>((acc, task) => {
//       if (!acc[task.scheduledDate]) {
//         acc[task.scheduledDate] = [];
//       }

//       acc[task.scheduledDate].push(task);
//       return acc;
//     }, {});
//   }, [tasks]);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadEngineers() {
//       try {
//         setEngineersLoading(true);
//         setError(null);

//         const data = await getEngineers();

//         if (!cancelled) {
//           setEngineers(data);
//           setSelectedEngineerId(current => current || data[0]?.id || '');
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setError(err instanceof Error ? err.message : 'Failed to load engineers');
//         }
//       } finally {
//         if (!cancelled) {
//           setEngineersLoading(false);
//         }
//       }
//     }

//     loadEngineers();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   useEffect(() => {
//     if (!selectedEngineerId) {
//       setTasks([]);
//       return;
//     }

//     let cancelled = false;

//     async function loadTasks() {
//       try {
//         setLoading(true);
//         setError(null);

//         const data = await getEngineerAgendaTasks(
//           selectedEngineerId,
//           monthRange.startDate,
//           monthRange.endDate
//         );

//         if (!cancelled) {
//           setTasks(data);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setError(err instanceof Error ? err.message : 'Failed to load agenda');
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadTasks();

//     return () => {
//       cancelled = true;
//     };
//   }, [selectedEngineerId, monthRange.startDate, monthRange.endDate]);

//   function goToPreviousMonth() {
//     setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
//   }

//   function goToNextMonth() {
//     setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
//   }

//   function goToToday() {
//     setCurrentMonth(new Date());
//   }

//   const todayKey = toDateKey(new Date());
//   const currentMonthIndex = currentMonth.getMonth();

//   return (
//     <section className="agenda-page">
//       <div className="agenda-shell">
//         <header className="agenda-header">
//           <div>
//             <p className="agenda-eyebrow">Maintenance planning</p>
//             <h1>My Agenda</h1>
//             <p className="agenda-subtitle">
//               {selectedEngineer
//                 ? `Monthly schedule for ${getEngineerDisplayName(selectedEngineer)}`
//                 : 'Select an engineer to view the monthly schedule.'}
//             </p>
//           </div>

//           <div className="agenda-toolbar">
//             <select
//               className="agenda-engineer-select"
//               value={selectedEngineerId}
//               onChange={event => setSelectedEngineerId(event.target.value)}
//               disabled={engineersLoading}
//             >
//               <option value="">
//                 {engineersLoading ? 'Loading engineers...' : 'Select engineer'}
//               </option>

//               {engineers.map(engineer => (
//                 <option key={engineer.id} value={engineer.id}>
//                   {getEngineerDisplayName(engineer)}
//                 </option>
//               ))}
//             </select>

//             <div className="agenda-actions">
//               <button type="button" onClick={goToPreviousMonth} aria-label="Previous month">
//                 ‹
//               </button>

//               <button type="button" className="agenda-today-button" onClick={goToToday}>
//                 Today
//               </button>

//               <button type="button" onClick={goToNextMonth} aria-label="Next month">
//                 ›
//               </button>
//             </div>
//           </div>
//         </header>

//         <main className="agenda-calendar-card">
//           <div className="agenda-calendar-top">
//             <div>
//               <h2>{formatMonthTitle(currentMonth)}</h2>
//               <p>
//                 {loading && 'Loading tasks...'}
//                 {!loading && !error && `${tasks.length} planned tasks`}
//                 {error && <span className="agenda-error">{error}</span>}
//               </p>
//             </div>
//           </div>

//           <div className="agenda-weekdays">
//             {WEEK_DAYS.map(day => (
//               <div key={day}>{day}</div>
//             ))}
//           </div>

//           <div className="agenda-grid">
//             {calendarDays.map(day => {
//               const dateKey = toDateKey(day);
//               const dayTasks = tasksByDate[dateKey] ?? [];
//               const isOutsideMonth = day.getMonth() !== currentMonthIndex;
//               const isToday = dateKey === todayKey;

//               return (
//                 <div
//                   key={dateKey}
//                   className={[
//                     'agenda-day',
//                     isOutsideMonth ? 'agenda-day-muted' : '',
//                     isToday ? 'agenda-day-today' : '',
//                     dayTasks.length > 0 ? 'agenda-day-has-tasks' : ''
//                   ].join(' ')}
//                 >
//                   <div className="agenda-day-head">
//                     <span className="agenda-day-number">{day.getDate()}</span>

//                     {dayTasks.length > 0 && (
//                       <span className="agenda-day-count">{dayTasks.length}</span>
//                     )}
//                   </div>

//                   <div className="agenda-task-list">
//                     {dayTasks.slice(0, 3).map(task => (
//                       <div
//                         key={task.id}
//                         className="agenda-task"
//                         title={`${task.equipmentName} · ${task.status}`}
//                       >
//                         <span className="agenda-task-dot" />
//                         <span className="agenda-task-title">{task.equipmentName}</span>
//                       </div>
//                     ))}

//                     {dayTasks.length > 3 && (
//                       <div className="agenda-more-tasks">
//                         +{dayTasks.length - 3} more
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </main>
//       </div>
//     </section>
//   );
// }