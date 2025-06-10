import { BaseReference } from "@core-types/reference";
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";
import { handleClientError } from "@error/handlers/client";
import ipgData from "@/lib/json/ipg.json";
import coachingMovesData from "@/lib/json/coaching-moves.json";

// Types for IPG data structure
export interface IPGCoreAction {
  coreAction: number;
  title: string;
  sections: IPGSection[];
}

export interface IPGSection {
  section: string;
  description: string;
  ratings?: IPGRating[];
  fields?: string[];
  options?: Record<string, string[]>;
  studentBehavior?: string;
}

export interface IPGRating {
  rating: string;
  description: string;
}

// Types for coaching moves data structure
export interface CoachingMove {
  id: string;
  category: string;
  specificMove: string;
  description: string;
  toolsResources?: string;
}

// Reference types for dropdowns
export interface IPGCoreActionReference extends BaseReference {
  coreActionNumber: number;
  title: string;
  sectionsCount: number;
  colorCode: 'primary' | 'secondary' | 'success';
}

export interface IPGSubsectionReference extends BaseReference {
  coreAction: number;
  section: string;
  description: string;
  hasRatings: boolean;
  parentColor: 'primary' | 'secondary' | 'success';
}

export interface CoachingMoveReference extends BaseReference {
  category: string;
  specificMove: string;
  toolsResources?: string;
  description?: string;
}

// Color mapping for core actions
const getColorForCoreAction = (coreActionNumber: number): 'primary' | 'secondary' | 'success' => {
  switch (coreActionNumber) {
    case 1: return 'primary';
    case 2: return 'secondary';
    case 3: return 'success';
    default: return 'primary';
  }
};

// STEP 1: Create factory-based transformers for each type

// IPG Core Action transformer using factory pattern
const ipgCoreActionTransformer = createReferenceTransformer<
  IPGCoreAction & { _id: string }, 
  IPGCoreActionReference
>(
  (coreAction) => `CA${coreAction.coreAction}: ${coreAction.title}`,
  (coreAction) => ({
    coreActionNumber: coreAction.coreAction,
    title: coreAction.title,
    sectionsCount: coreAction.sections.length,
    colorCode: getColorForCoreAction(coreAction.coreAction)
  })
);

// IPG Subsection transformer using factory pattern
const ipgSubsectionTransformer = createReferenceTransformer<
  IPGSection & { coreAction: number; _id: string },
  IPGSubsectionReference
>(
  (subsection) => `${subsection.section}: ${subsection.description}`,
  (subsection) => ({
    coreAction: subsection.coreAction,
    section: subsection.section,
    description: subsection.description,
    hasRatings: !!(subsection.ratings && subsection.ratings.length > 0),
    parentColor: getColorForCoreAction(subsection.coreAction)
  })
);

// Coaching Move transformer using factory pattern
const coachingMoveTransformer = createReferenceTransformer<
  CoachingMove & { _id: string },
  CoachingMoveReference
>(
  (move) => `${move.category}: ${move.specificMove}`,
  (move) => ({
    category: move.category,
    specificMove: move.specificMove,
    toolsResources: move.toolsResources,
    description: move.description
  })
);

// STEP 2: Create wrapper functions that add _id for static data

// Wrapper for IPG Core Action (adds _id for static data)
const transformIPGCoreActionToReference = (coreAction: IPGCoreAction): IPGCoreActionReference => {
  const entityWithId = {
    ...coreAction,
    _id: `ca-${coreAction.coreAction}`
  };
  return ipgCoreActionTransformer(entityWithId);
};

// Wrapper for IPG Subsection (adds _id for static data)
const transformIPGSubsectionToReference = (
  subsection: IPGSection & { coreAction: number }
): IPGSubsectionReference => {
  const entityWithId = {
    ...subsection,
    _id: `ca-${subsection.coreAction}-${subsection.section}`
  };
  return ipgSubsectionTransformer(entityWithId);
};

// Wrapper for Coaching Move (adds _id for static data)
const transformCoachingMoveToReference = (
  move: CoachingMove
): CoachingMoveReference => {
  const entityWithId = {
    ...move,
    _id: move.id
  };
  return coachingMoveTransformer(entityWithId);
};

// STEP 3: Create array transformers using factory pattern
const transformIPGCoreActionsToReferences = createArrayTransformer(transformIPGCoreActionToReference);
const transformIPGSubsectionsToReferences = createArrayTransformer(transformIPGSubsectionToReference);
const transformCoachingMovesToReferences = createArrayTransformer(transformCoachingMoveToReference);

// STEP 4: Public API functions with error handling

export const getIPGCoreActionOptions = (): IPGCoreActionReference[] => {
  try {
    const coreActions = ipgData as IPGCoreAction[];
    if (!Array.isArray(coreActions) || coreActions.length === 0) {
      return [];
    }
    return transformIPGCoreActionsToReferences(coreActions);
  } catch (error) {
    handleClientError(error, 'getIPGCoreActionOptions');
    return [];
  }
};

export const getIPGSubsectionOptions = (coreActionNumber?: number): IPGSubsectionReference[] => {
  try {
    const coreActions = ipgData as IPGCoreAction[];
    
    if (coreActionNumber) {
      const coreAction = coreActions.find(ca => ca.coreAction === coreActionNumber);
      if (coreAction) {
        const sectionsWithCoreAction = coreAction.sections.map(section => ({
          ...section,
          coreAction: coreAction.coreAction
        }));
        return transformIPGSubsectionsToReferences(sectionsWithCoreAction);
      }
      return [];
    }
    
    // Return all subsections if no core action specified
    const allSubsections = coreActions.flatMap(coreAction =>
      coreAction.sections.map(section => ({
        ...section,
        coreAction: coreAction.coreAction
      }))
    );
    
    return transformIPGSubsectionsToReferences(allSubsections);
  } catch (error) {
    handleClientError(error, 'getIPGSubsectionOptions');
    return [];
  }
};

export const getCoachingMoveOptions = (category?: string): CoachingMoveReference[] => {
  try {
    const moves = coachingMovesData as CoachingMove[];
    let filteredMoves = moves;
    
    if (category) {
      filteredMoves = moves.filter(move => move.category === category);
    }
    
    if (!Array.isArray(filteredMoves) || filteredMoves.length === 0) {
      return [];
    }
    
    return transformCoachingMovesToReferences(filteredMoves);
  } catch (error) {
    handleClientError(error, 'getCoachingMoveOptions');
    return [];
  }
};

export const getCoachingMoveCategories = (): { value: string; label: string }[] => {
  try {
    const moves = coachingMovesData as CoachingMove[];
    const categories = [...new Set(moves.map(move => move.category))];
    return categories.map(category => ({
      value: category,
      label: category
    }));
  } catch (error) {
    handleClientError(error, 'getCoachingMoveCategories');
    return [];
  }
};

// Search and filtering utilities with error handling
export const searchIPGOptions = (query: string): {
  coreActions: IPGCoreActionReference[];
  subsections: IPGSubsectionReference[];
} => {
  try {
    const lowerQuery = query.toLowerCase();
    
    const coreActions = getIPGCoreActionOptions().filter(ca =>
      ca.label.toLowerCase().includes(lowerQuery) ||
      ca.title.toLowerCase().includes(lowerQuery)
    );
    
    const subsections = getIPGSubsectionOptions().filter(sub =>
      sub.label.toLowerCase().includes(lowerQuery) ||
      sub.description.toLowerCase().includes(lowerQuery)
    );
    
    return { coreActions, subsections };
  } catch (error) {
    handleClientError(error, 'searchIPGOptions');
    return { coreActions: [], subsections: [] };
  }
};

export const searchCoachingMoves = (query: string): CoachingMoveReference[] => {
  try {
    const lowerQuery = query.toLowerCase();
    
    return getCoachingMoveOptions().filter(move =>
      move.label.toLowerCase().includes(lowerQuery) ||
      move.category.toLowerCase().includes(lowerQuery) ||
      move.specificMove.toLowerCase().includes(lowerQuery) ||
      (move.description && move.description.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    handleClientError(error, 'searchCoachingMoves');
    return [];
  }
};