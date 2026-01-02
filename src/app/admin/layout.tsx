import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-black">
            <Sidebar />
            {/* Add margin-left only on desktop (lg), add top padding on mobile for header */}
            <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
                {children}
            </main>
        </div>
    );
}
