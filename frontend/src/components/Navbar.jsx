import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const products = [
    { name: 'Cow Dung Cake', search: 'Cow Dung Cake' },
    { name: 'Vermi Compost', search: 'Vermi Compost' },
    { name: 'Natural Honey', search: 'Natural Honey' },
    { name: 'Cow Dung Manure', search: 'Cow Dung Manure' },
    { name: 'Moringa Powder', search: 'Moringa Powder' },
    { name: 'Organic Products', search: 'Organic' },
    { name: 'Natural Products', search: 'Natural' },
    { name: 'Superfoods', search: 'Superfood' },
];

const Navbar = () => {
    const { user, token, logout } = useAuth();
    const [search, setSearch] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    const fetchCartCount = async () => {
        if (!token) {
            setCartCount(0);
            return;
        }
        try {
            const res = await fetch('/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const count = data.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            }
        } catch (error) {
            console.error('Failed to fetch cart count', error);
        }
    };

    useEffect(() => {
        fetchCartCount();
        window.addEventListener('cartUpdated', fetchCartCount);
        return () => window.removeEventListener('cartUpdated', fetchCartCount);
    }, [token]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = (menuOpen || showLogoutModal) ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen, showLogoutModal]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/?search=${encodeURIComponent(search.trim())}`);
            setSearchOpen(false);
            setMenuOpen(false);
        }
    };

    const handleProductClick = (searchTerm) => {
        navigate(`/?search=${encodeURIComponent(searchTerm)}`);
        setMenuOpen(false);
    };

    const handleAllProducts = () => {
        navigate('/');
        setMenuOpen(false);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        setMenuOpen(false);
        navigate('/');
    };

    return (
        <>
            <header className={`navbar-wrapper ${scrolled ? 'navbar-scrolled' : ''}`}>
                {/* Top Line */}
                <div className="navbar-top">

                    {/* LEFT — Hamburger only */}
                    <button
                        className="navbar-hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                    </button>

                    {/* CENTER — Logo */}
                    <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
                        <img src="/devaks-logo.png" alt="Devaksa" className="logo-img" />
                    </Link>

                    {/* Desktop Search — Center */}
                    <form className="navbar-search navbar-search-desktop" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="navbar-search-input"
                        />
                        <button type="submit" className="navbar-search-btn">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </form>

                    {/* RIGHT — Icons */}
                    <div className="navbar-actions">

                        {/* Search icon — mobile only */}
                        <button
                            className="navbar-icon-btn navbar-search-mobile-btn"
                            onClick={() => setSearchOpen(!searchOpen)}
                            aria-label="Search"
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>

                        {/* Account — desktop only */}
                        <div className="navbar-desktop-only">
                            {!user ? (
                                <Link to="/login" className="navbar-action-item">
                                    <span className="navbar-action-sub">Hello, Sign In</span>
                                    <span className="navbar-action-main">Account <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i></span>
                                </Link>
                            ) : (
                                <div className="navbar-action-item" style={{ cursor: 'default' }}>
                                    <span className="navbar-action-sub">Hello, {user.name || 'User'}</span>
                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="navbar-action-main navbar-logout-btn"
                                    >
                                        Sign Out <i className="fa-solid fa-right-from-bracket"></i>
                                    </button>
                                </div>
                            )}

                            <Link to="/orders" className="navbar-action-item">
                                <span className="navbar-action-sub">Returns</span>
                                <span className="navbar-action-main">&amp; Orders</span>
                            </Link>
                        </div>

                        {/* Cart — always visible */}
                        <Link to="/cart" className="navbar-cart-btn" onClick={() => setMenuOpen(false)}>
                            <div className="navbar-cart-icon-wrap">
                                <i className="fa-solid fa-cart-shopping"></i>
                                <span className="navbar-cart-badge">{cartCount}</span>
                            </div>
                            <span className="navbar-cart-label navbar-desktop-only-inline">Cart</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {searchOpen && (
                    <div className="navbar-search-mobile-bar">
                        <form className="navbar-search" onSubmit={handleSearch} style={{ flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="navbar-search-input"
                                autoFocus
                            />
                            <button type="submit" className="navbar-search-btn">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </form>
                        <button onClick={() => setSearchOpen(false)} className="navbar-search-close">
                            Cancel
                        </button>
                    </div>
                )}

                {/* Bottom Line — Desktop */}
                <div className="navbar-bottom">
                    <div className="navbar-categories">
                        <button
                            className="navbar-category-link"
                            onClick={handleAllProducts}
                            style={{ background: 'none', borderRight: '1px solid rgba(255,255,255,0.2)', marginRight: '4px', paddingRight: '18px', fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                            All Products
                        </button>
                        {products.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => handleProductClick(p.search)}
                                className="navbar-category-link"
                                style={{ background: 'none', border: '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ===== Mobile Drawer ===== */}
            {menuOpen && (
                <div className="navbar-mobile-overlay" onClick={() => setMenuOpen(false)}>
                    <div className="navbar-mobile-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-drawer-user">
                            {user ? (
                                <>
                                    <div className="mobile-drawer-avatar">
                                        <i className="fa-solid fa-user"></i>
                                    </div>
                                    <div>
                                        <p className="mobile-drawer-name">Hello, {user.name || 'User'}</p>
                                        <p className="mobile-drawer-phone">{user.phone}</p>
                                    </div>
                                </>
                            ) : (
                                <Link to="/login" className="mobile-drawer-signin" onClick={() => setMenuOpen(false)}>
                                    <i className="fa-solid fa-user-circle"></i>
                                    <span>Sign In / Sign Up</span>
                                    <i className="fa-solid fa-chevron-right"></i>
                                </Link>
                            )}
                        </div>

                        <div className="mobile-drawer-section">
                            <p className="mobile-drawer-section-title">Shop by Product</p>
                            <button className="mobile-drawer-link" onClick={handleAllProducts}>
                                <i className="fa-solid fa-store"></i> All Products
                            </button>
                            {products.map((p) => (
                                <button
                                    key={p.name}
                                    className="mobile-drawer-link"
                                    onClick={() => handleProductClick(p.search)}
                                >
                                    <i className="fa-solid fa-leaf"></i> {p.name}
                                </button>
                            ))}
                        </div>

                        <div className="mobile-drawer-section">
                            <p className="mobile-drawer-section-title">My Account</p>
                            <Link to="/orders" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
                                <i className="fa-solid fa-box"></i> My Orders
                            </Link>
                            <Link to="/cart" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
                                <i className="fa-solid fa-cart-shopping"></i> My Cart
                            </Link>
                            {user && (
                                <button
                                    className="mobile-drawer-link mobile-drawer-signout"
                                    onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                                >
                                    <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Logout Confirmation Modal ===== */}
            {showLogoutModal && (
                <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="logout-modal-icon">
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </div>
                        <h3 className="logout-modal-title">Sign Out?</h3>
                        <p className="logout-modal-msg">
                            Kya aap wakai sign out karna chahte hain?<br />
                            {/* <span>Aapka cart bhi clear ho jaayega.</span> */}
                        </p>
                        <div className="logout-modal-actions">
                            <button
                                className="logout-btn-cancel"
                                onClick={() => setShowLogoutModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="logout-btn-confirm"
                                onClick={confirmLogout}
                            >
                                Haan, Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
