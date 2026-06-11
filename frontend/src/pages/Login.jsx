import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const fullPhone = countryCode + phone;

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone })
            });
            const data = await res.json();
            if (res.ok) {
                setStep(2);
                showToast('OTP sent! Please check your phone.');
                if (data.otp) console.log('Dev OTP:', data.otp);
            } else {
                showToast(data.message, 'error');
                setError(data.message);
            }
        } catch (err) {
            showToast('Connection error', 'error');
            setError('Connection error');
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone, otp })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                showToast('Welcome back to Devaksa!');
                navigate('/');
            } else {
                showToast(data.message, 'error');
                setError(data.message);
            }
        } catch (err) {
            showToast('Verification failed', 'error');
            setError('Verification failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card-custom">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{step === 1 ? 'Login' : 'Verify OTP'}</h2>

                {error && <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontSize: '14px' }}>Phone Number</label>
                            <div className="phone-input-group">
                                <select
                                    className="country-code"
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    style={{ border: '1px solid #ddd', borderRadius: '12px', background: '#f8f9fa', padding: '0 10px', outline: 'none' }}
                                >
                                    <option value="+91">+91 (IN)</option>
                                    <option value="+1">+1 (US)</option>
                                    <option value="+44">+44 (UK)</option>
                                    <option value="+971">+971 (UAE)</option>
                                    <option value="+61">+61 (AU)</option>
                                    <option value="+1">+1 (CA)</option>
                                    <option value="+65">+65 (SG)</option>
                                    <option value="+49">+49 (DE)</option>
                                    <option value="+33">+33 (FR)</option>
                                </select>
                                <input
                                    type="tel"
                                    placeholder="Enter number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="auth-input"
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-main" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '600', marginBottom: '15px' }}>
                            {loading ? 'Sending...' : 'Get OTP'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
                            Don't have an account? <Link to="/signup" style={{ color: '#234B4A', fontWeight: '600', textDecoration: 'none' }}>Sign Up</Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontSize: '14px' }}>Enter 6-digit OTP</label>
                            <input
                                type="text"
                                placeholder="XXXXXX"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength="6"
                                className="auth-input"
                                style={{ textAlign: 'center', letterSpacing: '4px' }}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-main">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer', width: '100%' }}>
                            Back to change number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
