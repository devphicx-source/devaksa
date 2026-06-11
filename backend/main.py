"""
Devaksa Backend — Main FastAPI Application
Replaces server.js (Express) with all 11 API routes.
Same URL structure, same request/response format.
"""

import os
import random
from datetime import datetime, timedelta

import jwt
from bson import ObjectId
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from twilio.rest import Client as TwilioClient

from config import (
    PORT, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRY_DAYS,
    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER,
)
from database import connect_db, close_db, get_db
from auth import get_current_user
from models import (
    SendOTPRequest, VerifyOTPRequest,
    ReviewRequest, EnquiryRequest,
    AddToCartRequest, CreateOrderRequest,
)


# ═══════════════════════════════════════════════════════════════════════
# App Setup
# ═══════════════════════════════════════════════════════════════════════

app = FastAPI(title="Devaksa Green Solutions API", version="1.0.0")

# CORS — same as app.use(cors()) in Express
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Twilio client — same logic as server.js
twilio_client = None
if (
    TWILIO_ACCOUNT_SID
    and TWILIO_AUTH_TOKEN
    and TWILIO_ACCOUNT_SID != "YOUR_TWILIO_SID"
):
    twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


# ─── Lifecycle Events ────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()


# ═══════════════════════════════════════════════════════════════════════
# Helper to convert MongoDB ObjectId for JSON serialization
# ═══════════════════════════════════════════════════════════════════════

def serialize_doc(doc):
    """Recursively convert MongoDB document to JSON-safe dict (ObjectId → str)."""
    if isinstance(doc, dict):
        return {k: serialize_doc(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [serialize_doc(i) for i in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    return doc


def serialize_docs(docs: list) -> list:
    """Convert a list of MongoDB documents."""
    return [serialize_doc(d) for d in docs]


# ═══════════════════════════════════════════════════════════════════════
# AUTH ROUTES — /api/auth/*
# Replaces: app.post('/api/auth/send-otp') and app.post('/api/auth/verify-otp')
# ═══════════════════════════════════════════════════════════════════════

@app.post("/api/auth/send-otp")
async def send_otp(body: SendOTPRequest):
    """
    Send OTP to phone number.
    Replaces Express: app.post('/api/auth/send-otp', ...)
    """
    db = get_db()

    if not body.phone:
        raise HTTPException(status_code=400, detail="Phone required")

    otp = str(random.randint(100000, 999999))
    expiry = datetime.utcnow() + timedelta(minutes=5)

    # Upsert user — same as User.findOneAndUpdate({ phone }, ..., { upsert: true })
    update_data = {"otp": otp, "otpExpiry": expiry}
    if body.name:
        update_data["name"] = body.name

    try:
        await db.users.update_one(
            {"phone": body.phone},
            {"$set": update_data, "$setOnInsert": {"createdAt": datetime.utcnow(), "cart": []}},
            upsert=True,
        )
    except Exception as e:
        error_msg = str(e)
        if "E11000" in error_msg:
            raise HTTPException(
                status_code=500,
                detail="Phone number already in use or Database Index Error",
            )
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    # Twilio SMS
    if twilio_client and TWILIO_PHONE_NUMBER:
        try:
            twilio_client.messages.create(
                body=f"Your Devaksa verification code is: {otp}. Valid for 5 minutes.",
                from_=TWILIO_PHONE_NUMBER,
                to=body.phone,
            )
            return {"message": "OTP sent"}
        except Exception as e:
            error_code = getattr(e, "code", None)
            if error_code in (21211, 21608):
                raise HTTPException(status_code=400, detail=f"Twilio Error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to send OTP")
    else:
        # Dev mode — print OTP to console
        print(f"[DEV] OTP for {body.phone}: {otp}")
        return {"message": "OTP sent (Dev mode)", "otp": otp}


@app.post("/api/auth/verify-otp")
async def verify_otp(body: VerifyOTPRequest):
    """
    Verify OTP and return JWT token.
    Replaces Express: app.post('/api/auth/verify-otp', ...)
    """
    db = get_db()

    user = await db.users.find_one({"phone": body.phone})

    if not user or user.get("otp") != body.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Check expiry
    otp_expiry = user.get("otpExpiry")
    if otp_expiry and otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Clear OTP — same as user.otp = undefined; user.otpExpiry = undefined; user.save()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$unset": {"otp": "", "otpExpiry": ""}},
    )

    # Generate JWT — same as jwt.sign({ id: user._id }, secret, { expiresIn: '7d' })
    token = jwt.encode(
        {
            "id": str(user["_id"]),
            "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRY_DAYS),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    return {
        "token": token,
        "user": {"phone": user.get("phone"), "name": user.get("name")},
    }


# ═══════════════════════════════════════════════════════════════════════
# REVIEW ROUTES — /api/reviews
# Replaces: app.get('/api/reviews') and app.post('/api/reviews')
# ═══════════════════════════════════════════════════════════════════════

@app.get("/api/reviews")
async def get_reviews():
    """
    Get all reviews sorted by newest first.
    Replaces Express: app.get('/api/reviews', ...)
    """
    db = get_db()
    try:
        cursor = db.reviews.find().sort("createdAt", -1)
        reviews = await cursor.to_list(length=100)
        return serialize_docs(reviews)
    except Exception:
        raise HTTPException(status_code=500, detail="Error")


@app.post("/api/reviews", status_code=201)
async def create_review(body: ReviewRequest):
    """
    Submit a new review.
    Replaces Express: app.post('/api/reviews', ...)
    """
    db = get_db()
    try:
        doc = body.model_dump()
        doc["createdAt"] = datetime.utcnow()
        await db.reviews.insert_one(doc)
        return {"message": "Submitted"}
    except Exception:
        raise HTTPException(status_code=500, detail="Error")


# ═══════════════════════════════════════════════════════════════════════
# ENQUIRY ROUTES — /api/enquiries
# Replaces: app.post('/api/enquiries')
# ═══════════════════════════════════════════════════════════════════════

@app.post("/api/enquiries", status_code=201)
async def create_enquiry(body: EnquiryRequest):
    """
    Submit a new product enquiry.
    Replaces Express: app.post('/api/enquiries', ...)
    """
    db = get_db()
    try:
        doc = body.model_dump()
        doc["createdAt"] = datetime.utcnow()
        doc["status"] = "new"
        await db.enquiries.insert_one(doc)
        return {"message": "Sent"}
    except Exception:
        raise HTTPException(status_code=500, detail="Error")


# ═══════════════════════════════════════════════════════════════════════
# CART ROUTES — /api/cart
# Replaces: app.get('/api/cart') and app.post('/api/cart')
# ═══════════════════════════════════════════════════════════════════════

@app.get("/api/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    """
    Get the logged-in user's cart.
    Replaces Express: app.get('/api/cart', auth, ...)
    """
    db = get_db()
    try:
        user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
        return serialize_doc(user.get("cart", [])) if user else []
    except Exception:
        raise HTTPException(status_code=500, detail="Error")


@app.post("/api/cart")
async def add_to_cart(body: AddToCartRequest, current_user: dict = Depends(get_current_user)):
    """
    Add an item to the user's cart.
    Replaces Express: app.post('/api/cart', auth, ...)
    Same logic: if product exists, increment qty; else push new item.
    """
    db = get_db()
    try:
        user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        cart = user.get("cart", [])

        # Check if item already exists — same as user.cart.find(i => i.productName === productName)
        existing = None
        for item in cart:
            if item.get("productName") == body.productName:
                existing = item
                break

        if existing:
            existing["quantity"] = existing.get("quantity", 1) + 1
        else:
            cart.append({
                "productName": body.productName,
                "price": body.price,
                "image": body.image,
                "quantity": 1,
            })

        await db.users.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": {"cart": cart}},
        )

        return serialize_doc({"cart": cart})
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error")


# ═══════════════════════════════════════════════════════════════════════
# ORDER ROUTES — /api/orders/*
# Replaces: All 4 order routes from server.js
# ═══════════════════════════════════════════════════════════════════════

@app.post("/api/orders", status_code=201)
async def create_order(body: CreateOrderRequest, current_user: dict = Depends(get_current_user)):
    """
    Create a new order.
    Replaces Express: app.post('/api/orders', auth, ...)
    """
    db = get_db()

    if not body.items or len(body.items) == 0:
        raise HTTPException(status_code=400, detail="No items in order")

    try:
        order_doc = {
            "user": ObjectId(current_user["id"]),
            "items": [item.model_dump() for item in body.items],
            "shippingAddress": body.shippingAddress.model_dump(),
            "paymentMethod": body.paymentMethod or "COD",
            "totalAmount": body.totalAmount,
            "status": "Confirmed",
            "tracking": [
                {
                    "status": "Confirmed",
                    "message": "Order placed and confirmed!",
                    "timestamp": datetime.utcnow(),
                }
            ],
            "createdAt": datetime.utcnow(),
        }

        result = await db.orders.insert_one(order_doc)

        # Clear user cart — same as User.findByIdAndUpdate(req.user.id, { cart: [] })
        await db.users.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": {"cart": []}},
        )

        order_id = str(result.inserted_id)
        order_doc["_id"] = order_id
        order_doc["user"] = current_user["id"]

        return {"message": "Order placed!", "orderId": order_id, "order": serialize_doc(order_doc)}
    except Exception as e:
        print(f"Order Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to place order")


@app.get("/api/orders/user")
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    """
    Get all orders of the logged-in user.
    Replaces Express: app.get('/api/orders/user', auth, ...)
    """
    db = get_db()
    try:
        cursor = db.orders.find({"user": ObjectId(current_user["id"])}).sort("createdAt", -1)
        orders = await cursor.to_list(length=100)
        return serialize_docs(orders)
    except Exception:
        raise HTTPException(status_code=500, detail="Error fetching orders")


@app.get("/api/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get a single order by ID.
    Replaces Express: app.get('/api/orders/:id', auth, ...)
    """
    db = get_db()
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Authorization check — same as order.user.toString() !== req.user.id
        if str(order["user"]) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        return serialize_doc(order)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error fetching order")


@app.patch("/api/orders/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """
    Cancel an order.
    Replaces Express: app.patch('/api/orders/:id/cancel', auth, ...)
    """
    db = get_db()
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        if str(order["user"]) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        if order["status"] in ("Delivered", "Cancelled"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel an order that is already {order['status']}",
            )

        # Update order — same as order.status = 'Cancelled'; order.tracking.push(...)
        tracking_entry = {
            "status": "Cancelled",
            "message": "Order was cancelled by you.",
            "timestamp": datetime.utcnow(),
        }

        await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {"status": "Cancelled"},
                "$push": {"tracking": tracking_entry},
            },
        )

        # Fetch updated order
        updated_order = await db.orders.find_one({"_id": ObjectId(order_id)})
        return {"message": "Order cancelled successfully", "order": serialize_doc(updated_order)}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error cancelling order")


# ═══════════════════════════════════════════════════════════════════════
# STATIC FILE SERVING (Production)
# Replaces: Express static middleware at bottom of server.js
# ═══════════════════════════════════════════════════════════════════════

if os.getenv("NODE_ENV") == "production":
    # Serve built frontend assets
    dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

    if os.path.exists(dist_path):
        # Serve static files (JS, CSS, images, etc.)
        app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="static_assets")

        # Serve files from public directory (images, PDFs)
        public_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
        app.mount("/static", StaticFiles(directory=public_path), name="static_public")

        # Catch-all for SPA routing — same as app.get('*', ...)
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            # Don't serve index.html for API routes
            if full_path.startswith("api/"):
                raise HTTPException(status_code=404, detail="Not found")
            file_path = os.path.join(dist_path, full_path)
            if os.path.isfile(file_path):
                return FileResponse(file_path)
            return FileResponse(os.path.join(dist_path, "index.html"))


# ═══════════════════════════════════════════════════════════════════════
# Entry point — replaces app.listen(PORT, ...)
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Server on {PORT}")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
