"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, Save } from "lucide-react";
import { listingSchema, ListingFormData } from "@/lib/validations/listing";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useActivityFeed } from "@/context/ActivityFeedContext";
import ConfirmModal from "@/components/ui/ConfirmModal";

import Step1Details from "./Step1Details";
import Step2Pricing from "./Step2Pricing";
import Step3Media from "./Step3Media";
import Step4Review from "./Step4Review";

const STEPS = [
  { id: 1, title: "Details" },
  { id: 2, title: "Pricing & Escrow" },
  { id: 3, title: "Media" },
  { id: 4, title: "Review & Deploy" },
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);

  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      category: undefined,
      media: [],
    },
  });

  const { trigger, getValues, reset } = methods;
  const { toast } = useToast();
  const { recordActivity } = useActivityFeed();

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("marketx_listing_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        reset(parsed);
      } catch (e) {
        console.warn("Failed to parse listing draft from localStorage", e);
      }
    }
  }, [reset]);

  const saveDraft = () => {
    const data = getValues();
    localStorage.setItem("marketx_listing_draft", JSON.stringify(data));
    toast({
      title: "Draft saved",
      description: "Your listing draft was saved locally.",
      variant: "success",
    });
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ListingFormData)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["name", "description", "category"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["priceAmount", "deliveryTimeframe", "disputePeriod"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["media"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (_data: ListingFormData) => {
    setShowDeployConfirm(true);
  };

  const handleDeploy = async () => {
    setShowDeployConfirm(false);
    setIsDeploying(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDeploying(false);
    setIsDeployed(true);
    localStorage.removeItem("marketx_listing_draft");
    recordActivity({
      type: "listing",
      severity: "success",
      title: "Listing deployed",
      description: `${data.name} was published with escrow terms and pricing.`,
      href: "/dashboard/selling",
    });
  };

  return (
    <FormProvider {...methods}>
      <ConfirmModal
        isOpen={showDeployConfirm}
        title="Sign & Deploy Listing?"
        description="This will deploy your listing as a Soroban smart contract on the Stellar network. The transaction is irreversible once signed."
        confirmLabel="Sign & Deploy"
        variant="warning"
        onConfirm={handleDeploy}
        onCancel={() => setShowDeployConfirm(false)}
      />
      <div className="w-full flex-col flex gap-10">
        {/* Stepper Header */}
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -z-10 -translate-y-1/2 transition-all duration-500 ease-out" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} 
          />
          
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > index;
            const isActive = currentStep === index;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-3 relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2",
                  isCompleted ? "bg-blue-600 border-blue-600 text-white" : 
                  isActive ? "bg-[#050505] border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : 
                  "bg-[#050505] border-white/20 text-neutral-500"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className={cn(
                  "absolute -bottom-8 w-max text-xs font-bold tracking-widest uppercase transition-colors hidden sm:block",
                  isActive || isCompleted ? "text-white" : "text-neutral-500"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="h-8 sm:h-12" /> {/* Spacing underneath stepper */}

        {/* Form Content Wrapper */}
        <form onSubmit={methods.handleSubmit(onSubmit)} className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
          
          <div className="flex-grow">
            {currentStep === 0 && <Step1Details />}
            {currentStep === 1 && <Step2Pricing />}
            {currentStep === 2 && <Step3Media />}
            {currentStep === 3 && <Step4Review isDeploying={isDeploying} isDeployed={isDeployed} />}
          </div>

          {/* Navigation Footer */}
          {!isDeployed && (
            <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
              <button
                type="button"
                onClick={currentStep === 0 ? saveDraft : prevStep}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2",
                  currentStep === 0 
                    ? "bg-white/5 hover:bg-white/10 text-neutral-300" 
                    : "text-neutral-400 hover:text-white"
                )}
                disabled={isDeploying}
              >
                {currentStep === 0 ? <><Save className="w-4 h-4" /> Save Draft</> : "Back"}
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isDeploying}
                  className={cn(
                    "px-10 py-3 font-black rounded-xl text-sm transition-all shadow-xl active:scale-95 flex items-center gap-2",
                    isDeploying 
                      ? "bg-blue-600/50 text-white/50 cursor-not-allowed"
                      : "bg-white text-black hover:bg-blue-50"
                  )}
                >
                  {isDeploying ? "Deploying..." : "Sign & Deploy"}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </FormProvider>
  );
}
