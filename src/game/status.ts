import { Status } from "./definitions/status";
import { CacheValues } from "../app/main";


export function statusSprite(
  status: Status,
): CacheValues {
  switch (status.tag) {
    case "Armor": {
      return "status";
    }
  }
}