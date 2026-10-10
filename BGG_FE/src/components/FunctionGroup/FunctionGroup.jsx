import FunctionCard from "../FunctionCard/FunctionCard";
import Card from "../ui/Card";
import CollapsiblePanel from "../ui/CollapsiblePanel";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";

function FunctionGroup({ group, defaultOpen, onFunctionClick }) {
  const heading = (
    <span className="flex min-w-0 items-center gap-3 text-base font-bold leading-[1.35] text-[#252530] md:text-lg">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#E9E8FB] text-[#6865D9]">
        <Icon name="grid" size={18} />
      </span>
      <span className="min-w-0">{group.title}</span>
    </span>
  );

  return (
    <section aria-label={group.title} className="mb-4 md:mb-5">
      <Card className="overflow-hidden">
        <CollapsiblePanel
          defaultOpen={defaultOpen}
          key={`${group.key}-${defaultOpen}`}
          title={heading}
        >
          {group.items.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4 min-[1440px]:grid-cols-5">
              {group.items.map((item) => (
                <FunctionCard
                  item={item}
                  key={item.key}
                  onClick={onFunctionClick}
                />
              ))}
            </div>
          ) : (
            <EmptyState>
              Các chức năng sẽ được bổ sung trong thời gian tới
            </EmptyState>
          )}
        </CollapsiblePanel>
      </Card>
    </section>
  );
}

export default FunctionGroup;
