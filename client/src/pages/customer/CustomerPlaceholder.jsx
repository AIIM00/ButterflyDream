function CustomerPlaceholder({
  eyebrow = "Butterfly Dream",
  title,
  description,
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-gray-50 px-6 py-16 text-center sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          {eyebrow}
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950">
          {title}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
          {description}
        </p>

        <div className="mx-auto mt-8 h-1 w-20 rounded-full bg-gray-950" />
      </div>
    </section>
  );
}

export default CustomerPlaceholder;
