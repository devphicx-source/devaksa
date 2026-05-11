import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <ScrollToTop />
                    <div className="app-container">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />
                        </Routes>
                        <ConditionalFooter />
                    </div>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

const ConditionalFooter = () => {
    const location = useLocation();
    if (location.pathname.startsWith('/product/')) return null;
    return <Footer />;
};

export default App;
