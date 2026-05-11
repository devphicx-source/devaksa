import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <img src="/devaks-logo.png" alt="Devaksa Logo" className="logo-img" />
                </Link>
                <div className="nav-links">
                    <a href="/#products">Products</a>
                    <a href="/#about">Our Story</a>
                    <a href="/#reviews">Reviews</a>
                    <a href="/#contact">Contact</a>
                </div>
                <div className="nav-icons">
                    {user && (
                        <Link to="/cart" className="nav-icon-link" style={{ position: 'relative' }}>
                            <i className="fa-solid fa-bag-shopping"></i>
                            <span className="cart-dot"></span>
                        </Link>
                    )}

                    {!user ? (
                        <Link to="/login" id="login-btn" className="nav-icon-link">
                            <i className="fa-regular fa-user"></i>
                        </Link>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{user.name || 'User'}</span>
                            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f' }}>
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </button>
                        </div>
                    )}

                    <div className="mobile-menu-btn">
                        <i className="fa-solid fa-bars"></i>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
