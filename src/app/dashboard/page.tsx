"use client";

import AppLayout from "@/components/layout/AppLayout";
import { ArrowRight } from "@mui/icons-material";
import Link from "next/link";

const DashboardPage = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to InvoiceApp
          </h2>
          <p className="text-gray-600">
            Manage your products, services, and invoices all in one place.
          </p>
        </section>

        {/* Company Information Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Company Name</p>
              <p className="text-base font-medium text-gray-900">
                Your Company Name
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Industry</p>
              <p className="text-base font-medium text-gray-900">Your Industry</p>
            </div>
          </div>
        </section>

        {/* Quick Navigation Cards */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Items Card */}
            <Link href="/items">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Items
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your product and service catalog
                    </p>
                  </div>
                  <ArrowRight className="text-gray-400" />
                </div>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
                  Go to Items
                  <ArrowRight fontSize="small" />
                </button>
              </div>
            </Link>

            {/* Invoices Card */}
            <Link href="/invoices">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Invoices
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Create and manage your invoices
                    </p>
                  </div>
                  <ArrowRight className="text-gray-400" />
                </div>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
                  Go to Invoices
                  <ArrowRight fontSize="small" />
                </button>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;