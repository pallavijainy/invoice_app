"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Close,
  Dashboard,
  Inventory2,
  Description,
  Logout,
} from "@mui/icons-material";

interface SidebarProps {
  companyName?: string;
}

const Sidebar = ({ companyName = "Company" }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Dashboard },
    { label: "Items", href: "/items", icon: Inventory2 },
    { label: "Invoices", href: "/invoices", icon: Description },
  ];

  const isActive = (href: string) => pathname === href;

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? "bg-gray-700 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon fontSize="small" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-700 text-white rounded-md"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <Close /> : <Menu />}
      </button>

      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <span className="text-2xl">▤</span>
            <span className="text-sm">{companyName}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="border-t border-gray-200 p-3">
          <Link
            href="/login?logout=true"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Logout fontSize="small" />
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <span className="text-2xl">▤</span>
            <span className="text-sm">{companyName}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="border-t border-gray-200 p-3">
          <Link
            href="/login?logout=true"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Logout fontSize="small" />
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
