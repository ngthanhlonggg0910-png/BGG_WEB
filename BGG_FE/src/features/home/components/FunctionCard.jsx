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
      className="group flex min-h-[142px] w-full items-center justify-center rounded-[18px] border border-slate-200 bg-white p-4 text-center shadow-[0_4px_12px_rgba(15,23,42,.04)] transition duration-200 hover:-translate-y-0.5 hover:border-egmf-primary-border hover:shadow-[0_12px_22px_rgba(37,99,235,.1)] focus-visible:-translate-y-0.5 focus-visible:border-egmf-primary-border focus-visible:shadow-[0_12px_22px_rgba(37,99,235,.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-egmf-primary/15 md:min-h-[150px]"
      onClick={handleCardClick}
      title={item.title}
      type="button"
    >
      <span className="w-fit">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-blue-100 bg-blue-50 p-3 shadow-sm transition group-hover:scale-105 group-hover:border-egmf-primary md:size-[68px]">
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
