import { Link, Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden bg-gray-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Accessories Platform
          </Link>

          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Modern accessories
            </p>

            <h1 className="mt-5 text-5xl font-bold leading-tight">
              Discover accessories made for every style.
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-300">
              Browse products, save your favorites, and manage orders from one
              secure account.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Secure customer and admin access
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="font-bold text-gray-900">
                Accessories Platform
              </Link>

              <Link
                to="/"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Store
              </Link>
            </div>

            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;
