import { cn } from "./utils";

function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-[18px] border border-[#e1e1ec] bg-white shadow-[0_8px_24px_rgba(47,45,105,0.06)]", className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
