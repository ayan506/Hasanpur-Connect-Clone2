import { useState } from "react";
import { Link } from "wouter";
import { useForgotPassword, useResetPassword } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMetaTags } from "@/hooks/use-meta-tags";
import { Mail, KeyRound, CheckCircle, ArrowLeft, Eye, EyeOff, RefreshCw } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useMetaTags({
    title: "Forgot Password — Hasanpur Connect",
    description: "Reset your business owner account password using a one-time code.",
  });

  const forgotMutation = useForgotPassword({
    onSuccess: (data: any) => {
      if (data?.devOtp) setDevOtp(data.devOtp);
      toast({ title: "OTP sent!", description: "Check your email for a 6-digit code." });
      setStep("otp");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.data?.error || "Could not send OTP.", variant: "destructive" });
    },
  });

  const resetMutation = useResetPassword({
    onSuccess: () => {
      setStep("done");
      toast({ title: "Password reset!", description: "You can now log in with your new password." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.data?.error || "Invalid or expired OTP.", variant: "destructive" });
    },
  });

  const handleResend = () => {
    setDevOtp(null);
    forgotMutation.mutate({ email });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    resetMutation.mutate({ email, token: otp, password: newPassword });
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {step === "email" && "Enter your email to receive a 6-digit OTP"}
              {step === "otp" && `Enter the 6-digit code sent to ${email}`}
              {step === "done" && "Your password has been reset successfully"}
            </p>
          </div>

          {step === "done" ? (
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <p className="font-medium">Password reset successful!</p>
                <p className="text-sm text-muted-foreground">You can now log in with your new password.</p>
                <Link href="/login">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </CardContent>
            </Card>
          ) : step === "email" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Enter your email
                </CardTitle>
                <CardDescription>We'll send a one-time code to reset your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={e => { e.preventDefault(); forgotMutation.mutate({ email }); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={forgotMutation.isPending}>
                    {forgotMutation.isPending ? "Sending OTP…" : "Send OTP"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Enter OTP &amp; New Password
                </CardTitle>
                <CardDescription>Check your email for a 6-digit code</CardDescription>
              </CardHeader>
              <CardContent>
                {devOtp && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <strong>⚠️ Email not configured (test mode)</strong>
                    <p className="mt-1 text-xs">Your OTP for testing:</p>
                    <p className="font-mono text-2xl font-bold tracking-widest text-center py-2">{devOtp}</p>
                  </div>
                )}
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">6-Digit OTP</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      inputMode="numeric"
                      maxLength={6}
                      className="text-center text-2xl font-bold tracking-widest"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newpass">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newpass"
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        minLength={8}
                        required
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmpass">Confirm Password</Label>
                    <Input
                      id="confirmpass"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={resetMutation.isPending || otp.length !== 6}>
                    {resetMutation.isPending ? "Resetting…" : "Reset Password"}
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={() => setStep("email")} className="text-muted-foreground hover:text-foreground">
                      ← Change email
                    </button>
                    <button type="button" onClick={handleResend} disabled={forgotMutation.isPending} className="text-primary hover:underline flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Resend OTP
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
