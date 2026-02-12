import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Brain, Video, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const handleGetStarted = () => {
    // Replace with your routing logic (React Router if used)
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      
      {/* ================= HERO ================= */}
      <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center bg-gradient-to-b from-blue-50 to-white">
        
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight"
        >
          Redefining Education Through Smart Collaboration
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 max-w-2xl text-lg text-gray-600"
        >
          Our EdTech platform empowers students to collaborate in real-time,
          attend live video sessions, access intelligent study tools, and build
          a powerful learning community anywhere in the world.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="mt-10 flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:bg-blue-700 transition"
        >
          Get Started <ArrowRight size={18} />
        </motion.button>
      </section>

      {/* ================= VISION ================= */}
      <section className="px-6 py-24 max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold"
        >
          Our Vision
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-6 text-gray-600 text-lg max-w-3xl mx-auto"
        >
          We believe learning should be interactive, collaborative, and
          intelligent. Our mission is to create a digital classroom where
          students can connect, share ideas, solve problems together, and grow
          academically without limitations.
        </motion.p>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            {
              icon: <Users size={28} />,
              title: "Collaborative Study Groups",
              desc: "Form study groups and collaborate with peers in real-time.",
            },
            {
              icon: <Video size={28} />,
              title: "Live Video Learning",
              desc: "Attend and host interactive live sessions effortlessly.",
            },
            {
              icon: <Brain size={28} />,
              title: "AI-Powered Assistance",
              desc: "Smart summaries and intelligent learning support tools.",
            },
            {
              icon: <BookOpen size={28} />,
              title: "Resource Sharing",
              desc: "Upload and share notes, PDFs, and study materials easily.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-6 py-24 max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold"
        >
          How It Works
        </motion.h2>

        <div className="mt-12 grid md:grid-cols-3 gap-10">
          {[
            "Sign up and personalize your learning profile.",
            "Join or create collaborative study groups.",
            "Learn together using chat, video, and AI tools.",
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 bg-white shadow-md rounded-xl"
            >
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {i + 1}
              </div>
              <p className="text-gray-600">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-blue-600 text-white px-6 py-24 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold"
        >
          Ready to Elevate Your Learning Experience?
        </motion.h2>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="mt-10 bg-white text-blue-600 px-8 py-4 rounded-full font-medium shadow-lg hover:bg-gray-100 transition"
        >
          Get Started Today
        </motion.button>
      </section>
    </div>
  );
}
