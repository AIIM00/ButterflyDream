import { useState } from "react";

// MUI Icons
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

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
    <form
      className="
        mt-7
        space-y-5

        sm:mt-8
      "
      onSubmit={handleSubmit}
      noValidate
    >
      {/* ==================================================
          VALIDATION ERROR
      ================================================== */}

      {validationMessage && (
        <div
          role="alert"
          className="
            rounded-[1rem]

            border
            border-brand-error/20

            bg-brand-error/5

            px-4
            py-3

            text-sm
            font-medium
            leading-5

            text-brand-error
          "
        >
          {validationMessage}
        </div>
      )}

      {/* ==================================================
          EMAIL
      ================================================== */}

      <div>
        <label
          htmlFor="login-email"
          className="
            mb-2

            block

            text-[0.68rem]
            font-semibold
            uppercase

            tracking-[0.12em]

            text-brand-text
          "
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
          className="
            min-h-12
            w-full

            rounded-[1rem]

            border
            border-brand-border

            bg-brand-surface

            px-4

            font-body
            text-sm

            text-brand-text

            outline-none

            transition-all
            duration-200

            placeholder:text-brand-text-muted/55

            hover:border-brand-text/20

            focus:border-brand-accent-fill
            focus:ring-2
            focus:ring-brand-accent-fill/15

            disabled:cursor-not-allowed
            disabled:bg-brand-surface-soft
            disabled:opacity-60
          "
        />
      </div>

      {/* ==================================================
          PASSWORD
      ================================================== */}

      <div>
        <label
          htmlFor="login-password"
          className="
            mb-2

            block

            text-[0.68rem]
            font-semibold
            uppercase

            tracking-[0.12em]

            text-brand-text
          "
        >
          Password
        </label>

        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            disabled={isSubmitting}
            placeholder="Enter your password"
            className="
              min-h-12
              w-full

              rounded-[1rem]

              border
              border-brand-border

              bg-brand-surface

              py-3
              pl-4
              pr-14

              font-body
              text-sm

              text-brand-text

              outline-none

              transition-all
              duration-200

              placeholder:text-brand-text-muted/55

              hover:border-brand-text/20

              focus:border-brand-accent-fill
              focus:ring-2
              focus:ring-brand-accent-fill/15

              disabled:cursor-not-allowed
              disabled:bg-brand-surface-soft
              disabled:opacity-60
            "
          />

          {/* SHOW / HIDE PASSWORD */}

          <button
            type="button"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            disabled={isSubmitting}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="
              absolute
              right-1.5
              top-1/2

              inline-flex
              h-10
              w-10

              -translate-y-1/2

              items-center
              justify-center

              rounded-full

              bg-transparent

              text-brand-text-muted

              transition-all
              duration-200

              hover:bg-brand-primary/5
              hover:text-brand-text

              active:scale-90

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-accent-fill/35

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {showPassword ? (
              <VisibilityOffOutlinedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            ) : (
              <VisibilityOutlinedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* ==================================================
          SUBMIT
      ================================================== */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          inline-flex
          min-h-12
          w-full

          items-center
          justify-center

          rounded-full

          bg-brand-primary

          px-6

          text-sm
          font-semibold

          text-brand-surface

          transition-all
          duration-200

          hover:bg-brand-primary-hover

          active:scale-[0.985]

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-brand-accent-fill/40
          focus-visible:ring-offset-2
          focus-visible:ring-offset-brand-page

          disabled:cursor-not-allowed
          disabled:opacity-55
        "
      >
        {isSubmitting ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}

export default LoginForm;
