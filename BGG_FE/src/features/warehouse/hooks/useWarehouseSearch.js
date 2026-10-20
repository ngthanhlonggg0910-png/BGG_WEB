import { useEffect, useRef, useState } from "react";

import {
  searchByMaRo,
  searchByItemCode,
  searchMaterialLocations,
  getBasketFabricRolls,
  getBasketsByWarehouseLocation,
  getFabricRollsByRo,
} from "../api/warehouseApi";
import { getAccountId } from "../../../shared/auth/session";

async function fetchSearchResult(searchType, warehouseId, keyword, accountId) {
  switch (searchType) {
    case "RO": {
      const response = await searchByMaRo({
        KID: warehouseId,
        MaHang: keyword,
        TKId: Number(accountId),
      });

      const groups = (response.data ?? []).flat();
      const data = [];

      for (const item of groups) {
        const rollResponse = await getFabricRollsByRo(
          warehouseId,
          keyword,
          item.Item,
          item.Art ?? "",
          item.Lot ?? "",
          item.MaMau ?? "",
          Number(accountId),
        );

        data.push({
          ...item,
          fabricRolls: rollResponse.data ?? [],
        });
      }

      return { data };
    }

    case "VI_TRI": {
      const response = await getBasketsByWarehouseLocation(
        Number(warehouseId),
        keyword,
      );
      const baskets = response.data ?? [];
      const data = [];

      for (const basket of baskets) {
        const rollResponse = await getBasketFabricRolls(
          Number(warehouseId),
          basket.MaRo,
          Number(accountId),
        );

        data.push({
          ...basket,
          fabricRolls: rollResponse.data ?? [],
        });
      }

      return { data };
    }

    case "VAT_TU": {
      const response = await searchMaterialLocations(
        Number(warehouseId),
        keyword,
        Number(accountId),
      );
      return { data: response.data ?? [] };
    }

    case "MA_HANG": {
      const response = await searchByItemCode(Number(warehouseId), keyword);
      return { data: response.data ?? [] };
    }

    default:
      throw new Error("Chức năng chưa được hỗ trợ");
  }
}

export function useWarehouseSearch(warehouseId) {
  const [resultSearch, setResultSearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  const reset = () => {
    requestIdRef.current += 1;
    setResultSearch(null);
    setError("");
    setLoading(false);
  };

  const search = async (searchType, value) => {
    const keyword = value.trim();
    if (!keyword) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    setResultSearch(null);

    try {
      const accountId = getAccountId();

      if (!accountId) {
        throw new Error("Không tìm thấy tài khoản");
      }

      const result = await fetchSearchResult(
        searchType,
        warehouseId,
        keyword,
        accountId,
      );

      if (requestId === requestIdRef.current) {
        setResultSearch(result);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message || "Tìm kiếm thất bại");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  return { resultSearch, loading, error, search, reset };
}
