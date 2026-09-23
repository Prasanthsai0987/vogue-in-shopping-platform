import { useState } from "react";
import { useCart } from "./CartContext";
import "./ProductDetail.css";

export default function ProductDetail({
  product,
  onBack,
  onPayNow,
  onGoToCart
}) {

  const [selectedSize, setSelectedSize] =
    useState(null);

  const [qty, setQty] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  const [adding, setAdding] =
    useState(false);


  const {
    addItem,
    setSingleItem
  } = useCart();


  // =====================================================
  // NO PRODUCT
  // =====================================================

  if (!product) {
    return null;
  }


  // =====================================================
  // DISCOUNT
  // =====================================================

  const discount =
    product.oldPrice

      ? Math.round(
          (1 - product.price / product.oldPrice) *
          100
        )

      : 0;


  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async () => {

    // =================================================
    // SIZE CHECK
    // =================================================
    console.log("ADD TO CART BUTTON CLICKED");

    if (!selectedSize) {

      alert(
        "Please select a size"
      );

      return;

    }


    // =================================================
    // PREVENT DOUBLE CLICK
    // =================================================

    if (adding) {
      return;
    }


    try {

      setAdding(true);


      console.log(
        "ADDING PRODUCT:",
        product
      );


      // =================================================
      // SAVE PRODUCT TO BACKEND
      // =================================================

      const success =
        await addItem(

          product,

          selectedSize,

          qty

        );


      // =================================================
      // IF BACKEND FAILED
      // =================================================

      if (!success) {

        return;

      }


      // =================================================
      // SUCCESS
      // =================================================

      setAdded(true);


      setTimeout(() => {

        setAdded(false);

      }, 2000);


    } finally {

      setAdding(false);

    }

  };


  // =====================================================
  // PAY NOW
  // =====================================================

  const handlePayNow = () => {

    if (!selectedSize) {

      alert(
        "Please select a size"
      );

      return;

    }


    setSingleItem(

      product,

      selectedSize,

      qty

    );


    onPayNow();

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="detail-page">


      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button

        className="back-btn"

        onClick={onBack}

      >

        ← Back to listing

      </button>


      <div className="detail-layout">


        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        <div className="detail-img-wrap">


          <span className="detail-emoji">

            {product.emoji}

          </span>


          {product.badge && (

            <span className="detail-badge">

              {product.badge}

            </span>

          )}

        </div>


        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}

        <div className="detail-info">


          {/* BRAND */}

          <div className="detail-brand">

            {product.brand}

          </div>


          {/* NAME */}

          <h1 className="detail-name">

            {product.name}

          </h1>


          {/* =================================================
              PRICE
          ================================================= */}

          <div className="detail-pricing">


            <span className="detail-price">

              ₹
              {Number(
                product.price || 0
              ).toLocaleString("en-IN")}

            </span>


            {product.oldPrice && (

              <span className="detail-old-price">

                ₹
                {Number(
                  product.oldPrice
                ).toLocaleString("en-IN")}

              </span>

            )}


            {discount > 0 && (

              <span className="detail-discount">

                {discount}% off

              </span>

            )}

          </div>


          {/* =================================================
              RATING
          ================================================= */}

          <div className="detail-rating">


            {"★".repeat(

              Math.round(
                product.rating || 0
              )

            )}


            {"☆".repeat(

              5 -

              Math.round(
                product.rating || 0
              )

            )}


            <span className="rating-num">

              {product.rating || 0}

            </span>


            <span className="rating-rev">

              ({product.reviews || 0} reviews)

            </span>

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p className="detail-desc">

            {product.desc ||

              "A stunning piece for every wardrobe. Made with premium quality fabric for all-day comfort and style."

            }

          </p>


          {/* =================================================
              SIZE
          ================================================= */}

          <div className="size-section">


            <div className="size-label">


              Select size


              {!selectedSize && (

                <span className="size-hint">

                  {" "}— required

                </span>

              )}

            </div>


            <div className="sizes-row">


              {(

                product.sizes ||

                [
                  "XS",
                  "S",
                  "M",
                  "L",
                  "XL"
                ]

              ).map((s) => (


                <button

                  key={s}

                  className={`
                    size-btn
                    ${
                      selectedSize === s
                        ? "active"
                        : ""
                    }
                  `}

                  onClick={() =>
                    setSelectedSize(s)
                  }

                  disabled={adding}

                >

                  {s}

                </button>


              ))}

            </div>

          </div>


          {/* =================================================
              QUANTITY
          ================================================= */}

          <div className="qty-section">


            <div className="size-label">

              Quantity

            </div>


            <div className="qty-row">


              <button

                className="qty-btn"

                onClick={() =>

                  setQty((q) =>

                    Math.max(
                      1,
                      q - 1
                    )

                  )

                }

                disabled={adding}

              >

                −

              </button>


              <span className="qty-val">

                {qty}

              </span>


              <button

                className="qty-btn"

                onClick={() =>

                  setQty(
                    (q) => q + 1
                  )

                }

                disabled={adding}

              >

                +

              </button>

            </div>

          </div>


          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="action-btns">


            {/* =================================================
                ADD TO CART
            ================================================= */}

            <button

              className={`
                add-cart-btn
                ${
                  added
                    ? "added"
                    : ""
                }
              `}

              onClick={
                handleAddToCart
              }

              disabled={
                added ||
                adding
              }

            >

              {adding

                ? "Adding..."

                : added

                  ? "✓ Added to cart!"

                  : "Add to cart"

              }

            </button>


            {/* =================================================
                PAY NOW
            ================================================= */}

            <button

              className="pay-now-btn"

              onClick={
                handlePayNow
              }

              disabled={adding}

            >

              Pay now

            </button>


          </div>


          {/* =================================================
              GO TO CART
          ================================================= */}

          {added && (

            <button

              className="back-btn"

              onClick={onGoToCart}

            >

              View Cart →

            </button>

          )}


          {/* =================================================
              META
          ================================================= */}

          <div className="detail-meta">


            <span>

              🚚 Free delivery on orders above ₹2,999

            </span>


            <span>

              ↩ 30-day easy returns

            </span>

          </div>


        </div>

      </div>

    </div>

  );

}