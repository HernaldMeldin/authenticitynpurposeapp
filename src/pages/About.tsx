import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Heart, Users, Zap, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    image: "https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759540994086_6a18ed5c.webp",
    bio: "Former product lead at Google. Passionate about helping people achieve their dreams through technology."
  },
  {
    name: "Michael Rodriguez",
    role: "CTO & Co-Founder",
    image: "https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759540996230_c51f9393.webp",
    bio: "15 years building scalable systems. Believes in the power of data-driven goal achievement."
  },
  {
    name: "Emma Thompson",
    role: "Head of Product Design",
    image: "https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759540998522_596ca11c.webp",
    bio: "Award-winning designer focused on creating intuitive experiences that inspire action."
  },
  {
    name: "David Park",
    role: "Marketing Director",
    image: "https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759541000172_098df5df.webp",
    bio: "Growth expert who helped scale 3 startups. Dedicated to spreading the goal-setting revolution."
  }
];

const values = [
  { icon: Target, title: "Goal-Oriented", description: "We practice what we preach - every team member sets and tracks their goals using DEPO." },
  { icon: Heart, title: "User-Centric", description: "Every feature is designed with our users' success in mind, backed by research and feedback." },
  { icon: Users, title: "Community First", description: "We believe in the power of shared progress and supporting each other's journeys." },
  { icon: Zap, title: "Innovation", description: "Constantly pushing boundaries with AI, analytics, and new ways to achieve goals." }
];

const milestones = [
  { year: "2023", title: "The Idea", description: "Founded by Sarah and Michael after struggling with existing goal-tracking tools" },
  { year: "Early 2024", title: "Beta Launch", description: "Released to 100 beta testers who provided invaluable feedback" },
  { year: "Mid 2024", title: "AI Coach", description: "Launched AI-powered coaching feature, revolutionizing personalized guidance" },
  { year: "Late 2024", title: "10K Users", description: "Reached 10,000 active users across 50 countries" },
  { year: "2025", title: "Team Features", description: "Introduced family and business collaboration tools" }
];

const testimonials = [
  { name: "Jessica M.", role: "Beta Tester", quote: "DEPO changed how I approach my goals. The AI coach feels like having a personal mentor." },
  { name: "Robert K.", role: "Early Adopter", quote: "Finally, a goal tracker that understands the journey, not just the destination." },
  { name: "Priya S.", role: "Family Plan User", quote: "Our family stays connected and motivated. It's brought us closer together." }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759540992424_2edec073.webp" 
          alt="DEPO Office" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-purple-600/80 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">About DEPO Goal Tracker</h1>
            <p className="text-xl max-w-2xl mx-auto">Empowering millions to turn dreams into reality through intelligent goal tracking</p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8">
            <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To democratize goal achievement by providing intelligent, accessible tools that help everyone—from individuals to families to businesses—track, analyze, and accomplish their most important objectives.
            </p>
          </Card>
          <Card className="p-8">
            <Award className="w-12 h-12 text-purple-600 mb-4" />
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              A world where everyone has the tools and support to achieve their full potential, where goals aren't just dreams but actionable plans backed by data, AI, and community.
            </p>
          </Card>
        </div>

        {/* Story */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-8">Our Story</h2>
          <div className="prose prose-lg max-w-4xl mx-auto text-gray-600">
            <p className="mb-4">
              DEPO was born from frustration. Our founders, Sarah and Michael, tried countless goal-tracking apps but found them either too simple to be useful or too complex to stick with. They envisioned something different—a platform that combined powerful analytics with beautiful design and AI-powered insights.
            </p>
            <p>
              What started as a side project quickly grew into a mission. After sharing an early prototype with friends and family, the response was overwhelming. People weren't just using DEPO; they were achieving goals they'd put off for years. That's when we knew we had to make this our full-time focus.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 items-start">
                <Badge className="text-lg px-4 py-2 bg-purple-600">{milestone.year}</Badge>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <value.icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <img src={member.image} alt={member.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">What Early Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-xl mb-6">Be part of the goal-achievement revolution</p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/')}
            className="text-lg px-8"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
}
