import { cn } from "@ui/utils/formatters";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";

// Token Groups
const colorTokens = {
  primary: ["primary", "primary-hover", "primary-active"],
  secondary: ["secondary", "secondary-hover", "secondary-active"],
  success: ["success", "success-hover", "success-active"],
  warning: ["warning", "warning-hover", "warning-active"],
  danger: ["danger", "danger-hover", "danger-active"],
  text: ["text", "text-muted", "text-disabled"],
  surface: ["surface", "surface-hover", "surface-active"],
  border: ["border", "border-hover", "border-active"],
};

const radiusTokens = ["none", "sm", "md", "lg", "xl", "full"];
const shadowTokens = ["none", "sm", "md", "lg", "xl"];

function ColorSwatch({ name, group }: { name: string; group: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-16 w-16 rounded-md", `bg-${group}-${name}`)} />
      <Text textSize="sm">
        {group}-{name}
      </Text>
    </div>
  );
}

function RadiusSwatch({ value }: { value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "h-16 w-16 border-2 border-primary bg-surface",
          `rounded-${value}`,
        )}
      />
      <Text textSize="sm">radius-{value}</Text>
    </div>
  );
}

function ShadowSwatch({ value }: { value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-16 w-16 rounded-md bg-white", `shadow-${value}`)} />
      <Text textSize="sm">shadow-{value}</Text>
    </div>
  );
}

export default function TokensPreview() {
  return (
    <div className="space-y-12 p-8">
      {/* Colors */}
      <section>
        <Heading level="h2">Colors</Heading>
        <div className="mt-8 space-y-8">
          {Object.entries(colorTokens).map(([group, values]) => (
            <div key={group}>
              <Heading level="h3">{group}</Heading>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {values.map((name) => (
                  <ColorSwatch key={name} name={name} group={group} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section>
        <Heading level="h2">Border Radius</Heading>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {radiusTokens.map((value) => (
            <RadiusSwatch key={value} value={value} />
          ))}
        </div>
      </section>

      {/* Shadows */}
      <section>
        <Heading level="h2">Shadows</Heading>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {shadowTokens.map((value) => (
            <ShadowSwatch key={value} value={value} />
          ))}
        </div>
      </section>
    </div>
  );
}
