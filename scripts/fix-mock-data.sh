#!/bin/bash

echo "Creating models directory for mock data..."

# Create models directory structure
mkdir -p src/lib/models/shared

# Create shared-types.model.ts
cat > src/lib/models/shared/shared-types.model.ts << 'EOF'
export enum AllowedGradeEnum {
  KINDERGARTEN = "Kindergarten",
  GRADE_1 = "Grade 1",
  GRADE_2 = "Grade 2",
  GRADE_3 = "Grade 3",
  GRADE_4 = "Grade 4",
  GRADE_5 = "Grade 5",
  GRADE_6 = "Grade 6",
  GRADE_7 = "Grade 7",
  GRADE_8 = "Grade 8",
  GRADE_9 = "Grade 9",
  GRADE_10 = "Grade 10",
  GRADE_11 = "Grade 11",
  GRADE_12 = "Grade 12"
}

export enum AllowedSubjectsEnum {
  MATH_6 = "Math 6",
  MATH_7 = "Math 7",
  MATH_8 = "Math 8",
  ALGEBRA_I = "Algebra I",
  GEOMETRY = "Geometry",
  ALGEBRA_II = "Algebra II"
}

export enum AllowedSpecialGroupsEnum {
  SPED = "SPED",
  ELL = "ELL"
}

export enum TLAdminTypeEnum {
  COACH = "Coach",
  CPM = "CPM",
  DIRECTOR = "Director",
  SENIOR_DIRECTOR = "Senior Director"
}
EOF

# Create index.ts
cat > src/lib/models/shared/index.ts << 'EOF'
export enum AllowedRolesNYCPSEnum {
  TEACHER = "Teacher",
  PRINCIPAL = "Principal",
  AP = "AP",
  COACH = "Coach",
  ADMINISTRATOR = "Administrator"
}

export enum AllowedRolesTLEnum {
  COACH = "Coach",
  CPM = "CPM",
  DIRECTOR = "Director",
  SENIOR_DIRECTOR = "Senior Director"
}

export enum YesNoEnum {
  YES = "Yes",
  NO = "No"
}

export enum LengthTypeEnum {
  FULL_DAY = "Full day - 6 hours",
  HALF_DAY = "Half day - 3 hours"
}

export enum TeacherLeaderTypeEnum {
  TEACHER_SUPPORT = "Teacher support",
  LEADER_SUPPORT = "Leader support",
  BOTH = "Teacher OR teacher & leader support"
}
EOF

# Create placeholder for mockRubrics
mkdir -p scripts/seed
cat > scripts/seed/mockRubrics.ts << 'EOF'
export const exampleRubrics = [
  {
    score: 1,
    category: ["Teaching", "Planning"],
    content: ["Basic understanding of concepts"],
    hex: "#FF5733"
  },
  {
    score: 2,
    category: ["Teaching", "Planning"],
    content: ["Good understanding of concepts"],
    hex: "#33FF57"
  },
  {
    score: 3,
    category: ["Teaching", "Planning"],
    content: ["Excellent understanding of concepts"],
    hex: "#3357FF"
  }
];
EOF

# Update mock data import paths
find src/lib/utils/dev -type f -name "mockData.ts" | xargs sed -i '' 's|../../models/shared/shared-types.model|@/lib/models/shared/shared-types.model|g' 
find src/lib/utils/dev -type f -name "mockData.ts" | xargs sed -i '' 's|../../models/shared|@/lib/models/shared|g'
find src/lib/utils/dev -type f -name "mockData.ts" | xargs sed -i '' 's|../../../scripts/seed/mockRubrics|@/scripts/seed/mockRubrics|g'

echo "Mock data models created and imports updated" 