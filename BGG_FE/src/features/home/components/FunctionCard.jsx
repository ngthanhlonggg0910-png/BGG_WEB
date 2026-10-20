function FunctionCard({ item, onClick }) {
  const Icon = item.icon;

  return (
    <button
      className="group flex min-h-[142px] w-full items-center justify-center rounded-[18px] border border-egmf-border bg-egmf-surface-subtle p-4 text-center transition duration-200 hover:-translate-y-0.5 hover:border-egmf-primary-border hover:bg-white hover:shadow-[0_10px_20px_rgba(47,45,105,0.09)] focus-visible:-translate-y-0.5 focus-visible:border-egmf-primary-border focus-visible:bg-white focus-visible:shadow-[0_10px_20px_rgba(47,45,105,0.09)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 md:min-h-[150px]"
      onClick={() => onClick(item)}
      title={item.title}
      type="button"
    >
      <span className="w-fit">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-egmf-primary-soft p-3 transition group-hover:bg-egmf-primary md:size-[68px]">
          <Icon
            aria-hidden="true"
            className="text-egmf-primary transition-colors group-hover:text-white"
            size={34}
            strokeWidth={1.9}
          />
        </span>
        <span className="mt-3 block line-clamp-2 text-center text-[15px] font-semibold leading-[1.4] text-egmf-ink-secondary">
          {item.title}
        </span>
      </span>
    </button>
  );
}

export default FunctionCard;
