import { BUDGET_DEFAULTS, CATEGORY_BY_SLUG, VENDORS } from "./data";
import type { BudgetGroup, BudgetPlan, RegionId, Vendor } from "./types";

export function sharesFor(region: RegionId | undefined) {
  const hit = BUDGET_DEFAULTS.find((d) => d.region === region);
  return (hit ?? BUDGET_DEFAULTS[0]).shares;
}

export function computeCaps(total: number, region: RegionId): Record<BudgetGroup, number> {
  const shares = sharesFor(region);
  const caps = {} as Record<BudgetGroup, number>;
  (Object.keys(shares) as BudgetGroup[]).forEach((g) => {
    caps[g] = Math.round((total * shares[g]) / 50) * 50; // round to 50 €
  });
  return caps;
}

/** Lower-bound cost estimate for comparing against a category cap. */
export function estimateCost(vendor: Vendor, guests: number): number {
  return vendor.price.kind === "perPerson" ? vendor.price.from * guests : vendor.price.from;
}

export function vendorGroup(vendor: Vendor): BudgetGroup {
  return (CATEGORY_BY_SLUG[vendor.category]?.group ?? "ostalo") as BudgetGroup;
}

/** Vendors above the cap are greyed out with "izvan budžeta" — never hidden. */
export function isOverBudget(vendor: Vendor, plan: BudgetPlan | null): boolean {
  if (!plan) return false;
  const cap = plan.caps[vendorGroup(vendor)];
  return estimateCost(vendor, plan.guests) > cap;
}

/** "Sala ≤ 7.200 € · 12 opcija" — options within cap, per group, in the plan's region. */
export function optionsWithinCap(plan: BudgetPlan, group: BudgetGroup): number {
  return VENDORS.filter(
    (v) =>
      vendorGroup(v) === group &&
      v.region === plan.region &&
      estimateCost(v, plan.guests) <= plan.caps[group]
  ).length;
}

export function vendorsWithinBudget(plan: BudgetPlan): number {
  return VENDORS.filter((v) => v.region === plan.region && !isOverBudget(v, plan)).length;
}
