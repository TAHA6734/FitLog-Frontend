export function SkeletonBox({ className = '' }) {
return <div className={`animate-pulse bg-slate-800 rounded ${className}`} />;
}

export function SkeletonAvatar({ className = 'w-10 h-10' }) {
return <div className={`animate-pulse bg-slate-800 rounded-full shrink-0 ${className}`} />;
}

export function SkeletonWorkoutCard() {
return (
<article className="border-b border-slate-800 px-4 py-4">
<div className="flex gap-3">
<SkeletonAvatar className="w-10 h-10" />
<div className="flex-1 min-w-0 space-y-2.5">
<div className="flex items-center gap-2">
<SkeletonBox className="h-3.5 w-24" />
<SkeletonBox className="h-3 w-8" />
<SkeletonBox className="h-5 w-16 rounded-full ml-auto" />
</div>
<SkeletonBox className="h-3.5 w-3/4" />
<SkeletonBox className="h-3.5 w-1/2" />
<div className="flex gap-4 mt-1">
<SkeletonBox className="h-4 w-12" />
<SkeletonBox className="h-4 w-12" />
</div>
<SkeletonBox className="h-48 w-full rounded-xl mt-2" />
<div className="flex gap-6 mt-3">
<SkeletonBox className="h-5 w-10" />
<SkeletonBox className="h-5 w-10" />
<SkeletonBox className="h-5 w-10" />
</div>
</div>
</div>
</article>
);
}

export function SkeletonProfileHeader() {
return (
<div className="border-b border-slate-800">
<SkeletonBox className="h-40 sm:h-52 w-full rounded-none" />
<div className="px-6 pb-8">
<div className="flex items-end justify-between -mt-12 sm:-mt-14 relative z-10">
<SkeletonAvatar className="w-24 h-24 border-4 border-slate-950" />
<SkeletonBox className="h-9 w-28 rounded-lg" />
</div>
<div className="space-y-2.5 mt-4">
<SkeletonBox className="h-6 w-32" />
<SkeletonBox className="h-3.5 w-48" />
</div>
<div className="flex items-center gap-8 mt-6">
{[1, 2, 3, 4].map((i) => (
<div key={i} className="space-y-1.5 text-center">
<SkeletonBox className="h-5 w-8 mx-auto" />
<SkeletonBox className="h-3 w-14 mx-auto" />
</div>
))}
</div>
</div>
</div>
);
}


export function SkeletonConversationItem() {
return (
<div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50">
<SkeletonAvatar className="w-11 h-11" />
<div className="flex-1 space-y-2">
<div className="flex justify-between">
<SkeletonBox className="h-3.5 w-24" />
<SkeletonBox className="h-3 w-8" />
</div>
<SkeletonBox className="h-3 w-36" />
</div>
</div>
);
}

export function SkeletonMessageBubble({ align = 'left' }) {
return (
<div className={`flex mb-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
<SkeletonBox className={`h-10 rounded-2xl ${align === 'right' ? 'w-40' : 'w-32'}`} />
</div>
);
}

export function SkeletonUserRow() {
return (
<div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800">
<SkeletonAvatar className="w-10 h-10" />
<SkeletonBox className="h-3.5 w-32 flex-1" />
<SkeletonBox className="h-7 w-20 rounded-full" />
</div>
);
}

export function SkeletonToggleRow() {
return (
<div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5">
<div className="space-y-2">
<SkeletonBox className="h-3.5 w-32" />
<SkeletonBox className="h-3 w-48" />
</div>
<SkeletonBox className="h-6 w-11 rounded-full" />
</div>
);
}

export function SkeletonCommentRow() {
return (
<div className="flex gap-2.5">
<SkeletonAvatar className="w-8 h-8" />
<SkeletonBox className="h-10 flex-1 rounded-2xl" />
</div>
);
}



