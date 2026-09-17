"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { invoiceService, type Invoice } from "@/services/invoiceService";

function InvoicePrintContent() {
  const searchParams = useSearchParams();
  const invoiceID = searchParams.get("id");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceID) {
        setError("Invoice ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        const data = await invoiceService.getByID(parseInt(invoiceID));
        setInvoice(data);
      } catch (err: any) {
        setError("Failed to load invoice");
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceID]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error || "Invoice not found"}</p>
        </div>
      </div>
    );
  }

  const calculateLineAmount = (qty: number = 0, rate: number = 0, disc: number = 0) => {
    const subtotal = qty * rate;
    const discount = subtotal * (disc / 100);
    return subtotal - discount;
  };

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none;
          }
          .print-container {
            page-break-after: avoid;
          }
        }
      `}</style>

      <div className="no-print mb-6 flex gap-2">
        <button
          onClick={() => window.print()}
          className="h-10 px-6 rounded-md bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Print Invoice
        </button>
        <button
          onClick={() => window.history.back()}
          className="h-10 px-6 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>

      <div className="print-container max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-12">
        <div className="flex justify-between items-start mb-12 pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {invoice.invoiceNo}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              From
            </h3>
            <p className="text-lg font-semibold text-gray-900">Your Company</p>
            <p className="text-sm text-gray-600 mt-2">Company Address</p>
            <p className="text-sm text-gray-600">City, Country</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Bill To
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {invoice.customerName}
            </p>
            {invoice.address && (
              <p className="text-sm text-gray-600 mt-2">{invoice.address}</p>
            )}
            {invoice.city && (
              <p className="text-sm text-gray-600">{invoice.city}</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b border-gray-300">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">
                  Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">
                  Discount %
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <p className="font-medium">{line.description}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {(line.quantity || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    ${line.rate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {(line.discountPct || 0).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    $
                    {calculateLineAmount(
                      line.quantity || 0,
                      line.rate,
                      line.discountPct || 0
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-full max-w-sm">
            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="text-sm font-medium text-gray-900">
                Sub Total:
              </span>
              <span className="text-sm font-medium text-gray-900">
                ${invoice.subTotal.toFixed(2)}
              </span>
            </div>

            {invoice.taxPercentage > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">
                  Tax ({invoice.taxPercentage.toFixed(2)}%):
                </span>
                <span className="text-sm text-gray-600">
                  ${invoice.taxAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-3 border-t border-gray-300 border-b border-gray-300">
              <span className="text-lg font-semibold text-gray-900">
                Invoice Total:
              </span>
              <span className="text-lg font-semibold text-gray-900">
                ${invoice.invoiceAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}

        <div className="pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Thank you for your business</p>
          <p className="mt-2">© 2025 InvoiceApp. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

const InvoicePrintPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvoicePrintContent />
    </Suspense>
  );
};

export default InvoicePrintPage;
