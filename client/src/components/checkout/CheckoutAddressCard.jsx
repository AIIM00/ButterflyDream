import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

function CheckoutAddressCard({
  address,
  selected,
  disabled = false,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(address.id)}
      disabled={disabled}
      aria-pressed={selected}
      className={`
        group
        relative

        w-full

        overflow-hidden

        rounded-[1.5rem]

        border

        p-4

        text-left

        transition-all
        duration-200

        sm:p-5

        ${
          selected
            ? `
                border-brand-accent-fill/45
                bg-brand-accent-soft

                shadow-[0_8px_24px_rgba(0,0,0,0.05)]
              `
            : `
                border-brand-border
                bg-brand-surface

                hover:border-brand-accent-fill/40
                hover:bg-brand-surface-soft
              `
        }

        ${
          disabled
            ? `
                cursor-not-allowed
                opacity-50
              `
            : `
                cursor-pointer
                active:scale-[0.995]
              `
        }

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-accent-fill/40
        focus-visible:ring-offset-2
      `}
    >
      {/* ==================================================
          SELECTED INDICATOR
      ================================================== */}

      {selected && (
        <span
          className="
            absolute
            right-4
            top-4

            inline-flex
            h-8
            w-8

            items-center
            justify-center

            rounded-full

            bg-brand-accent-text

            text-brand-surface

            shadow-sm
          "
        >
          <CheckRoundedIcon
            sx={{
              fontSize: 17,
            }}
          />
        </span>
      )}

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div
        className="
          flex
          items-start
          gap-3.5

          pr-10
        "
      >
        {/* ICON */}

        <span
          className={`
            inline-flex
            h-11
            w-11
            shrink-0

            items-center
            justify-center

            rounded-full

            transition-colors

            ${
              selected
                ? `
                    bg-brand-accent-fill/20
                    text-brand-accent-text
                  `
                : `
                    bg-brand-surface-soft
                    text-brand-text-muted

                    group-hover:text-brand-text
                  `
            }
          `}
        >
          <HomeOutlinedIcon
            sx={{
              fontSize: 20,
            }}
          />
        </span>

        {/* DETAILS */}

        <div className="min-w-0 flex-1">
          {/* LABEL + DEFAULT */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <h3
              className="
                font-display

                text-[1.1rem]
                font-medium

                tracking-[-0.025em]

                text-brand-text
              "
            >
              {address.label}
            </h3>

            {address.isDefault && (
              <span
                className="
                  inline-flex
                  items-center
                  justify-center

                  rounded-full

                  bg-brand-primary

                  px-2.5
                  py-1

                  text-[0.55rem]
                  font-bold
                  uppercase

                  tracking-[0.1em]

                  text-brand-surface
                "
              >
                Default
              </span>
            )}
          </div>

          {/* RECIPIENT */}

          <p
            className="
              mt-3

              text-sm
              font-semibold

              text-brand-text
            "
          >
            {address.recipientName}
          </p>

          {/* PHONE */}

          <p
            className="
              mt-1

              text-xs
              font-medium

              text-brand-text-muted
            "
          >
            {address.phone}
          </p>

          {/* ADDRESS */}

          <p
            className="
              mt-3

              text-sm
              leading-6

              text-brand-text-muted
            "
          >
            {address.street}

            {address.building ? `, ${address.building}` : ""}

            {address.floor ? `, Floor ${address.floor}` : ""}

            <br />

            <span
              className="
                font-medium
                text-brand-text
              "
            >
              {address.city}, {address.governorate}
            </span>
          </p>

          {/* ==================================================
              OPTIONAL DETAILS
          ================================================== */}

          {(address.landmark || address.notes) && (
            <div
              className="
                mt-4

                space-y-2

                border-t
                border-brand-border/70

                pt-3
              "
            >
              {address.landmark && (
                <p
                  className="
                    text-xs
                    leading-5

                    text-brand-text-muted
                  "
                >
                  <span
                    className="
                      font-semibold
                      text-brand-text
                    "
                  >
                    Landmark:
                  </span>{" "}
                  {address.landmark}
                </p>
              )}

              {address.notes && (
                <p
                  className="
                    text-xs
                    leading-5

                    text-brand-text-muted
                  "
                >
                  <span
                    className="
                      font-semibold
                      text-brand-text
                    "
                  >
                    Notes:
                  </span>{" "}
                  {address.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          SELECTED ACCENT
      ================================================== */}

      {selected && (
        <span
          aria-hidden="true"
          className="
            absolute
            bottom-0
            left-6
            right-6

            h-[3px]

            rounded-t-full

            bg-brand-accent-fill
          "
        />
      )}
    </button>
  );
}

export default CheckoutAddressCard;
