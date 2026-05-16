const Footer = () => {
    return (
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
                        <button className="btn-main" style={{ width: 'auto', padding: '12px 24px', fontSize: '14px' }}>
                            Product Enquiry
                        </button>
                    </div>
                </div>
                <div className="footer-btm">
                    <p>Copyright © 2026 Devaksa Green Solutions. All rights reserved.</p>
                    <p>India</p>
                    <p className="developer-credit" style={{ marginTop: '5px', fontSize: '13px', opacity: 0.7 }}>
                        Developer: <a href="mailto:mrprimi91@gmail.com" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>Nishant & RaviKaran</a>
                        <i className="fa-solid fa-code" style={{ fontSize: '11px', marginLeft: '5px' }}></i>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
