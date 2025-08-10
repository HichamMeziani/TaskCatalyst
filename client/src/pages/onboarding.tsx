import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Zap, Target, Heart, BookOpen, Palette, Gamepad2, UtensilsCrossed, Plane, Trees, Users, GraduationCap, Briefcase, Dumbbell, Camera, Wrench, Brain, DollarSign } from "lucide-react";
import type { OnboardingData } from "@shared/schema";

const INTERESTS_OPTIONS = [
  { id: "fitness-sports", label: "Fitness & Sports", icon: Dumbbell },
  { id: "reading-writing", label: "Reading & Writing", icon: BookOpen },
  { id: "music-arts", label: "Music & Arts", icon: Palette },
  { id: "technology-gaming", label: "Technology & Gaming", icon: Gamepad2 },
  { id: "cooking-food", label: "Cooking & Food", icon: UtensilsCrossed },
  { id: "travel-adventure", label: "Travel & Adventure", icon: Plane },
  { id: "nature-outdoors", label: "Nature & Outdoors", icon: Trees },
  { id: "social-networking", label: "Social & Networking", icon: Users },
  { id: "learning-education", label: "Learning & Education", icon: GraduationCap },
  { id: "business-entrepreneurship", label: "Business & Entrepreneurship", icon: Briefcase },
  { id: "health-wellness", label: "Health & Wellness", icon: Heart },
  { id: "photography-video", label: "Photography & Video", icon: Camera },
  { id: "diy-crafts", label: "DIY & Crafts", icon: Wrench },
  { id: "meditation-mindfulness", label: "Meditation & Mindfulness", icon: Brain },
  { id: "finance-investment", label: "Finance & Investment", icon: DollarSign },
];

const LIFE_GOAL_SUGGESTIONS = [
  "Start my own business",
  "Get promoted at work",
  "Learn a new skill",
  "Improve my health and fitness",
  "Write a book",
  "Travel the world",
  "Build better relationships",
  "Achieve financial freedom",
  "Master a creative hobby",
  "Make a positive impact on others"
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({
    interests: [],
    lifeGoal: "",
    dailyFreeTime: 2,
    age: 25,
    gender: "prefer-not-to-say"
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const completeOnboardingMutation = useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      return apiRequest("POST", "/api/onboarding", onboardingData);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to TaskCatalyst!",
        description: "Your profile has been set up successfully.",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInterestToggle = (interestId: string) => {
    const currentInterests = data.interests || [];
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId];
    
    setData({ ...data, interests: newInterests });
  };

  const handleNext = () => {
    if (step === 1 && (!data.interests || data.interests.length < 3 || data.interests.length > 5)) {
      toast({
        title: "Please select 3-5 interests",
        description: "Choose between 3 and 5 interests that best describe you.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !data.lifeGoal?.trim()) {
      toast({
        title: "Please enter your life goal",
        description: "Tell us what you want to achieve.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      completeOnboardingMutation.mutate(data as OnboardingData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold mb-4">What are you passionate about?</h2>
              <p className="text-muted-foreground">Select 3-5 interests that best describe you</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTERESTS_OPTIONS.map((interest) => {
                const Icon = interest.icon;
                const isSelected = data.interests?.includes(interest.id) || false;
                return (
                  <Card
                    key={interest.id}
                    className={`p-4 cursor-pointer card-hover sophisticated-border ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    <div className="text-center space-y-2">
                      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${
                        isSelected ? "premium-gradient text-primary-foreground" : "bg-muted"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">{interest.label}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Selected: {data.interests?.length || 0}/5
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold mb-4">What's your main life goal?</h2>
              <p className="text-muted-foreground">Tell us what you want to achieve</p>
            </div>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your main life goal..."
                value={data.lifeGoal || ""}
                onChange={(e) => setData({ ...data, lifeGoal: e.target.value })}
                className="min-h-[120px] sophisticated-border"
                maxLength={200}
              />
              <div className="text-right text-sm text-muted-foreground">
                {data.lifeGoal?.length || 0}/200
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Suggestions:</Label>
                <div className="flex flex-wrap gap-2">
                  {LIFE_GOAL_SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setData({ ...data, lifeGoal: suggestion })}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold mb-4">How much free time do you have daily?</h2>
              <p className="text-muted-foreground">This helps us suggest the right size tasks</p>
            </div>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-display font-bold premium-gradient bg-clip-text text-transparent">
                  {data.dailyFreeTime} hours
                </div>
              </div>
              <Slider
                value={[data.dailyFreeTime || 2]}
                onValueChange={(value) => setData({ ...data, dailyFreeTime: value[0] })}
                max={24}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0 hours</span>
                <span>12 hours</span>
                <span>24 hours</span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold mb-4">Tell us about yourself</h2>
              <p className="text-muted-foreground">Just a few more details to personalize your experience</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={data.age || ""}
                  onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || 0 })}
                  min={13}
                  max={120}
                  className="sophisticated-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={data.gender || "prefer-not-to-say"} 
                  onValueChange={(value: "male" | "female" | "non-binary" | "prefer-not-to-say" | "custom") => setData({ ...data, gender: value })}
                >
                  <SelectTrigger className="sophisticated-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
              <span className="text-2xl font-display font-bold gradient-text text-shadow">
                TaskCatalyst
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {step} of 4
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-muted/20">
        <div 
          className="h-2 premium-gradient transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 sophisticated-border glass-morphism">
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="sophisticated-border"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={completeOnboardingMutation.isPending}
              className="premium-gradient text-primary-foreground font-semibold"
            >
              {step === 4 ? (
                completeOnboardingMutation.isPending ? "Completing..." : "Complete Setup"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}