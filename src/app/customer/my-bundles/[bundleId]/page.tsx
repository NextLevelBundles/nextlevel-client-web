import { DashboardShell } from '@/components/dashboard-shell';
import { BundleDetails } from './bundle-details';

// Mock data - replace with API call
const bundleDetails = {
  id: 1,
  name: 'Indie Gems Collection',
  purchaseDate: '2024-03-20',
  amount: 25.00,
  tier: 'Tier 2',
  itemCount: 5,
  transactionId: 'GD29281',
  paymentMethod: 'VISA •••• 1234',
  charity: {
    name: 'AbleGamers Foundation',
    amount: 5.00,
    badge: 'Believer'
  },
  games: [
    {
      id: 1,
      name: 'Pixel Dungeon',
      key: null,
      revealed: false,
      protonRating: 'Platinum',
      region: 'Global',
      systemRequirements: {
        minimum: {
          os: 'Windows 7',
          processor: 'Intel Core i3',
          memory: '4 GB RAM',
          graphics: 'Intel HD Graphics 4000',
          storage: '2 GB available space'
        }
      }
    },
    {
      id: 2,
      name: 'Space Explorer',
      key: 'XXXX-XXXX-XXXX',
      revealed: true,
      protonRating: 'Gold',
      region: 'Global',
      systemRequirements: {
        minimum: {
          os: 'Windows 10',
          processor: 'Intel Core i5',
          memory: '8 GB RAM',
          graphics: 'NVIDIA GTX 1060',
          storage: '10 GB available space'
        }
      }
    }
  ]
};

// Generate static params for all possible bundle IDs
export async function generateStaticParams() {
  // Since we're using mock data, we'll pre-generate pages for bundles 1-4
  return [
    { bundleId: '1' },
    { bundleId: '2' },
    { bundleId: '3' },
    { bundleId: '4' }
  ];
}

export default function BundlePurchaseDetailsPage() {
  return (
    <DashboardShell>
      <BundleDetails bundleDetails={bundleDetails} />
    </DashboardShell>
  );
}