import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import RequireLogin from "@/components/require-login"

export const metadata: Metadata = {
  title: "Privacy Policy | Eduiaol",
  description: "Privacy policy for Eduiaol platform",
}

export default function PrivacyPage() {
  return (
    <RequireLogin>
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 27, 2024</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            Eduiaol ("we," "our," or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit
            our website and use our services.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our website, you acknowledge that you have
            read, understood, and agree to be bound by all the terms outlined in this Privacy Policy.
          </p>

          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <h3>Personal Information</h3>
          <ul>
            <li>Name</li>
            <li>Email address (institutional and personal)</li>
            <li>Branch/department</li>
            <li>Graduation year</li>
            <li>Profile pictures (if provided)</li>
            <li>LinkedIn profile (if provided)</li>
            <li>GitHub profile (if provided)</li>
            <li>Personal contact information (if provided)</li>
          </ul>

          <h3>Experience Information</h3>
          <ul>
            <li>Company name</li>
            <li>Job role</li>
            <li>Placement type (on-campus, off-campus, internship)</li>
            <li>Placement year</li>
            <li>Preparation strategies</li>
            <li>Interview process details</li>
            <li>Tips and challenges</li>
          </ul>

          <h3>Usage Information</h3>
          <ul>
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Pages visited</li>
            <li>Time and date of visits</li>
            <li>Referring website</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including:</p>
          <ul>
            <li>Providing and maintaining our website and services</li>
            <li>Displaying placement experiences to help students prepare</li>
            <li>Improving and personalizing user experience</li>
            <li>Communicating with you about updates or changes to our services</li>
            <li>Analyzing usage patterns to enhance our website</li>
            <li>Preventing fraudulent activities and ensuring security</li>
          </ul>

          <h2>Sharing Your Information</h2>
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li>With your consent</li>
            <li>With registered users of Eduiaol through our platform</li>
            <li>With third-party service providers who assist us in operating our website</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, please be aware
            that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>

          <h2>Your Choices</h2>
          <p>You have several choices regarding your personal information:</p>
          <ul>
            <li>You can review and update your account information at any time</li>
            <li>You can request the removal of your experience submission</li>
            <li>You can opt out of receiving communications from us</li>
            <li>
              You can choose not to provide certain personal information, though this may limit your ability to use some
              features
            </li>
          </ul>

          <h2>Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We have no control over and assume no responsibility
            for the content, privacy policies, or practices of any third-party sites or services.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>
            Eduiaol
            <br />
            Email: contact@iaol.education
          </p>
        </div>

        <Separator />

        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
    </RequireLogin>
  )
}

