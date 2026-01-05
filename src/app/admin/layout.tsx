import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-black">
            <Sidebar />
            <main className="ml-0 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
                {children}
            </main>
        </div>
    );
}
