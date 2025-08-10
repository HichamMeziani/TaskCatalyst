import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Target, Brain, PlayCircle, CheckCircle, Flame } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const handleAuth = () => {
    window.location.href = "/api/login";
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
              <span className="text-2xl font-display font-bold gradient-text text-shadow">
                TaskCatalyst
              </span>
            </div>
            <div className="flex items-center space-x-4 fade-in">
              <Button variant="ghost" onClick={handleAuth} className="font-medium">
                Sign In
              </Button>
              <Button onClick={handleAuth} className="font-semibold shadow-lg card-hover">
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
              onClick={handleAuth}
              className="px-8 py-4 text-lg font-semibold shadow-2xl card-hover premium-gradient text-primary-foreground"
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
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
              {/* Example Task */}
              <div className="sophisticated-border rounded-xl p-6 bg-background/50">
                <div className="flex items-center space-x-4">
                  <input type="checkbox" className="w-6 h-6 text-primary rounded-md" />
                  <span className="font-display text-lg font-semibold">Write quarterly marketing report</span>
                  <span className="text-sm bg-muted px-3 py-1 rounded-full text-muted-foreground font-mono">
                    Large Task
                  </span>
                </div>
                {/* AI Catalyst */}
                <div className="ml-10 mt-4 p-4 catalyst-glow rounded-xl bg-background/80 border-l-4 border-primary">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-primary floating-animation" />
                    <span className="font-display text-base font-semibold text-primary">AI Catalyst</span>
                  </div>
                  <p className="text-base mt-2 font-medium">Open a blank document and write just the report title and today's date</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-muted-foreground font-mono">⏱️ Under 5 minutes</span>
                    <span className="text-sm text-primary font-medium">✨ Complete to unlock main task</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 slide-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-shadow">
            Psychology-Driven Productivity
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            TaskCatalyst leverages the <em className="font-display italic">Zeigarnik Effect</em> and proven psychological principles 
            to turn your brain's resistance into unstoppable momentum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="sophisticated-border p-8 text-center card-hover glass-morphism slide-up">
            <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Brain className="w-8 h-8 text-primary-foreground floating-animation" />
            </div>
            <h3 className="text-xl font-display font-bold mb-3 text-shadow">Zeigarnik Effect</h3>
            <p className="text-muted-foreground leading-relaxed">
              Incomplete tasks create productive mental tension that enhances memory and motivation
            </p>
          </Card>

          <Card className="sophisticated-border p-8 text-center card-hover glass-morphism slide-up">
            <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Target className="w-8 h-8 text-primary-foreground floating-animation" />
            </div>
            <h3 className="text-xl font-display font-bold mb-3 text-shadow">AI Catalysts</h3>
            <p className="text-muted-foreground leading-relaxed">
              Micro-tasks designed to overcome initial resistance and create immediate progress
            </p>
          </Card>

          <Card className="sophisticated-border p-8 text-center card-hover glass-morphism slide-up">
            <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <PlayCircle className="w-8 h-8 text-primary-foreground floating-animation" />
            </div>
            <h3 className="text-xl font-display font-bold mb-3 text-shadow">Momentum Building</h3>
            <p className="text-muted-foreground leading-relaxed">
              Small wins compound into major achievements through sustained psychological momentum
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="glass-morphism py-24 border-t sophisticated-border">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-shadow slide-up">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 font-light leading-relaxed slide-up">
            Join thousands of users who have overcome procrastination with AI-powered catalysts.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12 mb-12 slide-up">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-lg">73%</div>
                <div className="text-sm text-muted-foreground font-mono">task initiation rate</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-lg">89%</div>
                <div className="text-sm text-muted-foreground font-mono">catalyst success</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-lg">68%</div>
                <div className="text-sm text-muted-foreground font-mono">completion rate</div>
              </div>
            </div>
          </div>
          <Button 
            size="lg" 
            onClick={handleAuth}
            className="px-12 py-6 text-xl font-display font-bold shadow-2xl card-hover premium-gradient text-primary-foreground slide-up"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
