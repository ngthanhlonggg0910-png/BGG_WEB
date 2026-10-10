function FunctionCard({ item, onClick }) {
  return (
    <button
      className="group flex min-h-[142px] w-full items-center justify-center rounded-[18px] border border-[#e5e4ee] bg-[#fbfbfe] p-4 text-center transition duration-200 hover:-translate-y-0.5 hover:border-[#b9b7ed] hover:bg-white hover:shadow-[0_10px_20px_rgba(47,45,105,0.09)] focus-visible:-translate-y-0.5 focus-visible:border-[#b9b7ed] focus-visible:bg-white focus-visible:shadow-[0_10px_20px_rgba(47,45,105,0.09)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6865D9]/15 md:min-h-[150px]"
      onClick={() => onClick(item)}
      title={item.title}
      type="button"
    >
      <span className="w-fit">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#E9E8FB] p-3 transition group-hover:bg-[#6865D9] md:size-[68px]">
          <img
            alt=""
            className="size-full object-contain transition group-hover:brightness-0 group-hover:invert"
            src={item.icon}
          />
        </span>
        <span className="mt-3 block line-clamp-2 text-center text-[15px] font-semibold leading-[1.4] text-[#34333d]">
          {item.title}
        </span>
      </span>
    </button>
  );
}

export default FunctionCard;
