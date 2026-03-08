import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react"
import ContactForm from "@/components/contact-form"
import RequireLogin from "@/components/require-login"

export const metadata: Metadata = {
  title: "Contact | Eduiaol",
  description: "Contact IAOL Education – iaoleducation65@gmail.com · Kargil, Ladakh",
}

export default function ContactPage() {
  return (
    <RequireLogin>
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact Us</h1>
          <p className="text-muted-foreground">
            Get in touch with IAOL Education for any queries or assistance
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>IAOL Education</CardTitle>
                <CardDescription>Counselling thousands of JEE, NEET & other stream students · Kargil, Ladakh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-sm text-muted-foreground">
                      IAOL Education
                      <br />
                      Kargil, Ladakh
                      <br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-muted-foreground">Contact via email</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">iaoleducation65@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Office Hours</h3>
                    <p className="text-sm text-muted-foreground">Monday to Friday: 9:00 AM - 5:00 PM</p>
                    
                    <p className="text-sm text-muted-foreground">Closed on Saturdays & Sundays, and Public Holidays</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Contacts</CardTitle>
                <CardDescription>Reach out to our team members directly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Support</h3>
                  <p className="text-sm text-muted-foreground">IAOL Education Team</p>
                  <p className="text-sm text-muted-foreground">Email: iaoleducation65@gmail.com</p>
                </div>

               
              </CardContent>
            </Card>

            <Card className="md:block hidden">
              <CardHeader>
                <CardTitle>Connect With Us</CardTitle>
                <CardDescription>Follow us on social media for updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                    <a href="https://www.linkedin.com/company/iaol-ladakh" target="_blank" rel="noopener noreferrer">
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                    <a href="https://x.com/IAOL_Educatiom" target="_blank" rel="noopener noreferrer">
                      Twitter <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>

            <Card className="mt-8 block md:hidden">
              <CardHeader>
                <CardTitle>Connect With Us</CardTitle>
                <CardDescription>Follow us on social media for updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                    <a href="https://www.linkedin.com/company/iaol-ladakh" target="_blank" rel="noopener noreferrer">
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                    <a href="https://x.com/IAOL_Educatiom" target="_blank" rel="noopener noreferrer">
                      Twitter <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 rounded-lg overflow-hidden h-[300px] border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13282.747906519483!2d76.11399!3d34.55918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38fde18e08aaaaab%3A0x9e0e3f1f87b84a73!2sKargil%2C%20Ladakh!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 sm:p-8 mt-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">How can I enroll in IAOL Education counselling?</h3>
              <p className="text-sm text-muted-foreground">
                You can reach out to us at iaoleducation65@gmail.com or use the contact form above. Our team will guide you through the enrolment process.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Which exams does IAOL Education cover?</h3>
              <p className="text-sm text-muted-foreground">
                We counsel students preparing for JEE, NEET, and other competitive entrance exams across various streams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Where is IAOL Education located?</h3>
              <p className="text-sm text-muted-foreground">
                IAOL Education is based in Kargil, Ladakh, India, and has been counselling thousands of students from the region and beyond.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Are study resources available on the platform?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, resources and study materials are available in the Resources section once you are signed in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RequireLogin>
  )
}

