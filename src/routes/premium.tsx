import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Crown,
  CheckCircle2,
  X,
  Heart,
  ArrowLeft,
  TrendingUp,
  Target,
  Shield,
  ExternalLink,
  Loader2,
  Info
} from "lucide-react";

export const Route = createFileRoute("/premium")({
  component: PremiumPage,
});

function PremiumPage() {
  // PayPal payment link for premium subscription
  const PAYPAL_PAYMENT_LINK = "https://www.paypal.com/ncp/payment/CHR7G5ZC2M6YY";

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleUpgrade = () => {
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckout = () => {
    setIsRedirecting(true);
    // Open PayPal checkout in a new tab for better UX
    window.open(PAYPAL_PAYMENT_LINK, "_blank", "noopener,noreferrer");
    // Reset state after a delay
    setTimeout(() => {
      setIsRedirecting(false);
      setShowCheckoutModal(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <h1 className="font-bold text-lg">Together</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full mb-4">
            <Crown className="h-5 w-5" />
            <span className="font-semibold">Premium Membership</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Upgrade Your Financial Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock powerful tools to manage money together, achieve goals faster, and build a stronger financial future as a couple
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-2xl mx-auto mb-12 border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl">
              <span className="text-5xl font-bold">$4.99</span>
              <span className="text-xl text-muted-foreground">/month</span>
            </CardTitle>
            <CardDescription className="text-base">
              Cancel anytime • No hidden fees • Secure payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              variant={null}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-lg py-6"
              onClick={handleUpgrade}
              aria-label="Subscribe to premium membership"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Premium
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Billed monthly at $4.99. Cancel anytime.
            </p>
          </CardContent>
        </Card>

        {/* Feature Comparison */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">What You'll Get</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan - Now on LEFT */}
            <Card className="border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Free Plan</CardTitle>
                  <Badge variant="outline">$0/mo</Badge>
                </div>
                <CardDescription>Limited features to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Basic Expense Tracking</p>
                      <p className="text-sm text-muted-foreground">Manual transaction entry only</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">1 Shared Wallet</p>
                      <p className="text-sm text-muted-foreground">Single wallet limit</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">1 Savings Goal</p>
                      <p className="text-sm text-muted-foreground">Only one goal at a time</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">3 Monthly Budgets</p>
                      <p className="text-sm text-muted-foreground">Limited to 3 categories</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-start gap-3 opacity-50">
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Unlimited Budgets & Goals</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-50">
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Smart Expense Splitting</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-50">
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Bill Tracking & Reminders</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-50">
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Financial Health Score</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-50">
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Monthly Reports & Analytics</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-50">
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Priority Support</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan - Now on RIGHT */}
            <Card className="border-2 border-orange-300 bg-gradient-to-br from-white to-orange-50 relative">
              <div className="absolute -top-3 right-4">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1">
                  MOST POPULAR
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-orange-500" />
                    Premium Plan
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    $4.99/mo
                  </Badge>
                </div>
                <CardDescription>Everything you need + unlimited features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Everything in Free, plus:</p>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Unlimited Monthly Budgets</p>
                      <p className="text-sm text-muted-foreground">Track spending across all categories</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Unlimited Savings Goals</p>
                      <p className="text-sm text-muted-foreground">Save for multiple dreams at once</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Smart Expense Splitting</p>
                      <p className="text-sm text-muted-foreground">50/50, income-based, custom, or "on me"</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Bill Tracking & Reminders</p>
                      <p className="text-sm text-muted-foreground">Never miss a payment</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Financial Health Score</p>
                      <p className="text-sm text-muted-foreground">Track your couple's wellness</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Monthly Couple Reports</p>
                      <p className="text-sm text-muted-foreground">Detailed insights & trends</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Advanced Analytics</p>
                      <p className="text-sm text-muted-foreground">Category breakdowns & patterns</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Smart Notifications</p>
                      <p className="text-sm text-muted-foreground">Alerts for spending & milestones</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Priority Support</p>
                      <p className="text-sm text-muted-foreground">Get help when you need it</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">All Future Features</p>
                      <p className="text-sm text-muted-foreground">Early access to new releases</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button
                  size="lg"
                  variant={null}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                  onClick={handleUpgrade}
                  aria-label="Upgrade to premium now"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Couples Love Premium</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-pink-500 mb-3" />
                <CardTitle>Build Better Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Smart budgets and insights help you spend wisely and save more together
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-purple-500 mb-3" />
                <CardTitle>Achieve Goals Faster</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track multiple goals and celebrate milestones as you build your future
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-red-500 mb-3" />
                <CardTitle>Reduce Money Stress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fair expense splitting and bill reminders mean less arguing, more harmony
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ / Trust Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Shield className="h-6 w-6 text-blue-500" />
              Your Financial Data is Safe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Bank-Level Security</h4>
                <p className="text-muted-foreground">
                  Your data is encrypted and protected with industry-standard security measures
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cancel Anytime</h4>
                <p className="text-muted-foreground">
                  No contracts or commitments. Cancel your subscription anytime with one click
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Privacy First</h4>
                <p className="text-muted-foreground">
                  We never sell your data. Your financial information stays between you and your partner
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Money-Back Guarantee</h4>
                <p className="text-muted-foreground">
                  Not satisfied? Get a full refund within the first 30 days, no questions asked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant={null}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-lg px-12 py-6"
            onClick={handleUpgrade}
            aria-label="Upgrade to premium membership now"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Premium Now
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Join hundreds of couples managing money better together
          </p>
        </div>
      </div>

      {/* Stripe Checkout Confirmation Modal */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-orange-500" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              You're about to start your premium subscription
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Premium Membership</span>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                  Monthly
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$4.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Secure payment via PayPal</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You'll be redirected to PayPal's secure checkout page to complete your subscription.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              size="lg"
              variant={null}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
              onClick={handleConfirmCheckout}
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting to PayPal...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue to PayPal
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowCheckoutModal(false)}
              disabled={isRedirecting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
