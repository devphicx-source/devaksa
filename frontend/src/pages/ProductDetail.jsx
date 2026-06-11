import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const productData = {
    'cow-dung-cake': {
        name: 'Cow Dung Cake',
        image: 'cow-dung-cake.jpeg',
        description: 'Traditional cow dung cakes made from natural cow dung, commonly used for religious purposes and organic fuel.',
        benefits: ['Eco-friendly', 'Natural and chemical-free', 'Multi-purpose use'],
        usage: 'Used in traditional rituals and as a natural fuel source.',
        shelfLife: '12 months',
        variants: [
            { size: 'Pack of 18', price: 149 }
        ]
    },
    'varmi-compost': {
        name: 'Vermi Compost (Organic Manure)',
        image: 'cow-dung-manure.jpeg',
        description: 'High-quality organic vermi compost produced using earthworms, improving soil fertility and crop yield naturally.',
        benefits: ['Enhances soil structure', 'Improves plant growth', 'Increases microbial activity', 'Eco-friendly and organic'],
        usage: 'Suitable for vegetables, fruits, flowers, and all crops.',
        shelfLife: '12 months',
        variants: [
            { size: '1 kg', price: 99 },
            { size: '5 kg', price: 449 }
        ]
    },
    'raw-honey': {
        name: 'Natural Honey',
        image: 'natural-pure-raw-honey-.jpeg',
        description: 'Pure and natural honey sourced responsibly, free from artificial additives and preservatives.',
        benefits: ['Natural energy booster', 'Supports digestion', 'Rich in antioxidants', 'Helps improve immunity'],
        usage: 'Can be consumed directly or used in food and beverages.',
        shelfLife: '18 months',
        variants: [
            { size: '300 g', price: 299 },
            { size: '500 g', price: 599 },
            { size: '1200 g', price: 1149 }
        ]
    },
    'cow-dung-manure': {
        name: 'Cow Dung Manure',
        image: 'cow-dung-powder.jpeg',
        description: 'Naturally processed cow dung manure used as an effective organic fertilizer for soil enrichment.',
        benefits: ['Improves soil fertility', 'Enhances water retention', 'Safe for all crops', '100% organic'],
        usage: 'Apply directly to soil before sowing or during crop growth.',
        shelfLife: '12 months',
        variants: [
            { size: '1 kg', price: 89 },
            { size: '5 kg', price: 429 }
        ]
    },
    'moringa-powder': {
        name: 'Moringa Powder',
        image: 'moringa.jpeg',
        description: 'Premium quality moringa leaf powder, carefully processed to retain maximum nutrients. Ideal for daily health and wellness.',
        benefits: ['Rich in vitamins & minerals', 'Boosts immunity', 'Supports energy & metabolism', '100% natural and chemical-free'],
        usage: 'Can be mixed with water, juice, smoothies, or food.',
        shelfLife: '12 months',
        variants: [
            { size: '100 g', price: 199 },
            { size: '150 g', price: 249 },
            { size: '250 g', price: 449 },
            { size: '500 g', price: 749 }
        ]
    },
    'neem-powder': {
        name: 'Neem Powder',
        image: 'neem-powder.jpeg',
        description: 'Pure and natural neem powder for skin, haircare, and plants.',
        benefits: ['Improves skin health', 'Helps with dandruff', 'Natural pesticide for plants', '100% natural'],
        usage: 'Can be mixed with water for skin/hair application, or mixed with soil for plants.',
        shelfLife: '12 months',
        variants: [
            { size: '200 g', price: 160 }
        ]
    },
    'sabji-masala': {
        name: 'Sabji Masala',
        image: 'sabji-masala.jpeg',
        description: 'Premium quality Sabji Masala, carefully blended from selected spices to enhance taste and aroma.',
        benefits: ['Enhances flavor', 'Made from natural spices', 'No artificial colors', 'Authentic taste'],
        usage: 'Add to vegetable dishes during cooking for an authentic flavor.',
        shelfLife: '12 months',
        variants: [
            { size: '200 g', price: 250 }
        ]
    }
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = productData[id];
    const { user, token } = useAuth();
    const { showToast } = useToast();

    // Default to first variant if exists
    const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);

    if (!product) {
        return <div className="p-20 text-center">Product not found. <Link to="/" className="text-sage-green">Back to Home</Link></div>;
    }

    const handleAddToCart = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productName: `${product.name} (${selectedVariant.size})`,
                    price: selectedVariant.price,
                    image: product.image
                })
            });
            if (res.ok) {
                showToast(`${product.name} (${selectedVariant.size}) added to cart!`);
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                showToast('Failed to add to cart', 'error');
            }
        } catch (error) {
            showToast('Connection error', 'error');
            console.error('Cart error:', error);
        }
    };

    const handleDirectBuy = () => {
        if (!token) return showToast('Please login to buy', 'error');
        navigate('/checkout', {
            state: {
                directBuyItem: {
                    productId: id,
                    productName: `${product.name} (${selectedVariant.size})`,
                    price: selectedVariant.price,
                    image: product.image,
                    quantity: 1
                }
            }
        });
    };

    return (
        <div className="product-page">
            <div className="back-btn-container">
                <Link to="/" className="back-btn"><i className="fa-solid fa-arrow-left"></i> Back to Collection</Link>
            </div>

            <div className="product-detail-container">
                <div className="product-image-section">
                    <img src={`/${product.image}`} alt={product.name} />
                </div>
                <div className="product-content-section">
                    <h1>{product.name}</h1>

                    <div className="variant-selection" style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: '600', marginBottom: '10px', color: '#666' }}>Select Size:</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {product.variants.map((v, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedVariant(v)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '30px',
                                        border: selectedVariant.size === v.size ? '2px solid var(--sage-green)' : '1px solid #ddd',
                                        background: selectedVariant.size === v.size ? 'rgba(2, 107, 92, 0.05)' : 'white',
                                        color: selectedVariant.size === v.size ? 'var(--sage-green)' : '#666',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: '0.2s'
                                    }}
                                >
                                    {v.size} - ₹{v.price}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="product-price" style={{ fontSize: '28px', color: 'var(--sage-green)', fontWeight: '700' }}>₹{selectedVariant.price}</p>

                    {user ? (
                        <div className="product-actions">
                            <button className="btn-main-p" onClick={handleDirectBuy}>Buy Now</button>
                            <button className="btn-secondary-p" onClick={handleAddToCart}>
                                <i className="fa-solid fa-cart-shopping"></i> Add to Cart
                            </button>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '30px' }}>
                            <Link to="/login" className="btn-main-p" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Login to Purchase</Link>
                        </div>
                    )}

                    <div className="product-info-tabs">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                        <h3>Usage</h3>
                        <p>{product.usage}</p>
                        <h3>Benefits</h3>
                        <ul>
                            {product.benefits.map((benefit, i) => (
                                <li key={i}>{benefit}</li>
                            ))}
                        </ul>
                        <h3>Shelf Life</h3>
                        <p>{product.shelfLife}</p>
                    </div>
                </div>
            </div>

            <div className="catalogue-info-section">
                <div className="catalogue-info-card">
                    <div className="company-branding">
                        <h2>Devaksa Green Solutions Ltd</h2>
                        <p className="company-tagline">Pure & Sustainable Products for Healthy Living and Farming</p>
                    </div>
                    <div className="expert-contact">
                        <i className="fa-solid fa-phone"></i>
                        <span>+91 9302725474 | +91 8319093312</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
