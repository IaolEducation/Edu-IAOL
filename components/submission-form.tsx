"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, Search, User, Building, FileText, Link } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { saveExperienceToFirestore } from "@/lib/firebase"
import { getCompaniesFromFirestore } from "@/lib/firebase"
import { uploadImageToStorage } from "@/lib/firebase" // Import the new function
import { useAuth } from "@/contexts/auth-context"

// Add this after other imports
import { PlusCircle, Trash2 } from "lucide-react"

// Add this hook implementation at the top of the file, after the other imports:
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Default to false on server
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia(query)

      // Set initial value
      setMatches(mediaQuery.matches)

      // Create event listener function
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches)
      }

      // Add event listener
      mediaQuery.addEventListener("change", handleChange)

      // Clean up
      return () => {
        mediaQuery.removeEventListener("change", handleChange)
      }
    }

    return undefined
  }, [query])

  return matches
}

// Function to generate year options from 1986 to current year + 2
function generateYearOptions() {
  const currentYear = new Date().getFullYear()
  const startYear = 1990
  const endYear = currentYear + 2 // Include upcoming years

  const years = []
  for (let year = endYear; year >= startYear; year--) {
    years.push(year)
  }

  return years
}

// Custom Select component with search functionality
function SearchableYearSelect({
  years,
  value,
  onValueChange,
  placeholder,
}: {
  years: number[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const filteredYears = searchQuery ? years.filter((year) => year.toString().includes(searchQuery)) : years

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <div className="flex items-center border-b px-3 pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-9 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filteredYears.length > 0 ? (
            filteredYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">No years found</div>
          )}
        </div>
      </SelectContent>
    </Select>
  )
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
    phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(15, { message: "Phone number must not exceed 15 digits." }),
  rollNumber: z
    .string()
    .min(5, { message: "Roll number must be at least 5 characters." })
    .max(15, { message: "Roll number must not exceed 15 characters." }),
  branch: z.string({ required_error: "Please select your branch." }),
  graduationYear: z.string({ required_error: "Please select your graduation year." }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  companyType: z.string({ required_error: "Please select company type." }),
  role: z.string().min(2, { message: "Job role must be at least 2 characters." }),
  placementType: z.string({ required_error: "Please select placement type." }),
  placementYear: z.string({ required_error: "Please select placement year." }),
  package: z.string().optional(),
  preparationStrategy: z.string().min(50, { message: "Please provide more details about your preparation strategy." }),
  interviewProcess: z.string().min(50, { message: "Please provide more details about the interview process." }),
  tips: z.string().min(50, { message: "Please provide more tips for future candidates." }),
  challenges: z.string().min(50, { message: "Please share the challenges you faced." }),
  resources: z
    .array(
      z.object({
        title: z.string().optional(), // Changed from min(1) to optional
        url: z.string().optional(), // Changed from url() to optional
      }),
    )
    .optional(),
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  personalEmail: z.string().optional(),
  profilePicture: z.any().optional(),
  companyLogo: z.any().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, { message: "You must accept the terms and conditions." }),
})

export default function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [companies, setCompanies] = useState<string[]>([])
  const yearOptions = generateYearOptions()
  const isMobile = useMediaQuery("(max-width: 640px)")
  const { user } = useAuth()

  // Add refs for file inputs
  const profilePictureRef = useRef<HTMLInputElement>(null)
  const companyLogoRef = useRef<HTMLInputElement>(null)

  // Add this inside the SubmissionForm component
  const [resources, setResources] = useState([{ title: "", url: "" }])

  // Get existing companies for autocomplete
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log("Fetching companies for autocomplete")
        const companiesData = await getCompaniesFromFirestore()
        const companyNames = companiesData.map((company) => company.name)
        setCompanies(companyNames)
        console.log("Companies fetched:", companyNames)
      } catch (error) {
        console.error("Error fetching companies:", error)
        toast({
          title: "Error",
          description: "Failed to load companies. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchCompanies()
  }, [])

  // Update the form defaultValues to include resources
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      rollNumber: "",
      branch: "",
      graduationYear: "",
      company: "",
      companyType: "",
      role: "",
      placementType: "",
      placementYear: "",
      package: "",
      preparationStrategy: "",
      interviewProcess: "",
      tips: "",
      challenges: "",
      resources: [{ title: "", url: "" }],
      linkedIn: "",
      github: "",
      personalEmail: "",
      profilePictureUrl: "",
      companyLogoUrl: "",
      termsAccepted: false,
    },
  })

  // Add these functions inside the SubmissionForm component
  const addResource = () => {
    const currentResources = form.getValues("resources") || []
    form.setValue("resources", [...currentResources, { title: "", url: "" }])
  }

  const removeResource = (index: number) => {
    const currentResources = form.getValues("resources") || []
    if (currentResources.length > 1) {
      const updatedResources = currentResources.filter((_, i) => i !== index)
      form.setValue("resources", updatedResources)
    }
  }

   async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return // Prevent multiple submissions

    setIsSubmitting(true)

    try {
      console.log("Submitting form with values:", values)
      // Create an excerpt from the preparation strategy
      const excerpt = values.preparationStrategy.substring(0, 200) + "..."

      // Use the provided image URLs or default placeholders
      const profileImageUrl = values.profilePictureUrl || "/placeholder.svg?height=100&width=100"
      const companyLogoUrl = values.companyLogoUrl || "/placeholder.svg?height=40&width=40"

      // Create a new experience object
      const newExperience = {
        id: Date.now(),
        studentName: values.name,
        branch: getBranchName(values.branch),
        company: values.company,
        companyType: values.companyType,
        year: Number.parseInt(values.placementYear),
        type: getPlacementTypeName(values.placementType),
        excerpt,
        profileImage: profileImageUrl,
        companyLogo: companyLogoUrl,
        status: "approved" as const,
        email: values.email,
        phoneNumber: values.phoneNumber,
        rollNumber: values.rollNumber,
        role: values.role,
        graduationYear: values.graduationYear,
        package: values.package || "Not disclosed",
        preparationStrategy: values.preparationStrategy,
        interviewProcess: values.interviewProcess,
        tips: values.tips,
        challenges: values.challenges,
        resources: values.resources || [],
        linkedIn: values.linkedIn || "",
        github: values.github || "",
        personalEmail: values.personalEmail || "",
        uid: user?.uid || null, // Add the user's UID if they're logged in
        submittedAt: new Date().toISOString(),
      }

      console.log("Saving experience to Firestore:", newExperience)
      // Save to Firestore
      const result = await saveExperienceToFirestore(newExperience)

      if (!result) {
        throw new Error("Failed to save experience to Firestore")
      }

      toast({
        title: "Experience submitted successfully!",
        description: "Thank you for sharing your placement journey. It will be reviewed by an admin.",
      })

      // Set submitted state to true to show success message
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Something went wrong.",
        description:
          error instanceof Error ? error.message : "Your experience couldn't be submitted. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper functions to get full names from values
  function getBranchName(value: string): string {
    const branchMap: Record<string, string> = {
      "computer-science": "Computer Science",
      electronics: "Electronics & Communication",
      electrical: "Electrical Engineering",
      mechanical: "Mechanical Engineering",
      civil: "Civil Engineering",
      chemical: "Chemical Engineering",
      "material-science": "Material Science",
      architecture: "Architecture",
    }
    return branchMap[value] || value
  }

  function getPlacementTypeName(value: string): string {
    const typeMap: Record<string, string> = {
      "on-campus": "On-Campus",
      "off-campus": "Off-Campus",
      internship: "Internship",
    }
    return typeMap[value] || value
  }

  // Handle tab navigation
  const handleTabChange = (value: string) => {
    // Validate current tab before allowing change
    if (value === "placement" && activeTab === "personal") {
      const personalFields = ["name", "email","phoneNumber", "rollNumber", "branch", "graduationYear"]
      const isValid = personalFields.every((field) => {
        return form.getFieldState(field as any).invalid !== true
      })

      if (!isValid) {
        // Trigger validation on all personal fields
        personalFields.forEach((field) => form.trigger(field as any))
        return // Don't change tab if validation fails
      }
    } else if (value === "experience" && activeTab === "placement") {
      const placementFields = ["company", "companyType", "role", "placementType", "placementYear"]
      const isValid = placementFields.every((field) => {
        return form.getFieldState(field as any).invalid !== true
      })

      if (!isValid) {
        // Trigger validation on all placement fields
        placementFields.forEach((field) => form.trigger(field as any))
        return // Don't change tab if validation fails
      }
    }

    setActiveTab(value)
  }

  const goToNextTab = async () => {
    if (activeTab === "personal") {
      // Validate personal fields before proceeding
      const personalFields = ["name", "email","phoneNumber", "rollNumber", "branch", "graduationYear"]
      const isValid = await form.trigger(personalFields as any)

      if (isValid) {
        setActiveTab("placement")
      }
    } else if (activeTab === "placement") {
      // Validate placement fields before proceeding
      const placementFields = ["company", "companyType", "role", "placementType", "placementYear"]
      const isValid = await form.trigger(placementFields as any)

      if (isValid) {
        setActiveTab("experience")
      }
    } else if (activeTab === "experience") {
      // Validate experience fields before proceeding
      const experienceFields = ["preparationStrategy", "interviewProcess", "tips", "challenges"]
      const isValid = await form.trigger(experienceFields as any)

      if (isValid) {
        setActiveTab("connect")
      }
    }
  }

  const goToPreviousTab = () => {
    if (activeTab === "placement") {
      setActiveTab("personal")
    } else if (activeTab === "experience") {
      setActiveTab("placement")
    } else if (activeTab === "connect") {
      setActiveTab("experience")
    }
  }

  // Get tab icon based on tab name
  const getTabIcon = (tabName: string) => {
    switch (tabName) {
      case "personal":
        return <User className="h-4 w-4 mr-1" />
      case "placement":
        return <Building className="h-4 w-4 mr-1" />
      case "experience":
        return <FileText className="h-4 w-4 mr-1" />
      case "connect":
        return <Link className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  // Get tab label based on tab name and screen size
  const getTabLabel = (tabName: string) => {
    if (isMobile) {
      switch (tabName) {
        case "personal":
          return "Personal"
        case "placement":
          return "Placement"
        case "experience":
          return "Experience"
        case "connect":
          return "Connect"
        default:
          return tabName
      }
    } else {
      switch (tabName) {
        case "personal":
          return "Personal Info"
        case "placement":
          return "Placement Details"
        case "experience":
          return "Your Experience"
        case "connect":
          return "Connect Info"
        default:
          return tabName
      }
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
          <CardDescription className="text-center">Your experience has been submitted successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Submission Successful</AlertTitle>
            <AlertDescription>
              Your placement experience has been submitted for review. It will be published after moderation by an
              admin.
            </AlertDescription>
          </Alert>
          <div className="text-center space-y-2">
            <p>Thank you for sharing your placement journey with the Eduiaol community.</p>
            <p className="text-muted-foreground">Your insights will help juniors in their placement preparation.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => (window.location.href = "/")}>Return to Home</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Share Your Placement Experience</CardTitle>
        <CardDescription>Help juniors prepare better by sharing your journey</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="relative mb-6">
                <TabsList className="w-full grid grid-cols-4 p-1 h-auto">
                  {["personal", "placement", "experience", "connect"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className={`
                        flex items-center justify-center py-3 px-1 
                        data-[state=active]:shadow-none data-[state=active]:font-medium
                        ${activeTab === tab ? "border-b-2 border-primary rounded-none" : ""}
                      `}
                    >
                      {getTabIcon(tab)}
                      <span className="text-xs sm:text-sm whitespace-nowrap">{getTabLabel(tab)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-border"></div>
              </div>

              <TabsContent value="personal" className="space-y-6 pt-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Use your email for verification.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormDescription>Your email address</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormDescription>Will only be visible to admins</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Roll number (optional)" {...field} />
                        </FormControl>
                        <FormDescription>Will only be visible to admins</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="computer-science">Computer Science</SelectItem>
                            <SelectItem value="electronics">Electronics & Communication</SelectItem>
                            <SelectItem value="mathematics">Mathematics and Computing</SelectItem>
                            <SelectItem value="electrical">Electrical Engineering</SelectItem>
                            <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                            <SelectItem value="civil">Civil Engineering</SelectItem>
                            <SelectItem value="chemical">Chemical Engineering</SelectItem>
                            <SelectItem value="material-science">Material Science</SelectItem>
                            <SelectItem value="architecture">Architecture</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Graduation Year</FormLabel>
                        <FormControl>
                          <SearchableYearSelect
                            years={yearOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={goToNextTab} className="w-full sm:w-auto">
                    Next: Placement Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="placement" className="space-y-6 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Microsoft, Google" {...field} list="company-suggestions" />
                        </FormControl>
                        <datalist id="company-suggestions">
                          {companies.map((name, index) => (
                            <option key={index} value={name} />
                          ))}
                        </datalist>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tech">Tech</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="core">Core</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="ecommerce">E-Commerce</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Select the industry/sector of the company</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer, Analyst" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="placementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placement Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="on-campus">On-Campus</SelectItem>
                            <SelectItem value="off-campus">Off-Campus</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placementYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placement Year</FormLabel>
                        <FormControl>
                          <SearchableYearSelect
                            years={yearOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="package"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ₹15 LPA" {...field} />
                      </FormControl>
                      <FormDescription>This information will be kept confidential</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                  <Button type="button" variant="outline" onClick={goToPreviousTab} className="w-full sm:w-auto">
                    Back: Personal Info
                  </Button>
                  <Button type="button" onClick={goToNextTab} className="w-full sm:w-auto">
                    Next: Your Experience
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6 pt-2">
                <FormField
                  control={form.control}
                  name="preparationStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preparation Strategy</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share how you prepared for the placement process..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Include resources, study plan, and time management</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interviewProcess"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interview Process</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the interview rounds and selection process..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include details about each round, questions asked, and your approach
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tips for Success</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share tips and advice for future candidates..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>What would you recommend to juniors preparing for this company?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="challenges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenges Faced</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe challenges you faced and how you overcame them..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Share difficulties and how you handled them</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               {/* Add this after the challenges FormField in the experience TabsContent */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-medium">Resources (Optional)</h3>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={addResource}
      className="flex items-center gap-1"
    >
      <PlusCircle className="h-4 w-4" />
      <span>Add Resource</span>
    </Button>
  </div>

  {form.watch("resources")?.length > 0 && (
    <div className="space-y-4">
      {form.watch("resources").map((_, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 space-y-2">
            <FormField
              control={form.control}
              name={`resources.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Resource Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., DSA Course, Interview Prep Guide" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1 space-y-2">
            <FormField
              control={form.control}
              name={`resources.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Resource URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/resource" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeResource(index)}
            className="mt-8 shrink-0"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Remove resource</span>
          </Button>
        </div>
      ))}
    </div>
  )}

  <div className="text-sm text-muted-foreground">
    Add links to helpful resources you used during your preparation (courses, books, websites, etc.)
  </div>
</div>


                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                  <Button type="button" variant="outline" onClick={goToPreviousTab} className="w-full sm:w-auto">
                    Back: Placement Details
                  </Button>
                  <Button type="button" onClick={goToNextTab} className="w-full sm:w-auto">
                    Next: Connect Info
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="connect" className="space-y-6 pt-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Optional Information</AlertTitle>
                  <AlertDescription>
                    This information will help juniors connect with you for guidance. All fields are optional.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="linkedIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., linkedin.com/in/yourprofile" {...field} />
                      </FormControl>
                      <FormDescription>Share your LinkedIn profile for networking</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Profile (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., github.com/yourusername" {...field} />
                      </FormControl>
                      <FormDescription>Share your GitHub profile for technical connections</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., your.email@gmail.com" {...field} />
                      </FormControl>
                      <FormDescription>Share your personal email for direct contact</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I agree to the terms and conditions</FormLabel>
                        <FormDescription>
                          By submitting this form, you agree that your experience may be shared on the Eduiaol
                          Placement Portal.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                  <Button type="button" variant="outline" onClick={goToPreviousTab} className="w-full sm:w-auto">
                    Back: Your Experience
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? "Submitting..." : "Submit Experience"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

