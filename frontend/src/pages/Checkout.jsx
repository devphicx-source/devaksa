import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

const Checkout = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');

    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone?.replace('+91', '') || '',
        email: '',
        address: '',
        city: '',
        state: 'Uttar Pradesh',
        pincode: ''
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchCart();
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCart(Array.isArray(data) ? data : []);
        } catch {
            showToast('Could not load cart', 'error');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 999 ? 0 : 49;
    const total = subtotal + shipping;

    const handleChange = (e) => {
        setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }

        setPlacing(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart,
                    shippingAddress: address,
                    paymentMethod,
                    totalAmount: total
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('🎉 Order placed successfully!');
                navigate(`/order/${data.orderId}`);
            } else {
                showToast(data.message || 'Failed to place order', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setPlacing(false);
        }
    };

    if (loading) return (
        <div className="checkout-loading">
            <div className="spinner"></div>
            <p>Loading your cart...</p>
        </div>
    );

    if (cart.length === 0) return (
        <div className="checkout-empty">
            <i className="fa-solid fa-cart-shopping" style={{ fontSize: '48px', color: '#ccc' }}></i>
            <h2>Your cart is empty</h2>
            <p>Add some products before checking out.</p>
            <Link to="/" className="btn-main">Continue Shopping</Link>
        </div>
    );

    return (
        <div className="checkout-page">
            <div className="checkout-header-bar">
                <Link to="/cart" className="checkout-back-link">
                    <i className="fa-solid fa-chevron-left"></i> Continue Shopping
                </Link>
                <h1 className="checkout-title">Secure Checkout</h1>
                <div className="checkout-trust-badges">
                    <span><i className="fa-solid fa-shield-halved"></i> Secure</span>
                    <span><i className="fa-solid fa-truck"></i> Fast Delivery</span>
                    <span><i className="fa-solid fa-rotate-left"></i> Easy Returns</span>
                </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-body">
                {/* Left Column */}
                <div className="checkout-left">
                    {/* Order Review */}
                    <div className="checkout-section">
                        <h2 className="checkout-section-title">
                            <span className="checkout-step-badge">1</span>
                            Review Your Order ({cart.length} item{cart.length > 1 ? 's' : ''})
                        </h2>
                        <div className="checkout-items-list">
                            {cart.map((item, idx) => (
                                <div key={idx} className="checkout-item">
                                    <img
                                        src={item.image ? `/${item.image}` : `https://placehold.co/70x70/e8f0e9/4F6F52?text=${encodeURIComponent(item.productName?.charAt(0) || 'P')}`}
                                        alt={item.productName}
                                        className="checkout-item-img"
                                        onError={(e) => { e.target.src = `https://placehold.co/70x70/e8f0e9/4F6F52?text=${encodeURIComponent(item.productName?.charAt(0) || 'P')}`; }}
                                    />
                                    <div className="checkout-item-info">
                                        <p className="checkout-item-name">{item.productName}</p>
                                        <p className="checkout-item-qty">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="checkout-item-price">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="checkout-section">
                        <h2 className="checkout-section-title">
                            <span className="checkout-step-badge">2</span>
                            Delivery Address
                        </h2>
                        <p className="checkout-section-sub">All fields are required</p>

                        <div className="checkout-form-grid">
                            <div className="form-field full-width">
                                <label>Full Name</label>
                                <input name="fullName" value={address.fullName} onChange={handleChange} required placeholder="e.g. Rahul Sharma" />
                            </div>
                            <div className="form-field">
                                <label>Phone Number</label>
                                <input name="phone" value={address.phone} onChange={handleChange} required placeholder="10-digit mobile number" type="tel" maxLength={10} />
                            </div>
                            <div className="form-field">
                                <label>Email (optional)</label>
                                <input name="email" value={address.email} onChange={handleChange} placeholder="email@example.com" type="email" />
                            </div>
                            <div className="form-field full-width">
                                <label>House No., Street, Area</label>
                                <input name="address" value={address.address} onChange={handleChange} required placeholder="e.g. 123, Gandhi Nagar, Near Bus Stand" />
                            </div>
                            <div className="form-field">
                                <label>City / Town</label>
                                <input name="city" value={address.city} onChange={handleChange} required placeholder="e.g. Lucknow" />
                            </div>
                            <div className="form-field">
                                <label>State</label>
                                <select name="state" value={address.state} onChange={handleChange} required>
                                    {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Pincode</label>
                                <input name="pincode" value={address.pincode} onChange={handleChange} required placeholder="6-digit PIN" maxLength={6} />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="checkout-section">
                        <h2 className="checkout-section-title">
                            <span className="checkout-step-badge">3</span>
                            Payment Method
                        </h2>
                        <div className="payment-options">
                            <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                                <input
                                    type="radio" name="payment" value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                />
                                <i className="fa-solid fa-money-bill-wave"></i>
                                <div>
                                    <strong>Cash on Delivery</strong>
                                    <span>Pay when you receive</span>
                                </div>
                            </label>
                            <label className={`payment-option ${paymentMethod === 'Prepaid' ? 'selected' : ''}`}>
                                <input
                                    type="radio" name="payment" value="Prepaid"
                                    checked={paymentMethod === 'Prepaid'}
                                    onChange={() => setPaymentMethod('Prepaid')}
                                />
                                <i className="fa-solid fa-credit-card"></i>
                                <div>
                                    <strong>Online Payment</strong>
                                    <span>UPI / Card / Net Banking</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sticky Summary */}
                <div className="checkout-right">
                    <div className="checkout-summary-card">
                        <h3 className="checkout-summary-title">ORDER SUMMARY</h3>
                        <div className="checkout-summary-rows">
                            <div className="summary-row">
                                <span>Subtotal ({cart.length} items)</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'free-shipping' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>
                            {shipping === 0 && (
                                <div className="summary-free-tag">
                                    🎉 Free shipping on orders above ₹999!
                                </div>
                            )}
                            <div className="summary-divider"></div>
                            <div className="summary-row summary-total">
                                <span>ORDER TOTAL</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="checkout-place-order-btn"
                            disabled={placing}
                        >
                            {placing ? (
                                <><span className="btn-spinner"></span> Placing Order...</>
                            ) : (
                                <><i className="fa-solid fa-lock"></i> Place Order - ₹{total.toLocaleString()}</>
                            )}
                        </button>

                        <p className="checkout-policy-note">
                            By placing this order, you agree to our <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                        </p>

                        <div className="checkout-secure-icons">
                            <span><i className="fa-solid fa-shield-halved"></i> SSL Secured</span>
                            <span><i className="fa-solid fa-rotate-left"></i> Easy Returns</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
