import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';

function PageLayout({ children, rightPanel, fullWidth = false }) {
return (
<div className="min-h-screen bg-slate-950 flex">
<Sidebar />

<div className="flex-1 flex justify-center min-w-0">
{fullWidth ? (
<main className="w-full min-h-screen min-w-0">{children}</main>
) : (
<>
<main className="w-full max-w-2xl min-h-screen min-w-0 border-x-0 lg:border-x border-slate-800 pb-16 lg:pb-0">
{children}

{rightPanel && (
<div className="lg:hidden px-3 sm:px-4 pt-2 pb-6 border-t border-slate-800/80 mt-2 space-y-4">
{rightPanel}
</div>
)}
</main>
{rightPanel && (
<aside className="hidden lg:block w-80 px-4 py-6 sticky top-0 self-start shrink-0">
{rightPanel}
</aside>
)}
</>
)}
</div>

<MobileTabBar />
</div>
);
}

export default PageLayout;
