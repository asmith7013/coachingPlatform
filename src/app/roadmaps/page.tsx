"use client";

import Link from "next/link";

export default function RoadmapsHomePage() {
  const pages = [
    {
      title: "Lesson by Lesson",
      href: "/roadmaps/scope-and-sequence",
      icon: "🗓️",
      description: "See how skills progress across lessons in each unit."
    },
    {
      title: "Units",
      href: "/roadmaps/units",
      icon: "📚",
      description: "View units by grade level with their target and support skills."
    },
    {
      title: "Skills",
      href: "/roadmaps/skills",
      icon: "🎯",
      description: "Browse individual skills with teaching resources and prerequisites."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Roadmaps + Studio Classroom Math</h1>
          <p className="text-gray-600">
            Visualizing Roadmaps Skills & Student Skill Progress
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-4">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
              >
                <div className="text-3xl">{page.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                    {page.title}
                  </h2>
                  <p className="text-sm text-gray-600">{page.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
