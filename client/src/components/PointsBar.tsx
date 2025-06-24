
import { Star, Gift, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PointsBarProps {
  points: number;
  username: string;
  onLogout: () => void;
  onRewardsClick: () => void;
}

const PointsBar = ({ points, username, onLogout, onRewardsClick }: PointsBarProps) => {
  return (
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="bg-black rounded-full p-2">
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <span className="font-semibold">{points.toLocaleString()} Points</span>
          </div>
          <div className="hidden md:block text-sm opacity-80">
            Welcome back, {username}!
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={onRewardsClick}
            variant="ghost"
            size="sm"
            className="text-black hover:bg-black hover:text-yellow-500 transition-colors"
          >
            <Gift className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Redeem Rewards</span>
          </Button>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="text-black hover:bg-black hover:text-yellow-500 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PointsBar;
