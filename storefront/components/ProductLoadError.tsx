export function ProductLoadError() {
  return (
    <section className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
      <div className="rounded-[var(--radius-card)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
        <h2 className="text-xl text-ink">We couldn&apos;t load the catalog</h2>
        <p className="mt-2 text-sm text-taupe">
          Something went wrong reaching our product database. Please refresh the page,
          or check back shortly.
        </p>
      </div>
    </section>
  );
}
