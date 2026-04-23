import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import mainPersonImage from "../imgs/main person.png";
import sutdSquashFront from "../imgs/sutd_Squash_front.jpg";
import { eventData, homeOutfits, marketItems, sharedLooks } from "./data";
import { requestTryOnPreview } from "./lib/tryOnApi";

const bottomNav = [
  { to: "/cart", label: "Cart", icon: CartIcon },
  { to: "/favorites", label: "Favourites", icon: HeartIcon },
  { to: "/browse", label: "Browse", icon: BrowseIcon, featured: true },
  { to: "/try-on", label: "Try-On", icon: SparklesIcon },
  { to: "/profile", label: "Profile", icon: ProfileIcon },
];

function paletteStyle(colors) {
  const [a, b, c] = colors;
  return { "--photo-1": a, "--photo-2": b, "--photo-3": c };
}

function formatPrice(value) {
  return `$${value}/day`;
}

function App() {
  const location = useLocation();
  const [savedGarment, setSavedGarment] = useState(null);
  const [marketFilters, setMarketFilters] = useState({
    occasion: "all",
    ethnicStyle: "all",
    gender: "all",
    condition: "all",
    sensitiveOnly: false,
    maxPrice: 15,
    sizeMatchOnly: false,
    sizeCategory: "all",
    material: "all",
    sleeveLength: "all",
    dressLength: "all",
  });
  const [selectedEventDate, setSelectedEventDate] = useState(eventData[0].date);
  const [bookingMessage, setBookingMessage] = useState("Choose a date to reserve this look.");
  const [savedLooks, setSavedLooks] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [userMeasurements, setUserMeasurements] = useState({
    bust: 86,
    waist: 68,
    hips: 94,
    height: 165,
    sizeCategory: "S",
  });
  const [profilePhoto, setProfilePhoto] = useState(sutdSquashFront);
  const userListings = useMemo(
    () => [
      {
        ...marketItems.find((item) => item.id === "sutd-squash-front"),
        listingStatus: "available",
        renterName: "",
        statusNote: "Available now",
        nextPickupDate: "",
      },
      {
        ...marketItems.find((item) => item.id === "sutd-campus-shirt"),
        listingStatus: "available",
        renterName: "",
        statusNote: "Available now",
        nextPickupDate: "",
      },
      {
        ...marketItems.find((item) => item.id === "powder-drape-set"),
        listingStatus: "on-rent",
        renterName: "Maya",
        statusNote: "Out until Apr 27",
        nextPickupDate: "2026-04-27",
      },
      {
        ...marketItems.find((item) => item.id === "linen-day-set"),
        listingStatus: "upcoming",
        renterName: "Jo",
        statusNote: "Booked for Apr 29",
        nextPickupDate: "2026-04-29",
      },
      {
        ...marketItems.find((item) => item.id === "cocoa-evening-slip"),
        listingStatus: "on-rent",
        renterName: "Nia",
        statusNote: "Out until Apr 25",
        nextPickupDate: "2026-04-25",
      },
      {
        ...marketItems.find((item) => item.id === "blush-wrap-dress"),
        listingStatus: "upcoming",
        renterName: "Adele",
        statusNote: "Booked for May 2",
        nextPickupDate: "2026-05-02",
      },
      {
        ...marketItems.find((item) => item.id === "ivory-eyelet-peplum"),
        listingStatus: "available",
        renterName: "",
        statusNote: "Available now",
        nextPickupDate: "",
      },
      {
        ...marketItems.find((item) => item.id === "ivory-column-gown"),
        listingStatus: "available",
        renterName: "",
        statusNote: "Available now",
        nextPickupDate: "",
      },
    ].filter(Boolean),
    []
  );
  const lendingHistory = useMemo(
    () =>
      [
        {
          ...marketItems.find((item) => item.id === "sutd-squash-front"),
          renterName: "Kai",
          lentDate: "2026-04-22",
          returnedDate: "2026-04-23",
          totalEarned: 12,
        },
        {
          ...marketItems.find((item) => item.id === "sutd-campus-shirt"),
          renterName: "Darren",
          lentDate: "2026-04-20",
          returnedDate: "2026-04-21",
          totalEarned: 14,
        },
        {
          ...marketItems.find((item) => item.id === "blush-wrap-dress"),
          renterName: "Mia",
          lentDate: "2026-04-18",
          returnedDate: "2026-04-19",
          totalEarned: 9,
        },
        {
          ...marketItems.find((item) => item.id === "linen-day-set"),
          renterName: "Evan",
          lentDate: "2026-04-16",
          returnedDate: "2026-04-17",
          totalEarned: 7,
        },
        {
          ...marketItems.find((item) => item.id === "cocoa-evening-slip"),
          renterName: "Jules",
          lentDate: "2026-04-13",
          returnedDate: "2026-04-15",
          totalEarned: 11,
        },
        {
          ...marketItems.find((item) => item.id === "powder-drape-set"),
          renterName: "Amara",
          lentDate: "2026-04-10",
          returnedDate: "2026-04-12",
          totalEarned: 15,
        },
        {
          ...marketItems.find((item) => item.id === "ivory-eyelet-peplum"),
          renterName: "Tess",
          lentDate: "2026-04-07",
          returnedDate: "2026-04-08",
          totalEarned: 8,
        },
        {
          ...marketItems.find((item) => item.id === "ivory-column-gown"),
          renterName: "Nora",
          lentDate: "2026-04-03",
          returnedDate: "2026-04-05",
          totalEarned: 15,
        },
      ]
        .filter(Boolean)
        .sort((a, b) => parseDateValue(b.returnedDate).getTime() - parseDateValue(a.returnedDate).getTime())
        .slice(0, 7),
    []
  );
  const showBottomNav = location.pathname !== "/";

  useEffect(() => {
    document.title = "Aura";
  }, []);

  const toggleFavorite = (id) => {
    setSavedLooks((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const addToCart = (id, bookingDetails = null) => {
    setCartItems((current) => {
      if (bookingDetails?.selectedStartDate && bookingDetails?.selectedEndDate) {
        const bookingKey = `${id}-${bookingDetails.selectedStartDate}-${bookingDetails.selectedEndDate}`;
        const existingBookedItem = current.find((item) => item.bookingKey === bookingKey);

        if (existingBookedItem) {
          return current.map((item) =>
            item.bookingKey === bookingKey ? { ...item, quantity: item.quantity + 1 } : item
          );
        }

        return [
          ...current,
          {
            id,
            quantity: 1,
            bookingKey,
            selectedStartDate: bookingDetails.selectedStartDate,
            selectedEndDate: bookingDetails.selectedEndDate,
            rentalDays: bookingDetails.rentalDays,
            totalPrice: bookingDetails.totalPrice,
          },
        ];
      }

      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { id, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id, delta, bookingKey = "") => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === id && (bookingKey ? item.bookingKey === bookingKey : !item.bookingKey)
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <main className="app-shell">
      <section className="phone-stage">
        <section className="phone-frame">
          <header className="status-bar">
            <span>9:41</span>
            <div className="status-icons">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </header>

          <PhoneHeader />

          <Routes>
            <Route path="/" element={<Navigate to="/browse" replace />} />
            <Route
              path="/home"
              element={
                <HomeScreen
                  savedLooks={savedLooks}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                />
              }
            />
            <Route
              path="/browse"
              element={
                <MarketplaceScreen
                  filters={marketFilters}
                  onFiltersChange={setMarketFilters}
                  savedLooks={savedLooks}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                  userMeasurements={userMeasurements}
                />
              }
            />
            <Route
              path="/try-on"
              element={
                <TryOnScreen
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                  savedLooks={savedLooks}
                  userMeasurements={userMeasurements}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <FavoritesScreen
                  savedLooks={savedLooks}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                />
              }
            />
            <Route
              path="/cart"
              element={
                <CartScreen cartItems={cartItems} onUpdateCartQuantity={updateCartQuantity} />
              }
            />
            <Route
              path="/events"
              element={
                <EventsScreen
                  selectedEventDate={selectedEventDate}
                  onSelectDate={setSelectedEventDate}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfileScreen
                  userMeasurements={userMeasurements}
                  onMeasurementsChange={setUserMeasurements}
                  userListings={userListings}
                  lendingHistory={lendingHistory}
                  profilePhoto={profilePhoto}
                  onProfilePhotoChange={setProfilePhoto}
                />
              }
            />
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
            <Route
              path="/upload"
              element={<UploadScreen savedGarment={savedGarment} onSaveGarment={setSavedGarment} />}
            />
            <Route
              path="/detail/:itemId"
              element={
                <DetailScreen
                  bookingMessage={bookingMessage}
                  onBookingMessageChange={setBookingMessage}
                  onAddToCart={addToCart}
                  userMeasurements={userMeasurements}
                />
              }
            />
          </Routes>

          {showBottomNav ? <BottomNav /> : null}
        </section>
      </section>
    </main>
  );
}

function PhoneHeader() {
  const location = useLocation();
  const labelByRoute = {
    "/": "Welcome",
    "/home": "Style Feed",
    "/upload": "Digital Wardrobe",
    "/browse": "Browse Catalogue",
    "/try-on": "Aura AI",
    "/events": "Event Styling",
    "/favorites": "Saved Looks",
    "/cart": "Rental Cart",
    "/profile": "Profile",
    "/settings": "Profile",
  };
  const activeLabel = location.pathname.startsWith("/detail/")
    ? "Rental Detail"
    : labelByRoute[location.pathname] ?? "Aura";

  return (
    <div className="phone-header">
      <div className="brand-pill glass-panel">
        <span className="brand-mark">A</span>
        <div>
          <strong>Aura</strong>
          <p>{activeLabel}</p>
        </div>
      </div>
      <div className="ambient-pill glass-panel">AI wardrobe</div>
    </div>
  );
}

function Screen({ children, className = "" }) {
  return <section className={`screen active-screen ${className}`.trim()}>{children}</section>;
}

function WelcomeScreen({ userMeasurements, onMeasurementsChange }) {
  const updateMeasurements = (key, value) => {
    onMeasurementsChange((current) => ({ ...current, [key]: value }));
  };

  return (
    <Screen className="welcome-screen">
      <div className="hero-photo">
        <div className="hero-glow"></div>
        <div className="hero-model hero-model-left"></div>
        <div className="hero-model hero-model-right"></div>
      </div>
      <div className="welcome-copy glass-panel">
        <p className="eyebrow">Curated by AI</p>
        <h2>Aura dresses your shared wardrobe.</h2>
        <p>
          Build a communal wardrobe with editorial styling, gentle fabric
          intelligence, and shared occasion dressing.
        </p>
        <article className="measurement-card">
          <div className="section-head">
            <h3>Your size profile</h3>
            <span className="price-tag">Used for match score</span>
          </div>
          <div className="measurement-grid">
            <label className="field">
              <span>Bust (cm)</span>
              <input
                type="number"
                value={userMeasurements.bust}
                onChange={(event) => updateMeasurements("bust", Number(event.target.value))}
              />
            </label>
            <label className="field">
              <span>Waist (cm)</span>
              <input
                type="number"
                value={userMeasurements.waist}
                onChange={(event) => updateMeasurements("waist", Number(event.target.value))}
              />
            </label>
            <label className="field">
              <span>Hips (cm)</span>
              <input
                type="number"
                value={userMeasurements.hips}
                onChange={(event) => updateMeasurements("hips", Number(event.target.value))}
              />
            </label>
            <label className="field">
              <span>Size</span>
              <select
                value={userMeasurements.sizeCategory}
                onChange={(event) => updateMeasurements("sizeCategory", event.target.value)}
              >
                {["XS", "S", "M", "L"].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>
        <div className="cta-stack">
          <Link className="glass-button primary align-center" to="/browse">
            Save and browse
          </Link>
          <Link className="glass-button align-center" to="/browse">
            Continue
          </Link>
        </div>
      </div>
    </Screen>
  );
}

function HomeScreen({ savedLooks, onToggleFavorite, onAddToCart }) {
  return (
    <Screen>
      <div className="screen-scroll">
        <div className="top-row browse-top-row">
          <div>
            <p className="eyebrow">Thursday edit</p>
            <h2 className="screen-title">Good morning, Sia</h2>
          </div>
          <button className="icon-button" aria-label="More options">
            ...
          </button>
        </div>

        <article className="feature-card glass-panel">
          <div>
            <p className="eyebrow">AI Suggestions</p>
            <h3>For your upcoming events</h3>
            <p>
              3 looks prepared for your rooftop dinner, gallery visit, and
              Sunday brunch.
            </p>
          </div>
          <Link className="glass-chip align-center" to="/events">
            Open agenda
          </Link>
        </article>

        <section className="stack-section">
          <div className="section-head">
            <h3>Suggested outfits</h3>
            <Link className="text-button" to="/try-on">
              Try on
            </Link>
          </div>
          <div className="outfit-list">
            {homeOutfits.map((item) => (
              <article className="outfit-card" key={item.id}>
                <img className="outfit-thumb real-image" src={item.image} alt={item.title} />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.note}</p>
                  <div className="meta-row">
                  <span>{item.meta}</span>
                  <div className="inline-actions compact-actions">
                      <button className="glass-chip" onClick={() => onToggleFavorite(item.id)}>
                        {savedLooks.includes(item.id) ? "Saved" : "Save"}
                      </button>
                      <button className="glass-chip" onClick={() => onAddToCart("powder-drape-set")}>
                        Add cart
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stack-section">
          <div className="section-head">
            <h3>Shared near you</h3>
            <Link className="text-button" to="/browse">
              Browse all
            </Link>
          </div>
          <div className="mini-grid">
            {sharedLooks.map((item) => (
              <article className="mini-card" key={item.id}>
                <img className="mini-thumb real-image" src={item.image} alt={item.title} />
                <h4>{item.title}</h4>
                <div className="meta-row card-meta">
                  <span>{item.price}</span>
                  <Link className="text-button" to="/detail/powder-drape-set">
                    Rent
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Screen>
  );
}

function UploadScreen({ savedGarment, onSaveGarment }) {
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    label: "",
    fabric: "",
    notes: "",
  });

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSaveGarment({
      label: form.label.trim() || "Untitled garment",
      fabric: form.fabric.trim() || "Fabric not specified",
      notes: form.notes.trim() || "No notes added yet.",
      preview,
    });
  };

  return (
    <Screen>
      <div className="screen-scroll">
        <div className="top-row">
          <div>
            <p className="eyebrow">Wardrobe digitization</p>
            <h2 className="screen-title">Upload a garment</h2>
          </div>
        </div>

        <form className="upload-form glass-panel" onSubmit={handleSubmit}>
          <label className="upload-dropzone">
            <input type="file" accept="image/*" onChange={handleFile} />
            <div
              className="upload-preview"
              style={preview ? { backgroundImage: `url(${preview})` } : undefined}
            >
              {!preview && <span>Tap to add photo</span>}
            </div>
          </label>

          <label className="field">
            <span>Label</span>
            <input
              value={form.label}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
              type="text"
              placeholder="Cream silk wrap dress"
            />
          </label>

          <label className="field">
            <span>Fabric</span>
            <input
              value={form.fabric}
              onChange={(event) => setForm({ ...form, fabric: event.target.value })}
              type="text"
              placeholder="Silk blend"
            />
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea
              rows="4"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Soft lining, skin-safe, ideal for spring evenings"
            ></textarea>
          </label>

          <button className="glass-button primary" type="submit">
            Save to wardrobe
          </button>
        </form>

        <section className="saved-garment glass-panel">
          <p className="eyebrow">Latest upload</p>
          {savedGarment ? (
            <>
              <h3>{savedGarment.label}</h3>
              <p>
                <strong>Fabric:</strong> {savedGarment.fabric}
              </p>
              <p>{savedGarment.notes}</p>
            </>
          ) : (
            <>
              <h3>No garment uploaded yet</h3>
              <p>Your saved item will appear here with the fabric details.</p>
            </>
          )}
        </section>
      </div>
    </Screen>
  );
}

function MarketplaceScreen({
  filters,
  onFiltersChange,
  savedLooks,
  onToggleFavorite,
  onAddToCart,
  userMeasurements,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [eventAlertDismissed, setEventAlertDismissed] = useState(false);
  const [eventCardOffset, setEventCardOffset] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);
  const [eventSwipeLocked, setEventSwipeLocked] = useState(false);
  const swipeActionThreshold = 36;
  const upcomingEvent = {
    title: "Capstone showcase",
    hint: "Looking for formals?",
    detail: "Calendar sync spotted this event coming up soon and matched it with your browse alerts.",
  };

  const filtered = useMemo(() => {
    return marketItems.filter((item) => {
      if (filters.occasion !== "all") {
        if (filters.occasion === "ethnic") {
          if (item.occasionType !== "ethnic") return false;
        } else if (item.occasionType !== filters.occasion) {
          return false;
        }
      }

      if (filters.ethnicStyle !== "all" && item.ethnicStyle !== filters.ethnicStyle) {
        return false;
      }

      if (filters.gender !== "all" && item.gender !== filters.gender) {
        return false;
      }

      if (filters.condition !== "all" && item.condition !== filters.condition) {
        return false;
      }

      if (filters.sensitiveOnly && !item.sensitive) {
        return false;
      }

      if (item.dailyPrice > filters.maxPrice) {
        return false;
      }

      if (filters.sizeCategory !== "all" && item.sizeCategory !== filters.sizeCategory) {
        return false;
      }

      if (filters.material !== "all" && item.material !== filters.material) {
        return false;
      }

      if (filters.sleeveLength !== "all" && item.sleeveLength !== filters.sleeveLength) {
        return false;
      }

      if (filters.dressLength !== "all" && item.dressLength !== filters.dressLength) {
        return false;
      }

      if (filters.sizeMatchOnly && getMatchScore(item, userMeasurements) < 75) {
        return false;
      }

      return true;
    });
  }, [filters, userMeasurements]);

  const updateFilter = (key, value) => {
    onFiltersChange((current) => ({ ...current, [key]: value }));
  };

  const applyEventSuggestion = () => {
    updateFilter("occasion", "formal");
    setEventCardOffset(0);
    setEventAlertDismissed(false);
    setEventSwipeLocked(false);
  };

  const dismissEventSuggestion = () => {
    setEventAlertDismissed(true);
    setEventCardOffset(0);
    setEventSwipeLocked(false);
  };

  const handleEventPointerDown = (event) => {
    if (eventSwipeLocked) return;
    setDragStartX(event.clientX);
  };

  const handleEventPointerMove = (event) => {
    if (dragStartX === null || eventSwipeLocked) return;
    const nextOffset = event.clientX - dragStartX;
    setEventCardOffset(nextOffset);

    if (nextOffset >= swipeActionThreshold) {
      setEventSwipeLocked(true);
      setEventCardOffset(92);
      setDragStartX(null);
      setTimeout(() => applyEventSuggestion(), 280);
      return;
    }

    if (nextOffset <= -swipeActionThreshold) {
      setEventSwipeLocked(true);
      setEventCardOffset(-92);
      setTimeout(() => dismissEventSuggestion(), 280);
      setDragStartX(null);
    }
  };

  const handleEventPointerEnd = () => {
    if (dragStartX !== null && !eventSwipeLocked) {
      setEventCardOffset(0);
    }
    setDragStartX(null);
  };

  return (
    <Screen>
      <div className="screen-scroll">
        <div className="top-row">
          <div>
            <p className="eyebrow">Aura browse</p>
            <h2 className="screen-title">Main catalogue</h2>
          </div>
          <button className="icon-button" onClick={() => setShowFilters((current) => !current)} aria-label="Open filters">
            <FilterIcon />
          </button>
        </div>

        <div className="quick-filters">
          <button
            className={`filter-chip ${filters.occasion === "daily-wear" ? "active" : ""}`}
            onClick={() => updateFilter("occasion", filters.occasion === "daily-wear" ? "all" : "daily-wear")}
          >
            Daily wear
          </button>
          <button
            className={`filter-chip ${filters.occasion === "party" ? "active" : ""}`}
            onClick={() => updateFilter("occasion", filters.occasion === "party" ? "all" : "party")}
          >
            Party
          </button>
          <button
            className={`filter-chip ${filters.occasion === "formal" ? "active" : ""}`}
            onClick={() => updateFilter("occasion", filters.occasion === "formal" ? "all" : "formal")}
          >
            Formal
          </button>
        </div>

        <section className="stack-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Calendar linked</p>
              <h3>Upcoming events</h3>
            </div>
          </div>
          <article className="feature-card glass-panel event-alert-shell">
            {!eventAlertDismissed ? (
              <div className="event-swipe-frame">
                <div className="event-swipe-action event-swipe-action-search" aria-hidden="true">
                  <SearchIcon />
                </div>
                <div className="event-swipe-action event-swipe-action-delete" aria-hidden="true">
                  <TrashIcon />
                </div>
                <div
                  className={`event-alert-card ${eventCardOffset > 24 ? "swipe-right" : ""} ${
                    eventCardOffset < -24 ? "swipe-left" : ""
                  }`}
                  style={{ transform: `translateX(${eventCardOffset}px)` }}
                  onPointerDown={handleEventPointerDown}
                  onPointerMove={handleEventPointerMove}
                  onPointerUp={handleEventPointerEnd}
                  onPointerCancel={handleEventPointerEnd}
                >
                  <div className="event-alert-copy">
                    <p className="eyebrow">Upcoming event</p>
                    <h3>{upcomingEvent.title}</h3>
                    <p>{upcomingEvent.hint}</p>
                    <small>{upcomingEvent.detail}</small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="event-alert-empty">
                <div>
                  <p className="eyebrow">Upcoming event</p>
                  <h3>No event alert showing</h3>
                  <p>The capstone reminder was dismissed. Reopen it below for the calendar POC.</p>
                </div>
                <button
                  className="glass-chip align-center"
                  onClick={() => setEventAlertDismissed(false)}
                >
                  Show event again
                </button>
              </div>
            )}
          </article>
        </section>

        <div className="market-grid">
          {filtered.map((item) => (
            <Link className="market-card market-card-link" key={item.id} to={`/detail/${item.id}`}>
              <div className="market-image-wrap">
                <img className="market-thumb real-image" src={item.image} alt={item.title} />
                <button
                  className={`favorite-button ${savedLooks.includes(item.id) ? "favorite-button-active" : ""}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onToggleFavorite(item.id);
                  }}
                  aria-label="Save item"
                >
                  <HeartToggleIcon filled={savedLooks.includes(item.id)} />
                </button>
                <button
                  className="cart-plus-button"
                  onClick={(event) => {
                    event.preventDefault();
                    onAddToCart(item.id);
                  }}
                  aria-label="Add to cart"
                >
                  <PlusIcon />
                </button>
              </div>
              <h4>{item.title}</h4>
              <p>{getOccasionLabel(item)}</p>
              <div className="meta-row browse-card-footer">
                <span className="browse-price">{formatPrice(item.dailyPrice)}</span>
                <span>{getMatchScore(item, userMeasurements)}% match</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {showFilters ? (
        <>
          <button className="drawer-backdrop" onClick={() => setShowFilters(false)} aria-label="Close filters" />
          <aside className="filters-drawer glass-panel">
            <div className="section-head">
              <h3>Filter catalogue</h3>
              <button className="text-button" onClick={() => setShowFilters(false)}>
                Close
              </button>
            </div>

            <article className="content-card glass-panel drawer-profile-card">
              <p className="eyebrow">Size profile</p>
              <h4>
                {userMeasurements.sizeCategory} | Bust {userMeasurements.bust} | Waist {userMeasurements.waist} | Hips {userMeasurements.hips}
              </h4>
              <p>Aura compares these measurements with each item's dimensions and fabric stretch to score fit.</p>
            </article>

            <FilterGroup
              title="Occasion"
              options={[
                ["all", "All"],
                ["ethnic", "Ethnic"],
                ["daily-wear", "Daily wear"],
                ["party", "Party"],
                ["formal", "Formal"],
                ["university", "University"],
              ]}
              value={filters.occasion}
              onChange={(value) => {
                updateFilter("occasion", value);
                if (value !== "ethnic") updateFilter("ethnicStyle", "all");
              }}
            />

            {filters.occasion === "ethnic" ? (
              <FilterGroup
                title="Ethnic category"
                options={[
                  ["all", "All"],
                  ["chinese", "Chinese"],
                  ["indian", "Indian"],
                  ["malay", "Malay"],
                ]}
                value={filters.ethnicStyle}
                onChange={(value) => updateFilter("ethnicStyle", value)}
              />
            ) : null}

            <FilterGroup
              title="Gender"
              options={[
                ["all", "All"],
                ["male", "Male"],
                ["female", "Female"],
                ["unisex", "Unisex"],
              ]}
              value={filters.gender}
              onChange={(value) => updateFilter("gender", value)}
            />

            <FilterGroup
              title="Size"
              options={[
                ["all", "All"],
                ["XS", "XS"],
                ["S", "S"],
                ["M", "M"],
                ["L", "L"],
              ]}
              value={filters.sizeCategory}
              onChange={(value) => updateFilter("sizeCategory", value)}
            />

            <FilterGroup
              title="Material"
              options={[
                ["all", "All"],
                ["silk", "Silk"],
                ["linen", "Linen"],
                ["cotton", "Cotton"],
                ["satin", "Satin"],
                ["lace", "Lace"],
                ["knit", "Knit"],
                ["brocade", "Brocade"],
                ["chiffon", "Chiffon"],
                ["cupro", "Cupro"],
              ]}
              value={filters.material}
              onChange={(value) => updateFilter("material", value)}
            />

            <FilterGroup
              title="Sleeve length"
              options={[
                ["all", "All"],
                ["sleeveless", "Sleeveless"],
                ["short", "Short"],
                ["long", "Long"],
              ]}
              value={filters.sleeveLength}
              onChange={(value) => updateFilter("sleeveLength", value)}
            />

            <FilterGroup
              title="Dress length"
              options={[
                ["all", "All"],
                ["mini", "Mini"],
                ["midi", "Midi"],
                ["maxi", "Maxi"],
              ]}
              value={filters.dressLength}
              onChange={(value) => updateFilter("dressLength", value)}
            />

            <FilterGroup
              title="Condition"
              options={[
                ["all", "All"],
                ["brand-new", "Brand new"],
                ["worn-few", "Worn a few times"],
                ["well-used", "Well used"],
              ]}
              value={filters.condition}
              onChange={(value) => updateFilter("condition", value)}
            />

            <div className="filter-section">
              <div className="section-head">
                <h4>Price range</h4>
                <span className="price-tag">$10 - ${filters.maxPrice}</span>
              </div>
              <input
                className="price-slider"
                type="range"
                min="10"
                max="40"
                step="1"
                value={filters.maxPrice}
                onChange={(event) => updateFilter("maxPrice", Number(event.target.value))}
              />
            </div>

            <div className="filter-toggle-row">
              <div>
                <h4>Strong size match</h4>
                <p>Show only items with at least a 75% fit score for your profile.</p>
              </div>
              <button
                className={`switch ${filters.sizeMatchOnly ? "switch-on" : ""}`}
                onClick={() => updateFilter("sizeMatchOnly", !filters.sizeMatchOnly)}
                aria-pressed={filters.sizeMatchOnly}
              >
                <span></span>
              </button>
            </div>

            <div className="filter-toggle-row">
              <div>
                <h4>Sensitive skin safe</h4>
                <p>Show only lined or soft-fabric options.</p>
              </div>
              <button
                className={`switch ${filters.sensitiveOnly ? "switch-on" : ""}`}
                onClick={() => updateFilter("sensitiveOnly", !filters.sensitiveOnly)}
                aria-pressed={filters.sensitiveOnly}
              >
                <span></span>
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </Screen>
  );
}

function TryOnScreen({
  onToggleFavorite,
  onAddToCart,
  savedLooks,
  userMeasurements,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [preview, setPreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const favoriteItems = marketItems.filter((item) => savedLooks.includes(item.id));
  const selectedItemId = searchParams.get("item") ?? "";
  const selectedItem =
    favoriteItems.find((item) => item.id === selectedItemId) ?? null;
  const matchScore = selectedItem ? getTryOnDisplayScore(selectedItem, userMeasurements) : null;

  useEffect(() => {
    if (!selectedItem) {
      setPreview(null);
      setIsGenerating(false);
    }
  }, [selectedItem]);

  const eligibility = selectedItem
    ? getTryOnEligibility(selectedItem, userMeasurements)
    : null;

  useEffect(() => {
    if (!selectedItem || !eligibility) return;
    let ignore = false;

    async function generatePreview() {
      setIsGenerating(true);

      if (!eligibility.allowed) {
        if (!ignore) {
          setPreview({
            generated: false,
            eligibility,
          });
        }
        setIsGenerating(false);
        return;
      }

      const result = await requestTryOnPreview({
        outfit: selectedItem,
        fitState: eligibility.fitState,
        fitAdjustmentPercent: eligibility.fitAdjustmentPercent,
      });

      if (!ignore) {
        setPreview({
          generated: true,
          eligibility,
          ...result,
        });
        setIsGenerating(false);
      }
    }

    generatePreview();

    return () => {
      ignore = true;
    };
  }, [selectedItem, eligibility]);

  return (
    <Screen>
      <div className="screen-scroll">
        <div className="top-row">
          <div>
            <p className="eyebrow">AI render</p>
            <h2 className="screen-title">Outfit try-on</h2>
          </div>
        </div>

        <article className="tryon-stage glass-panel">
          <div className="tryon-canvas">
            <div className="media-toggle-overlay glass-panel">
              <button
                className={`media-toggle-button ${mediaType === "image" ? "active" : ""}`}
                onClick={() => setMediaType("image")}
              >
                Image
              </button>
              <button
                className={`media-toggle-button ${mediaType === "video" ? "active" : ""}`}
                onClick={() => setMediaType("video")}
              >
                Video
              </button>
            </div>
            {!selectedItem ? (
              <img className="tryon-person-image" src={mainPersonImage} alt="Main person" />
            ) : mediaType === "video" && selectedItem.preGeneratedTryOnVideo ? (
              <video
                className="tryon-full-preview"
                src={selectedItem.preGeneratedTryOnVideo}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : preview?.generated && preview.fullPreview ? (
              <img
                className="tryon-full-preview"
                src={preview.outfitImage}
                alt={`${selectedItem.title} try-on preview`}
              />
            ) : (
              <>
                <img className="tryon-person-image" src={mainPersonImage} alt="Main person" />
                {preview?.generated ? (
                  <img
                    className={`tryon-generated-overlay tryon-fit-${preview.fitState}`}
                    src={preview.outfitImage}
                    alt={`${selectedItem.title} try-on preview`}
                    style={{
                      transform: `translate(-50%, ${preview.overlayYOffset}px) scale(${preview.overlayScale})`,
                      opacity: preview.overlayOpacity,
                    }}
                  />
                ) : null}
              </>
            )}
            {selectedItem ? (
              <div
                className={`tryon-stage-badge glass-panel ${
                  matchScore <= 85 ? "score-badge-mid" : "score-badge-high"
                }`}
              >
                {matchScore}% match
              </div>
            ) : null}
          </div>
          <div className="floating-actions">
            <Link
              className={`icon-button small align-center ${!selectedItem ? "icon-button-disabled" : ""}`}
              to={selectedItem ? `/detail/${selectedItem.id}` : "/browse"}
              aria-label="View item details"
            >
              <InfoIcon />
            </Link>
          </div>
        </article>

        <article className="content-card glass-panel">
          <div className="section-head">
            <h3>Choose outfit</h3>
            <span className="price-tag">{selectedItem ? selectedItem.size : "None selected"}</span>
          </div>
          {favoriteItems.length ? (
            <div className="tryon-look-grid">
              {favoriteItems.map((item) => (
                <button
                  key={item.id}
                  className={`tryon-look-card ${selectedItem?.id === item.id ? "tryon-look-card-active" : ""}`}
                  onClick={() => setSearchParams({ item: item.id })}
                >
                  <img src={item.image} alt={item.title} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Try-On only shows your favourited outfits.</p>
              <Link className="glass-button primary align-center" to="/browse">
                Browse catalogue
              </Link>
            </div>
          )}
        </article>

        {selectedItem ? (
          <article className="glass-panel content-card">
            <div className="tryon-insights">
              <span className="price-tag">
                Match {getTryOnDisplayScore(selectedItem, userMeasurements)}%
              </span>
              <span
                className={`price-tag ${
                  eligibility.allowed ? "tryon-eligible" : "tryon-blocked"
                }`}
              >
                {eligibility.allowed
                  ? `${getFitLabel(eligibility.fitState)} | ${Math.abs(
                      eligibility.fitAdjustmentPercent
                    )}%`
                  : "Outside +/- 15%"}
              </span>
            </div>
            {!eligibility.allowed ? (
              <p>
                Generation is blocked because the selected outfit exceeds the allowed
                +/- 15% difference for {eligibility.failingDimensions.join(", ")}.
              </p>
            ) : mediaType === "video" && !selectedItem.preGeneratedTryOnVideo ? (
              <p>No pre-generated video is available for this outfit yet. Switch back to image view.</p>
            ) : selectedItem.preGeneratedTryOnImage ? (
              <p>Showing your pre-generated try-on preview for this saved outfit.</p>
            ) : (
              <p>
                Preview generated with a {getFitLabel(eligibility.fitState).toLowerCase()} adjustment
                of {Math.abs(eligibility.fitAdjustmentPercent)}% based on your measurements.
              </p>
            )}
            <div className="detail-actions">
              <button
                className="glass-button"
                onClick={() => selectedItem && onToggleFavorite(selectedItem.id)}
                disabled={!selectedItem}
              >
                {selectedItem && savedLooks.includes(selectedItem.id)
                  ? "Saved to favourites"
                  : "Save to favourites"}
              </button>
              <button
                className="glass-button primary"
                onClick={() => selectedItem && onAddToCart(selectedItem.id)}
                disabled={!selectedItem}
              >
                Add to cart
              </button>
            </div>
          </article>
        ) : null}
      </div>
    </Screen>
  );
}

function FavoritesScreen({ savedLooks, onToggleFavorite, onAddToCart }) {
  const favoriteItems = marketItems.filter((item) => savedLooks.includes(item.id));

  return (
    <Screen>
      <div className="screen-scroll">
        <div className="top-row">
          <div>
            <p className="eyebrow">Shortlist</p>
            <h2 className="screen-title">Favourites</h2>
          </div>
        </div>

        {favoriteItems.length ? (
          <div className="market-grid">
            {favoriteItems.map((item) => (
              <Link className="market-card market-card-link favorite-card-link" key={item.id} to={`/detail/${item.id}`}>
                <div className="market-image-wrap">
                  <img className="market-thumb real-image" src={item.image} alt={item.title} />
                  <button
                    className="favorite-button favorite-card-remove"
                    aria-label={`Remove ${item.title} from favourites`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                  >
                    <CloseIcon />
                  </button>
                  <button
                    className="cart-plus-button"
                    aria-label={`Add ${item.title} to cart`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onAddToCart(item.id);
                    }}
                  >
                    <PlusIcon />
                  </button>
                </div>
                <h4>{item.title}</h4>
                <p>{formatPrice(item.dailyPrice)} | {item.fit}</p>
              </Link>
            ))}
          </div>
        ) : (
          <article className="content-card glass-panel empty-state">
            <p className="eyebrow">No saved looks</p>
            <h3>Your favourites list is empty</h3>
            <p>Tap Save on any item in Browse or AI Try-On to keep it here.</p>
            <Link className="glass-button primary align-center" to="/browse">
              Browse catalogue
            </Link>
          </article>
        )}
      </div>
    </Screen>
  );
}

function CartScreen({ cartItems, onUpdateCartQuantity }) {
  const items = cartItems
    .map((entry) => {
      const product = marketItems.find((item) => item.id === entry.id);
      return product ? { ...product, ...entry } : null;
    })
    .filter(Boolean);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.totalPrice ?? item.dailyPrice) * item.quantity,
    0
  );

  return (
    <Screen>
      <div className="screen-scroll">
        <div className="top-row">
          <div>
            <p className="eyebrow">Rental checkout</p>
            <h2 className="screen-title">Cart</h2>
          </div>
        </div>

        {items.length ? (
          <>
            <div className="cart-list">
              {items.map((item) => (
                <article className="cart-card glass-panel" key={item.bookingKey ?? item.id}>
                  <img className="cart-thumb" src={item.image} alt={item.title} />
                  <div className="cart-content">
                    <h4>{item.title}</h4>
                    <p>
                      {item.bookingKey
                        ? `${formatDateLabel(item.selectedStartDate)} - ${formatDateLabel(
                            item.selectedEndDate
                          )} | ${item.rentalDays} days`
                        : `${formatPrice(item.dailyPrice)} | Owner: ${item.owner}`}
                    </p>
                    {item.bookingKey ? (
                      <p>
                        ${item.totalPrice} total | ${formatPrice(item.dailyPrice)} | Owner: {item.owner}
                      </p>
                    ) : null}
                    <div className="quantity-row">
                      <button
                        className="glass-chip"
                        onClick={() => onUpdateCartQuantity(item.id, -1, item.bookingKey)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="glass-chip"
                        onClick={() => onUpdateCartQuantity(item.id, 1, item.bookingKey)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <article className="detail-card glass-panel">
              <div className="section-head">
                <h2>Order summary</h2>
                <span className="price-tag">${subtotal.toFixed(2)}</span>
              </div>
              <p>Includes your selected rentals, with booked date ranges priced directly in the cart.</p>
              <button className="glass-button primary">Continue to booking</button>
            </article>
          </>
        ) : (
          <article className="content-card glass-panel empty-state">
            <p className="eyebrow">Cart empty</p>
            <h3>No dresses added yet</h3>
            <p>Add looks from Browse, Favourites, or AI Try-On to start your rental bundle.</p>
            <Link className="glass-button primary align-center" to="/browse">
              Browse catalogue
            </Link>
          </article>
        )}
      </div>
    </Screen>
  );
}

function EventsScreen({ selectedEventDate, onSelectDate }) {
  return (
    <Screen>
      <div className="screen-scroll">
        <div className="top-row">
          <div>
            <p className="eyebrow">Calendar styling</p>
            <h2 className="screen-title">Your event wardrobe</h2>
          </div>
        </div>

        <div className="calendar glass-panel">
          {Array.from({ length: 14 }, (_, index) => {
            const day = index + 20;
            const isSelected = selectedEventDate === day;
            const isEventDay = eventData.some((event) => event.date === day);
            return (
              <button
                key={day}
                className={`calendar-day ${isSelected || isEventDay ? "active" : ""}`}
                onClick={() => onSelectDate(day)}
              >
                {day}
              </button>
            );
          })}
        </div>

        <section className="event-list">
          {eventData.map((event) => (
            <article
              className={`event-card glass-panel ${selectedEventDate === event.date ? "event-card-active" : ""}`}
              key={event.id}
            >
              <p className="eyebrow">April {event.date}</p>
              <h4>{event.title}</h4>
              <p>
                {event.time} | {event.look}
              </p>
              <span className="reminder">{event.reminder}</span>
            </article>
          ))}
        </section>
      </div>
    </Screen>
  );
}

function DetailScreen({
  bookingMessage,
  onBookingMessageChange,
  onAddToCart,
  userMeasurements,
}) {
  const { itemId } = useParams();
  const item = marketItems.find((entry) => entry.id === itemId) ?? marketItems[0];
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const blockedDates = useMemo(() => getBlockedDatesForItem(item.id), [item.id]);
  const calendarDays = useMemo(() => getCalendarMonthGrid(calendarMonth), [calendarMonth]);
  const selectedDates = useMemo(
    () => getDateRange(selectedStartDate, selectedEndDate),
    [selectedStartDate, selectedEndDate]
  );
  const rentalDays = selectedDates.length;
  const finalPrice = rentalDays * item.dailyPrice;

  const openCalendar = () => {
    const anchorDate = selectedStartDate ? parseDateValue(selectedStartDate) : new Date();
    setCalendarMonth(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1));
    setIsCalendarOpen(true);
  };

  const closeCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handleCalendarDateClick = (dateValue) => {
    if (blockedDates.includes(dateValue)) {
      return;
    }

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(dateValue);
      setSelectedEndDate("");
      return;
    }

    if (dateValue < selectedStartDate) {
      setSelectedStartDate(dateValue);
      return;
    }

    const proposedRange = getDateRange(selectedStartDate, dateValue);
    const hitsBlockedDate = proposedRange.some((date) => blockedDates.includes(date));
    if (hitsBlockedDate) {
      onBookingMessageChange("That range includes dates already booked by another renter.");
      return;
    }

    setSelectedEndDate(dateValue);
  };

  const selectedRangeLabel =
    selectedStartDate && selectedEndDate
      ? `${formatDateLabel(selectedStartDate)} - ${formatDateLabel(selectedEndDate)}`
      : selectedStartDate
        ? `${formatDateLabel(selectedStartDate)} - Select an end date`
        : "Choose your rental dates";

  const reserveLook = () => {
    if (!selectedStartDate || !selectedEndDate) {
      onBookingMessageChange("Select a start and end date before confirming the booking.");
      return;
    }

    onBookingMessageChange(
      `Booked ${item.title} for ${selectedRangeLabel}. Total: $${finalPrice}.`
    );
  };

  const addBookedLookToCart = () => {
    if (!selectedStartDate || !selectedEndDate) {
      onBookingMessageChange("Select your rental dates before adding this item to cart.");
      return;
    }

    onAddToCart(item.id, {
      selectedStartDate,
      selectedEndDate,
      rentalDays,
      totalPrice: finalPrice,
    });
    onBookingMessageChange(
      `${item.title} added to cart for ${selectedRangeLabel}. Total: $${finalPrice}.`
    );
  };

  return (
    <Screen>
      <div className="screen-scroll">
        <div className="detail-image glass-panel">
          <div
            className="detail-model detail-model-cover"
            role="img"
            aria-label={item.title}
            style={{
              backgroundImage: `url(${item.image})`,
              backgroundSize: "contain",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>

        <article className="detail-card glass-panel">
          <p className="eyebrow">Community rental</p>
          <div className="section-head">
            <h2>{item.title}</h2>
            <span className="price-tag">{formatPrice(item.dailyPrice)}</span>
          </div>
          <p>{item.description}</p>
          <div className="detail-specs">
            <span>Fabric: {item.fabric}</span>
            <span>Fit: {item.fit}</span>
            <span>Size: {item.size}</span>
            <span>Occasion: {getOccasionLabel(item)}</span>
            <span>Condition: {getConditionLabel(item.condition)}</span>
            <span>Match: {getMatchScore(item, userMeasurements)}%</span>
            <span>Owner: {item.owner}</span>
            <span>{item.sensitive ? "Skin-safe lining" : "Standard lining"}</span>
          </div>
          <article className="match-card">
            <div className="section-head">
              <h3>Size match score</h3>
              <span className="price-tag">{getMatchScore(item, userMeasurements)}%</span>
            </div>
            <p>
              Based on your bust, waist, hips, selected size, and this garment's fabric stretch.
              Garment measurements: {item.garmentMeasurements.bust}/{item.garmentMeasurements.waist}/
              {item.garmentMeasurements.hips} cm.
            </p>
          </article>
          <article className="booking-card glass-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Rental dates</p>
                <h3>{selectedRangeLabel}</h3>
              </div>
              <span className="price-tag">{rentalDays ? `${rentalDays} days` : "No dates"}</span>
            </div>
            <p>Blocked days are shown in brown. Your selected dates are shown in green.</p>
            <button className="glass-button" onClick={openCalendar}>
              Select rental dates
            </button>
          </article>
          {rentalDays ? (
            <article className="booking-summary-card">
              <div className="section-head">
                <h3>Total rental price</h3>
                <span className="price-tag booking-total">${finalPrice}</span>
              </div>
              <p>
                {item.dailyPrice}/day x {rentalDays} {rentalDays === 1 ? "day" : "days"}
              </p>
            </article>
          ) : null}
          <div className="detail-actions">
            <button className="glass-button" onClick={addBookedLookToCart}>
              Add to cart
            </button>
            <button className="glass-button primary" onClick={reserveLook}>
              Book now
            </button>
          </div>
          <p className="booking-status">{bookingMessage}</p>
        </article>
      </div>
      {isCalendarOpen ? (
        <>
          <button
            className="drawer-backdrop"
            onClick={closeCalendar}
            aria-label="Close rental date picker"
          />
          <aside className="booking-calendar-modal glass-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Rental calendar</p>
                <h3>Select your dates</h3>
              </div>
              <button className="text-button" onClick={closeCalendar}>
                Close
              </button>
            </div>
            <div className="booking-calendar-toolbar">
              <button
                className="icon-button small"
                onClick={() => setCalendarMonth((current) => shiftMonth(current, -1))}
                aria-label="Previous month"
              >
                <ChevronLeftIcon />
              </button>
              <div className="booking-calendar-selects">
                <select
                  value={calendarMonth.getMonth()}
                  onChange={(event) =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), Number(event.target.value), 1)
                    )
                  }
                >
                  {getMonthOptions().map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={calendarMonth.getFullYear()}
                  onChange={(event) =>
                    setCalendarMonth(
                      new Date(Number(event.target.value), calendarMonth.getMonth(), 1)
                    )
                  }
                >
                  {getYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="icon-button small"
                onClick={() => setCalendarMonth((current) => shiftMonth(current, 1))}
                aria-label="Next month"
              >
                <ChevronRightIcon />
              </button>
            </div>
            <div className="booking-calendar-legend">
              <span className="legend-item">
                <span className="legend-swatch legend-swatch-blocked"></span>
                Blocked
              </span>
              <span className="legend-item">
                <span className="legend-swatch legend-swatch-selected"></span>
                Your dates
              </span>
            </div>
            <div className="booking-weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="booking-calendar-grid">
              {calendarDays.map((dateValue, index) => {
                if (!dateValue) {
                  return <span key={`blank-${index}`} className="booking-day booking-day-empty" />;
                }
                const isBlocked = blockedDates.includes(dateValue);
                const isSelected = selectedDates.includes(dateValue);
                const isPast = dateValue < formatDateValue(new Date());
                return (
                  <button
                    key={dateValue}
                    className={`booking-day ${
                      isBlocked ? "booking-day-blocked" : ""
                    } ${isSelected ? "booking-day-selected" : ""} ${
                      isPast ? "booking-day-muted" : ""
                    }`}
                    onClick={() => handleCalendarDateClick(dateValue)}
                    disabled={isBlocked || isPast}
                  >
                    <span>{formatDayNumber(dateValue)}</span>
                    <small>{formatMonthLabel(dateValue)}</small>
                  </button>
                );
              })}
            </div>
            <div className="detail-actions">
              <button className="glass-button" onClick={() => {
                setSelectedStartDate("");
                setSelectedEndDate("");
              }}>
                Clear
              </button>
              <button className="glass-button primary" onClick={closeCalendar}>
                Done
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </Screen>
  );
}

function ProfileScreen({
  userMeasurements,
  onMeasurementsChange,
  userListings,
  lendingHistory,
  profilePhoto,
  onProfilePhotoChange,
}) {
  const [notifications, setNotifications] = useState(true);
  const [motionPreview, setMotionPreview] = useState(true);
  const [skinSafeFirst, setSkinSafeFirst] = useState(false);
  const [profileView, setProfileView] = useState("listings");
  const [listingFilter, setListingFilter] = useState("all");
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const filteredListings = useMemo(() => {
    return userListings
      .filter((item) => (listingFilter === "all" ? true : item.listingStatus === listingFilter))
      .sort((a, b) => {
        const aDate = a.nextPickupDate
          ? parseDateValue(a.nextPickupDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bDate = b.nextPickupDate
          ? parseDateValue(b.nextPickupDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      });
  }, [listingFilter, userListings]);

  const onRentCount = userListings.filter((item) => item.listingStatus === "on-rent").length;
  const upcomingCount = userListings.filter((item) => item.listingStatus === "upcoming").length;
  const totalRevenue = lendingHistory.reduce((sum, item) => sum + item.totalEarned, 0);

  const updateMeasurements = (key, value) => {
    onMeasurementsChange((current) => ({ ...current, [key]: value }));
  };

  const handleProfilePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onProfilePhotoChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <Screen>
      <div className="screen-scroll">
        <div className="top-row">
          <div>
            <p className="eyebrow">Your wardrobe</p>
            <h2 className="screen-title">Profile</h2>
          </div>
          <button
            className="icon-button"
            onClick={() => setShowSettingsPanel(true)}
            aria-label="Open profile settings"
          >
            <SettingsIcon />
          </button>
        </div>

        <article className="content-card glass-panel profile-hero-card">
          <div className="profile-identity-row">
            <label className="profile-photo-upload">
              <input type="file" accept="image/*" onChange={handleProfilePhoto} />
              <div
                className={`profile-photo-frame ${profilePhoto ? "has-photo" : ""}`}
                style={profilePhoto ? { backgroundImage: `url(${profilePhoto})` } : undefined}
              >
                {!profilePhoto ? <span>Add main photo</span> : null}
              </div>
            </label>
            <div className="profile-identity-copy">
              <p className="eyebrow">Owner profile</p>
              <h3>Sia's rental closet</h3>
              <p>
                Manage your main profile photo, keep your listings organised, and open settings
                for measurements, preferences, and account details.
              </p>
            </div>
          </div>
        </article>

        <article className="content-card glass-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Closet activity</p>
              <h3>Your owner dashboard</h3>
            </div>
            <span className="price-tag">
              {profileView === "listings" ? `${userListings.length} live pieces` : `${lendingHistory.length} recent loans`}
            </span>
          </div>
          <div
            className="media-toggle-overlay glass-panel profile-segmented-toggle profile-view-toggle"
            role="tablist"
            aria-label="Switch profile section"
          >
            {[
              ["listings", "Listings"],
              ["history", "History"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`media-toggle-button ${profileView === value ? "active" : ""}`}
                onClick={() => setProfileView(value)}
                role="tab"
                aria-selected={profileView === value}
              >
                {label}
              </button>
            ))}
          </div>
          {profileView === "listings" ? (
            <>
          <div className="profile-stats-grid">
            <article className="profile-stat-card">
              <span>{userListings.length}</span>
              <p>Total listings</p>
            </article>
            <article className="profile-stat-card">
              <span>{onRentCount}</span>
              <p>On rent now</p>
            </article>
            <article className="profile-stat-card">
              <span>{upcomingCount}</span>
              <p>Upcoming bookings</p>
            </article>
          </div>
          <div className="profile-toggle-row">
            <div
              className="media-toggle-overlay glass-panel profile-segmented-toggle"
              role="tablist"
              aria-label="Filter profile listings by status"
            >
              {[
                ["all", "All"],
                ["on-rent", "On Rent"],
                ["upcoming", "Upcoming"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={`media-toggle-button ${listingFilter === value ? "active" : ""}`}
                  onClick={() => setListingFilter(value)}
                  role="tab"
                  aria-selected={listingFilter === value}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="profile-toggle-copy">
              Sort your own clothing listings by rental status.
            </p>
          </div>
          <div className="market-grid profile-listings-grid">
            {filteredListings.map((item) => (
              <article className="market-card profile-listing-card" key={item.id}>
                <div className="market-image-wrap">
                  <img className="market-thumb real-image" src={item.image} alt={item.title} />
                  <span
                    className={`profile-status-badge profile-status-${item.listingStatus}`}
                  >
                    {getProfileListingLabel(item.listingStatus)}
                  </span>
                </div>
                <h4>{item.title}</h4>
                <p className="profile-listing-meta">
                  {item.category} | {capitalize(item.gender)} | {formatPrice(item.dailyPrice)}
                </p>
                <p className="profile-listing-note">{item.statusNote}</p>
                <div className="meta-row card-meta">
                  <span>
                    {item.renterName ? `Renter: ${item.renterName}` : "Ready for the next booking"}
                  </span>
                  <span>
                    {item.nextPickupDate ? formatDateLabel(item.nextPickupDate) : "Open calendar"}
                  </span>
                </div>
              </article>
            ))}
          </div>
            </>
          ) : (
            <div className="profile-history-stack">
              <div className="profile-stats-grid">
                <article className="profile-stat-card">
                  <span>${totalRevenue}</span>
                  <p>Total revenue</p>
                </article>
                <article className="profile-stat-card">
                  <span>{lendingHistory.length}</span>
                  <p>Past items lent</p>
                </article>
                <article className="profile-stat-card">
                  <span>{lendingHistory[0] ? formatDateLabel(lendingHistory[0].returnedDate) : "-"}</span>
                  <p>Latest return</p>
                </article>
              </div>
              <p className="profile-toggle-copy">
                Shows up to your 7 most recent completed lends and the revenue earned from them.
              </p>
              <div className="profile-history-list">
                {lendingHistory.map((item) => (
                  <article className="profile-history-card" key={`${item.id}-${item.returnedDate}`}>
                    <img className="profile-history-thumb real-image" src={item.image} alt={item.title} />
                    <div>
                      <h4>{item.title}</h4>
                      <p className="profile-listing-meta">
                        Lent to {item.renterName} | Returned {formatDateLabel(item.returnedDate)}
                      </p>
                      <p className="profile-listing-note">
                        {formatDateLabel(item.lentDate)} - {formatDateLabel(item.returnedDate)}
                      </p>
                    </div>
                    <span className="price-tag">${item.totalEarned}</span>
                  </article>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
      {showSettingsPanel ? (
        <>
          <button
            className="drawer-backdrop"
            onClick={() => setShowSettingsPanel(false)}
            aria-label="Close profile settings"
          />
          <aside className="filters-drawer glass-panel profile-settings-drawer">
            <div className="section-head">
              <div>
                <p className="eyebrow">Profile controls</p>
                <h3>Settings</h3>
              </div>
              <button className="text-button" onClick={() => setShowSettingsPanel(false)}>
                Close
              </button>
            </div>

            <article className="content-card glass-panel drawer-profile-card">
              <h3>Profile preferences</h3>
              <SettingRow
                label="Notifications"
                description="Receive reminders for bookings and saved looks."
                value={notifications}
                onToggle={() => setNotifications((current) => !current)}
              />
              <SettingRow
                label="Motion previews"
                description="Enable flow simulation on compatible rentals."
                value={motionPreview}
                onToggle={() => setMotionPreview((current) => !current)}
              />
              <SettingRow
                label="Skin-safe first"
                description="Prioritize soft fabrics and lined looks in Browse."
                value={skinSafeFirst}
                onToggle={() => setSkinSafeFirst((current) => !current)}
              />
            </article>

            <article className="content-card glass-panel drawer-profile-card">
              <p className="eyebrow">Measurements</p>
              <h3>Fit profile</h3>
              <div className="measurement-grid">
                <label className="field">
                  <span>Bust (cm)</span>
                  <input
                    type="number"
                    value={userMeasurements.bust}
                    onChange={(event) => updateMeasurements("bust", Number(event.target.value))}
                  />
                </label>
                <label className="field">
                  <span>Waist (cm)</span>
                  <input
                    type="number"
                    value={userMeasurements.waist}
                    onChange={(event) => updateMeasurements("waist", Number(event.target.value))}
                  />
                </label>
                <label className="field">
                  <span>Hips (cm)</span>
                  <input
                    type="number"
                    value={userMeasurements.hips}
                    onChange={(event) => updateMeasurements("hips", Number(event.target.value))}
                  />
                </label>
                <label className="field">
                  <span>Height (cm)</span>
                  <input
                    type="number"
                    value={userMeasurements.height}
                    onChange={(event) => updateMeasurements("height", Number(event.target.value))}
                  />
                </label>
                <label className="field">
                  <span>Preferred size</span>
                  <select
                    value={userMeasurements.sizeCategory}
                    onChange={(event) => updateMeasurements("sizeCategory", event.target.value)}
                  >
                    {["XS", "S", "M", "L"].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>

            <article className="content-card glass-panel drawer-profile-card">
              <p className="eyebrow">Account</p>
              <h3>Aura member</h3>
              <p>
                Community wardrobe access, AI styling, and rental reminders are active for this
                profile.
              </p>
              <div className="profile-account-list">
                <span>Sia Tan</span>
                <span>sia@aura.club</span>
                <span>Host status: verified</span>
              </div>
            </article>
          </aside>
        </>
      ) : null}
    </Screen>
  );
}

function SettingRow({ label, description, value, onToggle }) {
  return (
    <div className="setting-row">
      <div>
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <button className={`switch ${value ? "switch-on" : ""}`} onClick={onToggle} aria-pressed={value}>
        <span></span>
      </button>
    </div>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {bottomNav.map((item) => (
        <Link
          key={item.to}
          className={`nav-item ${location.pathname === item.to ? "active" : ""} ${item.featured ? "nav-item-featured" : ""}`}
          to={item.to}
        >
          <item.icon />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function FilterGroup({ title, options, value, onChange }) {
  return (
    <div className="filter-section">
      <h4>{title}</h4>
      <div className="filter-options">
        {options.map(([optionValue, label]) => (
          <button
            key={optionValue}
            className={`filter-chip ${value === optionValue ? "active" : ""}`}
            onClick={() => onChange(optionValue)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getOccasionLabel(item) {
  if (item.occasionType === "ethnic" && item.ethnicStyle) {
    return `Ethnic | ${capitalize(item.ethnicStyle)}`;
  }

  return capitalize(item.occasionType.replace("-", " "));
}

function getConditionLabel(condition) {
  const labels = {
    "brand-new": "Brand new",
    "worn-few": "Worn a few times",
    "well-used": "Well used",
  };

  return labels[condition] ?? condition;
}

function getMatchScore(item, userMeasurements) {
  const stretchMap = {
    silk: 2,
    satin: 2,
    linen: 1,
    cotton: 3,
    lace: 1,
    knit: 6,
    brocade: 1,
    chiffon: 2,
    cupro: 3,
  };

  const allowance = stretchMap[item.material] ?? 2;
  const bustFit = Math.max(0, 100 - Math.abs(item.garmentMeasurements.bust - userMeasurements.bust) * 3.2);
  const waistFit = Math.max(0, 100 - Math.abs(item.garmentMeasurements.waist - userMeasurements.waist) * 3.8);
  const hipsFit = Math.max(0, 100 - Math.abs(item.garmentMeasurements.hips - userMeasurements.hips) * 2.4);
  const sizeBonus = item.sizeCategory === userMeasurements.sizeCategory ? 8 : 0;
  const allowanceBonus = allowance * 2;

  return Math.max(
    38,
    Math.min(99, Math.round((bustFit + waistFit + hipsFit) / 3 + sizeBonus + allowanceBonus))
  );
}

function getTryOnEligibility(item, userMeasurements) {
  const diffs = {
    bust: getPercentDifference(item.garmentMeasurements.bust, userMeasurements.bust),
    waist: getPercentDifference(item.garmentMeasurements.waist, userMeasurements.waist),
    hips: getPercentDifference(item.garmentMeasurements.hips, userMeasurements.hips),
  };

  const failingDimensions = Object.entries(diffs)
    .filter(([, value]) => Math.abs(value) > 15)
    .map(([key]) => key);

  const averageDiff = Math.round((diffs.bust + diffs.waist + diffs.hips) / 3);
  const fitState = averageDiff < -4 ? "tight" : averageDiff > 4 ? "loose" : "true";

  return {
    allowed: failingDimensions.length === 0,
    fitState,
    fitAdjustmentPercent: Math.max(-15, Math.min(15, averageDiff)),
    failingDimensions,
    diffs,
  };
}

function getPercentDifference(garmentValue, userValue) {
  return Math.round(((garmentValue - userValue) / userValue) * 100);
}

function getFitLabel(fitState) {
  const labels = {
    tight: "Tight fit",
    loose: "Loose fit",
    true: "True to size",
  };

  return labels[fitState] ?? fitState;
}

function getTryOnDisplayScore(item, userMeasurements) {
  return Math.max(75, Math.min(100, getMatchScore(item, userMeasurements)));
}

function getBlockedDatesForItem(itemId) {
  const seed = itemId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const offsets = [2, 3, 7, 8, 13, 18].map((value, index) => value + ((seed + index) % 4));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return offsets.map((offset) => formatDateValue(addDays(today, offset)));
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function shiftMonth(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function getCalendarMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstWeekday).fill("");

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(formatDateValue(new Date(year, month, day)));
  }

  while (cells.length % 7 !== 0) {
    cells.push("");
  }

  return cells;
}

function getMonthOptions() {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, index) => currentYear - 1 + index);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(value) {
  return new Date(`${value}T00:00:00`);
}

function getDateRange(startValue, endValue) {
  if (!startValue) return [];
  if (!endValue) return [startValue];

  const start = parseDateValue(startValue);
  const end = parseDateValue(endValue);
  const dates = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dates.push(formatDateValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function formatDateLabel(value) {
  return parseDateValue(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDayNumber(value) {
  return parseDateValue(value).getDate();
}

function formatDayLabel(value) {
  return parseDateValue(value).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function formatMonthLabel(value) {
  return parseDateValue(value).toLocaleDateString("en-US", {
    month: "short",
  });
}

function capitalize(value) {
  if (!value) return "";
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getProfileListingLabel(status) {
  const labels = {
    all: "All",
    available: "Available",
    "on-rent": "On rent",
    upcoming: "Upcoming",
  };

  return labels[status] ?? status;
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h2l2.2 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H7" />
      <circle cx="10" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
    </svg>
  );
}

function BrowseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M10 17h4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="5.5" />
      <path d="m15.2 15.2 4.3 4.3" />
    </svg>
  );
}

function HeartToggleIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7l10 10" />
      <path d="M17 7 7 17" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M8 10v7" />
      <path d="M12 10v7" />
      <path d="M16 10v7" />
      <path d="M7 7l1 12h8l1-12" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7Z" />
      <path d="m19 15 .8 2 .2.2 2 .8-2 .8-.2.2-.8 2-.8-2-.2-.2-2-.8 2-.8.2-.2Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z" />
      <path d="M19 12a7.7 7.7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2-.9L14 3h-4l-.5 2.9a7 7 0 0 0-2 .9l-2.4-1-2 3.4 2 1.5A7.7 7.7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2 .9L10 21h4l.5-2.9a7 7 0 0 0 2-.9l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.8-3.4 4.2-5 7-5s5.2 1.6 7 5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7.5h.01" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6 9 12l6 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default App;
