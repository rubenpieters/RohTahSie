import { Display } from "./display";
import { Cache } from "../app/main";
import { StateStatus } from "./entity";
import { embedEff, Seq, Anim, Noop } from "../app/animation";
import { GameState } from "./state";


export type StStatusExplDisplay = {
  container: PIXI.Container,
  bg: PIXI.Sprite,
  title: PIXI.BitmapText,
  effects: PIXI.BitmapText,
}


export function initializeStStatusExpl(
  parentContainer: PIXI.Container,
  display: Display,
  cache: Cache,
): StStatusExplDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 30, y: 115, width: 480, height: 100 });

  // initialize bgs
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.tint = 0xFFAE42;
  bg.width = 480;
  bg.height = 100;
  container.addChild(bg);

  // initialize title text
  const title = new PIXI.BitmapText("", {
    font: {
      name: "Bahnschrift",
      size: 32,
    },
    tint: 0xFF0000,
  });
  Object.assign(title, { x: 5, y: 5 });
  container.addChild(title);

  // intialize effect text
  const effects = new PIXI.BitmapText("", {
    font: {
      name: "Bahnschrift",
      size: 32,
    },
    tint: 0xFF0000,
  });
  Object.assign(effects, { x: 15, y: 60 });
  container.addChild(effects);

  container.visible = false;

  container.interactive = true;
  container.on("pointerdown", () => {
    container.visible = false;
  });

  parentContainer.addChild(container);

  return { container, bg, title, effects };
}

// TODO: base ststatusdisplay on status id? the display can then update when the status changes
export function loadStStatusExpl(
  i: number,
  target: "player" | "enemy",
  state: GameState,
  display: StStatusExplDisplay,
): Anim {
  const targetEntity = state[target]?.entity;
  if (targetEntity !== undefined) {
    const status = targetEntity.statuses[i];
    if (status !== undefined) {
      return new Seq([
        embedEff(() => {
          display.container.visible = true;
          display.title.text = status.name;
        }),
      ]);
    }
  }
  return new Noop();
}