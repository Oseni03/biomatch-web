"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Droplet,
  LayoutDashboard,
  HeartPulse,
  Wallet,
  Building2,
  Search,
  ClipboardPlus,
  ShieldCheck,
  ListChecks,
  FileSignature,
  Menu,
  X,
  AlertTriangle,
} from "lucide-react";

type Role = "donor" | "hospital" | "admin";

interface NavLink {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_LINKS: Record<Role, NavLink[]> = {
  donor: [
    { label: "Dashboard", href: "/donor", icon: LayoutDashboard },
    { label: "Health Profile", href: "/donor/health-profile", icon: HeartPulse },
    { label: "My BioMatch Wallet", href: "/donor/wallet", icon: Wallet },
  ],
  hospital: [
    { label: "Live Inventory Grid", href: "/hospital/inventory", icon: Building2 },
    { label: "Emergency Request", href: "/hospital/emergency", icon: AlertTriangle },
    { label: "BioMatch Donor Finder", href: "/hospital/donor-finder", icon: Search },
    { label: "Request Blood Drive", href: "/hospital/blood-drive", icon: ClipboardPlus },
  ],
  admin: [
    { label: "System Overview", href: "/admin", icon: ShieldCheck },
    { label: "Verification Queue", href: "/admin/verification", icon: ListChecks },
    { label: "Partner Contracts", href: "/admin/contracts", icon: FileSignature },
  ],
};

interface SidebarLayoutProps {
  role: Role;
  userName?: string;
  children: React.ReactNode;
}

export function SidebarLayout({ role, userName, children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = NAV_LINKS[role];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <BrandHeader />
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden border-b px-6 py-6 lg:block">
          <BrandHeader />
        </div>

        <div className="flex h-full flex-col justify-between pt-16 lg:pt-0">
          <nav className="flex flex-col gap-1 px-3 py-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {role === "donor" ? "Donor Menu" : role === "hospital" ? "Hospital Menu" : "Admin Menu"}
            </p>
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-rose-50 text-rose-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-rose-600" : "text-gray-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
                {userName ? userName.charAt(0).toUpperCase() : "B"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{userName ?? "BioMatch User"}</p>
                <p className="truncate text-xs capitalize text-gray-500">{role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 px-4 pb-10 pt-20 lg:px-8 lg:pt-8">{children}</main>
    </div>
  );
}

function BrandHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-rose-500">
        <Droplet className="h-5 w-5 text-white" fill="white" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-gray-900">BioMatch</p>
        <p className="text-[11px] leading-none text-gray-400">Blood Management</p>
      </div>
    </div>
  );
}
