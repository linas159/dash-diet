"use client";

import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion } from "@/types/quiz";
import { useState } from "react";
import { lbsToKg, kgToLbs, inToCm, cmToIn } from "@/lib/utils";

interface QuestionRendererProps {
  question: QuizQuestion;
  value: string | string[] | number | undefined;
  onChange: (value: string | string[] | number) => void;
  onNext: (autoAdvance?: boolean) => void;
}

const isNoneOption = (optionId: string) => {
  return optionId === "none" || optionId.includes("none");
};

export default function QuestionRenderer({
  question,
  value,
  onChange,
  onNext,
}: QuestionRendererProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="px-4 pb-32"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {question.question}
          </h2>
          {question.subtitle && (
            <p className="mt-2 text-sm text-gray-500">{question.subtitle}</p>
          )}
        </div>

        {question.type === "single" && (
          <SingleSelect
            question={question}
            value={value as string}
            onChange={(v) => {
              onChange(v);
              setTimeout(() => onNext(true), 300);
            }}
          />
        )}

        {question.type === "multiple" && (
          <MultipleSelect
            question={question}
            value={(value as string[]) || []}
            onChange={onChange}
            onNext={onNext}
          />
        )}

        {question.type === "gender" && (
          <GenderSelect
            question={question}
            value={value as string}
            onChange={(v) => {
              onChange(v);
              setTimeout(() => onNext(true), 300);
            }}
          />
        )}

        {question.type === "body-type" && (
          <BodyTypeSelect
            question={question}
            value={value as string}
            onChange={(v) => {
              onChange(v);
              setTimeout(() => onNext(true), 300);
            }}
          />
        )}

        {(question.type === "number" ||
          question.type === "height" ||
          question.type === "weight") && (
          <NumberInput
            question={question}
            value={value as number}
            onChange={onChange}
          />
        )}

        {question.type === "scale" && (
          <ScaleSelect
            question={question}
            value={value as string}
            onChange={(v) => {
              onChange(v);
              setTimeout(() => onNext(true), 300);
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function SingleSelect({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      {question.options?.map((option, i) => (
        <motion.button
          key={option.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`option-card flex items-center gap-3 ${
            value === option.id ? "option-card-selected" : ""
          }`}
          onClick={() => onChange(option.id)}
        >
          {option.emoji && (
            <span className="text-2xl flex-shrink-0">{option.emoji}</span>
          )}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900">{option.label}</span>
            {option.description && (
              <p className="text-xs text-gray-500 mt-0.5">
                {option.description}
              </p>
            )}
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              value === option.id
                ? "border-dash-blue bg-dash-blue"
                : "border-gray-300"
            }`}
          >
            {value === option.id && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 6L5 9L10 3"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function MultipleSelect({
  question,
  value,
  onChange,
  onNext,
}: {
  question: QuizQuestion;
  value: string[];
  onChange: (v: string[]) => void;
  onNext: (autoAdvance?: boolean) => void;
}) {
  const toggleOption = (optionId: string) => {
    if (isNoneOption(optionId)) {
      onChange([optionId]);
      // Auto-advance when "none" is selected
      setTimeout(() => onNext(true), 300);
      return;
    }
    const filtered = value.filter((v) => !isNoneOption(v));
    if (filtered.includes(optionId)) {
      onChange(filtered.filter((v) => v !== optionId));
    } else {
      onChange([...filtered, optionId]);
    }
  };

  return (
    <div className="space-y-3">
      {question.options?.map((option, i) => {
        const isNone = isNoneOption(option.id);
        const isFirstNone = isNone && !isNoneOption(question.options?.[i - 1]?.id || "");

        return (
          <div key={option.id}>
            {/* Add separator before "none" options */}
            {isFirstNone && (
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">or</span>
                </div>
              </div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`option-card flex items-center gap-3 ${
                value.includes(option.id) ? "option-card-selected" : ""
              }`}
              onClick={() => toggleOption(option.id)}
            >
              {option.emoji && (
                <span className="text-2xl flex-shrink-0">{option.emoji}</span>
              )}
              <span className="flex-1 font-medium text-gray-900 text-left">
                {option.label}
              </span>
              <div
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  value.includes(option.id)
                    ? "border-dash-blue bg-dash-blue"
                    : "border-gray-300"
                }`}
              >
                {value.includes(option.id) && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

function GenderSelect({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {question.options?.map((option, i) => (
        <motion.button
          key={option.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all
            ${
              value === option.id
                ? "border-dash-blue bg-primary-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300"
            }`}
          onClick={() => onChange(option.id)}
        >
          <span className="text-5xl">{option.emoji}</span>
          <span className="font-semibold text-gray-900">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function BodyTypeSelect({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {question.options?.map((option, i) => (
        <motion.button
          key={option.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all
            ${
              value === option.id
                ? "border-dash-blue bg-primary-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300"
            }`}
          onClick={() => onChange(option.id)}
        >
          <span className="text-3xl">{option.emoji}</span>
          <span className="font-semibold text-sm text-gray-900">
            {option.label}
          </span>
          {option.description && (
            <span className="text-[11px] text-gray-500 text-center leading-tight">
              {option.description}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}

function NumberInput({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: number;
  onChange: (v: number) => void;
}) {
  const isHeight = question.type === "height";
  const isWeight = question.type === "weight";
  const hasUnitToggle = isHeight || isWeight;

  // Unit state: "metric" = cm/kg, "imperial" = ft+in/lbs
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // For height in imperial, store feet and inches separately
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  // Convert the stored metric value to the display value based on unit system
  const getDisplayValue = (metricVal: number | undefined): string => {
    if (!metricVal) return "";
    if (unitSystem === "imperial") {
      if (isHeight) {
        // For height, we'll handle feet+inches separately
        return "";
      }
      if (isWeight) return kgToLbs(metricVal).toString();
    }
    return metricVal.toString();
  };

  const [inputValue, setInputValue] = useState(getDisplayValue(value));

  // Initialize feet and inches from value when component mounts or value changes
  useState(() => {
    if (value && isHeight && unitSystem === "imperial") {
      const totalInches = cmToIn(value);
      const ft = Math.floor(totalInches / 12);
      const inch = Math.round(totalInches % 12);
      setFeet(ft.toString());
      setInches(inch.toString());
    }
  });

  // Get the display unit label
  const displayUnit = (() => {
    if (unitSystem === "imperial") {
      if (isHeight) return ""; // No unit needed for feet+inches (shown separately)
      if (isWeight) return "lbs";
    }
    return question.unit || "";
  })();

  // Get min/max for current unit
  const getRange = () => {
    const min = question.min ?? 0;
    const max = question.max ?? 999;
    if (unitSystem === "imperial") {
      if (isHeight) return { min: Math.round(cmToIn(min)), max: Math.round(cmToIn(max)) };
      if (isWeight) return { min: Math.round(kgToLbs(min)), max: Math.round(kgToLbs(max)) };
    }
    return { min, max };
  };

  const range = getRange();

  const handleChange = (val: string) => {
    setInputValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      // Always store as metric (cm / kg)
      if (unitSystem === "imperial") {
        if (isHeight) {
          // This shouldn't be called for height in imperial (we use feet+inches handlers)
          onChange(inToCm(num));
        } else if (isWeight) {
          onChange(lbsToKg(num));
        } else {
          onChange(num);
        }
      } else {
        onChange(num);
      }
    }
  };

  const handleFeetChange = (val: string) => {
    setFeet(val);
    const ft = parseFloat(val) || 0;
    const inch = parseFloat(inches) || 0;
    const totalInches = ft * 12 + inch;
    if (totalInches > 0) {
      onChange(inToCm(totalInches));
    }
  };

  const handleInchesChange = (val: string) => {
    setInches(val);
    const ft = parseFloat(feet) || 0;
    const inch = parseFloat(val) || 0;
    const totalInches = ft * 12 + inch;
    if (totalInches > 0) {
      onChange(inToCm(totalInches));
    }
  };

  const toggleUnit = (system: "metric" | "imperial") => {
    if (system === unitSystem) return;
    setUnitSystem(system);
    // Convert displayed value
    if (value) {
      if (system === "imperial") {
        if (isHeight) {
          const totalInches = cmToIn(value);
          const ft = Math.floor(totalInches / 12);
          const inch = Math.round(totalInches % 12);
          setFeet(ft.toString());
          setInches(inch.toString());
        }
        if (isWeight) setInputValue(kgToLbs(value).toString());
      } else {
        // value is already metric, just display it
        setInputValue(value.toString());
        setFeet("");
        setInches("");
      }
    }
  };

  // Get the slider display value (in total inches for imperial height)
  const sliderValue = (() => {
    if (!value) return range.min;
    if (unitSystem === "imperial") {
      if (isHeight) return Math.round(cmToIn(value));
      if (isWeight) return Math.round(kgToLbs(value));
    }
    return value;
  })();

  const handleSliderChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (unitSystem === "imperial" && isHeight) {
        // Update feet and inches from slider
        const ft = Math.floor(num / 12);
        const inch = Math.round(num % 12);
        setFeet(ft.toString());
        setInches(inch.toString());
        onChange(inToCm(num));
      } else {
        handleChange(val);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Unit toggle for height/weight */}
      {hasUnitToggle && (
        <div className="flex bg-gray-100 rounded-xl p-1 w-full max-w-[240px]">
          <button
            type="button"
            onClick={() => toggleUnit("metric")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              unitSystem === "metric"
                ? "bg-white text-dash-blue shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {isHeight ? "cm" : "kg"}
          </button>
          <button
            type="button"
            onClick={() => toggleUnit("imperial")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              unitSystem === "imperial"
                ? "bg-white text-dash-blue shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {isHeight ? "ft / in" : "lbs"}
          </button>
        </div>
      )}

      {/* Input field(s) */}
      {isHeight && unitSystem === "imperial" ? (
        // Feet and inches inputs for imperial height
        <div className="flex gap-3 w-full">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              className="number-input"
              value={feet}
              onChange={(e) => handleFeetChange(e.target.value)}
              placeholder="0"
              min="3"
              max="8"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg text-gray-400 font-medium">
              ft
            </span>
          </div>
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              className="number-input"
              value={inches}
              onChange={(e) => handleInchesChange(e.target.value)}
              placeholder="0"
              min="0"
              max="11"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg text-gray-400 font-medium">
              in
            </span>
          </div>
        </div>
      ) : (
        // Single input for metric or weight
        <div className="relative w-full">
          <input
            type="number"
            inputMode="decimal"
            className="number-input"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder || "0"}
            min={range.min}
            max={range.max}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg text-gray-400 font-medium">
            {displayUnit}
          </span>
        </div>
      )}

      {question.min !== undefined && question.max !== undefined && (
        <div className="w-full px-2">
          <input
            type="range"
            min={range.min}
            max={range.max}
            value={sliderValue}
            onChange={(e) => handleSliderChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                       [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-dash-blue [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">
              {isHeight && unitSystem === "imperial"
                ? `${Math.floor(range.min / 12)}' ${range.min % 12}"`
                : `${range.min} ${displayUnit}`}
            </span>
            <span className="text-xs text-gray-400">
              {isHeight && unitSystem === "imperial"
                ? `${Math.floor(range.max / 12)}' ${range.max % 12}"`
                : `${range.max} ${displayUnit}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ScaleSelect({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      {question.options?.map((option, i) => (
        <motion.button
          key={option.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`option-card flex items-center gap-3 ${
            value === option.id ? "option-card-selected" : ""
          }`}
          onClick={() => onChange(option.id)}
        >
          <span className="text-2xl">{option.emoji}</span>
          <span className="flex-1 font-medium text-gray-900">
            {option.label}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className={`w-2.5 h-2.5 rounded-full ${
                  j < parseInt(option.id)
                    ? "bg-dash-teal"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
