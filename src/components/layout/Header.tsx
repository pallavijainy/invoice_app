"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AccountCircle } from "@mui/icons-material";

interface HeaderProps {
  userEmail?: string;
  companyName?: string;
  onLogout?: () => void;
}

const Header = ({ userEmail = "User", companyName = "Company" }: HeaderProps) => {
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const titleMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/items": "Items",
      "/invoices": "Invoices",
      "/invoice/editor": "Invoice Editor",
    };
    setPageTitle(titleMap[pathname] || "Dashboard");
  }, [pathname]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-800">{userEmail}</p>
          <p className="text-xs text-gray-500">{companyName}</p>
        </div>

        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <AccountCircle fontSize="small" className="text-gray-600" />
        </div>
      </div>
    </header>
  );
};

export default Header;
