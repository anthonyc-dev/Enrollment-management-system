import React from "react";
import { MessageCircleWarning } from "lucide-react";
import { Link } from "react-router-dom";

interface NdaAgreementProps {
  register: any;
  errors: any;
  label: string;
  linkText: string;
  linkUrl: string;
}

const NdaAgreement: React.FC<NdaAgreementProps> = ({
  register,
  errors,
  label,
  linkText,
  linkUrl,
}) => {
  return (
    <div className="my-5">
      <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600 gap-2">
        <input
          id="nda"
          type="checkbox"
          className={`h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
            errors?.nda ? "border-red-500" : ""
          }`}
          {...register("nda", {
            required: "You must agree to the Non-Disclosure Agreement.",
          })}
        />
        <label
          htmlFor="nda"
          className="ml-2 flex items-center gap-2 cursor-pointer"
        >
          {label}{" "}
          <Link
            to={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline hover:text-indigo-500 transition"
          >
            {linkText}
          </Link>
          <MessageCircleWarning
            className="inline-block text-indigo-600"
            size={16}
          />
        </label>
      </div>
      {errors?.nda && (
        <span className="block text-xs text-red-600 mt-1">
          {errors.nda.message}
        </span>
      )}
    </div>
  );
};

export default NdaAgreement;
