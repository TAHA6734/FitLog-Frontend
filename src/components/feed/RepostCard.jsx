import { useNavigate } from 'react-router-dom';
import WorkoutCard from './WorkoutCard';

function RepostCard({ repost }) {
const navigate = useNavigate();

return (
<div className="border-b border-slate-800">
<div className="px-4 pt-3 pb-1 flex items-center gap-2 text-xs text-slate-500">
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
<span
onClick={() => navigate(`/profile/${repost.userId}`)}
className="font-medium text-slate-400 hover:text-white cursor-pointer transition"
>
{repost.username}
</span>
<span>paylaştı</span>
</div>

{repost.note && (
<p className="px-4 pb-2 text-sm text-slate-200">{repost.note}</p>
)}

<div className="mx-4 mb-3 rounded-xl border border-slate-800 overflow-hidden">
<WorkoutCard workout={repost.workout} />
</div>
</div>
);
}

export default RepostCard;










