import { useState } from 'react';

const Footer = () => {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Open blank tab immediately to bypass popup blocker
        let newTab = null;
        try {
            newTab = window.open('about:blank', '_blank');
        } catch (err) {
            console.error('Failed to pre-open tab:', err);
        }

        const msg = `Hello Devaksa!\nName: ${form.name}\nEmail: ${form.email || 'N/A'}\nPhone: ${form.phone}\nMessage: ${form.message}`;
        const waUrl = `https://wa.me/916307365754?text=${encodeURIComponent(msg)}`;

        try {
            // Save enquiry to database
            const res = await fetch('/api/enquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email || 'no-email@devaksa.com', // fallback default for compatibility
                    phone: form.phone,
                    message: form.message
                })
            });

            if (res.ok) {
                if (newTab) {
                    newTab.location.href = waUrl;
                } else {
                    window.location.href = waUrl;
                }
            } else {
                // If API fails, still redirect to WhatsApp
                if (newTab) {
                    newTab.location.href = waUrl;
                } else {
                    window.location.href = waUrl;
                }
            }
            setSubmitted(true);
        } catch (error) {
            console.error('Enquiry error:', error);
            // In case of network error, still try to redirect to WhatsApp
            if (newTab) {
                newTab.location.href = waUrl;
            } else {
                window.location.href = waUrl;
            }
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSubmitted(false);
        setForm({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <>
            <footer id="contact" className="footer">
                <div className="footer-container">
                    <div className="footer-main">
                        <div className="footer-col">
                            <h4>Shop and Learn</h4>
                            <ul>
                                <li><a href="#">Organic Manure</a></li>
                                <li><a href="#">Forest Honey</a></li>
                                <li><a href="#">Moringa</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>About Devaksa</h4>
                            <ul>
                                <li><a href="#">Our Story</a></li>
                                <li><a href="#">Sustainability</a></li>
                                <li><a href="#">Contact Us</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Certificates</h4>
                            <ul>
                                <li><a href="/msme.pdf" target="_blank">MSME (Udyam)</a></li>
                                <li><a href="/iec.pdf" target="_blank">IEC</a></li>
                                <li><a href="/gst.pdf" target="_blank">GST</a></li>
                            </ul>
                        </div>
                        <div className="footer-col" style={{ minWidth: '200px' }}>
                            <h4>Get in Touch</h4>
                            <p style={{ color: '#a1a1a6', fontSize: '14px', marginBottom: '15px', lineHeight: '1.5' }}>
                                Have questions or need a custom order?
                            </p>
                            <button
                                className="btn-main"
                                style={{ width: 'auto', padding: '12px 24px', fontSize: '14px' }}
                                onClick={() => setShowModal(true)}
                            >
                                Product Enquiry
                            </button>
                        </div>
                    </div>
                    <div className="footer-btm">
                        <p>Copyright © 2026 Devaksa Green Solutions. All rights reserved.</p>
                        <p>India</p>
                        <p className="developer-credit" style={{ marginTop: '5px', fontSize: '13px', opacity: 0.7 }}>
                            Developer: <a href="mailto:mrprimi91@gmail.com" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>Nishant &amp; RaviKaran</a>
                            <i className="fa-solid fa-code" style={{ fontSize: '11px', marginLeft: '5px' }}></i>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Enquiry Modal */}
            {showModal && (
                <div className="enquiry-overlay" onClick={closeModal}>
                    <div className="enquiry-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="enquiry-close" onClick={closeModal}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        {!submitted ? (
                            <>
                                <div className="enquiry-header">
                                    <div className="enquiry-icon">
                                        <i className="fa-solid fa-leaf"></i>
                                    </div>
                                    <h2>Product Enquiry</h2>
                                    <p>Fill in your details and we'll get back to you on WhatsApp!</p>
                                </div>
                                <form className="enquiry-form" onSubmit={handleSubmit}>
                                    <div className="enquiry-field">
                                        <label>Your Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Apna naam likhein..."
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="enquiry-field">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="email@example.com"
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="enquiry-field">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={form.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="enquiry-field">
                                        <label>Your Message *</label>
                                        <textarea
                                            name="message"
                                            placeholder="Aap kaunsa product chahte hain? Koi sawaal?"
                                            rows={4}
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="enquiry-submit" disabled={loading}>
                                        {loading ? (
                                            <span><i className="fa-solid fa-spinner fa-spin"></i> Sending...</span>
                                        ) : (
                                            <span><i className="fa-brands fa-whatsapp"></i> Send on WhatsApp</span>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="enquiry-success">
                                <div className="enquiry-success-icon">
                                    <i className="fa-solid fa-circle-check"></i>
                                </div>
                                <h2>Enquiry Submitted!</h2>
                                <p>Aapki enquiry database mein save ho gayi hai aur WhatsApp chat open ho gayi hai. 🌿</p>
                                
                                <div style={{ marginTop: '15px' }}>
                                    <p style={{ fontSize: '13px', color: '#a1a1a6', marginBottom: '8px' }}>
                                        Agar WhatsApp page open nahi hua, toh neeche button pe click karein:
                                    </p>
                                    <a
                                        href={`https://wa.me/916307365754?text=${encodeURIComponent(`Hello Devaksa!\nName: ${form.name}\nEmail: ${form.email || 'N/A'}\nPhone: ${form.phone}\nMessage: ${form.message}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="enquiry-submit"
                                        style={{
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            padding: '12px 20px',
                                            width: 'auto',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                                    </a>
                                </div>

                                <button className="btn-main" onClick={closeModal} style={{ marginTop: '25px', width: 'auto', padding: '10px 24px' }}>
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
