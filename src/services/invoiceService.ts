import axiosInstance from "./api";

export interface InvoiceLine {
  rowNo?: number;
  itemID: number;
  description: string;
  quantity: number;
  rate: number;
  discountPct: number;
}

export interface Invoice {
  primaryKeyID?: number;
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  address: string;
  city: string;
  notes: string;
  lines: InvoiceLine[];
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
  updatedOn?: string;
}

export interface InvoiceListItem {
  primaryKeyID?: number;
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  itemsCount?: number;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
}

export interface InvoiceMetrics {
  invoicesCount: number;
  totalAmount: number;
}

export interface TrendData {
  month: string;
  invoiceCount: number;
  amount: number;
}

export interface TopItem {
  itemID: number;
  itemName: string;
  quantity: number;
  amount: number;
}

export const invoiceService = {
  /**
   * Get list of invoices
   */
  async getList(
    pageNumber: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string,
    searchTerm?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) {
    const params: Record<string, any> = {};

    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (searchTerm) params.searchTerm = searchTerm;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    const response = await axiosInstance.get("/Invoice/GetList", { params });
    
    // API returns direct array
    const data = response.data;
    const invoicesArray = Array.isArray(data) ? data : [];
    
    return {
      invoices: invoicesArray,
      totalCount: invoicesArray.length,
      pageNumber,
      pageSize,
    };
  },

  /**
   * Get invoice metrics for date range
   */
  async getMetrics(fromDate?: string, toDate?: string) {
    const params: Record<string, any> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await axiosInstance.get("/Invoice/GetMetrics", { params });
    return response.data;
  },

  /**
   * Get 12-month trend data
   */
  async getTrend12m() {
    const response = await axiosInstance.get("/Invoice/GetTrend12m");
    
    // API returns direct array
    const data = response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get top items
   */
  async getTopItems(topN: number = 5, fromDate?: string, toDate?: string) {
    const params: Record<string, any> = { topN };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await axiosInstance.get("/Invoice/TopItems", { params });
    
    // API returns direct array
    const data = response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Insert or update invoice
   */
  async insertUpdate(
    invoiceID: number,
    invoiceNo: number,
    invoiceDate: string,
    customerName: string,
    address: string,
    city: string,
    notes: string,
    lines: InvoiceLine[],
    taxPercentage: number,
    taxAmount: number,
    updatedOnPrev?: string | null
  ) {
    // Transform lines to API format
    const apiLines = lines.map((line, index) => ({
      rowNo: (line.rowNo || index + 1),
      itemID: line.itemID,
      description: line.description || '',
      quantity: line.quantity || 0,
      rate: line.rate || 0,
      discountPct: line.discountPct || 0,
    }));

    const payload: Record<string, any> = {
      invoiceNo: Number(invoiceNo), // Convert to number
      invoiceDate,
      customerName,
      address,
      city,
      notes,
      lines: apiLines,
      taxPercentage,
      taxAmount: taxAmount || 0,
    };

    // Add invoiceID and updatedOnPrev for updates
    if (invoiceID > 0) {
      payload.invoiceID = invoiceID;
      if (updatedOnPrev) {
        payload.updatedOnPrev = updatedOnPrev;
      }
    }

    // Use POST for new, PUT for update
    const method = invoiceID === 0 ? "post" : "put";
    const response = await axiosInstance[method]("/Invoice", payload);
    
    return response.data;
  },

  /**
   * Delete invoice
   */
  async delete(invoiceID: number) {
    const response = await axiosInstance.delete(`/Invoice/${invoiceID}`);
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  async getByID(invoiceID: number) {
    const response = await axiosInstance.get(`/Invoice/${invoiceID}`);
    
    const data = response.data;
    return data;
  },
};
