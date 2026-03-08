"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type AIModel = {
  id: string
  name: string
  provider: string
  description: string
  category: "general" | "coding" | "academic" | "creative"
}

export const AI_MODELS: AIModel[] = [
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "Latest DeepSeek model — fast, smart, free",
    category: "general",
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "Research-focused model with strong analytical abilities",
    category: "academic",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    provider: "Meta",
    description: "Meta's powerful 70B instruction-tuned model",
    category: "general",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    name: "Llama 3.1 8B",
    provider: "Meta",
    description: "Fast, lightweight Meta model",
    category: "general",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    provider: "Google",
    description: "Google's 27B instruction-tuned model",
    category: "general",
  },
  {
    id: "google/gemma-3-12b-it:free",
    name: "Gemma 3 12B",
    provider: "Google",
    description: "Google's 12B instruction-tuned model",
    category: "general",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B",
    provider: "Mistral AI",
    description: "Fast and capable 7B parameter model",
    category: "general",
  },
  {
    id: "qwen/qwen2.5-72b-instruct:free",
    name: "Qwen 2.5 72B",
    provider: "Alibaba",
    description: "Large model with strong multilingual capabilities",
    category: "general",
  },
  {
    id: "qwen/qwen2.5-coder-32b-instruct:free",
    name: "Qwen 2.5 Coder 32B",
    provider: "Alibaba",
    description: "Specialized coding model with 32B parameters",
    category: "coding",
  },
  {
    id: "openchat/openchat-olympiccoder-32b:free",
    name: "OlympicCoder 32B",
    provider: "OpenChat",
    description: "Specialized for coding tasks with 32B parameters",
    category: "coding",
  },
  {
    id: "openchat/openchat-olympiccoder-7b:free",
    name: "OlympicCoder 7B",
    provider: "OpenChat",
    description: "Lightweight coding specialist with 7B parameters",
    category: "coding",
  },
]

interface ModelSelectorProps {
  selectedModel: AIModel
  onSelectModel: (model: AIModel) => void
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex items-center gap-1 truncate max-w-[calc(100%-20px)]">
            <span className="truncate font-medium">{selectedModel.name}</span>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">{selectedModel.provider}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] max-w-[90vw] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup heading="General Purpose">
              {AI_MODELS.filter((m) => m.category === "general").map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => {
                    onSelectModel(model)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedModel.id === model.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate">{model.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {model.provider} - {model.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Coding Specialists">
              {AI_MODELS.filter((m) => m.category === "coding").map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => {
                    onSelectModel(model)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedModel.id === model.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate">{model.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {model.provider} - {model.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Academic Research">
              {AI_MODELS.filter((m) => m.category === "academic").map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => {
                    onSelectModel(model)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedModel.id === model.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate">{model.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {model.provider} - {model.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
