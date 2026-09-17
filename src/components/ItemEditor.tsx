"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Close, Image } from "@mui/icons-material";
import { itemEditorSchema, type ItemEditorFormData } from "@/validation/itemSchema";
import { itemService, type Item } from "@/services/itemService";

interface ItemEditorProps {
  isOpen: boolean;
  item?: Item | null;
  onClose: () => void;
  onSuccess?: (item: Item) => void;
}

const ItemEditor = ({ isOpen, item, onClose, onSuccess }: ItemEditorProps) => {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemEditorFormData>({
    resolver: zodResolver(itemEditorSchema) as any,
    defaultValues: {
      itemName: "",
      description: "",
      saleRate: 0,
      discountPct: 0,
    },
  });

  const description = watch("description", "");

  useEffect(() => {
    setDescriptionLength(description?.length || 0);
  }, [description]);

  useEffect(() => {
    if (isOpen && item) {
      setValue("itemName", item.itemName);
      setValue("description", item.description || "");
      setValue("saleRate", item.salesRate || 0);
      setValue("discountPct", item.discountPct || 0);
      setDescriptionLength(item.description?.length || 0);

      // Load item picture if available
      if (item.itemID && item.itemID > 0) {
        loadItemPicture(item.itemID);
      }
    } else {
      reset();
      setImagePreview("");
      setSelectedFile(null);
      setDescriptionLength(0);
    }
  }, [isOpen, item, setValue, reset]);

  const loadItemPicture = async (itemID: number) => {
    try {
      const url = await itemService.getPictureThumbnail(itemID);
      // URL is returned directly from API
      if (typeof url === 'string') {
        setImagePreview(url);
      }
    } catch (error) {
      console.error("Error loading item picture:", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setServerError("Only PNG and JPG images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setServerError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setServerError("");
    setSelectedFile(file);

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const onSubmit = async (data: any) => {
    const formData = data as ItemEditorFormData;
    setServerError("");
    setIsLoading(true);

    try {
      const itemID = item?.itemID || 0;
      const updatedOnPrev = item?.updatedOn || null;

      const result = await itemService.insertUpdate(
        itemID,
        formData.itemName,
        formData.description,
        formData.saleRate,
        formData.discountPct,
        updatedOnPrev,
        selectedFile || undefined
      );

      onSuccess?.(result);
      handleClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        "Failed to save item.";

      if (error?.response?.status === 409) {
        setServerError("An item with this name already exists.");
      } else if (error?.response?.status === 412) {
        setServerError(
          "Item has been updated by another user. Please reload."
        );
      } else {
        setServerError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setImagePreview("");
    setSelectedFile(null);
    setServerError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg z-50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            {item?.itemID ? "Edit Item" : "New Item"}
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
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Item Picture
            </label>
            <div className="flex gap-4">
              {/* Preview */}
              <div className="w-[100px] h-[100px] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Item preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image className="text-gray-400 text-4xl" />
                )}
              </div>

              {/* File Input */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  PNG or JPG, max 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label
              htmlFor="itemName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Item Name<span className="text-red-500">*</span>
            </label>
            <input
              id="itemName"
              type="text"
              placeholder="Enter item name"
              disabled={isSubmitting}
              {...register("itemName")}
              className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 ${
                errors.itemName ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.itemName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.itemName.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Enter item description"
              disabled={isSubmitting}
              {...register("description")}
              className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 resize-none ${
                errors.description ? "border-red-400" : "border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {descriptionLength}/500
              </span>
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Sale Rate & Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="saleRate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sale Rate<span className="text-red-500">*</span>
              </label>
              <input
                id="saleRate"
                type="number"
                step="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
                {...register("saleRate", { valueAsNumber: true })}
                className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 ${
                  errors.saleRate ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.saleRate && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.saleRate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="discountPct"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Discount %
              </label>
              <input
                id="discountPct"
                type="number"
                step="0.01"
                placeholder="0"
                disabled={isSubmitting}
                {...register("discountPct", { valueAsNumber: true })}
                className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 ${
                  errors.discountPct ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.discountPct && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.discountPct.message}
                </p>
              )}
            </div>
          </div>

          {/* Server Error */}
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
    </>
  );
};

export default ItemEditor;
