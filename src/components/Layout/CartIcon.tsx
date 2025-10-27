import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartApi } from '@/lib/api';

const CartIcon: React.FC = () => {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await cartApi.getCart();
      setCartItemsCount(response.data.totalItems || 0);
    } catch (error) {
      // If cart doesn't exist or user not logged in, set count to 0
      setCartItemsCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart count when component mounts (useful after adding items)
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    // Listen for custom events when cart is updated
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  if (loading) {
    return (
      <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
        <div className="animate-pulse">
          🛒
        </div>
      </Link>
    );
  }

  return (
    <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
      <span className="text-xl">🛒</span>
      {cartItemsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartItemsCount > 99 ? '99+' : cartItemsCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
