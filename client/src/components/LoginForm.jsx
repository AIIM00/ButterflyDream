import { useState } from "react";

function LoginForm({
  onSubmit,
  isSubmitting = false,
  submitLabel = "Sign in",
  emailAutoFocus = false,
}) {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [validationMessage, setValidationMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setValidationMessage("Email is required.");

      return;
    }

    if (!password) {
      setValidationMessage("Password is required.");

      return;
    }

    setValidationMessage("");

    await onSubmit({
      email: normalizedEmail,
      password,
    });
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
      {validationMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {validationMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-semibold text-gray-800"
        >
          Email address
        </label>

        <input
          id="login-email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          autoFocus={emailAutoFocus}
          disabled={isSubmitting}
          placeholder="name@example.com"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="login-password"
            className="block text-sm font-semibold text-gray-800"
          >
            Password
          </label>

          <button
            type="button"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            disabled={isSubmitting}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          disabled={isSubmitting}
          placeholder="Enter your password"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}

export default LoginForm;
