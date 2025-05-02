import React from 'react';
import Link from 'next/link';

export default function CAPLandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Coaching Action Plan Examples</h1>
        
        <p className="text-lg mb-8 text-center text-gray-700">
          Explore different coaching action plan templates implemented in our platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Example 1 */}
          <Link href="/examples/cap/example1" className="block group">
            <div className="border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:border-blue-300 h-full">
              <div className="mb-4 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">Org-Wide CAP</h2>
              <p className="text-gray-600 mb-4">
                Standard coaching action plan format, organized by stages with success metrics and implementation records.
              </p>
              <div className="text-blue-600 font-medium flex items-center">
                View Example
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </Link>
          
          {/* Example 2 */}
          <Link href="/examples/cap/example2" className="block group">
            <div className="border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:border-blue-300 h-full">
              <div className="mb-4 w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-teal-600">NYC Solves Math Format</h2>
              <p className="text-gray-600 mb-4">
              Mockup of Spring 2025 Version              
              </p>
              <div className="text-teal-600 font-medium flex items-center">
                View Example
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold mb-3 text-blue-800">About Coaching Action Plans</h2>
          <p className="text-blue-700 mb-4">
            Coaching Action Plans (CAPs) provide a structured approach to coaching cycles, ensuring clear goals,
            aligned metrics, and purposeful implementation. These examples showcase different formats used by
            educational organizations to document and track coaching engagements.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white px-4 py-2 rounded-md border border-blue-200 text-blue-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Track Progress
            </div>
            <div className="bg-white px-4 py-2 rounded-md border border-blue-200 text-blue-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Document Actions
            </div>
            <div className="bg-white px-4 py-2 rounded-md border border-blue-200 text-blue-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Improve Outcomes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 