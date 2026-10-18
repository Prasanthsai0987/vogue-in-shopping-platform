
import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImage,
} from "../api";
import "./Admin.css";

const emptyProduct = {
  name: "",
  brand: "",
  price: "",
  oldPrice: "",
  category: "Dresses",
  imageUrl: "",
  emoji: "👗",
  description: "",
  badge: "",
  sizes: "S, M, L, XL",
  stockQty: "0",
  rating: "0",
  reviews: "0",
};

function toPayload(form) {
  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    price: Number(form.price),
    oldPrice:
      form.oldPrice === "" ? null : Number(form.oldPrice),
    category: form.category.trim(),
    imageUrl: form.imageUrl.trim(),
    emoji: form.emoji.trim(),
    description: form.description.trim(),
    badge: form.badge.trim(),
    sizes: form.sizes
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean),
    stockQty: Number(form.stockQty),
    rating: Number(form.rating || 0),
    reviews: Number(form.reviews || 0),
  };
}

function fromProduct(product) {
  return {
    ...emptyProduct,
    ...product,
    price: String(product.price ?? ""),
    oldPrice:
      product.oldPrice == null ? "" : String(product.oldPrice),
    sizes: Array.isArray(product.sizes)
      ? product.sizes.join(", ")
      : "",
    stockQty: String(product.stockQty ?? 0),
    rating: String(product.rating ?? 0),
    reviews: String(product.reviews ?? 0),
    imageUrl: product.imageUrl ?? "",
  };
}

function getErrorMessage(error, action) {
  const status = error.response?.status;

  if (status === 401) {
    return "Your session has expired or you are not signed in. Please sign in again.";
  }

  if (status === 403) {
    return "Access denied. Check the administrator email, login session, and CSRF token.";
  }

  if (status === 400 || status === 422) {
    return "The server rejected the product data. Check the entered values.";
  }

  if (!error.response) {
    return "Cannot reach the backend. Check the API URL and server status.";
  }

  return `Could not ${action}. Check the server logs and try again.`;
}

export default function Admin() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ ...emptyProduct });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchAdminProducts();
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("The products endpoint did not return an array.");
      }

      setProducts(data);
    } catch (err) {
      setError(getErrorMessage(err, "load products"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({ ...emptyProduct });
    setEditingId(null);
  }

  async function handleImageUpload() {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }

    setError("");
    setMessage("");
    setUploadingImage(true);

    try {
      const response = await uploadProductImage(imageFile);
      const imageUrl = response.data?.url;

      if (!imageUrl) {
        throw new Error("Cloudinary did not return an image URL.");
      }

      setForm((current) => ({
        ...current,
        imageUrl,
      }));

      setImageFile(null);
      setMessage("Image uploaded successfully.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Image upload failed."
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.category.trim()) {
      setError("Product name and category are required.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stockQty);
    const rating = Number(form.rating || 0);
    const reviews = Number(form.reviews || 0);
    const oldPrice =
      form.oldPrice === "" ? null : Number(form.oldPrice);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid, non-negative price.");
      return;
    }

    if (
      oldPrice !== null &&
      (!Number.isFinite(oldPrice) || oldPrice < 0)
    ) {
      setError("Enter a valid original price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    if (!Number.isInteger(reviews) || reviews < 0) {
      setError("Review count must be a non-negative whole number.");
      return;
    }

    if (
      form.imageUrl.trim() &&
      !/^https?:\/\/\S+$/i.test(form.imageUrl.trim())
    ) {
      setError("Enter a valid HTTP or HTTPS image URL.");
      return;
    }

    setSaving(true);

    try {
      const payload = toPayload(form);

      if (editingId) {
        await updateAdminProduct(editingId, payload);
        setMessage("Product updated successfully.");
      } else {
        await createAdminProduct(payload);
        setMessage("Product added successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, "save the product"));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm(fromProduct(product));
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteAdminProduct(product.id);

      if (editingId === product.id) {
        resetForm();
      }

      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, "delete the product"));
    }
  }

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term)
    );
  });

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">VOGUE.IN CONTROL PANEL</p>
          <h1>Product Management</h1>
          <p>Manage your catalogue, pricing and stock.</p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={loadProducts}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh inventory"}
        </button>
      </header>

      {error && (
        <div className="admin-alert admin-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-alert admin-success" role="status">
          {message}
        </div>
      )}

      <section className="admin-panel">
        <h2>{editingId ? "Edit product" : "Add a product"}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <label>
            Product name *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={150}
            />
          </label>

          <label>
            Brand
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
            />
          </label>

          <label>
            Price (₹) *
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Original price (₹)
            <input
              name="oldPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.oldPrice}
              onChange={handleChange}
            />
          </label>

          <label>
            Category *
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Dresses, Shoes, Accessories..."
              required
            />
          </label>

          <label>
            Stock quantity *
            <input
              name="stockQty"
              type="number"
              min="0"
              step="1"
              value={form.stockQty}
              onChange={handleChange}
              required
            />
          </label>

          
          <label className="admin-full-width">
            Upload product image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                setImageFile(event.target.files?.[0] || null);
                setError("");
                setMessage("");
              }}
            />
          </label>

          <div className="admin-form-actions admin-full-width">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={handleImageUpload}
              disabled={!imageFile || uploadingImage || saving}
            >
              {uploadingImage ? "Uploading image..." : "Upload image"}
            </button>
          </div>

          {form.imageUrl && (
            <div className="admin-image-preview admin-full-width">
              <img
                src={form.imageUrl}
                alt="Product preview"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                onLoad={(event) => {
                  event.currentTarget.style.display = "block";
                }}
              />
              <p>Image uploaded and ready to save.</p>
            </div>
          )}


          <label>
            Sizes (comma-separated)
            <input
              name="sizes"
              value={form.sizes}
              onChange={handleChange}
              placeholder="XS, S, M, L, XL"
            />
          </label>

          <label>
            Badge
            <input
              name="badge"
              value={form.badge}
              onChange={handleChange}
              placeholder="New, Bestseller, Sale"
            />
          </label>

          <label>
            Emoji fallback
            <input
              name="emoji"
              value={form.emoji}
              onChange={handleChange}
              maxLength={12}
            />
          </label>

          <label>
            Rating
            <input
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={handleChange}
            />
          </label>

          <label>
            Review count
            <input
              name="reviews"
              type="number"
              min="0"
              step="1"
              value={form.reviews}
              onChange={handleChange}
            />
          </label>

          <label className="admin-full-width">
            Description
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <div className="admin-form-actions admin-full-width">
            <button
              type="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Add product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-inventory-header">
          <div>
            <h2>Inventory</h2>
            <p>{filteredProducts.length} product(s)</p>
          </div>

          <input
            aria-label="Search inventory"
            className="admin-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
          />
        </div>

        {loading ? (
          <p>Loading inventory...</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="admin-emoji">
                            {product.emoji || "🛍️"}
                          </span>
                        )}

                        <div>
                          <strong>{product.name}</strong>
                          <small>{product.brand}</small>
                        </div>
                      </div>
                    </td>

                    <td>{product.category}</td>

                    <td>
                      ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={
                          Number(product.stockQty) === 0
                            ? "admin-stock admin-out"
                            : "admin-stock"
                        }
                      >
                        {product.stockQty ?? 0}
                      </span>
                    </td>

                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete"
                          onClick={() => handleDelete(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
