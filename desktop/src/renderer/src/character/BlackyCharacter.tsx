import { BlackyRig } from "./BlackyRig";
import { CHARACTER_GLB } from "./assets/model";

export function BlackyCharacter({
  state,
  reduceMotion,
  compact,
}: {
  state: import("@shared/types").CharacterState;
  reduceMotion: boolean;
  compact?: boolean;
}) {
  void CHARACTER_GLB;
  return <BlackyRig state={state} reduceMotion={reduceMotion} compact={compact} />;
}
