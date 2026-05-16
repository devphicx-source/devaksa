import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const products = [
    {
        id: 'cow-dung-cake',
        name: 'Cow Dung Cake',
        description: 'Traditional cow dung cakes made from natural cow dung.',
        price: 149,
        unit: 'Pack of 18',
        image: 'cow-dung-cake.jpeg',
        badge: 'Natural'
    },
    {
        id: 'varmi-compost',
        name: 'Vermi Compost (Organic Manure)',
        description: 'High-quality organic vermi compost produced using earthworms.',
        price: 99,
        unit: '1 kg',
        image: 'cow-dung-manure.jpeg',
        badge: 'Organic'
    },
    {
        id: 'raw-honey',
        name: 'Natural Honey',
        description: 'Pure and natural honey sourced responsibly, free from additives.',
        price: 299,
        unit: '300 g',
        image: 'natural-pure-raw-honey-.jpeg',
        badge: 'Pure'
    },
    {
        id: 'cow-dung-manure',
        name: 'Cow Dung Manure',
        description: 'Naturally processed cow dung manure for soil enrichment.',
        price: 89,
        unit: '1 kg',
        image: 'cow-dung-powder.jpeg',
        badge: 'Natural'
    },
    {
        id: 'moringa-powder',
        name: 'Moringa Powder',
        description: 'Premium quality moringa leaf powder for daily health.',
        price: 199,
        unit: '100 g',
        image: 'moringa.jpeg',
        badge: 'Superfood'
    }
];

const Home = () => {
    const { token } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const searchQuery = searchParams.get('search') || '';

    // Filter products based on search query
    const filteredProducts = searchQuery.trim()
        ? products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.badge.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : products;

    const clearSearch = () => setSearchParams({});

    const handleAddToCart = async (product) => {
        if (!token) return showToast('Please login to add to cart', 'error');
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productName: product.name,
                    price: product.price,
                    image: product.image
                })
            });
            if (res.ok) {
                showToast(`${product.name} added to cart!`);
            } else {
                showToast('Failed to add to cart', 'error');
            }
        } catch (error) {
            console.error('Cart error:', error);
        }
    };

    const handleBuyNow = async (product) => {
        await handleAddToCart(product);
        navigate('/checkout');
    };

    return (
        <main>
            {/* Hero — only show when no active search */}
            {!searchQuery && (
                <header className="hero-section">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">Nature, Pure &amp; Simple.</h1>
                        <p className="hero-subtitle">Premium organic products for a sustainable lifestyle. From Cow Dung Cakes to Raw Forest Honey.</p>
                        <div className="hero-cta-group">
                            <a href="#products" className="btn btn-primary">Shop Now</a>
                            <a href="#about" className="btn btn-secondary">Learn More</a>
                        </div>
                    </div>
                </header>
            )}

            <section id="products" className="product-section">
                {searchQuery ? (
                    <div className="search-results-header">
                        <div>
                            <h2 className="section-title" style={{ marginBottom: '8px' }}>Search Results</h2>
                            <p className="search-results-meta">
                                {filteredProducts.length > 0
                                    ? `${filteredProducts.length} result${filteredProducts.length > 1 ? 's' : ''} for "${searchQuery}"`
                                    : `No results found for "${searchQuery}"`
                                }
                            </p>
                        </div>
                        <button className="search-clear-btn" onClick={clearSearch}>
                            <i className="fa-solid fa-xmark"></i> Clear Search
                        </button>
                    </div>
                ) : (
                    <h2 className="section-title">Our Collection</h2>
                )}

                {filteredProducts.length > 0 ? (
                    <div className="product-grid">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="search-no-results">
                        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '48px', color: '#ccc' }}></i>
                        <h3>Koi product nahi mila</h3>
                        <p>"{searchQuery}" ke liye koi result nahi hai. Kuch aur search karo.</p>
                        <button className="btn-main" onClick={clearSearch} style={{ width: 'auto', padding: '12px 28px' }}>
                            Saare Products Dekho
                        </button>
                    </div>
                )}
            </section>

            {!searchQuery && (
                <>
                    <section id="about" style={{ padding: '80px 20px', textAlign: 'center', background: '#fbfbfd' }}>
                        <h2>Our Story</h2>
                        <p style={{ maxWidth: '800px', margin: '20px auto', color: '#666' }}>
                            Devaks Green Solutions is committed to bringing you the most authentic and pure products from the heart of nature.
                            Our mission is to support farmers and promote a healthy, organic lifestyle.
                        </p>
                    </section>

                    <section id="reviews" style={{ padding: '80px 20px', textAlign: 'center' }}>
                        <h2>Customer Love</h2>
                        <div style={{ margin: '40px 0', fontStyle: 'italic', color: '#555' }}>
                            "Purity you can trust."
                        </div>
                    </section>
                </>
            )}
        </main>
    );
};

export default Home;
