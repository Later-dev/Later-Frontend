document.addEventListener("DOMContentLoaded", () => {
  let cart = loadCart()
  updateCartCount()

  // --- Global Event Listeners for "Add to Cart" buttons on index.html ---
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault() // Prevent default link behavior if wrapped in <a>
      event.stopPropagation() // Prevent product card link from triggering

      const productId = button.dataset.productId
      const productName = button.dataset.productName
      const productPrice = Number.parseFloat(button.dataset.productPrice)
      const productImage = button.dataset.productImage

      addToCart(productId, productName, productPrice, productImage, 1)
      showToast(`${productName} добавлен в корзину!`) // Изменено на showToast
    })
  })

  // --- Product Detail Page Logic ---
  const productDetailPageBody = document.querySelector(".product-detail-page-body")
  if (productDetailPageBody) {
    const quantityDisplay = document.getElementById("product-quantity-display")
    const decreaseBtn = document.getElementById("decrease-quantity")
    const increaseBtn = document.getElementById("increase-quantity")
    const addToCartDetailBtn = document.getElementById("add-to-cart-detail-btn")

    let currentQuantity = Number.parseInt(quantityDisplay.textContent)

    decreaseBtn.addEventListener("click", () => {
      if (currentQuantity > 1) {
        currentQuantity--
        quantityDisplay.textContent = currentQuantity
      }
    })

    increaseBtn.addEventListener("click", () => {
      currentQuantity++
      quantityDisplay.textContent = currentQuantity
    })

    addToCartDetailBtn.addEventListener("click", () => {
      const productId = addToCartDetailBtn.dataset.productId
      const productName = addToCartDetailBtn.dataset.productName
      const productPrice = Number.parseFloat(addToCartDetailBtn.dataset.productPrice)
      const productImage = addToCartDetailBtn.dataset.productImage

      addToCart(productId, productName, productPrice, productImage, currentQuantity)
      showToast(`${productName} (${currentQuantity} шт.) добавлен в корзину!`) // Изменено на showToast
    })
  }

  // --- Cart Page Logic ---
  const cartPageBody = document.querySelector(".cart-page-body")
  if (cartPageBody) {
    renderCartItems()

    // Event delegation for quantity and remove buttons on cart page
    document.getElementById("cart-items-container").addEventListener("click", (event) => {
      const target = event.target
      if (target.classList.contains("quantity-minus")) {
        const productId = target.dataset.productId
        changeQuantity(productId, -1)
      } else if (target.classList.contains("quantity-plus")) {
        const productId = target.dataset.productId
        changeQuantity(productId, 1)
      } else if (target.classList.contains("cart-item-remove")) {
        const productId = target.dataset.productId
        removeFromCart(productId)
      }
    })
  }

  // --- Cart Functions ---

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart))
  }

  function loadCart() {
    const storedCart = localStorage.getItem("cart")
    return storedCart ? JSON.parse(storedCart) : []
  }

  function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count")
    if (cartCountElement) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      cartCountElement.textContent = totalItems
      cartCountElement.style.display = totalItems > 0 ? "flex" : "none" // Show/hide badge
    }
  }

  function addToCart(productId, name, price, image, quantityToAdd = 1) {
    const existingItemIndex = cart.findIndex((item) => item.id === productId)

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantityToAdd
    } else {
      cart.push({ id: productId, name, price, image, quantity: quantityToAdd })
    }
    saveCart()
    updateCartCount()
  }

  function changeQuantity(productId, delta) {
    const itemIndex = cart.findIndex((item) => item.id === productId)

    if (itemIndex > -1) {
      cart[itemIndex].quantity += delta
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1) // Remove item if quantity is 0 or less
      }
      saveCart()
      updateCartCount()
      renderCartItems() // Re-render cart on cart page
    }
  }

  function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId)
    saveCart()
    updateCartCount()
    renderCartItems() // Re-render cart on cart page
  }

  function renderCartItems() {
    const cartItemsContainer = document.getElementById("cart-items-container")
    const cartTotalPriceElement = document.getElementById("cart-total-price")

    if (!cartItemsContainer || !cartTotalPriceElement) return // Ensure elements exist

    cartItemsContainer.innerHTML = "" // Clear existing items
    let total = 0

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-message">Ваша корзина пуста.</p>'
    } else {
      cart.forEach((item) => {
        const itemElement = document.createElement("div")
        itemElement.classList.add("cart-item")
        itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <div class="cart-item-price">${item.price.toLocaleString("ru-RU")} ₽</div>
                    </div>
                    <div class="cart-item-quantity-controls">
                        <button class="quantity-minus" data-product-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-plus" data-product-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item-remove" data-product-id="${item.id}">✖</button>
                `
        cartItemsContainer.appendChild(itemElement)
        total += item.price * item.quantity
      })
    }
    cartTotalPriceElement.textContent = `${total.toLocaleString("ru-RU")} ₽`
  }

  // --- Toast Notification Function ---
  function showToast(message) {
    let toastContainer = document.getElementById("toast-container")
    if (!toastContainer) {
      toastContainer = document.createElement("div")
      toastContainer.id = "toast-container"
      document.body.appendChild(toastContainer)
    }

    const toast = document.createElement("div")
    toast.classList.add("toast-message")
    toast.textContent = message
    toastContainer.appendChild(toast)

    // Trigger reflow to ensure animation plays
    void toast.offsetWidth
    toast.classList.add("show")

    setTimeout(() => {
      toast.classList.remove("show")
      toast.classList.add("hide") // Add hide class for fade out
      toast.addEventListener(
        "animationend",
        () => {
          toast.remove()
          if (toastContainer.children.length === 0) {
            toastContainer.remove() // Remove container if no toasts left
          }
        },
        { once: true },
      )
    }, 3000) // Toast visible for 3 seconds
  }
})
