"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import InvoiceEditor from "@/components/InvoiceEditor";
import { invoiceService, type InvoiceListItem } from "@/services/invoiceService";
import {
  Add,
  Edit,
  Delete,
  Download,
  Settings,
  Print,
  Search,
  Description,
} from "@mui/icons-material";

type DateFilter = "today" | "week" | "month" | "year" | "custom" | "all";

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedInvoiceID, setSelectedInvoiceID] = useState<number | null>(
    null
  );
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    invoiceNo: true,
    invoiceDate: true,
    customerName: true,
    itemsCount: true,
    subTotal: true,
    taxPercentage: true,
    taxAmount: true,
    invoiceAmount: true,
    actions: true,
  });
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    invoiceID?: number;
    invoiceNo?: string;
  }>({ isOpen: false });

  // Get date range based on filter
  const getDateRange = () => {
    const today = new Date();
    let fromDate = "";
    let toDate = today.toISOString().split("T")[0];

    switch (dateFilter) {
      case "today":
        fromDate = toDate;
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        fromDate = weekAgo.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setDate(1);
        fromDate = monthAgo.toISOString().split("T")[0];
        break;
      case "year":
        const yearAgo = new Date(today);
        yearAgo.setMonth(0);
        yearAgo.setDate(1);
        fromDate = yearAgo.toISOString().split("T")[0];
        break;
      case "custom":
        fromDate = customFromDate;
        toDate = customToDate;
        break;
      default:
        return { fromDate: "", toDate: "" };
    }

    return { fromDate, toDate };
  };

  // Load invoices
  const loadInvoices = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { fromDate, toDate } = getDateRange();
      const response = await invoiceService.getList(
        pageNumber,
        pageSize,
        fromDate,
        toDate,
        searchTerm || undefined
      );
      
      // Ensure invoices is always an array
      const invoicesArray = response?.invoices || response || [];
      const totalCountValue = response?.totalCount || invoicesArray.length || 0;
      
      setInvoices(Array.isArray(invoicesArray) ? invoicesArray : []);
      setTotalCount(totalCountValue);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to load invoices.";
      setError(message);
      setInvoices([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPageNumber(1);
  }, [searchTerm, dateFilter]);

  useEffect(() => {
    loadInvoices();
  }, [searchTerm, dateFilter, pageNumber, pageSize]);

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setSelectedInvoiceID(null);
    setIsEditorOpen(true);
  };

  const handleEditInvoice = async (invoiceID: number) => {
    setIsLoading(true);
    try {
      const invoice = await invoiceService.getByID(invoiceID);
      setSelectedInvoice(invoice);
      setSelectedInvoiceID(invoiceID);
      setIsEditorOpen(true);
    } catch (err: any) {
      setError("Failed to load invoice details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = (invoiceItem: InvoiceListItem) => {
    setConfirmDelete({
      isOpen: true,
      invoiceID: invoiceItem.invoiceID,
      invoiceNo: invoiceItem.invoiceNo,
    });
  };

  const confirmInvoiceDelete = async () => {
    if (!confirmDelete.invoiceID) return;

    setIsLoading(true);
    try {
      await invoiceService.delete(confirmDelete.invoiceID);
      setConfirmDelete({ isOpen: false });
      loadInvoices();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to delete invoice.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (invoiceID: number) => {
    window.open(`/invoices/print?id=${invoiceID}`, "_blank");
  };

  const handleExport = () => {
    if (invoices.length === 0) {
      alert("No invoices to export");
      return;
    }

    // Prepare CSV headers
    const headers = [];
    if (visibleColumns.invoiceNo) headers.push("Invoice No");
    if (visibleColumns.invoiceDate) headers.push("Invoice Date");
    if (visibleColumns.customerName) headers.push("Customer Name");
    if (visibleColumns.itemsCount) headers.push("Items Count");
    if (visibleColumns.subTotal) headers.push("Sub Total");
    if (visibleColumns.taxPercentage) headers.push("Tax %");
    if (visibleColumns.taxAmount) headers.push("Tax Amount");
    if (visibleColumns.invoiceAmount) headers.push("Invoice Amount");

    // Prepare CSV rows
    const rows = invoices.map((invoice) => {
      const row = [];
      if (visibleColumns.invoiceNo) row.push(invoice.invoiceNo);
      if (visibleColumns.invoiceDate) row.push(invoice.invoiceDate);
      if (visibleColumns.customerName) row.push(invoice.customerName);
      if (visibleColumns.itemsCount) row.push(invoice.itemsCount);
      if (visibleColumns.subTotal) row.push(invoice.subTotal);
      if (visibleColumns.taxPercentage) row.push(invoice.taxPercentage);
      if (visibleColumns.taxAmount) row.push(invoice.taxAmount);
      if (visibleColumns.invoiceAmount) row.push(invoice.invoiceAmount);
      return row;
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = (
    column: keyof typeof visibleColumns
  ) => {
    if (column === "actions") return;
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Invoices</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage your invoices
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddInvoice}
              className="flex items-center gap-2 h-10 px-4 rounded-md bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Add fontSize="small" />
              New Invoice
            </button>
            <button
              onClick={handleExport}
              disabled={invoices.length === 0}
              className="flex items-center gap-2 h-10 px-4 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download fontSize="small" />
              Export
            </button>
            <button
              onClick={() => setShowColumnChooser(!showColumnChooser)}
              className="flex items-center gap-2 h-10 px-4 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Settings fontSize="small" />
            </button>
          </div>
        </div>

        {/* Column Chooser */}
        {showColumnChooser && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-800 mb-3">
              Show/Hide Columns
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { key: "invoiceNo", label: "Invoice No" },
                { key: "invoiceDate", label: "Date" },
                { key: "customerName", label: "Customer" },
                { key: "itemsCount", label: "Items" },
                { key: "subTotal", label: "Sub Total" },
                { key: "taxPercentage", label: "Tax %" },
                { key: "taxAmount", label: "Tax" },
                { key: "invoiceAmount", label: "Amount" },
              ].map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      visibleColumns[
                        col.key as keyof typeof visibleColumns
                      ]
                    }
                    onChange={() =>
                      toggleColumn(col.key as keyof typeof visibleColumns)
                    }
                    className="w-4 h-4 cursor-pointer accent-gray-700"
                  />
                  <span className="text-sm text-gray-700">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="h-10 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom</option>
              <option value="all">All</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <input
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  className="h-10 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <input
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  className="h-10 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                />
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Invoices Table/Loading */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <Description className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800">
                No invoices found
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Create your first invoice to get started"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {visibleColumns.invoiceNo && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Invoice No
                        </th>
                      )}
                      {visibleColumns.invoiceDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                      )}
                      {visibleColumns.customerName && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                      )}
                      {visibleColumns.itemsCount && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Items
                        </th>
                      )}
                      {visibleColumns.subTotal && (
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Sub Total
                        </th>
                      )}
                      {visibleColumns.taxPercentage && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tax %
                        </th>
                      )}
                      {visibleColumns.taxAmount && (
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tax
                        </th>
                      )}
                      {visibleColumns.invoiceAmount && (
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Invoice Amount
                        </th>
                      )}
                      {visibleColumns.actions && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.invoiceID}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {visibleColumns.invoiceNo && (
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">
                              {invoice.invoiceNo}
                            </p>
                          </td>
                        )}
                        {visibleColumns.invoiceDate && (
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-600">
                              {new Date(invoice.invoiceDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </td>
                        )}
                        {visibleColumns.customerName && (
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-600">
                              {invoice.customerName}
                            </p>
                          </td>
                        )}
                        {visibleColumns.itemsCount && (
                          <td className="px-4 py-3 text-center">
                            <p className="text-sm text-gray-600">
                              {invoice.itemsCount}
                            </p>
                          </td>
                        )}
                        {visibleColumns.subTotal && (
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ${invoice.subTotal.toFixed(2)}
                            </p>
                          </td>
                        )}
                        {visibleColumns.taxPercentage && (
                          <td className="px-4 py-3 text-center">
                            <p className="text-sm text-gray-600">
                              {invoice.taxPercentage.toFixed(2)}%
                            </p>
                          </td>
                        )}
                        {visibleColumns.taxAmount && (
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm text-gray-600">
                              ${invoice.taxAmount.toFixed(2)}
                            </p>
                          </td>
                        )}
                        {visibleColumns.invoiceAmount && (
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ${invoice.invoiceAmount.toFixed(2)}
                            </p>
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleEditInvoice(invoice.invoiceID)
                                }
                                className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                                title="Edit invoice"
                              >
                                <Edit
                                  fontSize="small"
                                  className="text-blue-600"
                                />
                              </button>
                              <button
                                onClick={() => handlePrint(invoice.invoiceID)}
                                className="p-2 hover:bg-green-50 rounded-md transition-colors"
                                title="Print invoice"
                              >
                                <Print
                                  fontSize="small"
                                  className="text-green-600"
                                />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(invoice)}
                                className="p-2 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete invoice"
                              >
                                <Delete
                                  fontSize="small"
                                  className="text-red-600"
                                />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.invoiceID}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      {visibleColumns.invoiceNo && (
                        <p className="font-medium text-gray-900">
                          {invoice.invoiceNo}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleEditInvoice(invoice.invoiceID)
                          }
                          className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit fontSize="small" className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handlePrint(invoice.invoiceID)}
                          className="p-2 hover:bg-green-50 rounded-md transition-colors"
                        >
                          <Print fontSize="small" className="text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice)}
                          className="p-2 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Delete fontSize="small" className="text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {visibleColumns.invoiceDate && (
                        <p className="text-gray-600">
                          <span className="text-gray-900 font-medium">
                            Date:
                          </span>{" "}
                          {new Date(invoice.invoiceDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                      {visibleColumns.customerName && (
                        <p className="text-gray-600">
                          <span className="text-gray-900 font-medium">
                            Customer:
                          </span>{" "}
                          {invoice.customerName}
                        </p>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-900 font-medium">
                          Amount:
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${invoice.invoiceAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!isLoading && invoices.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Rows per page:</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-8 border border-gray-300 rounded-md px-2 text-sm outline-none"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Page {pageNumber} of {totalPages} ({totalCount} invoices)
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber === 1}
                  className="h-8 px-3 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPageNumber(Math.min(totalPages, pageNumber + 1))
                  }
                  disabled={pageNumber === totalPages}
                  className="h-8 px-3 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Editor Modal */}
      {isEditorOpen && (
        <InvoiceEditor
          invoice={selectedInvoice}
          onSuccess={() => {
            loadInvoices();
          }}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedInvoice(null);
            setSelectedInvoiceID(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete.isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setConfirmDelete({ isOpen: false })}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              Delete Invoice
            </h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete{" "}
              <strong>{confirmDelete.invoiceNo}</strong>? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete({ isOpen: false })}
                className="h-10 px-6 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmInvoiceDelete}
                disabled={isLoading}
                className="h-10 px-6 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default InvoicesPage;
