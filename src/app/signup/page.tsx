"use client";

import { useState } from "react";
import Link from "next/link";
import {
  VisibilityOutlined,
  VisibilityOffOutlined,
  ImageOutlined,
} from "@mui/icons-material";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Footer from "@/components/Footer"; 
import axiosInstance from "@/services/api";
import { saveToken } from "@/utils/auth";

import {
  signupSchema,
  type SignupFormData,
} from "@/validation/signupSchema";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [logo, setLogo] = useState<File | null>(null);

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      currencySymbol: "₹",
    },
  });

  const password = watch("password", "");

  const getPasswordStrength = () => {
    if (!password) {
      return "Weak";
    }

    if (password.length < 10) {
      return "Weak";
    }

    if (password.length < 14) {
      return "Medium";
    }

    return "Strong";
  };

  const handleLogoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setLogo(null);
      setLogoPreview("");
      return;
    }

    if (
      file.type !== "image/png" &&
      file.type !== "image/jpeg"
    ) {
      setServerError("Only PNG and JPG images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setServerError("Logo size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setServerError("");
    setLogo(file);

    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
  };


  const onSubmit = async (formData: SignupFormData) => {
    setServerError("");
    setSuccess("");

    try {
      const data = new FormData();

      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("password", formData.password);

      data.append("companyName", formData.companyName);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("ZipCode", formData.zip);
      data.append("industry", formData.industry || "");
      data.append(
        "currencySymbol",
        formData.currencySymbol
      );

      if (logo) {
        data.append("logo", logo);
      }

      const response = await axiosInstance.post(
        "/Auth/Signup",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Signup response:", response.data);

      const responseData = response.data;

      if (responseData.token) {
        saveToken(responseData.token, true);
      }

      setSuccess("Account created successfully!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);
    } catch (error: any) {
      console.error("Signup error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        "Unable to create account.";

      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white border border-gray-300">


      <header className="h-14 border-b border-gray-200 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xl text-gray-800">
          <span className="text-2xl">
            ▣
          </span>

          <span>InvoiceApp</span>
        </div>
      </header>


      <main className="flex-1 px-4 py-8">


        <div className="text-center mb-7">

          <h1 className="text-[29px] font-medium text-gray-800">
            Create Your Account
          </h1>

          <p className="mt-1 text-base text-gray-600">
            Set up your company and start invoicing in minutes.
          </p>

        </div>


        <div className="w-full max-w-[784px] mx-auto border border-gray-200 rounded-lg shadow-sm p-7">

          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">


              <section>

                <h2 className="text-lg font-medium text-gray-800 pb-4 border-b border-gray-200">
                  User Information
                </h2>

                <div className="mt-6 space-y-5">


                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      First Name
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="firstName"
                      type="text"
                      placeholder="Enter first name"
                      disabled={isSubmitting}
                      {...register("firstName")}
                      className={`w-full h-10 border rounded-md px-3 text-sm outline-none
                        ${
                          errors.firstName
                            ? "border-red-400"
                            : "border-gray-300"
                        }
                      `}
                    />

                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>


                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      Last Name
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="lastName"
                      type="text"
                      placeholder="Enter last name"
                      disabled={isSubmitting}
                      {...register("lastName")}
                      className={`w-full h-10 border rounded-md px-3 text-sm outline-none
                        ${
                          errors.lastName
                            ? "border-red-400"
                            : "border-gray-300"
                        }
                      `}
                    />

                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>


                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      Email
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                      {...register("email")}
                      className={`w-full h-10 border rounded-md px-3 text-sm outline-none
                        ${
                          errors.email
                            ? "border-red-400"
                            : "border-gray-300"
                        }
                      `}
                    />

                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>


                  <div>

                    <label
                      htmlFor="password"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      Password
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter password"
                        disabled={isSubmitting}
                        {...register("password")}
                        className={`w-full h-10 border rounded-md px-3 pr-11 text-sm outline-none
                          ${
                            errors.password
                              ? "border-red-400"
                              : "border-gray-300"
                          }
                        `}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <VisibilityOffOutlined fontSize="small" />
                        ) : (
                          <VisibilityOutlined fontSize="small" />
                        )}
                      </button>

                    </div>


                    <div className="mt-2">

                      <div className="h-1 bg-gray-200 rounded-full">

                        <div
                          className={`h-full rounded-full transition-all
                            ${
                              getPasswordStrength() === "Weak"
                                ? "w-1/3 bg-gray-400"
                                : getPasswordStrength() === "Medium"
                                ? "w-2/3 bg-gray-500"
                                : "w-full bg-gray-700"
                            }
                          `}
                        />

                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Password strength:{" "}
                        {getPasswordStrength()}
                      </p>

                    </div>

                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.password.message}
                      </p>
                    )}

                  </div>

                </div>
              </section>

              

              <section>

                <h2 className="text-lg font-medium text-gray-800 pb-4 border-b border-gray-200">
                  Company Information
                </h2>

                <div className="mt-6 space-y-5">


                  <div>

                    <label
                      htmlFor="companyName"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      Company Name
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="companyName"
                      type="text"
                      placeholder="Enter company name"
                      disabled={isSubmitting}
                      {...register("companyName")}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm outline-none"
                    />

                    {errors.companyName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.companyName.message}
                      </p>
                    )}

                  </div>


                  <div>

                    <label
                      htmlFor="logo"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      Company Logo
                    </label>

                    <div className="flex gap-3 items-center">

                      <div className="w-[60px] h-[60px] border border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden bg-gray-50">

                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Company logo preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageOutlined className="text-gray-400" />
                        )}

                      </div>

                      <div className="flex-1">

                        <input
                          id="logo"
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleLogoChange}
                          disabled={isSubmitting}
                          className="w-full text-sm border border-gray-300 rounded-md"
                        />

                        <p className="text-xs text-gray-500 mt-1">
                          Max 5 MB • PNG or JPG
                        </p>

                      </div>

                    </div>

                  </div>


                  <div>

                    <label
                      htmlFor="address"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      Address
                      <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      id="address"
                      rows={3}
                      placeholder="Enter company address"
                      disabled={isSubmitting}
                      {...register("address")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none resize-none"
                    />

                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.address.message}
                      </p>
                    )}

                  </div>


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div>

                      <label
                        htmlFor="city"
                        className="block text-sm text-gray-700 mb-2"
                      >
                        City
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="city"
                        type="text"
                        placeholder="Enter city"
                        disabled={isSubmitting}
                        {...register("city")}
                        className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm outline-none"
                      />

                      {errors.city && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.city.message}
                        </p>
                      )}

                    </div>

                    <div>

                      <label
                        htmlFor="zip"
                        className="block text-sm text-gray-700 mb-2"
                      >
                        Zip Code
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="zip"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6 digit zip code"
                        disabled={isSubmitting}
                        {...register("zip")}
                        className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm outline-none"
                      />

                      {errors.zip && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.zip.message}
                        </p>
                      )}

                    </div>

                  </div>


                  <div>

                    <label
                      htmlFor="industry"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      Industry
                    </label>

                    <input
                      id="industry"
                      type="text"
                      placeholder="Industry type"
                      disabled={isSubmitting}
                      {...register("industry")}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm outline-none"
                    />

                    {errors.industry && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.industry.message}
                      </p>
                    )}

                  </div>


                  <div>

                    <label
                      htmlFor="currencySymbol"
                      className="block text-sm text-gray-700 mb-2"
                    >
                      Currency Symbol
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="currencySymbol"
                      type="text"
                      maxLength={5}
                      placeholder="$, ₹, €, AED"
                      disabled={isSubmitting}
                      {...register("currencySymbol")}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm outline-none"
                    />

                    {errors.currencySymbol && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.currencySymbol.message}
                      </p>
                    )}

                  </div>

                </div>
              </section>

            </div>


            <div className="border-t border-gray-200 mt-8 pt-5">

              {serverError && (
                <p className="text-sm text-red-500 text-center mb-4">
                  {serverError}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-600 text-center mb-4">
                  {success}
                </p>
              )}

              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 min-w-[115px] px-6 rounded-md bg-gray-700 text-white text-sm hover:bg-gray-800 disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Signing Up..."
                    : "Sign Up"}
                </button>

              </div>

              <div className="text-center mt-4">

                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                </span>

                <Link
                  href="/login"
                  className="text-sm text-gray-700 hover:underline"
                >
                  Login
                </Link>

              </div>

            </div>

          </form>

        </div>
      </main>


     <Footer/>

    </div>
  );
};

export default SignupPage;