"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TokenStorage } from "@/services/token-storage"
import ApiService from "@/services/api-services"

const clientSchema = yup.object({
  name: yup.string().required("Name is required"),
  phone: yup.string().required("Phone is required"),
  location: yup.string().required("Location is required"),
})

type ClientOnboardingData = yup.InferType<typeof clientSchema>

export function ClientOnboarding() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientOnboardingData>({
    resolver: yupResolver(clientSchema),
    defaultValues: { name: "", phone: "", location: "" },
  })

  async function onSubmit(data: ClientOnboardingData) {
    try {
      await ApiService.post("/auth/onboarding", {
        name: data.name,
        phone: data.phone,
        location: data.location,
        skills: [],
        serviceDescription: "",
      })
      TokenStorage.setHasCompleted(true)
      toast.success("Profile updated!")
      router.replace("/client/dashboard")
    } catch {
      toast.error("Failed to save profile. Please try again.")
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Complete your profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tell us a bit about yourself (Client)
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                placeholder="Your name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                placeholder="City or area"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Complete"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
