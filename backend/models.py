"""
Devaksa Backend — Pydantic Models
Replaces Mongoose schemas from models.js.
Same field names and structure to maintain MongoDB compatibility.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Cart Item (embedded in User) ────────────────────────────────────
class CartItem(BaseModel):
    productName: str
    price: float
    image: str
    quantity: int = 1


# ─── User ─────────────────────────────────────────────────────────────
class UserInDB(BaseModel):
    """Represents a user document in MongoDB (matches UserSchema from models.js)."""
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None  # Optional for OTP flow
    otp: Optional[str] = None
    otpExpiry: Optional[datetime] = None
    cart: List[CartItem] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)


# ─── Product ──────────────────────────────────────────────────────────
class ProductInDB(BaseModel):
    """Represents a product document (matches ProductSchema from models.js)."""
    name: str
    price: float
    image: str
    badge: Optional[str] = None
    description: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


# ─── Review ───────────────────────────────────────────────────────────
class ReviewInDB(BaseModel):
    """Represents a review document (matches ReviewSchema from models.js)."""
    productName: str
    reviewerName: str
    rating: int = Field(ge=1, le=5)
    comment: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)


# ─── Enquiry ──────────────────────────────────────────────────────────
class EnquiryInDB(BaseModel):
    """Represents an enquiry document (matches EnquirySchema from models.js)."""
    productName: Optional[str] = None
    name: str
    email: Optional[str] = None
    countryCode: Optional[str] = None
    mobile: Optional[str] = None
    phone: Optional[str] = None
    message: str
    status: str = "new"  # new, contacted, closed
    createdAt: datetime = Field(default_factory=datetime.utcnow)


# ─── Order — Shipping Address (embedded) ─────────────────────────────
class ShippingAddress(BaseModel):
    fullName: str
    phone: str
    email: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str


# ─── Order — Tracking Entry (embedded) ───────────────────────────────
class TrackingEntry(BaseModel):
    status: Optional[str] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─── Order — Item (embedded) ─────────────────────────────────────────
class OrderItem(BaseModel):
    productName: str
    price: float
    image: Optional[str] = None
    quantity: int = 1


# ─── Order ────────────────────────────────────────────────────────────
class OrderInDB(BaseModel):
    """Represents an order document (matches OrderSchema from models.js)."""
    user: str  # ObjectId as string
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    paymentMethod: str = "COD"  # COD, Prepaid, UPI, Card, NetBanking
    totalAmount: float
    status: str = "Pending"  # Pending, Confirmed, Shipped, Out for Delivery, Delivered, Cancelled
    tracking: List[TrackingEntry] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)


# ═══════════════════════════════════════════════════════════════════════
# Request/Response Models (for API validation)
# ═══════════════════════════════════════════════════════════════════════

class SendOTPRequest(BaseModel):
    phone: str
    name: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str


class AddToCartRequest(BaseModel):
    productName: str
    price: float
    image: str


class ReviewRequest(BaseModel):
    productName: str
    reviewerName: str
    rating: int = Field(ge=1, le=5)
    comment: str


class EnquiryRequest(BaseModel):
    productName: Optional[str] = None
    name: str
    email: Optional[str] = None
    countryCode: Optional[str] = None
    mobile: Optional[str] = None
    phone: Optional[str] = None
    message: str


class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    paymentMethod: str = "COD"
    totalAmount: float
