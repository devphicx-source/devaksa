import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onAddToCart, onBuyNow }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="product-card">
            <div className="product-img-wrapper">
                <div className="brand-logo">
                    <img src="/devaks-logo.png" alt="" />
                </div>
                <img src={`/${product.image}`} alt={product.name} />
            </div>
            <div className="product-info">
                <span className="badge">{product.badge || 'Pure'}</span>
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-bottom">
                    <div className="price-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#888' }}>Price starting from</span>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sage-green)' }}>₹{product.price} / {product.unit}</span>
                    </div>
                    {user && <button className="btn-main" onClick={() => onBuyNow(product)}>Buy Now</button>}
                    {user && (
                        <div className="button-row">
                            <button className="btn-secondary" onClick={() => onAddToCart(product)} title="Add to Cart">
                                <i className="fa-solid fa-cart-shopping"></i>
                            </button>
                            <button className="btn-view" title="View Details" onClick={() => navigate(`/product/${product.id}`)}>
                                View Details <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px' }}></i>
                            </button>
                        </div>
                    )}
                    {!user && (
                        <button className="btn-view" style={{ width: '100%' }} onClick={() => navigate(`/product/${product.id}`)}>
                            View Details <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px' }}></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
