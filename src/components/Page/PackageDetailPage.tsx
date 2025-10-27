import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { packageApi, mockData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import AddToCartButton from '@/components/Shopping/ShoppingSection';

interface Package {
  packageID: number;
  packageName: string;
  description?: string;
  price: number;
  durationDays?: number;
  isActive: boolean;
  categoryName?: string;
}

const PackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPackage(parseInt(id));
    }
  }, [id]);

  const fetchPackage = async (packageId: number) => {
    try {
      setLoading(true);
      const response = await packageApi.getById(packageId);
      setPackageData(response.data);
    } catch (err: any) {
      console.error('Package fetch error:', err);
      // Use mock data if API fails
      const mockPackages = [
        {
          packageID: 1,
          packageName: 'Premium Math Package',
          description: 'Advanced mathematics learning package with comprehensive exercises and solutions. This package includes algebra, geometry, calculus, and statistics modules.',
          price: 49.99,
          durationDays: 365,
          isActive: true,
          categoryName: 'Mathematics'
        },
        {
          packageID: 2,
          packageName: 'Science Explorer Package',
          description: 'Comprehensive science learning package covering physics, chemistry, and biology. Includes interactive experiments and simulations.',
          price: 59.99,
          durationDays: 365,
          isActive: true,
          categoryName: 'Science'
        },
        {
          packageID: 3,
          packageName: 'Language Arts Mastery',
          description: 'Complete language arts package with grammar, literature, and writing exercises. Perfect for improving communication skills.',
          price: 39.99,
          durationDays: 180,
          isActive: true,
          categoryName: 'Language Arts'
        },
        {
          packageID: 4,
          packageName: 'History & Geography Bundle',
          description: 'World history and geography package with interactive maps and timelines. Explore civilizations and cultures from around the world.',
          price: 44.99,
          durationDays: 365,
          isActive: true,
          categoryName: 'Social Studies'
        },
        {
          packageID: 5,
          packageName: 'Programming Fundamentals',
          description: 'Learn programming from scratch with this comprehensive package. Covers Python, JavaScript, and web development basics.',
          price: 79.99,
          durationDays: 180,
          isActive: true,
          categoryName: 'Programming'
        }
      ];
      
      const mockPackage = mockPackages.find(p => p.packageID === packageId);
      if (mockPackage) {
        setPackageData(mockPackage);
        setError('Using mock data - API not available');
      } else {
        setError('Package not found');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (error && !packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/home">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Package not found</h1>
          <p className="text-gray-600 mb-8">The package you're looking for doesn't exist.</p>
          <Link to="/home">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link to="/home" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/home" className="hover:text-blue-600">Packages</Link></li>
            <li>/</li>
            <li className="text-gray-900">{packageData.packageName}</li>
          </ol>
        </nav>

        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="text-yellow-400">⚠️</div>
              <div className="ml-3">
                <p className="text-yellow-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Package Info */}
          <div>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {packageData.categoryName && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mr-4">
                    {packageData.categoryName}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  packageData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {packageData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {packageData.packageName}
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {packageData.description}
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Comprehensive learning materials</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Interactive exercises and quizzes</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Progress tracking and analytics</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Mobile and desktop access</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">24/7 customer support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Purchase Card */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  ${packageData.price.toFixed(2)}
                </div>
                {packageData.durationDays && (
                  <div className="text-gray-600">
                    {packageData.durationDays} days access
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Package Price</span>
                  <span className="font-medium">${packageData.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">${packageData.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <AddToCartButton 
                  packageId={packageData.packageID} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                />
                
                <Link to="/cart" className="block">
                  <Button variant="outline" className="w-full">
                    View Cart
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  🔒 Secure payment • 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Packages */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((id) => (
              <div key={id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Related Package {id}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Description of related package...
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-600">$29.99</span>
                  <Link to={`/package/${id}`}>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;
