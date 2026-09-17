import axiosInstance from "./api";

export interface Item {
  itemID: number;
  itemName: string;
  description: string;
  saleRate: number;
  discountPct: number;
  updatedOn?: string;
  picture?: string;
}

export interface ItemListResponse {
  items: Item[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ItemLookupItem {
  itemID: number;
  itemName: string;
  description: string;
  saleRate: number;
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
    const params: Record<string, any> = {
      pageNumber,
      pageSize,
    };

    if (searchTerm) params.searchTerm = searchTerm;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    const response = await axiosInstance.get("/item/getlist", {
      params,
    });
    
    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      return {
        items: data.data,
        totalCount: data.totalCount || data.data.length,
        pageNumber: data.pageNumber || pageNumber,
        pageSize: data.pageSize || pageSize,
      };
    }
    
    if (Array.isArray(data)) {
      return {
        items: data,
        totalCount: data.length,
        pageNumber,
        pageSize,
      };
    }

    return data;
  },

  async getLookupList() {
    const response = await axiosInstance.get("/item/getlookuplist");
    
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return data || [];
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
    const formData = new FormData();
    formData.append("itemID", itemID.toString());
    formData.append("itemName", itemName);
    formData.append("description", description);
    formData.append("saleRate", saleRate.toString());
    formData.append("discountPct", discountPct.toString());

    if (updatedOnPrev) {
      formData.append("updatedOnPrev", updatedOnPrev);
    }

    if (pictureFile) {
      formData.append("picture", pictureFile);
    }

    const response = await axiosInstance.post<Item>("/item", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async delete(itemID: number) {
    const response = await axiosInstance.post("/item/delete", {
      itemID,
    });
    return response.data;
  },

  async getPicture(itemID: number) {
    const response = await axiosInstance.get(`/item/picture`, {
      params: { itemID },
      responseType: "blob",
    });
    return response.data;
  },

  async getPictureThumbnail(itemID: number) {
    const response = await axiosInstance.get(`/item/pictureThumbnail`, {
      params: { itemID },
      responseType: "blob",
    });
    return response.data;
  },

  async uploadPicture(itemID: number, pictureFile: File) {
    const formData = new FormData();
    formData.append("itemID", itemID.toString());
    formData.append("picture", pictureFile);

    const response = await axiosInstance.post("/item/picture/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
