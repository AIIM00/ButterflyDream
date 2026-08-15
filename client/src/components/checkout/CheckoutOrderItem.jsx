import { Link } from "react-router-dom";

// MUI Icons
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

function getAvailabilityMessage(item) {
  if (item.availability?.quantityAvailable === false) {
    return `Only ${item.availability.availableStock} units are available.`;
  }

  switch (item.availability?.reason) {
    case "PRODUCT_UNAVAILABLE":
      return "This product is unavailable.";

    case "CATEGORY_UNAVAILABLE":
      return "This product category is unavailable.";

    case "VARIANT_UNAVAILABLE":
      return "This product option is unavailable.";

    case "INVENTORY_MISSING":
      return "Inventory information is unavailable.";

    case "OUT_OF_STOCK":
      return "This product option is out of stock.";

    default:
      return null;
  }
}

function formatOptionName(name) {
  return String(name)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
}

function CheckoutOrderItem({ item }) {
  const availabilityMessage = getAvailabilityMessage(item);

  const options =
    item.variant?.options &&
    typeof item.variant.options === "object" &&
    !Array.isArray(item.variant.options)
      ? Object.entries(item.variant.options)
      : [];

  return (
    <article
      className="
        border-b
        border-brand-border
        py-5

        last:border-b-0

        sm:py-6
      "
    >
      <div
        className="
          flex
          items-start
          gap-3.5

          sm:gap-4
        "
      >
        {/* ==================================================
            PRODUCT IMAGE
        ================================================== */}

        <Link
          to={`/products/${item.product.slug}`}
          aria-label={`View ${item.product.name}`}
          className="
            shrink-0

            overflow-hidden

            rounded-[1.15rem]

            border
            border-brand-border

            bg-brand-surface-soft

            p-1.5

            transition-all
            duration-200

            hover:border-brand-accent-fill/50

            sm:rounded-[1.25rem]
          "
        >
          <div
            className="
              flex
              h-[5.5rem]
              w-[5.5rem]

              items-center
              justify-center

              overflow-hidden

              rounded-[0.85rem]

              bg-brand-surface

              sm:h-24
              sm:w-24
            "
          >
            {item.image?.imageUrl ? (
              <img
                src={item.image.imageUrl}
                alt={item.image.altText || item.product.name}
                loading="lazy"
                className="
                  h-full
                  w-full

                  object-contain

                  p-1
                "
              />
            ) : (
              <span
                className="
                  inline-flex
                  h-10
                  w-10

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-accent-soft

                  text-brand-accent-text
                "
              >
                <ImageNotSupportedOutlinedIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </span>
            )}
          </div>
        </Link>

        {/* ==================================================
            PRODUCT DETAILS
        ================================================== */}

        <div className="min-w-0 flex-1">
          {/* CATEGORY */}

          {item.product.category?.name && (
            <p
              className="
                truncate

                text-[0.55rem]
                font-bold
                uppercase

                tracking-[0.15em]

                text-brand-accent-text

                sm:text-[0.6rem]
              "
            >
              {item.product.category.name}
            </p>
          )}

          {/* NAME + PRICE */}

          <div
            className="
              mt-1

              flex
              flex-col
              gap-1.5

              sm:flex-row
              sm:items-start
              sm:justify-between
              sm:gap-4
            "
          >
            <div className="min-w-0">
              <Link to={`/products/${item.product.slug}`} className="block">
                <h3
                  className="
                    line-clamp-2

                    font-display

                    text-[1.05rem]
                    font-medium

                    leading-[1.08]

                    tracking-[-0.025em]

                    text-brand-text

                    transition-colors

                    hover:text-brand-accent-text

                    sm:text-[1.15rem]
                  "
                >
                  {item.product.name}
                </h3>
              </Link>

              <p
                className="
                  mt-1.5

                  line-clamp-1

                  text-[0.7rem]
                  font-medium

                  text-brand-text-muted

                  sm:text-xs
                "
              >
                {item.variant.displayName}
              </p>
            </div>

            <p
              className="
                shrink-0

                font-display

                text-[1.15rem]
                font-semibold

                leading-none

                tracking-[-0.035em]

                text-brand-text

                sm:text-[1.3rem]
              "
            >
              ${item.lineTotal}
            </p>
          </div>

          {/* ==================================================
              OPTIONS
          ================================================== */}

          {options.length > 0 && (
            <div
              className="
                mt-3

                flex
                flex-wrap

                gap-1.5
              "
            >
              {options.map(([name, value]) => (
                <span
                  key={name}
                  className="
                    inline-flex
                    items-center

                    rounded-full

                    border
                    border-brand-border

                    bg-brand-surface-soft

                    px-2.5
                    py-1

                    text-[0.58rem]
                    font-medium

                    text-brand-text-muted
                  "
                >
                  <span
                    className="
                      mr-1

                      font-semibold

                      text-brand-text
                    "
                  >
                    {formatOptionName(name)}:
                  </span>

                  {String(value)}
                </span>
              ))}
            </div>
          )}

          {/* ==================================================
              QUANTITY + UNIT PRICE
          ================================================== */}

          <div
            className="
              mt-3

              flex
              flex-wrap
              items-center

              gap-x-3
              gap-y-1

              text-[0.65rem]

              text-brand-text-muted

              sm:text-xs
            "
          >
            <span>
              Qty{" "}
              <strong
                className="
                  font-semibold
                  text-brand-text
                "
              >
                {item.quantity}
              </strong>
            </span>

            <span
              aria-hidden="true"
              className="
                h-1
                w-1

                rounded-full

                bg-brand-border
              "
            />

            <span>
              <strong
                className="
                  font-semibold
                  text-brand-text
                "
              >
                ${item.unitPrice}
              </strong>{" "}
              each
            </span>
          </div>

          {/* ==================================================
              PRICE CHANGE WARNING
          ================================================== */}

          {item.priceChanged && (
            <div
              className="
                mt-3

                flex
                items-start
                gap-2.5

                rounded-[0.95rem]

                border
                border-amber-500/20

                bg-amber-50

                px-3
                py-2.5

                text-[0.68rem]
                leading-5

                text-amber-800
              "
            >
              <WarningAmberRoundedIcon
                className="mt-0.5 shrink-0"
                sx={{
                  fontSize: 16,
                }}
              />

              <p>
                Price changed from{" "}
                <span className="font-semibold">${item.unitPriceSnapshot}</span>{" "}
                to <span className="font-semibold">${item.unitPrice}</span>.
              </p>
            </div>
          )}

          {/* ==================================================
              AVAILABILITY ERROR
          ================================================== */}

          {availabilityMessage && (
            <div
              className="
                mt-3

                flex
                items-start
                gap-2.5

                rounded-[0.95rem]

                border
                border-brand-error/20

                bg-brand-error/5

                px-3
                py-2.5

                text-[0.68rem]
                font-semibold
                leading-5

                text-brand-error
              "
            >
              <ErrorOutlineRoundedIcon
                className="mt-0.5 shrink-0"
                sx={{
                  fontSize: 16,
                }}
              />

              <p>{availabilityMessage}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default CheckoutOrderItem;
