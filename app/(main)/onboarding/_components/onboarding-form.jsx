"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/app/lib/schema";
import { updateUser } from "@/actions/user";
import SkillInput from "./skill-input";
import CompanySelector from "./company-selector";
import InternshipSelector from "./internship-selector";
import AIBioGenerator from "./ai-bio-generator";
import { generateRoadmap } from "@/actions/roadmap";

const STEPS = [
  { id: 1, title: "Basic Information", description: "Tell us about your background" },
  { id: 2, title: "Skills & Experience", description: "What are your strengths?" },
  { id: 3, title: "Career Goals", description: "Where do you want to go?" },
  { id: 4, title: "Preferences", description: "Customize your experience" },
];

const TARGET_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "Product Manager",
  "Project Manager",
  "Product Manager - Technical",
  "IT Project Manager",
  "UI/UX Designer",
  "Graphic Designer",
  "Business Analyst",
  "QA Engineer",
  "Cybersecurity Analyst",
  "Security Engineer",
  "Cloud Architect",
  "Cloud Engineer",
  "Database Administrator",
  "System Administrator",
  "Technical Writer",
  "Scrum Master",
  "Solutions Architect",
  "Sales Engineer",
  "Customer Success Manager",
  "Marketing Manager",
  "Content Writer",
  "SEO Specialist",
  "Digital Marketing Specialist",
  "Career Switcher - IT",
  "Other",
];

const BACKGROUNDS = [
  "B.Tech Computer Science",
  "B.Tech Information Technology",
  "B.Tech Electronics",
  "B.Tech Mechanical",
  "B.Tech Civil",
  "B.Sc Computer Science",
  "B.Sc IT",
  "B.Sc Mathematics",
  "B.Sc Physics",
  "BCA (Bachelor of Computer Applications)",
  "B.Com",
  "BBA",
  "BA Economics",
  "BA English",
  "M.Tech",
  "M.Sc",
  "MCA",
  "MBA",
  "Working Professional - IT",
  "Working Professional - Non-IT",
  "Student",
  "Recent Graduate",
  "Career Switcher",
  "Self-Taught Developer",
  "Bootcamp Graduate",
  "Other",
];

const LOCATIONS = [
  "Remote",
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
  "Australia",
  "Singapore",
  "UAE",
  "Hiring Hub: Bangalore, India",
  "Hiring Hub: Hyderabad, India",
  "Hiring Hub: Silicon Valley, USA",
  "Hiring Hub: London, UK",
  "Hiring Hub: Berlin, Germany",
  "European Union",
  "Asia Pacific",
  "Middle East",
  "Other",
];

const OnboardingForm = ({ industries }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [formData, setFormData] = useState({
    industry: "",
    subIndustry: "",
    experience: "",
    educationLevel: "",
    background: "",
    skills: [],
    targetRole: "",
    targetCompanies: [],
    companySizePref: "",
    locationPref: "",
    internshipInterest: [],
    certificationInterest: false,
    bio: "",
  });

  const { loading: updateLoading, fn: updateUserFn, data: updateResult } =
    useFetch(updateUser);
  const { loading: roadmapLoading, fn: generateRoadmapFn, data: roadmapResult } =
    useFetch(generateRoadmap);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
  });

  // Load saved form data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("onboarding-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        // Restore form values
        Object.keys(parsed).forEach((key) => {
          setValue(key, parsed[key]);
        });
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, [setValue]);

  // Save form data to localStorage
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("onboarding-draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (values) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      const submitData = {
        ...values,
        industry: formattedIndustry,
        skills: values.skills,
        targetCompanies: values.targetCompanies,
        internshipInterest: values.internshipInterest,
      };

      await updateUserFn(submitData);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to save profile. Please try again.");
    }
  };

  useEffect(() => {
    if (updateResult?.id && !updateLoading) {
      // Profile updated, now generate roadmap
      generateRoadmapFn();
    }
  }, [updateResult, updateLoading]);

  useEffect(() => {
    if (roadmapResult?.success && !roadmapLoading) {
      toast.success("Roadmap generated successfully! Let's explore your journey.");
      localStorage.removeItem("onboarding-draft");
      router.push("/roadmap");
      router.refresh();
    }
  }, [roadmapResult, roadmapLoading]);

  const watchIndustry = watch("industry");
  const watchSkills = watch("skills") || [];
  const watchTargetCompanies = watch("targetCompanies") || [];
  const watchInternships = watch("internshipInterest") || [];

  const nextStep = async () => {
    let fieldsToValidate = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["industry", "subIndustry", "educationLevel", "background"];
        break;
      case 2:
        fieldsToValidate = ["experience", "skills"];
        break;
      case 3:
        fieldsToValidate = ["targetRole"];
        break;
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#020617] to-black relative overflow-hidden px-4 py-8">

      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-24 left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Outer card */}
      <Card className="relative z-10 w-full max-w-4xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.25)]">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold text-white">
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {STEPS[currentStep - 1].description}
          </CardDescription>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 pt-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${step.id < currentStep
                  ? "bg-green-600 text-white"
                  : step.id === currentStep
                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                    : "bg-gray-800 text-gray-500"
                  }`}
              >
                {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-black/30 border border-white/10 rounded-xl p-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              className="space-y-6"
            >

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Industry */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Industry *</Label>
                    <Select
                      value={watch("industry")}
                      onValueChange={(value) => {
                        setValue("industry", value);
                        setSelectedIndustry(
                          industries.find((ind) => ind.id === value)
                        );
                        setValue("subIndustry", "");
                      }}
                    >
                      <SelectTrigger className="bg-gray-900 text-white border-white/10">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white">
                        <SelectGroup>
                          <SelectLabel>Industries</SelectLabel>
                          {industries.map((ind) => (
                            <SelectItem key={ind.id} value={ind.id}>
                              {ind.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.industry && (
                      <p className="text-sm text-red-400">{errors.industry.message}</p>
                    )}
                  </div>

                  {/* Sub Industry */}
                  {watchIndustry && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Specialization *</Label>
                      <Select
                        value={watch("subIndustry")}
                        onValueChange={(value) => setValue("subIndustry", value)}
                      >
                        <SelectTrigger className="bg-gray-900 text-white border-white/10">
                          <SelectValue placeholder="Select your specialization" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 text-white">
                          {selectedIndustry?.subIndustries.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subIndustry && (
                        <p className="text-sm text-red-400">{errors.subIndustry.message}</p>
                      )}
                    </div>
                  )}

                  {/* Education */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Education Level *</Label>
                    <Select
                      value={watch("educationLevel")}
                      onValueChange={(v) => setValue("educationLevel", v)}
                    >
                      <SelectTrigger className="bg-gray-900 text-white border-white/10">
                        <SelectValue placeholder="Select your highest education" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white">
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Graduate">Graduate (Bachelor's)</SelectItem>
                        <SelectItem value="Post Graduate">Post Graduate (Master's)</SelectItem>
                        <SelectItem value="PhD">PhD / Doctorate</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.educationLevel && (
                      <p className="text-sm text-red-400">{errors.educationLevel.message}</p>
                    )}
                  </div>

                  {/* Background */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Background *</Label>
                    <Select
                      value={watch("background")}
                      onValueChange={(v) => setValue("background", v)}
                    >
                      <SelectTrigger className="bg-gray-900 text-white border-white/10">
                        <SelectValue placeholder="Select your background" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white max-h-[300px]">
                        <SelectGroup>
                          <SelectLabel>Educational Background</SelectLabel>
                          {BACKGROUNDS.map((bg) => (
                            <SelectItem key={bg} value={bg}>
                              {bg}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.background && (
                      <p className="text-sm text-red-400">{errors.background.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Select the option that best describes your background
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Skills & Experience */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Experience */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Years of Experience *</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      {...register("experience")}
                      placeholder="0"
                      className="bg-gray-900 text-white border-white/10"
                    />
                    {errors.experience && (
                      <p className="text-sm text-red-400">{errors.experience.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Enter 0 if you're a student or fresher
                    </p>
                  </div>

                  {/* Skills with Proficiency */}
                  <SkillInput
                    skills={watchSkills}
                    onChange={(skills) => setValue("skills", skills)}
                  />
                  {errors.skills && (
                    <p className="text-sm text-red-400">{errors.skills.message}</p>
                  )}
                </div>
              )}

              {/* Step 3: Career Goals */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Target Role */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Target Role *</Label>
                    <Select
                      value={watch("targetRole")}
                      onValueChange={(v) => setValue("targetRole", v)}
                    >
                      <SelectTrigger className="bg-gray-900 text-white border-white/10">
                        <SelectValue placeholder="Select your target role" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white max-h-[300px]">
                        <SelectGroup>
                          <SelectLabel>Career Roles</SelectLabel>
                          {TARGET_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.targetRole && (
                      <p className="text-sm text-red-400">{errors.targetRole.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      What position are you aiming for?
                    </p>
                  </div>

                  {/* Target Companies */}
                  <CompanySelector
                    selected={watchTargetCompanies}
                    onChange={(companies) => setValue("targetCompanies", companies)}
                  />

                  {/* Professional Bio with AI */}
                  <AIBioGenerator
                    value={watch("bio")}
                    onChange={(bio) => setValue("bio", bio)}
                    userProfile={{
                      targetRole: watch("targetRole"),
                      skills: watch("skills"),
                      experience: watch("experience"),
                      industry: watch("industry"),
                      subIndustry: watch("subIndustry"),
                      educationLevel: watch("educationLevel"),
                      background: watch("background"),
                      targetCompanies: watch("targetCompanies"),
                    }}
                  />
                </div>
              )}

              {/* Step 4: Preferences */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Company Size */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Preferred Company Size (Optional)</Label>
                    <Select
                      value={watch("companySizePref")}
                      onValueChange={(v) => setValue("companySizePref", v)}
                    >
                      <SelectTrigger className="bg-gray-900 text-white border-white/10">
                        <SelectValue placeholder="Select preferred company size" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white">
                        <SelectItem value="Startup (1–50)">Startup (1–50 employees)</SelectItem>
                        <SelectItem value="Small (51–200)">Small (51–200 employees)</SelectItem>
                        <SelectItem value="Mid-size (201–1000)">Mid-size (201–1000 employees)</SelectItem>
                        <SelectItem value="Large (1000+)">Large (1000+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Preferred Location (Optional)</Label>
                    <Select
                      value={watch("locationPref")}
                      onValueChange={(v) => setValue("locationPref", v)}
                    >
                      <SelectTrigger className="bg-gray-900 text-white border-white/10">
                        <SelectValue placeholder="Select preferred location" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white max-h-[300px]">
                        <SelectGroup>
                          <SelectLabel>Locations</SelectLabel>
                          {LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.locationPref && (
                      <p className="text-sm text-red-400">{errors.locationPref.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Where would you like to work?
                    </p>
                  </div>

                  {/* Internship Interest */}
                  <InternshipSelector
                    selected={watchInternships}
                    onChange={(internships) => setValue("internshipInterest", internships)}
                  />

                  {/* Certification Interest */}
                  <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      {...register("certificationInterest")}
                      className="w-5 h-5 mt-0.5 rounded accent-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-gray-300 text-sm font-medium block">
                        I am interested in professional certifications
                      </span>
                      <span className="text-gray-500 text-xs">
                        We'll recommend relevant certifications and help you prepare
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-white/10">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="border-white/10 hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={updateLoading || roadmapLoading}
                    className="bg-green-600 hover:bg-green-700 shadow-lg"
                  >
                    {updateLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : roadmapLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Roadmap...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Complete Profile
                      </>
                    )}
                  </Button>
                )}
              </div>

            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
