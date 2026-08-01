import { Link } from "react-router-dom";

const shopLinks = [
  {
    label: "All products",
    path: "/products",
  },
  {
    label: "New arrivals",
    path: "/products",
  },
  {
    label: "Popular products",
    path: "/products",
  },
];

const accountLinks = [
  {
    label: "My account",
    path: "/account",
  },
  {
    label: "My orders",
    path: "/orders",
  },
  {
    label: "Wishlist",
    path: "/wishlist",
  },
];

function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <section className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-950">
              B
            </span>

            <span className="text-xl font-bold">Butterfly Dream</span>
          </Link>

          <p className="mt-5 max-w-sm leading-7 text-gray-400">
            Carefully selected accessories designed to complement your everyday
            style.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Shop</h2>

          <ul className="mt-5 space-y-3">
            {shopLinks.map(({ label, path }) => (
              <li key={label}>
                <Link
                  to={path}
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-bold">Customer</h2>

          <ul className="mt-5 space-y-3">
            {accountLinks.map(({ label, path }) => (
              <li key={label}>
                <Link
                  to={path}
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-bold">Contact</h2>

          <div className="mt-5 space-y-3 text-sm text-gray-400">
            <p>Lebanon</p>
            <p>Cash on delivery</p>
            <p>Customer support information will be added before launch.</p>
          </div>
        </section>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {currentYear} Butterfly Dream. All rights reserved.</p>

          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>

            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default CustomerFooter;
