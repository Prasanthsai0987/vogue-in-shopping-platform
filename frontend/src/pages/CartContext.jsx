import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import API from "../api";

const CartContext = createContext();

export function CartProvider({ children }) {

const [items, setItems] = useState([]);
const [buyNowItem, setBuyNowItem] = useState(null);
const [loading, setLoading] = useState(false);


  // =====================================================
  // GET CUSTOMER ID
  // =====================================================

  const getCustomerId = () => {
    return localStorage.getItem("customerId");
  };


  // =====================================================
  // LOAD CART FROM BACKEND
  // =====================================================

  const loadCart = async () => {

    const customerId = getCustomerId();

    console.log("CUSTOMER ID:", customerId);

    // No customer -> empty cart
    if (!customerId) {

      console.warn(
        "No customerId found in localStorage"
      );

      setItems([]);

      return;
    }


    try {

      setLoading(true);

      console.log(
        "LOADING CART:",
        `/cart/${customerId}`
      );


      // =================================================
      // GET CART
      // =================================================

      const response = await API.get(
        `/cart/${customerId}`
      );

      const cart =
        response?.data ?? response;

      console.log(
        "CART RESPONSE:",
        cart
      );


      const cartItems =
        cart?.items || [];


      // =================================================
      // EMPTY CART
      // =================================================

      if (cartItems.length === 0) {

        setItems([]);

        return;
      }


      // =================================================
      // LOAD COMPLETE PRODUCT DETAILS
      // =================================================

      const detailedItems =
        await Promise.all(

          cartItems.map(
            async (item) => {

              try {

                console.log(
                  "LOADING PRODUCT:",
                  item.productId
                );


                const productResponse =
                  await API.get(
                    `/products/${item.productId}`
                  );


                const product =
                  productResponse?.data ??
                  productResponse;


                return {

                  ...product,

                  // Keep cart information
                  productId: item.productId,

                  qty: Number(item.qty || 1),

                  size: item.size

                };


              } catch (error) {

                console.error(
                  "PRODUCT LOAD ERROR:",
                  item.productId,
                  error
                );


                // Keep cart item even if
                // product information fails

                return {

                  productId:
                    item.productId,

                  qty:
                    Number(item.qty || 1),

                  size:
                    item.size,

                  name:
                    "Product unavailable",

                  brand:
                    "",

                  emoji:
                    "🛍️",

                  price:
                    0

                };

              }

            }
          )

        );


      console.log(
        "FINAL CART ITEMS:",
        detailedItems
      );


      setItems(detailedItems);


    } catch (error) {

      console.error(
        "LOAD CART ERROR:",
        error
      );


      console.error(
        "STATUS:",
        error?.response?.status
      );


      console.error(
        "RESPONSE:",
        error?.response?.data
      );


      setItems([]);


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD CART WHEN APP STARTS
  // =====================================================

  useEffect(() => {

    loadCart();

  }, []);


  // =====================================================
  // ADD ITEM TO CART
  // =====================================================

  const addItem = async (
    product,
    size,
    qty = 1
  ) => {

    const customerId =
      getCustomerId();


    console.log(
      "ADD TO CART CUSTOMER:",
      customerId
    );


    // =================================================
    // CUSTOMER CHECK
    // =================================================

    if (!customerId) {

      alert(
        "Please login before adding products to cart."
      );

      return false;
    }


    // =================================================
    // PRODUCT CHECK
    // =================================================

    if (!product?.id) {

      console.error(
        "Invalid product:",
        product
      );

      alert(
        "Invalid product."
      );

      return false;
    }


    // =================================================
    // SIZE CHECK
    // =================================================

    if (!size) {

      alert(
        "Please select a size."
      );

      return false;
    }


    try {

      setLoading(true);


      const requestData = {

        productId:
          product.id,

        qty:
          Number(qty),

        size:
          size

      };


      console.log(
        "ADD TO CART REQUEST:",
        requestData
      );


      // =================================================
      // SAVE TO BACKEND
      // =================================================

      const response =
        await API.post(

          `/cart/${customerId}/items`,

          requestData

        );


      console.log(
        "ADD TO CART RESPONSE:",
        response?.data ?? response
      );


      // =================================================
      // RELOAD CART FROM DATABASE
      // =================================================

      await loadCart();


      return true;


    } catch (error) {

      console.error(
        "ADD TO CART ERROR:",
        error
      );


      console.error(
        "STATUS:",
        error?.response?.status
      );


      console.error(
        "RESPONSE:",
        error?.response?.data
      );


      alert(

        error?.response?.data?.message ||

        error?.response?.data ||

        "Failed to add product to cart."

      );


      return false;


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // UPDATE ITEM QUANTITY
  // =====================================================

  const updateItem = async (
    index,
    qty
  ) => {

    const customerId =
      getCustomerId();


    if (!customerId) {
      return;
    }


    const item =
      items[index];


    if (!item) {
      return;
    }


    // =================================================
    // REMOVE WHEN QTY = 0
    // =================================================

    if (qty <= 0) {

      await removeItem(index);

      return;
    }


    try {

      setLoading(true);


      console.log(
        "UPDATE CART:",
        item.productId,
        qty,
        item.size
      );


      await API.put(

        `/cart/${customerId}/items/${item.productId}`,

        {

          qty:
            Number(qty),

          size:
            item.size

        }

      );


      await loadCart();


    } catch (error) {

      console.error(
        "UPDATE CART ERROR:",
        error
      );


      console.error(
        "STATUS:",
        error?.response?.status
      );


      console.error(
        "RESPONSE:",
        error?.response?.data
      );


      alert(

        error?.response?.data?.message ||

        "Failed to update cart."

      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = async (
    index
  ) => {

    const customerId =
      getCustomerId();


    if (!customerId) {
      return;
    }


    const item =
      items[index];


    if (!item) {
      return;
    }


    try {

      setLoading(true);


      let url =
        `/cart/${customerId}/items/${item.productId}`;


      // Include size
      // because same product can exist
      // with different sizes

      if (item.size) {

        url +=
          `?size=${encodeURIComponent(item.size)}`;

      }


      console.log(
        "REMOVE CART:",
        url
      );


      await API.delete(url);


      await loadCart();


    } catch (error) {

      console.error(
        "REMOVE CART ERROR:",
        error
      );


      console.error(
        "STATUS:",
        error?.response?.status
      );


      console.error(
        "RESPONSE:",
        error?.response?.data
      );


      alert(

        error?.response?.data?.message ||

        "Failed to remove item."

      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // PAY NOW - SINGLE ITEM
  // =====================================================

const setSingleItem = (
  product,
  size,
  qty = 1
) => {

  setBuyNowItem({
    ...product,
    productId: product.id,
    qty: Number(qty),
    size: size
  });

};


  // =====================================================
  // CLEAR CART
  // =====================================================

  const clearCart = async () => {

    const customerId =
      getCustomerId();


    if (!customerId) {

      setItems([]);

      return;

    }


    try {

      setLoading(true);


      await API.delete(
        `/cart/${customerId}`
      );


      setItems([]);


    } catch (error) {

      console.error(
        "CLEAR CART ERROR:",
        error
      );


      console.error(
        "STATUS:",
        error?.response?.status
      );


      console.error(
        "RESPONSE:",
        error?.response?.data
      );


      alert(

        error?.response?.data?.message ||

        "Failed to clear cart."

      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal =
    items.reduce(

      (sum, item) =>

        sum +

        Number(item.price || 0) *

        Number(item.qty || 0),

      0

    );


  // =====================================================
  // SHIPPING
  // =====================================================

  const shipping =

    subtotal >= 2999

      ? 0

      : subtotal > 0

        ? 99

        : 0;


  // =====================================================
  // TOTAL
  // =====================================================

  const total =
    subtotal + shipping;


  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems =
    items.reduce(

      (sum, item) =>

        sum +

        Number(item.qty || 0),

      0

    );


  // =====================================================
  // PROVIDER
  // =====================================================

  return (

    <CartContext.Provider

value={{
  items,
  buyNowItem,
  loading,
  addItem,
  updateItem,
  removeItem,
  setSingleItem,
  clearCart,
  loadCart,
  subtotal,
  shipping,
  total,
  totalItems
}}

    >

      {children}

    </CartContext.Provider>

  );

}


// =======================================================
// CUSTOM HOOK
// =======================================================

export function useCart() {

  return useContext(CartContext);

}