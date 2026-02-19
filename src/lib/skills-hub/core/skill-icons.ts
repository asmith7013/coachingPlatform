import type { ComponentType } from "react";
import {
  IconBook,
  IconBulb,
  IconCalendarCheck,
  IconChalkboard,
  IconCheckbox,
  IconChecklist,
  IconClipboardCheck,
  IconClipboardText,
  IconClock,
  IconDeviceDesktop,
  IconEar,
  IconEye,
  IconFlag,
  IconFlame,
  IconHandClick,
  IconHandStop,
  IconHeart,
  IconLighter,
  IconMathSymbols,
  IconMessage,
  IconMessageCircle,
  IconMicroscope,
  IconMoodSmile,
  IconNote,
  IconNotebook,
  IconPencil,
  IconPresentation,
  IconPuzzle,
  IconRocket,
  IconSchool,
  IconSearch,
  IconSpeakerphone,
  IconStar,
  IconStretching,
  IconTarget,
  IconThumbUp,
  IconTrophy,
  IconUser,
  IconUserHeart,
  IconUsers,
  IconVolume,
  IconWand,
  IconWriting,
} from "@tabler/icons-react";

export type IconComponent = ComponentType<{
  size?: number;
  stroke?: number;
  color?: string;
}>;

/**
 * Maps skill UUIDs from the taxonomy to Tabler icon components.
 * Falls back to DEFAULT_SKILL_ICON for unmapped skills.
 */
export const SKILL_ICON_MAP: Record<string, IconComponent> = {
  // Intellectual Preparation
  "6f4a401c-c938-4a06-959c-10e3a23188fe": IconCheckbox, // complete-mastery-checks
  "a1a1af28-83ef-4587-a087-29b404bde3f2": IconClipboardCheck, // complete-assessments
  "bc6e44d9-1be2-42a0-bad4-2173058c9670": IconNotebook, // complete-unit-unpack-protocol
  "084a38bd-91e9-46c9-ae11-54fc964f06c4": IconMathSymbols, // prepare-fluency-materials
  "77ad2290-dc85-4dd3-8d11-4c2c28d50291": IconPencil, // complete-number-strings-internalization
  "b49adf32-35b8-418b-8bcc-59c2a8eae46e": IconClipboardText, // prepare-sgi-materials
  "ef9592dc-dbc5-4732-9a31-cb65e62cf9aa": IconUsers, // select-students-for-small-group
  "bcffc566-98a7-414f-95ae-34ea4acad69a": IconChecklist, // complete-worked-example-and-practice-problems
  "891107ab-1b07-4312-ac9e-f8b6735a2de0": IconSearch, // prepare-for-cfu
  "80f89f4b-ea9e-4100-ba15-bd07ec8c0626": IconWand, // prepare-to-respond-to-student-errors
  "6e2466db-ae7c-4147-a9fc-4fe5f8c39772": IconMicroscope, // prepare-inquiry-materials
  "e13d49c7-3ec9-4d0a-9319-25d5989e7095": IconUsers, // select-students-for-inquiry-groups
  "9f4c9a6d-8e18-49ba-80dc-158513934713": IconPuzzle, // complete-inquiry-tasks
  "364c6082-9b14-478e-a5ba-ba1b45eb3c72": IconEye, // review-answer-key-for-misconceptions
  "f06e9737-297b-4a31-b32d-2c4a3c052717": IconDeviceDesktop, // review-student-work-on-podsie

  // Lesson Launch
  "6b9868f4-ff27-4674-ad64-c2b157d76f2e": IconMoodSmile, // greeting-every-student-by-name
  "3a12be8f-d52f-496a-8457-04ad148e7054": IconClock, // minute-drills
  "7564cdd4-a8f3-4879-a9cb-38ea07de3f2b": IconChalkboard, // lead-whole-class-warm-up-nyse
  "b5654862-cac2-429c-82ca-f884e0ab53be": IconPresentation, // attendance-lesson-completion-data-share
  "72a2ef7f-f698-4628-bdad-d13b88278e0b": IconMessage, // one-on-one-data-conversations
  "f8fb04c8-c795-4fb4-b00a-dbd63352f394": IconTrophy, // individual-class-celebrations
  "2def541a-d6b8-4d49-8915-5e4812b25e39": IconTarget, // work-time-goal
  "998bcf75-4cdb-4ca4-ac40-709963ab8c28": IconNote, // gathering-materials-routine

  // Small Group Instruction
  "0b98e582-9fe5-47c5-a5ea-3e09581b1760": IconSchool, // set-up-physical-environment
  "b3af3b22-7856-4163-bde4-8fda13998908": IconEye, // use-visual-anchors
  "0db0b291-8f50-48c8-abc5-fe3d7f356270": IconChecklist, // explain-steps-sequential-order
  "2ceec917-f15c-4cf0-95fa-258a0a3b27cf": IconBulb, // articulate-stamp-big-idea
  "bebb23be-859f-434f-ad5c-ee7d9645a39a": IconMathSymbols, // use-precise-math-vocabulary
  "46bd46a0-8275-490d-bb1d-1891274e5ea2": IconMessageCircle, // use-concise-language
  "9e7415da-1c5f-4cde-984d-968df607a832": IconBook, // accurately-explain-math-concepts
  "9f6a187b-9856-4314-a80a-ea88e676b84a": IconSearch, // ask-cfu-questions-worked-example
  "0127ffc3-9482-4e81-8372-b164b8e191da": IconClock, // use-teacher-wait-time
  "73f2a400-7bc9-4c7d-a5eb-d7dc68e6ee58": IconUsers, // facilitate-student-to-student-relationships
  "6b2df8f9-5566-43c3-b103-eee726fff768": IconHeart, // normalize-mistakes-as-learning-sgi
  "4eceaa9c-e1a5-45ee-a495-447a569fcea3": IconRocket, // promote-growth-mindset-sgi
  "1358ca7c-7e8b-452c-8a52-5f3041f65533": IconMessage, // lead-turn-and-talk
  "cd2379da-ae43-4a34-adfe-54def0987046": IconWriting, // facilitate-student-independent-practice
  "c1b6e0c1-65a6-406d-bacd-1ceefc99ac98": IconEye, // notice-error-prompt-worked-example
  "c4b7660b-dcf7-4ae4-a2ac-f64a79539223": IconUserHeart, // respond-one-on-one-to-student-error

  // Inquiry Groups
  "822717cc-743b-4ee1-be8a-7f3e9583de65": IconSpeakerphone, // state-inquiry-norms-explicitly
  "4ce0dc0e-aca3-4f44-a1b9-f903bbbfa439": IconCalendarCheck, // inquiry-only-during-double-blocks
  "32be6fb6-ed31-4f06-b7d6-fd81c2c3580e": IconCalendarCheck, // inquiry-during-all-periods
  "a50c7050-10bb-4d0c-bcfd-194e9db70e6b": IconClock, // check-in-after-five-minutes
  "cbe9dd8e-82b4-4083-81c2-ad93706afc8d": IconEye, // monitor-for-visible-collaboration
  "c1028753-8449-460d-8f0b-7eb9715767b5": IconEar, // facilitate-understanding-the-question-protocol
  "79c38af4-cf02-4be0-a781-595550965645": IconMessageCircle, // use-facilitative-questioning
  "0a5a8b40-f824-4da6-a3b3-da107e0fe856": IconPencil, // push-thinking-with-teacher-marker
  "d01ae4ab-9110-4f40-81d1-ca35805ed652": IconVolume, // elevate-student-language-math-terminology
  "bffca010-4633-419e-a2be-5b22fe730b4f": IconHandClick, // cold-call-group-members-to-explain
  "5c7d2e54-7e18-4251-b7f4-6e86dd720237": IconUsers, // mobilize-knowledge-across-groups

  // Lesson Closing
  "9e8a3e63-676e-4b27-884e-a1f83e6254df": IconFlame, // close-lesson-with-urgency
  "84f1acd1-08f2-47e0-bf79-293a99d5decc": IconHandStop, // lead-efficient-safe-cleanup
  "04b90ce3-0db4-4f49-a2a0-548fafe7b754": IconTrophy, // close-lesson-with-celebrations
  "04a33c2a-f27b-40f3-ba4a-8845de7a1c2a": IconStretching, // student-self-evaluation

  // Culture
  "59d53eee-90e4-4031-9763-99129e34b678": IconUser, // address-students-by-name
  "0eb74b47-131e-4ff6-9cd2-72b973eb72e3": IconStar, // celebrate-using-specific-praise
  "9cf123a9-896f-46d4-ab36-473305d911ee": IconTrophy, // celebrate-whole-class
  "15c96fa7-532f-4f4d-a718-537a3709c3c3": IconThumbUp, // assure-and-affirm
  "cdb2e644-243f-4e10-882d-018f140bfcfd": IconUserHeart, // build-personal-rapport
  "d384fc09-cb21-41c9-a23e-630fadfd9e3e": IconHeart, // emotional-regulation
  "c9019764-77e3-494b-8c94-aadc07550eda": IconUsers, // learn-about-value-student-identities
  "f50ac982-9132-45e0-9565-cfbc0b9e2c77": IconMicroscope, // identity-awareness-self-reflection
  "f458fcbd-7736-4030-803c-e1426430c33f": IconSpeakerphone, // attention-grabber
  "fdcfce09-d3f6-4d0b-ad17-540e5aeaa07c": IconTarget, // specific-observable-directions
  "d170f476-e469-4043-9437-52eb8926cce4": IconChecklist, // concise-sequential-directions
  "6814e051-70da-49bf-950d-10fe513a8fac": IconBulb, // rationale
  "8ec6b1ff-83cc-48ba-9ec6-baacd16f3a58": IconEye, // scan-positive-narration
  "5139604e-538f-4f01-a147-d8c53d3f38ae": IconTarget, // observable-directions-l2
  "e5144f47-a7e1-4746-be77-9931cc12ce43": IconPresentation, // multi-modal-directions
  "e501c3d5-3919-4d2e-83db-f4a1ea7f23fb": IconUsers, // student-led-directions
  "074fe6e4-139c-42a4-a29f-726a3ee51311": IconClipboardText, // introduce-step-by-step-routines
  "9b3ab6f8-b437-449c-8594-84f66faabcfe": IconStretching, // routine-procedure-practice
  "6a7371c6-c271-4119-ab04-4ee322287cdb": IconFlame, // build-urgency
  "7b861332-8b2d-45bb-8e65-54fb108c9471": IconFlag, // foster-student-ownership-of-culture
  "209ee2c1-2395-46e4-92c8-333e4356677a": IconLighter, // keep-corrections-off-stage
  "84381975-e021-43ed-9a3e-3173350d9598": IconHandStop, // use-proximity
  "8e5d776b-eff7-4837-adef-11334bd32b1e": IconVolume, // calm-voice-neutral-language
  "4fb175ad-c2c0-4885-abc9-15ebebc39551": IconThumbUp, // positive-redirection
  "8f40ec05-2459-4cdc-957d-626d1ed170c1": IconHandClick, // support-reminder-non-verbal-cues
  "80ac71e2-b91a-4f9c-9530-a171e7b63d17": IconMessage, // anonymous-group-reminders
  "e4a85935-7716-433e-9375-a0b9e26ad2d4": IconMessageCircle, // curious-one-on-one-interaction
  "89332ce9-ff4b-4f73-a1e4-5ae92dffd38e": IconRocket, // communicate-high-expectations
  "db357163-9018-462d-b894-99d5b8a6b92c": IconUsers, // emphasize-collective-success
  "fb520fe9-4c17-4eee-a7b6-beffba36ade5": IconFlame, // encourage-academic-risk-taking
  "ef718608-f778-44d6-afd5-1e356ec4e6b0": IconStar, // model-enthusiasm-curiosity
  "3d395d7f-56dc-4f16-8088-5fbf1fb2ccaf": IconTarget, // student-goal-setting
  "0301a93e-686f-486c-a63f-1b1b38ac1c9b": IconHeart, // normalize-mistakes-as-learning
  "85871311-b8ef-4c96-ac46-6a6c7cbc00f6": IconRocket, // promote-growth-mindset
  "a99c4b0c-4a21-46da-8789-798cd735c3a4": IconWriting, // specific-actionable-feedback
};

export const DEFAULT_SKILL_ICON: IconComponent = IconBulb;

export function getSkillIcon(skillUuid: string): IconComponent {
  return SKILL_ICON_MAP[skillUuid] ?? DEFAULT_SKILL_ICON;
}
