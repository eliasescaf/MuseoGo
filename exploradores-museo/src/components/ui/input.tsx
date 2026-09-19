import { TextInput, TextInputProps } from "react-native";
import { cn } from "../../libs/utils";

export function Input({ className, ...props }: TextInputProps) {
  return (
    <TextInput
      className={cn(
        "flex h-12 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900",
        "focus:border-zinc-900",
        className
      )}
      placeholderTextColor="#a1a1aa"
      {...props}
    />
  );
}