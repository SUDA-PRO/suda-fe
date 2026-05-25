import { LocationService } from "../elements/Location";
import { StoreService } from "./Store/service";

export const getLocalities = {
  admin: async (tenant) => {
    await StoreService.defaultData(tenant, tenant, Digit.StoreData.getCurrentLanguage());
    const res = await LocationService.getLocalities(tenant);
    return res?.TenantBoundary?.[0] || null;
  },
  revenue: async (tenant) => {
    await StoreService.defaultData(tenant, tenant, Digit.StoreData.getCurrentLanguage());
    const res = await LocationService.getRevenueLocalities(tenant);
    return res?.TenantBoundary?.[0] || null;
  },
  grampanchayats: async (tenant) => {
    await StoreService.defaultData(tenant, tenant, Digit.StoreData.getCurrentLanguage());
    const res = await LocationService.getGramPanchayats(tenant);
    return res?.TenantBoundary?.[0] || null;
  },
};