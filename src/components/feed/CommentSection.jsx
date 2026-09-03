import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { commentApi } from '../../api/workoutApi';
import { useAuth } from '../../context/AuthContext';

function CommentLikeButton({ comment, onToggle }) {
const [liked, setLiked] = useState(comment.isLikedByCurrentUser);
const [count, setCount] = useState(comment.likeCount);
const [busy, setBusy] = useState(false);

const handleClick = async (e) => {
e.stopPropagation();
if (busy) return;
setBusy(true);
const prevLiked = liked;
setLiked(!prevLiked);
setCount((c) => (prevLiked ? c - 1 : c + 1));
try {
if (prevLiked) await commentApi.unlikeComment(comment.id);
else await commentApi.likeComment(comment.id);
onToggle?.();
} catch {
setLiked(prevLiked);
setCount((c) => (prevLiked ? c + 1 : c - 1));
toast.error('Bir hata oluştu.');
} finally {
setBusy(false);
}
};

return (
<button onClick={handleClick} className="flex items-center gap-1 text-[11px] font-medium transition-colors">
<svg
className={`w-3.5 h-3.5 ${liked ? 'text-red-500' : 'text-slate-500 hover:text-red-400'}`}
fill={liked ? 'currentColor' : 'none'}
viewBox="0 0 24 24"
stroke="currentColor"
strokeWidth={1.8}
>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
</svg>
{count > 0 && <span className={liked ? 'text-red-400' : 'text-slate-500'}>{count}</span>}
</button>
);
}

function CommentRow({ comment, isMine, onEditClick, onReplyClick, isReply }) {
const navigate = useNavigate();

return (
<div className={`flex gap-2.5 group ${isReply ? 'ml-9 mt-2' : ''}`}>
<div
onClick={(e) => { e.stopPropagation(); navigate(`/profile/${comment.userId}`); }}
className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-semibold shrink-0 cursor-pointer overflow-hidden"
>
{comment.userProfilePhotoUrl ? (
<img src={comment.userProfilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
comment.username?.[0]?.toUpperCase()
)}
</div>

<div className="flex-1 min-w-0">
<div className="bg-slate-900 rounded-2xl px-3 py-2 flex items-start gap-2">
<p className="text-sm flex-1 min-w-0">
<span
onClick={(e) => { e.stopPropagation(); navigate(`/profile/${comment.userId}`); }}
className="text-white font-medium cursor-pointer hover:underline"
>
{comment.username}
</span>{' '}
{comment.replyingToUsername && (
<span className="text-emerald-400 text-xs">→ @{comment.replyingToUsername}{' '}</span>
)}
<span className="text-slate-300">{comment.content}</span>
{comment.isEdited && (
<span className="text-slate-500 text-xs italic ml-1.5">(düzenlendi)</span>
)}
</p>

{isMine && (
<button
onClick={(e) => { e.stopPropagation(); onEditClick(comment); }}
className="text-slate-500 hover:text-white transition p-0.5 shrink-0"
>
<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
<path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
</svg>
</button>
)}
</div>

<div className="flex items-center gap-3 mt-1 ml-1">
<CommentLikeButton comment={comment} />
{!isReply && (
<button
onClick={(e) => { e.stopPropagation(); onReplyClick(comment); }}
className="text-[11px] font-medium text-slate-500 hover:text-white transition"
>
Yanıtla
</button>
)}
</div>
</div>
</div>
);
}

function CommentEditForm({ comment, editText, setEditText, onSave, onCancel, saving, isReply }) {
return (
<form
onSubmit={(e) => onSave(e, comment.id)}
className={`flex gap-2 ${isReply ? 'ml-9 mt-2' : ''}`}
>
<input
type="text"
autoFocus
value={editText}
onChange={(e) => setEditText(e.target.value)}
onClick={(e) => e.stopPropagation()}
maxLength={500}
className="flex-1 bg-slate-800 border border-emerald-500/50 rounded-full px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
/>
<button
type="submit"
onClick={(e) => e.stopPropagation()}
disabled={saving || !editText.trim()}
className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30 text-xs font-semibold px-1.5 shrink-0"
>
Kaydet
</button>
<button
type="button"
onClick={onCancel}
className="text-slate-500 hover:text-white text-xs font-medium px-1.5 shrink-0"
>
İptal
</button>
</form>
);
}

function CommentSection({ workoutId, isOpen, onCommentAdded }) {
const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState('');
const [loading, setLoading] = useState(false);
const [posting, setPosting] = useState(false);
const [editingId, setEditingId] = useState(null);
const [editText, setEditText] = useState('');
const [savingEdit, setSavingEdit] = useState(false);
const [replyingTo, setReplyingTo] = useState(null); // { id, username }
const inputRef = useRef(null);
const { user } = useAuth();

useEffect(() => {
if (isOpen && comments.length === 0) {
loadComments();
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen]);

const loadComments = async () => {
setLoading(true);
try {
const res = await commentApi.getForWorkout(workoutId);
setComments(res.data);
} catch {
toast.error('Yorumlar yüklenemedi.');
} finally {
setLoading(false);
}
};

const handleSubmit = async (e) => {
e.preventDefault();
e.stopPropagation();
if (!newComment.trim()) return;

setPosting(true);
try {
const res = await commentApi.add(workoutId, newComment.trim(), replyingTo?.id || null);
setComments((prev) => [...prev, res.data]);
setNewComment('');
setReplyingTo(null);
onCommentAdded?.();
} catch {
toast.error('Yorum eklenemedi.');
} finally {
setPosting(false);
}
};

const startEdit = (comment) => {
setEditingId(comment.id);
setEditText(comment.content);
};

const cancelEdit = (e) => {
e?.stopPropagation();
setEditingId(null);
setEditText('');
};

const handleSaveEdit = async (e, commentId) => {
e.preventDefault();
e.stopPropagation();
if (!editText.trim()) return;

setSavingEdit(true);
try {
const res = await commentApi.update(commentId, editText.trim());
setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, ...res.data } : c)));
setEditingId(null);
setEditText('');
} catch (err) {
toast.error(err.response?.data?.message || 'Yorum düzenlenemedi.');
} finally {
setSavingEdit(false);
}
};

const handleReplyClick = (comment) => {
setReplyingTo({ id: comment.id, username: comment.username });
inputRef.current?.focus();
};

const topLevel = comments.filter((c) => !c.parentCommentId);
const repliesByParent = comments.reduce((acc, c) => {
if (c.parentCommentId) {
acc[c.parentCommentId] = acc[c.parentCommentId] || [];
acc[c.parentCommentId].push(c);
}
return acc;
}, {});

return (
<AnimatePresence>
{isOpen && (
<motion.div
onClick={(e) => e.stopPropagation()}
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.2 }}
className="overflow-hidden border-t border-slate-800"
>
<div className="px-4 py-3 space-y-3">
{loading ? (
<p className="text-slate-500 text-sm">Yükleniyor...</p>
) : topLevel.length === 0 ? (
<p className="text-slate-500 text-sm">Henüz yorum yok, ilk yorumu sen yap.</p>
) : (
topLevel.map((c) => {
const isMine = c.userId === user?.userId;
const isEditing = editingId === c.id;
const replies = repliesByParent[c.id] || [];

return (
<div key={c.id}>
{isEditing ? (
<CommentEditForm
comment={c}
editText={editText}
setEditText={setEditText}
onSave={handleSaveEdit}
onCancel={cancelEdit}
saving={savingEdit}
/>
) : (
<CommentRow comment={c} isMine={isMine} onEditClick={startEdit} onReplyClick={handleReplyClick} />
)}

{replies.map((r) => {
const isReplyEditing = editingId === r.id;
return isReplyEditing ? (
<CommentEditForm
key={r.id}
comment={r}
editText={editText}
setEditText={setEditText}
onSave={handleSaveEdit}
onCancel={cancelEdit}
saving={savingEdit}
isReply
/>
) : (
<CommentRow
key={r.id}
comment={r}
isMine={r.userId === user?.userId}
onEditClick={startEdit}
onReplyClick={handleReplyClick}
isReply
/>
);
})}
</div>
);
})
)}

{replyingTo && (
<div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-full px-3.5 py-1.5 ml-9">
<span className="text-xs text-slate-400">
<span className="text-emerald-400 font-medium">@{replyingTo.username}</span> kullanıcısına yanıt veriyorsun
</span>
<button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-white transition">
<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>
)}

<form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="flex gap-2 pt-1">
<div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-semibold shrink-0">
{user?.username?.[0]?.toUpperCase()}
</div>
<input
ref={inputRef}
type="text"
value={newComment}
onChange={(e) => setNewComment(e.target.value)}
onClick={(e) => e.stopPropagation()}
maxLength={500}
placeholder={replyingTo ? `${replyingTo.username} kullanıcısına yanıt yaz...` : 'Yorum yaz...'}
className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
/>
<button
type="submit"
onClick={(e) => e.stopPropagation()}
disabled={posting || !newComment.trim()}
className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold px-2"
>
Gönder
</button>
</form>
</div>
</motion.div>
)}
</AnimatePresence>
);
}

export default CommentSection;
