import axiosInstance from "./api";

export interface InvoiceLine {
  itemID: number;
  desc: string;
  qty: number;
  rate: number;
  disc: number;
  amount?: number;
}

export interface Invoice {
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
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  itemsCount: number;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
}

export interface InvoiceListResponse {
  invoices: InvoiceListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
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
   * Get list of invoices with filters
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
    const params: Record<string, any> = {
      pageNumber,
      pageSize,
    };

    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (searchTerm) params.searchTerm = searchTerm;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    const response = await axiosInstance.get("/invoice/getlist", { params });
    
    // Handle different response structures
    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      return {
        invoices: data.data,
        totalCount: data.totalCount || data.data.length,
        pageNumber: data.pageNumber || pageNumber,
        pageSize: data.pageSize || pageSize,
      };
    }
    
    if (Array.isArray(data)) {
      return {
        invoices: data,
        totalCount: data.length,
        pageNumber,
        pageSize,
      };
    }

    return data;
  },

  /**
   * Get invoice metrics for date range
   */
  async getMetrics(fromDate?: string, toDate?: string) {
    const params: Record<string, any> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await axiosInstance.get("/invoice/getmetrics", { params });
    return response.data;
  },

  /**
   * Get 12-month trend data
   */
  async getTrend12m() {
    const response = await axiosInstance.get("/invoice/gettrend12m");
    
    // Handle different response structures
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return data || [];
  },

  /**
   * Get top items
   */
  async getTopItems(topN: number = 5, fromDate?: string, toDate?: string) {
    const params: Record<string, any> = { topN };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await axiosInstance.get("/invoice/topitems", { params });
    
    // Handle different response structures
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return data || [];
  },

  /**
   * Insert or update invoice
   */
  async insertUpdate(
    invoiceID: number,
    invoiceNo: string,
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
    const payload: Record<string, any> = {
      invoiceID,
      invoiceNo,
      invoiceDate,
      customerName,
      address,
      city,
      notes,
      lines,
      taxPercentage,
      taxAmount,
    };

    if (updatedOnPrev) {
      payload.updatedOnPrev = updatedOnPrev;
    }

    const response = await axiosInstance.post("/invoice/insertupdate", payload);
    
    const data = response.data;
    if (data.data) {
      return data.data;
    }
    return data;
  },

  /**
   * Delete invoice
   */
  async delete(invoiceID: number) {
    const response = await axiosInstance.post("/invoice/delete", {
      invoiceID,
    });
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  async getByID(invoiceID: number) {
    const response = await axiosInstance.get("/invoice/getbyid", {
      params: { invoiceID },
    });
    
    const data = response.data;
    if (data.data) {
      return data.data;
    }
    return data;
  },
};
