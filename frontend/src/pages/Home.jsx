import { useState, useEffect } from 'react';
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
    },
    {
        id: 'neem-powder',
        name: 'Neem Powder',
        description: 'Pure and natural neem powder for skin, haircare, and plants.',
        price: 160,
        unit: '200 g',
        image: 'neem-powder.jpeg',
        badge: '100% Natural'
    },
    {
        id: 'sabji-masala',
        name: 'Sabji Masala',
        description: 'Premium quality Sabji Masala, carefully blended from selected spices to enhance taste and aroma.',
        price: 250,
        unit: '200 g',
        image: 'sabji-masala.jpeg',
        badge: 'Premium Quality'
    }
];

const Home = () => {
    const { token } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Review States
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        reviewerName: '',
        rating: 5,
        productName: 'Cow Dung Cake',
        comment: ''
    });

    const defaultReviews = [
        {
            _id: 'default1',
            reviewerName: 'Rohan Sharma',
            productName: 'Cow Dung Cake',
            rating: 5,
            comment: 'Aura aur purity dono kamaal hain! Pura natural feel aata hai hawan ke dauran. Highly recommended!',
            createdAt: '2026-05-18T10:00:00Z'
        },
        {
            _id: 'default2',
            reviewerName: 'Priya Patel',
            productName: 'Natural Honey',
            rating: 5,
            comment: 'Market ke doosre honey se bilkul alag hai. Pure organic taste aur thick consistency hai. Sourcing is genuine.',
            createdAt: '2026-05-20T12:30:00Z'
        },
        {
            _id: 'default3',
            reviewerName: 'Anil Verma',
            productName: 'Vermi Compost (Organic Manure)',
            rating: 5,
            comment: 'Mera terrace garden ab bohot hara bhara ho gaya hai. Plant growth fast aur healthy ho gayi hai. Sasta aur badhiya product.',
            createdAt: '2026-05-22T08:15:00Z'
        }
    ];

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/reviews');
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewForm)
            });

            if (res.ok) {
                showToast('Review submitted successfully! Thank you. 🌿');
                setReviewForm({ reviewerName: '', rating: 5, productName: 'Cow Dung Cake', comment: '' });
                setShowForm(false);
                fetchReviews();
            } else {
                showToast('Failed to submit review', 'error');
            }
        } catch (error) {
            console.error('Review error:', error);
            showToast('Something went wrong', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <i key={i} className={`fa-star ${i < rating ? 'fa-solid' : 'fa-regular'}`}></i>
        ));
    };

    const displayedReviews = reviews.length > 0 ? [...reviews, ...defaultReviews] : defaultReviews;

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
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                showToast('Failed to add to cart', 'error');
            }
        } catch (error) {
            console.error('Cart error:', error);
        }
    };

    const handleBuyNow = (product) => {
        if (!token) return showToast('Please login to buy', 'error');
        navigate('/checkout', {
            state: {
                directBuyItem: {
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                }
            }
        });
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

                    <section id="reviews" className="reviews-section">
                        <div className="reviews-container">
                            <h2>Customer Love</h2>
                            <p style={{ color: '#666', marginTop: '10px' }}>What our beautiful family says about Devaksa Green Solutions 🌿</p>
                            
                            <div className="reviews-grid">
                                {displayedReviews.slice(0, 6).map((review) => (
                                    <div key={review._id} className="review-card">
                                        <div>
                                            <div className="review-header">
                                                <div className="review-user-info">
                                                    <div className="review-avatar">
                                                        {review.reviewerName ? review.reviewerName.charAt(0) : 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="reviewer-name">{review.reviewerName}</div>
                                                        <div className="reviewer-product">{review.productName}</div>
                                                    </div>
                                                </div>
                                                <div className="review-stars">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <p className="review-comment">"{review.comment}"</p>
                                        </div>
                                        <div className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!showForm ? (
                                <button className="write-review-btn" onClick={() => setShowForm(true)}>
                                    <i className="fa-solid fa-pen-to-square"></i> Share Your Experience
                                </button>
                            ) : (
                                <div className="review-form-container">
                                    <h3 style={{ marginBottom: '15px', color: 'var(--sage-green)', textAlign: 'center' }}>Share Your Feedback</h3>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="enquiry-field" style={{ marginBottom: '15px' }}>
                                            <label>Your Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter your name"
                                                value={reviewForm.reviewerName}
                                                onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                                            />
                                        </div>

                                        <div className="enquiry-field" style={{ marginBottom: '15px' }}>
                                            <label>Product Purchased *</label>
                                            <select
                                                style={{
                                                    background: 'rgba(255,255,255,0.08)',
                                                    border: '1px solid rgba(0,0,0,0.1)',
                                                    borderRadius: '10px',
                                                    fontSize: '14px',
                                                    padding: '12px 14px',
                                                    outline: 'none',
                                                    width: '100%',
                                                    fontFamily: 'inherit'
                                                }}
                                                value={reviewForm.productName}
                                                onChange={(e) => setReviewForm({ ...reviewForm, productName: e.target.value })}
                                            >
                                                {products.map(p => (
                                                    <option key={p.id} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="enquiry-field" style={{ marginBottom: '15px' }}>
                                            <label>Rating *</label>
                                            <div className="star-rating-selector">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i
                                                        key={star}
                                                        className={`star-interactive fa-star ${star <= reviewForm.rating ? 'fa-solid' : 'fa-regular'}`}
                                                        style={{ color: '#ffb800' }}
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    ></i>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="enquiry-field" style={{ marginBottom: '20px' }}>
                                            <label>Your Review *</label>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="Write your experience..."
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                type="submit"
                                                className="btn-main"
                                                style={{ width: 'auto', padding: '12px 24px', flex: 1 }}
                                                disabled={submittingReview}
                                            >
                                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                            <button
                                                type="button"
                                                className="write-review-btn"
                                                style={{ margin: 0, padding: '12px 24px' }}
                                                onClick={() => setShowForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
};

export default Home;
