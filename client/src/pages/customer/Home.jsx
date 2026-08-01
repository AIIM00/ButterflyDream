import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import useAppContext from "../../context/app/useAppContext";
const benefits = [
  {
    title: "Delivery across Lebanon",
    description:
      "Orders are prepared for delivery through our courier partner.",
    icon: LocalShippingOutlinedIcon,
  },
  {
    title: "Cash on delivery",
    description: "Pay in USD when your order reaches you.",
    icon: PaymentsOutlinedIcon,
  },
  {
    title: "Carefully selected",
    description: "Accessories selected with attention to style and quality.",
    icon: VerifiedOutlinedIcon,
  },
];

function Home() {
  const { isAuthenticated } = useAppContext();
  return (
    <>
      <section className="overflow-hidden bg-gray-50">
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
              Butterfly Dream
            </p>

            <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight text-gray-950 sm:text-6xl">
              Accessories that express your unique style.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Discover carefully selected accessories created to add a special
              touch to every outfit and occasion.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-7 py-3.5 font-semibold text-white transition hover:bg-gray-800"
              >
                Shop collection
                <ArrowForwardRoundedIcon fontSize="small" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-800 transition hover:border-gray-950"
                >
                  Create account
                </Link>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gray-200">
              <div className="flex h-full items-center justify-center px-10 text-center">
                <div>
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-sm">
                    🦋
                  </span>

                  <p className="mt-6 text-lg font-semibold text-gray-700">
                    Main business photography will be added here.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-4 shadow-xl sm:-left-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Designed for
              </p>

              <p className="mt-1 text-lg font-bold text-gray-950">
                Every unique style
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-gray-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          {benefits.map(({ title, description, icon: Icon }) => (
            <article key={title} className="flex gap-4 px-2 py-8 sm:px-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-950">
                <Icon />
              </span>

              <div>
                <h2 className="font-bold text-gray-950">{title}</h2>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Featured collection
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
              Find your next favorite.
            </h2>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-semibold text-gray-950"
          >
            View all products
            <ArrowForwardRoundedIcon fontSize="small" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white"
            >
              <div className="aspect-square bg-gray-100" />

              <div className="p-5">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="mt-3 h-5 w-40 rounded bg-gray-200" />
                <div className="mt-4 h-5 w-20 rounded bg-gray-100" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
