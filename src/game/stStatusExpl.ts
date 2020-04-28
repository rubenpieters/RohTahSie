import { Display } from "./display";
import { Cache } from "../app/main";
import { StateStatus, StateTrigger } from "./entity";
import { embedEff, Seq, Anim, Noop, TweenTo, mkAccessTarget } from "../app/animation";
import { GameState } from "./state";


export type StStatusExplDisplay = {
  container: PIXI.Container,
  bg: PIXI.Sprite,
  title: PIXI.BitmapText,
  hpText: PIXI.BitmapText,
  effects: PIXI.BitmapText,
  statusId: number | undefined,
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

  // intialize hp text
  const hpText = new PIXI.BitmapText("", {
    font: {
      name: "Bahnschrift",
      size: 32,
    },
    tint: 0xFF0000,
  });
  Object.assign(hpText, { x: 400, y: 5 });
  container.addChild(hpText);

  container.visible = false;

  container.interactive = true;
  container.on("pointerdown", () => {
    display.player.stStatusExpl.container.visible = false;
    display.player.stStatusExpl.statusId = undefined;
  });

  parentContainer.addChild(container);

  return { container, bg, title, effects, statusId: undefined, hpText };
}

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
          display.statusId = status.id;
          display.container.visible = true;
          updateStStatusExpl(status, display);
        }),
      ]);
    }
  }
  return new Noop();
}

export function fadeStStatusExpl(
  statusId: number,
  display: StStatusExplDisplay,
): Anim {
  if (statusId === display.statusId) {
    return new TweenTo(0.2, 0, "absolute", mkAccessTarget(display.container, "alpha"));
  } else {
    return new Noop();
  }
}

export function updateStStatusExpl(
  status: StateStatus | StateTrigger,
  display: StStatusExplDisplay,
) {
  display.title.text = status.name;
  display.hpText.text = `${status.hp} / ${status.maxHp}`;
}

export function checkAndUpdateStStatusExpl(
  statusIndex: number,
  owner: "player" | "enemy",
  state: GameState,
  display: StStatusExplDisplay,
) {
  const targetEntity = state[owner]?.entity;
  if (targetEntity !== undefined) {
    const status = targetEntity.statuses[statusIndex];
    if (status.id === display.statusId) {
      updateStStatusExpl(status, display);
    }
  }
}