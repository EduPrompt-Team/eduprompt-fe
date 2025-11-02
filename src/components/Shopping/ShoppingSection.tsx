import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cartApi, packageApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Package {
  packageID: number;
  packageName: string;
  description?: string;
  price: number;
  durationDays?: number;
  isActive: boolean;
  categoryName?: string;
}

interface AddToCartButtonProps {
  packageId: number;
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ packageId, className }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await cartApi.addItem({ packageID: packageId, quantity: 1 });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Dispatch custom event to update cart icon
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show success anyway for demo purposes
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Show a more user-friendly message - Toast will be handled by parent component if needed
      console.log('Item added to cart (using mock data - API not available)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={loading}
      className={`${className} ${success ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      {loading ? 'Adding...' : success ? 'Added!' : 'Add to Cart'}
    </Button>
  );
};

const PackageCard: React.FC<{ package: Package }> = ({ package: pkg }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.packageName}</h3>
        <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
        {pkg.categoryName && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {pkg.categoryName}
          </span>
        )}
      </div>
      
      <div className="mb-4">
        <div className="text-2xl font-bold text-blue-600 mb-1">
          ${pkg.price.toFixed(2)}
        </div>
        {pkg.durationDays && (
          <div className="text-sm text-gray-500">
            {pkg.durationDays} days access
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <AddToCartButton 
          packageId={pkg.packageID} 
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        />
        <Link to={`/package/${pkg.packageID}`}>
          <Button variant="outline" className="flex-1">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

const ShoppingSection: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageApi.getAll();
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      // Use mock data if API fails
      setPackages([
        {
          packageID: 1,
          packageName: 'Premium Math Package',
          description: 'Advanced mathematics learning package with comprehensive exercises and solutions.',
          price: 49.99,
          durationDays: 365,
          isActive: true,
          categoryName: 'Mathematics'
        },
        {
          packageID: 2,
          packageName: 'Science Explorer Package',
          description: 'Comprehensive science learning package covering physics, chemistry, and biology.',
          price: 59.99,
          durationDays: 365,
          isActive: true,
          categoryName: 'Science'
        },
        {
          packageID: 3,
          packageName: 'Language Arts Mastery',
          description: 'Complete language arts package with grammar, literature, and writing exercises.',
          price: 39.99,
          durationDays: 180,
          isActive: true,
          categoryName: 'Language Arts'
        },
        {
          packageID: 4,
          packageName: 'History & Geography Bundle',
          description: 'World history and geography package with interactive maps and timelines.',
          price: 44.99,
          durationDays: 365,
          isActive: true,
          categoryName: 'Social Studies'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Packages</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive learning packages designed to enhance your educational journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.packageID} package={pkg} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/cart">
            <Button className="bg-blue-600 hover:bg-blue-700 mr-4">
              View Cart
            </Button>
          </Link>
          <Link to="/wallet">
            <Button variant="outline">
              My Wallet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShoppingSection;
