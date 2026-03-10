import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Send, CheckCircle, Loader2, AlertCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || ""

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(20, "Please tell us a bit more (at least 20 characters)"),
  preferredDuration: z.enum(["20", "30", "40"]),
})

type TechAuditFormData = z.infer<typeof formSchema>

export function TechAuditBookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TechAuditFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredDuration: "30",
    },
  })

  async function onSubmit(data: TechAuditFormData) {
    setIsSubmitting(true)
    setErrorMessage(null)

    const messageBody = [
      `Business: ${data.businessName}`,
      `Preferred Duration: ${data.preferredDuration} minutes`,
      "",
      "Description:",
      data.description,
    ].join("\n")

    if (!WEB3FORMS_ACCESS_KEY) {
      const subject = encodeURIComponent(`Tech Audit Request: ${data.businessName} (${data.name})`)
      const body = encodeURIComponent(messageBody)
      window.location.href = `mailto:danher2525@gmail.com?subject=${subject}&body=${body}`
      setIsSubmitting(false)
      setIsSuccess(true)
      reset()
      return
    }

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Tech Audit Request: ${data.businessName} (${data.name})`,
          from_name: data.name,
          email: data.email,
          replyto: data.email,
          message: messageBody,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        reset()
      } else {
        throw new Error(result.message || "Failed to send request")
      }
    } catch (error) {
      console.error("Tech audit form error:", error)
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send request. Please try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="booking" className="py-20">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Your Session</h2>
          <p className="text-muted-foreground">
            Fill out the form below and I will reach out within 24 hours to schedule your session.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 md:p-10">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
                  <p className="text-muted-foreground max-w-md">
                    I will reach out within 24 hours to schedule your free technology audit. Check
                    your inbox for a confirmation.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setIsSuccess(false)}
                  >
                    Submit Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="audit-name">Your Name</Label>
                      <Input
                        id="audit-name"
                        placeholder="Jane Smith"
                        {...register("name")}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audit-email">Email</Label>
                      <Input
                        id="audit-email"
                        type="email"
                        placeholder="jane@company.com"
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audit-business">Business Name</Label>
                    <Input
                      id="audit-business"
                      placeholder="Acme Corp"
                      {...register("businessName")}
                      className={errors.businessName ? "border-red-500" : ""}
                    />
                    {errors.businessName && (
                      <p className="text-sm text-red-500">{errors.businessName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audit-duration">Preferred Session Length</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["20", "30", "40"] as const).map((duration) => (
                        <label
                          key={duration}
                          className="relative flex items-center justify-center gap-2 p-3 rounded-lg border border-border/50 cursor-pointer hover:border-emerald-500/50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/10 transition-colors"
                        >
                          <input
                            type="radio"
                            value={duration}
                            {...register("preferredDuration")}
                            className="sr-only"
                          />
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{duration} min</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audit-description">
                      Tell me about your business and what you'd like to discuss
                    </Label>
                    <Textarea
                      id="audit-description"
                      placeholder="What tools do you currently use? What challenges are you facing with technology? What would you like to improve?"
                      className={`min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Request Your Free Audit <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    No cost. No obligation. No sales pitch. Just real insights about your technology.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
