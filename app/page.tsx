import { Button } from "@/components/ui/button"
import { KitaLogo } from "@/components/kita-logo"
import Link from "next/link"
import {
  Zap,
  Shield,
  Clock,
  Users,
  Bot,
  Wrench,
  Droplets,
  Paintbrush,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react"

const services = [
  { name: "Electrician", icon: Zap, color: "bg-yellow-50 text-yellow-600" },
  { name: "Plumber", icon: Droplets, color: "bg-blue-50 text-blue-600" },
  { name: "Painter", icon: Paintbrush, color: "bg-purple-50 text-purple-600" },
  { name: "Handyman", icon: Wrench, color: "bg-orange-50 text-orange-600" },
  { name: "Cleaning", icon: Sparkles, color: "bg-green-50 text-green-600" },
  { name: "And more", icon: ArrowRight, color: "bg-muted text-muted-foreground" },
]

const steps = [
  { step: "1", title: "Describe your problem", desc: "Tell Denki what you need, by voice or text" },
  { step: "2", title: "Get matched instantly", desc: "Our AI finds the right professional for you" },
  { step: "3", title: "Job done, guaranteed", desc: "Track progress, chat, and pay securely" },
]

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-lg mx-auto px-6 pt-16 pb-12 text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <KitaLogo className="h-5 w-5" />
            Powered by Denki AI
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-[1.15] mb-4">
            Every service you need,{" "}
            <span className="text-primary">one tap away</span>
          </h1>

          <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
            Kita is the marketplace where you find any skilled professional near you.
            Our AI assistant Denki handles the rest — from matching to booking.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link href="/register">
              <Button size="lg" className="w-full h-13 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="w-full h-13 text-base rounded-2xl">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-lg mx-auto px-6 py-10">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Popular services</p>
        <div className="grid grid-cols-3 gap-3">
          {services.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.name} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-card border">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{s.name}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Denki AI Section */}
      <section className="max-w-lg mx-auto px-6 py-10">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold">Meet Denki</p>
              <p className="text-xs text-muted-foreground">Your AI service assistant</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Not sure what professional you need? Just describe your problem — by voice or text.
            Denki analyzes the situation, recommends the right expert, and matches you with
            verified workers nearby in seconds.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span>Voice and text input — speak naturally</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span>Smart matching based on skills, distance, and rating</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span>Real-time updates — know when your worker is on the way</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-lg mx-auto px-6 py-10">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">How it works</p>
        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {s.step}
              </div>
              <div className="pt-1">
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Signals */}
      <section className="max-w-lg mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs font-medium">Verified Workers</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium">Fast Matching</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-xs font-medium">Rated & Reviewed</p>
          </div>
        </div>
      </section>

      {/* For Workers CTA */}
      <section className="max-w-lg mx-auto px-6 py-10">
        <div className="rounded-3xl bg-card border p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-2">Are you a skilled worker?</h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Join Kita and get matched with clients looking for your skills.
            Set your own availability and start earning.
          </p>
          <Link href="/register">
            <Button variant="outline" className="rounded-2xl px-6">
              Join as a Worker <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-6 pt-8 pb-12 text-center border-t">
        <div className="flex items-center justify-center gap-2 mb-2">
          <KitaLogo className="h-6 w-6" />
          <span className="font-bold">Kita</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Every service, one tap away
        </p>
      </footer>
    </div>
  )
}
