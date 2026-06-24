import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Shared chrome for authenticated pages (dashboard + weekly timesheet).
 * Wraps every child route with the top bar and footer so individual pages
 * only render their own content.
 */
export default function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
