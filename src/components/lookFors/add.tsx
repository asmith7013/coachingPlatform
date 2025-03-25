"use client";

import { useState } from "react";
import { LookFor, LookForZodSchema, Rubric } from "@/lib/zod-schema"; // ✅ Import from Zod schemas
import { LookForFieldLabels } from "@/lib/ui-schema/fieldLabels"; // ✅ Import field labels
import FieldConfig from "@/lib/ui-schema/fieldConfig"; // ✅ Import field config
import { createLookFor } from "@actions/lookFors/lookFors";
import { useLookFors } from "@/hooks/useLookFors"; // Import the useLookFors hook
import { validateWithZod } from "@/lib/utils/zodValidation"; // Import the validation function
import DynamicForm from "@/components/dynamicForm"; // Import the DynamicForm component
import { Button } from "@/components/tailwind/button"; // Import the Tailwind Button component

const createEmptyLookFor = (): LookFor => {
    // Create a new LookFor object with default values
    const newLookFor = {
        lookForIndex: 0,
        schools: [] as string[],  
        teachers: [] as string[], 
        topic: "",
        description: "",
        studentFacing: "Yes",
        rubric: [] as Rubric[], 
        owners: [] as string[],  
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined
    };

    // Validate the new LookFor object against the Zod schema using the utility function
    try {
        return validateWithZod(LookForZodSchema, newLookFor); // This will throw if validation fails
    } catch (error) {
        console.error("Validation Error:", error);
        // Return a default LookFor object if validation fails
        return newLookFor; // Ensure a LookFor object is returned
    }
};

const AddLookFor: React.FC = () => {
    const { lookFors, mutate } = useLookFors(); // Use the useLookFors hook
    const [showForm, setShowForm] = useState(false);
    const [newLookFor, setNewLookFor] = useState<LookFor>(createEmptyLookFor());

    const lookForConfig = FieldConfig.LookFor; // ✅ Get only LookFor fields

    const handleToggle = () => setShowForm(prev => !prev);

    const handleAddLookFor = async () => {
        // Use the field config for UI validation
        const requiredFields = Object.keys(lookForConfig).filter(
            key => lookForConfig[key]?.required
        ) as (keyof LookFor)[];

        const missingFields = requiredFields.filter(field => !newLookFor[field]);

        if (missingFields.length > 0) {
            alert(`Missing required fields: ${missingFields.map(f => LookForFieldLabels[f]).join(", ")}`);
            return;
        }

        try {
            // The Zod schema validation happens server-side in the action
            const addedLookFor = await createLookFor(newLookFor);
            if (addedLookFor) {
                setNewLookFor(createEmptyLookFor());
                mutate(); // Re-fetch LookFors to include the newly added LookFor
            }
        } catch (error) {
            console.error("Error adding Look For:", error);
            // alert(error instanceof Error ? error.message : "Failed to add Look For");
        }
    };

    // console.log(lookForConfig, 'lookForConfig');
    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">➕ Add New Look For</h3>
                {lookFors.length > 0 && (
                    <Button onClick={handleToggle} className="bg-blue-500 text-white">
                        {showForm ? "Hide Form" : "Show Form"}
                    </Button>
                )}
            </div>

            {showForm && (
                <div>
                    <DynamicForm 
                        schema={LookForZodSchema}
                        schemaType="LookFor"
                        fieldLabels={LookForFieldLabels}
                        onSubmit={handleAddLookFor}
                    />
                </div>
            )}
        </div>
    );
};

export default AddLookFor;