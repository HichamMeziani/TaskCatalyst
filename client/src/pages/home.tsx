import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Target, Brain, PlayCircle, CheckCircle, Flame } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/onboarding");
  };

  const handleLearnMore = () => {
    // Scroll to features section or show demo
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b sophisticated-border glass-morphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 fade-in">
              <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-primary-foreground floating-animation" />
              </div>
              <a href="/" className="text-2xl font-display font-bold gradient-text text-shadow hover:opacity-80 transition-opacity">
                TaskCatalyst
              </a>
            </div>
            <div className="flex items-center space-x-4 fade-in">
              <Button variant="ghost" onClick={() => window.location.href = "/api/login"} className="font-medium">
                Sign In
              </Button>
              <Button onClick={() => window.location.href = "/api/login"} className="font-semibold shadow-lg card-hover">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 slide-up text-shadow">
            Turn <span className="gradient-text">Overwhelming Tasks</span><br />
            Into Unstoppable Momentum
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed slide-up font-light">
            Our AI instantly generates micro-tasks that eliminate startup friction. 
            Complete one tiny catalyst, and watch the <em className="font-display italic">Zeigarnik Effect</em> propel you to finish everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center slide-up">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-8 py-4 text-lg font-semibold shadow-2xl card-hover premium-gradient text-primary-foreground"
            >
              Get Things Done
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleLearnMore}
              className="px-8 py-4 text-lg font-medium sophisticated-border card-hover"
            >
              See How It Works
            </Button>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="mt-24 max-w-5xl mx-auto slide-up">
          <Card className="sophisticated-border glass-morphism p-8 shadow-2xl card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-4 h-4 bg-red-500 rounded-full pulse-slow"></div>
              <div className="w-4 h-4 bg-amber-500 rounded-full pulse-slow"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full pulse-slow"></div>
              <span className="ml-4 font-mono text-sm text-muted-foreground">TaskCatalyst Demo</span>
            </div>
            <div className="space-y-6">
              <div className="border sophisticated-border rounded-lg p-6 bg-muted/10">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Your Task: "Write Annual Report"</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">Status: Not Started • Priority: High • Due: Next Week</p>
              </div>
              
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-primary floating-animation" />
                  <span className="font-medium">AI Processing...</span>
                </div>
              </div>
              
              <div className="border sophisticated-border rounded-lg p-6 premium-gradient bg-primary/5">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">AI Catalyst Generated</h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">5 min</span>
                </div>
                <p className="text-sm mb-4">
                  "Open your laptop and create a new document titled 'Annual Report 2024'. Just type the title and save it - nothing more."
                </p>
                <Button size="sm" className="premium-gradient text-primary-foreground">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start This Micro-Task
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-muted/20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold mb-6">
              Why TaskCatalyst <span className="gradient-text">Actually Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Based on proven psychology, powered by cutting-edge AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 sophisticated-border glass-morphism card-hover">
              <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-4">Zeigarnik Effect Psychology</h3>
              <p className="text-muted-foreground">
                Once you start something, your brain obsesses over finishing it. We create that crucial first spark.
              </p>
            </Card>

            <Card className="p-8 sophisticated-border glass-morphism card-hover">
              <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-4">AI-Powered Catalysts</h3>
              <p className="text-muted-foreground">
                Our AI breaks down overwhelming tasks into tiny, actionable micro-steps that eliminate startup friction.
              </p>
            </Card>

            <Card className="p-8 sophisticated-border glass-morphism card-hover">
              <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center mb-6">
                <Flame className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-4">Unstoppable Momentum</h3>
              <p className="text-muted-foreground">
                Complete one micro-task and feel the psychological pull to keep going. Turn procrastination into progress.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Get Things <span className="gradient-text">Done?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of people who've turned their overwhelming task lists into completed achievements.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="px-8 py-4 text-lg font-semibold shadow-2xl card-hover premium-gradient text-primary-foreground"
          >
            Get Things Done
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t sophisticated-border py-12 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">TaskCatalyst</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 TaskCatalyst. Turn overwhelming tasks into unstoppable momentum.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}