"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ItemEditor from "@/components/ItemEditor";
import {
  Add,
  Edit,
  Delete,
  Download,
  Settings,
  Search,
  Inventory2,
} from "@mui/icons-material";
import { itemService, type Item } from "@/services/itemService";

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("itemName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    picture: true,
    itemName: true,
    description: true,
    saleRate: true,
    discountPct: true,
    actions: true,
  });
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    itemID?: number;
    itemName?: string;
  }>({ isOpen: false });

  // Load items
  const loadItems = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await itemService.getList(
        pageNumber,
        pageSize,
        searchTerm || undefined,
        sortBy,
        sortOrder
      );
      
      const itemsArray = response?.items || response || [];
      const totalCountValue = response?.totalCount || itemsArray.length || 0;
      
      setItems(Array.isArray(itemsArray) ? itemsArray : []);
      setTotalCount(totalCountValue);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to load items.";
      setError(message);
      setItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPageNumber(1); 
  }, [searchTerm]);

  useEffect(() => {
    loadItems();
  }, [searchTerm, sortBy, sortOrder, pageNumber, pageSize]);

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setIsEditorOpen(true);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsEditorOpen(true);
  };

  const handleDeleteItem = (item: Item) => {
    setConfirmDelete({
      isOpen: true,
      itemID: item.itemID,
      itemName: item.itemName,
    });
  };

  const confirmItemDelete = async () => {
    if (!confirmDelete.itemID) return;

    setIsLoading(true);
    try {
      await itemService.delete(confirmDelete.itemID);
      setConfirmDelete({ isOpen: false });
      loadItems();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to delete item.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (items.length === 0) {
      alert("No items to export");
      return;
    }

    const headers = [];
    if (visibleColumns.picture) headers.push("Picture");
    if (visibleColumns.itemName) headers.push("Item Name");
    if (visibleColumns.description) headers.push("Description");
    if (visibleColumns.saleRate) headers.push("Sale Rate");
    if (visibleColumns.discountPct) headers.push("Discount %");

    const rows = items.map((item) => {
      const row = [];
      if (visibleColumns.picture) row.push(""); // Skip picture
      if (visibleColumns.itemName) row.push(item.itemName);
      if (visibleColumns.description) row.push(item.description || "");
      if (visibleColumns.saleRate) row.push(item.salesRate);
      if (visibleColumns.discountPct) row.push(item.discountPct);
      return row;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `items-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Items</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your product and service catalog
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="flex items-center gap-2 h-10 px-4 rounded-md bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Add fontSize="small" />
              Add New Item
            </button>
            <button
              onClick={handleExport}
              disabled={items.length === 0}
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

        {showColumnChooser && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-800 mb-3">
              Show/Hide Columns
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { key: "picture", label: "Picture" },
                { key: "itemName", label: "Item Name" },
                { key: "description", label: "Description" },
                { key: "saleRate", label: "Sale Rate" },
                { key: "discountPct", label: "Discount %" },
              ].map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      visibleColumns[col.key as keyof typeof visibleColumns]
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-5" />
              <input
                type="text"
                placeholder="Search by item name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
            >
              <option value="itemName">Item Name</option>
              <option value="saleRate">Sale Rate</option>
              <option value="discountPct">Discount %</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="h-10 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
              <p className="mt-4 text-gray-600">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <Inventory2 className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800">No items found</h3>
              <p className="text-sm text-gray-600 mt-1">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Add your first item to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {visibleColumns.picture && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-16">
                          Picture
                        </th>
                      )}
                      {visibleColumns.itemName && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Item Name
                        </th>
                      )}
                      {visibleColumns.description && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Description
                        </th>
                      )}
                      {visibleColumns.saleRate && (
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                          Sale Rate
                        </th>
                      )}
                      {visibleColumns.discountPct && (
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                          Discount %
                        </th>
                      )}
                      {visibleColumns.actions && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-20">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.itemID}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {visibleColumns.picture && (
                          <td className="px-4 py-3">
                            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                              <Inventory2 className="text-gray-400" />
                            </div>
                          </td>
                        )}
                        {visibleColumns.itemName && (
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">
                              {item.itemName}
                            </p>
                          </td>
                        )}
                        {visibleColumns.description && (
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-600 max-w-xs truncate">
                              {item.description || "-"}
                            </p>
                          </td>
                        )}
                        {visibleColumns.saleRate && (
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ${item.salesRate.toFixed(2)}
                            </p>
                          </td>
                        )}
                        {visibleColumns.discountPct && (
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm text-gray-600">
                              {item.discountPct.toFixed(2)}%
                            </p>
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                                title="Edit item"
                              >
                                <Edit
                                  fontSize="small"
                                  className="text-blue-600"
                                />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                className="p-2 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete item"
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

              <div className="md:hidden p-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.itemID}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex gap-4">
                      {visibleColumns.picture && (
                        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                          <Inventory2 className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        {visibleColumns.itemName && (
                          <p className="font-medium text-gray-900">
                            {item.itemName}
                          </p>
                        )}
                        {visibleColumns.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {item.description || "-"}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm">
                          {visibleColumns.saleRate && (
                            <div>
                              <p className="text-xs text-gray-600">Sale Rate</p>
                              <p className="font-medium text-gray-900">
                                ${item.salesRate.toFixed(2)}
                              </p>
                            </div>
                          )}
                          {visibleColumns.discountPct && (
                            <div>
                              <p className="text-xs text-gray-600">Discount</p>
                              <p className="font-medium text-gray-900">
                                {item.discountPct.toFixed(2)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {visibleColumns.actions && (
                        <div className="flex gap-2 flex-col">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit fontSize="small" className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Delete fontSize="small" className="text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!isLoading && items.length > 0 && (
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
                Page {pageNumber} of {totalPages} ({totalCount} items)
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPageNumber(Math.max(1, pageNumber - 1))
                  }
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

      <ItemEditor
        isOpen={isEditorOpen}
        item={selectedItem}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={() => {
          loadItems();
        }}
      />

      {confirmDelete.isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setConfirmDelete({ isOpen: false })}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800">Delete Item</h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete{" "}
              <strong>{confirmDelete.itemName}</strong>? This action cannot be
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
                onClick={confirmItemDelete}
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

export default ItemsPage;
