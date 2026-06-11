import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STATUS_STEPS = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_ICONS = {
    'Confirmed': 'fa-circle-check',
    'Shipped': 'fa-box',
    'Out for Delivery': 'fa-truck',
    'Delivered': 'fa-house-circle-check',
};

const STATUS_MESSAGES = {
    'Confirmed': 'Your order has been confirmed!',
    'Shipped': 'Your order is on its way.',
    'Out for Delivery': 'Your order will arrive today!',
    'Delivered': 'Your order has been delivered.',
};

const OrderDetails = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [celebrated, setCelebrated] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
        // Celebration animation on mount
        const timer = setTimeout(() => setCelebrated(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();
            setOrder(data);
        } catch {
            showToast('Order not found', 'error');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        
        setCancelling(true);
        try {
            const res = await fetch(`/api/orders/${id}/cancel`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                showToast('Order cancelled successfully');
                setOrder(data.order);
            } else {
                showToast(data.message || 'Failed to cancel order', 'error');
            }
        } catch (error) {
            showToast('Network error while cancelling', 'error');
        } finally {
            setCancelling(false);
        }
    };

    const getCurrentStepIndex = (status) => {
        const idx = STATUS_STEPS.indexOf(status);
        return idx === -1 ? 0 : idx;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getEstimatedDelivery = (createdAt) => {
        const d = new Date(createdAt);
        d.setDate(d.getDate() + 5);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) return (
        <div className="order-loading">
            <div className="spinner"></div>
            <p>Loading order details...</p>
        </div>
    );

    if (!order) return null;

    const stepIdx = getCurrentStepIndex(order.status);

    return (
        <div className="order-details-page">
            {/* Success Banner */}
            <div className={`order-success-banner ${celebrated ? 'order-banner-visible' : ''}`}>
                <div className="order-success-inner">
                    <div className="order-success-icon">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                        <h2>Order Placed Successfully!</h2>
                        <p>Order ID: <strong>#{order._id.slice(-8).toUpperCase()}</strong></p>
                    </div>
                    <Link to="/orders" className="view-all-orders-btn">
                        View All Orders
                    </Link>
                </div>
            </div>

            <div className="order-details-grid">
                {/* Left: Tracking + Items */}
                <div className="order-details-left">
                    {/* Tracking Stepper */}
                    <div className="order-card">
                        <div className="order-card-header">
                            <i className="fa-solid fa-location-dot"></i>
                            <h3>Order Status</h3>
                            <span className={`order-status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {order.status}
                            </span>
                        </div>

                        {order.status !== 'Cancelled' ? (
                            <div className="tracking-stepper">
                                {STATUS_STEPS.map((step, i) => {
                                    const isDone = i <= stepIdx;
                                    const isCurrent = i === stepIdx;
                                    return (
                                        <div key={step} className={`tracking-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                                            <div className="tracking-step-left">
                                                <div className="tracking-icon-wrap">
                                                    <i className={`fa-solid ${STATUS_ICONS[step]}`}></i>
                                                </div>
                                                {i < STATUS_STEPS.length - 1 && (
                                                    <div className={`tracking-line ${isDone && i < stepIdx ? 'done' : ''}`}></div>
                                                )}
                                            </div>
                                            <div className="tracking-step-content">
                                                <p className="tracking-step-title">{step}</p>
                                                {isCurrent && (
                                                    <p className="tracking-step-msg">{STATUS_MESSAGES[step]}</p>
                                                )}
                                                {isCurrent && order.tracking?.length > 0 && (
                                                    <p className="tracking-step-time">
                                                        {formatDate(order.tracking[order.tracking.length - 1]?.timestamp)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="order-cancelled-msg">
                                <i className="fa-solid fa-xmark-circle"></i>
                                <p>This order has been cancelled.</p>
                            </div>
                        )}

                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <div className="expected-delivery">
                                <i className="fa-solid fa-calendar-check"></i>
                                <span>Expected Delivery by <strong>{getEstimatedDelivery(order.createdAt)}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Items in Order */}
                    <div className="order-card">
                        <div className="order-card-header">
                            <i className="fa-solid fa-box-open"></i>
                            <h3>Items Ordered</h3>
                        </div>
                        <div className="order-items-list">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="order-item-row">
                                    <img
                                        src={item.image ? `/${item.image}` : `https://placehold.co/70x70/e8f0e9/026B5C?text=${encodeURIComponent(item.productName?.charAt(0) || 'P')}`}
                                        alt={item.productName}
                                        className="order-item-img"
                                        onError={(e) => { e.target.src = `https://placehold.co/70x70/e8f0e9/026B5C?text=${encodeURIComponent(item.productName?.charAt(0) || 'P')}`; }}
                                    />
                                    <div className="order-item-info">
                                        <p className="order-item-name">{item.productName}</p>
                                        <p className="order-item-qty">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="order-item-price">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Address + Price */}
                <div className="order-details-right">
                    {/* Delivery Address */}
                    <div className="order-card">
                        <div className="order-card-header">
                            <i className="fa-solid fa-location-dot"></i>
                            <h3>Delivery Address</h3>
                        </div>
                        <div className="order-address-block">
                            <p className="order-address-name">{order.shippingAddress?.fullName}</p>
                            <p>{order.shippingAddress?.address}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                            <p className="order-address-phone">
                                <i className="fa-solid fa-phone"></i> {order.shippingAddress?.phone}
                            </p>
                        </div>
                    </div>

                    {/* Payment & Amount */}
                    <div className="order-card">
                        <div className="order-card-header">
                            <i className="fa-solid fa-receipt"></i>
                            <h3>Payment & Summary</h3>
                        </div>
                        <div className="order-summary-rows">
                            <div className="order-summary-row">
                                <span>Payment Method</span>
                                <span className="order-payment-badge">
                                    {order.paymentMethod === 'COD' ? (
                                        <><i className="fa-solid fa-money-bill-wave"></i> Cash on Delivery</>
                                    ) : (
                                        <><i className="fa-solid fa-credit-card"></i> Online Payment</>
                                    )}
                                </span>
                            </div>
                            <div className="order-summary-row">
                                <span>Order Date</span>
                                <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="order-summary-divider"></div>
                            <div className="order-summary-row order-total-row">
                                <span>Total Amount</span>
                                <span>₹{order.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button 
                            className="btn-secondary" 
                            style={{ 
                                width: '100%', 
                                padding: '14px', 
                                borderRadius: '12px', 
                                fontWeight: '600', 
                                color: '#d32f2f', 
                                border: '1px solid #d32f2f',
                                background: 'transparent',
                                marginBottom: '16px'
                            }}
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Cancelling...' : <><i className="fa-solid fa-ban"></i> Cancel Order</>}
                        </button>
                    )}

                    <Link to="/" className="order-continue-shopping">
                        <i className="fa-solid fa-arrow-left"></i> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
