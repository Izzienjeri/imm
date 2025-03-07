"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Brain, XCircle, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Disease {
  name: string;
  description: string;
  prevalence: number;
  severity?: "mild" | "moderate" | "severe";
  specialty?: string;
  link?: string;
  treatment?: string;
  symptoms: string[];
  possibleCauses?: string[];
}

interface SymptomCategory {
  name: string;
  symptoms: string[];
}

const dummyDiseases: Disease[] = [
  {
    name: "Common Cold",
    description:
      "A mild viral infection of the upper respiratory tract, typically lasting 7-10 days. It is characterized by inflammation of the nasal passages, leading to various uncomfortable symptoms.",
    prevalence: 85,
    severity: "mild",
    treatment:
      "Rest, fluids, and over-the-counter pain relievers, such as acetaminophen or ibuprofen, are usually sufficient to manage symptoms.  Decongestants and saline nasal sprays can also provide relief.",
    symptoms: ["Runny Nose", "Sore Throat", "Cough", "Fatigue"],
    possibleCauses: [
      "Viral infection (rhinovirus, coronavirus)",
      "Exposure to cold weather (may weaken immune system)",
      "Close contact with infected individuals",
      "Weakened immune system due to stress or lack of sleep",
    ],
  },
  {
    name: "Influenza (Flu)",
    description:
      "A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs. The flu can cause mild to severe illness, and at times can lead to serious complications.",
    prevalence: 15,
    severity: "moderate",
    treatment:
      "Antiviral medications (e.g., Tamiflu, Relenza) can shorten the duration of the illness if taken early. Rest, fluids, and over-the-counter pain relievers can also help manage symptoms.  In severe cases, hospitalization may be required.",
    symptoms: ["Fever", "Cough", "Fatigue", "Muscle Aches", "Headache"],
    possibleCauses: [
      "Influenza virus A or B",
      "Contact with infected individuals (droplet transmission)",
      "Lack of vaccination",
      "Compromised immune system",
    ],
  },
  {
    name: "Allergic Rhinitis",
    description:
      "Inflammation of the nasal passages due to allergens, leading to a range of irritating symptoms.  It is a common condition, affecting a significant portion of the population.",
    prevalence: 20,
    severity: "mild",
    treatment:
      "Antihistamines (e.g., loratadine, cetirizine) can relieve symptoms. Nasal corticosteroids (e.g., fluticasone, mometasone) can reduce inflammation. Avoiding allergens is also crucial. Allergy shots (immunotherapy) may be considered for long-term management.",
    symptoms: ["Runny Nose", "Sneezing", "Itchy Eyes", "Congestion"],
    possibleCauses: [
      "Pollen (seasonal allergies)",
      "Dust mites (house dust allergy)",
      "Pet dander (animal allergies)",
      "Mold spores (mold allergy)",
    ],
  },
  {
    name: "Acute Sinusitis",
    description:
      "Inflammation of the sinuses, often caused by infection, that can cause facial pain, pressure, and congestion. It's usually triggered by a viral infection, but can sometimes be caused by bacteria or fungi.",
    prevalence: 10,
    severity: "moderate",
    treatment:
      "Decongestants and saline nasal sprays can help relieve congestion. Pain relievers (e.g., acetaminophen, ibuprofen) can manage pain.  Antibiotics are prescribed if a bacterial infection is suspected.  In some cases, a nasal rinse may be recommended.",
    symptoms: ["Facial Pain", "Headache", "Runny Nose", "Congestion"],
    possibleCauses: [
      "Bacterial infection (Streptococcus pneumoniae, Haemophilus influenzae)",
      "Viral infection (rhinovirus, influenza virus)",
      "Fungal infection (less common)",
      "Nasal polyps or other structural abnormalities",
    ],
  },
  {
    name: "Tension Headache",
    description:
      "A common type of headache causing pain or pressure around the head. It's often described as a tight band or squeezing sensation around the forehead.",
    prevalence: 40,
    severity: "mild",
    treatment:
      "Pain relievers (e.g., acetaminophen, ibuprofen) can provide relief. Stress management techniques (e.g., yoga, meditation) can help prevent headaches.  Relaxation techniques (e.g., deep breathing, progressive muscle relaxation) can also be beneficial.",
    symptoms: ["Headache"],
    possibleCauses: [
      "Stress",
      "Muscle tension (neck, shoulders)",
      "Dehydration",
      "Poor posture",
      "Lack of sleep",
    ],
  },
  {
    name: "Migraine",
    description:
      "A type of headache that can cause severe throbbing pain or a pulsing sensation, usually on one side of the head. It's often accompanied by nausea, vomiting, and extreme sensitivity to light and sound.",
    prevalence: 12,
    severity: "moderate",
    treatment:
      "Triptans (e.g., sumatriptan, rizatriptan) can abort a migraine attack. Pain relievers (e.g., acetaminophen, ibuprofen) can provide relief for mild migraines.  Preventive medications (e.g., beta-blockers, antidepressants) can reduce the frequency and severity of migraines. Lifestyle changes (e.g., regular sleep schedule, stress management) can also help.",
    symptoms: [
      "Headache",
      "Nausea",
      "Sensitivity to Light",
      "Sensitivity to Sound",
    ],
    possibleCauses: [
      "Genetic factors",
      "Hormonal changes (e.g., menstruation, pregnancy)",
      "Certain foods and drinks (e.g., aged cheese, red wine, chocolate)",
      "Stress",
      "Changes in weather",
    ],
  },
  {
    name: "Gastroesophageal Reflux Disease (GERD)",
    description:
      "A digestive disorder that affects the lower esophageal sphincter (LES), the ring of muscle that connects the esophagus and stomach. When the LES weakens or relaxes inappropriately, stomach acid can flow back into the esophagus, causing irritation and inflammation.",
    prevalence: 20,
    severity: "moderate",
    specialty: "Gastroenterology",
    treatment:
      "Antacids (e.g., Tums, Rolaids) can neutralize stomach acid. H2 blockers (e.g., famotidine, cimetidine) can reduce acid production. Proton pump inhibitors (PPIs) (e.g., omeprazole, lansoprazole) are more potent acid reducers. Lifestyle changes (e.g., weight loss, avoiding trigger foods, elevating the head of the bed) can also help.",
    symptoms: ["Heartburn", "Regurgitation", "Difficulty Swallowing"],
    possibleCauses: [
      "Hiatal hernia (upper part of the stomach bulges through the diaphragm)",
      "Obesity",
      "Smoking",
      "Certain medications (e.g., NSAIDs, aspirin)",
      "Pregnancy",
    ],
  },
  {
    name: "Anxiety Disorder",
    description:
      "A mental health condition characterized by excessive worry or fear that is difficult to control and interferes with daily activities.  It can manifest in various forms, such as generalized anxiety disorder, panic disorder, and social anxiety disorder.",
    prevalence: 18,
    severity: "moderate",
    specialty: "Psychiatry",
    treatment:
      "Therapy (e.g., cognitive behavioral therapy, exposure therapy) can help individuals learn coping skills. Medication (e.g., antidepressants, anti-anxiety medications) can help manage symptoms. Lifestyle changes (e.g., regular exercise, relaxation techniques) can also be beneficial.",
    symptoms: [
      "Excessive Worry",
      "Restlessness",
      "Fatigue",
      "Difficulty Concentrating",
    ],
    possibleCauses: [
      "Genetic factors",
      "Brain chemistry (imbalance of neurotransmitters)",
      "Traumatic experiences",
      "Chronic stress",
      "Medical conditions (e.g., thyroid problems)",
    ],
  },
  {
    name: "Eczema (Atopic Dermatitis)",
    description:
      "A chronic skin condition that causes itchy, inflamed skin. It's a common condition, particularly in children, but it can occur at any age. Eczema is often associated with allergies and asthma.",
    prevalence: 10,
    severity: "moderate",
    specialty: "Dermatology",
    treatment:
      "Moisturizers are essential to keep the skin hydrated. Topical corticosteroids (e.g., hydrocortisone, triamcinolone) can reduce inflammation and itching. Avoiding irritants (e.g., harsh soaps, detergents) is crucial.  Antihistamines can help relieve itching. In severe cases, phototherapy or systemic medications may be necessary.",
    symptoms: ["Itching", "Dry Skin", "Rash", "Inflamed Skin"],
    possibleCauses: [
      "Genetic factors",
      "Immune system dysfunction",
      "Environmental factors (e.g., cold weather, dry air)",
      "Allergens (e.g., pollen, dust mites, pet dander)",
      "Irritants (e.g., soaps, detergents, fragrances)",
    ],
  },
  {
    name: "Hypertension (High Blood Pressure)",
    description:
      "A condition in which blood pressure is persistently elevated. It is a major risk factor for heart disease, stroke, and kidney disease.  Often, there are no symptoms, so it's important to have your blood pressure checked regularly.",
    prevalence: 47,
    severity: "severe",
    specialty: "Cardiology",
    link: "https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/symptoms-causes/syc-20373410",
    treatment:
      "Lifestyle changes, such as diet and exercise, are crucial.  Reducing sodium intake, eating a healthy diet (e.g., DASH diet), and engaging in regular physical activity can lower blood pressure.  Medications (e.g., diuretics, ACE inhibitors, beta-blockers) are often necessary to control blood pressure.",
    symptoms: ["Headache", "Dizziness", "Blurred Vision", "Chest Pain"],
    possibleCauses: [
      "Genetic factors",
      "Obesity",
      "High sodium intake",
      "Lack of physical activity",
      "Excessive alcohol consumption",
      "Smoking",
      "Stress",
      "Kidney disease",
      "Thyroid problems",
    ],
  },
];

const symptomCategories: SymptomCategory[] = [
  {
    name: "General",
    symptoms: ["Fatigue", "Fever", "Chills", "Weight Loss", "Night Sweats"],
  },
  {
    name: "Head & Face",
    symptoms: [
      "Headache",
      "Facial Pain",
      "Vision Changes",
      "Runny Nose",
      "Sore Throat",
      "Itchy Eyes",
    ],
  },
  {
    name: "Respiratory",
    symptoms: [
      "Cough",
      "Shortness of Breath",
      "Wheezing",
      "Chest Pain",
      "Congestion",
    ],
  },
  {
    name: "Digestive",
    symptoms: [
      "Abdominal Pain",
      "Nausea",
      "Vomiting",
      "Diarrhea",
      "Constipation",
      "Difficulty Swallowing",
      "Heartburn",
      "Regurgitation",
    ],
  },
  {
    name: "Skin",
    symptoms: ["Rash", "Itching", "Dry Skin", "Lesions", "Inflamed Skin"],
  },
  {
    name: "Mental/Neurological",
    symptoms: [
      "Excessive Worry",
      "Restlessness",
      "Difficulty Concentrating",
      "Sensitivity to Light",
      "Sensitivity to Sound",
      "Dizziness",
      "Blurred Vision",
    ],
  },
  { name: "Musculoskeletal", symptoms: ["Muscle Aches"] },
];

const calculateMatchScore = (disease: Disease, symptoms: string[]): number => {
  const symptomSet = new Set(symptoms.map((s) => s.toLowerCase()));
  return disease.symptoms.reduce((score, diseaseSymptom) => {
    return symptomSet.has(diseaseSymptom.toLowerCase()) ? score + 1 : score;
  }, 0);
};

const severityColors = {
  mild: "bg-green-100 text-green-700 border-green-300",
  moderate: "bg-yellow-100 text-yellow-700 border-yellow-300",
  severe: "bg-red-100 text-red-700 border-red-300",
  default: "bg-gray-100 text-gray-700 border-gray-300",
} as const;

const getSeverityColor = (severity: string | undefined): string => {
  return severity
    ? severityColors[severity as keyof typeof severityColors]
    : severityColors.default;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const badgeVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.1 } },
};

const suggestionVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  hover: { scale: 1.05, transition: { duration: 0.1 } },
};

const subtleAppear = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const SymptomChecker = () => {
  const [symptomsInput, setSymptomsInput] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [results, setResults] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHelpTip, setShowHelpTip] = useState(true);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const possibleConditionsRef = useRef<HTMLDivElement>(null); // Ref for autoscroll
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const helpTipRef = useRef<HTMLDivElement>(null); // Ref for quick tip
  const [showResults, setShowResults] = useState(false);

  const allSymptoms = useCallback(() => {
    const symptoms = new Set<string>();
    dummyDiseases.forEach((disease) =>
      disease.symptoms.forEach(symptoms.add, symptoms)
    );
    symptomCategories.forEach((category) =>
      category.symptoms.forEach(symptoms.add, symptoms)
    );
    return Array.from(symptoms);
  }, []);

  useEffect(() => {
    if (!symptomsInput) {
      setSuggestions([]);
      return;
    }

    const lowerCaseInput = symptomsInput.toLowerCase();
    setSuggestions(
      allSymptoms()
        .filter((s) => s.toLowerCase().includes(lowerCaseInput))
        .slice(0, 7)
    );
  }, [symptomsInput, allSymptoms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymptomsInput(e.target.value);
    setError(null);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addSymptoms(suggestion);
    setSymptomsInput("");
    setSuggestions([]);
    setError(null);
  };

  const addSymptom = useCallback(
    (symptom: string) => {
      const lowerCaseSymptom = symptom.toLowerCase();
      if (!selectedSymptoms.some((s) => s.toLowerCase() === lowerCaseSymptom)) {
        setSelectedSymptoms((prev) => [...prev, symptom]);
        toast.success(`Symptom "${symptom}" added.`, { duration: 3000 });
      } else {
        toast.warning(`Symptom "${symptom}" is already selected.`, {
          duration: 3000,
        });
      }
      setError(null);
    },
    [selectedSymptoms]
  );

  // Function to handle adding multiple symptoms separated by commas
  const addSymptoms = useCallback(
    (symptomsString: string) => {
      const newSymptoms = symptomsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean); // Remove empty strings

      if (newSymptoms.length === 0) return;

      newSymptoms.forEach((symptom) => {
        const lowerCaseSymptom = symptom.toLowerCase();
        if (
          !selectedSymptoms.some((s) => s.toLowerCase() === lowerCaseSymptom)
        ) {
          setSelectedSymptoms((prev) => [...prev, symptom]);
          toast.success(`Symptom "${symptom}" added.`, { duration: 3000 });
        } else {
          toast.warning(`Symptom "${symptom}" is already selected.`, {
            duration: 3000,
          });
        }
      });

      setError(null);
    },
    [selectedSymptoms]
  );

  const removeSymptom = useCallback((symptomToRemove: string) => {
    setSelectedSymptoms((prevSymptoms) =>
      prevSymptoms.filter((symptom) => symptom !== symptomToRemove)
    );
    toast.success(`Symptom "${symptomToRemove}" removed.`, { duration: 3000 });
    setError(null);
  }, []);

  const handleCategorySymptomClick = useCallback(
    (symptom: string) => {
      addSymptom(symptom);
    },
    [addSymptom]
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedInput = symptomsInput.trim();
      if (trimmedInput) {
        addSymptoms(trimmedInput);
        setSymptomsInput("");
      } else if (suggestions.length > 0) {
        addSymptoms(suggestions[0]);
        setSymptomsInput("");
        setSuggestions([]);
      }
    }

    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      const firstSuggestion =
        document.querySelector<HTMLElement>("#suggestion-0");
      firstSuggestion?.focus();
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (selectedSymptoms.length === 0) {
        toast.error(
          "Please select at least one symptom to check possible causes.",
          { duration: 3000 }
        );
        return;
      }

      setLoading(true);
      setResults([]);
      setError(null);
      setShowResults(false); // Hide results before loading new ones
      toast.info("Analyzing symptoms and searching for potential matches...", {
        duration: 2500,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const filteredDiseases = dummyDiseases
        .map((disease) => ({
          ...disease,
          matchScore: calculateMatchScore(disease, selectedSymptoms),
        }))
        .filter((disease) => disease.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 7);

      setResults(filteredDiseases);
      setLoading(false);
      setShowResults(true);

      if (filteredDiseases.length > 0) {
        toast.success("Potential conditions identified!", { duration: 3500 });

        // Delay scrolling until after the component has re-rendered with the results
        setTimeout(() => {
          if (possibleConditionsRef.current) {
            possibleConditionsRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100); // Small delay to allow the component to re-render
      }
    },
    [selectedSymptoms]
  );

  const dismissHelpTip = useCallback(() => {
    setShowHelpTip(false);
  }, []);

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800 antialiased overflow-hidden font-inter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <header className="bg-white/90 backdrop-blur-md py-6 shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="flex items-center justify-center space-x-3 text-2xl sm:text-3xl font-extrabold text-blue-700">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span>Health Insights Analyzer</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Empowering your health journey through knowledge and understanding.
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pb-12">
        <AnimatePresence>
          {showHelpTip && (
            <motion.div
              className="mb-6 p-4 bg-amber-100 border border-amber-200 rounded-md shadow-sm relative"
              variants={subtleAppear}
              initial="hidden"
              animate="visible"
              exit="hidden"
              ref={helpTipRef} // Assigned ref for quick tip
            >
              <Lightbulb
                className="absolute top-2 right-2 h-5 w-5 text-amber-500 cursor-pointer"
                onClick={dismissHelpTip}
                tabIndex={0}
                aria-label="Dismiss help tip"
              />
              <p
                className="text-sm text-gray-700"
                style={{ width: "100%" }} // Set width to 100%
              >
                <strong className="font-medium">Quick Tip:</strong> Start typing
                your symptoms, and the tool will suggest possible matches. You
                can also explore symptom categories for more ideas.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
                Explore Possible Health Conditions
              </CardTitle>
              <CardContent className="text-sm text-gray-600">
                Describe your symptoms below to explore potential causes and
                gain insights. Remember, this tool provides information and is
                not a substitute for professional medical advice.
              </CardContent>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label
                    htmlFor="symptoms"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter Your Symptoms:
                  </label>
                  <div className="relative mt-2">
                    <Input
                      type="text"
                      id="symptoms"
                      placeholder="e.g., persistent cough, fatigue, headache"
                      value={symptomsInput}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      aria-label="Enter your symptoms"
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />

                    {suggestions.length > 0 && (
                      <ul className="absolute left-0 right-0 mt-1 rounded-md border border-gray-200 bg-white shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <motion.li
                            key={index}
                            id={`suggestion-${index}`}
                            variants={suggestionVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className="cursor-pointer px-4 py-2 hover:bg-gray-50 transition-all duration-200"
                            onClick={() => handleSuggestionClick(suggestion)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSuggestionClick(suggestion);
                              }
                            }}
                          >
                            {suggestion}
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {selectedSymptoms.length > 0 && (
                    <div className="flex flex-wrap items-center justify-start gap-2">
                      {selectedSymptoms.map((symptom) => (
                        <motion.div
                          key={symptom}
                          variants={badgeVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                        >
                          <Badge
                            variant="secondary"
                            onClick={() => removeSymptom(symptom)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                removeSymptom(symptom);
                              }
                            }}
                            className="cursor-pointer bg-blue-100/80 text-blue-700 border border-blue-300 hover:bg-blue-200/80 transition-colors duration-300 shadow-md"
                          >
                            {symptom}{" "}
                            <XCircle className="inline-block ml-1 h-4 w-4" />
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
                <Separator />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Explore Symptom Categories
                  </label>

                  <Accordion
                    type="multiple"
                    collapsible={"true"}
                    className="w-full mt-2"
                    value={openAccordions}
                    onValueChange={setOpenAccordions}
                  >
                    {symptomCategories.map((category) => (
                      <AccordionItem key={category.name} value={category.name}>
                        <AccordionTrigger>{category.name}</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap items-center justify-start gap-2">
                            {category.symptoms.map((symptom) => (
                              <Badge
                                key={symptom}
                                variant="outline"
                                className="cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                onClick={() =>
                                  handleCategorySymptomClick(symptom)
                                }
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleCategorySymptomClick(symptom);
                                  }
                                }}
                              >
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                <Separator />
                {error && (
                  <Alert
                    variant="destructive"
                    className="bg-red-50/80 border-red-400/50"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={loading}
                    ref={submitButtonRef}
                    className={cn(
                      "relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600",
                      "focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50",
                      "transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105",
                      "px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-base sm:text-lg",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                      "group"
                    )}
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-blue-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    {loading ? (
                      <>
                        Analyzing...
                        <motion.div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-blue-200" />
                      </>
                    ) : (
                      "Check Possible Conditions" // Changed button text
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        {loading && (
          <motion.div
            className="mt-8 flex justify-center"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="w-full max-w-3xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-center text-gray-900">
                  Analyzing Your Symptoms...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-full bg-gray-200" />
                <Skeleton className="h-5 w-5/6 bg-gray-200" />
                <Skeleton className="h-5 w-4/6 bg-gray-200" />
                <Skeleton className="h-5 w-2/3 bg-gray-200" />
              </CardContent>
            </Card>
          </motion.div>
        )}
        {showResults && (
          <motion.div
            className="mt-8 flex justify-center"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            ref={possibleConditionsRef} // Assigned ref for scrolling
          >
            <Card className="w-full max-w-3xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-gray-900">
                  Possible Health Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px] rounded-md">
                  <div className="space-y-5">
                    {results.map((disease, index) => (
                      <Card
                        key={index}
                        className="border border-gray-200 bg-white/90 backdrop-blur-md shadow-md transform hover:scale-102 transition-transform duration-200"
                      >
                        <CardHeader className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {disease.name}
                          </CardTitle>
                          {disease.severity && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                getSeverityColor(disease.severity),
                                "shadow-md transition-all duration-300 transform hover:scale-105"
                              )}
                            >
                              {disease.severity}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {" "}
                          <p className="text-gray-700">{disease.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {disease.specialty && (
                              <Badge
                                variant="outline"
                                className="border border-gray-300 text-gray-700 bg-gray-50/80 backdrop-blur-md shadow-sm"
                              >
                                {disease.specialty}
                              </Badge>
                            )}
                            {disease.prevalence && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100/80 text-blue-700 border-blue-300 shadow-sm"
                              >
                                Prevalence: {disease.prevalence}%
                              </Badge>
                            )}
                          </div>
                          {disease.possibleCauses &&
                            disease.possibleCauses.length > 0 && (
                              <div>
                                <strong className="font-medium">
                                  Possible Causes:
                                </strong>
                                <ul className="list-disc pl-5 text-gray-600">
                                  {disease.possibleCauses.map(
                                    (cause, index) => (
                                      <li key={index}>{cause}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          {disease.treatment && (
                            <div>
                              <strong className="font-medium">
                                Typical Treatment Approaches:
                              </strong>
                              <p className="text-gray-600">
                                {disease.treatment}
                              </p>
                            </div>
                          )}
                          {disease.link && (
                            <a
                              href={disease.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-blue-600 hover:underline"
                            >
                              Explore Further Information
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {showResults &&
          results.length === 0 &&
          selectedSymptoms.length > 0 &&
          !loading && (
            <motion.div
              className="mt-8 flex justify-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="w-full max-w-3xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-center text-gray-900">
                    No Strong Matches Identified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert
                    variant="destructive"
                    className="bg-red-50/80 border-red-400/50"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertTitle className="text-red-700">
                      No conditions closely match your symptoms.
                    </AlertTitle>
                    <AlertDescription className="text-red-600">
                      We weren't able to find any conditions that strongly align
                      with the symptoms you provided. It is recommended to
                      consult with a healthcare provider for a comprehensive
                      evaluation and diagnosis. Consider providing more
                      symptoms, or browsing symptom categories for more ideas.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          )}
      </main>
    </motion.div>
  );
};
export default SymptomChecker;
