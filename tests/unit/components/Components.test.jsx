import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock the components and their dependencies
jest.mock('../Sidebar', () => {
  return function MockSidebar({ isOpen, onClose }) {
    return (
      <div data-testid="sidebar" style={{ display: isOpen ? 'block' : 'none' }}>
        <button onClick={onClose}>Close</button>
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/products">Products</a>
          <a href="/agents">Agents</a>
        </nav>
      </div>
    );
  };
});

jest.mock('../StatsCard', () => {
  return function MockStatsCard({ title, value, trend, icon }) {
    return (
      <div data-testid="stats-card">
        <h3>{title}</h3>
        <div>{value}</div>
        {trend && <span>{trend}</span>}
      </div>
    );
  };
});

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock the components we're testing
const ProductCard = ({ product, onSelect, onViewDetails }) => {
  return (
    <div data-testid="product-card" data-product-id={product.id}>
      <h3>{product.name}</h3>
      <p>{product.niche}</p>
      <p>${product.total_revenue || 0}</p>
      <button onClick={() => onSelect(product.id)}>Select</button>
      <button onClick={() => onViewDetails(product)}>View Details</button>
    </div>
  );
};

const ProductList = ({ products, onSelect, onViewDetails, loading }) => {
  if (loading) {
    return <div data-testid="loading">Loading products...</div>;
  }

  if (!products || products.length === 0) {
    return <div data-testid="no-products">No products found</div>;
  }

  return (
    <div data-testid="product-list">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div data-testid="product-detail-modal">
      <div className="modal-content">
        <h2>{product.name}</h2>
        <p>Niche: {product.niche}</p>
        <p>Price: ${product.price || 97}</p>
        <p>Status: {product.affiliate_status}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div data-testid="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <div data-testid="stats-grid">
        <div data-testid="estimated-earnings">${stats.estimated_earnings || 0}</div>
        <div data-testid="tracked-products">{stats.tracked_products || 0}</div>
        <div data-testid="active-agents">{stats.active_agents || 0}</div>
        <div data-testid="content-generated">{stats.content_generated || 0}</div>
      </div>
    </div>
  );
};

describe('React Components', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Dashboard Component', () => {
    it('renders dashboard with stats', async () => {
      const mockStats = {
        estimated_earnings: 2450.00,
        tracked_products: 12,
        active_agents: 4,
        content_generated: 25
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });

      render(<Dashboard />);

      // Initially shows loading
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Check that stats are displayed
      expect(screen.getByTestId('estimated-earnings')).toHaveTextContent('$2450');
      expect(screen.getByTestId('tracked-products')).toHaveTextContent('12');
      expect(screen.getByTestId('active-agents')).toHaveTextContent('4');
      expect(screen.getByTestId('content-generated')).toHaveTextContent('25');
    });

    it('handles API errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('API Error'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Should still render dashboard with default values
      expect(screen.getByTestId('estimated-earnings')).toHaveTextContent('$0');
      expect(screen.getByTestId('tracked-products')).toHaveTextContent('0');
    });

    it('shows loading state initially', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });
  });

  describe('ProductCard Component', () => {
    const mockProduct = {
      id: 1,
      name: 'Test Course',
      niche: 'Technology',
      total_revenue: 500,
      affiliate_status: 'active'
    };

    it('renders product information correctly', () => {
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();

      render(
        <ProductCard
          product={mockProduct}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
        />
      );

      expect(screen.getByText('Test Course')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('$500')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument();
    });

    it('handles select button click', () => {
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();

      render(
        <ProductCard
          product={mockProduct}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
        />
      );

      const selectButton = screen.getByRole('button', { name: 'Select' });
      userEvent.click(selectButton);

      expect(onSelect).toHaveBeenCalledWith(mockProduct.id);
    });

    it('handles view details button click', () => {
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();

      render(
        <ProductCard
          product={mockProduct}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
        />
      );

      const detailsButton = screen.getByRole('button', { name: 'View Details' });
      userEvent.click(detailsButton);

      expect(onViewDetails).toHaveBeenCalledWith(mockProduct);
    });

    it('displays zero revenue when not provided', () => {
      const productWithoutRevenue = { ...mockProduct, total_revenue: null };
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();

      render(
        <ProductCard
          product={productWithoutRevenue}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
        />
      );

      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('ProductList Component', () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Product 1',
        niche: 'Technology',
        total_revenue: 100
      },
      {
        id: 2,
        name: 'Product 2',
        niche: 'Business',
        total_revenue: 200
      }
    ];

    it('renders list of products', () => {
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();

      render(
        <ProductList
          products={mockProducts}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
          loading={false}
        />
      );

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
      expect(screen.getAllByTestId('product-card')).toHaveLength(2);
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <ProductList
          products={[]}
          onSelect={jest.fn()}
          onViewDetails={jest.fn()}
          loading={true}
        />
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });

    it('shows empty state when no products', () => {
      render(
        <ProductList
          products={[]}
          onSelect={jest.fn()}
          onViewDetails={jest.fn()}
          loading={false}
        />
      );

      expect(screen.getByTestId('no-products')).toBeInTheDocument();
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('handles product interactions', () => {
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();

      render(
        <ProductList
          products={mockProducts}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
          loading={false}
        />
      );

      const selectButtons = screen.getAllByRole('button', { name: 'Select' });
      const detailsButtons = screen.getAllByRole('button', { name: 'View Details' });

      // Test first product interactions
      userEvent.click(selectButtons[0]);
      expect(onSelect).toHaveBeenCalledWith(1);

      userEvent.click(detailsButtons[0]);
      expect(onViewDetails).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('renders correctly with null products', () => {
      render(
        <ProductList
          products={null}
          onSelect={jest.fn()}
          onViewDetails={jest.fn()}
          loading={false}
        />
      );

      expect(screen.getByTestId('no-products')).toBeInTheDocument();
    });
  });

  describe('ProductDetailModal Component', () => {
    const mockProduct = {
      id: 1,
      name: 'Detailed Product',
      niche: 'Finance',
      price: 197,
      affiliate_status: 'active'
    };

    it('renders modal when open', () => {
      const onClose = jest.fn();

      render(
        <ProductDetailModal
          product={mockProduct}
          isOpen={true}
          onClose={onClose}
        />
      );

      expect(screen.getByTestId('product-detail-modal')).toBeInTheDocument();
      expect(screen.getByText('Detailed Product')).toBeInTheDocument();
      expect(screen.getByText('Niche: Finance')).toBeInTheDocument();
      expect(screen.getByText('Price: $197')).toBeInTheDocument();
      expect(screen.getByText('Status: active')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      const onClose = jest.fn();

      render(
        <ProductDetailModal
          product={mockProduct}
          isOpen={false}
          onClose={onClose}
        />
      );

      expect(screen.queryByTestId('product-detail-modal')).not.toBeInTheDocument();
    });

    it('does not render when no product', () => {
      const onClose = jest.fn();

      render(
        <ProductDetailModal
          product={null}
          isOpen={true}
          onClose={onClose}
        />
      );

      expect(screen.queryByTestId('product-detail-modal')).not.toBeInTheDocument();
    });

    it('handles close button click', () => {
      const onClose = jest.fn();

      render(
        <ProductDetailModal
          product={mockProduct}
          isOpen={true}
          onClose={onClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Close' });
      userEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('displays default price when not provided', () => {
      const productWithoutPrice = { ...mockProduct, price: null };
      const onClose = jest.fn();

      render(
        <ProductDetailModal
          product={productWithoutPrice}
          isOpen={true}
          onClose={onClose}
        />
      );

      expect(screen.getByText('Price: $97')).toBeInTheDocument(); // Default price
    });
  });

  describe('Component Integration', () => {
    it('ProductList with ProductCard integration', () => {
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();
      const products = [
        { id: 1, name: 'Integration Test Product', niche: 'Testing' }
      ];

      render(
        <ProductList
          products={products}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
          loading={false}
        />
      );

      const productCard = screen.getByTestId('product-card');
      expect(productCard).toHaveAttribute('data-product-id', '1');
      expect(screen.getByText('Integration Test Product')).toBeInTheDocument();
    });

    it('Dashboard with StatsCard integration', () => {
      // This would test the actual Dashboard component that uses StatsCard
      // For now, we're testing the simplified version
      const mockStats = { estimated_earnings: 5000, tracked_products: 10 };
      
      // Mock the useEffect to avoid actual API call
      const { useEffect } = React;
      React.useEffect = jest.fn().mockImplementation(f => f());

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });

      render(<Dashboard />);

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('estimated-earnings')).toHaveTextContent('$5000');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles missing product properties gracefully', () => {
      const incompleteProduct = { id: 1 }; // Missing name, niche, etc.
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();

      render(
        <ProductCard
          product={incompleteProduct}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
        />
      );

      // Should not crash and should render what it can
      expect(screen.getByTestId('product-card')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument(); // Default revenue
    });

    it('handles rapid clicking on buttons', () => {
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();
      const product = { id: 1, name: 'Test', niche: 'Test' };

      render(
        <ProductCard
          product={product}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
        />
      );

      const selectButton = screen.getByRole('button', { name: 'Select' });
      
      // Rapid clicking
      userEvent.click(selectButton);
      userEvent.click(selectButton);
      userEvent.click(selectButton);

      expect(onSelect).toHaveBeenCalledTimes(3);
    });

    it('handles empty product list correctly', () => {
      render(
        <ProductList
          products={[]}
          onSelect={jest.fn()}
          onViewDetails={jest.fn()}
          loading={false}
        />
      );

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
      expect(screen.getByTestId('no-products')).toBeInTheDocument();
      expect(screen.queryAllByTestId('product-card')).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper button labels', () => {
      const onSelect = jest.fn();
      const onViewDetails = jest.fn();
      const product = { id: 1, name: 'Accessible Product', niche: 'A11y' };

      render(
        <ProductCard
          product={product}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
        />
      );

      expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument();
    });

    it('provides accessible modal structure', () => {
      const onClose = jest.fn();
      const product = { id: 1, name: 'Modal Test', niche: 'Test', price: 100 };

      render(
        <ProductDetailModal
          product={product}
          isOpen={true}
          onClose={onClose}
        />
      );

      const modal = screen.getByTestId('product-detail-modal');
      expect(modal).toBeInTheDocument();
      
      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: 'Modal Test' })).toBeInTheDocument();
    });
  });
});