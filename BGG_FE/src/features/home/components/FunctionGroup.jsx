import FunctionCard from "./FunctionCard";
import Card from "../../../shared/components/ui/Card";
import CollapsiblePanel from "../../../shared/components/ui/CollapsiblePanel";
import EmptyState from "../../../shared/components/ui/EmptyState";
import Icon from "../../../shared/components/ui/Icon";

function FunctionGroup({
  group,
  defaultOpen = true,
  onFunctionClick,
  onItemClick,
}) {
  const handleClick = onFunctionClick || onItemClick;

  const heading = (
    <span className="flex min-w-0 items-center gap-3 text-base font-bold leading-[1.35] text-egmf-ink md:text-lg">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-egmf-primary-soft text-egmf-primary">
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
                  onClick={handleClick}
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
