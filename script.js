/* =========================================================
   AKARA JOINT — storefront interactions
   Vanilla JavaScript. No framework or external JS library.
   ========================================================= */

"use strict";

/* ---------- Demo catalogue ---------- */
const PRODUCTS = [
  {
    id: 1,
    name: "Classic Akara",
    category: "akara",
    tag: "House favourite",
    description: "Golden bean cakes, crisp outside and fluffy inside.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "Peppered Akara",
    category: "akara",
    tag: "A little heat",
    description: "Our classic akara with a lively pepper kick.",
    price: 2200,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "Akara Breakfast Box",
    category: "combo",
    tag: "Best for sharing",
    description: "Akara, pap and a side to make your morning.",
    price: 4500,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "Akara & Bread Combo",
    category: "combo",
    tag: "Classic combo",
    description: "Fresh akara tucked into soft bread. Simple joy.",
    price: 3000,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "Chilled Zobo",
    category: "drinks",
    tag: "Refreshing",
    description: "A cool hibiscus drink with a fruity finish.",
    price: 1200,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "Fresh Tigernut Drink",
    category: "drinks",
    tag: "Local favourite",
    description: "Smooth, naturally sweet and served chilled.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1543255006-d6395b6f1171?auto=format&fit=crop&w=700&q=80"
  }
];

/* ---------- Storage keys and demo account ---------- */
const STORAGE = {
  cart: "akaraJointCart",
  users: "akaraJointUsers",
  currentUser: "akaraJointCurrentUser"
};

const DEMO_ACCOUNT = {
  name: "Demo Customer",
  email: "demo@akarajoint.test",
  password: "akara123"
};

/* ---------- App state ---------- */
let cart = loadJSON(STORAGE.cart, []);
let currentUser = loadJSON(STORAGE.currentUser, null);
let authMode = "signin";
let toastTimer = null;

/* ---------- DOM helpers ---------- */
const $ = (selector) => document.querySelector(selector);

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Could not read ${key} from localStorage.`, error);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key} to localStorage.`, error);
    showToast("Your browser could not save this change.");
    return false;
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount);
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* ---------- Product catalogue ---------- */
function renderProducts(category = "all") {
  const grid = $("#productGrid");
  if (!grid) return;

  const filteredProducts = PRODUCTS.filter((product) => {
    return category === "all" || product.category === category;
  });

  grid.replaceChildren();

  filteredProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const photo = document.createElement("div");
    photo.className = "product-photo";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    image.onerror = () => {
      image.onerror = null;
      image.src = "https://placehold.co/700x500/f2eee5/354b37?text=Akara+Joint";
    };

    const tag = document.createElement("span");
    tag.className = "product-tag";
    tag.textContent = product.tag;
    photo.append(image, tag);

    const info = document.createElement("div");
    info.className = "product-info";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = formatMoney(product.price);

    const addButton = document.createElement("button");
    addButton.className = "add-btn";
    addButton.type = "button";
    addButton.dataset.add = String(product.id);
    addButton.textContent = "+ Add to bag";
    addButton.setAttribute("aria-label", `Add ${product.name} to bag`);

    bottom.append(price, addButton);
    info.append(name, description, bottom);
    card.append(photo, info);
    grid.append(card);
  });
}

function setActiveFilter(selectedButton) {
  document.querySelectorAll(".filter").forEach((button) => {
    const isSelected = button === selectedButton;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

/* ---------- Shopping cart ---------- */
function getProduct(productId) {
  return PRODUCTS.find((product) => product.id === Number(productId));
}

function addToCart(productId) {
  const product = getProduct(productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  saveJSON(STORAGE.cart, cart);
  renderCart();
  showToast(`${product.name} added to your bag.`);
}

function updateCartQuantity(productId, change) {
  const item = cart.find((entry) => entry.id === Number(productId));
  if (!item) return;

  item.quantity += Number(change);

  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== Number(productId));
  }

  saveJSON(STORAGE.cart, cart);
  renderCart();
}

function getCartSummary() {
  return cart.reduce(
    (summary, item) => {
      const product = getProduct(item.id);
      if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return summary;
      }

      summary.quantity += item.quantity;
      summary.subtotal += product.price * item.quantity;
      return summary;
    },
    { quantity: 0, subtotal: 0 }
  );
}

function renderCart() {
  // Remove invalid/stale cart entries before displaying the cart.
  cart = cart.filter((item) => {
    return getProduct(item.id) && Number.isInteger(item.quantity) && item.quantity > 0;
  });

  const itemsContainer = $("#cartItems");
  const countElement = $("#cartCount");
  const totalElement = $("#cartTotal");

  if (!itemsContainer || !countElement || !totalElement) return;

  const summary = getCartSummary();
  countElement.textContent = String(summary.quantity);
  totalElement.textContent = formatMoney(summary.subtotal);
  itemsContainer.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-cart";
    emptyMessage.textContent = "Your bag is waiting for something delicious.";
    itemsContainer.append(emptyMessage);
    saveJSON(STORAGE.cart, cart);
    return;
  }

  cart.forEach((item) => {
    const product = getProduct(item.id);
    const line = document.createElement("div");
    line.className = "cart-line";

    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = product.name;

    const price = document.createElement("small");
    price.textContent = `${formatMoney(product.price)} each`;
    details.append(name, price);

    const controls = document.createElement("div");
    controls.className = "qty-controls";

    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.change = "-1";
    decrease.dataset.id = String(product.id);
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Remove one ${product.name}`);

    const quantity = document.createElement("span");
    quantity.textContent = String(item.quantity);

    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.change = "1";
    increase.dataset.id = String(product.id);
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Add one ${product.name}`);

    controls.append(decrease, quantity, increase);
    line.append(details, controls);
    itemsContainer.append(line);
  });

  saveJSON(STORAGE.cart, cart);
}

function openCart() {
  $("#cartDrawer")?.classList.add("open");
}

function closeCart() {
  $("#cartDrawer")?.classList.remove("open");
}

/* ---------- Sign in / sign up demo ---------- */
function getRegisteredUsers() {
  const users = loadJSON(STORAGE.users, []);
  return Array.isArray(users) ? users : [];
}

function openAuth(mode = "signin") {
  authMode = mode;

  const modal = $("#authModal");
  const isSignUp = mode === "signup";

  if (!modal) return;

  $("#authTitle").textContent = isSignUp
    ? "Join the neighbourhood."
    : "Good to have you.";

  $("#authSubtitle").textContent = isSignUp
    ? "Create an account to make ordering easier."
    : "Sign in to continue to your account.";

  $("#nameField").classList.toggle("hidden", !isSignUp);
  $("#fullName").required = isSignUp;
  $("#authSubmit").textContent = isSignUp ? "Create account" : "Sign in";
  $("#password").autocomplete = isSignUp ? "new-password" : "current-password";
  $("#formError").textContent = "";

  $("#switchAuth").innerHTML = isSignUp
    ? 'Already have an account? <button type="button">Sign in</button>'
    : 'New to Akara Joint? <button type="button">Create an account</button>';

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  (isSignUp ? $("#fullName") : $("#email")).focus();
}

function closeAuth() {
  const modal = $("#authModal");
  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  $("#authForm").reset();
  $("#formError").textContent = "";
}

function setSignedInUser(user) {
  currentUser = { name: user.name, email: user.email };
  saveJSON(STORAGE.currentUser, currentUser);
  updateAccountUI();
}

function updateAccountUI() {
  const signInButton = $("#openSignIn");
  if (!signInButton) return;

  if (currentUser) {
    signInButton.textContent = "Hi, " + currentUser.name.split(" ")[0];
    signInButton.title = `${currentUser.email} — click to sign out`;
    signInButton.setAttribute("aria-label", "Sign out");
  } else {
    signInButton.textContent = "Sign in";
    signInButton.title = "Sign in to your account";
    signInButton.setAttribute("aria-label", "Sign in");
  }
}

function handleAuthSubmit(event) {
  event.preventDefault();

  const email = $("#email").value.trim().toLowerCase();
  const password = $("#password").value;
  const name = $("#fullName").value.trim();
  const error = $("#formError");

  error.textContent = "";

  if (!email || !password) {
    error.textContent = "Please enter your email address and password.";
    return;
  }

  if (password.length < 6) {
    error.textContent = "Your password must contain at least 6 characters.";
    return;
  }

  if (authMode === "signup") {
    if (!name) {
      error.textContent = "Please enter your full name.";
      return;
    }

    if (email === DEMO_ACCOUNT.email) {
      error.textContent = "That email is reserved for the demo account.";
      return;
    }

    const users = getRegisteredUsers();
    const alreadyRegistered = users.some((user) => user.email === email);

    if (alreadyRegistered) {
      error.textContent = "An account with this email already exists. Please sign in.";
      return;
    }

    // Mock-only registration. Never store real passwords this way in production.
    const newUser = { name, email, password };
    users.push(newUser);

    if (!saveJSON(STORAGE.users, users)) return;

    setSignedInUser(newUser);
    closeAuth();
    showToast(`Welcome to Akara Joint, ${name}!`);
    return;
  }

  const users = getRegisteredUsers();
  const allUsers = [DEMO_ACCOUNT, ...users];
  const matchedUser = allUsers.find((user) => {
    return user.email.toLowerCase() === email && user.password === password;
  });

  if (!matchedUser) {
    error.textContent = "Email or password is incorrect. Check your details and try again.";
    return;
  }

  setSignedInUser(matchedUser);
  closeAuth();
  showToast(`Welcome back, ${matchedUser.name}!`);
}

/* ---------- Event listeners ---------- */
function bindEvents() {
  $("#filters")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    setActiveFilter(button);
    renderProducts(button.dataset.filter);
  });

  $("#productGrid")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(button.dataset.add);
  });

  $("#cartButton")?.addEventListener("click", openCart);
  $("#closeCart")?.addEventListener("click", closeCart);

  $("#cartItems")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-change]");
    if (!button) return;

    updateCartQuantity(button.dataset.id, button.dataset.change);
  });

  $("#checkoutButton")?.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your bag is empty. Add something delicious first.");
      return;
    }

    if (!currentUser) {
      closeCart();
      openAuth("signin");
      showToast("Please sign in before continuing.");
      return;
    }

    showToast("Demo checkout only. Connect a backend and payment provider to accept orders.");
  });

  $("#openSignIn")?.addEventListener("click", () => {
    if (currentUser) {
      localStorage.removeItem(STORAGE.currentUser);
      currentUser = null;
      updateAccountUI();
      showToast("You have signed out.");
    } else {
      openAuth("signin");
    }
  });

  $("#openSignUp")?.addEventListener("click", () => openAuth("signup"));
  $("#closeAuth")?.addEventListener("click", closeAuth);

  $("#authModal")?.addEventListener("click", (event) => {
    if (event.target.id === "authModal") closeAuth();
  });

  $("#switchAuth")?.addEventListener("click", () => {
    openAuth(authMode === "signin" ? "signup" : "signin");
  });

  $("#authForm")?.addEventListener("submit", handleAuthSubmit);

  $("#mobileMenu")?.addEventListener("click", () => {
    $(".desktop-nav")?.classList.toggle("show");
  });

  document.querySelectorAll(".desktop-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      $(".desktop-nav")?.classList.remove("show");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAuth();
      closeCart();
      $(".desktop-nav")?.classList.remove("show");
    }
  });
}

/* ---------- Start the application ---------- */
function initialiseApp() {
  $("#year").textContent = String(new Date().getFullYear());

  // Restore only the basic display identity, not a trusted server session.
  if (currentUser && typeof currentUser.email !== "string") {
    currentUser = null;
    localStorage.removeItem(STORAGE.currentUser);
  }

  renderProducts();
  renderCart();
  updateAccountUI();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", initialiseApp);
