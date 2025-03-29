"use client";

import { useState } from "react";
import { School } from "@/lib/zod-schema"; // ✅ Import from Zod schemas
// import { SchoolFieldLabels } from "@/lib/ui-schema/fieldLabels"; // ✅ Import field labels
// import FieldConfig from "@/lib/ui-schema/fieldConfig"; // ✅ Import field config
import { createSchool } from "@actions/schools/schools";
import { AllowedGradeEnum } from "@/models/shared";

const createEmptySchool = (): School => ({
    schoolNumber: "",
    district: "",
    schoolName: "",
    address: "",
    emoji: "",
    gradeLevelsSupported: [],
    staffList: [],
    schedules: [],
    cycles: [],
    owners: [],
    _id: undefined,
    createdAt: undefined,
    updatedAt: undefined
});

interface AddSchoolFormProps {
    schools?: School[];
}

const AddSchoolForm: React.FC<AddSchoolFormProps> = ({
    // schools = [],
}) => {
    const [show, setShow] = useState(false);
    const [newSchool, setNewSchool] = useState<School>(createEmptySchool());
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleToggle = () => setShow(prev => !prev);

    const handleAddSchool = async () => {
        try {
            setError(null);
            // ✅ 13. Data Validation: Validate with Zod schema before submission
            const result = await createSchool(newSchool);
            
            if (result.success) {
                setSuccess("School added successfully!");
                setNewSchool(createEmptySchool());
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || "Failed to add school");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
    };

    const handleChange = (key: keyof School, value: string | string[]) => {
        setNewSchool(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
            <button 
                onClick={handleToggle} 
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                {show ? "Hide Form" : "Add New School"}
            </button>
            
            {show && (
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">School Number</label>
                        <input
                            type="text"
                            value={newSchool.schoolNumber}
                            onChange={(e) => handleChange("schoolNumber", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">District</label>
                        <input
                            type="text"
                            value={newSchool.district}
                            onChange={(e) => handleChange("district", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">School Name</label>
                        <input
                            type="text"
                            value={newSchool.schoolName}
                            onChange={(e) => handleChange("schoolName", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            value={newSchool.address || ""}
                            onChange={(e) => handleChange("address", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Emoji</label>
                        <input
                            type="text"
                            value={newSchool.emoji || ""}
                            onChange={(e) => handleChange("emoji", e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Grade Levels</label>
                        <select
                            multiple
                            value={newSchool.gradeLevelsSupported}
                            onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                                handleChange("gradeLevelsSupported", selectedOptions);
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {Object.values(AllowedGradeEnum).map((grade) => (
                                <option key={grade} value={grade}>
                                    {grade}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button
                        onClick={handleAddSchool}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Add School
                    </button>
                    
                    {error && <div className="text-red-500 mt-2">{error}</div>}
                    {success && <div className="text-green-500 mt-2">{success}</div>}
                </div>
            )}
        </div>
    );
};

export default AddSchoolForm; 