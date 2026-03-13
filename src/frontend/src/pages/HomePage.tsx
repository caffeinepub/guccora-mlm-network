import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Banknote,
  GitBranch,
  Layers,
  Package,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

import type { Variants } from "motion/react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" as const },
  }),
};

const incomeCards = [
  {
    icon: Users,
    title: "Direct Income",
    amount: "₹100",
    desc: "Per direct referral",
  },
  {
    icon: GitBranch,
    title: "Binary Income",
    amount: "₹200",
    desc: "Per matching pair",
  },
  {
    icon: Layers,
    title: "10 Level Income",
    amount: "Unlimited",
    desc: "Earn across 10 levels",
  },
  {
    icon: Package,
    title: "Premium Products",
    amount: "Bonus",
    desc: "Product-based rewards",
  },
];

const steps = [
  { num: 1, title: "Register", desc: "Create your free account in minutes" },
  { num: 2, title: "Verify OTP", desc: "Secure mobile verification" },
  { num: 3, title: "Buy Product Plan", desc: "Activate with a starter plan" },
  { num: 4, title: "Refer Friends", desc: "Share your unique referral link" },
  { num: 5, title: "Build Binary Team", desc: "Grow left and right network" },
  { num: 6, title: "Earn Income", desc: "Start receiving daily earnings" },
];

const features = [
  { icon: ShieldCheck, label: "Secure OTP Login" },
  { icon: GitBranch, label: "Binary Tree System" },
  { icon: TrendingUp, label: "Income Dashboard" },
  { icon: Banknote, label: "Fast Withdrawals" },
  { icon: Package, label: "Product Tracking" },
  { icon: Smartphone, label: "Mobile Friendly" },
];

const topEarners = [
  { name: "Rajesh Kumar", city: "Hyderabad", income: "₹45,000" },
  { name: "Priya Sharma", city: "Mumbai", income: "₹38,500" },
  { name: "Anil Reddy", city: "Bangalore", income: "₹52,200" },
  { name: "Sunita Patel", city: "Delhi", income: "₹29,800" },
];

export function HomePage() {
  const handleJoin = () => {
    window.location.href = "/register";
  };
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-mesh font-body">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/guccora-logo.dim_200x200.png"
              alt="Guccora Logo"
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="font-display font-bold text-lg tracking-wider text-primary">
              GUCCORA
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-foreground/70 hover:text-primary"
              onClick={handleLogin}
              data-ocid="nav.login.button"
            >
              Login
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:opacity-90 font-semibold"
              onClick={handleJoin}
              data-ocid="nav.join.primary_button"
            >
              Free Join
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-6">
        {/* decorative circles */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "oklch(0.78 0.14 85 / 0.4)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-10 right-0 w-80 h-80 rounded-full opacity-10"
          style={{
            background: "oklch(0.45 0.18 290 / 0.5)",
            filter: "blur(70px)",
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <img
                src="/assets/generated/guccora-logo.dim_200x200.png"
                alt="Guccora"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/40 gold-glow"
              />
              <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                ✦
              </span>
            </div>
          </motion.div>

          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <Badge className="mb-4 px-4 py-1 text-sm font-semibold bg-primary/10 text-primary border-primary/30">
              India's Fastest Growing MLM Network
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-6xl sm:text-8xl font-black tracking-widest text-foreground mb-4"
            style={{ textShadow: "0 0 60px oklch(0.78 0.14 85 / 0.3)" }}
          >
            GUCCORA
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-xl sm:text-3xl font-semibold text-primary mb-4 italic"
          >
            Build Your Network, Build Your Future
          </motion.p>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10"
          >
            Join India's fastest growing MLM network with binary plan, level
            income, and product-based activation.
          </motion.p>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="h-13 px-8 text-base font-bold gold-gradient text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
              onClick={handleJoin}
              data-ocid="hero.primary_button"
            >
              ✦ Free Join
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 px-8 text-base font-semibold border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
              onClick={handleLogin}
              data-ocid="hero.secondary_button"
            >
              Login to Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── INCOME CARDS ── */}
      <section className="py-20 px-4 sm:px-6" data-ocid="income.section">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Your Earning Potential
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Multiple income streams for maximum growth
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {incomeCards.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="card-glow rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center cursor-default"
                style={{ background: "oklch(0.16 0.06 290)" }}
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "oklch(0.78 0.14 85 / 0.15)" }}
                >
                  <card.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-primary mb-1">
                  {card.amount}
                </div>
                <div className="font-semibold text-foreground text-sm sm:text-base mb-1">
                  {card.title}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  {card.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        className="py-20 px-4 sm:px-6 relative"
        data-ocid="howitworks.section"
        style={{ background: "oklch(0.14 0.05 290)" }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(0.78 0.14 85) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Start earning in 6 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative rounded-2xl p-6 border border-border/60 hover:border-primary/40 transition-colors"
                style={{ background: "oklch(0.17 0.06 290)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-lg mb-4"
                  style={{
                    background: "oklch(0.78 0.14 85)",
                    color: "oklch(0.15 0.02 60)",
                  }}
                >
                  {step.num}
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
                {step.num < 6 && (
                  <div className="hidden lg:block absolute top-8 -right-3 text-primary/40 text-xl font-bold">
                    ›
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center mt-12"
          >
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-bold gold-gradient text-primary-foreground gold-glow hover:opacity-90 transition-opacity"
              onClick={handleJoin}
              data-ocid="howitworks.join_now.primary_button"
            >
              ✦ Join Now — It's Free!
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Why Guccora?
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                style={{ background: "oklch(0.16 0.06 290)" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "oklch(0.78 0.14 85 / 0.12)" }}
                >
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground/90">
                  {f.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP EARNERS ── */}
      <section
        className="py-20 px-4 sm:px-6"
        style={{ background: "oklch(0.14 0.05 290)" }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Top Earners
            </h2>
            <p className="text-muted-foreground">Real members, real income</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topEarners.map((e, i) => (
              <motion.div
                key={e.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-2xl p-5 text-center card-glow"
                style={{ background: "oklch(0.17 0.06 290)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-display font-black mx-auto mb-3"
                  style={{
                    background: "oklch(0.78 0.14 85 / 0.15)",
                    color: "oklch(0.78 0.14 85)",
                  }}
                >
                  {e.name[0]}
                </div>
                <div className="font-semibold text-foreground text-sm mb-0.5">
                  {e.name}
                </div>
                <div className="text-muted-foreground text-xs mb-2">
                  {e.city}
                </div>
                <div className="font-display font-bold text-primary text-base">
                  {e.income}/mo
                </div>
                <div className="flex justify-center mt-1 gap-0.5">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <Star className="w-3 h-3 fill-primary text-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN BANNER ── */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto rounded-3xl overflow-hidden relative text-center px-8 py-16 card-glow"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.20 0.10 290), oklch(0.15 0.06 290))",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, oklch(0.78 0.14 85 / 0.12) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <Badge className="mb-4 px-4 py-1 bg-primary/15 text-primary border-primary/30 font-semibold">
              Limited Time — Join Free
            </Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-foreground mb-4">
              Start Your Journey Today
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Start your journey with Guccora today and build your financial
              future.
            </p>
            <Button
              size="lg"
              className="h-14 px-12 text-lg font-bold gold-gradient text-primary-foreground gold-glow hover:opacity-90 transition-opacity"
              onClick={handleJoin}
            >
              JOIN FREE NOW ✦
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="border-t border-border/50 py-10 px-4 sm:px-6"
        style={{ background: "oklch(0.10 0.04 290)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/guccora-logo.dim_200x200.png"
                alt="Guccora"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-display font-bold tracking-widest text-primary">
                GUCCORA
              </span>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a
                href="#about"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
                data-ocid="footer.about.link"
              >
                About
              </a>
              <a
                href="#terms"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
                data-ocid="footer.terms.link"
              >
                Terms
              </a>
              <a
                href="#privacy"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
                data-ocid="footer.privacy.link"
              >
                Privacy Policy
              </a>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
                data-ocid="footer.contact.link"
              >
                Contact Support
              </a>
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Guccora. All rights reserved.</p>
            <p>
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
