'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Star,
  X,
  Loader2,
  Layers,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImageItem {
  src: string;
  alt?: string;
  isPrimary: boolean;
}

interface Pack {
  id?: string;
  label: string;
  weightGrams: string;
  price: string;
  sku: string;
  stock: string;
  isActive: boolean;
  image?: string;
  backImage?: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  categorySlug: string;
  shortDescription: string;
  description: string;
  status: string;
  images?: Array<string | { src: string; alt?: string; is_primary?: boolean }>;
  thumbnail?: string;
  variants: Array<{
    id: string;
    label: string;
    weightGrams: number;
    pricePaise: number;
    sku: string;
    stock: number | null;
    image?: string | null;
    isActive: boolean;
  }>;
}

const emptyPack = (label = '', weightGrams = '', defaultSku = ''): Pack => ({
  label,
  weightGrams,
  price: '',
  sku: defaultSku,
  stock: '',
  isActive: true,
  image: '',
  backImage: '',
});

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Form Fields
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  // Product Images State
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');

  // Packs / Variants State
  const [packs, setPacks] = useState<Pack[]>([emptyPack('250 g', '250', '')]);
  const [uploadingPackSide, setUploadingPackSide] = useState<{ index: number; side: 'front' | 'back' } | null>(null);

  // Quick Category Creation State
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch('/api/categories?status=active&limit=100', { cache: 'no-store' }),
          productId
            ? fetch(`/api/products/${encodeURIComponent(productId)}`, { cache: 'no-store' })
            : Promise.resolve(null),
        ]);
        const categoryData = await categoryResponse.json();
        if (!categoryResponse.ok)
          throw new Error(categoryData.error || 'Categories could not be loaded.');
        if (cancelled) return;
        setCategories(categoryData.categories ?? []);

        if (productResponse) {
          const productData = await productResponse.json();
          if (!productResponse.ok)
            throw new Error(productData.error || 'Product could not be loaded.');
          const product = productData.product as ProductData;
          if (cancelled) return;

          setName(product.name);
          setSlug(product.slug);
          setCategoryId(
            product.categoryId ||
              categoryData.categories?.find(
                (category: Category) => category.slug === product.categorySlug
              )?.id ||
              ''
          );
          setShortDescription(product.shortDescription || '');
          setDescription(product.description || '');
          setStatus(product.status === 'published' ? 'active' : product.status);

          // Map existing product images
          if (Array.isArray(product.images) && product.images.length > 0) {
            setImages(
              product.images.map((img, idx) => {
                if (typeof img === 'string') {
                  return {
                    src: img,
                    alt: product.name,
                    isPrimary: idx === 0,
                  };
                }
                return {
                  src: img.src,
                  alt: img.alt || product.name,
                  isPrimary: Boolean(img.is_primary ?? idx === 0),
                };
              })
            );
          } else if (product.thumbnail) {
            setImages([{ src: product.thumbnail, alt: product.name, isPrimary: true }]);
          }

          // Map variants with their specific image (Front & Back)
          if (Array.isArray(product.variants) && product.variants.length > 0) {
            setPacks(
              product.variants.map((variant) => {
                let front = '';
                let back = '';
                if (variant.image) {
                  const raw = variant.image.trim();
                  if (raw.startsWith('{') || raw.startsWith('[')) {
                    try {
                      const parsed = JSON.parse(raw);
                      if (Array.isArray(parsed)) {
                        front = parsed[0] || '';
                        back = parsed[1] || '';
                      } else if (typeof parsed === 'object' && parsed !== null) {
                        front = parsed.front || '';
                        back = parsed.back || '';
                      }
                    } catch {
                      front = raw;
                    }
                  } else {
                    front = raw;
                  }
                }
                return {
                  id: variant.id,
                  label: variant.label,
                  weightGrams: String(variant.weightGrams),
                  price: (variant.pricePaise / 100).toFixed(2),
                  sku: variant.sku,
                  stock: variant.stock == null ? '' : String(variant.stock),
                  image: front,
                  backImage: back,
                  isActive: variant.isActive,
                };
              })
            );
          }
        }
      } catch (error) {
        if (!cancelled)
          setLoadError(
            error instanceof Error ? error.message : 'Product data could not be loaded.'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const updatePack = (index: number, key: keyof Pack, value: string | boolean) => {
    setPacks((current) =>
      current.map((pack, i) => (i === index ? { ...pack, [key]: value } : pack))
    );
  };

  // Upload Main Product Image(s)
  async function handleUploadMainImages(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;
    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error('Each photo must be 5 MB or smaller');
      return;
    }
    setUploadingMainImage(true);
    let successCount = 0;
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('altText', name.trim() || 'Product Photo');
        const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data?.media?.url) {
          const uploadedUrl = data.media.url;
          setImages((prev) => [
            ...prev,
            { src: uploadedUrl, alt: name.trim() || 'Product Photo', isPrimary: prev.length === 0 },
          ]);
          successCount++;
        }
      }
      if (successCount > 0) {
        toast.success(`${successCount} photo${successCount === 1 ? '' : 's'} uploaded to gallery!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingMainImage(false);
    }
  }

  // Add Manual Image URL to Gallery
  function handleAddManualImage() {
    const url = manualImageUrl.trim();
    if (!url) return;
    setImages((prev) => [
      ...prev,
      { src: url, alt: name.trim() || 'Product Photo', isPrimary: prev.length === 0 },
    ]);
    setManualImageUrl('');
    toast.success('Image link added to gallery!');
  }

  // Set an image as primary thumbnail
  function handleSetPrimary(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
    toast.success('Main primary cover photo updated!');
  }

  // Remove an image from gallery
  function handleRemoveImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((x) => x.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  }

  // Upload Pack-Specific Image (Front or Back side)
  async function handleUploadPackImage(packIndex: number, file: File, side: 'front' | 'back' = 'front') {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Pack photo must be 5 MB or smaller');
      return;
    }
    setUploadingPackSide({ index: packIndex, side });
    try {
      const packLabel = packs[packIndex]?.label || `${packs[packIndex]?.weightGrams}g`;
      const sideLabel = side === 'front' ? 'Front Side' : 'Back Side (Nutrition)';
      const fd = new FormData();
      fd.append('file', file);
      fd.append('altText', `${name.trim()} - ${packLabel} (${sideLabel})`);
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload pack image');
      const uploadedUrl = data.media.url;
      updatePack(packIndex, side === 'front' ? 'image' : 'backImage', uploadedUrl);

      toast.success(`${packLabel} (${sideLabel}) photo uploaded successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Pack photo upload failed');
    } finally {
      setUploadingPackSide(null);
    }
  }

  // Quick Add Category from form
  async function handleCreateQuickCategory() {
    const catName = newCatName.trim();
    if (!catName) {
      toast.error('Category name enter karein');
      return;
    }
    setCreatingCat(true);
    const catSlug = catName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, slug: catSlug, status: 'active' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');

      const refreshRes = await fetch('/api/categories?status=active&limit=100', {
        cache: 'no-store',
      });
      const refreshData = await refreshRes.json();
      const updatedCategories = refreshData.categories ?? [];
      setCategories(updatedCategories);

      // Auto-select newly created category
      const found = updatedCategories.find(
        (c: Category) => c.slug === catSlug || c.name === catName
      );
      if (found) setCategoryId(found.id);

      setNewCatName('');
      setShowQuickCategory(false);
      toast.success(`Category "${catName}" added and selected!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Category could not be created');
    } finally {
      setCreatingCat(false);
    }
  }

  // Add standard pack presets
  function handleAddPresetPack(label: string, weightGrams: string) {
    const slugPrefix = (slug || name || 'PRD').toUpperCase().slice(0, 4);
    const sku = `${slugPrefix}-${weightGrams}G`;
    setPacks((current) => [...current, emptyPack(label, weightGrams, sku)]);
  }

  // Form Submit
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const category = categories.find((item) => item.id === categoryId);
    if (!category) {
      toast.error('Pehle active category select karein.');
      return;
    }

    // Format gallery images
    const formattedImages = images.map((img, idx) => ({
      src: img.src,
      alt: img.alt || name,
      sort: idx,
      is_primary: Boolean(img.isPrimary || (idx === 0 && !images.some((x) => x.isPrimary))),
      variant_ids: [],
    }));

    const primaryImg =
      packs[0]?.image || images.find((img) => img.isPrimary)?.src || images[0]?.src || '';

    setSaving(true);
    try {
      const response = await fetch(
        productId ? `/api/products/${encodeURIComponent(productId)}` : '/api/products',
        {
          method: productId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            slug,
            categoryId,
            categorySlug: category.slug,
            shortDescription,
            longDescription: description,
            status,
            spiceLevel: 'mild',
            storage: 'Store in a cool, dry place away from direct sunlight',
            images: formattedImages,
            thumbnail: primaryImg,
            variants: packs.map((pack) => {
              let imageVal: string | null = null;
              const f = pack.image?.trim();
              const b = pack.backImage?.trim();
              if (f && b) {
                imageVal = JSON.stringify({ front: f, back: b });
              } else if (f) {
                imageVal = f;
              } else if (b) {
                imageVal = b;
              }
              return {
                id: pack.id,
                label: pack.label,
                weightGrams: Number(pack.weightGrams),
                pricePaise: Math.round(Number(pack.price) * 100),
                sku: pack.sku,
                stock: pack.stock === '' ? null : Number(pack.stock),
                image: imageVal,
                isActive: pack.isActive,
              };
            }),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Product could not be saved.');
      toast.success(
        productId
          ? 'Product updated successfully.'
          : status === 'active'
            ? 'Product published to shop catalog!'
            : 'Product saved as a draft.'
      );
      router.push('/admin/products');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Product could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        <Loader2 className="mx-auto mb-2 animate-spin text-primary" size={24} />
        Product details load ho rahe hain…
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50 transition-colors shadow-xs"
          aria-label="Back to products"
        >
          <ArrowLeft size={18} className="text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {productId ? 'Edit product' : 'Add product'}
          </h1>
          <p className="text-sm text-slate-600">
            Product details, photo gallery, and pack-specific images for the shop.
          </p>
        </div>
      </header>

      {loadError && (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {loadError}
        </p>
      )}

      {categories.length === 0 && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No active categories found.{' '}
          <Link className="font-bold underline" href="/admin/categories">
            Add a category first.
          </Link>
        </p>
      )}

      <form
        onSubmit={submit}
        className="space-y-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
      >
        {/* ======================================================== */}
        {/* SECTION 1: BASIC PRODUCT INFORMATION                    */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            1. Basic Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-label block">
              <span className="text-xs font-bold uppercase text-slate-700">Product name *</span>
              <input
                required
                value={name}
                onChange={(event) => {
                  const value = event.target.value;
                  setName(value);
                  if (!slug)
                    setSlug(
                      value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                    );
                }}
                placeholder="e.g. Ujjaini Hing Sev"
                className="form-input mt-1.5 w-full text-sm font-medium"
              />
            </label>

            <label className="form-label block">
              <span className="text-xs font-bold uppercase text-slate-700">URL slug *</span>
              <input
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="ujjaini-hing-sev"
                className="form-input mt-1.5 w-full text-sm font-mono text-slate-700"
              />
            </label>

            {/* Category with Quick Add option */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-700">Category *</span>
                <button
                  type="button"
                  onClick={() => setShowQuickCategory(!showQuickCategory)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus size={13} /> {showQuickCategory ? 'Close' : 'New category'}
                </button>
              </div>

              {showQuickCategory && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 mb-2">
                  <p className="text-xs text-amber-900 font-bold">Add new product category:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Chivda, Masala Mixture..."
                      className="form-input flex-1 text-xs py-1.5 px-3 bg-white"
                    />
                    <button
                      type="button"
                      disabled={creatingCat}
                      onClick={handleCreateQuickCategory}
                      className="btn btn-primary btn-sm text-xs px-3"
                    >
                      {creatingCat ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                </div>
              )}

              <select
                required
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="form-select w-full text-sm font-medium bg-white"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="form-label block">
              <span className="text-xs font-bold uppercase text-slate-700">Publishing status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="form-select mt-1.5 w-full text-sm font-medium bg-white"
              >
                <option value="active">Publish to shop (Live)</option>
                <option value="draft">Draft (Hidden from storefront)</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label className="form-label block">
            <span className="text-xs font-bold uppercase text-slate-700">Short description</span>
            <input
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              placeholder="e.g. Crisp aromatic sev made with authentic compounding Hing from Ujjain."
              className="form-input mt-1.5 w-full text-sm"
            />
          </label>

          <label className="form-label block">
            <span className="text-xs font-bold uppercase text-slate-700">
              Product description *
            </span>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Complete description of the taste, texture, ingredients, and culinary backstory..."
              className="form-input mt-1.5 w-full text-sm"
            />
          </label>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: PRODUCT PHOTOS & GALLERY                     */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ImageIcon size={16} className="text-amber-600" /> 2. Extra Photos & Product Gallery (Katora, Serving Bowl, Close-up, etc.)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pack ke pouch ke alawa koi bhi extra photos yahan upload karein (jaise katore/bowl me sev, close-up texture, thali/serving). Yeh product page par e-commerce gallery me pack photos ke baad dikhengi.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {images.length} extra photo{images.length === 1 ? '' : 's'} added
            </span>
          </div>

          {/* Upload Dropzone & URL Input */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <input
                ref={mainFileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadingMainImage}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) void handleUploadMainImages(files);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                disabled={uploadingMainImage}
                onClick={() => mainFileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl bg-amber-50/40 hover:bg-amber-50/80 transition-colors text-amber-900 cursor-pointer"
              >
                {uploadingMainImage ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-amber-600" />
                    <span className="text-xs font-bold">Uploading Photo(s) to R2 Storage...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={20} className="text-amber-600 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold">Upload Extra Photos (Katora, Serving Bowl, Close-up, etc.)</p>
                      <p className="text-[11px] text-slate-500">
                        Click to select 1 or multiple JPG, PNG or WEBP photos (up to 5 MB each)
                      </p>
                    </div>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col justify-center gap-1.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
              <span className="text-[11px] font-bold text-slate-600">Or Paste Image URL</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="https://... or /api/media/..."
                  className="form-input flex-1 text-xs py-1 px-2.5 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddManualImage}
                  className="btn btn-outline btn-sm text-xs px-2.5 shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Uploaded Gallery Grid */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={`${img.src}-${idx}`}
                  className={`group relative rounded-2xl border overflow-hidden bg-slate-100 aspect-square flex items-center justify-center ${
                    img.isPrimary
                      ? 'border-amber-500 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.src} alt={img.alt || name} className="w-full h-full object-cover" />

                  {/* Primary Badge */}
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] shadow-sm flex items-center gap-1">
                      <Star size={10} className="fill-slate-950" /> Cover
                    </span>
                  )}

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                        title="Delete photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="w-full py-1 rounded-lg bg-white/90 text-slate-900 font-bold text-[10px] hover:bg-amber-400 transition"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-xs">
              No photos added yet. Upload at least one cover photo for the storefront.
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: PACKS, PRICING & PACK-SPECIFIC PHOTOS        */}
        {/* ======================================================== */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers size={16} className="text-amber-600" /> 3. Packs, Pricing & Pack Photos *
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Agar 100g, 250g ya 500g ka specific pouch/box photo hai, to use pack photo mein
                upload karein. Customer jab pack select karega to automatically wahi image dikhegi!
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400">Quick add:</span>
              <button
                type="button"
                onClick={() => handleAddPresetPack('100 g', '100')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                + 100g
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetPack('250 g', '250')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                + 250g
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetPack('500 g', '500')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                + 500g
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetPack('1 kg', '1000')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                + 1kg
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm h-[32px] text-xs font-bold inline-flex items-center gap-1"
                onClick={() => setPacks((current) => [...current, emptyPack()])}
                disabled={packs.length >= 10}
              >
                <Plus size={14} /> Custom pack
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {packs.map((pack, index) => (
              <div
                key={pack.id || `pack-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5 transition hover:border-slate-300 hover:bg-slate-50/70"
              >
                {/* Pack Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-black uppercase text-slate-800">
                      Pack Variant: {pack.label || `Item #${index + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {productId && (
                      <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pack.isActive}
                          onChange={(e) => updatePack(index, 'isActive', e.target.checked)}
                          className="rounded text-primary focus:ring-primary/20"
                        />
                        Active
                      </label>
                    )}
                    {packs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPacks((current) => current.filter((_, i) => i !== index))}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="Remove pack"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-start">
                  <label className="form-label block">
                    <span className="text-[11px] font-bold uppercase text-slate-600">
                      Pack label *
                    </span>
                    <input
                      required
                      value={pack.label}
                      onChange={(event) => updatePack(index, 'label', event.target.value)}
                      placeholder="e.g. 100 g, 250 g, 1 kg"
                      className="form-input mt-1 w-full text-xs font-bold"
                    />
                  </label>

                  <label className="form-label block">
                    <span className="text-[11px] font-bold uppercase text-slate-600">
                      Weight (g) *
                    </span>
                    <input
                      required
                      type="number"
                      min="1"
                      value={pack.weightGrams}
                      onChange={(event) => updatePack(index, 'weightGrams', event.target.value)}
                      placeholder="100, 250..."
                      className="form-input mt-1 w-full text-xs font-mono"
                    />
                  </label>

                  <label className="form-label block">
                    <span className="text-[11px] font-bold uppercase text-slate-600">
                      Price (₹) *
                    </span>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pack.price}
                      onChange={(event) => updatePack(index, 'price', event.target.value)}
                      placeholder="40.00"
                      className="form-input mt-1 w-full text-xs font-bold text-slate-900"
                    />
                  </label>

                  <label className="form-label block">
                    <span className="text-[11px] font-bold uppercase text-slate-600">SKU *</span>
                    <input
                      required
                      value={pack.sku}
                      onChange={(event) => updatePack(index, 'sku', event.target.value)}
                      placeholder="SEV-100G"
                      className="form-input mt-1 w-full text-xs font-mono"
                    />
                  </label>

                  <label className="form-label block">
                    <span className="text-[11px] font-bold uppercase text-slate-600">Stock</span>
                    <input
                      type="number"
                      min="0"
                      value={pack.stock}
                      onChange={(event) => updatePack(index, 'stock', event.target.value)}
                      placeholder="Untracked"
                      className="form-input mt-1 w-full text-xs font-mono"
                    />
                  </label>
                </div>

                {/* Pack-Specific Images (Front & Back Dual Sides) */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon size={15} className="text-amber-600" />
                      Packaging Photos for {pack.label || 'this pack'}:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Customer is pack ko select karega to Front &amp; Back packaging photos show hongi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Front Side Photo */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span>🖼️</span> Front Side (Pouch Cover)
                        </span>
                        <span className="text-[10px] text-slate-400">Main Display</span>
                      </div>

                      {pack.image ? (
                        <div className="flex items-center gap-2.5 bg-amber-50/60 p-2 rounded-lg border border-amber-200/80">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white border border-slate-200 shrink-0">
                            <img
                              src={pack.image}
                              alt={`${pack.label} Front`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Front photo active
                            </p>
                            <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                              {pack.image}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updatePack(index, 'image', '')}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Remove front photo"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-amber-300 hover:border-amber-500 rounded-lg bg-amber-50/40 hover:bg-amber-50 text-xs font-semibold text-amber-900 transition-colors w-full">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              disabled={uploadingPackSide?.index === index && uploadingPackSide?.side === 'front'}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleUploadPackImage(index, file, 'front');
                                e.target.value = '';
                              }}
                            />
                            {uploadingPackSide?.index === index && uploadingPackSide?.side === 'front' ? (
                              <>
                                <Loader2 size={13} className="animate-spin text-amber-600" />
                                <span className="text-[11px]">Uploading Front...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud size={14} className="text-amber-700" />
                                <span className="text-[11px]">Upload Front Cover Photo</span>
                              </>
                            )}
                          </label>
                          <input
                            type="text"
                            value={pack.image || ''}
                            onChange={(e) => updatePack(index, 'image', e.target.value)}
                            placeholder="Or paste front image URL"
                            className="form-input text-[11px] py-1 px-2.5 font-mono text-slate-600 w-full"
                          />
                        </div>
                      )}
                    </div>

                    {/* Back Side Photo */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span>🔄</span> Back Side (Nutrition &amp; Ingredients)
                        </span>
                        <span className="text-[10px] text-slate-400">Nutritional Info</span>
                      </div>

                      {pack.backImage ? (
                        <div className="flex items-center gap-2.5 bg-blue-50/60 p-2 rounded-lg border border-blue-200/80">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white border border-slate-200 shrink-0">
                            <img
                              src={pack.backImage}
                              alt={`${pack.label} Back`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Back photo active
                            </p>
                            <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                              {pack.backImage}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updatePack(index, 'backImage', '')}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Remove back photo"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-blue-300 hover:border-blue-500 rounded-lg bg-blue-50/40 hover:bg-blue-50 text-xs font-semibold text-blue-900 transition-colors w-full">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              disabled={uploadingPackSide?.index === index && uploadingPackSide?.side === 'back'}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleUploadPackImage(index, file, 'back');
                                e.target.value = '';
                              }}
                            />
                            {uploadingPackSide?.index === index && uploadingPackSide?.side === 'back' ? (
                              <>
                                <Loader2 size={13} className="animate-spin text-blue-600" />
                                <span className="text-[11px]">Uploading Back...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud size={14} className="text-blue-700" />
                                <span className="text-[11px]">Upload Back Side (Nutrition)</span>
                              </>
                            )}
                          </label>
                          <input
                            type="text"
                            value={pack.backImage || ''}
                            onChange={(e) => updatePack(index, 'backImage', e.target.value)}
                            placeholder="Or paste back image URL"
                            className="form-input text-[11px] py-1 px-2.5 font-mono text-slate-600 w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Submit Button */}
        {loadError ? null : (
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className="btn btn-primary h-[44px] px-8 text-sm font-bold shadow-md inline-flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Saving product…' : productId ? 'Update product' : 'Save product'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
