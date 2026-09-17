"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Close, Add, Delete, ContentCopy } from "@mui/icons-material";
import {
  invoiceEditorSchema,
  type InvoiceEditorFormData,
  type InvoiceLineFormData,
} from "@/validation/invoiceSchema";
import { invoiceService, type Invoice } from "@/services/invoiceService";
import { itemService, type ItemLookupItem } from "@/services/itemService";

interface InvoiceEditorProps {
  invoice?: Invoice | null;
  onSuccess?: () => void;
  onClose: () => void;
}

interface LineWithAmount extends InvoiceLineFormData {
  amount: number;
}

const InvoiceEditor = ({
  invoice,
  onSuccess,
  onClose,
}: InvoiceEditorProps) => {
  const [itemLookup, setItemLookup] = useState<ItemLookupItem[]>([]);
  const [serverError, setServerError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(
    null
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceEditorFormData>({
    resolver: zodResolver(invoiceEditorSchema) as any,
    defaultValues: {
      invoiceNo: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      customerName: "",
      address: "",
      city: "",
      notes: "",
      lines: [{ itemID: 0, desc: "", qty: 0, rate: 0, disc: 0 }],
      taxPercentage: 0,
      taxAmount: 0,
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "lines",
  });

  const watchLines = watch("lines");
  const watchTaxPercentage = watch("taxPercentage");

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  // Load invoice data if editing
  useEffect(() => {
    if (invoice) {
      setValue("invoiceNo", invoice.invoiceNo);
      setValue("invoiceDate", invoice.invoiceDate);
      setValue("customerName", invoice.customerName);
      setValue("address", invoice.address);
      setValue("city", invoice.city);
      setValue("notes", invoice.notes);
      setValue("lines", invoice.lines);
      setValue("taxPercentage", invoice.taxPercentage);
      setValue("taxAmount", invoice.taxAmount);
    } else {
      reset();
    }
  }, [invoice, setValue, reset]);

  const loadItems = async () => {
    try {
      const items = await itemService.getLookupList();
      const itemsArray = Array.isArray(items) ? items : [];
      setItemLookup(itemsArray);
    } catch (error) {
      console.error("Error loading items:", error);
      setItemLookup([]);
    }
  };

  const handleItemChange = (lineIndex: number, itemID: number) => {
    const item = itemLookup.find((i) => i.itemID === itemID);
    if (item) {
      setValue(`lines.${lineIndex}.itemID`, item.itemID);
      setValue(`lines.${lineIndex}.desc`, item.description);
      setValue(`lines.${lineIndex}.rate`, item.saleRate);
      setValue(`lines.${lineIndex}.disc`, item.discountPct);
    }
  };

  const calculateLineAmount = (line: InvoiceLineFormData): number => {
    const subtotal = (line.qty || 0) * (line.rate || 0);
    const discount = subtotal * ((line.disc || 0) / 100);
    return subtotal - discount;
  };

  const calculateSubTotal = (): number => {
    return watchLines.reduce(
      (total, line) => total + calculateLineAmount(line),
      0
    );
  };

  const handleTaxPercentageChange = (percentage: number) => {
    const subTotal = calculateSubTotal();
    const taxAmount = (subTotal * percentage) / 100;
    setValue("taxPercentage", percentage);
    setValue("taxAmount", taxAmount);
  };

  const handleTaxAmountChange = (amount: number) => {
    const subTotal = calculateSubTotal();
    if (subTotal > 0) {
      const percentage = (amount / subTotal) * 100;
      setValue("taxPercentage", percentage);
    }
    setValue("taxAmount", amount);
  };

  const addRow = () => {
    append({ itemID: 0, desc: "", qty: 0, rate: 0, disc: 0 });
  };

  const copyRow = (index: number) => {
    const line = watchLines[index];
    insert(index + 1, { ...line });
  };

  const deleteRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: any) => {
    const formData = data as InvoiceEditorFormData;
    setServerError("");
    setIsLoading(true);

    try {
      const invoiceID = invoice?.invoiceID || 0;
      const updatedOnPrev = invoice?.updatedOn || null;

      await invoiceService.insertUpdate(
        invoiceID,
        formData.invoiceNo,
        formData.invoiceDate,
        formData.customerName,
        formData.address,
        formData.city,
        formData.notes,
        formData.lines,
        formData.taxPercentage,
        formData.taxAmount,
        updatedOnPrev
      );

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        "Failed to save invoice.";

      if (error?.response?.status === 409) {
        setServerError("An invoice with this number already exists.");
      } else if (error?.response?.status === 412) {
        setServerError("Invoice has been updated. Please reload.");
      } else {
        setServerError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setServerError("");
    onClose();
  };

  const subTotal = calculateSubTotal();
  const invoiceAmount = subTotal + (watchTaxPercentage > 0 ? watch("taxAmount") : 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            {invoice?.invoiceID ? "Edit Invoice" : "New Invoice"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <Close />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Invoice Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="invoiceNo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Invoice No
                </label>
                <input
                  id="invoiceNo"
                  type="text"
                  placeholder="INV-001"
                  disabled={isSubmitting}
                  {...register("invoiceNo")}
                  className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 ${
                    errors.invoiceNo ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.invoiceNo && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.invoiceNo.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="invoiceDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Invoice Date<span className="text-red-500">*</span>
                </label>
                <input
                  id="invoiceDate"
                  type="date"
                  disabled={isSubmitting}
                  {...register("invoiceDate")}
                  className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 ${
                    errors.invoiceDate ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.invoiceDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.invoiceDate.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Customer Name<span className="text-red-500">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  placeholder="Enter customer name"
                  disabled={isSubmitting}
                  {...register("customerName")}
                  className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 ${
                    errors.customerName ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="Enter city"
                  disabled={isSubmitting}
                  {...register("city")}
                  className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 ${
                    errors.city ? "border-red-400" : "border-gray-300"
                  }`}
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  rows={2}
                  placeholder="Enter address"
                  disabled={isSubmitting}
                  {...register("address")}
                  className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 resize-none ${
                    errors.address ? "border-red-400" : "border-gray-300"
                  }`}
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Additional notes"
                  disabled={isSubmitting}
                  {...register("notes")}
                  className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 resize-none ${
                    errors.notes ? "border-red-400" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Line Items</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-2 h-8 px-3 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Add fontSize="small" />
                  Add Row
                </button>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 w-12">
                      S.No
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 min-w-32">
                      Item
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 min-w-40">
                      Description
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 w-20">
                      Qty
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 w-24">
                      Rate
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 w-20">
                      Disc %
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 w-28">
                      Amount
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-700 w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const line = watchLines[index];
                    const amount = calculateLineAmount(line);

                    return (
                      <tr
                        key={field.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            {...register(`lines.${index}.itemID`, {
                              valueAsNumber: true,
                              onChange: (e) =>
                                handleItemChange(
                                  index,
                                  parseInt(e.target.value)
                                ),
                            })}
                            disabled={isSubmitting}
                            className="w-full h-8 border border-gray-300 rounded-md px-2 text-sm outline-none focus:border-gray-500"
                          >
                            <option value={0}>Select item...</option>
                            {itemLookup.map((item) => (
                              <option key={item.itemID} value={item.itemID}>
                                {item.itemName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            {...register(`lines.${index}.desc`)}
                            disabled={isSubmitting}
                            className="w-full h-8 border border-gray-300 rounded-md px-2 text-sm outline-none focus:border-gray-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            {...register(`lines.${index}.qty`, {
                              valueAsNumber: true,
                            })}
                            disabled={isSubmitting}
                            className="w-full h-8 border border-gray-300 rounded-md px-2 text-sm outline-none focus:border-gray-500 text-right"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            {...register(`lines.${index}.rate`, {
                              valueAsNumber: true,
                            })}
                            disabled={isSubmitting}
                            className="w-full h-8 border border-gray-300 rounded-md px-2 text-sm outline-none focus:border-gray-500 text-right"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            {...register(`lines.${index}.disc`, {
                              valueAsNumber: true,
                            })}
                            disabled={isSubmitting}
                            className="w-full h-8 border border-gray-300 rounded-md px-2 text-sm outline-none focus:border-gray-500 text-right"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                          ${amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyRow(index)}
                              disabled={isSubmitting}
                              className="p-1 hover:bg-blue-50 rounded transition-colors"
                              title="Copy row"
                            >
                              <ContentCopy fontSize="small" className="text-blue-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRow(index)}
                              disabled={isSubmitting || fields.length === 1}
                              className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Delete row"
                            >
                              <Delete
                                fontSize="small"
                                className="text-red-600"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {errors.lines && (
              <p className="text-xs text-red-500 mt-2">
                {typeof errors.lines === "string" && errors.lines}
                {typeof errors.lines === "object" && errors.lines.root && errors.lines.root.message}
              </p>
            )}
          </section>

          {/* Totals Section */}
          <section className="border-t border-gray-200 pt-6">
            <div className="flex justify-end max-w-xs ml-auto space-y-3">
              {/* Sub Total */}
              <div className="flex justify-between w-full">
                <span className="text-sm text-gray-600">Sub Total:</span>
                <span className="text-sm font-medium text-gray-900">
                  ${subTotal.toFixed(2)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between gap-3 items-center w-full">
                <span className="text-sm text-gray-600">Tax:</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={watchTaxPercentage}
                    onChange={(e) =>
                      handleTaxPercentageChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    className="w-16 h-8 border border-gray-300 rounded-md px-2 text-sm outline-none focus:border-gray-500 text-right"
                  />
                  <span className="text-sm text-gray-600">%</span>
                  <span className="text-sm text-gray-600">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={watch("taxAmount")}
                    onChange={(e) =>
                      handleTaxAmountChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    className="w-24 h-8 border border-gray-300 rounded-md px-2 text-sm outline-none focus:border-gray-500 text-right"
                  />
                </div>
              </div>

              {/* Invoice Amount */}
              <div className="flex justify-between w-full border-t border-gray-200 pt-3 font-semibold">
                <span className="text-base text-gray-900">Invoice Amount:</span>
                <span className="text-lg text-gray-900">
                  ${invoiceAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-10 px-6 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="h-10 px-6 rounded-md bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {isSubmitting || isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceEditor;
