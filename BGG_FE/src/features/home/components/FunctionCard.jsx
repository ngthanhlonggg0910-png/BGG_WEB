function FunctionCard({ item, onClick, onFunctionClick, onItemClick }) {
  const handleClick = onClick || onFunctionClick || onItemClick;
  const Icon = item.icon;

  const handleCardClick = () => {
    if (typeof handleClick === "function") {
      handleClick(item);
    }
  };

  return (
    <button
      className="group relative flex min-h-[142px] w-full items-center justify-center overflow-hidden rounded-[18px] border border-blue-100 bg-[radial-gradient(circle_at_100%_0%,rgba(96,165,250,.22),transparent_38%),linear-gradient(145deg,#ffffff_0%,#f5f9ff_100%)] p-4 text-center shadow-[0_6px_16px_rgba(37,99,235,.05)] transition duration-200 hover:-translate-y-0.5 hover:border-egmf-primary-border hover:shadow-[0_14px_26px_rgba(37,99,235,.14)] focus-visible:-translate-y-0.5 focus-visible:border-egmf-primary-border focus-visible:shadow-[0_14px_26px_rgba(37,99,235,.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 md:min-h-[150px]"
      onClick={handleCardClick}
      title={item.title}
      type="button"
    >
      <span aria-hidden="true" className="absolute -bottom-7 -right-7 size-24 rounded-full border border-blue-200/70 bg-blue-100/35 transition-transform duration-300 group-hover:scale-125" />
      <span aria-hidden="true" className="absolute left-3 top-3 h-px w-9 bg-gradient-to-r from-egmf-primary/50 to-transparent" />
      <span className="relative z-10 w-fit">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-100 p-3 shadow-sm transition group-hover:scale-105 group-hover:border-egmf-primary md:size-[68px]">
          <Icon
            aria-hidden="true"
            className="text-egmf-primary"
            size={34}
            strokeWidth={1.9}
          />
        </span>
        <span className="mt-3 block line-clamp-2 text-center text-[15px] font-bold leading-[1.4] text-egmf-ink-secondary transition-colors group-hover:text-egmf-primary-strong">
          {item.title}
        </span>
      </span>
    </button>
  );
}

export default FunctionCard;
