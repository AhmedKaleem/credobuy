"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type {
  Brand,
  Category,
  DeviceBrand,
  DeviceModel,
  Product,
  ProductFilters,
  SortOption,
} from "@/types";
import { applyFilters, buildFacets } from "@/lib/catalog-utils";
import { ProductGrid } from "./ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/form";
import { formatINR, cn } from "@/lib/utils";
import { PackageSearch } from "lucide-react";

interface ProductBrowserProps {
  products: Product[];
  categories: Category[];
  brands?: Brand[];
  deviceBrands: DeviceBrand[];
  deviceModels: DeviceModel[];
  lockedCategorySlug?: string;
  lockedModelId?: string;
  initialSort?: SortOption;
  initialSearch?: string;
}

const sortLabels: Record<SortOption, string> = {
  relevance: "Relevance",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  rating_desc: "Customer Rating",
  newest: "Newest First",
  discount_desc: "Discount",
};

export function ProductBrowser({
  products,
  categories,
  brands = [],
  deviceBrands,
  deviceModels,
  lockedCategorySlug,
  lockedModelId,
  initialSort = "relevance",
  initialSearch,
}: ProductBrowserProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    sort: initialSort,
    search: initialSearch,
    modelId: lockedModelId,
    categorySlug: lockedCategorySlug,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const facets = useMemo(
    () => buildFacets(products, brands),
    [products, brands]
  );
  const filtered = useMemo(
    () => applyFilters(products, filters, { categories, brands }),
    [products, filters, categories, brands]
  );

  function update(patch: Partial<ProductFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
  }

  function toggleInArray<K extends keyof ProductFilters>(
    key: K,
    value: string | number
  ) {
    setFilters((f) => {
      const current = (f[key] as (string | number)[] | undefined) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...f, [key]: next.length ? next : undefined };
    });
  }

  function clearAll() {
    setFilters({
      sort: filters.sort,
      modelId: lockedModelId,
      categorySlug: lockedCategorySlug,
    });
  }

  const activeCount = countActive(filters, lockedCategorySlug, lockedModelId);

  const filtersEl = (
    <FilterPanel
      filters={filters}
      facets={facets}
      categories={categories}
      deviceBrands={deviceBrands}
      deviceModels={deviceModels}
      lockedCategory={Boolean(lockedCategorySlug)}
      lockedModel={Boolean(lockedModelId)}
      update={update}
      toggleInArray={toggleInArray}
      clearAll={clearAll}
      activeCount={activeCount}
    />
  );

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
      <aside className="hidden lg:block">
        <div className="sticky top-36">{filtersEl}</div>
      </aside>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-xs text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <label className="sr-only" htmlFor="sort">
              Sort products
            </label>
            <Select
              id="sort"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortOption })}
              className="w-auto"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <ProductGrid products={filtered} />
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No products match your filters"
            description="Try removing some filters or browsing a different category."
            actionLabel="Clear filters"
            actionHref="#"
          />
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 hover:bg-surface-muted"
              >
                <X size={20} />
              </button>
            </div>
            {filtersEl}
            <div className="sticky bottom-0 mt-4 bg-surface pt-2">
              <Button className="w-full" onClick={() => setDrawerOpen(false)}>
                Show {filtered.length} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */

interface PanelProps {
  filters: ProductFilters;
  facets: ReturnType<typeof buildFacets>;
  categories: Category[];
  deviceBrands: DeviceBrand[];
  deviceModels: DeviceModel[];
  lockedCategory: boolean;
  lockedModel: boolean;
  update: (patch: Partial<ProductFilters>) => void;
  toggleInArray: (key: keyof ProductFilters, value: string | number) => void;
  clearAll: () => void;
  activeCount: number;
}

function FilterPanel({
  filters,
  facets,
  categories,
  deviceBrands,
  deviceModels,
  lockedCategory,
  lockedModel,
  update,
  toggleInArray,
  clearAll,
  activeCount,
}: PanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {!lockedCategory && (
        <FilterGroup title="Category">
          {categories.map((c) => (
            <CheckRow
              key={c.id}
              label={c.name}
              checked={filters.categorySlug === c.slug}
              onChange={() =>
                update({
                  categorySlug:
                    filters.categorySlug === c.slug ? undefined : c.slug,
                })
              }
            />
          ))}
        </FilterGroup>
      )}

      {!lockedModel && (
        <FilterGroup title="Compatible device">
          <Select
            value={filters.modelId ?? ""}
            onChange={(e) =>
              update({ modelId: e.target.value || undefined })
            }
          >
            <option value="">All devices</option>
            {deviceBrands.map((b) => (
              <optgroup key={b.id} label={b.name}>
                {deviceModels
                  .filter((m) => m.deviceBrandId === b.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
        </FilterGroup>
      )}

      <FilterGroup title="Brand">
        {facets.brands.map((b) => (
          <CheckRow
            key={b.id}
            label={b.name}
            checked={filters.brandSlugs?.includes(b.slug) ?? false}
            onChange={() => toggleInArray("brandSlugs", b.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={formatINR(facets.priceRange.min)}
            aria-label="Minimum price"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              update({ minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder={formatINR(facets.priceRange.max)}
            aria-label="Maximum price"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Customer rating">
        {[4, 3, 2].map((r) => (
          <RadioRow
            key={r}
            label={`${r}★ & above`}
            checked={filters.minRating === r}
            onChange={() =>
              update({ minRating: filters.minRating === r ? undefined : r })
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Discount">
        {[10, 25, 50].map((d) => (
          <RadioRow
            key={d}
            label={`${d}% or more`}
            checked={filters.minDiscount === d}
            onChange={() =>
              update({ minDiscount: filters.minDiscount === d ? undefined : d })
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <CheckRow
          label="In stock only"
          checked={filters.inStockOnly ?? false}
          onChange={() => update({ inStockOnly: !filters.inStockOnly })}
        />
      </FilterGroup>

      {facets.connectorTypes.length > 0 && (
        <FilterGroup title="Connector type">
          {facets.connectorTypes.map((c) => (
            <CheckRow
              key={c}
              label={c}
              checked={filters.connectorTypes?.includes(c) ?? false}
              onChange={() => toggleInArray("connectorTypes", c)}
            />
          ))}
        </FilterGroup>
      )}

      {facets.wattages.length > 0 && (
        <FilterGroup title="Charging wattage">
          {facets.wattages.map((w) => (
            <CheckRow
              key={w}
              label={`${w}W`}
              checked={filters.wattages?.includes(w) ?? false}
              onChange={() => toggleInArray("wattages", w)}
            />
          ))}
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Colour">
          {facets.colors.map((c) => (
            <CheckRow
              key={c}
              label={c}
              checked={filters.colors?.includes(c) ?? false}
              onChange={() => toggleInArray("colors", c)}
            />
          ))}
        </FilterGroup>
      )}

      {facets.materials.length > 0 && (
        <FilterGroup title="Material">
          {facets.materials.map((m) => (
            <CheckRow
              key={m}
              label={m}
              checked={filters.materials?.includes(m) ?? false}
              onChange={() => toggleInArray("materials", m)}
            />
          ))}
        </FilterGroup>
      )}

      {facets.warranties.length > 0 && (
        <FilterGroup title="Warranty">
          {facets.warranties.map((w) => (
            <CheckRow
              key={w}
              label={w === 0 ? "No warranty" : `${w} months`}
              checked={filters.warrantyMonths?.includes(w) ?? false}
              onChange={() => toggleInArray("warrantyMonths", w)}
            />
          ))}
        </FilterGroup>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border text-primary accent-[var(--color-primary)]"
      />
      <span className={cn(checked ? "font-medium text-foreground" : "text-muted")}>
        {label}
      </span>
    </label>
  );
}

function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--color-primary)]"
      />
      <span className={cn(checked ? "font-medium text-foreground" : "text-muted")}>
        {label}
      </span>
    </label>
  );
}

function countActive(
  f: ProductFilters,
  lockedCat?: string,
  lockedModel?: string
): number {
  let n = 0;
  if (f.categorySlug && !lockedCat) n++;
  if (f.modelId && !lockedModel) n++;
  if (f.brandSlugs?.length) n += f.brandSlugs.length;
  if (f.minPrice) n++;
  if (f.maxPrice) n++;
  if (f.minRating) n++;
  if (f.minDiscount) n++;
  if (f.inStockOnly) n++;
  if (f.connectorTypes?.length) n += f.connectorTypes.length;
  if (f.wattages?.length) n += f.wattages.length;
  if (f.colors?.length) n += f.colors.length;
  if (f.materials?.length) n += f.materials.length;
  if (f.warrantyMonths?.length) n += f.warrantyMonths.length;
  return n;
}
