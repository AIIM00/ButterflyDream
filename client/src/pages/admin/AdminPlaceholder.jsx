function AdminPlaceholder({ title, description }) {
  return (
    <section>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Administration
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
          {title}
        </h2>

        <p className="mt-4 max-w-2xl leading-7 text-gray-600">{description}</p>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center text-sm font-medium text-gray-500">
          This management feature will be implemented in its dedicated step.
        </div>
      </div>
    </section>
  );
}

export default AdminPlaceholder;
