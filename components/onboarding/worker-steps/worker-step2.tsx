'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, X } from 'lucide-react'
import {
    Zap,
    Wrench,
    Hammer,
    RotateCcw,
    PaintBucket,
    Home,
    Briefcase,
} from 'lucide-react'

const PRESET_SKILLS = [
    { id: 'electrician', label: 'Electrician', icon: Zap },
    { id: 'plumber', label: 'Plumber', icon: Wrench },
    { id: 'carpenter', label: 'Carpenter', icon: Hammer },
    { id: 'appliance-repair', label: 'Appliance Repair', icon: RotateCcw },
    { id: 'painter', label: 'Painter', icon: PaintBucket },
    { id: 'cleaning', label: 'Cleaning', icon: Home },
    { id: 'general-labor', label: 'General Labor', icon: Briefcase },
]

interface Step2Props {
    name: string
    onNext: (skills: string[]) => void
    onBack: () => void
}

export function WorkerStep2({ name, onNext, onBack }: Step2Props) {
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [customSkill, setCustomSkill] = useState('')
    const [error, setError] = useState('')

    const handleToggleSkill = (skillId: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skillId)
                ? prev.filter((s) => s !== skillId)
                : [...prev, skillId]
        )
    }

    const handleAddCustomSkill = () => {
        if (!customSkill.trim()) {
            setError('Please enter a skill name')
            return
        }

        const skillExists = selectedSkills.includes(customSkill) ||
            PRESET_SKILLS.some((s) => s.id === customSkill)

        if (skillExists) {
            setError('This skill is already added')
            return
        }

        setSelectedSkills((prev) => [...prev, customSkill])
        setCustomSkill('')
        setError('')
    }

    const handleRemoveSkill = (skill: string) => {
        setSelectedSkills((prev) => prev.filter((s) => s !== skill))
    }

    const handleNext = () => {
        if (selectedSkills.length === 0) {
            setError('Please select at least one skill')
            return
        }
        onNext(selectedSkills)
    }

    const allSkills = [
        ...PRESET_SKILLS.filter((s) => selectedSkills.includes(s.id)),
        ...selectedSkills.filter((s) => !PRESET_SKILLS.find((ps) => ps.id === s)),
    ]

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
            <div className="w-full max-w-sm">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-primary mb-6 hover:opacity-75 transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                </button>

                {/* Title */}
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    What are your skills?
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                    Select all skills that apply to you. You can add custom skills too.
                </p>

                {/* Selected Skills Display */}
                {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {selectedSkills.map((skill) => {
                            const presetSkill = PRESET_SKILLS.find((s) => s.id === skill)
                            const label = presetSkill ? presetSkill.label : skill
                            return (
                                <div
                                    key={skill}
                                    className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
                                >
                                    <span>{label}</span>
                                    <button
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="hover:opacity-75 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Preset Skills Grid */}
                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-3">
                        {PRESET_SKILLS.map((skill) => {
                            const IconComponent = skill.icon
                            const isSelected = selectedSkills.includes(skill.id)
                            return (
                                <Card
                                    key={skill.id}
                                    onClick={() => handleToggleSkill(skill.id)}
                                    className={`p-4 cursor-pointer transition ${isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <IconComponent
                                            className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                        />
                                        <span className="text-xs text-center font-medium">
                                            {skill.label}
                                        </span>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Add Custom Skill */}
                <div className="space-y-3 mb-6">
                    <Label htmlFor="customSkill" className="text-foreground">
                        Add Your Own Skill
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="customSkill"
                            type="text"
                            placeholder="e.g., Lawn Care"
                            value={customSkill}
                            onChange={(e) => {
                                setCustomSkill(e.target.value)
                                if (error) setError('')
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddCustomSkill()
                                }
                            }}
                            className={error && customSkill ? 'border-red-500' : ''}
                        />
                        <Button
                            onClick={handleAddCustomSkill}
                            variant="outline"
                            className="px-4"
                        >
                            Add
                        </Button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>

                {/* Next Button */}
                <Button
                    onClick={handleNext}
                    className="w-full"
                >
                    Next
                </Button>

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                </div>
            </div>
        </div>
    )
}
