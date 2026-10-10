'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } =
    useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const subtotal = getSubtotal();
  const isBulkWarning = items.some((item) => item.quantity * (parseFloat(item.weight) || 1) >= 5000); // > 5 KG

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="mobile-menu-overlay"
          style={{ zIndex: 45 }}
          onClick={closeCart}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`cart-drawer ${isOpen ? 'open' : ''}`}
        style={{ zIndex: 50 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} style={{ color: '#2563EB' }} />
            <h2
              className="font-bold text-lg"
              style={{ fontFamily: 'var(--font-outfit)', color: '#FFF700' }}
            >
              Your Cart
            </h2>
            {items.length > 0 && (
              <span className="badge badge-blue">{items.length}</span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="btn btn-icon btn-outline"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bulk warning */}
        {isBulkWarning && (
          <div
            className="mx-4 mt-3 p-3 rounded-lg text-sm"
            style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#1E40AF' }}
          >
            <p className="font-semibold mb-1">Looks like a bulk order! 📦</p>
            <p className="text-xs mb-2">
              Save more with our bulk pricing. Get a custom quote.
            </p>
            <Link
              href="/bulk-orders"
              onClick={closeCart}
              className="btn btn-primary btn-sm"
            >
              Switch to Bulk Order
            </Link>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Package size={28} />
              </div>
              <h3
                className="font-semibold text-lg mb-2"
                style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-outfit)' }}
              >
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Explore our premium Sev collection.
              </p>
              <Link href="/shop" onClick={closeCart} className="btn btn-primary">
                Shop Sev
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 pb-4"
                  style={{ borderBottom: '1px solid #F1F5F9' }}
                >
                  {/* Image */}
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.productName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.variantName} · {item.weight}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty */}
                      <div
                        className="flex items-center rounded-lg overflow-hidden"
                        style={{ border: '1.5px solid #E2E8F0' }}
                      >
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: '#FFF700' }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(item.compareAtPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 py-5"
            style={{ borderTop: '1px solid #E2E8F0', background: '#FAFBFC' }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-bold text-lg" style={{ color: '#FFF700' }}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Taxes & shipping calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn btn-primary w-full justify-center btn-lg"
            >
              Checkout
              <ArrowRight size={17} />
            </Link>
            <button
              onClick={closeCart}
              className="btn btn-outline w-full justify-center mt-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}