import { useState } from 'react';
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

    const handleBuyNow = (product) => {
        handleAddToCart(product);
        // In a real app, redirect to checkout
        console.log(`Redirecting to checkout for ${product.name}`);
    };

    return (
        <main>
            <header className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Nature, Pure & Simple.</h1>
                    <p className="hero-subtitle">Premium organic products for a sustainable lifestyle. From Cow Dung Cakes to Raw Forest Honey.</p>
                    <div className="hero-cta-group">
                        <a href="#products" className="btn btn-primary">Shop Now</a>
                        <a href="#about" className="btn btn-secondary">Learn More</a>
                    </div>
                </div>
            </header>

            <section id="products" className="product-section">
                <h2 className="section-title">Our Collection</h2>
                <div className="product-grid">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                        />
                    ))}
                </div>
            </section>

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
        </main>
    );
};

export default Home;
