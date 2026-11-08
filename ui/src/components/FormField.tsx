import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Label + input field with shared styling, used across forms (auth, building, room). */
export const FormField = ({ label, error, id, className, ...inputProps }: FormFieldProps) => {
  const inputId = id ?? label;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 ${className ?? ""}`}
        {...inputProps}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

/** Label + select field, same styling as FormField (used for role selection, etc.). */
export const FormSelect = ({
  label,
  options,
  error,
  id,
  className,
  ...selectProps
}: FormSelectProps) => {
  const selectId = id ?? label;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={selectId}
        className={`rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 ${className ?? ""}`}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};

export default FormField;
