import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Reward {
  id: number;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  value: number;
  isActive: boolean;
}

interface Redemption {
  id: number;
  userId: number;
  rewardId: number;
  pointsUsed: number;
  redeemedAt: string;
  status: string;
}

interface RewardsProps {
  userId: number;
  userPoints: number;
  onBack: () => void;
  onPointsUpdate: (newPoints: number) => void;
}

const Rewards = ({ userId, userPoints, onBack, onPointsUpdate }: RewardsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available rewards
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['/api/rewards'],
    queryFn: () => apiRequest('/api/rewards')
  });

  // Fetch user redemptions
  const { data: redemptions = [] } = useQuery({
    queryKey: ['/api/redemptions', userId],
    queryFn: () => apiRequest(`/api/redemptions/${userId}`)
  });

  // Redeem reward mutation
  const redeemMutation = useMutation({
    mutationFn: async (reward: Reward) => {
      return apiRequest('/api/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          rewardId: reward.id,
          pointsUsed: reward.pointsCost
        })
      });
    },
    onSuccess: (data, reward) => {
      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${reward.title}`,
      });
      
      // Update user points
      const newPoints = userPoints - reward.pointsCost;
      onPointsUpdate(newPoints);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/redemptions', userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Unable to redeem reward. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleRedeem = (reward: Reward) => {
    if (userPoints < reward.pointsCost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.pointsCost - userPoints} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }
    
    redeemMutation.mutate(reward);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'bg-green-500';
      case 'voucher': return 'bg-blue-500';
      case 'cashback': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatValue = (category: string, value: number) => {
    switch (category) {
      case 'discount': return `${value}% OFF`;
      case 'voucher': return `₹${value} Voucher`;
      case 'cashback': return `₹${value} Cashback`;
      default: return `₹${value}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-black hover:bg-black hover:text-yellow-500 p-2"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6" />
              <span className="text-xl font-bold">{userPoints.toLocaleString()} Points</span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Rewards Store</h1>
            <p className="text-lg opacity-90">Redeem your points for amazing rewards</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Rewards Grid */}
        {rewardsLoading ? (
          <div className="text-center text-white">Loading rewards...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {rewards.map((reward: Reward) => (
              <Card key={reward.id} className="bg-gray-900 border-gray-700 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getCategoryColor(reward.category)} text-white`}>
                      {reward.category.toUpperCase()}
                    </Badge>
                    <div className="text-yellow-500 font-bold">
                      {formatValue(reward.category, reward.value)}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{reward.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {reward.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{reward.pointsCost} Points</span>
                    </div>
                    <Button
                      onClick={() => handleRedeem(reward)}
                      disabled={userPoints < reward.pointsCost || redeemMutation.isPending}
                      className={`${
                        userPoints >= reward.pointsCost
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {redeemMutation.isPending ? 'Redeeming...' : 'Redeem'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* My Redemptions */}
        {redemptions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
              My Redemptions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redemptions.map((redemption: Redemption & { reward?: Reward }) => {
                const reward = rewards.find((r: Reward) => r.id === redemption.rewardId);
                return (
                  <Card key={redemption.id} className="bg-gray-800 border-gray-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{reward?.title || 'Reward'}</h3>
                          <p className="text-sm text-gray-400">
                            Redeemed on {new Date(redemption.redeemedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-500 font-bold">
                            {reward && formatValue(reward.category, reward.value)}
                          </div>
                          <div className="text-sm text-gray-400">
                            -{redemption.pointsUsed} points
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* How to Earn Points */}
        <div className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Gift className="h-5 w-5 mr-2 text-yellow-500" />
            How to Earn Points
          </h3>
          <div className="text-gray-300 space-y-2">
            <p>• Earn 1 point for every 3 kilometers traveled when booking through Fairfare</p>
            <p>• Complete rides to accumulate distance and unlock more rewards</p>
            <p>• Check back regularly for new reward offers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;