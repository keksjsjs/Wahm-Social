/** Plan price overrides set from the admin panel (server: globalThis; client: defaults). */
export type PriceOverrides = { proMonthly: number; proYearly: number; bizMonthly: number; bizYearly: number };
const g = globalThis as unknown as { __frostlyPrices?: PriceOverrides };
export const priceOverrides = () => g.__frostlyPrices;
export const setPriceOverrides = (p: PriceOverrides) => {
  g.__frostlyPrices = p;
};
