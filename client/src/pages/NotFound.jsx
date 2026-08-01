import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          Page not found
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          The requested page does not exist or has not been implemented yet.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Return to store
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
