import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Building, MapPin, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Experience } from "@/lib/data-utils"
import { getCompanyLogo, getRandomProfileImage, getCompanyColor } from "@/lib/image-utils"

interface ExperienceCardProps {
  experience: Experience
  showLink?: boolean
}

export function ExperienceCard({ experience, showLink = true }: ExperienceCardProps) {
  // Ensure we have a profile picture and company logo
  const profilePicture =  getRandomProfileImage()
  const companyLogo = getCompanyLogo(experience.company)
  const companyColor = getCompanyColor(experience.company)

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <Image
              src={profilePicture || "/placeholder.svg"}
              alt={experience.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-base line-clamp-1">{experience.name}</CardTitle>
            <CardDescription className="text-xs line-clamp-1">
              {experience.branch}, {experience.batch}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: companyLogo.includes("default") ? companyColor : "transparent" }}
          >
            <Image
              src={company.logo || "/companies/company.png"}
              alt={experience.company}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-1">{experience.company}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{experience.role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mb-2">
          {experience.ctc && (
            <div className="flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />
              <span className="truncate">₹{experience.ctc} LPA</span>
            </div>
          )}
          {experience.companyType && (
            <div className="flex items-center">
              <Building className="h-3 w-3 mr-1" />
              <span className="truncate">{experience.companyType}</span>
            </div>
          )}
          {experience.location && (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{experience.location}</span>
            </div>
          )}
          {experience.submittedAt && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="truncate">
                {experience.submittedAt.toDate
                  ? experience.submittedAt.toDate().toLocaleDateString()
                  : new Date(experience.submittedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        {experience.process && (
          <div className="mb-2">
            <h5 className="text-xs font-medium mb-1">Selection Process</h5>
            <p className="text-xs line-clamp-3">{experience.process}</p>
          </div>
        )}
      </CardContent>
      {showLink && (
        <CardFooter className="pt-2">
          <Link
            href={`/experiences/${experience.id}`}
            className="text-xs text-primary hover:underline w-full text-center"
          >
            Read Full Experience
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}

