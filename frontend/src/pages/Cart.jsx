import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const { user, loading, token } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        } else if (user && token) {
            fetchCart();
        }
    }, [user, loading, navigate, token]);

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setCartItems(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setFetching(false);
        }
    };

    if (loading || fetching) return <div style={{ padding: '150px', textAlign: 'center' }}>Loading your bag...</div>;
    if (!user) return null;

    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="cart-page" style={{ padding: '120px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="back-btn-container" style={{ marginBottom: '30px' }}>
                <Link to="/" className="back-btn"><i className="fa-solid fa-arrow-left"></i> Back to Home</Link>
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '40px' }}>Your Shopping Bag</h1>

            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ margin: '20px 0', color: '#666' }}>Your bag is currently empty.</p>
                    <Link to="/" className="btn-main" style={{ display: 'inline-block', width: 'auto', padding: '12px 30px' }}>
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="cart-container">
                    <div className="cart-items-list" style={{ marginBottom: '40px' }}>
                        {cartItems.map((item, index) => (
                            <div key={index} className="cart-item" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '20px 0',
                                borderBottom: '1px solid #eee'
                            }}>
                                <img src={`/${item.image}`} alt={item.productName} style={{ width: '80px', borderRadius: '12px' }} />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>{item.productName}</h3>
                                    <p style={{ color: '#666', fontSize: '14px' }}>Quantity: {item.quantity}</p>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                    <p style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</p>
                                    <button 
                                        className="btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}
                                        onClick={() => navigate('/checkout', { state: { directBuyItem: item } })}
                                    >
                                        Buy This Only
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary" style={{
                        background: '#fbfbfd',
                        padding: '30px',
                        borderRadius: '24px',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#666' }}>
                            <span>Subtotal</span>
                            <span>₹{total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#666' }}>
                            <span>Delivery Charge</span>
                            <span>₹49</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '20px', fontWeight: '700', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--sage-green)' }}>₹{total + 49}</span>
                        </div>
                        <Link to="/checkout" className="btn-main" style={{ width: '100%', display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>
                            Proceed to Checkout →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
