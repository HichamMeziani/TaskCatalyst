import { useEffect, useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, LogOut, User, Check, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import PricingCard from "@/components/PricingCard";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "You are now subscribed to TaskCatalyst Pro!",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : "Complete Upgrade - $9/month"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handlePlanSelection = async (plan: string) => {
    if (plan === "free") {
      toast({
        title: "Already on Free Plan",
        description: "You're currently using the free tier.",
      });
      return;
    }

    if (plan === "enterprise") {
      toast({
        title: "Contact Sales",
        description: "Please contact our sales team for enterprise pricing.",
      });
      return;
    }

    setSelectedPlan(plan);
    // Check if Stripe is available
    if (!stripePromise) {
      toast({
        title: "Payment Not Available",
        description: "Payment processing is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSubscription(true);

    try {
      const response = await apiRequest("POST", "/api/get-or-create-subscription");
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // If we have a client secret, show the payment form
  if (clientSecret && selectedPlan) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Top Navigation */}
        <nav className="border-b border-border bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">TaskCatalyst</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Payment Form */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Complete Your Upgrade</h1>
            <p className="text-muted-foreground">
              You're upgrading to TaskCatalyst Professional
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="bg-background rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Professional Plan</span>
                  <span className="font-bold">$9/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Unlimited AI catalysts + advanced features
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <h3 className="font-medium">Included features:</h3>
                <ul className="space-y-2">
                  {[
                    "Unlimited AI catalysts",
                    "Advanced analytics",
                    "Custom catalyst preferences",
                    "Priority support",
                    "Export capabilities",
                    "Team collaboration"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="w-4 h-4 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>Secured by Stripe SSL encryption</span>
              </div>
            </Card>

            {/* Payment Form */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              
              {isCreatingSubscription ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  <span className="ml-3">Setting up your subscription...</span>
                </div>
              ) : stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Payment processing is not configured. Please contact support.
                  </p>
                  <Link href="/">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show pricing plans selection
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">TaskCatalyst</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground">Unlock the full power of AI-driven productivity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <PricingCard
            title="Starter"
            price="Free"
            description="Perfect for getting started with AI catalysts"
            features={[
              "10 AI catalysts per day",
              "Basic task management",
              "Mobile app access",
              "Community support"
            ]}
            buttonText={user.subscriptionStatus === "free" ? "Current Plan" : "Downgrade"}
            onSelect={() => handlePlanSelection("free")}
          />

          {/* Pro Tier */}
          <PricingCard
            title="Professional"
            price="$9"
            description="Unlimited productivity with advanced features"
            features={[
              "Unlimited AI catalysts",
              "Advanced analytics",
              "Custom catalyst preferences",
              "Priority support",
              "Export capabilities",
              "Team collaboration"
            ]}
            isPopular={true}
            buttonText={user.subscriptionStatus === "active" ? "Current Plan" : "Upgrade Now"}
            onSelect={() => handlePlanSelection("pro")}
          />

          {/* Enterprise Tier */}
          <PricingCard
            title="Enterprise"
            price="$19"
            description="Full-scale productivity for teams and organizations"
            features={[
              "Everything in Professional",
              "Team collaboration",
              "API access",
              "White-label options",
              "Custom integrations",
              "Dedicated support"
            ]}
            buttonText="Contact Sales"
            onSelect={() => handlePlanSelection("enterprise")}
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What is the Zeigarnik Effect?</h3>
              <p className="text-muted-foreground">
                The Zeigarnik Effect is a psychological phenomenon where incomplete tasks create productive mental tension 
                that enhances memory and motivation, helping you stay focused until completion.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How do AI catalysts work?</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your task and generates a micro-task (under 5 minutes) designed to overcome initial 
                resistance and create momentum. Once you complete the catalyst, you'll find it much easier to continue.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue to have access to Pro features 
                until the end of your billing period.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
