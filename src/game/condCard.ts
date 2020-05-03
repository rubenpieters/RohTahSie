import { CondCard } from "./definitions/condCard";
import { CacheValues } from "../app/main";

export function condCardSprite(
  card: CondCard,
): CacheValues {
  switch (card.name) {
    case "TrueCond": return "sword";
    case "FalseCond": return "sword";
  }
}