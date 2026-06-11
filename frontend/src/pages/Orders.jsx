import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STATUS_COLORS = {
    'Pending': '#f59e0b',
    'Confirmed': '#3b82f6',
    'Shipped': '#8b5cf6',
    'Out for Delivery': '#f97316',
    'Delivered': '#22c55e',
    'Cancelled': '#ef4444',
};

const Orders = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            showToast('Could not load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="order-loading">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
        </div>
    );

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h1>Returns &amp; Orders</h1>
                <Link to="/" className="orders-back-link">
                    <i className="fa-solid fa-arrow-left"></i> Back to Shopping
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="orders-empty">
                    <i className="fa-solid fa-box-open" style={{ fontSize: '56px', color: '#ddd' }}></i>
                    <h2>No orders yet</h2>
                    <p>Your order history will appear here.</p>
                    <Link to="/" className="btn-main">Start Shopping</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-list-card">
                            <div className="order-list-meta">
                                <div>
                                    <span className="order-list-label">ORDER PLACED</span>
                                    <span className="order-list-val">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div>
                                    <span className="order-list-label">TOTAL</span>
                                    <span className="order-list-val">₹{order.totalAmount?.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="order-list-label">ORDER ID</span>
                                    <span className="order-list-val">#{order._id.slice(-8).toUpperCase()}</span>
                                </div>
                                <span
                                    className="order-status-tag"
                                    style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div className="order-list-items">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="order-list-item">
                                        <img
                                            src={item.image ? `/${item.image}` : `https://placehold.co/60x60/e8f0e9/026B5C?text=${encodeURIComponent(item.productName?.charAt(0) || 'P')}`}
                                            alt={item.productName}
                                            onError={(e) => { e.target.src = `https://placehold.co/60x60/e8f0e9/026B5C?text=${encodeURIComponent(item.productName?.charAt(0) || 'P')}`; }}
                                        />
                                        <div>
                                            <p>{item.productName}</p>
                                            <p>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="order-list-actions">
                                <Link to={`/order/${order._id}`} className="order-track-btn">
                                    <i className="fa-solid fa-location-dot"></i> Track Order
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
