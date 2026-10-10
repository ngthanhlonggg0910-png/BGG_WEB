import BasketFabricRollTree from "../../components/Basket/BasketFabricRollCollapse";

export default function WarehouseDetail({ data = [], loading = false }) {
  return (
    <div className="p-4">
      <BasketFabricRollTree data={data} loading={loading} />
    </div>
  );
}
