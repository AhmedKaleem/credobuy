"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Brand, Category, Product } from "@/types";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { saveProductAction } from "@/lib/admin/actions";

export function ProductForm({
  product,
  brands,
  categories,
}: {
  product?: Product;
  brands: Brand[];
  categories: Category[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? brands[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? categories[0]?.id ?? ""
  );
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [mrp, setMrp] = useState(String(product?.mrp ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? 20));
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? ""
  );
  const [taxonomyCategory, setTaxonomyCategory] = useState(
    product?.taxonomyCategory ?? "Mobile"
  );
  const [subCategory, setSubCategory] = useState(product?.subCategory ?? "");
  const [series, setSeries] = useState(product?.series ?? "");
  const [productType, setProductType] = useState(product?.productType ?? "");
  const [compatibleDevice, setCompatibleDevice] = useState(
    product?.compatibleDevice ?? "Universal"
  );
  const [imageUrl, setImageUrl] = useState(product?.images[0]?.url ?? "");
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? true);
  const [isTrending, setIsTrending] = useState(product?.isTrending ?? false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await saveProductAction({
      id: product?.id,
      title,
      slug,
      brandId,
      categoryId,
      price: Number(price),
      mrp: Number(mrp),
      stock: Number(stock),
      shortDescription,
      taxonomyCategory,
      subCategory,
      series,
      productType,
      compatibleDevice,
      imageUrl: imageUrl || undefined,
      isBestSeller,
      isNewArrival,
      isTrending,
      isActive: true,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="title">
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!product) {
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                );
              }
            }}
            required
          />
        </Field>
        <Field label="Slug" htmlFor="slug">
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </Field>
        <Field label="Brand" htmlFor="brand">
          <Select
            id="brand"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Category" htmlFor="category">
          <Select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Price (₹)" htmlFor="price">
          <Input
            id="price"
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Field>
        <Field label="MRP (₹)" htmlFor="mrp">
          <Input
            id="mrp"
            type="number"
            min={1}
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            required
          />
        </Field>
        <Field label="Stock" htmlFor="stock">
          <Input
            id="stock"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </Field>
        <Field label="Image URL" htmlFor="image">
          <Input
            id="image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://… or leave blank for placeholder"
          />
        </Field>
        <Field label="Taxonomy category" htmlFor="tax">
          <Input
            id="tax"
            value={taxonomyCategory}
            onChange={(e) => setTaxonomyCategory(e.target.value)}
          />
        </Field>
        <Field label="Sub category" htmlFor="sub">
          <Input
            id="sub"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          />
        </Field>
        <Field label="Series" htmlFor="series">
          <Input
            id="series"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
          />
        </Field>
        <Field label="Product type" htmlFor="ptype">
          <Input
            id="ptype"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Compatible device" htmlFor="compat">
        <Input
          id="compat"
          value={compatibleDevice}
          onChange={(e) => setCompatibleDevice(e.target.value)}
        />
      </Field>
      <Field label="Short description" htmlFor="desc">
        <Textarea
          id="desc"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={(e) => setIsBestSeller(e.target.checked)}
          />
          Best seller
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isNewArrival}
            onChange={(e) => setIsNewArrival(e.target.checked)}
          />
          New arrival
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isTrending}
            onChange={(e) => setIsTrending(e.target.checked)}
          />
          Trending
        </label>
      </div>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : product ? "Update product" : "Create product"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
