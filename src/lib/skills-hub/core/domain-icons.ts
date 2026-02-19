import {
  IconBook,
  IconBulb,
  IconFlag,
  IconHeart,
  IconRocket,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import type { IconComponent } from "./skill-icons";

const DOMAIN_ICON_MAP: Record<string, IconComponent> = {
  "Intellectual Preparation": IconBook,
  "Lesson Launch": IconRocket,
  "1:1 Coaching": IconUsers,
  "Small Group Instruction": IconUsersGroup,
  "Inquiry Groups": IconBulb,
  "Lesson Closing": IconFlag,
  Culture: IconHeart,
};

export function getDomainIcon(domainName: string): IconComponent {
  return DOMAIN_ICON_MAP[domainName] ?? IconBulb;
}
