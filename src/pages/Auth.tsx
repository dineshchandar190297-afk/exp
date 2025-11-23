import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import spaceBackground from "@/assets/space-background.png";
import StarCursor from "@/components/StarCursor";
import Logo from "@/components/Logo";

export default function Auth() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // SIGN UP
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created! Please check your email.");
          setIsSignUp(false);
          resetFields();
        }
      } else {
        // SIGN IN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Signed in successfully");
          navigate("/simulator");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <StarCursor />
      <Logo />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <main className="relative flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md bg-card/95 border-primary/30 shadow-xl">
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-2 text-center glow-text">
              {isSignUp ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              {isSignUp
                ? "Join Quantum Web to explore quantum circuits."
                : "Sign in to continue your quantum simulations."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md bg-background border border-primary/30 px-3 py-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-md bg-background border border-primary/30 px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-md bg-background border border-primary/30 px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-md bg-background border border-primary/30 px-3 py-2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading
                  ? isSignUp
                    ? "Creating Account..."
                    : "Signing In..."
                  : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "New user?"}{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  setIsSignUp((prev) => !prev);
                  resetFields();
                }}
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
