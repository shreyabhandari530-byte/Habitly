import { useState } from 'react';
import { Plus } from 'lucide-react';
import useHabits from '../hooks/useHabits';
import HabitList from '../components/habits/HabitList.jsx';
import HabitModal from '../components/habits/HabitModal.jsx';
import { Loader, ErrorMessage, EmptyState, ConfirmDialog } from '../components/common/Common.jsx';
import { CATEGORIES } from '../utils/constants';
export default function Habits() {
  const h = useHabits(); const [modal, setModal] = useState(null), [del, setDel] = useState(null), [cat, setCat] = useState('All'), [q, setQ] = useState('');
  const shown = h.habits.filter(x => (cat === 'All' || x.category === cat) && x.title.toLowerCase().includes(q.toLowerCase()));
  return <div className="page"><div className="row-between"><h1>My habits</h1><button className="btn primary" onClick={() => setModal({})}><Plus size={17} />Add habit</button></div>
    <div className="filters"><input className="search" placeholder="Search habits" value={q} onChange={e => setQ(e.target.value)} /><div className="pills">{['All', ...CATEGORIES].map(c => <button key={c} className={'pill' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}</div></div>
    <div className="card">{h.loading ? <Loader /> : h.error ? <ErrorMessage message={h.error} onRetry={h.reload} /> : shown.length ? <HabitList detailed habits={shown} onToggle={h.toggle} onEdit={setModal} onDelete={setDel} /> : <EmptyState title="No habits found" text="Create a habit or change your filters." action={<button className="btn primary" onClick={() => setModal({})}>Add habit</button>} />}</div>
    {modal && <HabitModal habit={modal.id ? modal : null} onSave={h.save} onClose={() => setModal(null)} />}
    {del && <ConfirmDialog title="Delete habit?" text={`“${del.title}” and its history will be removed.`} onConfirm={async () => { await h.remove(del.id); setDel(null); }} onCancel={() => setDel(null)} />}
  </div>;
}
