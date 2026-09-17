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
    
    const data = response.data;
    const itemsArray = Array.isArray(data) ? data : [];
    
    return {
      items: itemsArray,
      totalCount: itemsArray.length,
      pageNumber,
      pageSize,
    };
  },
  async getLookupList() {
    const response = await axiosInstance.get("/Item/GetLookupList");
    const data = response.data;
    return Array.isArray(data) ? data : [];
  },

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
      result = await this.insert(itemName, description, saleRate, discountPct);
    } else {
      result = await this.update(itemID, itemName, description, saleRate, discountPct, updatedOnPrev);
    }

    if (pictureFile && result?.primaryKeyID) {
      await this.uploadPicture(result.primaryKeyID, pictureFile);
    }

    return result;
  },


  async delete(itemID: number) {
    const response = await axiosInstance.delete(`/Item/${itemID}`);
    return response.data;
  },


  async getPicture(itemID: number) {
    const response = await axiosInstance.get(`/Item/Picture/${itemID}`);
    return response.data;
  },


  async getPictureThumbnail(itemID: number) {
    const response = await axiosInstance.get(`/Item/PictureThumbnail/${itemID}`);
    return response.data;
  },


  async uploadPicture(itemID: number, pictureFile: File) {
    const formData = new FormData();
    formData.append("ItemID", itemID.toString());
    formData.append("File", pictureFile);

    const response = await axiosInstance.post("/Item/UpdateItemPicture", formData);
    return response.data;
  },
};