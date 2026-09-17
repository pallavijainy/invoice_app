import axiosInstance from "./api";

export interface Item {
  primaryKeyID?: number;
  itemID?: number;
  itemName: string;
  description?: string;
  salesRate: number;
  discountPct: number;
  updatedOn?: string;
  picture?: string;
}

export interface ItemLookupItem {
  itemID: number;
  itemName: string;
  description: string;
  salesRate: number;
  discountPct: number;
}

export const itemService = {
  /**
   * Get list of items
   */
  async getList(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) {
    const params: Record<string, any> = {};

    if (searchTerm) params.searchTerm = searchTerm;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    const response = await axiosInstance.get("/Item/GetList", {
      params,
    });
    
    // API returns direct array
    const data = response.data;
    const itemsArray = Array.isArray(data) ? data : [];
    
    return {
      items: itemsArray,
      totalCount: itemsArray.length,
      pageNumber,
      pageSize,
    };
  },

  /**
   * Get lookup list for item selection in invoices
   */
  async getLookupList() {
    const response = await axiosInstance.get("/Item/GetLookupList");
    
    // API returns direct array
    const data = response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Insert a new item
   */
  async insert(
    itemName: string,
    description: string,
    salesRate: number,
    discountPct: number
  ) {
    const payload = {
      itemName,
      description: description || null,
      salesRate,
      discountPct,
    };

    const response = await axiosInstance.post("/Item", payload);
    return response.data;
  },

  /**
   * Update an existing item
   */
  async update(
    itemID: number,
    itemName: string,
    description: string,
    salesRate: number,
    discountPct: number,
    updatedOn?: string | null
  ) {
    const payload: any = {
      itemID,
      itemName,
      description: description || null,
      salesRate,
      discountPct,
    };

    if (updatedOn) {
      payload.updatedOn = updatedOn;
    }

    const response = await axiosInstance.put("/Item", payload);
    return response.data;
  },

  /**
   * Insert or update an item (combined for backward compatibility)
   */
  async insertUpdate(
    itemID: number,
    itemName: string,
    description: string,
    saleRate: number,
    discountPct: number,
    updatedOnPrev?: string | null,
    pictureFile?: File
  ) {
    let result;
    
    if (itemID === 0) {
      // New item
      result = await this.insert(itemName, description, saleRate, discountPct);
    } else {
      // Update item
      result = await this.update(itemID, itemName, description, saleRate, discountPct, updatedOnPrev);
    }

    // Upload picture if provided
    if (pictureFile && result?.primaryKeyID) {
      await this.uploadPicture(result.primaryKeyID, pictureFile);
    }

    return result;
  },

  /**
   * Delete an item
   */
  async delete(itemID: number) {
    const response = await axiosInstance.delete(`/Item/${itemID}`);
    return response.data;
  },

  /**
   * Get item picture URL
   */
  async getPicture(itemID: number) {
    const response = await axiosInstance.get(`/Item/Picture/${itemID}`);
    // API returns URL string
    return response.data;
  },

  /**
   * Get item picture thumbnail URL
   */
  async getPictureThumbnail(itemID: number) {
    const response = await axiosInstance.get(`/Item/PictureThumbnail/${itemID}`);
    // API returns URL string
    return response.data;
  },

  /**
   * Upload item picture
   */
  async uploadPicture(itemID: number, pictureFile: File) {
    const formData = new FormData();
    formData.append("ItemID", itemID.toString());
    formData.append("File", pictureFile);

    const response = await axiosInstance.post("/Item/UpdateItemPicture", formData);
    return response.data;
  },
};
