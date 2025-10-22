import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input } from "antd";

interface FormInputProps<T extends FieldValues> {
  id: Path<T>; // ensures id matches keys in your form schema
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: FieldError;
  control: Control<T>;
  label?: string;
}

const FormInput = <T extends FieldValues>({
  id,
  type = "text",
  placeholder,
  autoComplete,
  error,
  control,
  label,
}: FormInputProps<T>) => {
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

      <Controller
        name={id}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            id={id}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
          />
        )}
      />

      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  );
};

export default FormInput;
