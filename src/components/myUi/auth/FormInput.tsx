import React from "react";
import { type FieldError } from "react-hook-form";

interface FormInputProps {
  id: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: FieldError;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  label?: string;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  type,
  placeholder,
  autoComplete,
  error,
  register,
  label,
  className,
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...register(id)}
        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
          error ? "border border-red-500" : ""
        } ${className}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  );
};

export default FormInput;
