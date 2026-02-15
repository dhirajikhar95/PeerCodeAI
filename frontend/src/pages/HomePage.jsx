import { Link } from "react-router";
import {
  ArrowRightIcon,
  CheckIcon,
  Code2Icon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
  MessageSquareIcon,
  BrainIcon,
  GraduationCapIcon,
  StarIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  TrophyIcon,
  BookOpenIcon,
  LineChartIcon,
  SplitSquareHorizontalIcon,
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import { useState } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    {
      icon: SplitSquareHorizontalIcon,
      title: "Student Code Isolation",
      description: "Our unique system distinguishes between student work and teacher help, ensuring AI feedback is 100% accurate.",
      color: "primary",
    },
    {
      icon: BrainIcon,
      title: "AI Post-Session Analysis",
      description: "Receive detailed, automated feedback on your code's logic, complexity, and style after every session.",
      color: "secondary",
    },
    {
      icon: LineChartIcon,
      title: "Skill Growth Tracking",
      description: "Visualize your progress over time with dynamic skill charts (Radar/Bar) generated from your session history.",
      color: "accent",
    },
    {
      icon: VideoIcon,
      title: "Interactive Tutoring",
      description: "Seamless real-time video and code collaboration designed specifically for effective one-on-one teaching.",
      color: "primary",
    },
    {
      icon: BookOpenIcon,
      title: "Reusable Problem Bank",
      description: "Teachers can create and store custom coding problems with test cases for repeated use across sessions.",
      color: "secondary",
    },
    {
      icon: MessageSquareIcon,
      title: "Comprehensive Reports",
      description: "Export detailed PDF reports of your session feedback to share with parents, schools, or potential employers.",
      color: "accent",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Teacher Creates Session",
      description: "Teachers select a problem from the bank and invite a student to a secure, private room.",
      icon: UsersIcon,
    },
    {
      step: 2,
      title: "Collaborative Coding",
      description: "Student and teacher work together. Our system tracks who types what, isolating student effort.",
      icon: Code2Icon,
    },
    {
      step: 3,
      title: "AI Analyzing Code",
      description: "Once the session ends, our AI analyzes the 'Student Snapshot' to evaluate true understanding.",
      icon: BrainIcon,
    },
    {
      step: 4,
      title: "Actionable Feedback",
      description: "Both parties receive a structured report with grades, insights, and improvement tips.",
      icon: StarIcon,
    },
  ];

  const faqs = [
    {
      question: "How is this different from other coding platforms?",
      answer: "Most platforms just check if code runs. PeerCode AI focuses on *learning*. We strictly separate teacher assistance from student work so our AI feedback reflects what the student actually knows, not what the teacher fixed.",
    },
    {
      question: "Can teachers interrupt and help?",
      answer: "Absolutely! Teachers have full access to the shared editor to demonstrate concepts. However, our smart 'Snapshot' system ignores teacher edits when generating the final student assessment.",
    },
    {
      question: "Is AI replacing the teacher?",
      answer: "No. The AI is a post-session assistant. It handles grading and detailed analysis, freeing up the teacher to focus on mentoring and complex concepts during the live session.",
    },
    {
      question: "Who can create questions?",
      answer: "Teachers have a dedicated dashboard to create coding problems, define test cases, and set difficulty levels. These questions are saved permanently for future use.",
    },
  ];

  return (
    <div className="min-h-screen font-sans text-base-content selection:bg-primary/20 overflow-x-hidden">
      {/* Full-page gradient background - uses CSS variable */}
      <div className="fixed inset-0 -z-10" style={{ background: 'var(--page-gradient)' }} />

      {/* NAVBAR - Vibrant gradient using CSS variable */}
      <nav className="backdrop-blur-xl border-b border-white/20 fixed top-0 w-full z-50 shadow-xl" style={{ background: 'var(--navbar-gradient)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <motion.div
              transition={{ duration: 0.5 }}
              className="w-40 sm:w-52 lg:w-64 h-14 sm:h-16 lg:h-20 rounded-xl flex items-center justify-start"
            >
              <img src="/logo.png" alt="PeerCode AI Logo" className="w-full h-full object-contain object-left" />
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm lg:text-md font-medium text-white/80">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              Home
            </Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <SignInButton mode="modal">
              <button
                className="btn btn-primary btn-xs sm:btn-sm md:btn-md rounded-lg sm:rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 lg:pb-32 overflow-hidden">
        {/* Static Background Gradients - No animations for performance */}
        <div className="absolute top-0 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-primary/15 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-secondary/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 sm:space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-base-200 rounded-full border border-base-content/5 shadow-sm">
              <span className="relative flex h-2.5 sm:h-3 w-2.5 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 sm:h-3 w-2.5 sm:w-3 bg-accent"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-base-content/70">Next-Gen Education</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
              Teach Better with <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI-Assisted
              </span> <br className="hidden sm:block" />
              Code Tutoring
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base sm:text-lg lg:text-xl text-base-content/70 leading-relaxed max-w-lg">
              The first platform that separates <strong className="text-primary">student effort</strong> from teacher help.
              Get accurate AI-generated feedback reports and track mastery over time.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
              <SignInButton mode="modal">
                <button
                  className="btn btn-primary btn-md sm:btn-lg rounded-xl sm:rounded-2xl gap-2 sm:gap-3 shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 will-change-transform"
                >
                  <PlayCircleIcon className="size-5 sm:size-6" />
                  Start Teaching
                </button>
              </SignInButton>
              <a
                href="#how-it-works"
                className="btn btn-ghost btn-md sm:btn-lg rounded-xl sm:rounded-2xl gap-2 sm:gap-3 border border-base-content/10 hover:bg-base-200 hover:scale-105 active:scale-95 transition-all duration-200 will-change-transform"
              >
                How It Works
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-base-content/5 text-base-content/50 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckIcon className="size-3.5 sm:size-4 text-success" /> No Credit Card
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckIcon className="size-3.5 sm:size-4 text-success" /> Instant Analysis
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckIcon className="size-3.5 sm:size-4 text-success" /> Teacher Tools
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-2xl sm:rounded-[2rem] blur-xl sm:blur-2xl transform rotate-2 sm:rotate-3 scale-105 opacity-50" />
            <img
              src="/hero-tutoring.png"
              alt="AI Assisted Tutoring Dashboard"
              className="hero-float relative w-full rounded-2xl sm:rounded-[2rem] shadow-xl sm:shadow-2xl border border-base-content/10 bg-base-300 will-change-transform"
            />
          </motion.div>
        </div>
      </section>

      {/* CORE DIFFERENTIATOR */}
      <section className="py-16 sm:py-20 lg:py-24 bg-base-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl lg:text-5xl font-black mb-10 sm:mb-12 lg:mb-16"
          >
            Why PeerCode AI?
          </motion.h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card bg-base-100 shadow-xl border-t-4 border-primary p-4 sm:p-6 lg:p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-primary">
                <SplitSquareHorizontalIcon className="size-6 sm:size-7 lg:size-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Student Code Isolation</h3>
              <p className="text-sm sm:text-base text-base-content/70">
                We create a "Snapshot" layer that records only what the student types. Teacher demos don't pollute the grade.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card bg-base-100 shadow-xl border-t-4 border-secondary p-4 sm:p-6 lg:p-8 md:scale-105 z-10 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-secondary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-secondary">
                <BrainIcon className="size-6 sm:size-7 lg:size-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Unbiased AI Feedback</h3>
              <p className="text-sm sm:text-base text-base-content/70">
                Our AI analyzes strictly the student's isolated code to generate fair, actionable feedback on logic & approach.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="card bg-base-100 shadow-xl border-t-4 border-accent p-4 sm:p-6 lg:p-8 sm:col-span-2 md:col-span-1 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-accent/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-accent">
                <LineChartIcon className="size-6 sm:size-7 lg:size-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Long-term Mastery</h3>
              <p className="text-sm sm:text-base text-base-content/70">
                Track progress across 5, 10, or 20 sessions with aggregated skill charts and custom progress reports.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 sm:mb-16 lg:mb-20">
            <span className="text-primary font-bold tracking-wider uppercase text-xs sm:text-sm">Features</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mt-2">Tools for Modern Teaching</h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl hover:bg-base-200/30 bg-base-200 transition-all duration-300 border border-base-content/5 hover:scale-[1.02]"
              >
                <div className={`size-10 sm:size-12 rounded-lg sm:rounded-xl bg-${feature.color}/10 text-${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="size-5 sm:size-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-base-content/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-24 lg:py-32 bg-base-200 border-y border-base-content/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-accent font-bold tracking-wider uppercase text-xs sm:text-sm">Workflow</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mt-2 mb-10 sm:mb-16 lg:mb-20">Simple, Effective Tutoring</h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-20" />

            {howItWorks.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className="size-16 sm:size-20 lg:size-24 rounded-2xl sm:rounded-3xl bg-base-100 shadow-xl border border-base-content/5 flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 relative hover:scale-110 transition-transform duration-300"
                >
                  <step.icon className="size-7 sm:size-8 lg:size-10 text-primary" />
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 size-6 sm:size-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-xs sm:text-sm text-base-content/60">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6">Common Questions</h2>
            <p className="text-sm sm:text-base text-base-content/60">Everything you need to know about our unique approach.</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="collapse collapse-plus bg-base-200/50 rounded-xl sm:rounded-2xl border border-base-content/5"
              >
                <input type="radio" name="faq-accordion" checked={openFaq === index} onChange={() => setOpenFaq(openFaq === index ? null : index)} />
                <div className="collapse-title text-base sm:text-lg font-bold pr-10">
                  {faq.question}
                </div>
                <div className="collapse-content">
                  <p className="text-sm sm:text-base text-base-content/70 pb-3 sm:pb-4 leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] p-8 sm:p-12 lg:p-24 text-center text-white shadow-2xl shadow-primary/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10" />
          {/* Static decorative blobs instead of animated ones */}
          <div className="absolute -top-16 sm:-top-24 -left-16 sm:-left-24 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white/15 rounded-full blur-2xl sm:blur-3xl" />
          <div className="absolute -bottom-16 sm:-bottom-24 -right-16 sm:-right-24 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white/15 rounded-full blur-2xl sm:blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-black mb-4 sm:mb-6">Ready to Transform Tutoring?</h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl opacity-90 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto">
              Join the platform that puts learning first. Accurate feedback, reduced manual grading, and better student outcomes.
            </p>
            <SignInButton mode="modal">
              <button
                className="btn btn-md sm:btn-lg bg-white text-primary hover:bg-white/90 border-none rounded-xl sm:rounded-2xl px-6 sm:px-8 lg:px-12 font-bold shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Get Started Now
              </button>
            </SignInButton>
          </div>
        </motion.div>
      </section>

      {/* FOOTER - Vibrant gradient matching navbar */}
      <footer className="py-2 border-t border-white/20 text-sm shadow-xl" style={{ background: 'var(--footer-gradient)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-40 sm:w-52 lg:w-64 h-14 sm:h-16 lg:h-20 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="PeerCode AI Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="text-white/50 text-xs sm:text-sm text-center sm:text-right">
            © {new Date().getFullYear()} PeerCode AI. Empowering Education with AI.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
