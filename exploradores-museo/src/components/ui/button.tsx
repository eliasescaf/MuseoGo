import { Pressable, PressableProps, Text } from "react-native";
import { cn } from "../../libs/utils";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: "default" | "ghost";
}

export function Button({ label, variant = "default", className, ...props }: ButtonProps) {
  const isGhost = variant === "ghost";
  
  return (
    <Pressable
      className={cn(
        "h-12 items-center justify-center rounded-md px-6 active:opacity-70",
        isGhost ? "bg-transparent" : "bg-zinc-900",
        props.disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <Text 
        className={cn(
          "text-base font-medium",
          isGhost ? "text-zinc-500" : "text-white"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}