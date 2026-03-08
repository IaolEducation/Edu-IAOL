"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createExperience, getExperiences } from "@/lib/api"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const experienceSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  company: z.string().min(2, {
    message: "Company must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  startDate: z.string().min(2, {
    message: "Start Date must be at least 2 characters.",
  }),
  endDate: z.string().min(2, {
    message: "End Date must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  challenges: z.string().min(10, {
    message: "Challenges must be at least 10 characters.",
  }),
  resources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
})

type Experience = z.infer<typeof experienceSchema>

const AdminPage = () => {
  const queryClient = useQueryClient()

  const {
    data: experiences,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["experiences"],
    queryFn: getExperiences,
  })

  const mutation = useMutation({
    mutationFn: createExperience,
    onSuccess: () => {
      toast.success("Experience created successfully!")
      queryClient.invalidateQueries({ queryKey: ["experiences"] })
    },
    onError: () => {
      toast.error("Failed to create experience.")
    },
  })

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">Admin</h1>
        <CreateExperienceDialog mutation={mutation} />
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p>Error fetching experiences.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {experiences?.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      )}
    </div>
  )
}

interface CreateExperienceDialogProps {
  mutation: {
    mutate: (values: Experience) => void
    isPending: boolean
  }
}

const CreateExperienceDialog: React.FC<CreateExperienceDialogProps> = ({ mutation }) => {
  const form = useForm<Experience>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      challenges: "",
      resources: [],
    },
  })

  function onSubmit(values: Experience) {
    mutation.mutate(values)
    form.reset()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Experience</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Experience</DialogTitle>
          <DialogDescription>Add a new experience to showcase on your profile.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="New York, NY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input placeholder="January 2021" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input placeholder="December 2022" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Developed and maintained..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenges</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Overcoming technical hurdles..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface ExperienceCardProps {
  experience: Experience
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle>{experience.title}</CardTitle>
        <CardDescription>
          {experience.company} - {experience.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{experience.startDate}</Badge>
          <Badge variant="secondary">{experience.endDate}</Badge>
        </div>
        {showDetails && (
          <>
            <Separator className="my-2" />
            <p className="text-sm sm:text-md text-muted-foreground">{experience.description}</p>
            <Separator className="my-2" />
            <div>
              <h3 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2">Challenges</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{experience.challenges}</p>
            </div>
            {showDetails && experience.resources && experience.resources.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2">Helpful Resources</h3>
                  <div className="space-y-1">
                    {experience.resources.map((resource, index) => (
                      <p key={index} className="text-xs sm:text-sm text-muted-foreground">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {resource.title}
                        </a>
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
        <Button variant="link" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "Hide Details" : "Show Details"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default AdminPage

