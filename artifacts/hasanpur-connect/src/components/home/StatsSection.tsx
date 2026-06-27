const STATIC_STATS = [
  { label: "Local Businesses", value: "500+" },
  { label: "Categories", value: "40+" },
  { label: "Monthly Visitors", value: "10K+" },
];

export function StatsSection() {
  return (
    <section className="py-10 bg-primary text-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-3 gap-6 text-center">
          {STATIC_STATS.map(({ label, value }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-bold">{value}</p>
              <p className="text-primary-foreground/80 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
