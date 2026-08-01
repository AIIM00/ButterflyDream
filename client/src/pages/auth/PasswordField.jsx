import { useState } from "react";

function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  autoComplete,
  placeholder,
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-800"
        >
          {label}
        </label>

        <button
          type="button"
          onClick={() => setShowPassword((currentValue) => !currentValue)}
          disabled={disabled}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </div>
  );
}

export default PasswordField;
